import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "@/App";
import { b64encode } from "@/utils/obfuscate";
import Toast from '@/utils/ToastMsg';
import { fetcher, FetchError } from "@/utils/fetcher";
import moment from "moment";
import OTPStarterPhone from "@/components/OtpStarterPhone";

export async function homeLoader({ request }) {
	const url = new URL(request.url);
	const electionid = url.searchParams.get("event_id");
	return electionid;
}

function Home() {
	const navigate = useNavigate();
	const electionFromQueryParams = useLoaderData();
	const { setVoter } = useContext(AppContext);

	// State management
	const [electionId, setElectionId] = useState('');
	const [election, setElection] = useState(null);
	const [participant, setParticipant] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [openOptionsModal, setOpenOptionsModal] = useState(false);
	const [otpStarterModal, setOtpStarterModal] = useState(false)

	// Process election from query params on mount
	useEffect(() => {
		if (electionFromQueryParams) {
			processElection(electionFromQueryParams);
		}
	}, [electionFromQueryParams]);

	function getEventStatus(startDate, endDate) {
		const now = new Date();
		const isPending = now < startDate;
		const hasEnded = now > endDate;
		const isActive = !isPending && !hasEnded;
		
		return { isPending, hasEnded, isActive };
	}

	// Fetch and validate election
	const processElection = async (id) => {
		if (!id || !id.trim()) {
			Toast.warning("Please enter a valid election ID");
			return;
		}

		setIsLoading(true);

		try {
			const e = await fetcher.get(`election/${id}`);

			setElection(e);

			const { isPending, hasEnded } = getEventStatus(
				new Date(e.startDate),
				new Date(e.endDate)
			);

			if (hasEnded) {
				Toast.warning("This election has been concluded");
				navigate(`/election/${e._id}/results`);
			} else if (isPending) {
				setOpenOptionsModal(true);
				return;
			}

			setShowAuthModal(true);
		} catch (error) {
			Toast.error("There was an error fetching the election");
		} finally {
			setIsLoading(false);
		}
	}

	// Check if voter exists and process accordingly
	const checkAndProcessVoter = async (participantId) => {
		setIsLoading(true);

		try {
			const voterList = await fetcher.get(`election/${election._id}/voterlist`);

			const existingVoters = election.userAuthType === 'phone' 
				? voterList.map(v => v.phoneNo)
				: voterList.map(v => v.email);

			// Existing voter - redirect to ballot
			if (existingVoters.includes(participantId)) {
				setVoter(participantId);
				navigate(`/election/${election._id}/${b64encode(participantId)}`);
				return;
			}

			// New voter in closed election - reject
			if (election.type === 'Closed') {
				Toast.warning(
					`This is a closed election. Your ${election.userAuthType === 'email' ? 'email' : 'phone number'} must be pre-registered by the election administrator.`
				);
				return;
			}

			// New voter in open election - send OTP
			await sendOtp(participantId);
		} catch (error) {
			Toast.error('Unable to verify voter status. Please try again');
			console.error('Error checking voter:', error);
		} finally {
			setIsLoading(false);
		}
	};


	// Add voter to database
	const addVoterToDatabase = async () => {
		try {
			await fetcher.post(`election/${election._id}/addvoter/participant`,	
			{ 
				participant, 
				electionId: election._id 
			});

			setVoter(participant);
			Toast.success('Verification successful!');
			
			// Small delay to show success message
			setTimeout(() => {
				navigate(`/election/${election._id}/${b64encode(participant)}`);
			}, 500);
		} catch (error) {
			Toast.error('Failed to register voter');
			console.error('Error adding voter:', error);
		}
	};

	return (
		<>
			{/* Main Content */}
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				{/* Hero Section */}
				<div className="flex-grow flex items-center justify-center px-4 py-12">
					<div className="max-w-3xl w-full text-center">
						{/* Logo/Title */}
						<div className="mb-8">
							<h1 className="text-6xl md:text-7xl font-extrabold mb-4">
								<span className="bg-clip-text text-blue-600">
									Votify
								</span>
							</h1>
							<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
								Secure, transparent, and accessible voting for everyone
							</p>
						</div>

						{/* Election ID Input - Flatter, cleaner style */}
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
								Find an Election
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Enter the election ID provided by your election administrator
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<input
									type="text"
									value={electionId}
									onChange={(e) => setElectionId(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && processElection(electionId)}
									placeholder="Enter election ID..."
									className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
									disabled={isLoading}
									autoFocus
								/>
								<button
									onClick={() => processElection(electionId)}
									disabled={isLoading || !electionId.trim()}
									className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
								>
									{isLoading ? (
										<span className="flex items-center justify-center">
											<svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Loading...
										</span>
									) : (
										'Continue'
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{otpStarterModal && (
				<OTPStarterPhone />
			)}



			{openOptionsModal && (
				<div className="modal-overlay">
					<div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all relative">
						{/* Close Button (Top Right) */}
						<button
							onClick={() => setOpenOptionsModal(false)}
							className="absolute top-4 right-4 text-white hover:text-indigo-200 transition p-1 z-20"
							aria-label="Close modal"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
    
						{/* 1. Card Header Section (Cornflower Blue/Indigo) */}
						<div className="bg-blue-500 p-6 rounded-t-xl"> 
							<h3 className="text-2xl font-extrabold text-white pr-8"> {/* Added pr-8 to prevent overlap with X button */}
								{election.title}
							</h3>
							{/* Subtitle/Status */}
							<p className="text-indigo-200 text-sm mt-1 font-light">
								This election has not started yet. It will start in {`${moment(election.startDate).fromNow()}`}
							</p>
						</div>

						{/* 2. Scrollable Content Body */}
						{election.addCandidatesBy === "Candidates Will Add Themselves" && (
							<div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col space-y-6">
								{/* Information Section 1: Candidate Registration Link */}
								<div className="text-center bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
									<p className="text-gray-700 text-md font-medium">
										Click 
										<span 
											onClick={ () => {
												setOtpStarterModal(true);
												setOpenOptionsModal(false);
											}}
											className="text-indigo-600 font-semibold hover:text-indigo-800 underline mx-1 transition-colors text-undeline"
										>
											here
										</span> 
										if you want to register as a candidate.
									</p>
								</div>
								{/* 3. Informational Footer Text */}
								<div className="flex items-start p-3 bg-gray-100 rounded-lg text-gray-600 text-xs">
									{/* Information Icon (Inline SVG) */}
									<svg 
										xmlns="http://www.w3.org/2000/svg" 
										className="h-4 w-4 flex-shrink-0 mr-2 text-indigo-500 mt-0.5" 
										fill="none" 
										viewBox="0 0 24 24" 
										stroke="currentColor" 
										strokeWidth="2"
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									
									{/* Footer Text Content */}
									<p>
										<strong className="font-semibold text-gray-800">Important:</strong> Registering here does not imply you will be automatically shortlisted. The administrator still needs to approve your application before you appear on the final ballot.
									</p>
								</div>
							</div>
						)}

						{/* 4. Footer Buttons (Unchanged but styled container) */}
						<div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
							<button 
								className='bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition' 
								onClick={ ()=> setOpenOptionsModal(false) }
							>
								Ok
							</button>
						</div>
    					</div>
				</div>
			)}
		</>
	);
}

export default Home;