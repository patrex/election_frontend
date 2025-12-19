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
		return null;
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
		<div className="min-h-screen flex flex-col bg-slate-50">
			<main className="container mx-auto px-4 pt-10 flex-1 max-w-7xl">
				{/* Header Section */}
				<div className="flex flex-col gap-2 mb-6">
					<h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
						Candidates for <span className="text-violet-600">{position}</span>
					</h1>
					<p className="text-gray-500">Manage and view all approved candidates for this position.</p>
				</div>

				<hr className="border-gray-200 mb-8" />

				{/* Responsive Grid System */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{candidatesList
						.filter((c) => c.isApproved)
						.map((candidate) => (
							<div key={candidate._id} className="flex justify-center">
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
							</div>
						))}
				</div>

				{/* Empty State (Optional but helpful) */}
				{candidatesList.filter((c) => c.isApproved).length === 0 && (
					<div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
						<p className="text-gray-400">No approved candidates found for this position.</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default PositionDetails;