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

const ApproveCandidates = () => {
	const { p, c } = useLoaderData();

	const [positions] = useState(p || []);
	const [candidates, setCandidates] = useState(c || []);
	const [alertOpen, setAlertOpen] = useState(false);

	const { user } = useContext(AppContext);

	async function approveCandidate(candidate) {

	}

	async function removeCandidate(candidate) {
		try {
			await fetcher.auth.delete(`election/${election._id}/candidate/${candidate._id}/delete`, user)
			setCandidates(prev => prev.filter(c => c._id !== candidate._id));
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
													<button className="Button violet hover:bg-indigo-700" onClick={() => approveCandidate(candidate)}>Approve</button>
													<button className="Button red hover:bg-red-200" onClick={() => setAlertOpen(true)}>Remove</button>
												</div>

												{alertOpen && (
													<div className="modal-overlay">
														<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
															<h3>Remove Candidate?</h3>
															<div className='p-2'>
																<p>Are you sure you want to remove {`${candidate.firstname} ${candidate.lastname}`}</p>
															</div>
															<div className="action-btn-container">
																<button className='Button violet action-item' onClick={() => setAlertOpen(false)}>Cancel</button>
																<button className='Button red action-item' onClick={() => removeCandidate(candidate)}>Delete</button>
															</div>
														</div>
													</div>
												)}
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
		</div>

	);
}

export default ApproveCandidates;