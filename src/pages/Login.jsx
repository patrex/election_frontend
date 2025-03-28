import { useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/App';
import loginImg from '../assets/login_banner.svg'
import { authman } from '@/utils/fireloader';

import { signInWithEmailAndPassword, 
	 GoogleAuthProvider,
	 signInWithRedirect,
	 signOut,
} from 'firebase/auth';

import { PulseLoader } from 'react-spinners';

import Toast from '@/utils/ToastMsg';

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'


function Login() {
	const navigate = useNavigate();
	const { setUser, user } = useContext(AppContext)
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("")

	const provider = new GoogleAuthProvider();

	const schema = Joi.object({
		username: Joi.string().email({ minDomainSegments: 2, tlds: { deny: ['xxx'] } }).required(),
		password: Joi.string().min(6).max(200).required()
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});
	
	const handleGoogleSignIn = async () => {
		try {
			const result = await signInWithRedirect(authman, provider);
			const user = result.user;
			if (user.emailVerified) {
				setUser(user);
				navigate(`../user/${user.uid}`)
			} else {
				Toast.warning("You must verify your account first!");
				await signOut(authman);
			}
		} catch (error) {
			console.error("Error signing in:", error);
		}
	}
	
	const onSubmit = async (formData) => {
		setLoading(true);
		setErr('')
		
		try {
			const login_res = await signInWithEmailAndPassword(authman, formData.username, formData.password);
			const user = login_res.user;
			if (user.emailVerified) {
				setUser(user);
				navigate(`../user/${user.uid}`)
			} else {
				Toast.warning("You must verify your account first!");
				await signOut(authman)
				return;
			}
		} catch (error) {
			switch (error.code) {
				case "auth/wrong-password":
				  setErr("Incorrect password. Please try again.");
				  break;
				case "auth/user-not-found":
				  setErr("No user found with this email. Please sign up.");
				  break;
				case "auth/invalid-email":
				  setErr("Invalid email format. Please enter a valid email.");
				  break;
				case "auth/invalid-credential":
				  setErr("No user found with this email. Please sign up.");
				  break;
				case "auth/network-request-failed":
				  setErr("Network error. Check your internet connection.");
				  break;
				default:
				  setErr("An error occurred during login. Please try again.");
			      }
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (user) {
			setLoading(true)
			navigate(`../user/${user.uid}`)
		}
	}, [user])

	return (
		<div className="flex min-h-screen">
			{/* <!-- Left Section (Hidden on Mobile) --> */}
			<div className="hidden md:flex w-1/2 bg-gray-200 items-center justify-center">
			<img 
				src={loginImg} alt="Login graphic" 
				className="w-3/4" />
			</div>

			{/* <!-- Right Section (Login Form) --> */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-6">
				<div className="max-w-md w-full">
					<h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
					<form onSubmit={ handleSubmit(onSubmit) }>
						<div className="mb-4">
							<label className="block text-gray-700">Email</label>
							<input type="email" 
								className="w-2/3 p-2 rounded-md focus:ring-2" 
								{...register('username')}
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700">Password</label>
							<input type="password" 
								className="w-2/3 p-2 rounded-md focus:ring-2" 
								{...register('password')}
							/>
						</div>

						<div className="mb-4">
							<button 
								className="submit-btn"
								disabled={loading}
							>{ loading ? <PulseLoader  color="#fff" size={5} loading={loading}/> : "Login" }</button>
						</div>

						{err && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{err}</div>}
						{errors.username && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>You need to enter a valid email</div>}
						{errors.password && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{errors.password.message}</div>}
					</form>

					<div className="flex items-center w-2/3 my-6 mx-auto" >
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
						<span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
						<hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
					</div>


					<div>
						<button
							onClick={ handleGoogleSignIn }
							className="mt-4 flex items-center justify-center w-2/3 px-6 py-3 bg-white block mx-auto text-gray-700 text-lg font-medium border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
							>
							<img
								src="https://www.svgrepo.com/show/475656/google-color.svg"
								alt="Google Logo"
								className="w-6 h-6 mr-2"
							/>
							Sign in with Google
						</button>
					</div>
				</div>
			</div>
		</div>

	);
}
 
export default Login;
