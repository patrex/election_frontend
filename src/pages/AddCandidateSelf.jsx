import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';

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

	const fetchPositions = () => {
		fetch(`/election/${params.id}/positions`)
			.then(data => data.json())
			.then(positions => setPositions(positions))
			.catch(err => console.log(err))
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
				const res = await fetch(`/election/${params.id}/add-candidate`, {
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
					navigate('/')
				}
			})
			.catch(err => console.log(err))
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
							className='block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-transparent focus:outline-none'
						/>
					</div>
					
					<div className="mb-3">
						<input className='fileupload form-control-file' 
							type="file"
							id="" 
							onChange={
								e => setImage(e.target.files[0])
							}
						/>
					</div>
					
					<button type = 'submit' className="Button violet" onSubmit={handleSubmit}>Add Candidate</button>
				</form>
			</div>
		</div>
	);
}
 
export default AddCandidate;