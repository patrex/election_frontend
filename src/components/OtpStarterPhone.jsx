import { useState } from 'react';
import { useOTP } from '@/contexts/OTPContext'; // Removed .jsx
import { cleanNgPhoneNo, validatePhoneNo } from '@/utils/cleanPhoneNo'
import Toast from '@/utils/ToastMsg';

const OTPStarterPhone = () => {
	const { startVerification, status } = useOTP();
	const [destinationInput, setDestinationInput] = useState('');
	const [resultMessage, setResultMessage] = useState('');

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
		<div className="modal-overlay">
			<div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all relative">
				<div className="bg-white rounded-xl shadow-xl p-8 mb-8">
					<h3 className="text-xl font-semibold mb-4 text-indigo-700">Enter Phone Number</h3>
					<div className="flex flex-col md:flex-row gap-4">
						<input
							type="text"
							value={destinationInput}
							onChange={(e) => setDestinationInput(e.target.value)}
							placeholder="Enter phone number eg 0803XXXXXXX"
							className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
						/>
						<button
							onClick={() => handleStartClick(destinationInput)}
							disabled={!destinationInput}
							className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
						>
							Send OTP
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default OTPStarterPhone;