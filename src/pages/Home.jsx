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
	const [phoneNo, setPhoneNo] = useState('');
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

			let start_date = new Date(election.startDate);
			let end_date = new Date(election.endDate);
			let current_date = new Date();

			setElection(election)

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

	function handleOTPChange(e) {
		setOTPVal(e.target.value)
	}

	const closeOTPModal = () => {
		setOTPOpen(false)
	}

	const handleOTPSubmit = async () => {
		let s = await fetch(`${backendUrl}/election/${OTPVal}/verifyOTP`);
		if (s.ok) {
			closeOTPModal();
			setOTPVal('');
			addVoterToDB();
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

	async function addVoterToDB () {
		try {
			await fetch(`${backendUrl}/election/${election._id}/voter/phone`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({ phoneNumber: phoneNo, electionId: election._id }),
			})
			
			navigate(`/election/${election._id}/${phoneNo}`)
		} catch (error) {
			toast.warning('An error occured')
		}
	}

	async function procOTP (phoneNumber) {
		try {
			let list = await fetch(`${backendUrl}/election/${election._id}/voterlist`);

			let voterlist = await list.json();
			const votersList = voterlist.map(v => v.phoneNo);
			
			// create a new voter
			if (!(votersList.includes(phoneNumber))) {
				// if election is closed, no further processing: user has to be added by the creator
				// of the election
	
				if (election.type == 'closed') {
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
						phoneNumber
					}),
				})
	
				if (s.ok) {
					closePhoneNoModal()
					setOTPOpen(true) //open otp modal
				}
			} else {
				navigate(`/election/${election._id}/${phoneNo}`)
			}
		} catch (error) {
			toast.error("An error occured")
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

	return (
		<>
			{phoneModalOpen && 
				<div className="modal-overlay">
					<div className="w-full sm:w-1/2 max-w-full sm:max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
						<span>{`${election.title}`}</span>
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
						<span>{`${election.title}`}</span>
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
						
					<br />
					<button className="Button violet" onClick={() => procElection(id)}>Continue</button>
				</div>
			</div>
		</>
	);
}

export default Home
