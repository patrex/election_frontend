import { fetcher } from "./fetcher";
import handleOTPErrors from "./otpErr";

export const sendPhoneOtp = async (dest, electionId) => {
	const payload = {
		phoneNo: dest,
		electionId
	}

	try {
		const token_req = await fetcher.post(
			`otp/getOTP/phone`, 
			payload
		);

		if (!token_req.ok) {
			throw new Error("There was an error sending your OTP code")
		}

		const token_response = await token_req.json();
		return {success: true, data: token_response};
	} catch (error) {
		const errMsg = handleOTPErrors(error)
		console.error('Error sending phone OTP:', error, errMsg.message);
		return {success: false, data: {}}
	}
};

export const verifyPhoneOtp = async ({ pinId, otpCode }) => {
	const payload = {
		pin_id: pinId,
		pin: otpCode
	}

	try {
		const response = await fetcher.post(
			`otp/verifyOtp`,
			payload
		);
	
		if (!response.ok) {
			throw new Error("Could not verify your OTP. Please retry")
		}
	
		const successData = await response.json();
		return { success: true, data: successData }; 
	} catch (error) {
		// This catch now handles both network errors AND server-side HTTP errors (4xx/5xx)
		const errMsg = handleOTPErrors(error);
		console.log("Verification failed:", error.message);
		console.log("Handled Error Message:", errMsg.message);
		
		// Return false on any failure
		return {success: false, data: {}}
	}   
};