import { useState } from 'react';
import { useOTP } from '@/contexts/OTPContext'; // Removed .jsx
import { cleanNgPhoneNo, validatePhoneNo } from '@/utils/cleanPhoneNo'
import Toast from '@/utils/ToastMsg';
import { Loader2, Phone, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { sendPhoneOtp } from '@/utils/phoneOtpService';

const OTPStarterPhone = ({ electionId }) => {
	const { startVerification, status } = useOTP();
	const [phoneNumber, setPhoneNumber] = useState('');
	const [resultMessage, setResultMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('')
	const [termiiResponse, setTermiiResponse] = useState({});

	const handleStartClick = async (dest) => {
		let phoneNo = cleanNgPhoneNo(dest);

		setResultMessage('');
		try {
			const otpRequest = await sendPhoneOtp(phoneNo, electionId)

			if (otpRequest.success) {
				setTermiiResponse(otpRequest);
				const result = await startVerification(phoneNo, termiiResponse);
				
			} else {
				Toast.error("Sending OTP failed");
				throw new Error("Could not send OTP")
			}
			
		} catch (error) {
			setResultMessage(`Verification failed: ${error.message}`);
		}
	};

	return (
		<>
			<h2 className="text-3xl font-bold text-gray-800">Phone Verification</h2>
			<p className="text-gray-600">Enter your phone number to receive a verification code.</p>

			<div className="relative">
				<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
				<input
					type="tel"
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
					placeholder="e.g., 2348012345678"
					className="w-full !pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
					disabled={isLoading}
				/>
			</div>

			{error && (
				<div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
					<AlertTriangle className="w-5 h-5 mr-2" />
					<span className="font-medium">{error}</span>
				</div>
			)}

			<div className="w-full flex items-center justify-center">
				<button
					onClick={() => {
						handleStartClick(phoneNumber);
						setIsLoading(true)
					}}
					disabled={isLoading || phoneNumber.length < 11}
					className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
							Sending OTP...
						</>
					) : (
						'Request OTP'
					)}
				</button>
			</div>
			<p className="text-xs text-gray-500 text-center">
				*Standard SMS rates may apply. Use country code without '+'.
			</p>
		</>
	);
}

export default OTPStarterPhone;