import { useLoaderData, Link, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { fireman } from '../utils/fireloader';
import Toast from "@/utils/ToastMsg";

import { AppContext } from "@/App";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';



import backendUrl from '../utils/backendurl'

export async function updateloader({ params }) {
	let position = undefined;
	let positionsList = undefined;
	let candidate = undefined;
	let election = undefined;

	try {
		const c = await fetch(`${backendUrl}/election/candidate/${params.candidateId}`)
		candidate = await c.json();

		const pos_res = await fetch(`${backendUrl}/election/${candidate.electionId}/positions`)
		positionsList = await pos_res.json()

		const e = await fetch(`${backendUrl}/election/${candidate.electionId}`)
		election = await e.json();

		const pos_name_res = await fetch(`${backendUrl}/election/positions/${candidate.position}`)
		position = await pos_name_res.json()

	} catch (error) {
		
	}
	return [candidate, position, positionsList, election]
}

function UpdateCandidate() {
	const [candidate, position, positionsList, election] = useLoaderData();
	// const [image, setImage] = useState("");
	// const [newPicture, setNewPicture] = useState("");
	// const [newFile, setNewFile] = useState("");
	// const [positions, setPositions] = useState(positionsList);

	const [state, setState] = useState({
		image: candidate.imgUrl || "",
		newPicture: "",
		newFile: "",
		positions: positionsList || []
	});

	const schema = z.object({
		firstname: z.string().min(2, {message: "Firstname cannot be less than two characters"}),
		lastname: z.string().min(2, {message: "Lastname cannot be less than two characters"}),
		selectedPosition: z.string(),
		manifesto: z.string().min(0)
	})

	const { user } = useContext(AppContext);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields, isDirty },
	    } = useForm({
		resolver: zodResolver(schema),
		defaultValues: useMemo(() => ({
		    firstname: candidate.firstname || "",
		    lastname: candidate.lastname || "",
		    manifesto: candidate.manifesto || "",
		    selectedPosition: position.position || "",
		}), [candidate, position]), // Prevent unnecessary re-renders
	});

	useEffect(() => {
		setState((prev) => ({
			...prev,
			imgage: candidate.imgUrl
		}));
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
					Authorization: `Bearer ${await user?.getIdToken()}`
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
										<select {...register('selectedPosition')} className='form-select form-select-lg mb-3'>
											<option value={position.position} selected>{position.position}</option>
											{state.positions.length > 0 &&
												state.positions.filter((pos) => pos._id !== candidate.position)
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
							<p style={ {overflow: 'hidden', fontSize: '12px'}}>&gt; { state.newFile ?  <em>New file selected <i class="bi bi-file-earmark-check-fill"></i></em> : "Using your previous image" }</p>
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
