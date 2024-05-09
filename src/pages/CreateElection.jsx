import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from 'sonner'

function CreateElection() {
	const params = useParams();

	const navigate = useNavigate();

	const [formData, setFormData] = useState({ 
		electiontitle: "",
		startdate: "",
		enddate: "",
		electiontype: "",
		description: "",
		rules: "",
	});

	async function handleSubmit(e) {
		e.preventDefault();

		const res = await fetch(`/elections`, {
      			method: 'POST',
      			headers: {
        			'Content-Type': 'application/json',
      			},
			mode: 'cors',
      			body: JSON.stringify({
				...formData,
				userId: params.userId
			}),
    		})

		if(res.ok) navigate(`/user/${params.userId}`)
		
		else {
			toast.warning(res.text)
		}
	}

	const handleChange = (e) => {
		const {name, value, type, checked} = e.target
		setFormData(prev => ({
			...prev, 
			[name]: type === 'checkbox' ? checked : value
		}));
	}

	return (
		<div className="container">
			<div className="form-container">
				<form method="POST" onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="electionTitle" className="form-label">Election Name: </label>
						<input type="text" 
							id="electionTitle" 
							aria-describedby="electionName" 
							name="electiontitle"
							value={formData.electiontitle}
							onChange={handleChange}
							autoFocus
						/>
						<div id="electionName" className="form-text">Enter a descriptive title this election</div>
					</div>
					<div className="mb-3">
						<label htmlFor="startDate" className="form-label">Start Date and time: </label>
						<input type="datetime-local" 
							id="startDate" 
							name="startdate"
							value={formData.startdate}
							onChange={handleChange}
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="endDate" className="form-label">End Date and time: </label>
						<input type="datetime-local" 
							id="endDate" 
							name="enddate"
							value={formData.enddate}
							onChange={handleChange}
						/>
					</div>

					<label htmlFor="type">Select the election type</label>
					<select className="form-select form-select-lg mb-3"
						id="type" 
						aria-label="Large select example"
						name="electiontype"
						value={formData.electiontype}
						onChange={handleChange}
					>
						<option value="" disabled>Select type</option>
						<option value="open">Open</option>
						<option value="closed">Closed</option>
					</select>

					<textarea name="description" 
						id="" cols="55" rows="5" 
						value={formData.description}
						onChange={handleChange} 
						placeholder="Describe the election"
						className="block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-blue-500 focus:outline-none"
					/>

					<textarea name="rules" 
						id="" cols="55" rows="5" 
						value={formData.rules}
						onChange={handleChange} 
						placeholder="State any rules for this election"
						className="block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-blue-500 focus:outline-none"
					/>

					<div>
						<button className="Button violet" type="submit" onClick={handleSubmit}>Create Election</button>
					</div>
				</form>
			</div>
		</div>
	);
}
 
export default CreateElection;