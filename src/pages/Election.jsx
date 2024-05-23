import { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import moment from "moment";
import {toast} from 'sonner'
import * as AlertDialog from '@radix-ui/react-alert-dialog';
      
export async function electionLoader({ params }) {
	const e = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}`);
	const o = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}/ownerinfo`);
	const p = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}/positions`);
	

	let election = await e.json();
	let positions = await p.json();
	let owner = await o.json();


	return [
		election,
		positions,
		owner
	]
}


export default function Election() {
	const params = useParams();
	const [e, p, o] = useLoaderData();

	const [electionData, setElectionData] = useState(e);
	const [candidates, setCandidates] = useState([]);

	const [owner, setOwner] = useState(o);

	const [positions, setPositions] = useState(p);
	const [selectedPosition, setSelectedPosition] = useState("");

	// const fetchPositions = () => {
	// 	fetch(`/election/${params.id}/positions`)
	// 		.then(data => data.json())
	// 		.then(positions => setPositions(positions))
	// 		.catch(err => console.log(err))
	// }

	// const fetchElectionData = () => {
	// 	fetch(`/election/${params.id}`)
	// 		.then((election) => election.json())
	// 		.then(data => setElectionData(data))
	// 		.catch(err => console.log(err))
	// }

	async function sendVote(candidate, voterId) {
		try {
			const userVotes = await fetch(`https://election-backend-kduj.onrender.com/election/${electionData._id}/${voterId}/votes`);
			let userHasVoted = false;

			if (userVotes.ok) {
				let currentPosition = positions.filter(p => p._id == candidate.position)
				// let availablePositions = positions.map(p => p._id);
				const votesByUser = await userVotes.json();

				let voteList = votesByUser.votes;
				
				for (let i = 0; i < voteList.length; i++) {
					if (voteList.includes(currentPosition[0]._id)) {
						userHasVoted = true;
						break;
					}
				}
			}

			if (!userHasVoted) {
				const v = await fetch(`https://election-backend-kduj.onrender.com/election/vote`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						election: electionData._id,
						candidate: candidate._id,
						voterId,
						position: candidate.position
					}),
				})
	
				if (v.ok ) {
					toast.success('Your vote was recorded')
				} else {
					toast.warning('Your vote could not be recorded');
					return;
				}
			} else { 
				toast.warning('You already voted for this position');
			 }
		} catch (error) {
			toast.warning(error)
		}
			
	}


	// useEffect(() => {
	// 	// fetchElectionData()
	// 	// fetchPositions()
	// }, [])

	const handleChange = async (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected);
		try {
			// attempt to fetch candidates for selected position
			const req = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}/${selected}/candidates`);
			const c = await req.json()
			setCandidates(c)
		} catch (error) {
			setCandidates([]);
			toast.warning(error)
		}
	}

	return (
		<>
			<div className="main">
				<div className="electioninfo">
					<div className="electioninfo-content">
						<h1><strong>{electionData.title}</strong></h1>
						<h4><strong>Description:</strong> {electionData.desc ? electionData.desc : ''}</h4>
						<h4><strong>Created by:</strong> {`${owner.firstname} ${owner.lastname}`}</h4>
						<h4><strong>Start date:</strong> {electionData.startDate ? moment(electionData.startDate).format('LLL') : ''}</h4>
						<h4><strong>End date:</strong> {electionData.endDate ? moment(electionData.endDate).format('LLL') : ''}</h4>
						<h4><strong>Time left:</strong> {moment(electionData.endDate).endOf('day').fromNow()}</h4>
					</div>
				</div>
		
				<hr />

				{/* Select box for when a voter wants to vote a particular position */}
				<div className="election-container">
					<div className='mb-3'>
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
					</div>

					<div className="grid">
						{
						candidates ? candidates.map(candidate => (
							<div className="vote-card" key={candidate._id}>
								<img src={candidate.imgUrl} width="100px" alt="" />
								<div className="vote-card-content">
									<div className="vote-card-title">

									</div>
									<div className="vote-card-desc">
										<h2><strong>{`${candidate.firstname} ${candidate.lastname}`}</strong></h2>
										<h5>{`${selectedPosition}`}</h5>
										<AlertDialog.Root>
											<AlertDialog.Trigger asChild>
											<button className="Button violet">Vote</button>
											</AlertDialog.Trigger>
											<AlertDialog.Portal>
											<AlertDialog.Overlay className="AlertDialogOverlay" />
											<AlertDialog.Content className="AlertDialogContent">
												<AlertDialog.Title className="AlertDialogTitle">Are you sure?</AlertDialog.Title>
												<AlertDialog.Description className="AlertDialogDescription">
													{`Vote ${candidate.firstname} ${candidate.lastname} for ${selectedPosition}`}
												</AlertDialog.Description>
													<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
												<AlertDialog.Cancel asChild>
													<button  className="Button mauve">Cancel</button>
												</AlertDialog.Cancel>
												<AlertDialog.Action asChild>
													<button className="Button red" onClick={() => sendVote(candidate, params.voterId)}>Yes, vote</button>
												</AlertDialog.Action>
												</div>
											</AlertDialog.Content>
											</AlertDialog.Portal>
  										</AlertDialog.Root>
									</div>
								</div>
							</div>
						)): "no candidates for this position"}
					</div>	
					{/* end div grid */}
				</div>
				{/* end div election container */}
			</div>
			
		</>
	);
}
