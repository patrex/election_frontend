import { useLoaderData, Link } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'


import backendUrl from '../utils/backendurl'

export async function updateloader({ params }) {
	let position = undefined;
	let positions = undefined;
	let candidate = undefined;
	let election = undefined;

	try {
		const c = await fetch(`${backendUrl}/election/candidate/${params.candidateId}`)
		candidate = await c.json();

		const pos_res = await fetch(`${backendUrl}/election/${candidate.electionId}/positions`)
		positions = await pos_res.json()

		const e = await fetch(`${backendUrl}/election/${candidate.electionId}`)
		election = await e.json();

		const pos_name_res = await fetch(`${backendUrl}/election/positions/${candidate.position}`)
		position = await pos_name_res.json()

	} catch (error) {
		
	}

	return [candidate, position, positions, election]
}

function UpdateCandidate() {
	const [candidate, position, positions, election] = useLoaderData();

	const [image, setImage] = useState("");

	const schema = yup.object().shape({
		firstname: yup.string().min(2).required(),
		lastname: yup.string().min(2).required(),
		selectedPosition: yup.string(),
		manifesto: yup.string(),
		imgUrl: yup.mixed().test('required', 'Choose a picture for the candidate', value => {
			return value && value.length;
		}),
	})

	const { register, handleSubmit, formState, reset, watch } = useForm({
		resolver: yupResolver(schema)
	});

	const { dirtyFields, isDirty, errors } = formState;

	// preload the form with candidate data
	reset({
		firstname: candidate.firstname,
		lastname: candidate.lastname,
		manifesto: candidate.manifesto,
		selectedPosition: position.position,
		imgUrl: candidate.imgUrl
	})

	setImage(candidate.imgUrl);

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
			<div className="candidate-update-form">
				<form className='form' onSubmit={handleSubmit(onSubmit)}>
					<div className="update-cand-form-cont">
						<div className="update-candidate-left">
							<div>
								<label htmlFor="fname" className="form-label">Firstname: </label>
								<input type="text" 
									id="firstname" 
									aria-describedby="firstname"
									name="firstname"
									autoFocus
									{...register('firstname')}
								/>{errors.firstname && <span className='error-msg'>Firstname must be at least two characters</span>}
							</div>
							<div>
								<label htmlFor="lastname" className="form-label">Lastname: </label>
								<input type="text" 
									id="lastname" 
									aria-describedby="lastname"
									name="lastname"
									{...register('lastname')}
								/>{errors.lastname && <span className='error-msg'>Lastname must be at least two characters</span>}
							</div>
							
							<div>
								<label>
									Select position:
									<select {...register('selectedPosition')}
										className='form-select form-select-lg mb-3'
									> 
										<option value={position} selected>{position}</option>
										{positions.length > 0 ? 
											positions.filter(position => candidate.position != position._id).map((position) => (
												<option key={position.position} value={position.position}>
													{position.position}
												</option>
											))
										: "no positions.."}
									</select> {errors.selectedPosition && <span className='error-msg'>Select a position</span>}
								</label>
							</div>

							<div className="mb-3">
								<textarea name="manifesto"
									id="" rows="3" cols="55"
									className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
									{...register('manifesto')}
								/>
							</div>
						</div>

						<div className="update-candidate-right">
							{/*  candidate picture */}
							<div className="w-full md:w-1/2 flex justify-center">
								<div className="w-48 h-48 rounded-full overflow-hidden border border-gray-300">
									<img src={image} name="candidateimgUrl" className="w-full h-full object-cover" />
								</div>
								<div>
									<input className='fileupload form-control-file' 
										type="file"
										id="fileuploadr" 
										style={{ display: 'none' }}
										{...register("imgUrl") }
									/>
									<label htmlFor="fileuploadr" className="Button violet" style={{cursor: 'pointer', margin: "0.5rem 0rem"}}>Choose different picture</label>
								</div> 
								{errors.img && <span className='error-msg'>Choose a picture</span>}
							</div>
						</div>
						
						<div className="my-2">
							<input type="submit" className="Button violet" value={"Save"} />
							<Link to={`../position/${position.position}`}> </Link> <button className='Button red my-0 mx-3 w-20'>Back</button>
						</div>
					</div>
				</form>
			</div>
		</>
	);
}

export default UpdateCandidate;