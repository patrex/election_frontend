import { useNavigate } from "react-router-dom";
import { authman } from "@/utils/fireloader";

import {
	createUserWithEmailAndPassword,
	signInWithRedirect,
	sendEmailVerification,
	signOut,
	GoogleAuthProvider,
	updateProfile
} from 'firebase/auth';

import Toast from "@/utils/ToastMsg";
import signUpGraphic from '@/assets/sign_up_graphic.png';
import PulseLoader from "react-spinners/PulseLoader";

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";

function SignUp() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const provider = new GoogleAuthProvider();

	const schema = z.object({
		firstname: z.string().min(2, "Firstname must be at least two characters"),
		email: z.string().email("You need to enter a valid email"),
		password: z.string()
			.min(6, "Password must be at least 6 characters")
			.regex(/(?=.*[0-9])/, "Password must contain at least one number")
			.regex(/(?=.*[!@#$%^&*])/, "Password must contain at least one special character"),
		repeat_password: z.string()
	}).refine((data) => data.password === data.repeat_password, {
		message: "Passwords don't match",
		path: ["repeat_password"]
	});

	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(schema)
	});

	const signUpWithGoogle = async () => {
		try {
			const result = await signInWithRedirect(authman, provider);
			const user = result.user;
			if (user.emailVerified) {
				setUser(user);
				navigate(`../user/${user.uid}`);
			} else {
				Toast.warning("You must verify your account first!");
				await signOut(authman);
			}
		} catch (error) {
			console.error("Error signing in:", error);
		}
	};

	const onSubmit = async (formData) => {
		setLoading(true);

		try {
			const res = await createUserWithEmailAndPassword(authman, formData.email, formData.password);
			await sendEmailVerification(authman.currentUser);
			await updateProfile(res.user, {
				displayName: formData.firstname
			});
			await signOut(authman);
			navigate('/login');
			Toast.success('Verification email was sent to ' + formData.email);
		} catch (error) {
			Toast.error("There was an error");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-white dark:bg-gray-950">
			{/* Left Side (Hidden on Mobile) */}
			<div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900 items-center justify-center p-12">
				<div className="max-w-xl">
					<img
						src={signUpGraphic}
						alt="Login illustration"
						className="w-full h-auto"
					/>
				</div>
			</div>

			{/* Right Side (Signup Form) */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-6 dark:bg-gray-900">
				<div className="max-w-md w-full">
					<h2 className="text-xl font-semibold text-center mb-2 mt-2">Create an account</h2>
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* Firstname */}
						<div>
							<label htmlFor="firstname" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Firstname
							</label>
							<input
								type="text"
								id="firstname"
								autoFocus
								{...register("firstname")}
							/>
							{errors.firstname && <span className="text-red-500 text-sm">{errors.firstname.message}</span>}
						</div>

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Email
							</label>
							<input
								type="email"
								id="email"
								{...register("email")}
							/>
							{errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
						</div>

						{/* Password */}
						<div>
							<label htmlFor="password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Password
							</label>
							<input
								type="password"
								id="password"
								{...register("password")}
							/>
							{errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
						</div>

						{/* Confirm Password */}
						<div>
							<label htmlFor="repeat_password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Confirm Password
							</label>
							<input
								type="password"
								id="repeat_password"
								{...register("repeat_password")}
							/>
							{errors.repeat_password && <span className="text-red-500 text-sm">{errors.repeat_password.message}</span>}
						</div>

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="Button violet submit-btn"
							>
								{loading ? <PulseLoader color="#fff" size={5} loading={loading} /> : "Signup"}
							</button>
						</div>
					</form>

					<div className="flex items-center w-2/3 my-2 mx-auto">
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
						<span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
					</div>

					<div>
						<button
							type="button"
							onClick={signUpWithGoogle}
							className="w-3/5 flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
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
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignUp;