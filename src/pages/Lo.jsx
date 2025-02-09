import { useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react';
import { AppContext } from '@/App';

import { authman } from '@/utils/fireloader';

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

	const schema = Joi.object({
		username: Joi.string().email({ minDomainSegments: 2, tlds: { deny: ['xxx'] } }).required(),
		password: Joi.string().min(6).max(200).required()
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

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
		<div className="container">
			<div className="form-container">
				<form onSubmit={ handleSubmit(onSubmit) }>
					<div className="mb-3">
						Email
						<input type="email"
							placeholder="email"
							autoFocus
							{...register('username')}
						/>
					</div>

					<div className="mb-3">
						Password
						<input type="password" 
							placeholder="password"
							{...register('password')}
						/>
						
					</div>
					
					<div className="mb-3">
						<button type="submit" disabled={loading} className="Button violet">{loading ? <PulseLoader  color="#ffb500" size={5} loading={loading}/> : "Login"}</button>
					</div>

					{err && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{err}</div>}
					{errors.username && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>You need to enter a valid email</div>}
					{errors.password && <div className='status bg-red-200 px-2 my-2 py-1 rounded-full text-red-500'>{errors.password.message}</div>}
				</form>
			</div>
		</div>
	);
}
 
export default Login;
