import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'

function Login() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		username: "",
		password: ""
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.username || !formData.password) {
			toast.warning("You must enter an id and password")
			return;
		}

		const res = await fetch(`/user/auth/login`, {
			method: 'POST',
			headers: {
        			'Content-Type': 'application/json',
      			},
			mode: 'cors',
      			body: JSON.stringify(formData),
		})

		if (res.ok) {
			let user = await res.json();
			navigate(`/user/${user._id}`)
		} else {
			toast.warning('Username or password is incorrect')
			return;
		}
	}

	const handleChange = (e) => {
		setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
	}

	return (

		<div className="container">
			<div className="form-container">
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<input type="text" 
							id="userId"
							name="username"
							aria-describedby="userId"
							onChange={handleChange}
							value={formData.userid}
							placeholder="Username/email/phone"
							autoFocus
						/>
						<div id="userId" className="form-text">We'll never share your email with anyone else</div>
					</div>

					<div className="mb-3">
						<input type="password" 
							id="psw"
							name="password"
							onChange={handleChange} 
							value={formData.password}
							placeholder="password"
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