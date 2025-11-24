/**
 * Utility function to normalize Nigerian phone numbers to '234...' format (no leading '+').
 * This handles inputs like:
 * - '08031234567' -> '2348031234567'
 * - '+2348031234567' -> '2348031234567'
 * - '8031234567' -> '2348031234567' (assuming 10 local digits)
 * * @param {string} input - The raw phone number input.
 * @returns {string} The normalized phone number (e.g., "2348031234567").
 */
export const cleanNgPhoneNo = (input) => {
	// 1. Remove all non-digit characters.
	let digits = input.replace(/\D/g, '');

	// 2. Normalize to '234' prefix.

	// Case A: Starts with '0' (local format, e.g., 080...) -> Replace '0' with '234'.
	if (digits.startsWith('0')) {
		return '234' + digits.substring(1);
	}

	// Case B: Starts with '234' (e.g., 23480...) -> Already correct.
	if (digits.startsWith('234')) {
		return digits;
	}

	// Case C: 10 digits long (local number without '0', e.g., 803...) -> Prepend '234'.
	if (digits.length === 10) {
		return '234' + digits;
	}

	// Fallback: Return the cleaned digits.
	return digits;
};

export const validatePhoneNo = (input) => {
	const cleanInput = input.replace(/\D/g, '');

	// Valid international format (234 + 10 digits)
	const isInternational = cleanInput.length === 13 && cleanInput.startsWith('234');

	// Valid local format (0 + 10 digits)
	const isLocal = cleanInput.length === 11 && cleanInput.startsWith('0');

	// Missing zero case (10 local digits, e.g., 803...)
	const isMissingZero = cleanInput.length === 10;

	return isInternational || isLocal || isMissingZero;
};