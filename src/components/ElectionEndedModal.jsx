import { Link } from "react-router-dom";

const ElectionEndedModal = ({ election, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Election Ended
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Voting is now closed for this election. Voting ended <span>{election.endDate}</span>
          </p>
          <Link
            to={`/election/${election._id}/results`}
            className="inline-block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            View Official Results
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ElectionEndedModal;