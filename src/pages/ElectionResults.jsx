import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher, FetchError } from '@/utils/fetcher';

export async function resultsLoader({ params }) {

	const [election, positions, candidates, votes] = await Promise.all([
		fetcher.get(`election/${params.id}`),
		fetcher.get(`election/${params.id}/positions`),
		fetcher.get(`election/${params.id}/candidates`),
		fetcher.get(`election/${params.id}/votes`),
	]);

	return [election, positions, candidates, votes];
}

function ElectionResults() {
	const [election, positions, candidates, votes] = useLoaderData();

	const [votesList, setVotesList] = useState([])
	const [candidatesList, setCandidatesList] = useState([])
	const [selectedPosition, setSelectedPosition] = useState("");

	const [data, setData] = useState([]);

	const handleChange = (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected)

		const position = positions.find(pos => pos.position === selected);
		if (!position) return;

		const filteredCandidates = candidates.filter(candidate => candidate.position == position._id)
		const filteredVotes = votes.filter(vote => vote.position === position._id)

		setCandidatesList(filteredCandidates)
		setVotesList(filteredVotes)
	}

	useEffect(() => {
		if (election?.endDate && moment(election.endDate).isAfter(new Date()))
			setEventException(true)
	}, [election.endDate])

	useEffect(() => {
		const updatedData = candidatesList.map(candidate => ({
			imgUrl: candidate.imgUrl,
			id: candidate._id,
			candidateName: `${candidate.firstname} ${candidate.lastname}`,
			votes: votesList.filter(vote => vote.candidateId === candidate._id).length
		})).sort((a, b) => b.votes - a.votes)

		// Identify the winner (first in sorted list)
		const winnerId = updatedData.length > 0 ? updatedData[0].id : null;

		setData(updatedData.map(candidate => ({
			...candidate,
			isWinner: candidate.id === winnerId
		})));
	}, [selectedPosition, candidatesList, votesList])

	const totalVotes = useMemo(() => votesList.length, [votesList])

	return (
		<>
			<div className="max-w-4xl mx-auto p-6 space-y-6 bg-slate-50 min-h-screen antialiased text-slate-800">

				{/* Header Info Card */}
				<header className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="bg-slate-900 px-6 py-4">
						<h1 className="text-xl font-bold text-white tracking-tight">{election.title}</h1>
					</div>
					<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
						<div className="space-y-3">
							<div>
								<span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Description</span>
								<p className="mt-1 text-slate-600 leading-relaxed">{election.desc}</p>
							</div>
							<div>
								<span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Organizer</span>
								<p className="mt-0.5 font-medium">{election.owner.name}</p>
							</div>
						</div>
						<div className="space-y-3 md:text-right border-t md:border-t-0 pt-4 md:pt-0">
							<div>
								<span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Voting Period</span>
								<p className="mt-1 font-medium text-slate-700">
									{moment(election.startDate).format('MMM D')} — {moment(election.endDate).format('MMM D, YYYY')}
								</p>
								<div className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
									<span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
									Results Finalized
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content Area */}
				<main className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

					{/* Controls */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
						<label className="w-full md:w-64">
							<span className="text-xs font-bold text-slate-500 uppercase block mb-2">Filter by Position</span>
							<select
								value={selectedPosition}
								onChange={handleChange}
								className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-slate-700 font-medium"
							>
								{positions.map((p) => (
									<option key={p.position} value={p.position}>{p.position}</option>
								))}
							</select>
						</label>
						<div className="text-right">
							<span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Position Votes</span>
							<span className="text-3xl font-black text-indigo-600 tracking-tighter">{totalVotes.toLocaleString()}</span>
						</div>
					</div>

					{/* Results List */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold border-b pb-2 text-slate-700">Current Standing: {selectedPosition}</h3>

						<div className="divide-y divide-slate-100">
							{data.map((datum) => {
								const percentage = ((datum.votes / totalVotes) * 100).toFixed(1);

								return (
									<div key={datum.id} className="group py-5 transition-all duration-200">
										<div className="flex items-center gap-5">
											<div className="relative flex-shrink-0">
												<img
													src={datum.imgUrl}
													alt={datum.candidateName}
													className={`w-14 h-14 rounded-full object-cover ring-2 ${datum.isWinner ? 'ring-indigo-500 shadow-lg' : 'ring-slate-100 shadow-sm'}`}
												/>
												{datum.isWinner && (
													<div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
														<span className="text-sm">🏆</span>
													</div>
												)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between mb-1">
													<h4 className={`text-base font-bold truncate ${datum.isWinner ? 'text-indigo-900' : 'text-slate-800'}`}>
														{datum.candidateName}
														{datum.isWinner && (
															<span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Winner</span>
														)}
													</h4>
													<span className="text-sm font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-md">{datum.votes} votes</span>
												</div>

												{/* Animated Progress Bar */}
												<div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
													<div
														className={`h-full transition-all duration-700 ease-out rounded-full ${datum.isWinner ? 'bg-indigo-600' : 'bg-slate-400'}`}
														style={{ width: `${percentage}%` }}
													/>
												</div>
												<div className="flex justify-between mt-1.5 px-0.5">
													<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{percentage}% of tally</span>
													{datum.isWinner && <span className="text-[11px] font-bold text-indigo-600 italic">Leading by {datum.votes - 310}</span>}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</main>

				<footer className="text-center text-xs text-slate-400">
					Results generated on {moment().format('MMMM Do YYYY, h:mm a')}
				</footer>
			</div>
		</>
	);
}

export default ElectionResults;
