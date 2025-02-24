import { useNavigate } from "react-router-dom";
import backendUrl from '../utils/backendurl'
import { authman } from "@/utils/fireloader";

import { createUserWithEmailAndPassword, 
	signInWithRedirect,
	sendEmailVerification,
	signOut,
	GoogleAuthProvider,
	updateProfile
} from 'firebase/auth';

import Toast from "@/utils/ToastMsg";
import signUpGraphic from '@/assets/sign_up_graphic.png'
import PulseLoader from "react-spinners/PulseLoader";

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { useState } from "react";


function CreateAccount() { 
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const provider = new GoogleAuthProvider();

	const schema = Joi.object({
		firstname: Joi.string().min(2).required(),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required(), 
		password: Joi.string()
        		.pattern(new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$')).required(),
		repeat_password: Joi.ref('password')
	}).with('password', 'repeat_password')
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	const signUpWithGoogle = async () => {
		try {
			const result = await signInWithRedirect(authman, provider);
			const user = result.user;
			if (user.emailVerified) {
				setUser(user);
				navigate(`user/${user.uid}`)
			} else {
				Toast.warning("You must verify your account first!");
				await signOut(authman);
			}
		} catch (error) {
			console.error("Error signing in:", error);
		}
	}

	const onSubmit = async (formData) => {
		setLoading(true)

		try {
			const res = await createUserWithEmailAndPassword(authman, formData.email, formData.password)
			await sendEmailVerification(authman.currentUser)
			await updateProfile(res.user, {
				displayName: formData.firstname
			})
			navigate('/login')
			Toast.success('Verification email was sent to ' + formData.email)
		} catch (error) {
			Toast.error("There was an error");
			console.error(error);
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="h-screen flex min-h-screen">
			{/* Left Side (Hidden on Mobile) */}
			<div className="hidden md:flex w-1/2 bg-gray-200 items-center justify-center dark:bg-gray-800">
				<img src={signUpGraphic} alt="Signup Graphic" className="w-3/4" />
			</div>

			{/* Right Side (Signup Form) */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-6 dark:bg-gray-900 p-6">
				<div className="max-w-md w-full">
					<h2 className="text-xl font-semibold text-center mb-2 mt-2">Create Your Account</h2>
					<form onSubmit={handleSubmit(onSubmit)} >
						{/* Firstname */}
						<div>
							<label htmlFor="firstname" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Firstname
							</label>
							<input
								type="text"
								id="firstname"
								placeholder="Enter your firstname"
								autoFocus
								className="w-2/3 p-2 rounded-md focus:ring-2"
								{...register("firstname")}
							/>
							{errors.firstname && <span className="text-red-500 text-sm">Firstname must be at least two characters</span>}
						</div>
					

						<div>
							{/* Email */}
							<label htmlFor="email" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Email
							</label>
							<input
								type="email"
								id="email"
								placeholder="Enter your email"
								className="w-2/3 p-2 rounded-md focus:ring-2"
								{...register("email")}
							/>
							{errors.email && <span className="text-red-500 text-sm">You need to enter a valid email</span>}
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We'll never share your email.</p>
						</div>

						{/* Password */}
						<div>
							<label htmlFor="password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Password
							</label>
							<input
								type="password"
								id="password"
								placeholder="Enter a secure password"
								{...register("password")}
								className="w-2/3 p-2 rounded-md focus:ring-2"
							/>
							{errors.password && <span className="text-red-500 text-sm">Password must be at least 6 characters and contain symbols</span>}
						</div>

						{/* Confirm Password */}
						<div>
							<label htmlFor="repeat_password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Confirm Password
							</label>
							<input
								type="password"
								id="repeat_password"
								placeholder="Re-enter your password"
								className="w-2/3 p-2 rounded-md focus:ring-2 mb-2"
								{...register("repeat_password")}
							/>
							{errors.repeat_password && <span className="text-red-500 text-sm">Passwords don't match</span>}
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-3/4 flex items-center justify-center block mx-auto px-4 py-2 mt-2 mb-2 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500 transition duration-200"
						> { loading ? <PulseLoader  color="#fff" size={5} loading={loading}/> : "Signup" }
						</button>
					</form>

					<div className="flex items-center w-2/3 my-2 mx-auto" >
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
						<span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
					</div>


					<div>
						<button
							onClick={signUpWithGoogle}
							className="mt-2 flex items-center justify-center w-2/3 px-6 py-3 bg-white block mx-auto text-gray-700 text-lg font-medium border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
							>
							<img
								src="https://www.svgrepo.com/show/475656/google-color.svg"
								alt="Google Logo"
								className="w-4 h-4 mr-2"
							/>
							Sign up with Google
						</button>
					</div>
				</div>
			</div>
		</div>
  
	);
}
 
export default CreateAccount;
