import { Link, redirect, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import { useEffect, useState, useContext, useMemo } from 'react';
import { AppContext } from '@/App';
import ElectionActions from '@/components/ElectionActions';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import StatusBadge from '@/components/StatusBadge';

import Toast from '@/utils/ToastMsg';
import backendUrl from '../utils/backendurl'
import { authman } from '@/utils/fireloader';
import { useEventStatus } from '@/hooks/useEventStatus';
import PositionsBox from '@/components/PositionsBox';

export async function electionDetailLoader({ params }) {
	const currentUser = authman.currentUser;

	try {
		const token = await currentUser.getIdToken();
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};

		// Fetch election and positions in parallel
		const [electionRes, positionsRes] = await Promise.all([
			fetch(`${backendUrl}/election/${params.id}`, { headers }),
			fetch(`${backendUrl}/election/${params.id}/positions`, { headers })
		]);

		// Check for HTTP errors
		if (!electionRes.ok || !positionsRes.ok) {
			throw new Error('Failed to fetch election data');
		}

		const [election, positions] = await Promise.all([
			electionRes.json(),
			positionsRes.json()
		]);

		// Fetch voters only for closed elections
		let voters = null;
		if (election.type === 'Closed') {
			const votersRes = await fetch(`${backendUrl}/election/${params.id}/voterlist`, { headers });
			
			if (!votersRes.ok) {
				throw new Error('Failed to fetch voter list');
			}
			
			voters = await votersRes.json();
		}

		return { election, positions, voters };

	} catch (error) {
		console.error('Error loading election details:', error);
		// Return null values or throw error depending on your error handling strategy
		return { election: null, positions: null, voters: null };
	}
}

