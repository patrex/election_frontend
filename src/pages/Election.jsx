import { useState, useEffect, useContext } from "react";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import moment from "moment";
import Toast from "@/utils/ToastMsg";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AppContext } from "@/App";

import backendUrl from '../utils/backendurl'
      
export async function electionLoader({ params }) {
	const e = await fetch(`${backendUrl}/election/${params.id}`);
	const o = await fetch(`${backendUrl}/election/${params.id}/ownerinfo`);
	const p = await fetch(`${backendUrl}/election/${params.id}/positions`);
	

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
	const navigate = useNavigate();

	const [electionData, setElectionData] = useState(e);
	const [candidates, setCandidates] = useState([]);

	const [owner, setOwner] = useState(o);
	const { voter } = useContext(AppContext);

	const [positions, setPositions] = useState(p);
	const [selectedPosition, setSelectedPosition] = useState("");

	async function sendVote(candidate, voterId) {
		try {
			const userVotes = await fetch(`${backendUrl}/election/${electionData._id}/${voterId}/votes`);
			let userHasVoted = false;

			if (userVotes.ok) {
				// let availablePositions = positions.map(p => p._id);
				let currentPosition = positions.filter(p => p._id == candidate.position)
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
				const v = await fetch(`${backendUrl}/election/vote`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						election: electionData._id,
						candidate: candidate._id,
						voterId,
						position: candidate.position
					}),
				})
	
				if (v.ok ) {
					Toast.success('Your vote was recorded')
				} else {
					Toast.warning('Your vote could not be recorded');
					return;
				}
			} else { 
				Toast.warning('You already voted for this position');
			 }
		} catch (error) {
			Toast.warning(error)
		}	
	}

	const handleChange = async (e) => {
		const selected = e.target.value;
		setSelectedPosition(selected);
		try {
			// attempt to fetch candidates for selected position
			const req = await fetch(`${backendUrl}/election/${params.id}/${selected}/candidates`);
			const c = await req.json();
			setCandidates(c)
		} catch (error) {
			setCandidates([]);
			Toast.warning(error);
		}
	}

	useEffect(() => {
		if (!voter) {
			Toast.warning("You need to register as a voter first")
			navigate(`/`)
		} 
	}, [])

	return (
		<>
			<div className="main">
				<div className="electioninfo">
					<div className="electioninfo-content">
						<p className='my-0 py-1'><strong>{ e.title }</strong></p>
						<p className='my-0 py-1'><strong>Description:</strong> { electionData.desc ? electionData.desc : '' }</p>
						<p className='my-0 py-1'><strong>Created by:</strong> {`${owner.firstname} ${owner.lastname}`}</p>
						<p className='my-0 py-1'><strong>Start date:</strong> { electionData.startDate ? moment(electionData.startDate).format('LLL') : ''}</p>
						<p className='my-0 py-1'><strong>End date:</strong> { electionData?.endDate ? moment(electionData.endDate).format('LLL') : ''}</p>
						<p><strong>Time left:</strong> {moment(electionData.endDate).endOf('day').fromNow()}</p>
					</div>
				</div>
		
				<hr />

				{/* Select box for when a voter wants to vote a particular position */}
				<div className="election-container">
					<div className='mb-3'>
						<label>
							<select name="position" 
								className='form-select form-select-lg mb-3'
								value={ selectedPosition } 
								onChange={ handleChange }
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
