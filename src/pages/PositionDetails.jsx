import { useLoaderData, useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState, useContext, useEffect } from "react";
import Toast from "@/utils/ToastMsg";
import UserCard from "@/components/UserCard"
import { Grid, Container, Typography } from '@mui/material';

import { AppContext } from "@/App";
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
	const params = useParams()

	const { user } = useContext(AppContext)
	const navigate = useNavigate()


	function handleEdit(edit_url) {
		navigate(edit_url)
	}

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
						Authorization: `Bearer ${await user?.getIdToken()}`
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
			<Container maxWidth="lg" sx={{ pt: 4 }}>
				<Typography variant="h4" component="h1" sx={{ mb: 3 }}>
					Candidates for {position}
				</Typography>

				<Grid container spacing={2}>
					{candidatesList.map(candidate => (
						<Grid item key={candidate._id} xs={12} sm={6} md={4} lg={3}>
							<UserCard
								name={`${candidate.firstname} ${candidate.lastname}`}
								position={position}
								imageUrl={candidate.imgUrl}
								onEdit={() =>
									handleEdit(
										`/user/${params.userId}/election/candidate/${candidate._id}/update`
									)
								}
								onDelete={() => removeCandidate(candidate)}
								election={election}
							/>
						</Grid>
					))}
				</Grid>
			</Container>
		</>
	);
}

export default PositionDetails;
