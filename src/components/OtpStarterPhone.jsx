import { useState } from 'react';
import { useOTP } from '@/contexts/OTPContext'; // Removed .jsx
import { cleanNgPhoneNo, validatePhoneNo } from '@/utils/cleanPhoneNo'
import Toast from '@/utils/ToastMsg';
import { Loader2, Phone, AlertTriangle } from 'lucide-react';

const OTPStarterPhone = () => {
	const { startVerification, status } = useOTP();
	const [phoneNumber, setPhoneNumber] = useState('');
	const [resultMessage, setResultMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('')

	const handleStartClick = async (dest) => {
		let phoneNo = cleanNgPhoneNo(dest);

		setResultMessage('');
		try {
			// Call the globally available function to trigger the modal
			const result = await startVerification(phoneNo);
		} catch (error) {
			setResultMessage(`Verification failed: ${error.message}`);
		}
	};

	return (
		<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
			<button
				onClick=''
				className="absolute top-4 right-4 text-white hover:text-indigo-200 transition p-1 z-20"
				aria-label="Close modal"
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<h2 className="text-3xl font-bold text-gray-800">Phone Verification</h2>
			<p className="text-gray-600">Enter your phone number to receive a verification code.</p>

			<div className="relative">
				<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
				<input
					type="tel"
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
					placeholder="e.g., 2348012345678"
					className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
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
					disabled={isLoading || phoneNumber.length < 10}
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
		</div>
	);
}

export default OTPStarterPhone;