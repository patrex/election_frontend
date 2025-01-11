import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backendUrl from '../utils/backendurl'

import { toast } from 'sonner'

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'

function CreateElection() {
	const params = useParams();
	const navigate = useNavigate();

	const schema = Joi.object({
		electiontitle: Joi.string().min(2).required(),
		startdate: Joi.date().iso().min(new Date().getFullYear()).required(),
		enddate: Joi.date().iso().min(new Date().getFullYear()).required(),
		electiontype: Joi.string(),
		description: Joi.string().max(200),
		rules: Joi.string().max(1000),
	})
	
	const { register, handleSubmit, formState: {errors}, watch } = useForm({
		resolver: joiResolver(schema)
	});

	const eventIsClosed = watch('electiontype');

	async function onSubmit(formData) {
		const res = await fetch(`${backendUrl}/elections`, {
      			method: 'POST',
      			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
				'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'},
			mode: 'cors',
      			body: JSON.stringify({
				...formData,
				userId: params.userId,
				host_name: window.location.origin
			})
    		})

		if(res.ok) navigate(`/user/${params.userId}`)
		
		else {
			toast.warning('There was an error')
		}
	}

	return (
		<div className="container">
			<div className="form-container">
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
						<select className="form-select form-select-lg mb-3 w-50"
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

					{eventIsClosed === "Closed" && 
						<div className="closed-event my-2 p-2.5 w-3/5">
							<p>Select the method of user participation</p>
							<input {...register('userAuthType')} className="block p-2.5" type="radio" name="authtype" id="auth-email" value='email'/>
							<label htmlFor="auth-email" >Email</label>
							<input {...register('userAuthType')} className="block p-2.5" type="radio" name="authtype" id="auth-phone" value='phone'/>
							<label htmlFor="auth-phone">Phone</label>
						</div>
					}

					<textarea name="description" 
						id=""
						placeholder="Describe the election"
						{...register('description')}
						className="p-2 my-2"
					/> {errors.description && <span className='error-msg'>Cannot be more than 200 characters</span>}

					<textarea name="rules" 
						id=""
						placeholder="State any rules for this election"
						className="p-2 my-2"
						{...register('rules')}
					/> {errors.rules && <span className='error-msg'>Cannot be more than 1000 characters</span>}

					
					<button className="Button violet" type="submit">Create Election</button>
					
				</form>
			</div>
		</div>
	);
}
 
export default CreateElection;
