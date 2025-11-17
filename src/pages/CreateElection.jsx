import { useNavigate, useParams } from "react-router-dom";
import Toast from "@/utils/ToastMsg";
import { AppContext } from '@/App';

import { PulseLoader } from 'react-spinners';
import {fetcher, FetchError} from "@/utils/fetcher"
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

function CreateElection() {
	const params = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AppContext);
	const [loading, setLoading] = useState(false);

	// Zod Schema
	const schema = z.object({
		electiontitle: z
			.string()
			.min(2, { message: "Election title must be at least 2 characters" })
			.max(100, { message: "Election title cannot exceed 100 characters" }),
		startdate: z
			.string()
			.refine((date) => {
				const selectedDate = new Date(date);
				const now = Date.now();
				return selectedDate > now;
			}, { message: "Start date cannot be in the past" }),
		enddate: z
			.string()
			.refine((date) => {
				const selectedDate = new Date(date);
				return selectedDate.getFullYear() <= 3000;
			}, { message: "End date cannot be later than the year 3000" }),
		electiontype: z
			.string()
			.min(1, { message: "Please select an election type" }),
		userAuthType: z
			.enum(['email', 'phone'], { 
				errorMap: () => ({ message: "Please select how voters will participate" }) 
			}),
		description: z
			.string()
			.max(200, { message: "Description cannot exceed 200 characters" })
			.optional(),
		rules: z
			.string()
			.max(1000, { message: "Rules cannot exceed 1000 characters" })
			.optional(),
	}).refine((data) => {
		// Validate that end date is after start date
		const start = new Date(data.startdate);
		const end = new Date(data.enddate);
		return end > start;
	}, {
		message: "End date must be after start date",
		path: ["enddate"], // This error will appear on the enddate field
	});

	const { 
		register, 
		handleSubmit, 
		formState: { errors, isSubmitting } 
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			electiontitle: '',
			startdate: '',
			enddate: '',
			electiontype: '',
			userAuthType: '',
			description: '',
			rules: '',
		}
	});

	const onSubmit = async (formData) => {
		setLoading(true);

		try {
			await fetcher.auth.post(
				'elections', 
				{
					...formData,
					host_name: window.location.origin
				},
				user
			);
			
			Toast.success('Election created successfully!');
			navigate(`/user/${params.userId}`);
		} catch (error) {
			if (error instanceof FetchError) {
				if (error.status === 500) {
					Toast.warning("There was an unexpected error");
				} else if (error.status === 400) {
					Toast.warning(error.message);
				} else if (error.code !== 'AUTH_REQUIRED' && error.code !== 'TOKEN_EXPIRED') {
					Toast.error('Could not create the election');
				}
			} else {
				Toast.error('An unexpected error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container flex justify-center py-10">
			<div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Election</h1>
				
				<form 
					onSubmit={handleSubmit(onSubmit)} 
					className="space-y-6"
					aria-label="Create election form"
				>
					{/* Election Name */}
					<div className="form-group">
						<label 
							htmlFor="electionTitle" 
							className="block font-medium mb-1 text-gray-700"
						>
							Election Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="electionTitle"
							name="electiontitle"
							autoFocus
							aria-describedby="electionTitle-help electionTitle-error"
							aria-invalid={errors.electiontitle ? "true" : "false"}
							{...register('electiontitle')}
							className={` ${
								errors.electiontitle ? 'border-red-500' : ''
							}`}
						/>
						{errors.electiontitle && (
							<p 
								id="electionTitle-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.electiontitle.message}
							</p>
						)}
						<p id="electionTitle-help" className="text-gray-500 text-sm mt-1">
							Enter a descriptive title for this election
						</p>
					</div>

					{/* Start Date */}
					<div className="form-group">
						<label 
							htmlFor="startDate" 
							className="block font-medium mb-1 text-gray-700"
						>
							Start Date <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							id="startDate"
							name="startdate"
							aria-describedby={errors.startdate ? "startDate-error" : undefined}
							aria-invalid={errors.startdate ? "true" : "false"}
							{...register('startdate')}
							className={`${
								errors.startdate ? 'border-red-500' : 'border-gray-300'
							}`}
						/>
						{errors.startdate && (
							<p 
								id="startDate-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.startdate.message}
							</p>
						)}
					</div>

					{/* End Date */}
					<div className="form-group">
						<label 
							htmlFor="endDate" 
							className="block font-medium mb-1 text-gray-700"
						>
							End Date <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							id="endDate"
							name="enddate"
							aria-describedby={errors.enddate ? "endDate-error" : undefined}
							aria-invalid={errors.enddate ? "true" : "false"}
							{...register('enddate')}
							className={`${
								errors.enddate ? 'border-red-500' : 'border-gray-300'
							}`}
						/>
						{errors.enddate && (
							<p 
								id="endDate-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.enddate.message}
							</p>
						)}
					</div>

					{/* Election Type */}
					<div className="form-group">
						<label 
							htmlFor="type" 
							className="block font-medium mb-1 text-gray-700"
						>
							Election Type <span className="text-red-500">*</span>
						</label>
						<select
							id="type"
							name="electiontype"
							aria-describedby={errors.electiontype ? "type-error" : undefined}
							aria-invalid={errors.electiontype ? "true" : "false"}
							{...register('electiontype')}
							className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer ${
								errors.electiontype ? 'border-red-500' : 'border-gray-300'
							}`}
						>
							<option value="">Select type</option>
							<option value="Open">Open</option>
							<option value="Closed">Closed</option>
						</select>
						{errors.electiontype && (
							<p 
								id="type-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.electiontype.message}
							</p>
						)}
					</div>

					{/* Voter Authentication Type */}
					<fieldset className="border border-orange-300 rounded-md p-4">
						<legend className="font-semibold px-2 text-gray-700">
							How will voters participate? <span className="text-red-500">*</span>
						</legend>

						<div className="space-y-3 mt-3">
							<label
								htmlFor="auth-email"
								className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
							>
								<div className="flex items-center">
									<input
										{...register('userAuthType')}
										type="radio"
										id="auth-email"
										value="email"
										className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
									/>
									<span className="ml-3 text-gray-700 font-medium">Email</span>
								</div>
								<svg
									className="w-5 h-5 text-blue-600 opacity-0 has-[:checked]:opacity-100 transition-opacity"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							</label>

							<label
								htmlFor="auth-phone"
								className="flex items-center justify-between cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
							>
								<div className="flex items-center">
									<input
										{...register('userAuthType')}
										type="radio"
										id="auth-phone"
										value="phone"
										className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
									/>
									<span className="ml-3 text-gray-700 font-medium">Phone</span>
								</div>
								<svg
									className="w-5 h-5 text-blue-600 opacity-0 has-[:checked]:opacity-100 transition-opacity"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							</label>
						</div>

						{errors.userAuthType && (
							<p className="text-red-500 text-sm mt-2" role="alert">
								{errors.userAuthType.message}
							</p>
						)}
					</fieldset>

					{/* Description */}
					<div className="form-group">
						<label 
							htmlFor="description" 
							className="block font-medium mb-1 text-gray-700"
						>
							Description (Optional)
						</label>
						<textarea
							id="description"
							name="description"
							rows="4"
							placeholder="Describe this election (optional)"
							aria-describedby={errors.description ? "description-error" : undefined}
							aria-invalid={errors.description ? "true" : "false"}
							{...register('description')}
							className={` ${
								errors.description ? 'border-red-500' : ''
							}`}
						/>
						{errors.description && (
							<p 
								id="description-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.description.message}
							</p>
						)}
					</div>

					{/* Rules */}
					<div className="form-group">
						<label 
							htmlFor="rules" 
							className="block font-medium mb-1 text-gray-700"
						>
							Rules and Guidelines (Optional)
						</label>
						<textarea
							id="rules"
							name="rules"
							rows="6"
							placeholder="State any rules for this election (optional)"
							aria-describedby={errors.rules ? "rules-error" : undefined}
							aria-invalid={errors.rules ? "true" : "false"}
							{...register('rules')}
							className={`${
								errors.rules ? 'border-red-500' : ''
							}`}
						/>
						{errors.rules && (
							<p 
								id="rules-error" 
								className="text-red-500 text-sm mt-1" 
								role="alert"
							>
								{errors.rules.message}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<div className="form-actions text-center pt-4">
						<button
							type="submit"
							disabled={loading || isSubmitting}
							aria-busy={loading}
							className="Button violet"
						>
							{loading ? (
								<>
									<span className="sr-only">Creating election...</span>
									<PulseLoader color="#fff" size={5} loading={loading} />
								</>
							) : (
								'Create Election'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

 
export default CreateElection;
