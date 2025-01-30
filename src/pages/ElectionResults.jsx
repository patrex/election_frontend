import  { useState, useRef, useEffect } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';

import backendUrl from '../utils/backendurl'

export async function resultsLoader({params}) {
	const e = await fetch(`${backendUrl}/election/${params.id}`);
	const p = await fetch(`${backendUrl}/election/${params.id}/positions`);
	const c = await fetch(`${backendUrl}/election/${params.id}/candidates`);
	const v = await fetch(`${backendUrl}/election/${params.id}/votes`);
	const o = await fetch(`${backendUrl}/election/${params.id}/ownerinfo`);

	const election = await e.json();
	const positions = await p.json();
	const candidates = await c.json();
	const votes = await v.json();
	let owner = await o.json();

	return [election, positions, candidates, votes, owner];
}

function ElectionResults() {
	const [election, positions, candidates, votes, owner] = useLoaderData();

	const [votesList, setVotesList] = useState([])
	const [candidatesList, setCandidatesList] = useState([])
	const [selectedPosition, setSelectedPosition] = useState("");
	const [winner, setWinner] = useState({});
	const [runnerUps, setRunnerUps] = useState([]);
	const [eventException, setEventException] = useState(false);
	
	const svgRef = useRef();

	const [data, setData] = useState([]);

	//	chart dimensions
	const width = 300;
	const height = 300;
	const radius = width / 2;

	const handleChange = (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected)
		
		const position = positions.find(position => position.position == selected);
		setCandidatesList(candidates.filter(candidate => candidate.position == position._id))
		setVotesList(votes.filter(vote => vote.position == position._id))
	}

	useEffect(() => {
		moment(election.endDate).isAfter(new Date()) && setEventException(true)
	}, [election.endDate])

	useEffect( () => {
		setData([])
		
		candidatesList.forEach(candidate => {
			const row = {}

			const candidateName = `${candidate.firstname} ${candidate.lastname}`;
			let voteCount = votesList.filter(vote => vote.candidateId == candidate._id).length;
			
			row.id = candidate._id;
			row.candidateName = candidateName;
			row.votes = voteCount;
			
			setData(prev => [...prev, row])
		})
		
	}, [selectedPosition])

	

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
					<h4><strong>End date:</strong> { election.endDate ? moment(election.endDate).format('LLL') : ''}</h4>
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
						<h4>Total votes: {votesList.length}</h4>

						<div className='dashboard-container table-responsive'>
							<table className="table table-hover table-striped">
								<thead>
									<tr>
										<th scope="col">Name</th>
										<th scope="col">Position</th>
										<th scope="col">Vote Count</th>
									</tr>
								</thead>

								<tbody className='table-group-divider'>
									{data.sort((a, b) => b.votes - a.votes)
									     .map(datum => (
										<tr key={datum.id}>
											<td>{datum.candidateName}</td>
											<td>{selectedPosition}</td>
											<td>{datum.votes}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="resultsRight">
					<svg
						ref={svgRef}
						width={width}
						height={height}
					>
					</svg>
				</div>
			</div>
		</>
	 );
}

export default ElectionResults;
