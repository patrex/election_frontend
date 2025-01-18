import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from 'sonner'

import backendUrl from '../utils/backendurl'

export async function homeLoader({ request }) {
	const url = new URL(request.url);
	const electionid = url.searchParams.get("event_id")

	return electionid 
}

function Home() {
	const navigate = useNavigate();
	const [id, setId] = useState('');
	const [OTPOpen, setOTPOpen] = useState(false);
	const [OTPVal, setOTPVal] = useState('');
	const [participant, setParticipant] = useState('');
	const [phoneModalOpen, setPhoneModalOpen] = useState(false);
	const [election, setElection] = useState({});

	let electionFromQueryParams = useLoaderData()
	
	function handleChange(e) {
		setId(e.target.value)
	}
	
	useEffect (() => {
		if (electionFromQueryParams) procElection(electionFromQueryParams)
	}, [])

	async function procElection(electionid) {
		try {
			let election = undefined;
			let e = await fetch(`${backendUrl}/election/${electionid}`)

			if (e.ok) election = await e.json();
			setElection(election)

			let start_date = new Date(election.startDate);
			let end_date = new Date(election.endDate);
			let current_date = new Date();


			if (end_date < current_date) {
				toast.warning("This event has been concluded");
				navigate(`election/${election._id}/results`)
			} else if (start_date > current_date) {
				toast.warning("This event has not started")
				return;
			} else setPhoneModalOpen(true);	
		} catch (error) {
			toast.warning("Event not found. Ensure you got the correct id")
		}
	}

	const handleOTPSubmit = async () => {
		let s = await fetch(`${backendUrl}/election/${OTPVal}/verifyOTP`);
		if (s.ok) {
			setOTPOpen(false);
			setOTPVal('');
			addVoterToDB();
		} else {
			toast.warning("That was invalid. Check the number and try again");
			return;
		}
	};

	async function addVoterToDB () {
		try {
			await fetch(`${backendUrl}/election/${election._id}/voter/participant`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({ participant, electionId: election._id }),
			})
			
			navigate(`/election/${election._id}/${participant}`)
		} catch (error) {
			toast.warning('An error occured')
		}
	}

	async function procOTP (participant) {
		try {
			let list = await fetch(`${backendUrl}/election/${election._id}/voterlist`);

			let voterlist = await list.json();
			const votersList = voterlist.map(v => v.participant);
			
			// create a new voter
			if (!(votersList.includes(participant))) {
				// if election is closed, no further processing: user has to be added by the creator
				// of the election
	
				if (election.type == 'Closed') {
					toast.warning('This is a closed event. Ensure your admin has added your number and try again')
					return;
				}
	
				// create an OTP for verification
				const s = await fetch(`${backendUrl}/election/getOTP`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					mode: 'cors',
					body: JSON.stringify({
						participant,
						electionId: election._id
					}),
				})
	
				if (s.ok) {
					closePhoneNoModal()
					setOTPOpen(true) //open otp modal
				}
			} else {
				navigate(`/election/${election._id}/${participant}`)
			}
		} catch (error) {
			toast.error("An error occured")
		}
	}

	async function procParticipant() {
		if (participant) {
			if (election.userAuthType == 'email') {
				let emailAddr = String(participant).trim()
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailAddr.match(emailRegex)) {
					toast.warning("The email address is invalid")
					return;
				}
				setParticipant(emailAddr)
				procOTP(emailAddr)
			}

			else if (election.userAuthType == 'phone') {
				const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
				const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;
	
				let phoneNumber = String(participant).trim();
				
				if (phoneNumber.match(countryCodePattern)) {
					procOTP(phoneNumber)
				} else if(phoneNumber.match(phoneNumberPattern)) {
					phoneNumber = participant.replace(phoneNumberPattern, '234$2');
	
					setParticipant(phoneNumber)
					procOTP(phoneNumber)
				} else {
					toast.warning("A valid phone number is required to continue")
					return;
				}
			}
		} else toast.warning("You must enter a phone number to continue")
	}

	return (
		<>
			{phoneModalOpen && 
				<div className="modal-overlay">
					<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
						<span>{`${election.title}`}</span>
						<h3>{`Enter your ${election.userAuthType == 'email' ? 'email' : 'phone number'} to continue`}</h3>
						<input 
							type="text"
							id="phone-field"
							onChange={ (e) => setParticipant(e.target.value) }
							value={participant}
							placeholder={`Enter your ${election.userAuthType == 'email' ? 'email' : 'phone number'}`}
						/>
						<div className="action-btn-container">
							<button className="Button violet action-item" onClick={procParticipant}>Continue</button>
							<button className="Button red action-item" onClick={ () => setPhoneModalOpen(false)}>Cancel</button>
						</div>
					</div>
				</div>
			}

			{OTPOpen && 
				<div className="modal-overlay">
					<div className="w-5/6 p-4 rounded-lg shadow-md relative bg-white">
						<span>{`${election.title}`}</span>
						<p>{`You should have received a verification at the ${election.userAuthType == 'email' ? 'email' : 'phone number'} you provided`}</p>
						<h3>Enter Confirmation Code</h3>
						<input 
							type="number" 
							id="opt-field"
							onChange={(e) => setOTPVal(e.target.value)}
							value={OTPVal}
							placeholder="confirmation code"
						/>
						<div className="action-btn-container">
							<button className="Button violet action-item" onClick={handleOTPSubmit}>Verify</button>
							<button className="Button red action-item" onClick={ () => setOTPOpen(false)}>Cancel</button>
						</div>
					</div>
				</div>
			}

			<div className="home-container">
				<div className="home-left">
					<h2>With us you no longer need lengthy processes to vote for your stars</h2>
					<h4>Set up an election here and now!</h4>
					<h4>Fans do not need to set up an account</h4>

					<br />
					<br />

					<h2>Choose the type of voting</h2>
					<h3>An open election is open to anyone with an id</h3>
					<h3>A closed election needs you need to be in a list</h3>
				</div>

				<div className="home-right">
					<h3>Got an ID? Paste it in</h3> 
					<input 
						type="text" 
						name="electionid" 
						value={id} 
						onChange={handleChange}
						id="electionIdEntry" 
						autoFocus
					/>
						
					<div className="action-btn-container">
						<button className="Button violet action-item" onClick={() => procElection(id)}>Continue</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default Home
