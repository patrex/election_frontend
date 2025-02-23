export default function isValidPhoneNumber(phoneNo) {
	const phoneRegex = /^\+([1-9]{1}[0-9]{7,14})$/;
	return phoneRegex.test(phoneNo);
}