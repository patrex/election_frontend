import { useState, useCallback, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useLoaderData } from 'react-router-dom';
import { AppContext } from '@/App';

import { fireman } from '../utils/fireloader';
import Toast from '@/utils/ToastMsg';
import { fetcher } from '@/utils/fetcher';

import { PulseLoader } from 'react-spinners';

export async function addCandidateLoader({ params }) {
	try {
		return await fetcher.get(`election/${params.id}/positions`)
	} catch (error) {
		console.error("There was a problem fetching positions");
	}
}

function AddCandidate() {
	const listOfPositions = useLoaderData()
	const [positions, setPositions] = useState(listOfPositions || []);
	const [selectedPosition, setSelectedPosition] = useState("");
	
	const [image, setImage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preview, setPreview] = useState(null);

	const params = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AppContext);

	const [formData, setFormData] = useState({
		firstname: '',
		lastname: '',
		manifesto: ''
	});

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

	const handleRemoveImage = () => {
		setPreview(null);
		document.getElementById('uploadpic').value = '';
	};

	async function uploadImage() {
		try {
			const imgRef = ref(
			    fireman, 
			    `votify/${params.id}/${selectedPosition}/${formData.firstname.concat(formData.lastname)}`
			);
		
			const snapshot = await uploadBytes(imgRef, image);
			const photoUrl = await getDownloadURL(snapshot.ref);
		
			await fetcher.auth.post(
				`election/${params.id}/add-candidate`, 	
			    	{ ...formData, photoUrl, selectedPosition },
				user
			);
			navigate(`/user/${params.userId}/election/${params.id}`);
		    } catch (err) {
			Toast.error(err.message || "An error occurred");
		}
	}

	async function handleSubmit (e) {
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
							<select 
								name="position" 
								className='form-select form-select-lg mb-3'
								value={selectedPosition} 
								onChange={handleSelect}
							>
								<option value="" disabled>Select a position</option>
								{positions.length > 0 ? (
								positions.map((position) => (
									<option 
										key={position._id || position.position} 
										value={position.position}
										>
										{position.position}
									</option>
								))
								) : (
									<option value="" disabled>No positions available</option>
								)}
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
						className="submit-btn">
							{ isSubmitting ? <PulseLoader  color="#fff" size={5} loading={isSubmitting}/> : "Add Candidate" }
					</button>
				</form>
			</div>
		</div>
	);
}
 
export default AddCandidate;
