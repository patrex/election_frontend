import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { AppContext } from "@/App";
import { b64encode } from "@/utils/obfuscate";
import Toast from '@/utils/ToastMsg';
import { fetcher, FetchError } from "@/utils/fetcher";
import moment from "moment";
import OTPStarterPhone from "@/components/OtpStarterPhone";
import PhoneInput from "@/components/CollectPhoneNumber";
import { cleanNgPhoneNo, validatePhoneNo } from "@/utils/cleanPhoneNo";
import isValidEmail from "@/utils/validateEmail";

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

	const [isLoading, setIsLoading] = useState(false);
	
	const participant = useRef(null);

	// Modals
	const [openOptionsModal, setOpenOptionsModal] = useState(false);
	const [otpStarterModal, setOtpStarterModal] = useState(false);
	const [regVoterModal, setRegVoterModal] = useState(false);
	const [checkVoterModal, setCheckVoterModal] = useState(false);
	const [electionEndedModal, setElectionEndedModal] = useState(false);

	// Auto-process if ID comes from URL
	useEffect(() => {
		if (electionFromQueryParams) processElection(electionFromQueryParams);
	}, [electionFromQueryParams]);

	/**
	 * Determines the current status of the election based on date ranges
	 */
	const getEventStatus = (startDate, endDate) => {
		const now = new Date();
		return {
			isPending: now < startDate,
			hasEnded: now > endDate,
			isActive: now >= startDate && now <= endDate
		};
	};

	/**
	 * Main entry point: Fetches election and triggers correct Modal path
	 */
	const processElection = async (id) => {
		if (!id?.trim()) return Toast.warning("Please enter a valid election ID");

		setIsLoading(true);
		try {
			const e = await fetcher.get(`election/${id}`);
			if (!e) throw new Error("No election was found with that ID!");
			
			setElection(e);

			const { isPending, hasEnded } = getEventStatus(new Date(e.startDate), new Date(e.endDate));

			// Logic Branching
			if (hasEnded) return setElectionEndedModal(true);
			if (isPending) return setOpenOptionsModal(true);

			// Default: Election is active
			setCheckVoterModal(true);
		} catch (error) {
			Toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Validates the voter against the fetched election's voter list
	 */
	const checkAndProcessVoter = async (participantId) => {
		setRegVoterModal(false);
		setCheckVoterModal(false);
		setIsLoading(true);

		// Capture the phone/email immediately so addVoterToDatabase can use it later
		participant.current = participantId;

		try {
			const voterList = await fetcher.get(`election/${election._id}/voterlist`);
			const isPhoneType = election.userAuthType === 'phone';
			const existingVoters = voterList.map(v => isPhoneType ? v.phoneNo : v.email);

			if (!voterList) throw new Error("There was a problem fetching the list of voters");

			// 1. Path for Existing Voters
			if (existingVoters.includes(participant.current)) {
				// TODO: do otp verification here...
				setVoter(participant.current);
				return navigate(`/election/${election._id}/${b64encode(participant.current)}`);
			}

			// 2. Path for Closed Elections (Unauthorized)
			if (election.type === 'Closed') {
				return Toast.warning(
					`This is a closed election. Your ${isPhoneType ? 'phone' : 'email'} was not found in the pre-registered list`);
			}

			// 3. Path for New Voters in Open Elections
			// Trigger the OTP modal to verify the new participant
			setRegVoterModal(true);

		} catch (error) {
			Toast.error('Unable to verify voter status.');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Finalizes registration and navigates to ballot
	 */
	const addVoterToDatabase = async () => {
		let electionAuth = election.userAuthType;
		let currentVoter = participant.current;
		let newVoter = '';

		if (!currentVoter) 
			return Toast.error(`You need to enter ${electionAuth === 'phone' ? 'a phone number' : 'an email'} to continue`);

		if (electionAuth === 'phone') {
			let temp = cleanNgPhoneNo(currentVoter);

			if (!validatePhoneNo(temp)) 
				return Toast.error("Phone number not valid")
			
			console.log(temp);
			
			newVoter = temp;
		} else if (electionAuth === 'email') {
			if(!isValidEmail(currentVoter)) 
				return Toast.error("Email not properly formatted");

			newVoter =  currentVoter;
		}
		

		try {
			await fetcher.post(`election/${election._id}/addvoter/participant`, {
				participant: newVoter,
				electionId: election._id
			});

			setVoter(newVoter);
			Toast.success('Verification successful!');

			setTimeout(() => {
				navigate(`/election/${election._id}/${b64encode(participant.current)}`);
			}, 500);
		} catch (error) {
			Toast.error('Failed to register voter');
		}
	};

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
									placeholder="Election ID..."
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

				{/* Unified Modal Logic */}
				{[
					{ show: otpStarterModal, setter: setOtpStarterModal, content: <OTPStarterPhone electionId={election?._id} optns={{ action: 'redir', optn: `election/${election?._id}/addcandidate` }} /> },
					{ show: regVoterModal, setter: setRegVoterModal, content: <OTPStarterPhone electionId={election?._id} optns={{ action: 'fn', optn: addVoterToDatabase, voter: participant.current }} /> },
					{ show: checkVoterModal, setter: setCheckVoterModal, content: <PhoneInput action={checkAndProcessVoter} /> }
				].map((modal, idx) => modal.show && (
					<div key={idx} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
						<div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl relative p-6 animate-in fade-in zoom-in duration-200">
							<button onClick={() => modal.setter(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
							<div className="pt-4">{modal.content}</div>
						</div>
					</div>
				))}

				{/* Election State Modals (Ended/Not Started) */}
				{(electionEndedModal || openOptionsModal) && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
						<div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
							<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 relative">
								<button
									onClick={() => { setElectionEndedModal(false); setOpenOptionsModal(false); }}
									className="absolute top-4 right-4 text-white/80 hover:text-white"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
								</button>
								<h3 className="text-2xl font-bold text-white mb-2">{election.title}</h3>
								<p className="text-blue-100 text-sm">
									{electionEndedModal
										? `Election ended ${moment(election.endDate).calendar()}`
										: `Starts in ${moment(election.startDate).fromNow()}`}
								</p>
							</div>

							<div className="p-8">
								{electionEndedModal ? (
									<div className="text-center">
										<p className="text-gray-600 dark:text-gray-300 mb-6">Voting is now closed for this election.</p>
										<Link to={`/election/${election._id}/results`} className="inline-block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
											View Official Results
										</Link>
									</div>
								) : (
									<div className="space-y-6">
										{election.addCandidatesBy === "Candidates Will Add Themselves" && (
											<div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
												<p className="text-gray-800 dark:text-gray-200">
													Want to run for a position?
													<button
														onClick={() => { setOtpStarterModal(true); setOpenOptionsModal(false); }}
														className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-2"
													>
														Register here
													</button>
													as a candidate.
												</p>
												<div className="flex gap-3 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
													<svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
													<p><strong>Note:</strong> Registering here does not automatically guarantee you on the ballot. Your election administrator has to approve your application</p>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default Home;