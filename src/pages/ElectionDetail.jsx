import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from '@/App';
import ElectionActions from '@/components/ElectionActions';
import DeleteDialog from '@/components/DeleteDialog';
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
		return null;
	}
}

function ElectionDetail() {
	const [loaderElection, positions, voters] = useLoaderData();

	const [election, setElection] = useState(loaderElection);
	const [positionsList, setPositionsList] = useState(positions);
	const [votersList, setVotersList] = useState(voters || []);
	const [votersFiltered, setVotersFiltered] = useState([]);

	const { user } = useContext(AppContext);
	const [modalConfig, setModalConfig] = useState({ open: false, action: null })

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
			console.log(error);
			return Toast.error('An unexpected error occurred');
		}
	}

	async function sendListToDB(voterlist) {
		console.log(voterlist);
		
		try {
			const votersToDb = await fetcher.auth.post(
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
			Toast.success(`${votersToDb.voters.length} contacts were added`);
			setParticipantsList('');
		} catch (error) {
			console.error(error);
			return Toast.error("An error occurred. Try again")
		}
	}

	async function removeVoter(voter) {
		try {
			await fetcher.auth.post(
				`election/voter/${voter._id}/delete`,
				{},
				user
			);

			const updatedList = votersList.filter(e => e._id !== voter._id);
			setVotersList(updatedList);
			Toast.success('The participant was removed successfully');
		} catch (error) {
			return Toast.error("There was an error removing the participant");
		}
	}

	const triggerRemoveVoter = (voter) => {
		setModalConfig({
			open: true,
			action: () => removeVoter(voter) // Pass the pre-wrapped async function
		});
	}

	function procList() {
		if (!participantsList) {
			Toast.warning("You did not enter any participants");
			return;
		}

		const participantsAuthType = election.userAuthType

		const voters = participantsList.split(',').map(v => v.trim());
		const workingList = [...new Set(voters)];
		let listToDb = []
		const invalidContacts = []

		if (participantsAuthType === 'email') {
			listToDb = workingList
				.map(email => {
					if (isValidEmail(email)) return email;
					invalidContacts.push(email)
				});
		} else if (participantsAuthType === 'phone') {
			const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)?(\d{10})$/;

			listToDb = workingList
				.map(phoneno => {
					const match = phoneno.match(NIGERIAN_PHONE_REGEX);

					if (match) {
						// The 10-digit number part is captured in match[1]
						const tenDigits = match[1];

						// Reformat to standard 234xxxxxxxxxx (13 digits total)
						return `234${tenDigits}`;
					}
					invalidContacts.push(phoneno);
				})
		}

		if (invalidContacts.length) {
			Toast.warning(`${invalidContacts.length} contacts were not properly formatted`);
			console.log(invalidContacts);
		}

		setAddParticipantsModalOpen(false);
		sendListToDB(listToDb);
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
				{},
				user
			)

			setEndElectionModalOpen(false);

			setElection(prev => ({
				...prev,
				endDate: new Date(endEvent?.new_date ?? prev.endDate)
			}));
			return Toast.success("Election was ended successfully");
		} catch (error) {
			Toast.error("Could not end the election");
		}
	}

	function checkPositionExists(e) {
		if (positionsList.length < 1) {
			e.preventDefault();
			return Toast.warning("You need to add a position first");
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

	// ########################################

	return (
		<div className="max-w-6xl mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen">
			{/* Header Section */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
				<div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 flex justify-between items-center text-white">
					<h1 className="text-2xl font-bold">{election.title}</h1>
					<StatusBadge election={election} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
					<div className="space-y-1">
						<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created On</p>
						<p className="text-gray-700 font-medium">{moment(election.dateCreated).format('LLL')}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Starting On</p>
						<p className="text-gray-700 font-medium">{moment(election.startDate).format('LLL')}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ending On</p>
						<p className="text-gray-700 font-medium">{moment(election.endDate).format('LLL')}</p>
					</div>
				</div>

				<div className="px-6 pb-6 border-t border-gray-100 pt-4">
					{/* Add 'overflow-x-auto' for mobile swiping or 'flex-wrap' for wrapping buttons */}
					<div className="flex flex-nowrap md:flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
						<ElectionActions
							election={election}
							openPostionModal={openPostionModal}
							checkPositionExists={checkPositionExists}
							setAddParticipantsModalOpen={setAddParticipantsModalOpen}
							setViewUsersModal={setViewUsersModal}
							setEndElectionModalOpen={setEndElectionModalOpen}
						/>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-8">
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h2 className="text-lg font-bold mb-4 text-gray-800">Available Positions</h2>
					<PositionsBox
						list_of_positions={positionsList}
						isPending={isPending}
						editPosition={editPosition}
						removePosition={removePosition}
					/>
				</div>
			</div>

			{/* --- MODALS SECTION --- */}

			{/* View/Search Participants Modal */}
			{viewUsersModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
						<div className="p-6 border-b border-gray-100">
							<h3 className="text-xl font-bold text-gray-800">Registered Participants</h3>
							<input
								type="text"
								placeholder="Search by name, email or phone..."
								className="mt-4 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="flex-1 overflow-y-auto p-6">
							{votersFiltered.length < 1 ? (
								<div className="text-center py-10 text-gray-400">No voters found</div>
							) : (
								<ul className="space-y-2">
									{votersFiltered.map(voter => (
										<li key={voter._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-100">
											<span className="font-medium text-gray-700">
												{election.userAuthType === 'email' ? voter.email : voter.phoneNo}
											</span>
											{isPending && (
												<div className="flex gap-2">
													<button onClick={() => {editParticipant(voter); setViewUsersModal(false)}} className="Button violet rounded-lg hover:bg-violet-200 font-semibold">Edit</button>
													<button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => triggerRemoveVoter(voter)}>
														<i className="bi bi-trash3"></i>
													</button>

													<DeleteDialog
														isOpen={modalConfig.open}
														onClose={() => setModalConfig({ ...modalConfig, open: false })}
														onConfirm={modalConfig.action}
														title="Remove voter"
														description="This will permanently remove the voter and their contact info"
														confirmText={'Yes, remove'}
													/>		
												</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>

						<div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center gap-4">
							<button 
								className="Button violet border border-gray-200 text-gray-700 font-bold rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors" 
								onClick={closeAddParticipant}
							>
							Close
							</button>

							<span className="text-sm font-medium text-gray-500">
								{votersFiltered.length} users registered
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Modern Add Position Modal */}
			{positionModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
						<h3 className="text-xl font-bold mb-2">New Position</h3>
						<p className="text-sm text-gray-500 mb-6">Enter a new position for <span className="text-violet-600 font-semibold">{election.title}</span></p>
						<input
							type='text'
							placeholder="e.g. Secretary General"
							value={newPosition}
							onChange={handlePositionChange}
							className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none mb-6"
						/>
						<div className="flex gap-4">
							<button className="Button violet rounded-xl hover:bg-violet-700" onClick={handleAddPosition}>Add Position</button>
							<button className="Button violet text-gray-600 font-bold rounded-xl hover:bg-gray-200" onClick={closePositionModal}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			{endElectionModalOpen && (
				<div className="modal-overlay">
					<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
						<p>Are you sure you want to End this election. This cannot be undone!</p>
						<div className="action-btn-container">
							<button className='Button red action-item' onClick={endElection}>Yes, End it</button>
							<button className='Button violet action-item' onClick={() => setEndElectionModalOpen(false)}>No, Cancel</button>
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


			{/* Bulk Participant Modal */}
			{addParticipantsModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-2xl">
						<h3 className="text-xl font-bold mb-4">Add Participants</h3>
						<textarea
							placeholder={`Paste ${election.userAuthType === 'email' ? 'emails' : 'phone numbers'} separated by commas...`}
							value={participantsList}
							onChange={(e) => setParticipantsList(e.target.value)}
							className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none mb-6 font-mono text-sm"
						/>
						<div className="flex gap-4">
							<button className="Button violet bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700" onClick={procList}>
								Add {election.userAuthType === 'email' ? 'Emails' : 'Phones'}
							</button>
							<button className="Button violet text-gray-600 font-bold rounded-xl hover:bg-gray-200" onClick={() => setAddParticipantsModalOpen(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ElectionDetail;
