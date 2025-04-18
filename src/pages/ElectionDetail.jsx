import { Link, redirect, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '@/App';
import ElectionActions from '@/components/ElectionActions';

import Toast from '@/utils/ToastMsg';
import backendUrl from '../utils/backendurl'
import { authman } from '@/utils/fireloader';

export async function electionDetailLoader({params}) {
	let election, positions, voters = undefined;
	const currentUser = authman.currentUser;

	try {
		const token = await currentUser.getIdToken();
		const headerSection = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}

		const res1 = await fetch(`${backendUrl}/election/${params.id}`, {
			headers: headerSection
		})
		const res2 = await fetch(`${backendUrl}/election/${params.id}/positions`, {
			headers: headerSection
		})

		election = await res1.json()
		positions = await res2.json()

		if (election.type == 'Closed') {
			const v = await fetch(`${backendUrl}/election/${params.id}/voterlist`, {
				headers: headerSection
			})
			voters = await v.json()
		}

	} catch (error) {
		console.log(error);
	}

	return [election, positions, voters]
}

function ElectionDetail() {
	const [loaderElection, positions, voters] = useLoaderData();
	const [election, setElection] = useState(loaderElection)
	const [positionsList, setPositionsList] = useState(positions);
	const [votersList, setVotersList] = useState(voters)
	const [votersFiltered, setVotersFiltered] = useState([])
	const params = useParams()

	const { user } = useContext(AppContext);

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
	const [endElectionModalOpen, setEndElectionModalOpen] = useState(false)
	const [isActive, setIsActive] = useState(false);
	const [hasEnded, setHasEnded] = useState(false)

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
					  Authorization: `Bearer ${await user?.getIdToken()}`
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
				} else if (response.status == 400) {
					Toast.warning(response.text())
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
					  Authorization: `Bearer ${await user?.getIdToken()}`
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
						Authorization: `Bearer ${await user?.getIdToken()}`
					}
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
					Authorization: `Bearer ${await user?.getIdToken()}`
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
							Authorization: `Bearer ${await user?.getIdToken()}`
						}
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
					  Authorization: `Bearer ${await user?.getIdToken()}`
					},
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
						Authorization: `Bearer ${await user?.getIdToken()}`
					},
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

	async function endElection () {
		if (hasEnded) {
			Toast.warning("The election has already ended")
			return;
		} else {
			try {
				const end_res = await fetch(`${backendUrl}/elections/${election._id}/end`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${await user?.getIdToken()}`
					}
				})
				
				setEndElectionModalOpen(false)
	
				const new_res = await end_res.json();
				setElection(prev => ({
					...prev,
					endDate: new Date(new_res?.new_date ?? prev.endDate)
				}));
	
				Toast.success("Election was ended successfully")
			} catch (error) {
				Toast.error("Could not end the election")
			}
		}
	}

	function checkPositionExists(e) {
		if (positionsList.length < 1) {
			e.preventDefault();
			Toast.warning("There are no positions added yet. Add a position first")
		}
	}

	useEffect(() => {
		if (election.type == 'Closed'){
			const votersFiltered = election.userAuthType == 'email' ?
				votersList.filter((voter) => voter.email.toLowerCase().includes(searchTerm.toLowerCase())) :
				votersList.filter((voter) => voter.phoneNo.includes(searchTerm))
				setVotersFiltered(votersFiltered)
		}
	}, [searchTerm, votersList])

	useEffect(() => {
		const now = Date.now();
		// setHasEnded(new Date(election.endDate) < Date.now());
		setIsActive(new Date(election.startDate) < now && now < new Date(election.endDate));
		setHasEnded(new Date(election.endDate) < Date.now());
	}, [election]); // Runs whenever `election` updates

	// ########################################%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	return ( 
		<div className="container">
			<div className="pos-detail-container">
				<div className="pos-heading-banner">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th>Election</th>
								<th>{election.title} <span className={isActive ? 'active-badge' : hasEnded ? 'ended-badge' : 'not-started-badge'}>
									{isActive ? 'Active' : hasEnded ? 'Election Has Ended' : 'Not Started'}
								</span></th>
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
					<ElectionActions
						election={election}
						isActive={isActive}
						hasEnded={hasEnded}
						openPostionModal={openPostionModal}
						checkPositionExists={checkPositionExists}
						setAddParticipantsModalOpen={setAddParticipantsModalOpen}
						setViewUsersModal={setViewUsersModal}
						setEndElectionModalOpen={setEndElectionModalOpen}
					/>
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
												<div className='voter-info'>
													<span>{election.userAuthType == 'email' ? voter.email : voter.phoneNo}</span>
													{ (!isActive && !hasEnded) && (
															<div className='voter-actions'>
																<button className='Button violet action-item' 
																	onClick={ () => editParticipant(voter) }>Edit</button>
																<button className='Button red action-item' 
																	onClick={ () => removeVoter(voter) }><i className="bi bi-trash3 m-1"></i></button>
															</div>
														)
													}
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

				{endElectionModalOpen && (
					<div className="modal-overlay">
						<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-2 rounded-lg shadow-md relative bg-white">
							<p><em>Are you sure you want to End this election. This cannot be undone!</em></p>
							<div className="action-btn-container">
								<button className='Button red action-item' onClick={ endElection }>Yes, End it</button>
								<button className='Button violet action-item' onClick={ () => setEndElectionModalOpen(false) }>No, JK</button>
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
							{positionsList.length > 0 ?
								positionsList.map(position => (
									<tr className="position-row" key={position._id}>
										<td>
											<Link to={`./position/${position.position}`}>{position.position}</Link> 
										</td>

										<td>
											{ (!isActive && !hasEnded) && (
												<div className="action-btn-container">
													<button className='Button violet action-item' 
														onClick={() => editPosition(position)}>
															Edit</button>
													
													<button className='Button red action-item' 
														onClick={() => removePosition(position)}>
															<i className="bi bi-trash3 m-1"></i></button>
												</div>
											)}

										</td>
									</tr>
								)) : <p>No positions added yet</p>
							}
						</tbody>
					</table>
				</div>

			</div>
		</div>
	 );
}

export default ElectionDetail;
