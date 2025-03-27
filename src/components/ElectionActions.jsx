import { Link, useParams } from 'react-router-dom';

const ElectionActions = ({ election, isActive, hasEnded, openPostionModal, checkPositionExists, setAddParticipantsModalOpen, setViewUsersModal, setEndElectionModalOpen }) => {
	const params = useParams();
	return (
		<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
			{(!isActive && !hasEnded) && (
				<>
					<p>
						<button className='Button violet action-item' onClick={() => openPostionModal(election)}>
							Add Position
						</button>
					</p>
					<p>
						<Link
							to={`/user/${params.userId}/election/${election._id}/addcandidate`}
							className='Button violet action-item no-underline'
							onClick={checkPositionExists}
						>
							Add Candidate
						</Link>
					</p>
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
			{(isActive && !hasEnded) && (
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
