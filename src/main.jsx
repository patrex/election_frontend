import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import 'bootstrap/dist/css/bootstrap.css'
import { configureFetcher } from './utils/fetcher';
import backendUrl from './utils/backendurl.js'
import Toast from './utils/ToastMsg.js'

import { OTPProvider } from './contexts/OTPContext.jsx'

// Configure once at app startup
configureFetcher({
	baseURL: backendUrl, // or process.env.REACT_APP_BACKEND_URL
	onAuthError: (error) => {
	    if (error.code === 'AUTH_REQUIRED') {
		Toast.error('Please log in to continue');
		// Optionally redirect to login
		window.location.href = '/login';
	    } else if (error.code === 'TOKEN_EXPIRED') {
		Toast.error('Your session has expired. Please log in again.');
		// Optionally redirect to login
		window.location.href = '/login';
	    }
	},
	onNetworkError: (error) => {
	    Toast.error('Network error. Please check your connection.');
	}
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
	<ErrorBoundary>
		<OTPProvider>
			<App />
		</OTPProvider>
	</ErrorBoundary>
  </React.StrictMode>,
)
