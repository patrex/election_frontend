import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "@/App";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import isValidPhoneNumber from "@/utils/validatePhone";
import isValidEmail from "@/utils/validateEmail";
import { b64encode } from "@/utils/obfuscate";
import Toast from '@/utils/ToastMsg';
import { fetcher, FetchError } from "@/utils/fetcher";
import { useEventStatus } from "@/hooks/useEventStatus";
import moment from "moment";

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

	const base = process.env.NOTIFICATIONS_BASE_URL;
	const apiKey = process.env.NOTIFICATIONS_PROVIDER_KEY;

	const [termii, setTermii] = useState(null);	//	for Termii

	
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
	const processElection = async (id) => {
		if (!id || !id.trim()) {
			Toast.warning("Please enter a valid election ID");
			return;
		}

		setIsLoading(true);

		try {
			const e = await fetcher.get(`election/${id}`);

			setElection(e);

			const { isPending, hasEnded } = useEventStatus(
				new Date(e.startDate),
				new Date(e.endDate)
			);

			if (hasEnded) {
				Toast.warning("This election has been concluded");
				navigate(`/election/${e._id}/results`);
			} else if (isPending) {
				Toast.warning(`Election not started. Starts in ${moment(e.startDate).fromNow()}`);
				return;
			}

			setShowAuthModal(true);
		} catch (error) {
			Toast.error("There was an error fetching the election");
		} finally {
			setIsLoading(false);
		}
	}

	// Validate and process participant input
	const handleParticipantSubmit = async () => {
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
				Toast.warning("Please enter a valid phone number (e.g., 234706XXXXXXX)");
				return;
			}
		}

		setParticipant(trimmedParticipant);
		await checkAndProcessVoter(trimmedParticipant);
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
			const payload = {
				api_key: apiKey,
				pin_type: "NUMERIC",
				phone_number: phoneNumber,
				pin_attempts: 3,
				pin_time_to_live: 10,
				pin_length: 4
			}

			const token_req = await fetch(
				`${base}/api/sms/otp/generate`, {
					method: 'POST',
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(payload),
					credentials: "include"
				}
			);

			const token_response = await token_req.json();
			setTermii(token_response);
			
			Toast.success('Verification code was sent to your phone');
			setShowAuthModal(false);
			setShowOtpModal(true);
		} catch (error) {
			const errMsg = handleOTPErrors(error)

			Toast.error(errMsg);
			console.error('Error sending phone OTP:', error);
		}
	};

	// Send OTP via email
	const sendEmailOtp = async (email) => {
		try {
			await fetcher.post(`otp/getOTP/email`, {	
					participant: email,
					electionId: election._id
				},
			);

			Toast.success('Verification code sent to your email');
			setShowAuthModal(false);
			setShowOtpModal(true);
			
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
			const payload = {
				api_key: apiKey,
             			pin_id: termii.pin_id,
             			pin: termii.otp
			}

			await fetch(
				`${base}/api/sms/otp/verify`, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload),
				credentials: 'include'
			}); 

			await addVoterToDatabase();
		} catch (error) {
			const errMsg = handleOTPErrors(error);
			Toast.warning(errMsg);
			console.log(error);
		}
	};

	// Verify email OTP
	const verifyEmailOtp = async () => {
		try {
			await fetcher.get(`otp/${otpValue}/verifyOTP`);
			await addVoterToDatabase();
		} catch (error) {
			Toast.warning("Invalid verification code");
		}
	};

	// Add voter to database
	const addVoterToDatabase = async () => {
		try {
			fetcher.post(`election/${election._id}/addvoter/participant`,	
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

	// Reset modals
	const closeAuthModal = () => {
		setShowAuthModal(false);
		setParticipant('');
	};

	const closeOtpModal = () => {
		setShowOtpModal(false);
		setOtpValue('');
	};

	function handleOTPErrors (error) {
		const statusCode = error.response?.status || error.status || 500;
		const errorDetails = error.response?.data || error.message || 'Unknown error';

		let result;

		switch (statusCode) {
			case 200:
				result = {
					success: true,
					title: "Success",
					message: "OTP sent successfully",
					userMessage: "Check your phone for the verification code.",
					code: statusCode
				};
				break;

			case 400:
				result = {
					success: false,
					title: "Invalid Request",
					message: "Bad request - check phone number format",
					userMessage: "Please check the phone number and try again.",
					code: statusCode,
					details: errorDetails
				};
				break;

			case 401:
				result = {
					success: false,
					title: "Authentication Failed",
					message: "API key is missing or invalid",
					userMessage: "Service temporarily unavailable. Please try again later.",
					code: statusCode,
					details: errorDetails,
					action: "CHECK_API_KEY"
				};
				break;

			case 403:
				result = {
					success: false,
					title: "Access Denied",
					message: "API key lacks required permissions",
					userMessage: "Service temporarily unavailable. Please contact support.",
					code: statusCode,
					details: errorDetails,
					action: "CHECK_PERMISSIONS"
				};
				break;

			case 404:
				result = {
					success: false,
					title: "Not Found",
					message: "The requested resource doesn't exist",
					userMessage: "Service temporarily unavailable. Please try again.",
					code: statusCode,
					details: errorDetails
				};
				break;

			case 405:
				result = {
					success: false,
					title: "Method Not Allowed",
					message: "Invalid HTTP method used",
					userMessage: "Something went wrong. Please try again.",
					code: statusCode,
					details: errorDetails,
					action: "CHECK_HTTP_METHOD"
				};
				break;

			case 422:
				result = {
					success: false,
					title: "Invalid Data",
					message: "Phone number format is incorrect or data is invalid",
					userMessage: "Please enter a valid Nigerian phone number (e.g., 08012345678).",
					code: statusCode,
					details: errorDetails,
					action: "VALIDATE_PHONE_NUMBER"
				};
				break;

			case 429:
				result = {
					success: false,
					title: "Too Many Attempts",
					message: "Rate limit exceeded",
					userMessage: "Too many requests. Please wait a moment and try again.",
					code: statusCode,
					details: errorDetails,
					retryAfter: 60 // seconds
				};
				break;

			case 500:
			case 502:
			case 503:
			case 504:
				result = {
					success: false,
					title: "Server Error",
					message: "Something went wrong on Termii's servers",
					userMessage: "Service temporarily unavailable. Please try again in a few moments.",
					code: statusCode,
					details: errorDetails,
					retryAfter: 30
				};
				break;

			default:
				result = {
					success: false,
					title: "Unknown Error",
					message: `Unexpected error: ${statusCode}`,
					userMessage: "An unexpected error occurred. Please try again.",
					code: statusCode,
					details: errorDetails
				};
		}

		// Log for debugging (in production, send to your logging service)
		if (!result.success) {
			console.error(`[OTP Error ${result.code}] ${result.title}: ${result.message}`, {
				details: result.details,
				timestamp: new Date().toISOString()
			});
		}

		return result;
	}

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
								onKeyDown={(e) => e.key === 'Enter' && handleParticipantSubmit()}
								placeholder={election.userAuthType === 'email' ? 'your.email@example.com' : '+1234567890'}
								className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
								disabled={isLoading}
								autoFocus
							/>
							{election.userAuthType === 'phone' && (
								<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
									Include country code (e.g., 234 for USA)
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
								onKeyDown={(e) => e.key === 'Enter' && handleOtpVerification()}
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
								<span className="bg-clip-text text-blue-600">
									Votify
								</span>
							</h1>
							<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
								Secure, transparent, and accessible voting for everyone
							</p>
						</div>

						{/* Features */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
							<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
								<div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-center">Secure</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400 text-center">End-to-end encrypted voting</p>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
								<div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-center">Transparent</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400 text-center">Real-time verifiable results</p>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
								<div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
									</svg>
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-center">Accessible</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400 text-center">Vote from anywhere, anytime</p>
							</div>
						</div>

						{/* Election ID Input - Flatter, cleaner style */}
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
		</>
	);
}

export default Home;