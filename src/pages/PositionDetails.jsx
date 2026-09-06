import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Toast from "@/utils/ToastMsg";
import UserCard from "@/components/UserCard"

import axios_api from "@/utils/axios";

export async function loader({ params }) {
	try {
		const [election, candidates] = await Promise.all([
			axios_api.get(`elections/${params.id}/find`),
			axios_api.get(`candidates/${params.id}/${params.position}`)
		])

		return [election.data, candidates.data, params.position]
	} catch (error) {
		console.error("Could not fetch resources");
		return null;
	}
}

function PositionDetails() {
	const [election, candidates, position] = useLoaderData();
	const [candidatesList, setCandidatesList] = useState(candidates || []);
	const params = useParams();

	const navigate = useNavigate();

	function handleEdit(edit_url) {
		navigate(edit_url);
	}

	async function removeCandidate(candidate) {
		try {
			await axios_api.delete(`candidates/${candidate._id}`)
			setCandidatesList(prev => prev.filter(c => c._id !== candidate._id));
			Toast.success('Candidate was removed');
		} catch (error) {
			Toast.warning("There was an unexpected error");
		}
	}

	return (
		<div className="min-h-screen flex flex-col bg-slate-50">
				{/* Header Section */}
				<div className="flex flex-col gap-2 mb-6">
					<h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
						Candidates for <span className="text-violet-600">{position}</span>
					</h1>
					<p className="text-gray-500">Manage all approved candidates for this position.</p>
				</div>

				<hr className="border-gray-200 mb-8" />

				{/* Responsive Grid */}
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

		</div>
	);
}

export default PositionDetails;