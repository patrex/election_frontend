import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from '@/App';
import ElectionActions from '@/components/ElectionActions';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import StatusBadge from '@/components/StatusBadge';
import isValidEmail from '@/utils/validateEmail';

import Toast from '@/utils/ToastMsg';
import { useEventStatus } from '@/hooks/useEventStatus';
import PositionsBox from '@/components/PositionsBox';
import { fetcher, FetchError } from '@/utils/fetcher';

export async function electionDetailLoader({ params }) {
	try {
		// Fetch election and positions in parallel
		const [election, positions] = await Promise.all([
			fetcher.get(`election/${params.id}`),
			fetcher.get(`election/${params.id}/positions`)
		]);

		// Fetch voters only for closed elections
		let voters = null;
		if (election.type === 'Closed') {
			voters = await fetcher.get(`election/${params.id}/voterlist`);
		}

		return [election, positions, voters];
	} catch (error) {
		console.error('Error loading election details:', error);
		// Return null values or throw error depending on your error handling strategy
		return;
	}
}

function ElectionDetail() {
	const [loaderElection, positions, voters] = useLoaderData();

	const [election, setElection] = useState(loaderElection);
	const [positionsList, setPositionsList] = useState(positions);
	const [votersList, setVotersList] = useState(voters || []);
	const [votersFiltered, setVotersFiltered] = useState([]);

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

	const { isPending, hasEnded } = useEventStatus(
		new Date(election.startDate),
		new Date(election.endDate)
	);

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

	async function handleAddPosition(e) {
		e.preventDefault();

		if (!newPosition) {
			Toast.warning("You need to enter a new position to continue");
			return;
		}

		closePositionModal();

		try {
			const response = await fetcher.auth.post(
				`election/${election._id}/position`,
				{
					position: String(newPosition).trim(),
					electionId: election._id
				},
				user,
			);

			setPositionsList(prev => [...prev, response]);
			Toast.success('Position was added');

		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 409) {
					Toast.warning('Position already exists');
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('Could not add the position');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		}
	}

	const handleUpdatePosition = async (e) => {
		if (!updatedPosition) {
			Toast.warning("Please enter a position name");
			return;
		}

		closeUpdatePositionModal();

		try {
			const response = await fetcher.auth.patch(
				`election/${election._id}/position/update`,
				{
					position: currentlySelectedPosition,
					electionId: election._id,
					new_position: String(updatedPosition).trim()
				},
				user
			);
			setPositionsList((prev) =>
				prev.map((position) =>
					position._id === response._id ? response : position
				)
			);
			Toast.success('Position was updated');
		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 409) {
					Toast.warning('Position already exists');
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('Could not add the position');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		}
	}

	function editPosition(position) {
		openUpdatePositionModal();
		setUpdatedPosition(position.position);
		setCurrentlySelectedPosition(position.position);
	}

	async function removePosition(position) {
		try {
			fetcher.auth.delete(
				`election/${election._id}/${position._id}/delete`,
				user
			);

			setPositionsList(positionsList.filter(p => p._id !== position._id));
			Toast.success("The position was removed");
		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 500) {
					Toast.warning("There was an unexpected error");
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('You need to be logged in');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		}
	}

	async function sendListToDB(voterlist) {
		try {
			const votersToDb = fetcher.auth.post(
				`election/${election._id}/closed_event/addvoters`,
				{
					election: election._id,
					voterList: voterlist
				},
				user
			);


			const updatedList = [...votersList, ...votersToDb.voters];
			setVotersList(updatedList);
			setVotersFiltered(updatedList);
			Toast.success(`List was updated`);
			setParticipantsList('');
		} catch (error) {
			Toast.error("An error occurred. Try again");
		}
	}

	async function removeVoter(voter) {
		try {
			fetcher.auth.post(
				`election/voter/${voter._id}/delete`,
				user
			);

			const updatedList = votersList.filter(e => e._id !== voter._id);
			setVotersList(updatedList);
			Toast.success('The participant was removed successfully');
		} catch (error) {
			Toast.error("There was an error removing the participant");
		}
	}

	function procList(participantsAuthType) {
		if (!participantsList) {
			Toast.warning("You did not enter any participants");
			return;
		}

		const voters = participantsList.split(',').map(v => v.trim());
		let invalidContactFound = false;

		if (participantsAuthType === 'email') {
			let emailList = voters
				.map(email => {
					if (isValidEmail(email)) return email;
					invalidContactFound = true
					return
				});

			if (invalidContactFound) {
				Toast.warning("One or more emails not properly formatted");
				return;
			}

			setAddParticipantsModalOpen(false);
			const emailVoterList = [...new Set(emailList)];
			sendListToDB(emailVoterList);

		} else if (participantsAuthType === 'phone') {
			const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
			const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;

			let phoneList = voters
				.map(phoneno => {
					if (phoneno.match(countryCodePattern)) return phoneno;
					if (phoneno.match(phoneNumberPattern)) return phoneno.replace(phoneNumberPattern, '234$2');

					invalidContactFound = true;
					return;
				});

			if (invalidContactFound) {
				Toast.warning("One or more phone numbers not properly formatted");
				return;
			}

			setAddParticipantsModalOpen(false);
			const phoneVoterList = [...new Set(phoneList)];
			sendListToDB(phoneVoterList);
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

		const emailForUpdate = String(updatedParticipantInfo).trim();

		if (!isValidEmail(emailForUpdate)) {
			Toast.error("Email is invalid");
			return;
		}

		setUpdateParticipantModal(false);

		try {
			const response = await fetcher.auth.patch(
				`election/voter/update`,
				{
					emailAddr: emailForUpdate,
					participantId: participant._id,
					electionId: election._id
				},
				user
			);

			setVotersList((prev) =>
				prev.map((v) => v._id === response._id ? response : v)
			);
			Toast.success("Participant was updated");
		} catch (error) {
			Toast.warning("Could not update the participant");
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
			const response = await fetcher.auth.patch(
				`election/voter/update`,
				{
					phoneNo: validatedPhoneNo,
					participantId: participant._id,
					electionId: election._id
				},
				user
			);

			setUpdateParticipantModal(false);
			setVotersList((prev) =>
				prev.map((v) => v._id === response._id ? response : v)
			);
			Toast.success("Participant was updated");
		} catch (error) {
			Toast.warning("Could not update the voter");
		}
	}

	async function endElection() {
		if (hasEnded) {
			Toast.warning("The election has already ended");
			return;
		}

		try {
			const endEvent = await fetcher.auth.put(
				`elections/${election._id}/end`,
				user
			)

			setEndElectionModalOpen(false);

			setElection(prev => ({
				...prev,
				endDate: new Date(endEvent?.new_date ?? prev.endDate)
			}));
			Toast.success("Election was ended successfully");
		} catch (error) {
			Toast.error("Could not end the election");
		}
	}

	function checkPositionExists(e) {
		if (positionsList.length < 1) {
			e.preventDefault();
			Toast.warning("You need to add a position first");
		}
	}

	useEffect(() => {
		if (election.type !== 'Closed' || !votersList || votersList.length === 0) {
			setVotersFiltered([]);
			return;
		}

		const searchLower = searchTerm.toLowerCase();

		if (election.userAuthType === 'email') {
			const filtered = votersList.filter((voter) => {
				const email = voter?.email || '';
				return email.toLowerCase().includes(searchLower);
			});
			setVotersFiltered(filtered);
		} else {
			const filtered = votersList.filter((voter) => {
				const phone = voter?.phoneNo || '';
				return phone.includes(searchTerm);
			});
			setVotersFiltered(filtered);
		}
	}, [election.type, election.userAuthType, votersList, searchTerm]);

	// ########################################%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	return (
		<div className="container">
			<div className="pos-detail-container">
				<div className="pos-heading-banner">
					<table className="table table-hover table-striped">
						<thead>
							<tr>
								<th>Election</th>
								<th>{election.title} <StatusBadge election={election} /></th>
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
									{votersFiltered.length < 1 ? (
										<p>No voters found</p>
									) : (
										votersFiltered.map(voter => (
											<li key={voter._id}>
												<div className='voter-info'>
													<span>{election.userAuthType === 'email' ? voter.email : voter.phoneNo}</span>
													{isPending && (
														<div className='voter-actions'>
															<button className='Button violet action-item'
																onClick={() => editParticipant(voter)}>Edit
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
																				<button className="Button mauve">Cancel</button>
																			</AlertDialog.Cancel>
																			<AlertDialog.Action asChild>
																				<button className="Button red" onClick={() => removeVoter(voter)}>Yes, remove</button>
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
									<button className='Button violet action-item' onClick={closeAddParticipant}>Close</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{endElectionModalOpen && (
					<div className="modal-overlay">
						<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
							<p><em>Are you sure you want to End this election. This cannot be undone!</em></p>
							<div className="action-btn-container">
								<button className='Button red action-item' onClick={endElection}>Yes, End it</button>
								<button className='Button violet action-item' onClick={() => setEndElectionModalOpen(false)}>No, JK</button>
							</div>
						</div>
					</div>
				)}



				{positionModalOpen && (
					<div className="modal-overlay">
						<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
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
						<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
							<span>Update participant info: <strong>{`${election.userAuthType == 'email' ? participant.email : participant.phoneNo}`}</strong></span>
							<br />
							<input
								type='text'
								id='updateparticipant'
								value={updatedParticipantInfo}
								onChange={(e) => { setUpdatedParticipantInfo(e.target.value) }}
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="action-btn-container" >
								{election.userAuthType == 'email' && <button className='Button violet action-item' onClick={patchVoterEmail}>Save</button>}
								{election.userAuthType == 'phone' && <button className='Button violet action-item' onClick={patchVoterPhone}>Save</button>}
								<button className='Button red action-item' onClick={() => setUpdateParticipantModal(false)}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{updatePositionModalOpen && (
					<div className="modal-overlay">
						<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
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
						<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
							<span>Enter list of participants for <strong>{`${election.title}`}</strong></span>
							<br />
							<textarea
								placeholder={`Enter/paste ${election.userAuthType == 'email' ? 'emails' : 'phone numbers'}. Seperate with commas`}
								id='phonenos'
								value={participantsList}
								className='block resize-none p-2.5 my-2.5'
								onChange={(e) => { setParticipantsList(e.target.value) }}
							/>
							<div className="action-btn-container">
								{election.userAuthType == 'email' ? <button className='Button violet action-item' onClick={() => procList('email')}>Add Emails</button>
									: <button className='Button violet action-item' onClick={() => procList('phone')}>Add Phone #s</button>}
								<button className='Button red action-item' onClick={() => setAddParticipantsModalOpen(false)}>Cancel</button>
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
