import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Toast from "@/utils/ToastMsg";
import { PulseLoader } from "react-spinners";

import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppContext } from "@/App";
import { fetcher } from "@/utils/fetcher";

export async function updateElectionLoader({ params }) {
	try {
		return await fetcher.get(`election/${params.electionId}`)
	} catch (error) {
		console.error("Failed to load election");
	}
}

function UpdateElection() {
	const election = useLoaderData();
	const electionTypes = ['Open', 'Closed']
	const addCandidatesMethods = ["I will Add Candidates Myself", "Candidates Will Add Themselves"]
	const params = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);


	const { user } = useContext(AppContext)

	const schema = z.object({
		electiontitle: z.string().min(2, { message: "Election title cannot be less than two characters" }),
		startdate: z.string().datetime({ local: true }),
		enddate: z.string().datetime({ local: true }),
		electiontype: z.string(),
		addCandidatesBy: z.string(),
		description: z.string().max(200),
		rules: z.string().max(1000)
	      }).superRefine((data, ctx) => {
		const start = new Date(data.startdate);
		const end = new Date(data.enddate);
	      
		if (start > end) {
		  ctx.addIssue({
		    code: z.ZodIssueCode.custom,
		    message: "Start date cannot come after end date",
		    path: ['startdate']
		  });
		}
	      
		if (start < new Date()) {
		  ctx.addIssue({
		    code: z.ZodIssueCode.custom,
		    message: "Start date cannot be in the past",
		    path: ['startdate']
		  });
		}
	});

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

	const { register, handleSubmit, formState: { errors, isDirty, dirtyFields } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			electiontitle: election.title,
			startdate: formatDate(new Date(election.startDate)),
			enddate: formatDate(new Date(election.endDate)),
			electiontype: election.type,
			addCandidatesBy: election.addCandidatesBy,
			description: election.desc,
			rules: election.rules
		}
	});

	async function onSubmit(formData) {
		setLoading(true);

		if (!isDirty) {
			Toast.info("You did not make any changes")
			setLoading(false)
			return
		}

		try {
			await fetcher.auth.patch(
				`elections/${election._id}`, {
					...formData
				},
				user
			)
			Toast.success("Event was updated")
			navigate(`/user/${params.userId}`)
		} catch (error) {
			Toast.error("There was a problem in the app")	
		}
	}

	return ( 
		<div className="container">
			<div className="form-container">
				<form onSubmit={handleSubmit(onSubmit)} aria-label="Update election form">
					{/* Election Title */}
					<div className="form-group">
						<label htmlFor="electionTitle" className="form-label">
							Election Name:
						</label>
						<input
							type="text"
							id="electionTitle"
							name="electiontitle"
							className="form-input"
							aria-describedby="electionName-help electionTitle-error"
							aria-invalid={errors.electiontitle ? "true" : "false"}
							autoFocus
							{...register('electiontitle')}
						/>
						{errors.electiontitle && (
							<span id="electionTitle-error" className="error-msg" role="alert">
								{errors.electiontitle.message}
							</span>
						)}
						<div id="electionName-help" className="form-text">
							Enter a descriptive title for this election
						</div>
					</div>

					{/* Start Date */}
					<div className="form-group">
						<label htmlFor="startDate" className="form-label">
							Start Date
						</label>
						<input
							type="datetime-local"
							id="startDate"
							name="startdate"
							className="form-input datetime-input"
							aria-describedby={errors.startdate ? "startDate-error" : undefined}
							aria-invalid={errors.startdate ? "true" : "false"}
							{...register('startdate')}
						/>
						{errors.startdate && (
							<span id="startDate-error" className="error-msg" role="alert">
								{errors.startdate.message}
							</span>
						)}
					</div>

					{/* End Date */}
					<div className="form-group">
						<label htmlFor="endDate" className="form-label">
							End Date
						</label>
						<input
							type="datetime-local"
							id="endDate"
							name="enddate"
							className="form-input datetime-input"
							aria-describedby={errors.enddate ? "endDate-error" : undefined}
							aria-invalid={errors.enddate ? "true" : "false"}
							{...register('enddate')}
						/>
						{errors.enddate && (
							<span id="endDate-error" className="error-msg" role="alert">
								{errors.enddate.message}
							</span>
						)}
					</div>

					{/* Election Type */}
					<div className="form-group">
						<label htmlFor="type" className="form-label">
							Select election type
						</label>
						<select
							id="type"
							className="form-select"
							name="electiontype"
							aria-label="Select election type"
							aria-describedby={errors.electiontype ? "type-error" : undefined}
							aria-invalid={errors.electiontype ? "true" : "false"}
							{...register('electiontype')}
						>
							<option value={election.type}>
								{election.type}
							</option>
							{electionTypes
								.filter(type => type !== election.type)
								.map(type => (
									<option key={type} value={type}>
										{type}
									</option>
								))
							}
						</select>
						{errors.electiontype && (
							<span id="type-error" className="error-msg" role="alert">
								{errors.electiontype.message}
							</span>
						)}
					</div>

					{/* Candidates Add Method */}
					<div className="form-group">
						<label htmlFor="candidateAddType" className="form-label">
							Select how candidates will be added
						</label>
						<select
							id="candidateAddType"
							className="form-select"
							name="addCandidatesBy"
							aria-label="Select election type"
							aria-describedby={errors.addCandidatesBy ? "type-error" : undefined}
							aria-invalid={errors.addCandidatesBy ? "true" : "false"}
							{...register('addCandidatesBy')}
						>
							<option value={election.addCandidatesBy}>
								{election.addCandidatesBy}
							</option>
							{addCandidatesMethods
								.filter(c => c !== election.addCandidatesBy)
								.map(addMethod => (
									<option key={addMethod} value={addMethod}>
										{addMethod}
									</option>
								))
							}
						</select>
						{errors.addCandidatesBy && (
							<span id="type-error" className="error-msg" role="alert">
								{errors.addCandidatesBy.message}
							</span>
						)}
					</div>

					{/* Description */}
					<div className="form-group">
						<label htmlFor="description" className="form-label">
							Description
						</label>
						<textarea
							id="description"
							name="description"
							className="form-textarea"
							rows="4"
							placeholder="Enter election description (max 200 characters)..."
							aria-describedby={errors.description ? "description-error" : undefined}
							aria-invalid={errors.description ? "true" : "false"}
							{...register('description')}
						/>
						{errors.description && (
							<span id="description-error" className="error-msg" role="alert">
								{errors.description.message}
							</span>
						)}
					</div>

					{/* Rules */}
					<div className="form-group">
						<label htmlFor="rules" className="form-label">
							Rules and Guidelines
						</label>
						<textarea
							id="rules"
							name="rules"
							className="form-textarea"
							rows="6"
							placeholder="Enter election rules and guidelines (max 1000 characters)..."
							aria-describedby={errors.rules ? "rules-error" : undefined}
							aria-invalid={errors.rules ? "true" : "false"}
							{...register('rules')}
						/>
						{errors.rules && (
							<span id="rules-error" className="error-msg" role="alert">
								{errors.rules.message}
							</span>
						)}
					</div>

					{/* Submit Button */}
					<div className="form-actions">
						<button
							type="submit"
							className="Button violet"
							disabled={loading || !isDirty}
							aria-busy={loading}
						>
							{loading ? (
								<>
									<span className="visually-hidden">Updating election...</span>
									<PulseLoader color="#fff" size={5} loading={loading} />
								</>
							) : (
								"Update Election"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default UpdateElection;