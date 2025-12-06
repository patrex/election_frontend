import { useState, useContext} from 'react';
import { useLoaderData } from 'react-router-dom';
import { AppContext } from '@/App';
import Toast from '@/utils/ToastMsg';
import { fetcher, FetchError } from '@/utils/fetcher';
import NoData from '@/components/NoData';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg'

export async function approveCandidatesLoader({ params }) {
	try {
		const [p, c] = await Promise.all([
			fetcher.get(`election/${params.id}/positions`),
			fetcher.get(`election/${params.id}/candidates/addedself`)
		])

		return { p, c }
	} catch (error) {
		console.error("There was a problem fetching positions");
		return null;
	}
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, candidate }) => {
	if (!isOpen || !candidate) return null;
    
	const isApproval = action === 'approve';
	const actionText = isApproval ? 'Approve' : 'Remove';
	const candidateName = `${candidate.firstname} ${candidate.lastname}`;
	const buttonClass = isApproval ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
    
	return (
	    // Modal Overlay (The backdrop)
	    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99] p-4 overflow-y-auto">
		
		{/* Modal Content */}
		<div className="
		    w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3
		    p-6 rounded-lg shadow-2xl relative bg-white z-10 
		    max-h-[90vh] overflow-y-auto mx-auto
		">
		    <h3 className={`text-xl font-bold mb-4 ${isApproval ? 'text-green-700' : 'text-red-700'}`}>
			Confirm {actionText} Action
		    </h3>
		    <p className="text-gray-700 mb-6">
			Are you sure you want to {actionText.toLowerCase()} the candidate {candidateName}
		    </p>
    
		    <div className="flex justify-end space-x-3">
			<button
			    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
			    onClick={onClose}
			>
			    Cancel
			</button>
			<button
			    className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors ${buttonClass}`}
			    onClick={onConfirm}
			>
			    Yes, {actionText}
			</button>
		    </div>
		</div>
	    </div>
	);
};

const ApproveCandidates = () => {
	const { p, c } = useLoaderData();

	const [positions] = useState(p || []);
	const [candidates, setCandidates] = useState(c || []);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalAction, setModalAction] = useState(null);
	const [selectedCandidate, setSelectedCandidate] = useState(null);

	const openModal = (candidate, action) => {
		setSelectedCandidate(candidate);
		setModalAction(action);
		setIsModalOpen(true);
	};

	const handleConfirm = () => {
		if (!selectedCandidate || !modalAction) return;
	
		if (modalAction === 'approve') {
		    approveCandidate()
		    console.log(`Candidate Approved: ${selectedCandidate._id}`);
		} else if (modalAction === 'remove') {
		    removeCandidate();
		    console.log(`Candidate Removed: ${selectedCandidate._id}`);
		}
	
		// Close and reset modal state after action
		setIsModalOpen(false);
		setSelectedCandidate(null);
		setModalAction(null);
	};

	const { user } = useContext(AppContext);

	async function approveCandidate() {

	}

	async function removeCandidate() {
		try {
			await fetcher.auth.delete(`election/${election._id}/candidate/${selectedCandidate._id}/delete`, user)
			setCandidates(prev => prev.filter(c => c._id !== selectedCandidate._id));
			Toast.success('Candidate was removed');
		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 500) {
					Toast.warning("There was an unexpected error");
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('There was an error removing the candidate');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		}
	}

	return (

		<div
			className="max-w-4xl mx-auto space-y-8 p-4"
		>
			<h2 className="text-2xl font-bold mb-6 border-b pb-2">
				Candidates for Approval
			</h2>

			{positions.length > 0 ? (
				positions.map(p => (
					<div
						key={p._id}
						className="PositionCard p-6 border border-gray-200 rounded-xl shadow-lg bg-white" // Position Card Styling
					>
						{/* Position Title Styling */}
						<h3 className="text-xl font-semibold text-indigo-700 mb-2 border-b pb-1">
							{p.position}
						</h3>

						{candidates.length > 0 && (
							<ul className="mt-6 space-y-4">
								{candidates.some(candidate => candidate.position === p._id) ? (
									candidates.filter(candidate => candidate.position === p._id)
										.map((candidate) => (
											<li
												key={candidate._id}
												className="flex items-center justify-between 
														p-4 bg-gray-50 rounded-md border border-gray-200 
														hover:bg-gray-100 transition-colors"
											>
												{/* Left side: Avatar and Name */}
												<div className="flex items-center space-x-3">
													<div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
														<img
															src={candidate.imgUrl}
															alt="Candidate Image"
															className="w-full h-full object-cover object-center"
														/>
													</div>
													<span className="CandidateName text-lg font-medium text-gray-800">
														{`${candidate.firstname} ${candidate.lastname}`}
													</span>
												</div>

												<div className="ActionsOrStatus flex space-x-3 ml-4">
													<button className="Button violet hover:bg-indigo-700" onClick={() => openModal(candidate, 'approve')}>Approve</button>
													<button className="Button red hover:bg-red-200" onClick={() => openModal(candidate, 'remove')}>Remove</button>
												</div>
											</li>
										))
								) : (<p className="mt-4 text-gray-500 italic">No candidates have applied for this position yet.</p>)}
							</ul>
						)}
					</div>
				))
			) : (
				<NoData image={noDataGraphic} message='No positions yet for this election' />
			)}

			<ConfirmationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleConfirm}
				action={modalAction}
				candidate={selectedCandidate}
			/>
		</div>

	);
}

export default ApproveCandidates;