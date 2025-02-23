export default function isValidEmail(email) {
	// This regex checks for a basic email pattern: something@something.domain
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
      
      
      