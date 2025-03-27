// src/components/AdvancedDataFetcher.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';

// Simple cache implementation
const cache = new Map();

function AdvancedDataFetcher({ url, cacheKey = url, retries = 2, children }) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	const fetchData = async (cancelToken) => {
		try {
			// Return cached data if available
			if (cache.has(cacheKey)) {
				setData(cache.get(cacheKey));
				setLoading(false);
				return;
			}

			const response = await axios.get(url, { cancelToken });
			cache.set(cacheKey, response.data); // Cache the response
			setData(response.data);
			setError(null);
		} catch (err) {
			if (axios.isCancel(err)) return; // Ignore canceled requests

			if (retryCount < retries) {
				// Exponential backoff for retries
				setTimeout(() => {
					setRetryCount(retryCount + 1);
				}, 1000 * (retryCount + 1));
			} else {
				setError(err.message || 'Unknown error');
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const cancelToken = axios.CancelToken.source();
		fetchData(cancelToken.token);

		// Cleanup: Cancel request if component unmounts
		return () => cancelToken.cancel('Request canceled');
	}, [url, retryCount]);

	const refetch = () => {
		setLoading(true);
		setError(null);
		setRetryCount(0);
		cache.delete(cacheKey); // Clear cache for this key
	};

	return children(data, loading, error, refetch);
}

export default AdvancedDataFetcher;