import { useState, useEffect, useContext } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import moment from "moment";
import Toast from "@/utils/ToastMsg";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AppContext } from "@/App";
import Countdown from "@/components/Countdown";
import StatusBadge from "@/components/StatusBadge";

import { fetcher, FetchError } from "@/utils/fetcher";

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
			<div className="max-w-6xl mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen">
				{/* Header Section */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
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
				<>
					<section className="election-container">
						<div className="mb-6">
							<label htmlFor="position-select" className="block text-sm font-medium mb-2">Select a Position</label>
							<select
								id="position-select"
								name="position"
								className="form-select form-select-lg w-full max-w-md p-2 border rounded shadow-sm"
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

					<section className="py-6">
					{/* Candidates Grid: 1 col on mobile, 2 on desktop */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{candidatesWorkingSet?.length > 0 ? (
							candidatesWorkingSet
								.filter((c) => c.isApproved)
								.map((candidate) => (
								<div 
									key={candidate._id}
									className="relative group bg-white rounded-2xl p-5 flex items-center gap-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all duration-300"
								>
									{/* Image Section with a 'friendly' ring */}
									<div className="relative shrink-0">
									<div className="absolute -inset-1 bg-gradient-to-tr from-violet-500 to-indigo-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
									<img
										src={candidate.imgUrl}
										className="relative w-24 h-24 md:w-28 md:h-28 object-cover rounded-full bg-white p-1"
										alt={`${candidate.firstname} ${candidate.lastname}`}
									/>
									</div>

									{/* Candidate Info */}
									<div className="flex-1 min-w-0">
									<span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-600 mb-1">
										Candidate
									</span>
									<h2 className="text-xl font-bold text-slate-800 truncate">
										{candidate.firstname} {candidate.lastname}
									</h2>
									<p className="text-slate-500 text-sm font-medium mb-4 flex items-center gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
										{selectedPosition}
									</p>

									{/* Interaction Logic - Keeping your AlertDialog intact */}
									<AlertDialog.Root>
										<AlertDialog.Trigger asChild>
											<button className="Button violet bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
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
													{`Are you sure you want to vote for ${candidate.firstname} ${candidate.lastname} as ${selectedPosition}? This action cannot be undone.`}
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

									{/* Subtle decorative element */}
									<div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
									<svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-slate-900">
										<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12L11 14L15 10M21 12C21 17.5228 16.5228 22 11 22C5.47715 22 1 17.5228 1 12C1 6.47715 5.47715 2 11 2C16.5228 2 21 6.47715 21 12Z"/>
									</svg>
									</div>
								</div>
								))
							) : (
							<div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
								<p className="text-slate-400 font-medium text-lg">No candidates found for this position.</p>
								<p className="text-slate-400 text-sm">Please check back later or select a different category.</p>
							</div>
							)}
						</div>
					</section>
				</>
			) : (
				<div className="col-span-full py-10 text-center text-gray-400">
					No positions found for this election
				</div>
			)}
		</div>
	);
}
