import { useLoaderData, Link, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import backendUrl from '../utils/backendurl'

export async function updateElectionLoader({ params }) {
	let election = undefined;

	try {
		const e = await fetch(`${backendUrl}/election/${params.electionId}`)
		election = await e.json();

	} catch (error) {
		
	}

	return election;
}

function UpdateElection() {
	const election = useLoaderData();
	const electionTypes = ['Open', 'Closed']

	const schema = yup.object().shape({
		electiontitle: yup.string().min(2).required(),
		startdate: yup.date().required().min(new Date()),
		enddate: yup
			 .date()
			 .required()
			 .min(yup.ref('startdate'), 'End date cannot be smaller than start date'),
		electiontype: yup.string(),
		description: yup.string().max(200),
		rules: yup.string().max(1000)
	})

	const { register, handleSubmit, formState, errors } = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			electiontitle: election.title,
			startdate: election.startDate,
			enddate: election.endDate,
			electiontype: election.type,
			description: election.desc,
			rules: election.rules
		}
	});

	const { dirtyFields, isDirty } = formState;

	async function onSubmit(formData) {
		if (isDirty) {
			const res = await fetch(`${backendUrl}/elections`, {
				method: 'PATCH',
				headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
				'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH'},
				mode: 'cors',
				      body: JSON.stringify({
					...formData,
					electionId: election._id	
				})
			    })
	
			if(res.ok) navigate(`/user/${params.userId}`)
			
			else {
				toast.warning('There was an error')
			}
		} else {
			toast.info("No updates made")
		}
	}

	return ( 
		<>
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

						<label htmlFor="type">Select the election type</label>
						<select className="form-select form-select-lg mb-3"
							id="type" 
							aria-label="Select election type"
							name="electiontype"
							{...register('electiontype')}
						>
							<option value={election.type} selected>{election.type}</option>
							{electionTypes.filter(type => election.type != type).map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>

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
						
						<button className="Button violet" type="submit">Save</button>
					</form>
				</div>
			</div>
		</>
	);
}

export default UpdateElection;