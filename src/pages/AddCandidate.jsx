import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import backendUrl from '../utils/backendurl'
import { AppContext } from '@/App';

import { fireman } from '../utils/fireloader';
import Toast from '@/utils/ToastMsg';

import { PulseLoader } from 'react-spinners';

function AddCandidate() {
	const params = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		manifesto: ''
	});

	const { user } = useContext(AppContext);
	
	const [positions, setPositions] = useState([]);
	const [selectedPosition, setSelectedPosition] = useState("");

	const [image, setImage] = useState('');
	const [filename, setFilename] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preview, setPreview] = useState(null);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setImage(file)
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const fetchPositions = () => {
		fetch(`${backendUrl}/election/${params.id}/positions`)
			.then(data => data.json())
			.then(positions => setPositions(positions))
			.catch(err => console.log(err))
	}

	const handleRemoveImage = () => {
		setPreview(null);
		document.getElementById('uploadpic').value = '';
	};

	// const handleFileNameChange = (e) => {
	// 	const file = e.target.files[0];
	// 	if (file) {
	// 		setImage(file)
	// 		setFilename(file.name)
	// 	}
	// }

	const uploadImage = async () => {
		try {
			const imgRef = ref(
			    fireman, 
			    `votersystem/${params.id}/${selectedPosition}/${formData.firstname.concat(formData.lastname)}`
			);
		
			const snapshot = await uploadBytes(imgRef, image);
			const photoUrl = await getDownloadURL(snapshot.ref);
		
			const res = await fetch(`${backendUrl}/election/${params.id}/add-candidate`, {
			    method: 'POST',
			    headers: { 'Content-Type': 'application/json',
				Authorization: `Bearer ${await user?.getIdToken()}`
			    },
			    body: JSON.stringify({ ...formData, photoUrl, selectedPosition }),
			});
		
			if (res.ok) {
			    navigate(`/user/${params.userId}/election/${params.id}`);
			}
		    } catch (err) {
			Toast.error(err.message || "An error occurred");
		}
	}

	const handleSubmit = async function (e) {
		e.preventDefault();

		if (isSubmitting) return; 

		setIsSubmitting(true);
		await uploadImage();
		setIsSubmitting(false);
	}

	const handleSelect = useCallback((e) => {
		const selected = e.target.value;
		setSelectedPosition(selected);

	}, [])

	const handleChange = useCallback(({ target: { name, value}}) => {
		setFormData((prev) => ({...prev, [name]: value}))
	}, [])

	useEffect(() => {
		fetchPositions();
	}, [params.id]);

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
					
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
							<input
								type="file"
								id="uploadpic"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							<label
								htmlFor="uploadpic"
								className="px-4 py-2 bg-violet-600 text-white rounded cursor-pointer hover:bg-violet-700 transition"
							> Choose a picture
							</label>
							{preview && (
								<button
									onClick={handleRemoveImage}
									className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
								> Remove Image
								</button>
							)}
						</div>

						{preview && (
							<div className="sm:ml-auto">
								<img
									src={preview}
									alt="Preview"
									className="w-24 h-24 object-cover rounded border shadow"
								/>
							</div>
						)}
    					</div>
					
					<button type = 'submit' disabled={isSubmitting} 
						className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500 transition duration-200">
							{ isSubmitting ? <PulseLoader  color="#fff" size={5} loading={isSubmitting}/> : "Add Candidate" }
					</button>
				</form>
			</div>
		</div>
	);
}
 
export default AddCandidate;
