import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import ErrorBoundary from './pages/ErrorBoundary.jsx'
import Error from './pages/Error.jsx'

import 'bootstrap/dist/css/bootstrap.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
	<ErrorBoundary fallback={Error}>
		<App />
	</ErrorBoundary>
  </React.StrictMode>,
)
