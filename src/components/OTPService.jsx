import { useState } from 'react';

/**
 * OTPVerification Component
 * 
 * @param {Object} props
 * @param {string} props.phoneNumber - The phone number to send OTP to
 * @param {string} props.redirectUrl - URL to redirect after successful verification
 * @param {Function} props.onSuccess - Optional callback after successful verification
 * @param {Function} props.onCancel - Optional callback when user cancels
 * @param {Function} props.sendOtpApi - Function to send OTP (should return Promise)
 * @param {Function} props.verifyOtpApi - Function to verify OTP (should return Promise with success boolean)
 */
const OTPVerification = ({
	phoneNumber,
	redirectUrl,
	onSuccess,
	onCancel,
	sendOtpApi,
	verifyOtpApi
}) => {
	const [otpValue, setOtpValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const base = process.env.NOTIFICATIONS_BASE_URL;
	const apiKey = process.env.NOTIFICATIONS_PROVIDER_KEY;

	const [termii, setTermii] = useState(null);	//	for Termii

	const handleSendOtp = async () => {
		setIsLoading(true);
		setError('');
		try {
			await sendOtpApi(phoneNumber);
		} catch (err) {
			setError(err.message || 'Failed to send OTP');
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOtp = async () => {
		if (otpValue.length < 4) return;

		setIsLoading(true);
		setError('');

		try {
			const result = await verifyOtpApi(phoneNumber, otpValue);

			if (result.success) {
				if (onSuccess) {
					onSuccess(result);
				}
				if (redirectUrl) {
					window.location.href = redirectUrl;
				}
			} else {
				setError(result.message || 'Invalid verification code');
			}
		} catch (err) {
			setError(err.message || 'Verification failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	return (
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
						We've sent a verification code to {phoneNumber}
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg text-sm">
						{error}
					</div>
				)}

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
						onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
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
						onClick={handleVerifyOtp}
						disabled={isLoading || otpValue.length < 4}
						className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Verifying...' : 'Verify'}
					</button>
					<button
						onClick={handleCancel}
						disabled={isLoading}
						className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
				</div>

				{/* Resend Link */}
				<div className="mt-4 text-center">
					<button
						onClick={handleSendOtp}
						disabled={isLoading}
						className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
					>
						Didn't receive code? Resend
					</button>
				</div>
			</div>
		</div>
	);
};

// Example usage component
const ExampleUsage = () => {
	const [showOtp, setShowOtp] = useState(false);

	// Mock API functions (replace with your actual API calls)
	const sendOtpApi = async (phoneNumber) => {
		console.log('Sending OTP to:', phoneNumber);
		// Simulate API call
		return new Promise((resolve) => setTimeout(resolve, 1000));
	};

	const verifyOtpApi = async (phoneNumber, otp) => {
		console.log('Verifying OTP:', otp, 'for:', phoneNumber);
		// Simulate API call
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					success: otp === '123456',
					message: otp === '123456' ? 'Success' : 'Invalid code'
				});
			}, 1000);
		});
	};

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
					OTP Verification Component Demo
				</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Test the Component
					</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						Click the button below to trigger the OTP verification modal.
						For demo purposes, use code <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">123456</code> to verify successfully.
					</p>
					<button
						onClick={() => setShowOtp(true)}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Start OTP Verification
					</button>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Usage Instructions
					</h2>
					<pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
						{`<OTPVerification
						phoneNumber="234803XXXXXXX"
						redirectUrl="/dashboard"
						onSuccess={(result) => console.log('Success:', result)}
						onCancel={() => console.log('Cancelled')}
						sendOtpApi={sendOtpApi}
						verifyOtpApi={verifyOtpApi}
						/>`}
					</pre>
				</div>
			</div>

			{showOtp && (
				<OTPVerification
					phoneNumber="234803XXXXXXX"
					redirectUrl="/dashboard"
					onSuccess={(result) => {
						console.log('Verification successful:', result);
						setShowOtp(false);
					}}
					onCancel={() => setShowOtp(false)}
					sendOtpApi={sendOtpApi}
					verifyOtpApi={verifyOtpApi}
				/>
			)}
		</div>
	);
};

export default ExampleUsage;