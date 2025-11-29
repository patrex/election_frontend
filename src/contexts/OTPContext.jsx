import { useState, useEffect, useRef, useContext, createContext, useCallback } from 'react';
import OTPInput from '../components/OTPInput.jsx'; // FIX: Added .jsx extension
import { sendPhoneOtp, verifyPhoneOtp } from '@/utils/phoneOtpService.js'
import { cleanNgPhoneNo, validatePhoneNo } from '@/utils/cleanPhoneNo';

// =================================================================
// Context Setup
// =================================================================

const OTPContext = createContext();

/**
 * Custom hook for components to easily trigger verification and access status.
 * @returns {{
 * isModalOpen: boolean,
 * destination: string,
 * status: string,
 * startVerification: (destination: string) => Promise<{success: boolean, token: string}>,
 * handleCancel: () => void,
 * handleSuccess: (result: object) => void,
 * setStatus: (status: string) => void
 * }}
 */
export const useOTP = () => {
	const context = useContext(OTPContext);
	if (context === undefined) {
		throw new Error('useOTP must be used within an OTPProvider');
	}
	return context;
};


// =================================================================
// OTP Verification Modal Component
// Renders the overlay and handles the verification logic flow
// =================================================================

const OTPVerificationModal = () => {
	const {
		isModalOpen, destination,
		handleCancel, handleSuccess,
		setStatus, electionId
	} = useOTP();

	const [otpValue, setOtpValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [error, setError] = useState('');
	const [resendTimer, setResendTimer] = useState(0);
	const [otpResponseObj, setOtpResponseObj] = useState(null);

	const timerRef = useRef(null);

	// Reset state and trigger initial send when modal opens
	useEffect(() => {
		if (isModalOpen) {
			setOtpValue('');
			setIsVerified(false);
			setError('');
			handleSendOtp(destination);
		} else {
			clearTimeout(timerRef.current);
			setResendTimer(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalOpen, destination]);

	useEffect(() => {
		console.log(`OTPVerification Modal: ${electionId}`);
	}, [electionId])

	// Timer Logic
	useEffect(() => {
		if (resendTimer > 0) {
			timerRef.current = setTimeout(() => {
				setResendTimer(resendTimer - 1);
			}, 1000);
		} else if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		return () => clearTimeout(timerRef.current);
	}, [resendTimer]);

	const startTimer = () => setResendTimer(60);

	const handleSendOtp = useCallback(async (dest) => {
		console.log(`handleSendOtp: ${electionId}`);

		if (resendTimer > 0 && isSent) return;

		setIsLoading(true);
		setError('');
		setStatus(`Sending OTP to ${dest}...`);
		try {
			let req_obj = await sendPhoneOtp(dest, electionId);
			setOtpResponseObj(req_obj.data)

			setIsSent(true);
			startTimer();
			setStatus(`Code sent to ${dest}. Ready for verification.`);
		} catch (err) {
			// Note: The mock API rejects with an Error object
			setError(err.message || 'Failed to send code. Please try again.');
			setStatus(`Error: Failed to send code.`);
		} finally {
			setIsLoading(false);
		}
	}, [isSent, resendTimer, setStatus]);

	const handleVerifyOtp = useCallback(async (otpOverride = null) => {
		const otpToVerify = otpOverride || otpValue;

		if (otpToVerify.length !== 6) {
			setError('Please enter the complete 6-digit code.');
			return;
		}

		setIsLoading(true);
		setError('');
		setStatus(`Verifying OTP: ${otpToVerify}...`);

		try {
			const result = await verifyPhoneOtp({
				code: otpResponseObj.otp,
				pinId: otpResponseObj.pin_id
			});

			if (result.success) {
				setIsVerified(true);
				setStatus(`SUCCESS: Verification complete.`);
				// Success feedback before closing modal
				setTimeout(() => {
					handleSuccess(result); // Call context success handler to resolve promise and close modal
				}, 1000);
			} else {
				setError(result?.message || 'Invalid verification code. Try again.');
			}
		} catch (err) {
			setError(err.message || 'Verification failed due to an error.');
		} finally {
			if (!isVerified) {
				setIsLoading(false);
			}
		}
	}, [destination, handleSuccess, otpValue, isVerified, setStatus]);

	// Stop rendering if the modal is not open
	if (!isModalOpen) return null;

	const isVerifyDisabled = isLoading || otpValue.length < 6 || isVerified;
	const isResendDisabled = isLoading || resendTimer > 0 || isVerified;

	return (
		<div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100 ease-out duration-300 relative">

				{/* Close Button */}
				<button
					onClick={handleCancel}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
					aria-label="Close modal"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Header */}
				<div className="mb-6 text-center">
					<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						{isVerified ? (
							<svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						) : (
							<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						)}
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						{isVerified ? 'Verification Successful!' : 'Enter Verification Code'}
					</h2>
					<p className="text-gray-600 text-sm">
						Code sent to: <span className="font-semibold text-gray-800 break-all">{destination}</span>
					</p>
				</div>

				{/* Messages */}
				{isVerified ? (
					<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center font-medium">
						Verification is complete. Closing modal shortly.
					</div>
				) : (
					error && (
						<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
							{error}
						</div>
					)
				)}

				{/* Collect OTP Code */}
				{!isVerified && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-4 text-center">
							Verification Code (6 Digits)
						</label>
						<OTPInput
							length={6}
							onChange={setOtpValue}
							onComplete={handleVerifyOtp}
						/>
					</div>
				)}

				{/* Actions */}
				{!isVerified && (
					<>
						<div className="flex gap-3 mb-4 mt-6">
							<button
								onClick={() => handleVerifyOtp()}
								disabled={isVerifyDisabled}
								className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								) : 'Verify Code'}
							</button>
							<button
								onClick={handleCancel}
								disabled={isLoading}
								className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
							>
								Cancel
							</button>
						</div>

						{/* Resend Link with Timer */}
						<div className="mt-2 text-center">
							<button
								onClick={() => handleSendOtp(destination)}
								disabled={isResendDisabled}
								className={`text-sm font-medium transition-colors disabled:opacity-50 ${isResendDisabled ? 'text-gray-500' : 'text-blue-600 hover:text-blue-700'}`}
							>
								{resendTimer > 0 ? (
									`Resend code in ${resendTimer}s`
								) : (
									'Didn\'t receive code? Resend now'
								)}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};


// =================================================================
// OTP Provider Component
// Wraps the application and manages the global state
// =================================================================

/**
 * The Provider component that must wrap the entire application.
 * It holds the state for the OTP modal and exposes controls via context.
 */
export const OTPProvider = ({ children }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [destination, setDestination] = useState('');
	const [status, setStatus] = useState('Awaiting Verification Trigger');
	const [electionId, setElectionId] = useState();
	const resolveRef = useRef(null);
	const rejectRef = useRef(null);

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Function exposed to trigger the verification flow from any component
	const startVerification = (inputDestination, election_id) => {
		console.log(`startVerification: ${election_id}`);
		return new Promise((resolve, reject) => {
			let finalDestination = inputDestination.trim();
			if (EMAIL_REGEX.test(finalDestination)) {
				// Input is a valid email
			} else if (validatePhoneNo(finalDestination)) {
				// Input is a Nigerian phone number, normalize it
				finalDestination = cleanNgPhoneNo(finalDestination);
			} else {
				// Reject promise if format is invalid
				reject(new Error('Invalid destination format. Must be a valid email or Nigerian phone number.'));
				return;
			}

			// Set state to open modal and store promise handlers
			setDestination(finalDestination);
			setElectionId(election_id);
			setIsModalOpen(true);
			setStatus(`Verification started for: ${finalDestination}`);
			resolveRef.current = resolve;
			rejectRef.current = reject;
		});
	};

	// Called by the Modal upon successful verification
	const handleSuccess = (result) => {
		setIsModalOpen(false);
		if (resolveRef.current) {
			resolveRef.current(result);
		}
	};

	// Called by the Modal upon cancellation
	const handleCancel = () => {
		setIsModalOpen(false);
		setStatus('Verification cancelled by user.');
		if (rejectRef.current) {
			rejectRef.current(new Error('Verification cancelled by user.'));
		}
	};

	const contextValue = {
		isModalOpen,
		destination,
		status,
		electionId,
		startVerification,
		handleCancel,
		handleSuccess,
		setStatus
	};

	return (
		<OTPContext.Provider value={contextValue}>
			{children}
			{/* The modal is rendered here, outside the main application flow */}
			<OTPVerificationModal />
		</OTPContext.Provider>
	);
};