import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import 'bootstrap/dist/css/bootstrap.css'
import axios from 'axios'

axios.defaults.withCredentials=true;
axios.defaults.baseURL='/api';

import { ElectionProvider } from './contexts/ElectionContext';
import { OTPProvider } from './contexts/OTPContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
	<ErrorBoundary>
		<ElectionProvider>
			<App />
		</ElectionProvider>
	</ErrorBoundary>
  </React.StrictMode>
)
