import axios_api from "./axios";
import handleOTPErrors from "./otpErr";

export const sendPhoneOtp = async (dest, electionId) => {
	if (!dest || !electionId) throw new Error("That was not good. Missing required parameters for sending OTP");
	
	const payload = {
		phoneNo: dest,
		electionId
	}

	try {
		const token_req = await axios_api.post(
			'otp/getOTP/phone', 
			payload
		);

		if (!token_req.ok) {
			throw new Error("There was an error processing your OTP request")
		}
	
		console.log(token_response);
		return {success: true, data: token_req.data};
	} catch (error) {
		console.log('Error sending phone OTP:', error, errMsg.message);
		return {success: false, data: {}}
	}
};

export const verifyPhoneOtp = async ({ pinId, otpCode }) => {
	const payload = {
		pinId,
		otpCode
	}

	try {
		const response = await axios_api.post(
			`otp/verifyOtp`,
			payload
		);
	
		if (!response.ok) {
			throw new Error("Could not verify your OTP. Please retry")
		}
	
		return { success: true, data: response.data }; 
	} catch (error) {
		return {success: false, data: {}}
	}   
};