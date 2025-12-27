import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher, FetchError } from '@/utils/fetcher';
import { Trophy, Medal, Users, ChevronRight, CheckCircle, Share2, Printer, Copy, Check, Info, BarChart3 } from 'lucide-react';

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

	const [selectedPosition, setSelectedPosition] = useState('all');
	const allResults = resultsData.data || [];	// Extracting data from your API response structure
	const topThree = resultsData.winners || [];

	// 2. Memoized filtering for performance
	const filteredPositions = useMemo(() => {
		if (selectedPosition === 'all') {
			return positions.map(pos => ({
				...pos,
				candidates: allResults.filter(r => r.position === pos.name || r.position === pos._id)
			}));
		}
		return positions
			.filter(pos => pos._id === selectedPosition || pos.name === selectedPosition)
			.map(pos => ({
				...pos,
				candidates: allResults.filter(r => r.position === pos.name || r.position === pos._id)
			}));
	}, [selectedPosition, positions, allResults]);

	// 3. Dynamic Stats based on selection
	const totalVotesCast = useMemo(() => {
		const relevantResults = selectedPosition === 'all'
			? allResults
			: allResults.filter(r => r.position === selectedPosition);
		return relevantResults.reduce((acc, curr) => acc + curr.votes, 0);
	}, [selectedPosition, allResults]);

	// Grouping results by position for a cleaner UI
	const groupedResults = positions.map(pos => ({
		...pos,
		candidates: allResults.filter(r => r.position === pos.name || r.position === pos._id)
	}));

	return (
		<div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{election.title} - Live Dashboard</h1>
          
          {/* CONTROL BAR */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">Filter Race:</span>
            </div>
            
            <div className="relative min-w-[250px]">
              <select 
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full appearance-none bg-slate-700 border border-slate-600 text-white py-2 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Positions</option>
                {positions.map(pos => (
                  <option key={pos._id} value={pos.name}>{pos.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
            </div>

            <div className="ml-auto flex gap-6">
              <div className="text-right">
                <p className="text-slate-400 text-xs uppercase">Votes Counted</p>
                <p className="text-xl font-mono font-bold text-blue-400">{totalVotesCast.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 gap-8">
          {filteredPositions.map((pos) => (
            <div key={pos._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">{pos.name}</h3>
                  <p className="text-sm text-gray-500">Official Standings</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-bold">
                  {pos.candidates.length} Candidates
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-8">
                  {pos.candidates.map((candidate, idx) => {
                    const totalPosVotes = pos.candidates.reduce((acc, curr) => acc + curr.votes, 0);
                    const percentage = totalPosVotes > 0 ? ((candidate.votes / totalPosVotes) * 100).toFixed(1) : 0;

                    return (
                      <div key={candidate._id} className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                                <img 
                                    src={candidate.imgUrl || "/api/placeholder/50/50"} 
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                    alt=""
                                />
                                {idx === 0 && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 border-2 border-white rounded-full p-0.5">
                                        <Trophy size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{candidate.candidateName}</p>
                              <p className="text-xs text-gray-500 font-medium">{candidate.votes.toLocaleString()} Votes</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-black ${idx === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress bar container */}
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ease-out ${idx === 0 ? 'bg-blue-600' : 'bg-slate-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
