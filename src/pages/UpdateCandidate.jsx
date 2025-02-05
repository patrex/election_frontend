import { useLoaderData, Link, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect, useCallback } from "react";
import { fireman } from '../utils/fireloader';
import Toast from "@/utils/ToastMsg";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'


import backendUrl from '../utils/backendurl'

export async function updateloader({ params }) {
	const [candidate, position, positionsList, election] = Promise.all([
		fetch(`${backendUrl}/election/candidate/${params.candidateId}`).then(res => res.json()),
		fetch(`${backendUrl}/election/${candidate.electionId}/positions`).then(res => res.json()),
		fetch(`${backendUrl}/election/${candidate.electionId}`).then(res => res.json()),
		fetch(`${backendUrl}/election/positions/${candidate.position}`).then(res => res.json()),
	])

	return [candidate, position, positionsList, election]
}

function UpdateCandidate() {
	const [candidate, position, positionsList, election] = useLoaderData();
	// const [image, setImage] = useState("");
	// const [newPicture, setNewPicture] = useState("");
	const [positions, setPositions] = useState(positionsList);
	// const [newFile, setNewFile] = useState("");

	const [state, setState] = useState({
		image: candidate.imgUrl || "",
		newPicture: "",
		newFile: "",
	});

	
	const schema = yup.object().shape({
		firstname: yup.string().min(2).required(),
		lastname: yup.string().min(2).required(),
		selectedPosition: yup.string(),
		manifesto: yup.string()
	})

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields, isDirty },
	    } = useForm({
		resolver: yupResolver(schema),
		defaultValues: useMemo(() => ({
		    firstname: candidate.firstname || "",
		    lastname: candidate.lastname || "",
		    manifesto: candidate.manifesto || "",
		    selectedPosition: position.position || "",
		}), [candidate, position]), // Prevent unnecessary re-renders
	    });

	useEffect(() => {
		setImage(candidate.imgUrl);
	}, [candidate])

	const handleFileUpload = useCallback((e) => {
		const file = e.target.files[0];
		if (file) {
			setState((prev) => ({
				...prev,
				newPicture: file,
				newFile: file.name
			}))
		}
	}, [])

	const patchCandidate = async function(formdata, photoUrl) {
		try {
			const response = await fetch(`${backendUrl}/election/updatecandidate`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					electionId: election._id,
					candidate_id: candidate._id,
					...formdata,
					photoUrl
				}),
			})

			if (!response.ok) throw new Error("Failed to update candidate");

        		Toast.success("Candidate updated successfully!");
		} catch (error) {
			Toast.error("Update failed")
		}
	}
	

	// const onSubmit = async (formdata) => {
	// 	if (isDirty || newPicture) {
	// 		let photoUrl = ''
			
	// 		if (newPicture) {
	// 			const imgRef = ref(fireman, `vote4me/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname)}`);
	// 			uploadBytes(imgRef, newPicture)
	// 				.then(snapshot => getDownloadURL(snapshot.ref))
	// 				.then(imgUrl => {
	// 					photoUrl = imgUrl;
	// 				})
	// 				.then( async (data) => {
	// 					patchCandidate(formdata, photoUrl)
	// 				})
	// 				.catch(err => Toast.error(err))
	// 		} else {
	// 			patchCandidate(formdata, image)
	// 		}
	// 	} else {
	// 		Toast.info("You did not make any changes");
	// 		return 
	// 	}
	// }

	const onSubmit = async (formdata) => {
		if (!isDirty && !state.newPicture) {
		    Toast.info("You did not make any changes");
		    return;
		}
	    
		try {
		    let photoUrl = state.image; // Default to existing image
	    
		    if (state.newPicture) {
			const imgRef = ref(fireman, `vote4me/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname)}`);
			const snapshot = await uploadBytes(imgRef, state.newPicture);
			photoUrl = await getDownloadURL(snapshot.ref);
		    }
	    
		    await patchCandidate(formdata, photoUrl);
		} catch (err) {
		    Toast.error("An error occurred while updating candidate.");
		}
	};
	    

	return ( 
		<>
			<div className="container">
				<div className="candidate-update-form-container">
					<div className="update-candidate-top">
						<div className="update-candidate-left">
							<form id="candidate-update-form" onSubmit={handleSubmit(onSubmit)}>
								<div>
									<label htmlFor="firstname" className="form-label">Firstname: </label>
									<input type="text" 
										id="firstname" 
										aria-describedby="firstname"
										name="firstname"
										autoFocus
										{...register('firstname', {required: "First name must be at least two characters"})}
									/>
								</div>
								<div>
									<label htmlFor="lastname" className="form-label">Lastname: </label>
									<input type="text" 
										id="lastname" 
										aria-describedby="lastname"
										name="lastname"
										{...register('lastname', {required: "Lastname must be at least two characters"})}
									/>
								</div>
								
								<div>
									<label>
										Select position:
										<select {...register('selectedPosition', {required: "Select a position"})}
											className='form-select form-select-lg mb-3'
										> 
											{/* <option value={position.position} selected>{position.position}</option>
											{positions.length > 0 ? 
												positions.filter(position => candidate.position != position._id).map((position) => (
													<option key={position.position} value={position.position}>
														{position.position}
													</option>
												))
											: "no positions.."} */}
											{positions
												.filter((pos) => pos._id !== candidate.position) // Better filtering
												.map((pos) => (
													<option key={pos.position} value={pos.position}>
														{pos.position}
													</option>
													)
												)
											}
										</select>
									</label>
								</div>

								<div className="mb-3">
									<textarea name="manifesto"
										className="p-2.5 my-2"
										{...register('manifesto')}
									/>
								</div>
							</form>
						</div>
					
						<div className="vr-divider"></div>

						<div className="update-candidate-right">
							<div className="candidate-update-pic-holder">
								<img src={state.image} name="candidateimgUrl" className="" />
							</div>
							<div>
								<input className='fileupload form-control-file' 
									type="file"
									id="fileuploadr" 
									style={{ display: 'none' }}
									onChange={ handleFileUpload }
								/>
								<label htmlFor="fileuploadr" className="Button violet" style={{cursor: 'pointer', margin: "0.5rem 0rem"}}>Choose different picture</label>
							</div> 
							<p style={ {overflow: 'hidden', fontSize: '12px'}}>&gt; { state.newFile ? state.newFile : "" }</p>
						</div>
					</div>
							
					<div className="candidate-update-bottom">
						<button 
							type="submit" 
							form="candidate-update-form" 
							className="Button violet"
							disabled={!isDirty && !state.newPicture}
						>Save</button>
					</div>
				</div>
			</div>	
		</>
	);
}

export default UpdateCandidate;
