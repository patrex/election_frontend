import { useNavigate, useParams } from "react-router-dom";
import Toast from "@/utils/ToastMsg";
import { AppContext } from '@/App';
import { PulseLoader } from 'react-spinners';
import { fetcher, FetchError } from "@/utils/fetcher"
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getLocalTimezoneDate } from "@/utils/setLocalTime";

function CreateElection() {
	const params = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AppContext);
	const [loading, setLoading] = useState(false);

	// Zod Schema
	const getLocalTodayStart = () => {
		const now = new Date();
		// Set time to 00:00:00.000 in the local timezone
		now.setHours(0, 0, 0, 0);
		return now;
	};

	const schema = z.object({
		electiontitle: z
			.string()
			.min(2, { message: "Election title must be at least 2 characters" })
			.max(100, { message: "Election title cannot exceed 100 characters" }),
		startdate: z
			.preprocess((arg) => {
				if (typeof arg == "string" || arg instanceof Date) return getLocalTimezoneDate(arg);
			}, z.date({
				required_error: "Start date is required",
				invalid_type_error: "Invalid date format",
			}))
			.refine((date) => {
				return date > new Date();
			}, {
				message: "Start date/time cannot be in the past"
			}),

		enddate: z
			.preprocess((arg) => {
				if (typeof arg == "string" || arg instanceof Date) return getLocalTimezoneDate(arg);
			}, z.date({
				required_error: "End date is required",
				invalid_type_error: "Invalid date format",
			}))
			.refine((date) => {
				return date.getFullYear() <= 3000;
			}, { message: "End date cannot be later than the year 3000" }),
		addCandidatesBy: z
			.string()
			.min(1, { message: "Please select how candidates will get added" }),
		electiontype: z
			.string()
			.min(1, { message: "Please select an election type" }),
		userAuthType: z
			.enum(['email', 'phone'], {
				errorMap: () => ({ message: "Please select how voters will get verified" })
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
		// This is now clean because both are guaranteed to be valid Date objects
		return data.enddate > data.startdate;
	}, {
		message: "End date must be after start date",
		path: ["enddate"],
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
			addCandidatesBy: ''
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
			return Toast.error('Could not create the election');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container flex justify-center py-10">
			<div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Election</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Create election form">

					{/* Election Name */}
					<div className="form-group">
						<label htmlFor="electionTitle" className="block font-medium mb-1 text-gray-700">
							Election Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="electionTitle"
							autoFocus
							{...register('electiontitle')}
							className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.electiontitle ? 'border-red-500' : 'border-gray-300'
								}`}
						/>
						{errors.electiontitle && (
							<p className="text-red-500 text-sm mt-1" role="alert">{errors.electiontitle.message}</p>
						)}
					</div>

					{/* Dates Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="form-group">
							<label htmlFor="startDate" className="block font-medium mb-1 text-gray-700">
								Start Date <span className="text-red-500">*</span>
							</label>
							<input
								type="datetime-local"
								id="startDate"
								{...register('startdate')}
								className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${errors.startdate ? 'border-red-500' : 'border-gray-300'
									}`}
							/>
							{errors.startdate && <p className="text-red-500 text-sm mt-1">{errors.startdate.message}</p>}
						</div>

						<div className="form-group">
							<label htmlFor="endDate" className="block font-medium mb-1 text-gray-700">
								End Date <span className="text-red-500">*</span>
							</label>
							<input
								type="datetime-local"
								id="endDate"
								{...register('enddate')}
								className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${errors.enddate ? 'border-red-500' : 'border-gray-300'
									}`}
							/>
							{errors.enddate && <p className="text-red-500 text-sm mt-1">{errors.enddate.message}</p>}
						</div>
					</div>

					{/* Selection Options */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="form-group">
							<label htmlFor="type" className="block font-medium mb-1 text-gray-700">Election Type</label>
							<select id="type" {...register('electiontype')} className="w-full px-4 py-2 border border-gray-300 rounded-md">
								<option value="" disabled>-Select type...</option>
								<option value="Open">Open</option>
								<option value="Closed">Closed</option>
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="candidateAddType" className="block font-medium mb-1 text-gray-700">Candidate Entry</label>
							<select id="candidateAddType" {...register('addCandidatesBy')} className="w-full px-4 py-2 border border-gray-300 rounded-md">
								<option value="" disabled>Please select...</option>
								<option value="I will Add Candidates Myself">I will Add Candidates Myself</option>
								<option value="Candidates Will Add Themselves">Candidates Will Add Themselves</option>
							</select>
						</div>
					</div>

					{/* Simplified Voter Authentication (The requested simplification) */}
					<div className="p-4 border border-orange-200 rounded-lg bg-orange-50/30">
						<label className="block font-semibold mb-3 text-gray-700">
							How will voters be verified? <span className="text-red-500">*</span>
						</label>

						<div className="flex flex-col sm:flex-row gap-4">
							{/* Email Option */}
							<label className="relative flex-1 flex items-center p-3 rounded-md border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
								<input
									{...register('userAuthType')}
									type="radio"
									id="auth-email"
									value="email"
									className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
								/>
								<span className="ml-3 font-medium text-gray-700">Email Address</span>
							</label>

							{/* Phone Option */}
							<label className="relative flex-1 flex items-center p-3 rounded-md border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
								<input
									{...register('userAuthType')}
									type="radio"
									id="auth-phone"
									value="phone"
									className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
								/>
								<span className="ml-3 font-medium text-gray-700">Phone Number</span>
							</label>
						</div>

						{errors.userAuthType && (
							<p className="text-red-500 text-sm mt-2" role="alert">
								{errors.userAuthType.message}
							</p>
						)}
					</div>

					{/* Description & Rules */}
					<div className="space-y-4">
						<div className="form-group">
							<label htmlFor="description" className="block font-medium mb-1 text-gray-700">Description</label>
							<textarea
								id="description"
								rows="3"
								{...register('description')}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="rules" className="block font-medium mb-1 text-gray-700">Rules</label>
							<textarea
								id="rules"
								rows="3"
								{...register('rules')}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
							/>
						</div>
					</div>

					{/* Submit Button */}
					<div className="text-center pt-4">
						<button
							type="submit"
							disabled={loading || isSubmitting}
							className="Button violet w-full md:w-auto px-10"
						>
							{loading ? <PulseLoader color="#fff" size={5} /> : 'Create Election'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};


export default CreateElection;