function ElectionDetail() {
	const { election: loaderElection, positions, voters } = useLoaderData();
    
	const [election, setElection] = useState(loaderElection);
	const [positionsList, setPositionsList] = useState(positions);
	const [votersList, setVotersList] = useState(voters || []);
    
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
	const [endElectionModalOpen, setEndElectionModalOpen] = useState(false);
    
	const { isActive, isPending, hasEnded } = useEventStatus(
	    new Date(election.startDate), 
	    new Date(election.endDate)
	);
    
	// ✅ Robust computed filtered voters
	const votersFiltered = useMemo(() => {
	    if (election.type !== 'Closed' || !votersList || votersList.length === 0) {
		return [];
	    }
    
	    const searchLower = searchTerm.toLowerCase();
    
	    if (election.userAuthType === 'email') {
		return votersList.filter((voter) => {
		    const email = voter?.email || '';
		    return email.toLowerCase().includes(searchLower);
		});
	    } else {
		return votersList.filter((voter) => {
		    const phone = voter?.phoneNo || '';
		    return phone.includes(searchTerm);
		});
	    }
	}, [election.type, election.userAuthType, votersList, searchTerm]);
    
	function closeAddParticipant() {
	    setSearchTerm("");
	    setViewUsersModal(false);
	}
    
	function handlePositionChange(e) {
	    setNewPosition(e.target.value);
	}
    
	function handlePositionUpdate(e) {
	    setUpdatedPosition(e.target.value);
	}
    
	const openUpdatePositionModal = () => {
	    setUpdatedPosition("");
	    setUpdatePositionModalOpen(true);
	}
    
	const closeUpdatePositionModal = () => {
	    setUpdatePositionModalOpen(false);
	}
    
	const openPostionModal = () => {
	    setNewPosition("");
	    setPositionModalOpen(true);
	}
    
	const closePositionModal = () => {
	    setPositionModalOpen(false);
	}
    
	const handleAddPosition = async (e) => {
	    e.preventDefault();
    
	    if (!newPosition) {
		Toast.warning("You need to enter a new position to continue");
		return;
	    }
    
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
		    setPositionsList(prev => [...prev, newEntry]);
		    Toast.success('Position was added');
		} else if (response.status === 409) {
		    Toast.warning('Position already exists');
		} else if (response.status === 400) {
		    const errorMsg = await response.text();
		    Toast.warning(errorMsg);
		} else {
		    Toast.warning('Could not add the position');
		}
	    } catch (error) {
		Toast.error('Could not add the position');
	    }
	}
    
	const handleUpdatePosition = async (e) => {
	    if (!updatedPosition) {
		Toast.warning("Please enter a position name");
		return;
	    }
    
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
			prev.map((position) => 
			    position._id === updated_position._id ? updated_position : position
			)
		    );
		    Toast.success('Position was updated');
		} else {
		    Toast.warning("Could not update the position");
		}
	    } catch (error) {
		Toast.error("There was an error updating the position");
	    }
	}
    
	function editPosition(position) {
	    openUpdatePositionModal();
	    setUpdatedPosition(position.position);
	    setCurrentlySelectedPosition(position.position);
	}
    
	async function removePosition(position) {
	    try {
		const res = await fetch(`${backendUrl}/election/${election._id}/${position._id}/delete`, {
		    method: 'DELETE',
		    headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await user?.getIdToken()}`
		    }
		});
    
		if (res.ok) {
		    setPositionsList(positionsList.filter(p => p._id !== position._id));
		    Toast.success("The position was removed");	
		} else {
		    Toast.warning('Could not remove the position');
		}
	    } catch (error) {
		Toast.error('There was an error removing the position');
	    }
	}
    
	async function sendListToDB(voterlist) {
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
		});
    
		const new_list = await post_list.json();
    
		if (post_list.ok) {
		    const updated_list = [...votersList, ...new_list.voters];
		    setVotersList(updated_list);
		    Toast.success(`List was updated`);
		    setParticipantsList('');
		} else {
		    Toast.warning('Could not update the list');
		}
	    } catch (error) {
		Toast.error("An error occurred. Try again");
	    }	
	}
    
	async function removeVoter(voter) {
	    try {
		const res = await fetch(`${backendUrl}/election/voter/${voter._id}/delete`, {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await user?.getIdToken()}`
		    }
		});
    
		if (res.ok) {
		    const updatedList = votersList.filter(e => e._id !== voter._id);
		    setVotersList(updatedList);
		    Toast.success('The participant was removed successfully');
		} else {
		    Toast.warning('Could not remove the participant');
		}
	    } catch (error) {
		Toast.error("There was an error removing the participant");
	    }
	}
    
	function procList(participantsAuthType) {
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
		    Toast.warning("One or more emails not properly formatted");
		    return;
		}
    
		setAddParticipantsModalOpen(false);
		voterList = [...new Set(voterList)];
		sendListToDB(voterList);
    
	    } else if (participantsAuthType === 'phone') {
		const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
		const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
	
		let invalid = false;
		let voterList = participantsList.split(',')
		    .map(phoneno => {
			const phoneNumber = phoneno.trim();
			if (phoneNumber.match(countryCodePattern)) return phoneNumber;
			if (phoneNumber.match(phoneNumberPattern)) {
			    return phoneNumber.replace(phoneNumberPattern, '234$2');
			}
			invalid = true;
			return phoneNumber;
		    });
		
		if (invalid) {
		    Toast.warning("One or more phone numbers not properly formatted");
		    return;
		}
		
		setAddParticipantsModalOpen(false);
		voterList = [...new Set(voterList)];
		sendListToDB(voterList);
	    }
	}
    
	function editParticipant(participant) {
	    setParticipant(participant);
	    setUpdateParticipantModal(true);
	}
    
	async function patchVoterEmail() {
	    if (!updatedParticipantInfo) {
		Toast.warning("Please enter an email address");
		return;
	    }
    
	    const emailAddr = String(updatedParticipantInfo).trim();
	    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	    
	    if (!emailAddr.match(emailRegex)) {
		Toast.error("Email is invalid");
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
		    setVotersList((prev) => 
			prev.map((v) => v._id === updated_participant._id ? updated_participant : v)
		    );
		    Toast.success("Participant was updated");
		} else {
		    Toast.warning("Could not update the participant");
		}
	    } catch (error) {
		Toast.error("There was an error with the request");
	    }
	}
    
	async function patchVoterPhone() {
	    if (!updatedParticipantInfo) {
		Toast.warning("Please enter a phone number");
		return;
	    }
    
	    const phoneNumber = String(updatedParticipantInfo).trim();
	    let validatedPhoneNo = '';
    
	    const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
	    const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
	    
	    if (phoneNumber.match(countryCodePattern)) {
		validatedPhoneNo = phoneNumber;
	    } else if (phoneNumber.match(phoneNumberPattern)) {
		validatedPhoneNo = phoneNumber.replace(phoneNumberPattern, '234$2');
	    } else {
		Toast.warning("Phone number is invalid");
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
		    setVotersList((prev) => 
			prev.map((v) => v._id === updated_participant._id ? updated_participant : v)
		    );
		    Toast.success("Participant was updated");
		} else {
		    Toast.warning("Could not update the voter");
		}
	    } catch (error) {
		Toast.error("There was an error with the request");
	    }
	}
    
	async function endElection() {
	    if (hasEnded) {
		Toast.warning("The election has already ended");
		return;
	    }
    
	    try {
		const end_res = await fetch(`${backendUrl}/elections/${election._id}/end`, {
		    method: 'PUT',
		    headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await user?.getIdToken()}`
		    }
		});
		
		setEndElectionModalOpen(false);
    
		if (end_res.ok) {
		    const new_res = await end_res.json();
		    setElection(prev => ({
			...prev,
			endDate: new Date(new_res?.new_date ?? prev.endDate)
		    }));
		    Toast.success("Election was ended successfully");
		} else {
		    Toast.warning("Could not end the election");
		}
	    } catch (error) {
		Toast.error("Could not end the election");
	    }
	}
    
	function checkPositionExists(e) {
	    if (positionsList.length < 1) {
		e.preventDefault();
		Toast.warning("There are no positions added yet. Add a position first");
	    }
	}
    
	// ... rest of component (return statement)

	// ########################################%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	return ( 
		<div className="container">
			<div className="pos-detail-container">
				<div className="pos-heading-banner">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th>Election</th>
								<th>{election.title} <StatusBadge election={election}/></th>
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
													{ isPending && (
														<div className='voter-actions'>
															<button className='Button violet action-item' 
																onClick={ () => editParticipant(voter) }>Edit
															</button>

															<AlertDialog.Root>
																<AlertDialog.Trigger asChild>
																	<button className='Button red action-item'><i className="bi bi-trash3 m-1"></i></button>
																</AlertDialog.Trigger>
																<AlertDialog.Portal>
																<AlertDialog.Overlay className="AlertDialogOverlay" />
																<AlertDialog.Content className="AlertDialogContent">
																	<AlertDialog.Title className="AlertDialogTitle">Remove Voter</AlertDialog.Title>
																	<AlertDialog.Description className="AlertDialogDescription">
																		{`Remove ${election.userAuthType === 'email' ? voter.email : voter.phoneNo}?`}
																	</AlertDialog.Description>
																		<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
																	<AlertDialog.Cancel asChild>
																		<button  className="Button mauve">Cancel</button>
																	</AlertDialog.Cancel>
																	<AlertDialog.Action asChild>
																		<button className="Button red" onClick={ () => removeVoter(voter) }>Yes, remove</button>
																	</AlertDialog.Action>
																		</div>
																</AlertDialog.Content>
																</AlertDialog.Portal>
															</AlertDialog.Root>
														</div>
													)}
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
								{ election.userAuthType == 'email' ? <button className='Button violet action-item' onClick={() => procList('email')}>Add Emails</button>
								 : <button className='Button violet action-item' onClick={() => procList('phone')}>Add Phone #s</button> }
								<button className='Button red action-item' onClick={ () => setAddParticipantsModalOpen(false) }>Cancel</button>
							</div>
						</div>
					</div>
				)}

				<div className="pos-list-container">
					<PositionsBox list_of_positions={positionsList}
						isPending={isPending}
						editPosition={editPosition}
						removePosition={removePosition}
					/>
				</div>

			</div>
		</div>
	 );
}

export default ElectionDetail;
