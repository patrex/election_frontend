import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import 'bootstrap/dist/css/bootstrap.css'

const queryClient = new QueryClient({}); 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
	<ErrorBoundary>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</ErrorBoundary>
  </React.StrictMode>,
)
