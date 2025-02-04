import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import Toast from '@/utils/ToastMsg';

import backendUrl from '../utils/backendurl'

export async function electionDetailLoader({params}) {
	let election, positions, voters = undefined;

	try {
		const res1 = await fetch(`${backendUrl}/election/${params.id}`)
		const res2 = await fetch(`${backendUrl}/election/${params.id}/positions`)

		election = await res1.json()
		positions = await res2.json()

		if (election.type == 'Closed') {
			const v = await fetch(`${backendUrl}/election/${params.id}/voterlist`)
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
	const [votersFiltered, setVotersFiltered] = useState([])
	const params = useParams()

	const [newPosition, setNewPosition] = useState("");
	const [updatedPosition, setUpdatedPosition] = useState("");
	const [currentlySelectedPosition, setCurrentlySelectedPosition] = useState("");
	const [participantsList, setParticipantsList] = useState("");
	const [participant, setParticipant] = useState();
	const [updatedParticipantInfo, setUpdatedParticipantInfo] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	
	
	const [positionModalOpen, setPositionModalOpen] = useState(false);
	const [updatePositionModalOpen, setUpdatePositionModalOpen] = useState(false);
	const [addParticipantsModalOpen, setAddParticipantsModalOpen] = useState(false);
	const [updateParticipantModal, setUpdateParticipantModal] = useState(false);
	const [viewUsersModal, setViewUsersModal] = useState(false);

	const [elec, setElection] = useState(election);

	function closeAddParticipant () {
		setSearchTerm("")
		setViewUsersModal(false)
	}

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
					Toast.success('Position was added')
				} else if (response.status == 409) {
					Toast.warning('Position already exists')
				} else {
					Toast.warning('Could not add the position')
				}
			} catch (error) {
				Toast.warning('Could not add the position')
			}
		} else Toast.warning("you need to enter a new position to continue")
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
					Toast.warning("Could not update the position")
				}
			} catch (error) {
				Toast.error("There was an error updating the position")
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
					Toast.success("The position was removed")	
				} else Toast.warning('Could not remove the position: ')
			}
		});	
	}

	async function sendListToDB (voterlist) {
		try {
			const post_list = await fetch(`${backendUrl}/election/${election._id}/closed_event/addvoters`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					election: election._id,
					voterList: voterlist
				}),
			})

			const new_list = await post_list.json()

			if (post_list.ok) {
				const updated_list = [...votersList, ...new_list.voters];
				setVotersList(updated_list)
				setVotersFiltered(updated_list)

				// const duplicatesFound = new_list.existing_voters.length

				Toast.success(`List was updated`)
				setParticipantsList('');
			}
		} catch (error) {
			Toast.error("An error occured. Try again")
		}	
	}

	async function removeVoter(voter) {
		Swal.fire({
			title: `Remove ${election.userAuthType == 'email' ? voter.email : voter.phoneNo}?`,
			showDenyButton: true,
			confirmButtonText: "Remove",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const res = await fetch(`${backendUrl}/election/voter/${voter._id}/delete`, {
						method: 'post',
						headers: {
							'Content-Type': 'application/json',
						},
						mode: 'cors',
					})
		
					if(res.ok) {
						setVotersList(votersList.filter(e => e._id != voter._id ));
						Toast.success('The participant was removed successfully')
					}
					
				} catch (error) {
					Toast.error("There was an error removing the participant")
				}
			}
		});
	}

	function procList (participantsAuthType) {
		if (!participantsList) {
			Toast.warning("You did not enter any participants");
			return;
		}

		if (participantsAuthType === 'email') {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			let invalid = false;

			let voterList = participantsList.split(',')
				.map(email => {
					const emailAddr = email.trim();

					if (emailAddr.match(emailRegex)) return emailAddr;

					invalid = true;
					return emailAddr;
				});
			if (invalid) {
				Toast.warning("One or more emails not properly formatted")
				return;
			}

			setAddParticipantsModalOpen(false)
			voterList = [...new Set(voterList)]
			sendListToDB(voterList)

		} else if (participantsAuthType === 'phone') {
			const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
			const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
	
			let invalid = false;
			let voterList = participantsList.split(',')
				.map(phoneno => {
					const phoneNumber = phoneno.trim();
	
					if (phoneNumber.match(countryCodePattern)) return phoneNumber;
					if (phoneNumber.match(phoneNumberPattern)) return phoneNumber.replace(phoneNumberPattern, '234$2');
	
					invalid = true;
	
					return phoneNumber;
				});
			
			if (invalid) Toast.warning("One or more phone numbers not properly formatted")
			
			setAddParticipantsModalOpen(false)
			voterList = [...new Set(voterList)]
			sendListToDB(voterList)
		}
	}

	function editParticipant(participant) {
		setParticipant(participant)
		setUpdateParticipantModal(true);
	}

	async function patchVoterEmail () {
		if (updatedParticipantInfo) {
			const emailAddr = String(updatedParticipantInfo).trim()
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailAddr.match(emailRegex)) {
				Toast.error("Email is invalid")
				return;
			}
			setUpdateParticipantModal(false);
			try {
				const response = await fetch(`${backendUrl}/election/voter/update`, {
					method: 'PATCH',
					headers: {
					  'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						emailAddr: emailAddr,
						participantId: participant._id,
						electionId: election._id
					}),
				});

				if (response.ok) {
					const updated_participant = await response.json();
					setParticipantsList((prev) => 
						prev.map( (participant) => participant._id === updated_participant._id ? updated_participant : participant
					))
				} else {
					Toast.warning("Could not update the position")
				}
			} catch (error) {
				Toast.error("There was an error with the request")
			}
		}
	}

	async function patchVoterPhone() {
		if (updatedParticipantInfo) {
			const phoneNumber = String(updatedParticipantInfo).trim()
			let validatedPhoneNo = ''

			const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
			const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
			
			if (phoneNumber.match(countryCodePattern)) {
				validatedPhoneNo = phoneNumber
			} else if (phoneNumber.match(phoneNumberPattern)) {
				validatedPhoneNo = phoneNumber.replace(phoneNumberPattern, '234$2');
			} else {
				Toast.warning("Phone number is invalid")
				return;
			}

			try {
				const response = await fetch(`${backendUrl}/election/voter/update`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						phoneNo: validatedPhoneNo,
						participantId: participant._id,
						electionId: election._id
					}),
				});
				
				if (response.ok) {
					setUpdateParticipantModal(false);
					const updated_participant = await response.json();
					setParticipantsList((prev) => 
						prev.map((participant) => participant._id === updated_participant._id ? updated_participant : participant
					))
				} else {
					Toast.warning("Could not update the voter")
				}
			} catch (error) {
				Toast.error("There was an error with the request")
			}
		}
	}

	
	useEffect(() => {
		const votersFiltered = election.userAuthType == 'email' ?
			votersList.filter((voter) => voter.email.toLowerCase().includes(searchTerm.toLowerCase())) :
			votersList.filter((voter) => voter.phoneNo.includes(searchTerm))
			setVotersFiltered(votersFiltered)
	}, [searchTerm, votersList])

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
					<div style={ {display: 'flex', justifyContent: 'flex-start'} }>
						<p><button className='Button violet action-item' onClick={() => openPostionModal(election)}>Add Position</button></p>
						<p><Link to={`/user/${params.userId}/election/${election._id}/addcandidate`}><button disabled={!positions} className='Button violet action-item'>Add Candidate</button></Link></p>
						{ election.type === "Closed" && <p><button className='Button violet action-item' onClick={ () => setAddParticipantsModalOpen(true) }>Add Voters</button></p> }
						{ election.type === "Closed" && <p><button className='Button violet action-item' onClick={ () => setViewUsersModal(true) }>View Voters</button></p> }
					</div>
				</div>

				{viewUsersModal && (
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
							<p>Registered participants</p>

							<div className="max-h-96 overflow-auto p-2">
								<ul>
									{votersFiltered.length === 0 ? (
										<p>No voters found</p>
										) : (
										votersFiltered.map(voter => (
											<li key={voter._id}>
												<div>
													{election.userAuthType == 'email' ? voter.email : voter.phoneNo}
													<div>
														<button className='Button violet action-item' onClick={ () => editParticipant(voter) }><i className="bi bi-pen-fill"></i></button>
														<button className='Button red action-item' onClick={ () => removeVoter(voter) }><i className="bi bi-trash3 m-1"></i></button>
													</div>
												</div>
											</li>
										)))
									}
								</ul>
							</div>


							<div className='flex flex-col sm:flex-row items-center justify-between w-full p-1 gap-2'>
								<div className='p-2'>
									<input
										type="text"
										placeholder="Search..."
										className="w-full p-2 border rounded-md"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>

								<div>
									<button className='Button violet action-item' onClick={ closeAddParticipant }>Close</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{positionModalOpen && (
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
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
							<div className="action-btn-container">
								<button className='Button violet action-item' onClick={handleAddPosition}>Add Position</button>
								<button className='Button red action-item' onClick={closePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{updateParticipantModal && (
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-gray-200">
							<span>Update participant info: <strong>{`${election.userAuthType == 'email' ? participant.email : participant.phoneNo}`}</strong></span>
							<br />
							<input 
								type='text'
								id='updateparticipant' 
								value={ updatedParticipantInfo }
								onChange={ (e) => { setUpdatedParticipantInfo(e.target.value) } }
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="action-btn-container" >
								{election.userAuthType == 'email' && <button className='Button violet action-item' onClick={ patchVoterEmail }>Save</button>}
								{election.userAuthType == 'phone' && <button className='Button violet action-item' onClick={ patchVoterPhone }>Save</button>}
								<button className='Button red action-item' onClick={ () => setUpdateParticipantModal(false) }>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{updatePositionModalOpen && (
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
							<span>Edit position for <strong>{`${election.title}`}</strong></span>
							<br />
							<input 
								type='text'
								id='updateposition' 
								value={updatedPosition}
								onChange={handlePositionUpdate}
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="action-btn-container">
								<button className='Button violet action-item' onClick={handleUpdatePosition}>Update Position</button>
								<button className='Button red action-item' onClick={closeUpdatePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{addParticipantsModalOpen && ( 
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter list of participants for <strong>{`${election.title}`}</strong></span>
							<br />
							<textarea 
								placeholder={`Enter/paste ${election.userAuthType == 'email' ? 'emails' : 'phone numbers'}. Seperate with commas`}
								id='phonenos'
								value={ participantsList }
								className='block resize-none p-2.5 my-2.5'
								onChange={ (e) => { setParticipantsList(e.target.value)} }
							/>
							<div className="action-btn-container">
								{election.userAuthType == 'email' && <button className='Button violet action-item' onClick={() => procList('email')}>Add Emails</button>}
								{election.userAuthType == 'phone' && <button className='Button violet action-item' onClick={() => procList('phone')}>Add Phone #s</button>}
								<button className='Button red action-item' onClick={ () => setAddParticipantsModalOpen(false) }>Cancel</button>
							</div>
						</div>
					</div>
				)}

				<div className="pos-list-container">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th scope='col'>Positions</th>
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
											<div className="action-btn-container">
												<button className='Button violet action-item' 
													onClick={() => editPosition(position)}>
														<i className="bi bi-pen-fill"></i></button>
												
												<button className='Button red action-item' 
													onClick={() => removePosition(position)}>
														<i className="bi bi-trash3 m-1"></i></button>
											</div>

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
