export default function isValidPhoneNumber(phoneNo) {
	// Remove all spaces, hyphens, and parentheses
	const cleaned = phoneNo.replace(/[\s\-()]/g, '');
	
	// Nigerian phone number patterns:
	// 1. International format: +234XXXXXXXXXX (13 digits total, 10 after +234)
	// 2. Local format with 0: 0XXXXXXXXXX (11 digits total)
	// 3. Without leading 0: XXXXXXXXXX (10 digits)
	
	const patterns = [
		/^\+234[7-9][0-1]\d{8}$/,  // +234 followed by valid mobile prefix
		/^234[7-9][0-1]\d{8}$/,     // 234 without + (alternative international)
		/^0[7-9][0-1]\d{8}$/,       // Local format starting with 0
		/^[7-9][0-1]\d{8}$/         // Without leading 0
	];
	
	return patterns.some(pattern => pattern.test(cleaned));
}

// Example usage:
// isValidNigerianPhoneNumber('+2348012345678')  // true
// isValidNigerianPhoneNumber('08012345678')     // true
// isValidNigerianPhoneNumber('8012345678')      // true
// isValidNigerianPhoneNumber('0701 234 5678')   // true
// isValidNigerianPhoneNumber('+2345012345678')  // false (invalid prefix)