import  { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
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
			imgUrl: candidate.imgUrl,
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

			<div className="bg-slate-100 shadow-md overflow-hidden transition-transform duration-300 ease-in-out">
				<div className="p-2">
					<p><strong>{ election.title }</strong></p>
					<p><strong>Description:</strong> { election.desc ? election.desc : '' }</p>
					<p><strong>Created by:</strong> {`${owner.firstname} ${owner.lastname}`}</p>
					<p><strong>Start date:</strong> { election.startDate ? moment(election.startDate).format('LLL') : ''}</p>
					<p><strong>End date:</strong> { election?.endDate ? moment(election.endDate).format('LLL') : ''}</p>
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
								<tbody className='table-group-divider'>
									{data
									     .map(datum => (
										<tr key={datum.id}>
											<div className="flex items-center py-2 px-3 border-b border-gray-200">
												{/* Picture */}
												<img
													src={ datum.imgUrl }
													className="w-10 h-10 rounded-full object-cover mr-3"
												/>
												{/* Name */}
												<div className="flex-1 font-bold">{ datum.candidateName }</div>
												{/* Position */}
												<div className="flex-1 text-gray-600">{selectedPosition}</div>
												{/* Count */}
												<div className="ml-3 font-bold text-gray-800">{datum.votes}</div>
											</div>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="resultsRight">
					
				</div>
			</div>
		</>
	 );
}

export default ElectionResults;
