import { useLoaderData, Link, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'


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
	const [image, setImage] = useState("");
	const [positions, setPositions] = useState(positionsList)
	const params = useParams()
	
	const schema = yup.object().shape({
		firstname: yup.string().min(2).required(),
		lastname: yup.string().min(2).required(),
		selectedPosition: yup.string(),
		manifesto: yup.string(),
		imgUrl: yup.mixed().test('required', 'Choose a picture for the candidate', value => {
			return value && value.length;
		}),
	})

	const { register, handleSubmit, formState, errors } = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			firstname: candidate.firstname,
			lastname: candidate.lastname,
			manifesto: candidate.manifesto,
			selectedPosition: position.position,
			imgUrl: candidate.imgUrl
		}
	});

	const { dirtyFields, isDirty } = formState;

	useEffect(() => {
		setImage(candidate.imgUrl);
		// setPositions(positionsList)
	}, [positionsList])

	const convert64 = imgUrl => {
		const reader = new FileReader()
		reader.onloadend = () => {
			setImage(reader.result.toString())
		}

		reader.readAsDataURL(imgUrl)
	}

	const onSubmit = async (formdata) => {
		if (formdata.imgUrl.length > 0) {
			convert64(formdata.imgUrl[0]);
		}

		if (isDirty) {
			let photoUrl = ''
			const imgRef =
			 ref(fireman, `vote4me/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname) }`);
	
			uploadBytes(imgRef, image)
				.then(snapshot => getDownloadURL(snapshot.ref))
				.then(imgUrl => {
					photoUrl = imgUrl;
				})
				.then( async (data) => {
					try {
						const response = await fetch(`${backendUrl}/election/updatecandidate`, {
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
							      },
							      mode: 'cors',
							      body: JSON.stringify({
								      electionId: election._id,
								      candidate_id: candidate._id,
								      ...formdata,
								      photoUrl
							      }),
						})
			
						if (response.ok) {
							toast.success("Candidate data was updated");
						}
					} catch (error) {
						toast.error("Update failed")
					}
				})
				.catch(err => toast(err))
		} else {
			toast.success("You did not make any changes");
			return 
		}
	}

	return ( 
		<>
			<div className="candidate-update-form-container">
				<div className="update-candidate-top">
					<div className="update-candidate-left">
						<form onSubmit={handleSubmit(onSubmit)}>
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
										<option value={position.position} selected>{position.position}</option>
										{positions.length > 0 ? 
											positions.filter(position => candidate.position != position._id).map((position) => (
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
									{...register('manifesto')}
								/>
							</div>
						</form>
					</div>
				
					<div className="vr-divider"></div>

					<div className="update-candidate-right">
						<div className="candidate-update-pic-holder">
							<img src={image} name="candidateimgUrl" className="" />
						</div>
						<div>
							<input className='fileupload form-control-file' 
								type="file"
								id="fileuploadr" 
								style={{ display: 'none' }}
								onChange={ (e) => {setImage(e.target.files[0])} }
							/>
							<label htmlFor="fileuploadr" className="Button violet" style={{cursor: 'pointer', margin: "0.5rem 0rem"}}>Choose different picture</label>
						</div> 
					</div>
				</div>
						
				<div className="my-2 candidate-update-bottom">
					<Link to={`./position/${position.position}`}><button className="Button red">Back</button></Link>
					<input type="submit" className="Button violet" value={"Save"} />
				</div>
			</div>
		</>
	);
}

export default UpdateCandidate;