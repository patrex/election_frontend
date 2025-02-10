import { useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/App';
import login from '../assets/login.svg'

import { signInWithEmailAndPassword } from 'firebase/auth';

import { PulseLoader } from 'react-spinners';

import Toast from '@/utils/ToastMsg';
import backendUrl from '../utils/backendurl'

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'


function Login() {
	const navigate = useNavigate();
	const { setUser } = useContext(AppContext)
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("")

	const [img, setImg] = useState("")

	const schema = Joi.object({
		username: Joi.string().email({ minDomainSegments: 2, tlds: { deny: ['xxx'] } }).required(),
		password: Joi.string().min(6).max(200).required()
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	useEffect(() => {
		
	}, [])

	const onSubmit = async (formData) => {
		setLoading(true);
		setErr('')

		

		// try {
		// 	const res = await fetch(`${backendUrl}/user/auth/login`, {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 		      },
		// 		      body: JSON.stringify(formData),
		// 	})

		// 	if (!res.ok) {
		// 		Toast.warning("Could not complete the request")
		// 		return;
		// 	} else if (res.status == 401) {
		// 		setErr('Username or password is incorrect')
		// 		return;
		// 	}

		// 	let user = await res.json();
		// 	setUser(user)
		// 	navigate(`/user/${user._id}`)
		// } catch (error) {
		// 	setErr('Something went wrong...')
		// } finally {
		// 	setLoading(false)
		// }
	}

	return (
		<div className="flex min-h-screen">
			{/* <!-- Left Section (Hidden on Mobile) --> */}
			<div className="hidden md:flex w-1/2 bg-gray-200 items-center justify-center">
			<img 
				src={login} alt="Login graphic" 
				className="w-3/4" />
			</div>

			{/* <!-- Right Section (Login Form) --> */}
			<div className="w-full md:w-1/2 flex items-center justify-center p-6">
				<div className="max-w-md w-full">
					<h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
					<form>
						<div className="mb-4">
							<label className="block text-gray-700">Email</label>
							<input 
								type="email" 
								className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
								{...register('username')}
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700">Password</label>
							<input type="password" 
								className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
								{...register('password')}
							/>
						</div>
						
						<button 
							className="w-1/2 mx-auto block bg-orange-500 text-white py-2 rounded-md text-center hover:bg-blue-600"
							disabled={loading}
						>{ loading ? <PulseLoader  color="#ffb500" size={5} loading={loading}/> : "Login" }</button>

						{err && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{err}</div>}
						{errors.username && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>You need to enter a valid email</div>}
						{errors.password && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{errors.password.message}</div>}
					</form>
				</div>
			</div>
		</div>

	);
}
 
export default Login;
