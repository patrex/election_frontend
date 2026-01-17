import { useState, useCallback, useContext, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useLoaderData } from 'react-router-dom';
import { AppContext } from '@/App';

import { genUUID } from '@/utils/getUUID';
import { fireman } from '../utils/fireloader';
import Toast from '@/utils/ToastMsg';
import { fetcher } from '@/utils/fetcher';
import { PulseLoader } from 'react-spinners';
import NoData from '@/components/NoData';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg'

export async function addCandidateLoader({ params }) {
	try {
		const [positions, election] = await Promise.all([
			fetcher.get(`election/${params.id}/positions`),
			fetcher.get(`election/${params.id}`)
		])

		return [positions, election];
	} catch (error) {
		console.error("There was a problem fetching positions");
		return null;
	}
}

function AddCandidate() {
	const [listOfPositions, election] = useLoaderData()
	const [positions, setPositions] = useState(listOfPositions || []);
	const [selectedPosition, setSelectedPosition] = useState("");
	
	const [image, setImage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preview, setPreview] = useState(null);

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
			let imgRef;
			let photoUrl = '';
			
			if (image) {
				const fileExt = image.name.split('.').pop();

				imgRef = ref(
					fireman,
					`${user ? 'votify' : 'staging'}/${election.title}/${selectedPosition}/${genUUID()}.${fileExt}`
				);
				const snapshot = await uploadBytes(imgRef, image);
				
				// only fetch download url for when admin is adding candidates himself
				if (user) {
					photoUrl = await getDownloadURL(snapshot.ref);
				}
			}

			const payload = {
				...formData,
				photoUrl: ((user) ? photoUrl: image ? imgRef.fullPath : ""),
				selectedPosition,
				isApproved: user ? true : false
			}

			await fetcher.post(
				`election/${election._id}/add-candidate`,
				payload
			);

			if (user) {
				navigate(`/user/${user.uid}/election/${election._id}`)
			} else {
				Toast.success("You've been registered")
				navigate('/');
			}
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
		<>
			{positions.length > 0 ? (
				<div className='flex items-center justify-center min-h-screen bg-gray-50 p-4'> {/* Centering and background */}
					<div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100"> {/* Form Container Card */}
						<h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center border-b pb-4">
							{election.addCandidatesBy === "I will Add Candidates Myself" ? 'Add a Candidate' : `Register for ${election.title}`}
						</h2>
		
						<form onSubmit={handleSubmit} className='space-y-6'> {/* Spacing between form groups */}
							{/* First Name Input Group */}
							<div className="mb-4">
								<label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">Firstname</label>
								<input
									type="text"
									id="fname"
									name='firstname'
									value={formData.firstname}
									onChange={handleChange}
									autoFocus
									className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter first name"
								/>
							</div>
		
							{/* Last Name Input Group */}
							<div className="mb-4">
								<label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">Lastname</label>
								<input
									type="text"
									id="lname"
									name='lastname'
									value={formData.lastname}
									onChange={handleChange}
									className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter last name"
								/>
							</div>
		
							{/* Position Select Group */}
							<div className='mb-4'>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Select position
									<select
										name="position"
										value={selectedPosition}
										onChange={handleSelect}
										className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm border transition'
									>
										<option value="" disabled>Select a position</option>
										{positions.map((position) => (
											<option
												key={position._id}
												value={position.position}
											>
												{position.position}
											</option>
											))
										}
									</select>
								</label>
							</div>
		
							{/* Manifesto Textarea Group */}
							<div className="mb-4">
								<label htmlFor="manifesto" className="block text-sm font-medium text-gray-700 mb-1">Manifesto</label>
								<textarea
									name="manifesto"
									id="manifesto"
									rows="4"
									value={formData.manifesto}
									onChange={handleChange}
									placeholder="Write your manifesto here..."
									className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition'
								/>
							</div>
		
							{/* File Upload and Preview Group */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 pt-2">
		
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
									{/* Hidden File Input */}
									<input
										type="file"
										id="uploadpic"
										accept="image/*"
										onChange={handleFileChange}
										className="hidden"
									/>
		
									{/* Styled Label/Button */}
									<label
										htmlFor="uploadpic"
										className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg cursor-pointer hover:bg-indigo-700 transition duration-150 shadow-md"
									> Choose a picture
									</label>
		
									{/* Remove Image Button */}
									{preview && (
										<button
											type="button" // Important for buttons inside a form not to submit it
											onClick={handleRemoveImage}
											className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition duration-150 shadow-md"
										> Remove Image
										</button>
									)}
								</div>
		
								{/* Image Preview */}
								{preview && (
									<div className="sm:ml-auto">
										<img
											src={preview}
											alt="Preview"
											className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow-lg"
										/>
									</div>
								)}
							</div>
		
							{/* Submit Button */}
							<button
								type='submit'
								disabled={isSubmitting}
								className={`
										w-full py-3 mt-6 text-lg font-semibold rounded-lg shadow-md transition duration-150 text-center
										${isSubmitting
											? 'bg-indigo-400 cursor-not-allowed'
											: 'bg-indigo-600 hover:bg-indigo-700 text-white'
										}
									`}
							>
								{isSubmitting ? <PulseLoader color="#fff" size={5} loading={isSubmitting} /> : 
								election.addCandidatesBy === "I will Add Candidates Myself" ? 'Add Candidate' : `Register`}
							</button>
						</form>
					</div>
				</div> ) 
				: 
				<NoData message={election.addCandidatesBy == "I Will Add Candidates Myself" ? "You have not added any positions" :'No positions have been added. Please contact your election administrator'} image={noDataGraphic}/> 
			}
		</>
	);
}
 
export default AddCandidate;
