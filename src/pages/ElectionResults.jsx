import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher, FetchError } from '@/utils/fetcher';
import { Trophy, Medal, Users, ChevronRight, CheckCircle, Share2, Printer, Copy, Check, Info } from 'lucide-react';

export async function resultsLoader({ params }) {
	try {
		const [election, results, positions] = await Promise.all([
			fetcher.get(`election/${ params.id }`),
			fetcher.get(`results/${ params.id }`),
			fetcher.get(`election/${ params.id }/positions`)
		])

		//results potentially contains: results.data for the total results
		//and results.winners for the first three winners
		return [ election, results, positions ];
	} catch (error) {
		console.error(error);
		return null
	}
}

import { Trophy, Users, BarChart3, Award, ChevronRight } from 'lucide-react';

export default function ElectionResults() {
  const [election, resultsData, positions] = useLoaderData();
  
  // Extracting data from your API response structure
  const allResults = resultsData.data || [];
  const topThree = resultsData.winners || [];

  // Grouping results by position for a cleaner UI
  const groupedResults = positions.map(pos => ({
    ...pos,
    candidates: allResults.filter(r => r.position === pos.name || r.position === pos._id)
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <header className="bg-blue-900 text-white py-10 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Live Results
            </span>
            <h2 className="text-blue-200 font-medium">{election.year} General Election</h2>
          </div>
          <h1 className="text-4xl font-extrabold">{election.title}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-8">
        {/* Top 3 Podium / Winners Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-bold">Overall Frontrunners</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((winner, index) => (
              <div key={winner._id} className="bg-white rounded-xl shadow-md border-t-4 border-blue-600 p-6 flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={winner.imgUrl || "/api/placeholder/80/80"} 
                    alt={winner.candidateName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div className="absolute -top-2 -left-2 bg-yellow-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">{winner.position}</p>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{winner.candidateName}</h3>
                  <p className="text-blue-600 font-bold">{winner.votes.toLocaleString()} votes</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Results by Position */}
        <section className="space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Results by Position</h2>
          </div>

          {groupedResults.map((pos) => (
            <div key={pos._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-700">{pos.name}</h3>
                <span className="text-sm text-gray-500 italic">
                  {pos.candidates.length} Candidates
                </span>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {pos.candidates.map((candidate, idx) => {
                    // Simple percentage calculation
                    const totalPosVotes = pos.candidates.reduce((acc, curr) => acc + curr.votes, 0);
                    const percentage = totalPosVotes > 0 ? ((candidate.votes / totalPosVotes) * 100).toFixed(1) : 0;

                    return (
                      <div key={candidate._id} className="group">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono font-medium">{idx + 1}</span>
                            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {candidate.candidateName}
                            </span>
                            {idx === 0 && candidate.votes > 0 && (
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                    Leading
                                </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{candidate.votes.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {pos.candidates.length === 0 && (
                    <div className="text-center py-6 text-gray-400 italic">
                      No votes recorded for this position yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
