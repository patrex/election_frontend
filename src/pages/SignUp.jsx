import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function CreateAccount() { 
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		reEnterPassword: "",
		phoneNo: "",
		username: "",
	})

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.email && !formData.phoneNo) {
			Swal.fire({
				text: "You need to enter a phone number or email to continue",
				icon: "error"
			});

			return;
		}

		const res = await fetch(`/user/auth/signup`, {
			method: 'POST',
			headers: {
        			'Content-Type': 'application/json',
      			},
			mode: 'cors',
      			body: JSON.stringify(formData),
		})
		if(res.ok) navigate('/login')
		else {
			Swal.fire({
				text: `${res.text}`,
				icon: "error"
			});
		}
	}

	const handleChange = (e) => {
		setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
	}

	return (
		<div className="container">
			<div className="form-container">
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<div className="mb-3">
							<label htmlFor="firstname" className="form-label">Firstname</label>
							<input type="text" 
								id="firstname" 
								aria-describedby="firstname"
								name="firstname"
								onChange={handleChange}
								value={formData.firstname}
								placeholder="Firstname"
								autoFocus
							/>
							
						</div>
						<div className="mb-3">
							<label htmlFor="lastname" className="form-label">Lastname</label>
							<input type="text" 
								id="lastname" 
								aria-describedby="lastname"
								name="lastname"
								onChange={handleChange}
								value={formData.lastname}
								placeholder="Lastname"
							/>
		
						</div>
						<div className="mb-3">
							<label htmlFor="username" className="form-label">Username</label>
							<input type="text" 
								id="username" 
								aria-describedby="emailHelp"
								name="username"
								onChange={handleChange}
								value={formData.username}
								placeholder="choose a username"
							/>
					
						</div>
						<div className="mb-3">
							<label htmlFor="psw" className="form-label">Password</label>
							<input type="password" 
								id="psw"
								name="password"
								onChange={handleChange}
								value={formData.password}
								placeholder="password: be discreet"
							/>
						</div>

						<div className="mb-3">
							<label htmlFor="repeat" className="form-label">Re-enter password</label>
							<input type="password" 
								id="repeat"
								name="reEnterPassword"
								onChange={handleChange}
								value={formData.reEnterPassword}
								placeholder="re-type password"
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="userEmail" className="form-label">Email address</label>
							<input type="email" 
								id="userEmail" 
								aria-describedby="emailHelp"
								name="email"
								onChange={handleChange}
								value={formData.email}
								placeholder="enter your email"
							/>
							<div id="emailHelp" className="form-text">We'll never share your email</div>
						</div>

						<div className="mb-3">
							<label htmlFor="phoneno" className="form-label">Phone Number</label>
							<input type="tel" 
								id="phoneno" 
								aria-describedby="phoneno"
								name="phoneNo"
								onChange={handleChange}
								value={formData.phoneNo}
								placeholder="your phone number"
							/>
							<div id="firstname" className="form-text">We'll never share your phone number</div>
						</div>
					</div> 
					
					
					<button type="submit" className="Button violet">Create Account</button>
				</form>
			</div>
		</div>
	);
}
 
export default CreateAccount;