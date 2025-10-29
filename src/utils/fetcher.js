import backendUrl from "./backendurl";
/**
 * Custom error class for fetch operations
 */
class FetchError extends Error {
	constructor(message, code, status, response) {
		super(message);
		this.name = 'FetchError';
		this.code = code;
		this.status = status;
		this.response = response;
	}
}

/**
 * Configuration object
 */
const defaultConfig = {
	baseURL: backendUrl, // Set your backend URL here
	onAuthError: null,
	onNetworkError: null,
};

let config = { ...defaultConfig };

/**
 * Configure fetcher globally
 * @param {Object} newConfig - Configuration options
 */
export function configureFetcher(newConfig) {
	config = { ...config, ...newConfig };
}

/**
 * Base fetch function (without authentication)
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} customConfig - Override global config for this request
 * @returns {Promise<Response>}
 */
export async function baseFetch(url, options = {}, customConfig = {}) {
	const finalConfig = { ...config, ...customConfig };
	const fullURL = url.startsWith('http') ? url : `${finalConfig.baseURL}${url}`;

	try {
		const response = await fetch(fullURL, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			}
		});

		return response;

	} catch (error) {
		// Handle network errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			const networkError = new FetchError(
				"Network error. Please check your connection.",
				"NETWORK_ERROR",
				null,
				null
			);

			if (finalConfig.onNetworkError) {
				finalConfig.onNetworkError(networkError);
			}

			throw networkError;
		}

		throw error;
	}
}

/**
 * Authenticated fetch function
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} user - The authenticated user object
 * @param {Object} customConfig - Override global config
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}, user, customConfig = {}) {
	const finalConfig = { ...config, ...customConfig };
	const fullURL = url.startsWith('http') ? url : `${finalConfig.baseURL}${url}`;

	// Check authentication
	if (!user) {
		const error = new FetchError(
			"User not authenticated",
			"AUTH_REQUIRED",
			null,
			null
		);

		if (finalConfig.onAuthError) {
			finalConfig.onAuthError(error);
		}

		throw error;
	}

	try {
		// Get authentication token
		const token = await user.getIdToken();

		// Make the request
		const response = await fetch(fullURL, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
				Authorization: `Bearer ${token}`
			}
		});

		return response;

	} catch (error) {
		// Handle token expiration
		if (error.code === 'auth/id-token-expired' || error.code === 'auth/user-token-expired') {
			const authError = new FetchError(
				"Session expired. Please log in again.",
				"TOKEN_EXPIRED",
				null,
				null
			);

			if (finalConfig.onAuthError) {
				finalConfig.onAuthError(authError);
			}

			throw authError;
		}

		// Handle network errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			const networkError = new FetchError(
				"Network error. Please check your connection.",
				"NETWORK_ERROR",
				null,
				null
			);

			if (finalConfig.onNetworkError) {
				finalConfig.onNetworkError(networkError);
			}

			throw networkError;
		}

		throw error;
	}
}

/**
 * Parse JSON response and handle errors
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON
 */
async function parseResponse(response) {
	if (!response.ok) {
		let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

		// Try to get error message from response body
		try {
			const errorData = await response.json();
			errorMessage = errorData.message || errorData.error || errorMessage;
		} catch (e) {
			// If parsing fails, try text
			try {
				const errorText = await response.text();
				if (errorText) errorMessage = errorText;
			} catch (e) {
				// Use default error message
			}
		}

		const error = new FetchError(
			errorMessage,
			"HTTP_ERROR",
			response.status,
			response
		);

		throw error;
	}

	return response.json();
}

/**
 * Makes a non-authenticated request and parses JSON response
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} customConfig - Override global config
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function baseFetchJSON(url, options = {}, customConfig = {}) {
	const response = await baseFetch(url, options, customConfig);
	return parseResponse(response);
}

/**
 * Makes an authenticated request and parses JSON response
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} user - The authenticated user object
 * @param {Object} customConfig - Override global config
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function authFetchJSON(url, options = {}, user, customConfig = {}) {
	const response = await authFetch(url, options, user, customConfig);
	return parseResponse(response);
}

/**
 * Main fetcher API with both authenticated and non-authenticated methods
 */
export const fetcher = {
	// Non-authenticated methods (for public endpoints)
	get: (url, customConfig) =>
		baseFetchJSON(url, { method: 'GET' }, customConfig),

	// post: (url, data, customConfig) =>
	// 	baseFetchJSON(url, {
	// 		method: 'POST',
	// 		body: JSON.stringify(data)
	// 	}, customConfig),

	// put: (url, data, customConfig) =>
	// 	baseFetchJSON(url, {
	// 		method: 'PUT',
	// 		body: JSON.stringify(data)
	// 	}, customConfig),

	// patch: (url, data, customConfig) =>
	// 	baseFetchJSON(url, {
	// 		method: 'PATCH',
	// 		body: JSON.stringify(data)
	// 	}, customConfig),

	// delete: (url, customConfig) =>
	// 	baseFetchJSON(url, { method: 'DELETE' }, customConfig),

	// Authenticated methods (require user parameter)
	auth: {
		get: (url, user, customConfig) =>
			authFetchJSON(url, { method: 'GET' }, user, customConfig),

		post: (url, data, user, customConfig) =>
			authFetchJSON(url, {
				method: 'POST',
				body: JSON.stringify(data)
			}, user, customConfig),

		put: (url, data, user, customConfig) =>
			authFetchJSON(url, {
				method: 'PUT',
				body: JSON.stringify(data)
			}, user, customConfig),

		patch: (url, data, user, customConfig) =>
			authFetchJSON(url, {
				method: 'PATCH',
				body: JSON.stringify(data)
			}, user, customConfig),

		delete: (url, user, customConfig) =>
			authFetchJSON(url, { method: 'DELETE' }, user, customConfig),
	}
};

// Export FetchError for error handling
export { FetchError };