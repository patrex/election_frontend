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
		return { election, results, positions };
	} catch (error) {
		console.error(error);
		return null
	}
}

const ElectionResults = () => {
    // Destructuring based on your loader's return value
    const { election, results } = useLoaderData();
    

    
    const [copied, setCopied] = useState(false);

    // 1. Group the flat data by Position
    const groupedData = useMemo(() => {
        return results.reduce((acc, candidate) => {
            const pos = candidate.position;
            if (!acc[pos]) acc[pos] = [];
            acc[pos].push(candidate);
            return acc;
        }, {});
    }, [results]);

    const positions = Object.keys(groupedData);
    const [activePosition, setActivePosition] = useState(positions[0] || "");

    // 2. Process the active position's data
    const { currentCandidates, winner, runnersUp, totalVotes } = useMemo(() => {
        const list = [...(groupedData[activePosition] || [])].sort((a, b) => b.votes - a.votes);
        const total = list.reduce((sum, c) => sum + (c.votes || 0), 0);
        
        // Add percentage calculation on the fly
        const listWithPerc = list.map(c => ({
            ...c,
            percentage: total > 0 ? ((c.votes / total) * 100).toFixed(1) : 0
        }));

        return {
            currentCandidates: listWithPerc,
            winner: listWithPerc[0],
            runnersUp: listWithPerc.slice(1, 3),
            totalVotes: total
        };
    }, [groupedData, activePosition]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Header Section */}
            <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{election.title}</h1>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">LIVE</span>
                    </div>
                    <p className="text-gray-500 text-sm italic">{election.description}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} {copied ? 'Copied' : 'Share'}
                    </button>
                    <button onClick={() => window.print()} className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl"><Printer size={18} /></button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Sidebar Selection */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Position</label>
                        <select 
                            value={activePosition} 
                            onChange={(e) => setActivePosition(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:border-violet-500"
                        >
                            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                    </div>

                    {/* Full List with Avatars */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-4 px-1">Full Standings ({totalVotes} Votes)</h3>
                        <div className="space-y-2">
                            {currentCandidates.map((c, idx) => (
                                <div key={c._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all">
                                    <div className="flex items-center gap-3">
                                        <img src={c.imgUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-200" onError={(e) => e.target.src='https://ui-avatars.com/api/?name='+c.candidateName} />
                                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{c.candidateName}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{c.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Right Side: Podium Spotlight */}
                <main className="lg:col-span-8 space-y-6">
                    {winner ? (
                        <>
                            {/* Winner Hero Card */}
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                    <div className="relative">
                                        <img 
                                            src={winner.imgUrl} 
                                            className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] object-cover border-4 border-white/20 shadow-2xl" 
                                            alt={winner.candidateName}
                                        />
                                        <div className="absolute -bottom-4 -right-4 bg-yellow-400 p-3 rounded-2xl text-violet-900 shadow-xl">
                                            <Trophy size={24} />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left space-y-2">
                                        <p className="text-violet-200 font-bold uppercase tracking-widest text-xs">Winning Candidate</p>
                                        <h2 className="text-5xl font-black tracking-tighter">{winner.candidateName}</h2>
                                        <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
                                            <div>
                                                <p className="text-[10px] font-black text-violet-300 uppercase">Percent</p>
                                                <p className="text-4xl font-black">{winner.percentage}%</p>
                                            </div>
                                            <div className="w-px h-10 bg-white/20" />
                                            <div>
                                                <p className="text-[10px] font-black text-violet-300 uppercase">Votes</p>
                                                <p className="text-4xl font-black">{winner.votes}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            </div>

                            {/* Runners Up Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {runnersUp.map((runner, idx) => (
                                    <div key={runner._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={runner.imgUrl} className="w-14 h-14 rounded-2xl object-cover bg-gray-100" alt="" />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{idx === 0 ? '2nd Place' : '3rd Place'}</p>
                                                <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{runner.candidateName}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{runner.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                            <Info size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold">No data found for this position.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ElectionResults;
