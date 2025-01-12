import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import backendUrl from '../utils/backendurl'

export async function electionDetailLoader({params}) {
	let election, positions, voters = undefined;

	try {
		const res1 = await fetch(`${backendUrl}/election/${params.id}`)
		const res2 = await fetch(`${backendUrl}/election/${params.id}/positions`)

		election = await res1.json()
		positions = await res2.json()

		if (election.type == 'Closed') {
			v = await fetch(`${backendUrl}/election/${election._id}/voterlist`)
			voters = await v.json()
		}

	} catch (error) {
		console.log(error);
	}

	return [election, positions, voters]
}

function ElectionDetail() {
	const [election, positions, voters] = useLoaderData();
	const [positionsList, setPositionsList] = useState(positions);
	const [votersList, setVotersList] = useState(voters)
	const params = useParams()

	const [newPosition, setNewPosition] = useState("");
	const [updatedPosition, setUpdatedPosition] = useState("");
	const [currentlySelectedPosition, setCurrentlySelectedPosition] = useState("");
	const [participantsList, setParticipantsList] = useState("");
	
	const [positionModalOpen, setPositionModalOpen] = useState(false);
	const [addParticipantsModalOpen, setAddParticipantsModalOpen] = useState(false)
	const [updatePositionModalOpen, setUpdatePositionModalOpen] = useState(false);
	const [viewUsersModal, setViewUsersModal] = useState(false);

	const [elec, setElection] = useState(election);


	function handlePositionChange(e) {
		setNewPosition(e.target.value);
	}

	function handlePositionUpdate(e) {
		setUpdatedPosition(e.target.value)
	}

	const openUpdatePositionModal = (position) => {
		setUpdatedPosition("")
		setUpdatePositionModalOpen(true)
	}

	const closeUpdatePositionModal = () => {
		setUpdatePositionModalOpen(false)
	}

	const openPostionModal = () => {
		setNewPosition("")
		setPositionModalOpen(true);
		setElection(elec)
	}

	const closePositionModal = () => {
		setPositionModalOpen(false);
	}

	const handleAddPosition = async (e) => {
		e.preventDefault();

		if (newPosition) {
			closePositionModal();

			try {
				const response = await fetch(`${backendUrl}/election/${election._id}/position`, {
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						position: String(newPosition).trim(),
						electionId: election._id
					}),
				});

				if (response.ok) {
					const newEntry = await response.json();
					setPositionsList(prev => [...prev, newEntry])
					toast.success('Position was added')
				} else if (response.status == 409) {
					toast.warning('Position already exists')
				} else {
					toast.warning('Could not add the position')
				}
			} catch (error) {
				toast.warning('Could not add the position')
			}
		} else toast.warning("you need to enter a new position to continue")
	}

	const handleUpdatePosition = async (e) => {
		if (updatedPosition) {
			closeUpdatePositionModal();

			try {
				const response = await fetch(`${backendUrl}/election/${election._id}/position/update`, {
					method: 'PATCH',
					headers: {
					  'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						position: currentlySelectedPosition,
						electionId: election._id,
						new_position: String(updatedPosition).trim()
					}),
				});

				if (response.ok) {
					const updated_position = await response.json();

					setPositionsList((prev) => 
						prev.map((position) => position._id === updated_position._id ? updated_position: position
					))
				} else {
					toast.warning("Could not update the position")
				}
			} catch (error) {
				toast.error("There was an error updating the position")
			}
		}
	}

	function editPosition(position) {
		openUpdatePositionModal()
		setUpdatedPosition(position.position)
		setCurrentlySelectedPosition(position.position)
	}

	function removePosition(position) {
		Swal.fire({
			title: `Delete <strong>${position.position}</strong> from <strong>${election.title}?</strong>`,
			text: 'This will also remove every candidate under this position',
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/${position._id}/delete`, {
					method: 'delete',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
						'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'},
					mode: 'cors',
				})

				if(res.ok) {
					setPositionsList(positionsList.filter(p => p._id != position._id))
					toast.success("The position was removed")	
				} else toast.warning('Could not remove the position: ')
			}
		});	
	}

	async function sendListToDB (voterlist) {
		try {
			const res = await fetch(`${backendUrl}/election/${election._id}/addvoters`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({
					election: election._id,
					voterList: voterlist
				}),
			})

			if (res.ok) {
				toast.success("List was added")
				setParticipantsList('');
			}
		} catch (error) {
			toast.error("An error occured. Try again")
		}	
	}

	async function removeVoter(voter) {
		Swal.fire({
			title: `Remove ${voter.email ? voter.email : voter.phoneNo}?`,
			showDenyButton: true,
			confirmButtonText: "Remove",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const res = await fetch(`${backendUrl}/election/voter/${voter._id}/delete`, {
						method: 'delete',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
							'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'
						},
						mode: 'cors',
					})
		
					if(res.ok) {
						setVotersList(votersList.filter(e => e._id != voter._id ));
						toast.success('The participant was removed successfully')
					}
					
				} catch (error) {
					toast.error("There was an error removing the participant")
				}
			}
		});
	}

	function procList (participantsAuthType) {
		if (!participantsList) {
			toast.warning("You did not enter any participants");
			return;
		}

		if (participantsAuthType === 'email') {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			let invalid = false;

			const voterList = participantsList.split(',')
				.map(email => {
					const emailAddr = email.trim();

					if (emailAddr.match(emailRegex)) return emailAddr;

					invalid = true;
					return emailAddr;
				});
			if (invalid) {
				toast.warning("One or more emails not properly formatted")
				return;
			}

			setAddParticipantsModalOpen(false)
			sendListToDB(voterList)

		} else if (participantsAuthType === 'phone') {
			const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
			const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
	
			let invalid = false;
			const voterList = participantsList.split(',')
				.map(phoneno => {
					const phoneNumber = phoneno.trim();
	
					if (phoneNumber.match(countryCodePattern)) return phoneNumber;
					if (phoneNumber.match(phoneNumberPattern)) return phoneNumber.replace(phoneNumberPattern, '234$2');
	
					invalid = true;
	
					return phoneNumber;
				});
			
			if (invalid) toast.warning("One or more phone numbers not properly formatted")
			
			setAddParticipantsModalOpen(false)
			sendListToDB(voterList)
		}
	}

	// ########################################%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	return ( 
		<div className="container">
			<div className="pos-detail-container">
				<div className="pos-heading-banner">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th>Election</th>
								<th>{election.title}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope='row'>Created On</th>
								<td>{moment(election.dateCreated).format('LLL')}</td>
							</tr>
							<tr>
								<th scope='row'>Starting On</th>
								<td>{moment(election.startDate).format('LLL')}</td>
							</tr>
							<tr>
								<th scope='row'>Ending On</th>
								<td>{moment(election.endDate).format('LLL')}</td>
							</tr>
						</tbody>
					</table>
					<div className="position-action-btn-cont">
						<p><button className='Button violet pos-act-item' onClick={() => openPostionModal(election)}>Add Position</button></p>
						<p><Link to={`/user/${params.userId}/election/${election._id}/addcandidate`}><button disabled={!positions} className='Button violet pos-act-item'>Add Candidate</button></Link></p>
						{ election.type === "Closed" && <p><button className='Button violet pos-act-item' onClick={ () => setAddParticipantsModalOpen(true) }>Add Voters</button></p> }
						{ election.type === "Closed" && <p><button className='Button violet pos-act-item' onClick={ () => setViewUsersModal(true) }>View Voters</button></p> }
					</div>
				</div>

				{viewUsersModal && (
					<div className="modal-overlay">
						<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
							<p>Registered participants</p>

							<table className="table table-striped table-hover table-sm table-responsive">
								<tbody>
									{votersList && (
										votersList.map(voter => (
											<tr key={voter._id}>
												<td>{election.userAuthType == 'email' ? voter.email: voter.phoneNo}</td>
												<td><button className='Button red' onClick={() => removeVoter(voter)}><i className="bi bi-trash3 m-1"></i></button></td>
											</tr>
										))
									)}
								</tbody>
							</table>
							<div className="my-2">
								<button className='Button green-dark my-0 mx-3 w-20' onClick={ () => setViewUsersModal(false)}>Close</button>
							</div>
						</div>
					</div>
				)}

				{positionModalOpen && (
					<div className="modal-overlay">
						<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter a new position for <strong>{`${election.title}`}</strong></span>
							<br />
							<input 
								type='text'
								placeholder="Enter new position"
								id='newposition' 
								value={newPosition}
								onChange={handlePositionChange}
								className='w-5/6 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="my-2">
								<button className='Button violet my-2' onClick={handleAddPosition}>Add Position</button>
								<button className='Button red my-0 mx-3 w-20' onClick={closePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{updatePositionModalOpen && (
					<div className="modal-overlay">
						<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
							<span>Edit position for <strong>{`${election.title}`}</strong></span>
							<br />
							<input 
								type='text'
								id='updateposition' 
								value={updatedPosition}
								onChange={handlePositionUpdate}
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="my-2">
								<button className='Button violet my-2' onClick={handleUpdatePosition}>Update Position</button>
								<button className='Button red my-0 mx-3 w-20' onClick={closeUpdatePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{addParticipantsModalOpen && ( 
					<div className="modal-overlay">
						<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter list of participants for <strong>{`${election.title}`}</strong></span>
							<br />
							<textarea 
								placeholder={`Enter/paste ${election.userAuthType == 'email' ? 'emails' : 'phone numbers'}. Seperate with commas`}
								id='phonenos'
								value={ participantsList }
								className='block resize-none p-2.5 my-2.5'
								onChange={ (e) => { setParticipantsList(e.target.value)} }
							/>
							<div className="my-2">
								{election.userAuthType == 'email' && <button className='Button violet' onClick={() => procList('email')}>Add Emails</button>}
								{election.userAuthType == 'phone' && <button className='Button violet' onClick={() => procList('phone')}>Add Phone #s</button>}
								<button className='Button red my-0 mx-3 w-20' onClick={ () => setAddParticipantsModalOpen(false) }>Cancel</button>
							</div>
						</div>
					</div>
				)}

				<div className="pos-list-container">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th scope='col'>Positions</th>
								<th scope="col">Actions</th>
								<th scope="col"></th>
							</tr>
						</thead>
						<tbody>
							{	
								positionsList.map(position => (
									<tr className="position-row" key={position._id}>
										<td>
											<Link to={`./position/${position.position}`}>{position.position}</Link> 
										</td>


										<td>
											<button className='Button red' 
												onClick={() => editPosition(position)}>
													<i className="bi bi-pen-fill"></i></button>
										</td>

										<td>
											<button className='Button red' 
												onClick={() => removePosition(position)}>
													<i className="bi bi-trash3 m-1"></i></button>
										</td>
									</tr>
								))
							}
						</tbody>
					</table>
				</div>

			</div>
		</div>
	 );
}

export default ElectionDetail;
