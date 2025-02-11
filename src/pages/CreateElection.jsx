import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import backendUrl from '../utils/backendurl'

import Toast from "@/utils/ToastMsg";

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'

function CreateElection() {
	const params = useParams();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);

	const schema = Joi.object({
		electiontitle: Joi.string().min(2).required(),
		startdate: Joi.date().iso().min(new Date().getFullYear()).required(),
		enddate: Joi.date().iso().min(new Date().getFullYear()).required(),
		electiontype: Joi.string().required(),
		description: Joi.string(),
		rules: Joi.string(),
		userAuthType: Joi.string().required()
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema),
	});

	async function onSubmit(formData) {
		setLoading(true)

		try {
			const res = await fetch(`${backendUrl}/elections`, {
				      method: 'POST',
				      headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				      body: JSON.stringify({
					...formData,
					userId: params.userId,
					host_name: window.location.origin
				})
			})

			if (!res.ok) {
				Toast.warning("Could not complete the request")
				return
			}
	
			navigate(`/user/${params.userId}`)
		} catch (error) {
			Toast.error('There was an error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container">
			<div className="form-container" style={ {border: 'none'} }>
				<form onSubmit={ handleSubmit(onSubmit) }>
					<div className="mb-3">
						<label htmlFor="electionTitle" className="form-label">Election Name: </label>
						<input type="text" 
							id="electionTitle" 
							aria-describedby="electionName" 
							name="electiontitle"
							autoFocus
							{...register('electiontitle')}
						/>{errors.electiontitle && <span className='error-msg'>You need at least two characters</span>}
						<div id="electionName" className="form-text">Enter a descriptive title this election</div>
					</div>
					<div className="mb-3">
						<label htmlFor="startDate" className="px-2">Start Date</label>
						<span>
							<input type="datetime-local" 
								id="startDate" 
								name="startdate"
								className="Button mauve"
								{...register('startdate')}
							/>
						</span>{errors.startdate && <span className='error-msg'>Start date cannot be less than current year</span>}
					</div>

					<div className="mb-3">
						<label htmlFor="endDate" className="px-2">End Date</label>
						<span>
							<input type="datetime-local" 
								id="endDate" 
								name="enddate"
								className="Button mauve"
								{...register('enddate')}
							/>{errors.enddate && <span className='error-msg'>Cannot be more than 3000</span>}
						</span>
					</div>

					<div className="mb-3">
						<label htmlFor="type">Select the election type</label>
						<select className="form-select form-select-lg mb-3 w-3/5"
							id="type" 
							aria-label="Large select example"
							name="electiontype"
							{...register('electiontype')}
						>
							<option value="" disabled>Select type</option>
							<option value="Open">Open</option>
							<option value="Closed">Closed</option>
						</select>
					</div>

					
					<div className="closed-event my-2 p-2.5 w-4/5">
						<p>How will voters participate?</p>
						
						<label htmlFor="auth-email" className="auth-type-label"><input {...register('userAuthType')} type="radio"  id="auth-email" value='email'/><span>Email</span></label>
						<label htmlFor="auth-phone" className="auth-type-label"><input {...register('userAuthType')} type="radio"  id="auth-phone" value='phone'/><span>Phone</span></label>
					</div>
					

					<textarea name="description" 
						id=""
						placeholder="Describe the election(optional)"
						{...register('description')}
						className="p-2 my-2"
					/> {errors.description && <span className='error-msg'>Cannot be more than 200 characters</span>}

					<textarea name="rules" 
						id=""
						placeholder="State any rules for this election"
						className="p-2 my-2"
						{...register('rules')}
					/> {errors.rules && <span className='error-msg'>Cannot be more than 1000 characters</span>}
					
					<div className="action-btn-container">
						<button type="submit" disabled={loading} 
							className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500 transition duration-200">
								Create Election</button>
					</div>
				</form>
			</div>
		</div>
	);
}
 
export default CreateElection;
