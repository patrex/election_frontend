import { useState, useEffect, useContext } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import moment from "moment";
import Toast from "@/utils/ToastMsg";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AppContext } from "@/App";
import Countdown from "@/components/Countdown";
import StatusBadge from "@/components/StatusBadge";

import { fetcher } from "@/utils/fetcher";

export async function electionLoader({ params }) {
	try {
		const [election, positions, allCandidates] = await Promise.all([
			fetcher.get(`election/${params.id}`),
			fetcher.get(`election/${params.id}/positions`),
			fetcher.get(`election/${params.id}/candidates`)
		]);

		return [ election, positions, allCandidates]
	} catch (error) {
		console.error(error);
		return null;
	}
}


export default function Election() {
	const [e, p, c] = useLoaderData();
	const navigate = useNavigate();

	const [election, setElection] = useState(e);
	const [candidates, setCandidates] = useState(c || []);
	const [candidatesWorkingSet, setWorkingSet] = useState(candidates);


	const { voter } = useContext(AppContext);

	const [positions, setPositions] = useState(p);
	const [selectedPosition, setSelectedPosition] = useState("");

	const getEventStatus = (startDate, endDate) => {
		const now = new Date();
		return {
			isPending: now < startDate,
			hasEnded: now > endDate,
			isActive: now >= startDate && now <= endDate
		};
	};

	async function sendVote(candidate) {
		try {
			// fetch votes cast by this voter
			const userVotes = await fetcher.get(`election/${election._id}/${voter}/votes`);
			let userHasVoted = false;

			// let availablePositions = positions.map(p => p._id);
			const currentPosition = candidate.position; 

			let voteList = userVotes.votes || [];
			userHasVoted = voteList.includes(currentPosition);

			if (userHasVoted) return Toast.warning('You already voted for this position');
			
			await fetcher.post(
				`election/vote`,
				{
					election: election._id,
					candidate: candidate._id,
					voterId: voter,
					position: candidate.position
				})
			
			return Toast.success('Your vote has been recorded')
		} catch (error) {
			console.error(error);
			return Toast.warning(error);
		}
	}

	const handleChange = async (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected);
		// attempt to fetch candidates for selected position
		const candidatesFiltered = candidates.filter(c => c.position == selected);

		setWorkingSet(candidatesFiltered)
	}

	useEffect(() => {
		if (!voter) {
			Toast.warning("You need to register as a voter first")
			navigate(`/`)
		}
	}, [])

	// preset candidates to display to candidates in the first loaded positions
	// user overrides with their selection
	
	useEffect(() => {
		const { isPending, hasEnded } = getEventStatus(new Date(election.startDate), new Date(election.endDate));
		
		if (isPending || hasEnded) {
			if (isPending) Toast.info('Voting has not started');
			else if(hasEnded) Toast.info(`Voting has ended`)

			navigate('/')
		}
	}, [])

	return (
		<div className="main p-4">
			{/* Election Header Information */}
			<div className="max-w-6xl mx-auto p-4 lg:p-8 bg-gray-50 h-auto">
				{/* Header Section */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 flex justify-between items-center text-white">
						<h1 className="text-2xl font-bold">{election.title}</h1>
						<StatusBadge election={election} />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
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
						<div className="space-y-1">
							<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time left</p>
							<p className="text-gray-700 font-medium"><Countdown targetDate={election.endDate}/></p>
						</div>
					</div>
				</div>
			</div>

			<hr className="my-2" />

			{/* Position Selection */}
			{positions.length ?  (
				<div className="election-container">
					<section>
						<div className="mb-6">
							<label htmlFor="position-select" className="block text-sm font-medium mb-2">Select a Position</label>
							<select
								id="position-select"
								name="position"
								className="form-select form-select-lg w-full max-w-md p-2 border rounded shadow-sm bg-gray-100 border border-gray-300 text-gray-900"
								value={selectedPosition}
								onChange={handleChange}
							>
								<option value="" disabled>Choose a position...</option>
								{positions.map((position) => (
									<option key={position._id} value={position.position}>
										{position.position}
									</option>
								))}
							</select>
						</div>
					</section>

					{/* Candidates Grid */}
					<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{candidatesWorkingSet?.length > 0 ? (
								candidatesWorkingSet.filter(c => c.isApproved)
								.map((candidate) => (
									<div className="vote-card border rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow" key={candidate._id}>
										<div className="flex items-center p-4 gap-4">
											<img
												src={candidate.imgUrl}
												className="w-24 h-24 object-cover rounded-full border-2 border-gray-100"
												alt={`${candidate.firstname} profile`}
											/>

											<div className="vote-card-desc flex-1">
												<h2 className="text-lg font-bold text-gray-800">
													{`${candidate.firstname} ${candidate.lastname}`}
												</h2>
												<h5 className="text-slate-500 mb-3">{selectedPosition}</h5>

												<AlertDialog.Root>
													<AlertDialog.Trigger asChild>
														<button className="bg-violet-600 shadow-md text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
															Vote
														</button>
													</AlertDialog.Trigger>

													<AlertDialog.Portal>
														<AlertDialog.Overlay className="AlertDialogOverlay fixed inset-0 bg-black/40 backdrop-blur-sm" />
														<AlertDialog.Content className="AlertDialogContent fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[90vw] max-w-md">
															<AlertDialog.Title className="AlertDialogTitle text-lg font-bold border-b pb-2">
																Confirm Your Vote
															</AlertDialog.Title>

															<AlertDialog.Description className="AlertDialogDescription my-4 text-gray-600">
																{`Are you sure you want to vote for ${candidate.firstname} ${candidate.lastname} for ${selectedPosition}? This action cannot be undone.`}
															</AlertDialog.Description>

															<div className="flex justify-end gap-3 mt-6">
																<AlertDialog.Cancel asChild>
																	<button className="Button mauve bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
																		Cancel
																	</button>
																</AlertDialog.Cancel>
																<AlertDialog.Action asChild>
																	<button
																		className="Button red px-4 py-2 hover:bg-red-700"
																		onClick={() => sendVote(candidate)}
																	>
																		Yes, cast vote
																	</button>
																</AlertDialog.Action>
															</div>
														</AlertDialog.Content>
													</AlertDialog.Portal>
												</AlertDialog.Root>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="col-span-full py-10 text-center text-gray-400">
									No candidates found for this position.
								</div>
							)}
					</section>
				</div>
			) : (
				<div className="col-span-full py-10 text-center text-gray-400">
					No positions found for this election
				</div>
			)}
		</div>
	);
}
