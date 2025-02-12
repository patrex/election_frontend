import { useNavigate } from "react-router-dom";
import backendUrl from '../utils/backendurl'

import { createUserWithEmailAndPassword, 
	signInWithPopup, 
	GoogleAuthProvider,
	AuthErrorCodes
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

	}

	const onSubmit = async (formData) => {
		setLoading(true)

		try {
			
			
		} catch (error) {
			Toast.error("There was an error");
			console.error(error);
			
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="h-screen flex flex-col md:flex-row">
			{/* Left Side (Hidden on Mobile) */}
			<div className="hidden md:flex md:w-1/2 bg-blue-500 items-center justify-center">
				<img src={signUpGraphic} alt="Signup Graphic" className="max-w-xs md:max-w-md" />
			</div>

			{/* Right Side (Signup Form) */}
			<div className="flex flex-col justify-center items-center md:w-1/2 w-full bg-gray-100 dark:bg-gray-900 p-6">
				<h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">Create Your Account</h1>
				
				<form onSubmit={handleSubmit(onSubmit)} className="w-2/3 max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
					<div className="space-y-4">
						<div>
							<label htmlFor="firstname" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Firstname
							</label>
							<input
								type="text"
								id="firstname"
								placeholder="Enter your firstname"
								autoFocus
								{...register("firstname")}
								className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{errors.firstname && <span className="text-red-500 text-sm">Firstname must be at least two characters</span>}
						</div>

						<div>
							<label htmlFor="email" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								placeholder="Enter your email"
								{...register("email")}
								className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{errors.email && <span className="text-red-500 text-sm">You need to enter a valid email</span>}
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We'll never share your email.</p>
						</div>

						<div>
							<label htmlFor="password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Password
							</label>
							<input
								type="password"
								id="password"
								placeholder="Enter a secure password"
								{...register("password")}
								className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{errors.password && <span className="text-red-500 text-sm">Password must be at least 6 characters and contain symbols</span>}
						</div>

						<div>
							<label htmlFor="repeat_password" className="block text-left text-gray-700 dark:text-gray-300 font-medium">
								Confirm Password
							</label>
							<input
								type="password"
								id="repeat_password"
								placeholder="Re-enter your password"
								{...register("repeat_password")}
								className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{errors.repeat_password && <span className="text-red-500 text-sm">Passwords don't match</span>}
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-6 flex items-center justify-center px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500 transition duration-200"
					> {loading ? <PulseLoader color="#ffffff" size={6} loading={loading} /> : "Sign Up"}
					</button>
				</form>

				<div className="flex items-center w-2/3 my-6 mx-auto" >
					<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
					<span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
					<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
				</div>
				<div>
					<button
						onClick={signUpWithGoogle}
						className="mt-4 flex items-center justify-center w-2/3 px-6 py-3 bg-white block mx-auto text-gray-700 text-lg font-medium border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
						>
						<img
							src="https://www.svgrepo.com/show/475656/google-color.svg"
							alt="Google Logo"
							className="w-6 h-6 mr-2"
						/>
						Sign up with Google
					</button>
				</div>
			</div>
		</div>
  
	);
}
 
export default CreateAccount;
