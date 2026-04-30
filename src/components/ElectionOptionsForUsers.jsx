import { useState } from "react";
import moment from 'moment';

const ElectionOptions = (election) => {
	const [openOptionsModal, setOpenOptionsModal] = useState(false);
    const [electionEndedModal, setElectionEndedModal] = useState(false);

    return <>
        {/* Election State Modals (Ended/Not Started) */}
        {(electionEndedModal || openOptionsModal) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 relative">
                        <button
                            onClick={() => { setElectionEndedModal(false); setOpenOptionsModal(false); }}
                            className="absolute top-4 right-4 text-white/80 hover:text-white"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-2">{election.title}</h3>
                        <p className="text-blue-100 text-sm">
                            {electionEndedModal
                                ? `Election ended ${moment(election.endDate).calendar()}`
                                : `Starts in ${moment(election.startDate).fromNow()}`}
                        </p>
                    </div>

                    <div className="p-8">
                        {electionEndedModal ? (
                            <div className="text-center">
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Voting is now closed for this election.</p>
                                <Link to={`/election/${election._id}/results`} className="inline-block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                                    View Official Results
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {election.addCandidatesBy === "Candidates Will Add Themselves" && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <p className="text-gray-800 dark:text-gray-200">
                                            Want to run for a position?
                                            <button
                                                onClick={() => { setOtpStarterModal(true); setOpenOptionsModal(false); }}
                                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-2"
                                            >
                                                Register here
                                            </button>
                                            as a candidate.
                                        </p>
                                        <div className="flex gap-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                            <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p><strong>Note:</strong> Registering here does not automatically guarantee you on the ballot. Your election administrator has to approve your application</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
}

export default ElectionOptions;