// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
		// Log to an error tracking service (e.g., Sentry, LogRocket)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="error-page">
					<h1>Something went wrong!</h1>
					<p>We're sorry for the inconvenience. Please try refreshing the page.</p>
					<button onClick={() => window.location.reload()}>Reload Page</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;