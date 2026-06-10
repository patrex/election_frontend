import { useState, useEffect, useRef, useContext, createContext, useCallback } from 'react';
import OTPInput from '../components/OTPInput.jsx';
import { sendPhoneOtp, verifyPhoneOtp } from '@/utils/phoneOtpService.js';
import { cleanNgPhoneNo, validatePhoneNo } from '@/utils/cleanPhoneNo';

import { useElection } from './ElectionContext.jsx';

// =================================================================
// Constants
// =================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

// =================================================================
// Context
// =================================================================

const OTPContext = createContext();

export const useOTP = () => {
	const context = useContext(OTPContext);
	if (!context) throw new Error('useOTP must be used within an OTPProvider');
	return context;
};

// =================================================================
// Helpers
// =================================================================

/**
 * Normalises and validates a destination (email or NG phone number).
 * Returns the cleaned destination string, or throws if invalid.
 */
const parseDestination = (raw) => {
	const trimmed = raw.trim();
	if (EMAIL_REGEX.test(trimmed)) return trimmed;
	if (validatePhoneNo(trimmed)) return cleanNgPhoneNo(trimmed);
	throw new Error('Invalid destination. Must be a valid email or Nigerian phone number.');
};

// =================================================================
// Modal
// =================================================================

const OTPVerificationModal = () => {
	const { isModalOpen, destination, handleCancel, handleSuccess } = useOTP();

	const { election } = useElection();

	const [otpValue, setOtpValue]     = useState('');
	const [isLoading, setIsLoading]   = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [error, setError]           = useState('');
	const [resendTimer, setResendTimer] = useState(0);

	// Holds the response from sendPhoneOtp (contains pinId etc.)
	const otpRequestRef = useRef(null);
	const timerRef      = useRef(null);

	// ── Reset & auto-send whenever the modal opens ──────────────────
	useEffect(() => {
		if (!isModalOpen) {
			clearTimeout(timerRef.current);
			setResendTimer(0);
			return;
		}

		setOtpValue('');
		setIsVerified(false);
		setError('');
		otpRequestRef.current = null;
		sendOtp();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalOpen, destination]);

	// ── Countdown timer ─────────────────────────────────────────────
	useEffect(() => {
		if (resendTimer <= 0) return;
		timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
		return () => clearTimeout(timerRef.current);
	}, [resendTimer]);

	// ── Send OTP ─────────────────────────────────────────────────────
	const sendOtp = useCallback(async () => {
		if (isLoading || resendTimer > 0) return;

		setIsLoading(true);
		setError('');

		try {
			otpRequestRef.current = await sendPhoneOtp(destination, election._id);
			setResendTimer(RESEND_COOLDOWN);
		} catch (err) {
			setError(err.message || 'Failed to send code. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, [destination, isLoading, resendTimer]);

	// ── Verify OTP ───────────────────────────────────────────────────
	const verifyOtp = useCallback(async (codeOverride) => {
		const code = codeOverride ?? otpValue;
		if (code.length !== 6) {
			setError('Please enter the complete 6-digit code.');
			return;
		}

		if (!otpRequestRef.current) {
			setError('No OTP request found. Please resend the code.');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			const result = await verifyPhoneOtp({
				pinId:   otpRequestRef.current.pinId,
				otpCode: code,
			});

			if (result.success) {
				setIsVerified(true);
				setTimeout(() => handleSuccess(result), 1000);
			} else {
				setError(result?.message || 'Invalid code. Please try again.');
				setIsLoading(false);
			}
		} catch (err) {
			setError(err.message || 'Verification failed. Please try again.');
			setIsLoading(false);
		}
	}, [otpValue, handleSuccess]);

	if (!isModalOpen) return null;

	const canVerify = !isLoading && otpValue.length === 6 && !isVerified;
	const canResend = !isLoading && resendTimer === 0 && !isVerified && otpRequestRef.current;

	return (
		<div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">

				{/* Close */}
				<button
					onClick={handleCancel}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
					aria-label="Close"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Header */}
				<div className="mb-6 text-center">
					<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						{isVerified ? (
							<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						) : (
							<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						)}
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-1">
						{isVerified ? 'Verified!' : 'Enter Verification Code'}
					</h2>
					<p className="text-sm text-gray-500">
						Code sent to{' '}
						<span className="font-semibold text-gray-800">{destination}</span>
					</p>
				</div>

				{/* Feedback */}
				{isVerified ? (
					<div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm text-center">
						Verification complete. Closing shortly…
					</div>
				) : error ? (
					<div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
						{error}
					</div>
				) : null}

				{/* OTP Input */}
				{!isVerified && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-4 text-center">
							6-Digit Code
						</label>
						<OTPInput
							length={6}
							onChange={setOtpValue}
							onComplete={verifyOtp}
						/>
					</div>
				)}

				{/* Actions */}
				{!isVerified && (
					<>
						<div className="flex gap-3 mt-6">
							<button
								onClick={() => verifyOtp()}
								disabled={!canVerify}
								className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
								) : 'Verify Code'}
							</button>
							<button
								onClick={handleCancel}
								disabled={isLoading}
								className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
						</div>

						<div className="mt-4 text-center">
							<button
								onClick={sendOtp}
								disabled={!canResend}
								className="text-sm font-medium transition-colors disabled:text-gray-400 enabled:text-blue-600 enabled:hover:text-blue-700"
							>
								{resendTimer > 0
									? `Resend in ${resendTimer}s`
									: "Didn't receive a code? Resend"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

// =================================================================
// Provider
// =================================================================

/**
 * Wrap your app with OTPProvider, then call startVerification(destination)
 * from any component. It returns a Promise that resolves with the
 * verification result or rejects if the user cancels / an error occurs.
 *
 * @example
 * const { startVerification } = useOTP();
 * try {
 *   const result = await startVerification('+2348012345678');
 *   console.log('Verified!', result);
 * } catch (err) {
 *   console.log('Not verified:', err.message);
 * }
 */
export const OTPProvider = ({ children }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [destination, setDestination] = useState('');

	const resolveRef = useRef(null);
	const rejectRef  = useRef(null);

	const startVerification = useCallback((rawDestination) => {
		return new Promise((resolve, reject) => {
			let dest;
			try {
				dest = parseDestination(rawDestination);
			} catch (err) {
				reject(err);
				return;
			}

			resolveRef.current = resolve;
			rejectRef.current  = reject;
			setDestination(dest);
			setIsModalOpen(true);
		});
	}, []);

	const handleSuccess = useCallback((result) => {
		setIsModalOpen(false);
		resolveRef.current?.(result);
	}, []);

	const handleCancel = useCallback(() => {
		setIsModalOpen(false);
		rejectRef.current?.(new Error('Verification cancelled by user'));
	}, []);

	return (
		<OTPContext.Provider value={{ isModalOpen, destination, startVerification, handleSuccess, handleCancel }}>
			{children}
			<OTPVerificationModal />
		</OTPContext.Provider>
	);
};