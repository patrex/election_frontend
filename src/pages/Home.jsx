import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "@/App";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import isValidPhoneNumber from "@/utils/validatePhone";
import isValidEmail from "@/utils/validateEmail";
import { b64encode } from "@/utils/obfuscate";
import Toast from '@/utils/ToastMsg';
import backendUrl from '../utils/backendurl';
import { authman } from "@/utils/fireloader";

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
	const [otpValue, setOtpValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	
	// Modal states
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showOtpModal, setShowOtpModal] = useState(false);

	// Process election from query params on mount
	useEffect(() => {
		if (electionFromQueryParams) {
			processElection(electionFromQueryParams);
		}
	}, [electionFromQueryParams]);

	// Fetch and validate election
	const processElection = useCallback(async (id) => {
		if (!id || !id.trim()) {
			Toast.warning("Please enter a valid election ID");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`${backendUrl}/election/${id}`);
			
			if (!response.ok) {
				throw new Error('Election not found');
			}

			const electionData = await response.json();
			setElection(electionData);

			// Validate election timing
			const startDate = new Date(electionData.startDate);
			const endDate = new Date(electionData.endDate);
			const currentDate = new Date();

			if (endDate < currentDate) {
				Toast.warning("This election has concluded");
				navigate(`/election/${electionData._id}/results`);
			} else if (startDate > currentDate) {
				Toast.warning(`This election starts on ${startDate.toLocaleDateString()}`);
			} else {
				setShowAuthModal(true);
			}
		} catch (error) {
			Toast.error("Election not found. Please check the ID and try again");
			console.error('Error fetching election:', error);
		} finally {
			setIsLoading(false);
		}
	}, [navigate]);

	// Validate and process participant input
	const handleParticipantSubmit = useCallback(async () => {
		if (!participant.trim()) {
			Toast.warning(`Please enter your ${election.userAuthType === 'email' ? 'email' : 'phone number'}`);
			return;
		}

		const trimmedParticipant = participant.trim();

		// Validate based on auth type
		if (election.userAuthType === 'email') {
			if (!isValidEmail(trimmedParticipant)) {
				Toast.warning("Please enter a valid email address");
				return;
			}
		} else if (election.userAuthType === 'phone') {
			if (!isValidPhoneNumber(trimmedParticipant)) {
				Toast.warning("Please enter a valid phone number (e.g., +1234567890)");
				return;
			}
		}

		setParticipant(trimmedParticipant);
		await checkAndProcessVoter(trimmedParticipant);
	}, [participant, election]);

	// Check if voter exists and process accordingly
	const checkAndProcessVoter = async (participantId) => {
		setIsLoading(true);

		try {
			const response = await fetch(`${backendUrl}/election/${election._id}/voterlist`);
			const voterList = await response.json();

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

	// Send OTP based on auth type
	const sendOtp = async (participantId) => {
		try {
			if (election.userAuthType === 'phone') {
				await sendPhoneOtp(participantId);
			} else {
				await sendEmailOtp(participantId);
			}
		} catch (error) {
			Toast.error('Failed to send verification code. Please try again');
			console.error('Error sending OTP:', error);
		}
	};

	// Send OTP via phone
	const sendPhoneOtp = async (phoneNumber) => {
		try {
			window.recaptchaVerifier = new RecaptchaVerifier(
				authman,
				'recaptcha-container',
				{
					size: 'invisible',
					callback: () => {
						setShowAuthModal(false);
						setShowOtpModal(true);
					}
				},
				authman
			);

			const appVerifier = window.recaptchaVerifier;
			const confirmationResult = await signInWithPhoneNumber(authman, phoneNumber, appVerifier);
			
			window.confirmationResult = confirmationResult;
			Toast.success('Verification code sent to your phone');
			setShowAuthModal(false);
			setShowOtpModal(true);
		} catch (error) {
			Toast.error('Failed to send SMS. Please check your phone number');
			console.error('Error sending phone OTP:', error);
		}
	};

	// Send OTP via email
	const sendEmailOtp = async (email) => {
		try {
			const response = await fetch(`${backendUrl}/otp/getOTP/email`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					participant: email,
					electionId: election._id
				}),
			});

			if (response.ok) {
				Toast.success('Verification code sent to your email');
				setShowAuthModal(false);
				setShowOtpModal(true);
			} else {
				throw new Error('Failed to send email OTP');
			}
		} catch (error) {
			Toast.error('Failed to send verification email');
			console.error('Error sending email OTP:', error);
		}
	};

	// Verify OTP and add voter
	const handleOtpVerification = async () => {
		if (!otpValue.trim()) {
			Toast.warning("Please enter the verification code");
			return;
		}

		setIsLoading(true);

		try {
			if (election.userAuthType === 'phone') {
				await verifyPhoneOtp();
			} else {
				await verifyEmailOtp();
			}
		} catch (error) {
			Toast.error('Verification failed. Please check your code and try again');
			console.error('OTP verification error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Verify phone OTP
	const verifyPhoneOtp = async () => {
		try {
			const result = await window.confirmationResult.confirm(otpValue);
			await addVoterToDatabase();
		} catch (error) {
			Toast.warning("Invalid verification code");
			throw error;
		}
	};

	// Verify email OTP
	const verifyEmailOtp = async () => {
		try {
			const response = await fetch(`${backendUrl}/otp/${otpValue}/verifyOTP`);
			
			if (response.ok) {
				await addVoterToDatabase();
			} else {
				Toast.warning("Invalid verification code");
				throw new Error('Invalid OTP');
			}
		} catch (error) {
			throw error;
		}
	};

	// Add voter to database
	const addVoterToDatabase = async () => {
		try {
			await fetch(`${backendUrl}/election/${election._id}/addvoter/participant`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					participant, 
					electionId: election._id 
				}),
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
			throw error;
		}
	};

	// Reset modals
	const closeAuthModal = () => {
		setShowAuthModal(false);
		setParticipant('');
	};

	const closeOtpModal = () => {
		setShowOtpModal(false);
		setOtpValue('');
	};

	return (
		<>
			{/* Authentication Modal */}
			{showAuthModal && election && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
						{/* Modal Header */}
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
								{election.title}
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Enter your {election.userAuthType === 'email' ? 'email address' : 'phone number'} to participate
							</p>
						</div>

						{/* Input Field */}
						<div className="mb-6">
							<label 
								htmlFor="participant-input" 
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								{election.userAuthType === 'email' ? 'Email Address' : 'Phone Number'}
							</label>
							<input
								type={election.userAuthType === 'email' ? 'email' : 'tel'}
								id="participant-input"
								value={participant}
								onChange={(e) => setParticipant(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleParticipantSubmit()}
								placeholder={election.userAuthType === 'email' ? 'your.email@example.com' : '+1234567890'}
								className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
								disabled={isLoading}
								autoFocus
							/>
							{election.userAuthType === 'phone' && (
								<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
									Include country code (e.g., +1 for USA)
								</p>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleParticipantSubmit}
								disabled={isLoading}
								className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? 'Processing...' : 'Continue'}
							</button>
							<button
								onClick={closeAuthModal}
								disabled={isLoading}
								className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* OTP Verification Modal */}
			{showOtpModal && election && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
						{/* Modal Header */}
						<div className="mb-6">
							<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
								Verify Your Identity
							</h2>
							<p className="text-gray-600 dark:text-gray-300 text-center text-sm">
								We've sent a verification code to your {election.userAuthType === 'email' ? 'email' : 'phone'}
							</p>
						</div>

						{/* OTP Input */}
						<div className="mb-6">
							<label 
								htmlFor="otp-input" 
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Verification Code
							</label>
							<input
								type="text"
								id="otp-input"
								value={otpValue}
								onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
								onKeyPress={(e) => e.key === 'Enter' && handleOtpVerification()}
								placeholder="Enter 6-digit code"
								maxLength="6"
								className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
								disabled={isLoading}
								autoFocus
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleOtpVerification}
								disabled={isLoading || otpValue.length < 4}
								className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? 'Verifying...' : 'Verify'}
							</button>
							<button
								onClick={closeOtpModal}
								disabled={isLoading}
								className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								Cancel
							</button>
						</div>

						{/* Resend Link */}
						<div className="mt-4 text-center">
							<button
								onClick={() => sendOtp(participant)}
								disabled={isLoading}
								className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
							>
								Didn't receive code? Resend
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				{/* Hero Section */}
				<div className="flex-grow flex items-center justify-center px-4 py-12">
					<div className="max-w-3xl w-full text-center">
						{/* Logo/Title */}
						<div className="mb-8">
							<h1 className="text-6xl md:text-7xl font-extrabold mb-4">
								<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									Votify
								</span>
							</h1>
							<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
								Secure, transparent, and accessible voting for everyone
							</p>
						</div>

						{/* Features */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encrypted voting</p>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
								<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Transparent</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">Real-time verifiable results</p>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
								<div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Accessible</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">Vote from anywhere, anytime</p>
							</div>
						</div>

						{/* Election ID Input */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								Join an Election
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Enter the election ID provided by your election administrator
							</p>
							
							<div className="flex flex-col sm:flex-row gap-3">
								<input
									type="text"
									value={electionId}
									onChange={(e) => setElectionId(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && processElection(electionId)}
									placeholder="Enter election ID..."
									className="flex-1 px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg transition"
									disabled={isLoading}
									autoFocus
								/>
								<button
									onClick={() => processElection(electionId)}
									disabled={isLoading || !electionId.trim()}
									className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
								>
									{isLoading ? (
										<span className="flex items-center">
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
				{/* reCAPTCHA Container */}
				<div id="recaptcha-container"></div>
			</div>
		</>
	);
}

export default Home;