import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authman } from "@/utils/fireloader";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from "react-spinners";
import Toast from "@/utils/ToastMsg";
import signUpGraphic from '@/assets/sign_up_graphic.png';

import {
	createUserWithEmailAndPassword,
	signInWithRedirect,
	sendEmailVerification,
	signOut,
	GoogleAuthProvider,
	updateProfile
} from 'firebase/auth';

function SignUp() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const provider = new GoogleAuthProvider();

	// Zod Schema
	const schema = z.object({
		firstname: z
			.string()
			.min(2, { message: 'First name must be at least 2 characters' })
			.max(50, { message: 'First name is too long' }),
		email: z
			.string()
			.email({ message: 'Please enter a valid email address' })
			.min(1, { message: 'Email is required' }),
		password: z
			.string()
			.min(6, { message: 'Password must be at least 6 characters' })
			.regex(
				/^(?=.*[0-9])(?=.*[!@#$%^&*])/,
				{ message: 'Password must contain at least one number and one special character' }
			),
		confirmPassword: z
			.string()
			.min(1, { message: 'Please confirm your password' }),
	}).refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			firstname: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	// Google Sign Up
	const signUpWithGoogle = async () => {
		try {
			await signInWithRedirect(authman, provider);
		} catch (error) {
			console.error('Google sign-up error:', error);
			Toast.error('Failed to sign up with Google. Please try again');
		}
	};

	// Form Submit
	const onSubmit = async (formData) => {
		setLoading(true);

		try {
			// Create user
			const result = await createUserWithEmailAndPassword(
				authman,
				formData.email,
				formData.password
			);

			// Update profile with name
			await updateProfile(result.user, {
				displayName: formData.firstname,
			});

			// Send verification email
			await sendEmailVerification(authman.currentUser);

			// Sign out (require email verification)
			await signOut(authman);

			Toast.success(`Verification email sent to ${formData.email}`);
			navigate('/login');
		} catch (error) {
			console.error('Sign-up error:', error);

			const errorMessages = {
				'auth/email-already-in-use': 'This email is already registered',
				'auth/invalid-email': 'Invalid email address',
				'auth/weak-password': 'Password is too weak',
				'auth/network-request-failed': 'Network error. Check your connection',
			};

			Toast.error(
				errorMessages[error.code] || 'Failed to create account. Please try again'
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
						src={signUpGraphic}
						alt="Sign up illustration"
						className="w-full h-auto"
					/>
				</div>
			</div>

			{/* Right Section - Signup Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							Create an account
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Get started with your free account
						</p>
					</div>

					{/* Signup Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						{/* First Name */}
						<div>
							<label
								htmlFor="firstname"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								First name
							</label>
							<input
								type="text"
								id="firstname"
								autoComplete="given-name"
								autoFocus
								aria-invalid={errors.firstname ? 'true' : 'false'}
								aria-describedby={errors.firstname ? 'firstname-error' : undefined}
								{...register('firstname')}
								placeholder="John"
								disabled={loading}
							/>
							{errors.firstname && (
								<p
									id="firstname-error"
									className="mt-2 text-sm text-red-600 dark:text-red-400"
									role="alert"
								>
									{errors.firstname.message}
								</p>
							)}
						</div>

						{/* Email */}
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

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								autoComplete="new-password"
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
							<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
								Must be at least 6 characters with a number and special character
							</p>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Confirm password
							</label>
							<input
								type="password"
								id="confirmPassword"
								autoComplete="new-password"
								aria-invalid={errors.confirmPassword ? 'true' : 'false'}
								aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
								{...register('confirmPassword')}
								placeholder="••••••••"
								disabled={loading}
							/>
							{errors.confirmPassword && (
								<p
									id="confirmPassword-error"
									className="mt-2 text-sm text-red-600 dark:text-red-400"
									role="alert"
								>
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="Button violet text-center"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<PulseLoader color="currentColor" size={8} />
								</span>
							) : (
								'Create account'
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

					{/* Google Sign Up */}
					<button
						type="button"
						onClick={signUpWithGoogle}
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
						Sign up with Google
					</button>

					{/* Login Link */}
					<p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
						Already have an account?{' '}
						<a
							href="/login"
							className="font-medium text-gray-900 dark:text-white hover:underline"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

export default SignUp;