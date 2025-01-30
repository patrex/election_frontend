import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import backendUrl from '../utils/backendurl'
import Toast from "@/utils/ToastMsg";

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { useState } from "react";


function CreateAccount() { 
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const schema = Joi.object({
		firstname: Joi.string().min(2).required(),
		lastname: Joi.string().min(2).required(),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required(), 
		phoneNumber:Joi.string().pattern(/^(070|080|081|090|091)\d{8}$|^(0700|0800|0900)\d{7}$/).required(),
		password: Joi.string()
        		.pattern(new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$')).required(),
		repeat_password: Joi.ref('password')
	}).with('password', 'repeat_password')
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	const onSubmit = async (formData) => {
		setLoading(true)
		const res = await fetch(`${backendUrl}/user/auth/signup`, {
			method: 'POST',
			headers: {
        			'Content-Type': 'application/json',
      			},
			mode: 'cors',
      			body: JSON.stringify(formData),
		})
		
		setLoading(false)

		if(res.ok) {
			navigate('/login');
		}
		else {
			Toast.error("There was an error");
		}
	}

	return (
		<div className="container">
			<div className="form-container" style={ {border: 'none'} }>
				<form onSubmit={ handleSubmit(onSubmit) }>
					<div className="form-group">
						<div className="mb-3">
							<label htmlFor="firstname" className="form-label">Firstname</label>
							<input type="text" 
								id="firstname" 
								aria-describedby="firstname"
								name="firstname"
								placeholder="Firstname"
								autoFocus
								{...register('firstname')}
							/>{errors.firstname && <span className='error-msg'>Firstname must be at least two characters</span>}
							
						</div>
						<div className="mb-3">
							<label htmlFor="lastname" className="form-label">Lastname</label>
							<input type="text" 
								id="lastname" 
								aria-describedby="lastname"
								name="lastname"
								placeholder="Lastname"
								{...register('lastname')}
							/>{errors.lastname && <span className='error-msg'>Firstname must be at least two characters</span>}
		
						</div>

						<div className="mb-3">
							<label htmlFor="psw" className="form-label">Password</label>
							<input type="password" 
								id="psw"
								name="password"
								placeholder="password: be discreet"
								{...register('password')}
							/>{errors.password && <span className='error-msg'>Password must be at least 6 characters and should contain one or more symbols</span>}
						</div>

						<div className="mb-3">
							<label htmlFor="repeat" className="form-label">Re-enter password</label>
							<input type="password" 
								id="repeat"
								name="reEnterPassword"
								placeholder="re-type password"
								{...register('repeat_password')}
							/>{errors.repeat_password && <span className='error-msg'>Passwords don't match</span>}
						</div> 
						<div className="mb-3">
							<label htmlFor="userEmail" className="form-label">Email address</label>
							<input type="email" 
								id="userEmail" 
								aria-describedby="emailHelp"
								name="email"
								{...register('email')}
								placeholder="enter your email"
							/> {errors.email && <span className='error-msg'>You need to enter a valid email</span>}
							<div id="emailHelp" className="form-text">We'll never share your email</div>
						</div>

						<div className="mb-3">
							<label htmlFor="phoneno" className="form-label">Phone Number</label>
							<input type="number" 
								id="phoneno" 
								aria-describedby="phoneno"
								name="phoneNo"
								{...register('phoneNumber')}
								placeholder="phone number"
							/> {errors.phoneNumber && <span className='error-msg'>Your phone number should be in the form 070X</span>}
							<div id="phoneno" className="form-text">We'll never share your phone number</div>
						</div>
					</div> 
					
					<button type="submit" disabled={loading} className="Button violet">Create Account</button>
				</form>
			</div>
		</div>
	);
}
 
export default CreateAccount;
