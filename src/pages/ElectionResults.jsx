import  { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import ResultRow from '@/components/ResultRow';
import moment from 'moment';

import backendUrl from '../utils/backendurl'

export async function resultsLoader({params}) {

	const [election, positions, candidates, votes, owner] = await Promise.all([
		fetch(`${backendUrl}/election/${params.id}`).then(res => res.json()),
		fetch(`${backendUrl}/election/${params.id}/positions`).then(res => res.json()),
		fetch(`${backendUrl}/election/${params.id}/candidates`).then(res => res.json()),
		fetch(`${backendUrl}/election/${params.id}/votes`).then(res => res.json()),
		fetch(`${backendUrl}/election/${params.id}/ownerinfo`).then(res => res.json()),
	])

	return [ election, positions, candidates, votes, owner ];
}

function ElectionResults() {
	const [election, positions, candidates, votes, owner] = useLoaderData();

	const [votesList, setVotesList] = useState([])
	const [candidatesList, setCandidatesList] = useState([])
	const [selectedPosition, setSelectedPosition] = useState("");
	const [eventException, setEventException] = useState(false);

	const [data, setData] = useState([]);

	const handleChange = (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected)
		
		const position = positions.find(pos => pos.position === selected);
		if (!position) return;

		const filteredCandidates = candidates.filter(candidate => candidate.position == position._id)
		const filteredVotes = votes.filter(vote => vote.position === position._id)

		setCandidatesList(filteredCandidates)
		setVotesList(filteredVotes)
	}

	useEffect(() => {
		if (election?.endDate && moment(election.endDate).isAfter(new Date()))
			setEventException(true)
	}, [election.endDate])

	useEffect( () => {
		const updatedData = candidatesList.map(candidate => ({
			id: candidate._id,
			candidateName: `${candidate.firstname} ${candidate.lastname}`,
			votes: votesList.filter(vote => vote.candidateId === candidate._id).length
		})).sort((a, b) => b.votes - a.votes)
		
		// Identify the winner (first in sorted list)
		const winnerId = updatedData.length > 0 ? updatedData[0].id : null;

		setData(updatedData.map(candidate => ({
		    ...candidate,
		    isWinner: candidate.id === winnerId
		})));
	}, [selectedPosition, candidatesList, votesList])

	const totalVotes = useMemo(() => votesList.length, [votesList])

	return ( 
		<>
			{eventException &&
				<div className="modal-overlay">
					<div className="w-full w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
						<h5>{`${election.title}`}</h5>
						<hr />
						
						<p>This election is still ongoing</p>
						
						<hr />
						
						<div className="my-2">
							<button className="Button red my-0 mx-3 w-20" onClick={() => navigate('/')}>Go Home</button>
						</div>
					</div>
				</div>
			}

			<div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out">
				<div className="p-5">
					<h2><strong>{ election.title }</strong></h2>
					<h4><strong>Description:</strong> { election.desc ? election.desc : '' }</h4>
					<h4><strong>Created by:</strong> {`${owner.firstname} ${owner.lastname}`}</h4>
					<h4><strong>Start date:</strong> { election.startDate ? moment(election.startDate).format('LLL') : ''}</h4>
					<h4><strong>End date:</strong> { election?.endDate ? moment(election.endDate).format('LLL') : ''}</h4>
				</div>
			</div>

			<div className="resultsContainer">
				<div className="resultsLeft">
					<label>
						<select name="position"
							className='form-select form-select-lg mb-3'
							value={selectedPosition}
							onChange={handleChange}
						>
							<option value="" disabled>Select a position</option>
							{positions.length > 0 ?
								positions.map((position) => (
									<option key={position.position} value={position.position}>
										{position.position}
									</option>
								))
								: "no positions.."}
						</select>
					</label>

					<hr />

					<div className="voteInfo">
						<h3>Results for {selectedPosition}</h3>
						<h4>Total votes: {totalVotes}</h4>

						<div className='dashboard-container table-responsive'>
							<table className="table table-hover table-striped">
								<thead>
									<tr>
										<th scope="col">Name</th>
										<th scope="col">Position</th>
										<th scope="col">Vote Count</th>
									</tr>
								</thead>

								
								{data
									.map(datum => (
										<ResultRow key={datum.id} candidate = {datum} selectedPosition={selectedPosition} count={vote} />
										)
									)
								}
								
							</table>
						</div>
					</div>
				</div>

				<div className="resultsRight">
					<p>Hello</p>
				</div>
			</div>
		</>
	 );
}

export default ElectionResults;
