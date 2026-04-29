import axios from 'axios';

const axios_api = axios.create({
	baseURL: '/api',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	}
});

export default axios_api;