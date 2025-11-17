export default function handleOTPErrors (error) {
	const statusCode = error.response?.status || error.status || 500;
	const errorDetails = error.response?.data || error.message || 'Unknown error';

	let result;

	switch (statusCode) {
		case 400:
			result = {
				success: false,
				title: "Invalid Request",
				message: "Bad request - check phone number format",
				userMessage: "Please check the phone number and try again.",
				code: statusCode,
				details: errorDetails
			};
			break;

		case 401:
			result = {
				success: false,
				title: "Authentication Failed",
				message: "API key is missing or invalid",
				userMessage: "Service temporarily unavailable. Please try again later.",
				code: statusCode,
				details: errorDetails,
				action: "CHECK_API_KEY"
			};
			break;

		case 403:
			result = {
				success: false,
				title: "Access Denied",
				message: "API key lacks required permissions",
				userMessage: "Service temporarily unavailable. Please contact support.",
				code: statusCode,
				details: errorDetails,
				action: "CHECK_PERMISSIONS"
			};
			break;

		case 404:
			result = {
				success: false,
				title: "Not Found",
				message: "The requested resource doesn't exist",
				userMessage: "Service temporarily unavailable. Please try again.",
				code: statusCode,
				details: errorDetails
			};
			break;

		case 405:
			result = {
				success: false,
				title: "Method Not Allowed",
				message: "Invalid HTTP method used",
				userMessage: "Something went wrong. Please try again.",
				code: statusCode,
				details: errorDetails,
				action: "CHECK_HTTP_METHOD"
			};
			break;

		case 422:
			result = {
				success: false,
				title: "Invalid Data",
				message: "Phone number format is incorrect or data is invalid",
				userMessage: "Please enter a valid Nigerian phone number (e.g., 08012345678).",
				code: statusCode,
				details: errorDetails,
				action: "VALIDATE_PHONE_NUMBER"
			};
			break;

		case 429:
			result = {
				success: false,
				title: "Too Many Attempts",
				message: "Rate limit exceeded",
				userMessage: "Too many requests. Please wait a moment and try again.",
				code: statusCode,
				details: errorDetails,
				retryAfter: 60 // seconds
			};
			break;

		case 500:
		case 502:
		case 503:
		case 504:
			result = {
				success: false,
				title: "Server Error",
				message: "Something went wrong on the OTP servers",
				userMessage: "Service temporarily unavailable. Please try again in a few moments.",
				code: statusCode,
				details: errorDetails,
				retryAfter: 30
			};
			break;

		default:
			result = {
				success: false,
				title: "Unknown Error",
				message: `Unexpected error: ${statusCode}`,
				userMessage: "An unexpected error occurred. Please try again.",
				code: statusCode,
				details: errorDetails
			};
	}

	// Log for debugging (in production, send to your logging service)
	if (!result.success) {
		console.error(`[OTP Error ${result.code}] ${result.title}: ${result.message}`, {
			details: result.details,
			timestamp: new Date().toISOString()
		});
	}

	return result;
}