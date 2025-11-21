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

		Toast.error(errMsg.userMessage);
		console.error('Error sending phone OTP:', error, errMsg.message);
	}
};

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
		Toast.warning(errMsg.userMessage);
		console.log(error, errMsg.message);
	}
};