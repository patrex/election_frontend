import { Link, useParams } from 'react-router-dom';
import { useEventStatus } from '@/hooks/useEventStatus';

const ElectionActions = ({ election, openPostionModal, checkPositionExists, setAddParticipantsModalOpen, setViewUsersModal, setEndElectionModalOpen }) => {
	const params = useParams();
	const { isActive, 
		hasEnded, 
		isPending } = useEventStatus(new Date(election.startDate), new Date(election.endDate));

	return (
		<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
			{isPending && (
				<>
					<p>
						<button className='Button violet action-item' onClick={() => openPostionModal(election)}>
							Add Position
						</button>
					</p>
					{/* only show this button if the admin is going to add elections by himself */}
					{election.addCandidatesBy === "I will Add Candidates Myself" ? (
						<p>
							<Link
								to={`/election/${election._id}/addcandidate`}
								className='Button violet action-item no-underline'
								onClick={checkPositionExists}
							>
								Add Candidate
							</Link>
						</p>) : (
							<p>
								<Link
									to={`/user/${params.userId}/election/${election._id}/approveCandidates`}
									className='Button violet action-item no-underline'
								>
									Approve Candidates
								</Link>
							</p>
						)
					}
					{election.type === "Closed" && (
						<p>
							<button className='Button violet action-item' onClick={() => setAddParticipantsModalOpen(true)}>
								Add Voters
							</button>
						</p>
					)}
				</>
			)}
			{election.type === "Closed" && (
				<p>
					<button className='Button violet action-item' onClick={() => setViewUsersModal(true)}>
						View Voters
					</button>
				</p>
			)}
			
			{ isActive && (
				<p>
					<button className='Button red action-item' onClick={() => setEndElectionModalOpen(true)}>
						End This Election!
					</button>
				</p>
			)}
			{hasEnded && (
				<p>
					<Link to={`/election/${election._id}/results`} className='Button violet action-item no-underline'>
						View Results
					</Link>
				</p>
			)}
		</div>
	);
};

export default ElectionActions;
