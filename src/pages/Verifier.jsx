import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // or useHistory if using older React Router
import Toast from '@/utils/ToastMsg';

const withEmailVerification = (WrappedComponent) => {
  	return (props) => {
		const auth = getAuth();
		const navigate = useNavigate(); // or const history = useHistory();
		const [isVerified, setIsVerified] = useState(null); // Use null for initial state

		useEffect(() => {
			const unsubscribe = onAuthStateChanged(auth, (user) => {
				if (user) {
					setIsVerified(user.emailVerified);
				} else {
					setIsVerified(false); // No user, so not verified
				}
			});

      			return () => unsubscribe(); // Clean up listener
    		}, [auth, navigate]);

		if (isVerified === null) {
			return <div>Loading...</div>; // Or a loading indicator
		}

    		if (!isVerified) {
      		// Redirect to a verification page or display a message
      			return (
				<div>
					<h1>Please Verify Your Email</h1>
					<p>
						Your email is not verified. Please check your inbox and click the
						verification link.
					</p>
					{/* Optionally, add a button to resend the verification email */}
					<button onClick={ () => {
						const user = auth.currentUser;
						if (user) {
							sendEmailVerification(user)
							.then(() => {
								Toast.success("Verification email resent!")
							})
							.catch((error) => {
								console.error("Error resending email:", error);
								Toast.warning("Error resending email. Please try again later.");
							});
						}
					}}>Resend Verification Email</button>

					<button onClick={() => auth.signOut().then(() => navigate('/login'))}>
						Sign Out
					</button>
				</div>
      			);
    		}

    		return <WrappedComponent {...props} />; // Render the actual component
  	};
};

export default withEmailVerification;