import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";
import { toast } from "sonner";

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

	function removeCandidate(candidate) {
		Swal.fire({
			title: `Delete ${candidate.firstname} ${candidate.lastname}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/candidate/${candidate._id}/delete`, {
					method: 'delete'
				})
	
				if(res.ok) {
					setCandidatesList(candidatesList.filter(c => c._id != candidate._id))
					toast.success('Candidate was removed')
				}
			}
		});	
	}

	return ( 
		<>
			<h1>Candidates for {position}</h1>
			<div className="grid">
				{
					candidatesList.map(candidate => (
						<div className="card">
							<img src={candidate.imgUrl} alt={candidate.firstname} width={240} />
							<div className="card-details">
								<h2>{`${candidate.firstname} ${candidate.lastname}`}</h2>
								<p>{position} </p>
								<button className='btn btn-danger btn-sm' 
									onClick={() => removeCandidate(candidate)}>
										<i className="bi bi-trash3 m-1"></i>Remove</button>
							</div>
						</div>
					))
				}
			</div>
		</>
	);
}

export default PositionDetails;
