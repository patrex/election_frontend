import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher } from '@/utils/fetcher';
import { Trophy, Medal, Users, ChevronRight, CheckCircle, Share2, Printer, Copy, Check, Info, BarChart3, Filter, ChevronDown } from 'lucide-react';

export async function resultsLoader({ params }) {
	try {
		const [election, results, positions] = await Promise.all([
			fetcher.get(`election/${params.id}`),
			fetcher.get(`results/${params.id}`),
			fetcher.get(`election/${params.id}/positions`)
		])

		//results potentially contains: results.data for the total results
		//and results.winners for the first three winners
		return [election, results, positions];
	} catch (error) {
		console.error(error);
		return null
	}
}

export default function ElectionResults() {
	const [election, resultsData, positions] = useLoaderData();

	const [selectedPosition, setSelectedPosition] = useState('');
	const allResults = resultsData.data || [];	// Extracting data from your API response structure
	const topThree = resultsData.winners || [];
	const [resultsWorkingSet, setResulstsWorkingSet] = useState([]);
	const [topThreeWorkingSet, setTopThreeWorkingSet] = useState([]);

	useEffect(() => {
		const filtered = allResults.filter(v => v.position == selectedPosition);
		setResulstsWorkingSet(filtered);
		
		const top3Filtered = filtered.slice(0, 3);
		setTopThreeWorkingSet(top3Filtered);
	}, [selectedPosition])



	return (
		<div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">

			{/* Header & Filter Section */}
			<header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
					<p className="text-gray-500">Live updates on current standings</p>
				</div>

				<div className="select-ctrl">
					{positions.length > 0 ? (
						<select
							name="positions"
							id="trusteefox"
							onChange={(e) => setSelectedPosition(e.target.value)}
							value={selectedPosition}
							className="w-full md:w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						>
							{positions.map((p) => (
								<option key={p._id} value={p.position}>{p.position}</option>
							))}
						</select>
					) : (
						<div className="text-sm text-gray-400 italic">No positions found</div>
					)}
				</div>
			</header>

			<main className="space-y-12">
				{/* Top Winners Podium Area */}
				<section className="winners-votes">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
						{topThree.map((v, index) => (
							<div
								key={v._id || index}
								className={`relative group bg-white p-6 rounded-2xl shadow-sm border-t-4 transition-all hover:shadow-md
                  								${index === 0 ? 'border-yellow-400 order-first md:order-none scale-105 z-10' : 'border-gray-200'}`}
							>
								{/* Rank Badge Icon */}
								<div className="absolute -top-5 left-1/2 -translate-x-1/2">
									{index === 0 ? <Trophy className="text-yellow-500 w-10 h-10" /> : <Medal className="text-gray-400 w-8 h-8" />}
								</div>

								<div className="flex flex-col items-center">
									<div className="relative mb-4">
										<img
											src={v.imgrUrl}
											alt={v.candidateName}
											className={`rounded-full object-cover border-4 shadow-sm ${index === 0 ? 'w-32 h-32 border-yellow-100' : 'w-24 h-24 border-gray-100'}`}
										/>
										<span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
											#{index + 1}
										</span>
									</div>

									<h3 className="text-xl font-bold text-gray-800">{v.candidateName}</h3>
									<p className="text-blue-600 font-medium text-sm uppercase tracking-wider">{v.position}</p>

									<div className="mt-4 bg-gray-50 w-full rounded-xl py-3 px-4 flex justify-between items-center">
										<span className="text-gray-500 text-sm">Total Votes</span>
										<span className="text-lg font-bold text-gray-900">{v.votes.toLocaleString()}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* All Results List */}
				<section className="all-votes bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="p-6 border-b border-gray-100 bg-gray-50/50">
						<h2 className="font-semibold text-gray-700 uppercase tracking-tighter text-sm">Detailed Breakdown</h2>
					</div>

					<div className="divide-y divide-gray-100">
						{allResults.length > 0 ? (
							allResults.map((v) => (
								<div key={v._id} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
									<img
										src={v.imgUrl}
										className="w-12 h-12 rounded-lg object-cover mr-4"
										alt={v.candidateName}
									/>
									<div className="flex-grow">
										<h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{v.candidateName}</h4>
										<p className="text-xs text-gray-500">{v.position}</p>
									</div>
									<div className="text-right">
										<span className="text-sm font-bold text-gray-900">{v.votes}</span>
										<p className="text-[10px] text-gray-400 uppercase">Votes</p>
									</div>
								</div>
							))
						) : (
							<div className="p-10 text-center text-gray-400">No data available</div>
						)}
					</div>
				</section>
			</main>
		</div>
	)
}
