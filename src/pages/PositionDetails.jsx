import { useLoaderData, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";
import Toast from "@/utils/ToastMsg";
import PulseLoader from "react-spinners/PulseLoader";

import backendUrl from '../utils/backendurl'

export async function loader({params}) {
	let election, candidates = undefined;
	let position = params.position;

	try {
		const res1 = await fetch(`${backendUrl}/election/${params.id}`)
		const candidateList = await fetch(`${backendUrl}/election/${params.id}/${params.position}/candidates`)

		election = await res1.json();
		candidates = await candidateList.json();

	} catch (error) {
		
	}

	return [election, candidates, position]
}

function PositionDetails() {
	const [election, candidates, position] = useLoaderData();
	const [candidatesList, setCandidatesList] = useState(candidates);
	const [imgLoading, setImgLoading] = useState(true)
	const params = useParams()

	function removeCandidate(candidate) {
		Swal.fire({
			title: `Delete ${candidate.firstname} ${candidate.lastname}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/candidate/${candidate._id}/delete`, {
					method: 'delete',
					headers: {
						'Content-Type': 'application/json',
					}
				})
	
				if(res.ok) {
					setCandidatesList(candidatesList.filter(c => c._id != candidate._id))
					Toast.success('Candidate was removed')
				}
			}
		});	
	}

	return ( 
		<>
			<h1 style={{padding: "0 .5rem"}}>Candidates for {position}</h1>
			<div className="candidates-grid">
				{
					candidatesList.map(candidate => (
				
						<div className="candidate-card">
							<div className="candidate-card-img">
								{imgLoading && (<PulseLoader  color="#ffb500" size={5} loading={imgLoading}/>)  }
								<img 
									src={candidate.imgUrl} 
									className={`${imgLoading ? 'invisible' : 'visible' }`}
									onLoad={setImgLoading(false)}
								/>
							</div>
			
							<div className="candidate-card-details">
								<div className="candidate-card-name-plaque">{`${candidate.firstname} ${candidate.lastname}`}</div>
								<div className="candidate-pos-label">{position} </div>
								<div className="btn-group" role="group">
									<Link to={`/user/${params.userId}/election/candidate/${candidate._id}/update`}><button className='Button violet'><i class="bi bi-pen-fill"></i></button></Link>
									<button type="button" className='btn btn-danger' onClick={() => removeCandidate(candidate)}>
										<i className="bi bi-trash3"></i></button>
								</div>
								
							</div>
						</div>
					))
				}
			</div>
		</>
	);
}

export default PositionDetails;
