import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/App';
import loginImg from '../assets/login_banner.svg';
import { authman } from '@/utils/fireloader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from 'react-spinners';
import Toast from '@/utils/ToastMsg';

import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithRedirect,
	signOut,
} from 'firebase/auth';

function Login() {
	const navigate = useNavigate();
	const { setUser, user } = useContext(AppContext);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const provider = new GoogleAuthProvider();

	// Zod Schema
	const schema = z.object({
		email: z
			.string()
			.email({ message: 'Please enter a valid email address' })
			.min(1, { message: 'Email is required' }),
		password: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.max(200, { message: 'Password is too long' }),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			navigate(`/user/${user.uid}`);
		}
	}, [user, navigate]);

	// Handle Google Sign In
	const handleGoogleSignIn = async () => {
		try {
			const result = await signInWithRedirect(authman, provider);
			const user = result.user;
			
			if (user.emailVerified) {
				setUser(user);
				Toast.success('Successfully signed in!');
				navigate(`/user/${user.uid}`);
			} else {
				Toast.warning('Please verify your email address first');
				await signOut(authman);
			}
		} catch (error) {
			console.error('Google sign-in error:', error);
			Toast.error('Failed to sign in with Google. Please try again');
		}
	};

	// Handle Form Submit
	const onSubmit = async (formData) => {
		setLoading(true);
		setError('');

		try {
			const loginResponse = await signInWithEmailAndPassword(
				authman,
				formData.email,
				formData.password
			);
			
			const user = loginResponse.user;

			if (user.emailVerified) {
				setUser(user);
				Toast.success('Welcome back!');
				navigate(`/user/${user.uid}`);
			} else {
				Toast.warning('Please verify your email address first');
				await signOut(authman);
			}
		} catch (error) {
			console.error('Login error:', error);

			// User-friendly error messages
			const errorMessages = {
				'auth/wrong-password': 'Incorrect password. Please try again.',
				'auth/user-not-found': 'No account found with this email.',
				'auth/invalid-email': 'Invalid email format.',
				'auth/invalid-credential': 'Invalid email or password.',
				'auth/network-request-failed': 'Network error. Check your connection.',
				'auth/too-many-requests': 'Too many attempts. Please try again later.',
			};

			setError(
				errorMessages[error.code] || 'An error occurred. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-white dark:bg-gray-950">
			{/* Left Section - Image (Hidden on Mobile) */}
			<div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900 items-center justify-center p-12">
				<div className="max-w-xl">
					<img
						src={loginImg}
						alt="Login illustration"
						className="w-full h-auto"
					/>
				</div>
			</div>

			{/* Right Section - Login Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							Sign In
						</h1>
					</div>

					{/* Login Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Email address
							</label>
							<input
								type="email"
								id="email"
								autoComplete="email"
								aria-invalid={errors.email ? 'true' : 'false'}
								aria-describedby={errors.email ? 'email-error' : undefined}
								{...register('email')}
								placeholder="you@example.com"
								disabled={loading}
							/>
							{errors.email && (
								<p
									id="email-error"
									className="mt-2 text-sm text-red-600 dark:text-red-400"
									role="alert"
								>
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Password
								</label>
								<a
									href="/forgot-password"
									className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
								>
									Forgot password?
								</a>
							</div>
							<input
								type="password"
								id="password"
								autoComplete="current-password"
								aria-invalid={errors.password ? 'true' : 'false'}
								aria-describedby={errors.password ? 'password-error' : undefined}
								{...register('password')}
								placeholder="••••••••"
								disabled={loading}
							/>
							{errors.password && (
								<p
									id="password-error"
									className="mt-2 text-sm text-red-600 dark:text-red-400"
									role="alert"
								>
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Error Message */}
						{error && (
							<div
								className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
								role="alert"
							>
								<p className="text-sm text-red-800 dark:text-red-200">
									{error}
								</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="Button violet"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<PulseLoader color="currentColor" size={8} />
								</span>
							) : (
								'Sign in'
							)}
						</button>
					</form>

					{/* Divider */}
					<div className="flex items-center my-8">
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
						<span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
							or
						</span>
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
					</div>

					{/* Google Sign In */}
					<button
						type="button"
						onClick={handleGoogleSignIn}
						className="w-full flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
					>
						<svg
							className="w-5 h-5 mr-3"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Continue with Google
					</button>

					{/* Sign Up Link */}
					<p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
						Don't have an account?{' '}
						<a
							href="/signup"
							className="font-medium text-blue-600 dark:text-white hover:underline text-center"
						>
							Sign up
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Login;