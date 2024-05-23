import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLoaderData, json } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import moment from 'moment';
import { toast } from 'sonner';
import NotFound from './NotFound';

import Joi from 'joi';
import { useForm } from 'react-hook-form'
import {joiResolver} from '@hookform/resolvers/joi'


import { fireman } from '../utils/fireloader';

export async function candidateSelfAddLoader({params}) {
	try {
		const Election = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}`);
		const Positions = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}/positions`);

		if (!Election.ok || !Positions.ok) throw new Error("Election not found");
		
		const election = await Election.json();
		const positions = await Positions.json();

		return [election, positions];
	} catch (error) {
		throw json({message: error.message}, {status: 500})
	}

	return [ election, positions ];
}

function CandidateSelfAdd() {
	const params = useParams();
	const navigate = useNavigate();
	
	const schema = Joi.object({
		firstname: Joi.string().min(2).required(),
		lastname: Joi.string().min(2).required(),
		manifesto: Joi.string().min(0).max(200)
	})
	
	const { register, handleSubmit, formState: {errors} } = useForm({
		resolver: joiResolver(schema)
	});

	const [election, positions] = useLoaderData();

	const [selectedPosition, setSelectedPosition] = useState("");
	const [OTPOpen, setOTPOpen] = useState(false);
	const [OTPVal, setOTPVal] = useState('');
	const [phoneNo, setPhoneNo] = useState('');
	const [phoneModalOpen, setPhoneModalOpen] = useState(false);
	const [eventException, setEventException] = useState(false);

	const [image, setImage] = useState('');

	const uploadImage = () => {
		let photoUrl = ''
		const imgRef =
		 ref(fireman, `votersystem/${params.id}/${selectedPosition}/${formData.firstname.concat(formData.lastname) }`);

		uploadBytes(imgRef, image)
			.then(snapshot => getDownloadURL(snapshot.ref))
			.then(imgUrl => {
				photoUrl = imgUrl;
			})
			.then( async (data) => {
				const res = await fetch(`https://election-backend-kduj.onrender.com/election/${params.id}/add-candidate`, {
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						...formData,
						photoUrl,
						selectedPosition
					}),
				})

				if(res.ok) {
					navigate('/')
				}
			})
			.catch(err => console.log(err))
	}

	let onSubmit = function (formData) {
		if (!selectedPosition) {
			toast.info("You need to select a position first")
			return;
		}

		if (moment(election.endDate).isBefore(new Date())) {
			toast.warning("Not allowed!");
			return;
		}

		if (moment(election.startDate).isBefore(new Date())) {
			toast.warning("Not allowed!");
			return;
		}

		setPhoneModalOpen(true)
	}

	let handleSelect = function(e) {
		const selected = e.target.value;
		setSelectedPosition(selected);
	}

	function handleOTPChange(e) {
		setOTPVal(e.target.value)
	}

	const closeOTPModal = () => {
		setOTPOpen(false)
	}

	const handleOTPSubmit = async () => {
		let s = await fetch(`https://election-backend-kduj.onrender.com/election/${OTPVal}/verifyOTP`);
		if (s.ok) {
			closeOTPModal();
			setOTPVal('');

			uploadImage();
		} else {
			toast.warning("That was invalid. Check the number and try again");
			return;
		}
	};

	function collectPhoneNo(e) {
		setPhoneNo(e.target.value)
	}

	function closePhoneNoModal() {
		setPhoneModalOpen(false);
	}

	async function procOTP (phoneNumber) {
		// create an OTP for verification
		const s = await fetch(`https://election-backend-kduj.onrender.com/election/getOTP`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			mode: 'cors',
			body: JSON.stringify({
				phoneNumber
			}),
		})

		if (s.ok) {
			closePhoneNoModal()
			setOTPOpen(true) //open otp modal
		}	
	}

	async function procPhoneNumber() {
		if (phoneNo) {
			const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
			const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;

			let phoneNumber = '';
			
			if (phoneNo.match(countryCodePattern)) {
				procOTP(phoneNo)
			} else if(phoneNo.match(phoneNumberPattern)) {
				phoneNumber = phoneNo.replace(phoneNumberPattern, '234$2');

				setPhoneNo(phoneNumber)
				procOTP(phoneNumber)
			} else {
				toast.warning("A valid phone number is required to continue")
				return;
			} 
		} else toast.warning("You must enter a phone number to continue")
	}

	function procElection() {
		moment(election.endDate).isBefore(new Date()) && setEventException(true);
		moment(election.startDate).isBefore(new Date()) && setEventException(true);

	}

	useEffect (() => { procElection() }, [election])


	return (
		<>
			{phoneModalOpen && 
				<div className="modal-overlay">
					<div className="w-full sm:w-1/2 max-w-full sm:max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
						<h5>{`${election.title}`}</h5>
						<h3>Enter your phone number to continue</h3>
						<input 
							type="text"
							id="phone-field"
							onChange={collectPhoneNo}
							value={phoneNo}
							placeholder="phone number"
						/>
						<div className="my-2">
							<button className="Button violet" onClick={procPhoneNumber}>Continue</button>
							<button className="Button red my-0 mx-3 w-20" onClick={closePhoneNoModal}>Cancel</button>
						</div>
					</div>
				</div>
			}

			{OTPOpen && 
				<div className="modal-overlay">
					<div className="w-full sm:w-1/2 max-w-full sm:max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
						<h5>{`${election.title}`}</h5>
						<p>You should have received a verification at the phone number you provided</p>
						<h3>Enter Confirmation Code</h3>
						<input 
							type="number" 
							id="opt-field"
							onChange={handleOTPChange}
							value={OTPVal}
							placeholder="confirmation code"
						/>
						<div className="my-2">
							<button className="Button violet" onClick={handleOTPSubmit}>Verify</button>
							<button className="Button red my-0 mx-3 w-20" onClick={closeOTPModal}>Cancel</button>
						</div>
					</div>
				</div>
			}

			{eventException &&
				<div className="modal-overlay">
					<div className="w-full sm:w-1/2 max-w-full sm:max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
						<h5>{`${election.title}`}</h5>
						<hr />
						{moment(election.endDate).isBefore(new Date()) && <h6>This event has closed</h6>}
						{(moment(election.startDate).isBefore(new Date()) && !moment(election.endDate).isBefore(new Date())) &&<h6>You cannot register because this event has already started</h6>}
						{/* {moment(election.startDate).isAfter(new Date()) && <h3>Election not started</h3>} */}
						
						<hr />
						
						<div className="my-2">
							{moment(election.endDate).isBefore(new Date()) && <button className="Button violet" onClick={() => navigate(`/election/${election._id}/results`)}>View Results</button>}
							<button className="Button red my-0 mx-3 w-20" onClick={() => navigate('/')}>Go Home</button>
						</div>
					</div>
				</div>

			}


			<div className='split-container'>
				<div className="left-split">
					<h3>welcome. register for {election.title}</h3>
					<div className="form-container">
						<form className='form' onSubmit={ handleSubmit(onSubmit) }>
							<div className="mb-3">
								<label htmlFor="fname" className="form-label">Firstname: </label>
								<input
									type="text"
									id="fname"
									name='firstname'
									{...register("firstname")}
					
								/>{errors.firstname && <span className='error-msg'>Firstname must be at least two characters</span>}
							</div>
							<div className="mb-3">
								<label htmlFor="lname" className="form-label">Lastname: </label>
								<input
									type="text"
									id="lname"
									name='lastname'
									{...register("lastname")}
								/> {errors.lastname && <span className='error-msg'>Lastname must be at least two characters</span>}
							</div>

							<div className='mb-3'>
								<label>
									Select position:
									<select name="position"
										className='form-select form-select-lg mb-3'
										value={selectedPosition}
										onChange={handleSelect}
									>
										<option value="" disabled>Select a position</option>
										{positions.map((position) => (
											<option key={position.position} value={position.position}>
												{position.position}
											</option>
										))}
									</select>
								</label>
							</div>

							<div className="mb-3">
								<textarea name="manifesto"
									id="" rows="3" cols="55"
									placeholder="manifesto"
									className='block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-transparent focus:outline-none'
									{...register("manifesto")}
								/> {errors.manifesto && <span className='error-msg'>Manifesto cannot be more than 200 characters</span>}
							</div>

							<div className="mb-3">
								<span>Please select an optional picture</span>
								<br />
								<input className='p-2 m-2 border border-gray-300 rounded-lg'
									type="file"
									id=""
									onChange={
										e => setImage(e.target.files[0])
									}
								/>
							</div>

							<button type='submit' className="Button violet" onSubmit={handleSubmit}>Submit</button>
						</form>
					</div>
				</div>

				<div className="right-split">
					<div className="bg-violet rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out">
						<div className="p-5">
							<h2><strong>{election.title}</strong></h2>
							<h4><strong>Description:</strong> {election.desc ? election.desc : ''}</h4>
							<h4><strong>Start date:</strong> {election.startDate ? moment(election.startDate).format('LLL') : ''}</h4>
							<h4><strong>End date:</strong> {election.endDate ? moment(election.endDate).format('LLL') : ''}</h4>
						</div>
					</div>
				</div>


			</div>
		</>
	);
}
 
export default CandidateSelfAdd;
