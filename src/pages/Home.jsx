import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import Toast from '@/utils/ToastMsg';
import axios_api from "@/utils/axios";

export async function homeLoader({ request }) {
	const url = new URL(request.url);
	const electionid = url.searchParams.get("event_id");
	return electionid;
}

function Home() {
	const navigate = useNavigate();
	const electionFromQueryParams = useLoaderData();

	// State management
	const [electionId, setElectionId] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Auto-process if ID comes from URL
	useEffect(() => {
		if (electionFromQueryParams){
			processElection(electionFromQueryParams);
		}
	}, [electionFromQueryParams]);

	/**
	 * Main entry point: Fetches election and triggers correct Modal path
	 */
	const processElection = useCallback(async (id) => {
		if (!id?.trim()) return Toast.warning("Please enter a valid election ID");

		setIsLoading(true);
		try {
			const e = await axios_api.get(`election/${id}`);
			if (!e) throw new Error("No election was found with that ID!");

			const electionFetched = e.data;

			navigate(`/election/${electionFetched._id}/info`, { state: { election: electionFetched } });
		} catch (error) {
			Toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	}, [electionFromQueryParams])

	return (
		<>
			<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
				{/* Hero Section */}
				<section className="flex-grow flex items-center justify-center px-4 py-20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-gray-800/50">
					<div className="max-w-3xl w-full text-center">
						<div className="mb-10">
							<h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
									Voteng
								</span>
							</h1>
							<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium">
								Secure, transparent, and accessible voting for everyone.
							</p>
						</div>

						{/* Election ID Input Card */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-700 p-8 md:p-12 max-w-xl mx-auto transform transition hover:scale-[1.01]">
							<p className="text-gray-500 dark:text-gray-400 mb-8">
								Enter/Paste-in the unique ID provided by your administrator to continue
							</p>

							<div className="flex flex-col gap-3">
								<input
									type="text"
									value={electionId}
									onChange={(e) => setElectionId(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && processElection(electionId)}
									placeholder="Election ID"
									className="flex-1 px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all font-mono tracking-widest"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
									disabled={isLoading}
									autoFocus
								/>
								<button
									onClick={() => processElection(electionId)}
									disabled={isLoading || !electionId.trim()}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
								>
									{isLoading ? (
										<>
											<svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Processing...
										</>
									) : (
										'Continue to Election'
									)}
								</button>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

export default Home;