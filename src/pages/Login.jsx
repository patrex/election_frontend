import { useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react';
import { AppContext } from '@/App';

import { toast } from 'sonner'
import backendUrl from '../utils/backendurl'

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'


function Login() {
	const navigate = useNavigate();
	const { setUser } = useContext(AppContext)
	const [errMsg, setErrMsg] = useState('')
	const [loading, setLoading] = useState(false);


	const schema = Joi.object({
		username: Joi.string().email({ minDomainSegments: 2, tlds: { deny: ['xxx'] } }).required(),
		password: Joi.string().min(6).max(200)
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	const onSubmit = async (formData) => {
		setLoading(true);

		const res = await fetch(`${backendUrl}/user/auth/login`, {
			method: 'POST',
			headers: {
        			'Content-Type': 'application/json',
      			},
			mode: 'cors',
      			body: JSON.stringify(formData),
		})
		
		if (res.ok) {
			let user = await res.json();
			setUser(user)
			navigate(`/user/${user._id}`)
		} else if (res.status == 401) {
			toast.warning('Username or password is incorrect')
			setLoading(false);
			return;
		} else {
			setErrMsg('Something went wrong...')
			setLoading(false)
		}
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
						<button type="submit" disabled={loading} className="Button violet">Login</button>
					</div>

					{errMsg && <div className='status bg-red-200 text-red-500'>{errMsg}</div>}
					{errors.username && <div className='status bg-red-200 px-2 py-1 rounded-full text-red-500'>You need to enter a valid email</div>}
					{errors.password && <div className='status bg-red-200 px-2 py-1 rounded-full text-red-500'>{errors.password.message}</div>}
				</form>
			</div>
			
		</div>
	);
	
}
 
export default Login;
