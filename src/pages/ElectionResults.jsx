import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher, FetchError } from '@/utils/fetcher';

export async function resultsLoader({ params }) {
	try {
		const [election, results, positions] = await Promise.all([
			fetcher.get(`election/${ params.id }`),
			fetcher.get(`results/${ params.id }`),
			fetcher.get(`election/${ params.id }/positions`)
		])

		//results potentially contains: results.data for the total results
		//and results.winners for the first three winners
		return [election, results.data, results.winners, positions];
	} catch (error) {
		console.error(error);
		return null
	}
}

function ElectionResults() {
	const [event, allResults, winners, positions] = useLoaderData();

	const [election, setElection] = useState(event || [])
	const [votes, setVotes] = useState(allResults || []);
	const [top3, setTop3] = useState(winners || []);
	const [workingList, setWorkingList] = useState(data || []);

	const [selectedPosition, setSelectedPosition] = useState("");

	const handleChange = (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected)

		const position = positions.find(pos => pos.position === selected);
		if (!position) return;

		const filteredCandidates = data.filter(candidate => candidate.position == position._id);
		const filteredVotes = votes.filter(vote => vote.position === position._id);

		setWorkingList(filteredCandidates)
		setVotes(filteredVotes)
	}

	return (
		<div>Hello Results</div>
		
	);
}

export default ElectionResults;
