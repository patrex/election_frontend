import { useNavigate } from 'react-router-dom'
import { useContext, useEffect } from 'react';
import { AppContext } from '@/App';

import { toast } from 'sonner'
import backendUrl from '../utils/backendurl'

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'

function Login() {
	const navigate = useNavigate();
	const { setUser } = useContext(AppContext)

	const schema = Joi.object({
		username: Joi.string().email({ minDomainSegments: 2, tlds: { deny: ['xxx'] } }).required(),
		password: Joi.string().min(6).max(200)
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	const onSubmit = async (formData) => {
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
			return;
		} else {
			toast.error('Something went wrong...')
		}
	}

	return (
		<div className="container">
			<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-3/5 2xl:w-2/3 rounded border-yellow-600">
				<form onSubmit={ handleSubmit(onSubmit) }>
					<div className="mb-3">
						Email
						<input type="email"
							placeholder="email"
							autoFocus
							{...register('username')}
						/>{errors.email && <span className='error-msg'>You need to enter a valid email</span>}
					</div>

					<div className="mb-3">
						Password
						<input type="password" 
							placeholder="password"
							{...register('password')}
						/>
					</div>
					
					<div className="mb-3">
						<button type="submit" className="Button violet">Login</button>
					</div>
				</form>
			</div>
			
		</div>
	);
	
}
 
export default Login;
