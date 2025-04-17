import { useNavigate, useParams } from "react-router-dom";
import { useState, useContext } from "react";
import backendUrl from '../utils/backendurl'

import Toast from "@/utils/ToastMsg";

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { AppContext } from '@/App';

import { PulseLoader } from 'react-spinners';



function CreateElection() {
	const params = useParams();
	const navigate = useNavigate();

	const { user } = useContext(AppContext);
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
					Authorization: `Bearer ${ await user?.getIdToken() }`
				},
				body: JSON.stringify({
					...formData,
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
		<div className="container flex justify-center py-10">
  <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Election Name */}
      <div>
        <label htmlFor="electionTitle" className="block font-medium mb-1">Election Name</label>
        <input
          type="text"
          id="electionTitle"
          name="electiontitle"
          autoFocus
          {...register('electiontitle')}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        />
        {errors.electiontitle && (
          <p className="text-red-500 text-sm mt-1">You need at least two characters</p>
        )}
        <p className="text-gray-500 text-sm mt-1">Enter a descriptive title for this election</p>
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block font-medium mb-1">Start Date</label>
        <input
          type="datetime-local"
          id="startDate"
          name="startdate"
          {...register('startdate')}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        />
        {errors.startdate && (
          <p className="text-red-500 text-sm mt-1">Start date cannot be less than the current year</p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="endDate" className="block font-medium mb-1">End Date</label>
        <input
          type="datetime-local"
          id="endDate"
          name="enddate"
          {...register('enddate')}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        />
        {errors.enddate && (
          <p className="text-red-500 text-sm mt-1">End date cannot be later than the year 3000</p>
        )}
      </div>

      {/* Election Type */}
      <div>
        <label htmlFor="type" className="block font-medium mb-1">Election Type</label>
        <select
          id="type"
          name="electiontype"
          {...register('electiontype')}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        >
          <option value="" disabled>Select type</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Voter Authentication Type */}
      <div className="border border-[#feb47b] rounded-md my-4 p-4 w-full max-w-2xl">
  <p className="font-semibold mb-3">How will voters participate?</p>

  <label htmlFor="auth-email" className="block cursor-pointer my-4">
    <input
      {...register('userAuthType')}
      type="radio"
      id="auth-email"
      value="email"
      className="hidden peer"
    />
    <span className="inline-flex items-center rounded-[10px] transition-all duration-200 before:content-[''] before:h-5 before:w-5 before:rounded-full before:ml-2 before:mr-4 before:bg-transparent before:shadow-[inset_0_0_0_1px_black] peer-checked:before:shadow-[inset_0_0_0_5px_black]">
      Email
    </span>
  </label>

  <label htmlFor="auth-phone" className="block cursor-pointer my-4">
    <input
      {...register('userAuthType')}
      type="radio"
      id="auth-phone"
      value="phone"
      className="hidden peer"
    />
    <span className="inline-flex items-center rounded-[10px] transition-all duration-200 before:content-[''] before:h-5 before:w-5 before:rounded-full before:ml-2 before:mr-4 before:bg-transparent before:shadow-[inset_0_0_0_1px_black] peer-checked:before:shadow-[inset_0_0_0_5px_black]">
      Phone
    </span>
  </label>
</div>


      {/* Description */}
      <div>
        <textarea
          name="description"
          placeholder="Describe the election (optional)"
          {...register('description')}
          className="w-full px-4 py-2 border rounded-md resize-y focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">Cannot be more than 200 characters</p>
        )}
      </div>

      {/* Rules */}
      <div>
        <textarea
          name="rules"
          placeholder="State any rules for this election"
          {...register('rules')}
          className="w-full px-4 py-2 border rounded-md resize-y focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        />
        {errors.rules && (
          <p className="text-red-500 text-sm mt-1">Cannot be more than 1000 characters</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 transition duration-200"
          style={{ '--tw-ring-color': 'rgba(218, 165, 32, 0.5)' }}
        >
          {loading ? <PulseLoader color="#fff" size={5} loading={loading} /> : 'Create Election'}
        </button>
      </div>
    </form>
  </div>
</div>


	);
}
 
export default CreateElection;
