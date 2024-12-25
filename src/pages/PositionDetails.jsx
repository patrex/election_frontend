import { useLoaderData } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import Swal from "sweetalert2";
import { useState } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'

import backendUrl from '../utils/backendurl'

export async function loader({params}) {
	let election, candidates = undefined;
	let position = params.position;
	let positions = undefined;

	try {
		const res1 = await fetch(`${backendUrl}/election/${params.id}`)
		const candidateList = await fetch(`${backendUrl}/election/${params.id}/${params.position}/candidates`)
		const pos_res = await fetch(`${backendUrl}/election/${params.id}/positions`)

		election = await res1.json();
		candidates = await candidateList.json();
		positions = await pos_res.json()

	} catch (error) {
		
	}

	return [election, candidates, position, positions]
}

function PositionDetails() {
	const [election, candidates, position, positions] = useLoaderData();
	const [candidatesList, setCandidatesList] = useState(candidates);

	const [candidate, setCandidate] = useState();
	const [selectedPosition, setSelectedPosition] = useState("");


	const [image, setImage] = useState('');
	
	const [updateCandidateModalOpen, setUpdateCandidateModalOpen] = useState(false); // control update candidate modal

	const schema = Joi.object({
		firstname: Joi.string().min(2).required(),
		lastname: Joi.string().min(2).required(),
		selectedPosition: Joi.string().min(2),
		manifesto: Joi.string()
	})
	
	const { register, handleSubmit, formState: {errors}, reset } = useForm({
		resolver: joiResolver(schema)
	});

	async function editCandidate(candidate)  {
		setCandidate(candidate);
		setUpdateCandidateModalOpen(true)
		reset({
			firstname: candidate.firstname,
			lastname: candidate.lastname,
			manifesto: candidate.manifesto,
			selectedPosition: position.position
		})
	}

	const onSubmit = async (formdata) => {
		uploadImage(formdata)
	}

	const uploadImage = (formdata) => {
		let photoUrl = ''
		const imgRef =
		 ref(fireman, `votersystem/${election._id}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname) }`);

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
						setUpdateCandidateModalOpen(false);
					}
				} catch (error) {
					toast.error("Update failed")
				}
			})
			.catch(err => toast(err))
	}

	async function updateCandidate() {

	}

	const closeUpdateCandidateModal = () => {
		setUpdateCandidateModalOpen(false)
	}

	function removeCandidate(candidate) {
		Swal.fire({
			title: `Delete ${candidate.firstname} ${candidate.lastname}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/candidate/${candidate._id}/delete`, {
					method: 'delete',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
						'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'},
					mode: 'cors',
				})
	
				if(res.ok) {
					setCandidatesList(candidatesList.filter(c => c._id != candidate._id))
					toast.success('Candidate was removed')
				}
			}
		});	
	}

	return ( 
		<>
			<h1 style={{padding: "0 .5rem"}}>Candidates for {position}</h1>
			<div className="candidates-grid">
				{
					candidatesList.map(candidate => (
						<div className="candidate-card">
							<div className="candidate-card-img"><img src={candidate.imgUrl} alt={candidate.firstname + ' ' + candidate.lastname} /></div>
			
							<div className="candidate-card-details">
								<div className="candidate-card-name-plaque">{`${candidate.firstname} ${candidate.lastname}`}</div>
								<div className="candidate-pos-label">{position} </div>
								<div className="btn-group" role="group">
									<button type="button" className='btn btn-secondary' onClick={() => editCandidate(candidate)}>
										<i class="bi bi-pen-fill"></i></button>
									<button type="button" className='btn btn-danger' onClick={() => removeCandidate(candidate)}>
										<i className="bi bi-trash3"></i></button>
								</div>
								
							</div>
						</div>
					))
				}
			</div>

			{updateCandidateModalOpen && (
				<div className="edit-candidate-modal">
					<div>
						<form className='form' onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-3">
								<label htmlFor="fname" className="form-label">Firstname: </label>
								<input type="text" 
									id="firstname" 
									aria-describedby="firstname"
									name="firstname"
									autoFocus
									{...register('firstname')}
								/>{errors.firstname && <span className='error-msg'>Firstname must be at least two characters</span>}
							</div>
							<div className="mb-3">
								<label htmlFor="lastname" className="form-label">Lastname: </label>
								<input type="text" 
									id="lastname" 
									aria-describedby="lastname"
									name="lastname"
									{...register('lastname')}
								/>{errors.lastname && <span className='error-msg'>Lastname must be at least two characters</span>}
							</div>
							
							<div className='mb-3'>
								<label>
									Select position:
									<select {...register('selectedPosition')}
										className='form-select form-select-lg mb-3'
										name="selectedPosition"
									> {errors.selectedPosition && <span className='error-msg'>Select a position</span>}
										{/* <option selected value={position.position}>{position.position}</option> */}
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
									className='block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-transparent focus:outline-none'
									{...register('manifesto')}
								/>
							</div>

							{/*  candidate picture */}
							<div className="picture-section">
								<div className="candidate-picture-img">
									<img src={candidate.imgUrl} name="imgUrl" />
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
							</div>
							
							<div className="my-2">
								<input type="submit" className="Button violet" value={"Save"} />
								<button className='Button red my-0 mx-3 w-20' onClick={closeUpdateCandidateModal}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default PositionDetails;
