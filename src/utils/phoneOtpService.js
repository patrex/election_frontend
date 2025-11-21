const base = process.env.NOTIFICATIONS_BASE_URL
const apiKey = process.env.NOTIFICATIONS_PROVIDER_KEY

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
				credentials: "include"
			}
		);

		const token_response = await token_req.json();

		return token_response;
	} catch (error) {
		const errMsg = handleOTPErrors(error)
		console.error('Error sending phone OTP:', error, errMsg.message);
	}
};

export const verifyPhoneOtp = async (pinId, pin) => {
	const payload = {
		api_key: apiKey,
		pin_id: pinId,
		pin: pin
	}
	
	let status_success = false;
	try {

		await fetch(
			`${base}/api/sms/otp/verify`, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload),
			credentials: 'include'
		}); 
		status_success = true;

		return status_success
	} catch (error) {
		const errMsg = handleOTPErrors(error);
		console.log(error, errMsg.message);
		return status_success;
	}
};

