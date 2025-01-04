import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { toast } from 'sonner';
import backendUrl from '../utils/backendurl'

import { fireman } from '../utils/fireloader';

function AddCandidate() {
	const params = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		manifesto: ''
	});
	
	const [positions, setPositions] = useState([]);
	const [selectedPosition, setSelectedPosition] = useState("");

	const [image, setImage] = useState('');
	const [filename, setFilename] = useState("");

	const fetchPositions = () => {
		fetch(`${backendUrl}/election/${params.id}/positions`)
			.then(data => data.json())
			.then(positions => setPositions(positions))
			.catch(err => console.log(err))
	}

	const handleFileNameChange = (e) => {
		const file = e.target.files[0];
		if (file) setFilename(file.name)
	}

	const uploadImage = () => {
		let photoUrl = ''
		const imgRef =
		 ref(fireman, `votersystem/${params.id}/${selectedPosition}/${formData.firstname.concat(formData.lastname) }`);

		uploadBytes(imgRef, image)
			.then(snapshot => getDownloadURL(snapshot.ref))
			.then(imgUrl => {
				photoUrl = imgUrl;
			})
			.then( async (data) => {
				const res = await fetch(`${backendUrl}/election/${params.id}/add-candidate`, {
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						...formData,
						photoUrl,
						selectedPosition
					}),
				})

				if(res.ok) {
					navigate(`/user/${params.userId}/election/${params.id}`)
				}
			})
			.catch(err => toast(err))
	}

	let handleSubmit = function (e) {
		e.preventDefault();

		uploadImage();
	}

	let handleSelect = function(e) {
		const selected = e.target.value;
		setSelectedPosition(selected);
	}

	let handleChange = function(e) {
		const { name, value } = e.target;
		setFormData(prev => ({...prev, [name]: value}))
	}

	useEffect(() => {
		fetchPositions();
	}, []);

	return (
		<div className='container'>
			<div className="form-container">
				<form className='form' onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="fname" className="form-label">Firstname: </label>
						<input 
							type="text" 
							id="fname" 
							name='firstname'
							value={formData.firstname}
							onChange={handleChange}
							autoFocus
						/>
					</div>
					<div className="mb-3">
						<label htmlFor="lname" className="form-label">Lastname: </label>
						<input 
							type="text" 
							id="lname" 
							name='lastname'
							value={formData.lastname}
							onChange={handleChange}
						/>
					</div>
					
					<div className='mb-3'>
						<label>
							Select position:
							<select name="position" 
								className='form-select form-select-lg mb-3'
								value={selectedPosition} 
								onChange={handleSelect}
							>
								<option value="" disabled>Select a position</option>
								{positions.length > 0 ? 
									positions.map((position) => (
										<option key={position.position} value={position.position}>
											{position.position}
										</option>
									))
								: "no positions.."}
							</select>
						</label>
					</div>

					<div className="mb-3">
						<textarea name="manifesto"
							id="" rows="3" cols="55"
							value={formData.manifesto}
							onChange={handleChange} 
							placeholder="manifesto"
							className='p-2.5 my-2.5'
						/>
					</div>
					
					<div>
						<div className="mb-3">
							<input className='fileupload form-control-file' 
								type="file"
								id="uploadpic" 
								onChange={ handleFileNameChange }
								style={ {display: 'none'} }
							/>
							<label htmlFor="uploadpic" className='Button violet'>Choose a picture</label>
						</div>
						<p>&gt; {filename}</p>
					</div>
					
					<button type = 'submit' className="Button violet" onSubmit={handleSubmit}>Add Candidate</button>
				</form>
			</div>
		</div>
	);
}
 
export default AddCandidate;
