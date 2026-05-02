const ElectionEndedModal = (election) => {
    return <div className="p-8">
        <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">Voting is now closed for this election.</p>
            <Link to={`/election/${election._id}/results`} className="inline-block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                View Official Results
            </Link>
        </div>
    </div>
}

export default ElectionEndedModal;