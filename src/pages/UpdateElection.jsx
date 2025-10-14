import { useLoaderData, Link, useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect, useContext } from "react";
import { fireman } from '../utils/fireloader';
import Toast from "@/utils/ToastMsg";

import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import backendUrl from '../utils/backendurl'
import { AppContext } from "@/App";

export async function updateElectionLoader({ params }) {
	let election = undefined;

	try {
		const e = await fetch(`${backendUrl}/election/${params.electionId}`)
		election = await e.json();
	} catch (error) {
		
	}

	return [election];
}

function UpdateElection() {
	const [election] = useLoaderData();
	const electionTypes = ['Open', 'Closed']
	const params = useParams();
	const navigate = useNavigate();

	const { user } = useContext(AppContext)

	const schema = z.object({
		electiontitle: z.string().min(2, {message: "Election title cannot be less than two characters"}),
		startdate: z.iso.datetime({ local: true}),
		enddate: z.iso.datetime({ local: true}),
		electiontype: z.string(),
		description: z.string().max(200),
		rules: z.string().max(1000)
	}).superRefine((data, ctx) => {
		if (data.startdate > data.enddate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Start date cannot come after end date",
				path: ['startdate']
			})
		}

		if (data.startdate < Date.now()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Start date cannot be in the past",
				path: ['startdate']
			})
		}
	})

	function formatDate(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

		let formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

		// Add optional seconds and milliseconds if they are greater than 0
		if (seconds !== '00' || milliseconds !== '000') {
		  formattedDate += `:${seconds}`;
		}
		if (milliseconds !== '000') {
		  formattedDate += `.${milliseconds}`;
		}
	      
		return formattedDate;
	}

	const { register, handleSubmit, formState } = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			electiontitle: election.title,
			startdate: formatDate(new Date(election.startDate)),
			enddate: formatDate(new Date(election.endDate)),
			electiontype: election.type,
			description: election.desc,
			rules: election.rules
		}
	});

	const { dirtyFields, isDirty, errors } = formState;

	async function onSubmit(formData) {
		if (isDirty) {
			const res = await fetch(`${backendUrl}/elections/${election._id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${await user?.getIdToken()}`
				},
				mode: 'cors',
				      body: JSON.stringify({
					...formData,
				})
			    })
	
			if(res.ok) {
				Toast.success("Event was updated")
				navigate(`/user/${params.userId}`)
			}
			
			else if (res.status === '404') {
				Toast.warning('Event not found')
				return;
			}

			else if (res.status === '500') {
				Toast.error("There was a problem in the app")
				return;
			}

		} else {
			Toast.info("No updates made")
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
							/> {errors.electiontitle && <span className='error-msg'>Title must be at least two characters</span>}
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
									className="Button mauve"
									{...register('enddate')}
								/>{errors.enddate && <span className='error-msg'>Cannot be less than start date</span>}
							</span>
							
						</div>

						<label htmlFor="type">Select the election type</label>
						<select className="form-select form-select-lg mb-3 w-50"
							id="type" 
							aria-label="Select election type"
							{...register('electiontype')}
						>
							<option value={election.type} selected>{election.type}</option>
							{electionTypes.filter(type => election.type != type).map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>

						<textarea
							id=""
							{...register('description')}
							className="p-2 my-2"
						/>{errors.description && <span className='error-msg'>Cannot be more than 200 characters</span>}

						<textarea name="rules" 
							id=""
							className="p-2 my-2"
							{...register('rules')}
						/>{errors.rules && <span className='error-msg'>Cannot be more than 1000 characters</span>}
						
						<button className="Button violet" type="submit">Save</button>
					</form>
				</div>
			</div>
		</>
	);
}

export default UpdateElection;