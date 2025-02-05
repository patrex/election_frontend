import React, { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Error caught by ErrorBoundary:", error, info);
    }

    handleReload = () => {
        this.setState({ hasError: false }); // Reset error state
        window.location.reload(); // Refresh page
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h2>Oops! Something went wrong.</h2>
                    <p>Try refreshing the page or return to the homepage.</p>
                    <button onClick={this.handleReload}>Reload Page</button>
                    <Link to="/">Go to Home</Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
