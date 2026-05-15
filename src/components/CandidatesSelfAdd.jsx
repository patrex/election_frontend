import { Link } from 'react-router-dom'

const CandidatesSelfAdd = ({ election, onClose }) => {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-gray-800 dark:text-gray-200">
                    Want to run for a position?
                    <Link to={`/election/${election._id}/addcandidates`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-2">Register here</Link>
                    as a candidate.
                </p>
                <div className="flex gap-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-4">
                    <svg
                        className="h-5 w-5 text-blue-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p>
                        <strong>Note:</strong> Registering here does not automatically
                        guarantee you on the ballot. Your election administrator has to
                        approve your application.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidatesSelfAdd;