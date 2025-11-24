const base = import.meta.env.VITE_BASE;
const apiKey = import.meta.env.VITE_NOTIFICATIONS_PROVIDER;

export const sendPhoneOtp = async (phoneNumber) => {
	const payload = {
		api_key: apiKey,
		pin_type: "NUMERIC",
		phone_number: phoneNumber,
		pin_attempts: 3,
		pin_time_to_live: 10,
		pin_length: 4
	}

	try {
		const token_req = await fetch(
			`${base}/api/sms/otp/generate`, {
				method: 'POST',
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(payload),
				credentials: "include",
			}
		);

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch {
			errorData = { message: `HTTP Error ${response.status}: Failed to process request.` };
			}

			throw new Error(errorData.message || 'Verification failed on server.');
		}

		const token_response = await token_req.json();
		return {success: true, data: token_response};
	} catch (error) {
		const errMsg = handleOTPErrors(error)
		console.error('Error sending phone OTP:', error, errMsg.message);
		return {success: false, data: {}}
	}
};

export const verifyPhoneOtp = async ({ otpCode, pinId }) => {
	const payload = {
		api_key: apiKey,
		pin_id: pinId,
		pin: otpCode
	}

	try {
		const response = await fetch(`${base}/api/sms/otp/verify`, {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			credentials: 'include'
		});
	
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch {
			errorData = { message: `HTTP Error ${response.status}: Failed to process request.` };
			}

			throw new Error(errorData.message || 'Verification failed on server.');
		}
	
		// 2. Success Path (Only reached if status is 200-299)
		
		// IMPORTANT: You might also want to parse and return the successful JSON response body here:
		const successData = await response.json();
		return { success: true, data: successData }; 
	} catch (error) {
		// This catch now handles both network errors AND server-side HTTP errors (4xx/5xx)
		const errMsg = handleOTPErrors(error);
		console.log("Verification failed:", error.message);
		console.log("Handled Error Message:", errMsg.message);
		
		// Return false on any failure
		return false;
	}   
};