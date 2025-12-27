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

const ElectionResults = () => {
    // Destructuring based on your loader's return value
    const [ election, results, positions ] = useLoaderData();
    
    // Default to the first position in the array
    const [activePosition, setActivePosition] = useState(positions[0]);
    const [copied, setCopied] = useState(false);

    // Filter results based on the active position
    // results.data[activePosition] = Full list of candidates
    // results.winners[activePosition] = [Winner, 1st Runner Up, 2nd Runner Up]
    const currentCandidates = results.data[activePosition] || [];
    const podium = results.winners[activePosition] || [];
    
    const winner = podium[0];
    const runnersUp = podium.slice(1, 3);
    const totalVotes = currentCandidates.reduce((acc, curr) => acc + curr.votes, 0);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
            
            {/* 1. Election Meta & Global Actions */}
            <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {election.title}
                            </h1>
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                                {election.status || 'FINAL'}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">{election.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all">
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            {copied ? 'Link Copied' : 'Share'}
                        </button>
                        <button onClick={() => window.print()} className="p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 2. Left Column: Position Selection & Standings */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest">Select Position</label>
                        <select 
                            value={activePosition}
                            onChange={(e) => setActivePosition(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-gray-900 dark:text-white focus:border-violet-500 transition-all appearance-none cursor-pointer"
                        >
                            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-xs font-black uppercase text-gray-400">All Candidates</h3>
                            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-md">
                                {totalVotes} Votes
                            </span>
                        </div>
                        <div className="space-y-1">
                            {currentCandidates.map((c, idx) => (
                                <div key={c.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{c.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{c.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 3. Right Column: The Podium Spotlight */}
                <main className="lg:col-span-8 space-y-6">
                    {winner ? (
                        <>
                            {/* Winner Card */}
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10">
                                    <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                        Elected Candidate
                                    </div>
                                    <h2 className="text-6xl font-black tracking-tighter mb-2">{winner.name}</h2>
                                    <p className="text-violet-200 text-xl font-medium">New {activePosition}</p>
                                    
                                    <div className="flex items-center gap-8 mt-10">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-violet-300 tracking-wider">Vote Share</p>
                                            <p className="text-5xl font-black">{winner.percentage}%</p>
                                        </div>
                                        <div className="h-14 w-px bg-white/20" />
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-violet-300 tracking-wider">Total Votes</p>
                                            <p className="text-5xl font-black">{winner.votes.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <Trophy size={180} className="absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
                            </div>

                            {/* Runner Up Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {runnersUp.map((runner, idx) => (
                                    <div key={runner.name} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'}`}>
                                                <Medal size={28} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    {idx === 0 ? 'Runner Up' : '3rd Place'}
                                                </p>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{runner.name}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{runner.percentage}%</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{runner.votes} Votes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <Info className="text-gray-300 mb-2" size={40} />
                            <p className="text-gray-500 font-medium">No results recorded for this position yet.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ElectionResults;
