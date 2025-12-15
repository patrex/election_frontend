import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Toast from "@/utils/ToastMsg";
import UserCard from "@/components/UserCard"
import { Grid, Container, Typography, Box } from '@mui/material';

import { AppContext } from "@/App";
import { fetcher, FetchError } from "@/utils/fetcher";

export async function loader({ params }) {
	try {
		const [election, candidates] = await Promise.all([
			fetcher.get(`election/${params.id}`),
			fetcher.get(`election/${params.id}/${params.position}/candidates`)
		])

		return [election, candidates, params.position]
	} catch (error) {
		console.error("Could not fetch resources");
	}
}

function PositionDetails() {
	const [election, candidates, position] = useLoaderData();
	const [candidatesList, setCandidatesList] = useState(candidates || []);
	const params = useParams();

	const { user } = useContext(AppContext);

	const navigate = useNavigate();

	function handleEdit(edit_url) {
		navigate(edit_url);
	}

	async function removeCandidate(candidate) {
		try {
			await fetcher.auth.delete(`election/${election._id}/candidate/${candidate._id}/delete`, user)
			setCandidatesList(prev => prev.filter(c => c._id !== candidate._id));
			Toast.success('Candidate was removed');
		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 500) {
					Toast.warning("There was an unexpected error");
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('There was an error removing the candidate');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		}
	}

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Container maxWidth="lg" sx={{ pt: 4, flex: 1 }}>
				<Typography variant="h4" component="h1" sx={{ mb: 3 }}>
					Candidates for {position}
				</Typography>

				<hr />

				<Grid container spacing={2}>
					{candidatesList.filter(c => c.isApproved).map(candidate => (
						<Grid item key={candidate._id} xs={12} sm={6} md={4} lg={3}>
							<UserCard
								name={`${candidate.firstname} ${candidate.lastname}`}
								position={position}
								imageUrl={candidate.imgUrl}
								onEdit={() =>
									handleEdit(`/user/${params.userId}/election/candidate/${candidate._id}/update`)
								}
								onDelete={() => removeCandidate(candidate)}
								election={election}
							/>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
}

export default PositionDetails;