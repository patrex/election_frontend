import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "@/App";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import isValidPhoneNumber from "@/utils/validatePhone";
import isValidEmail from "@/utils/validateEmail";
import { b64encode, b64decode } from "@/utils/obfuscate";

import Toast from '@/utils/ToastMsg';
import backendUrl from '../utils/backendurl'
import { authman } from "@/utils/fireloader";

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

	const { setVoter } = useContext(AppContext)
	
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
				Toast.warning("This event has been concluded");
				navigate(`election/${election._id}/results`)
			} else if (start_date > current_date) {
				Toast.warning("This event has not started")
				return;
			} else setPhoneModalOpen(true);	
		} catch (error) {
			Toast.warning("Event not found. Ensure you got the correct id")
		}
	}

	const handleOTPSubmit = async () => {
		try {
			let s = await fetch(`${backendUrl}/otp/${OTPVal}/verifyOTP`);
			if (s.ok) {
				setOTPOpen(false);
				setOTPVal('');
				addVoterToDB();
			} else {
				Toast.warning("That was invalid. Check the number and try again");
				return;
			}
		} catch (error) {
			console.log(error)
		}
	};

	async function addVoterToDB () {
		try {
			await fetch(`${backendUrl}/election/${election._id}/addvoter/participant`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ participant, electionId: election._id }),
			})

			setVoter(participant)
			
			navigate(`/election/${election._id}/${b64encode(participant)}`)
		} catch (error) {
			Toast.warning('An error occured')
			console.log(error)
		}
	}

	async function procOTP (participant) {
		try {
			let list = await fetch(`${backendUrl}/election/${election._id}/voterlist`);

			let voterlist = await list.json();
			const votersList = election.userAuthType == 'phone' ? 
				voterlist.map(v => v.phoneNo) : 
				voterlist.map(v => v.email)
			
			// create a new voter
			if (!(votersList.includes(participant))) {
				// if election is closed, no further processing: user has to be added by the creator
				// of the election
				if (election.type === 'Closed') {
					Toast.warning(`This is a closed event. Ensure your admin has added your ${election.userAuthType == 'email' ? 'email' : 'number'} and try again`)
					return;
				}
	
				// create an OTP for verification
				if (election.userAuthType == "phone") {
					sendOtpToPhone(participant)
				} else {
					const response = await fetch(`${backendUrl}/otp/getOTP/email`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							participant,
							electionId: election._id
						}),
					})

					if (response.ok) {
						setPhoneModalOpen(false)
						setOTPOpen(true)	//open otp modal
					}
				}
	
			} else {
				setVoter(participant)
				navigate(`/election/${election._id}/${b64encode(participant)}`)
			}
		} catch (error) {
			Toast.error('Something went wrong')
			console.log(error)
		}
	}

	function procParticipant() {
		if (participant) {
			if (election.userAuthType == 'email') {
				let emailAddr = String(participant).trim()
				if (!isValidEmail(emailAddr)) {
					Toast.warning("The email address is invalid")
					return;
				}
	
				setParticipant(emailAddr)
				procOTP(emailAddr)
			}

			else if (election.userAuthType == 'phone') {	
				let phoneNumber = String(participant).trim();
				
				if (!isValidPhoneNumber(phoneNumber)) {
					Toast.warning("A valid phone number is required to continue")
					return;
				} 
				setParticipant(phoneNumber);
				procOTP(phoneNumber);
			}
		} else Toast.warning(`You must enter ${election.userAuthType == 'email' ? 'an email' : 'a phone number'} to continue`)
	}

	// send OTP

	function sendOtpToPhone(phoneNumber) {
		// Ensure the phone number is in E.164 format (e.g., +14155552671)
		// Set up the reCAPTCHA verifier. Make sure there's an element with id 'recaptcha-container' in your HTML.
		window.recaptchaVerifier = new RecaptchaVerifier(authman, 'recaptcha-container', {
			size: 'invisible', // Use 'normal' if you want the widget visible
			callback: (response) => {
				// reCAPTCHA solved - you can proceed with sign in
				setPhoneModalOpen(false)
				setOTPOpen(true)
			}
		}, authman);

		const appVerifier = window.recaptchaVerifier;

		signInWithPhoneNumber(authman, phoneNumber, appVerifier)
			.then((confirmationResult) => {
			// SMS sent. Save confirmationResult to use later when verifying the OTP.
				window.confirmationResult = confirmationResult;
				console.log('OTP sent to:', phoneNumber);
			})
			.catch((error) => {
				console.error('Error sending OTP:', error);
			});
	}

	// Assuming `confirmationResult` is already set from signInWithPhoneNumber
	function verifyOtpCode() {
		window.confirmationResult.confirm(OTPVal)
			.then((result) => {
				// OTP is correct, user is signed in
				setOTPOpen(false)
				setVoter(participant)
				navigate(`/election/${election._id}/${b64encode(participant)}`)
			})
			.catch((error) => {
				// OTP verification failed
				Toast.warning("Error verifying OTP")
				return;
				console.error('Error verifying OTP:', error);
			});
	}
	
	return (
		<>
			{phoneModalOpen && 
				<div className="modal-overlay dark:bg-gray-800 dark:text-white">
					<div className="w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative bg-white">
						<span>{`${election.title}`}</span>
						<h3>{`Enter your ${election.userAuthType == 'email' ? 'email' : 'phone number'} to continue`}</h3>
						<input 
							type="text"
							id="phone-field"
							onChange={ (e) => setParticipant(e.target.value) }
							value={ participant }
							placeholder={ `${election.userAuthType == 'email' ? 'email' : 'phone number'}` }
						/>
						<div className="action-btn-container">
							<button className="Button violet action-item" onClick={ procParticipant }>Continue</button>
							<button className="Button red action-item" onClick={ () => setPhoneModalOpen(false)}>Cancel</button>
						</div>
					</div>
				</div>
			}

			{OTPOpen && 
				<div className="modal-overlay dark:bg-gray-800 dark:text-white">
					<div className="w-5/6 p-4 md:w-2/5 lg:w-2/5 xl:w-2/5 rounded-lg shadow-md relative bg-white">
						<span>{`${election.title}`}</span>
						<p>{`You should have received a verification at the ${ election.userAuthType == 'email' ? 'email' : 'phone number' } you provided`}</p>
						<h3>Enter Confirmation Code</h3>
						<input 
							type="number" 
							id="otp-field"
							onChange={ (e) => setOTPVal(e.target.value) }
							value={ OTPVal }
							placeholder="confirmation code"
						/>
						<div className="action-btn-container">
							{election.userAuthType == 'phone' && <button className="Button violet action-item" onClick={ verifyOtpCode }>Verify</button>}
							{election.userAuthType == 'email' && <button className="Button violet action-item" onClick={ handleOTPSubmit }>Verify</button>}
							<button className="Button red action-item" onClick={ () => setOTPOpen(false) }>Cancel</button>
						</div>
					</div>
				</div>
			}

			<div className="h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-900 p-4">
				<div className="flex flex-col items-center justify-center flex-grow text-center">
					<h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">Votify</h1>
					<p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
						Participate in open or closed elections securely and fairly.
					</p>
					<input 
						type="text" 
						className="w-5/6 p-4 md:w-2/5 lg:w-2/5 xl:w-2/5 dark:border-gray-600 bg-white text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none mb-4" 
						placeholder="Enter/paste in an election ID..." 
						value={id}
						onChange={ (e) => setId(e.target.value) }
						autoFocus
					/>
					<button onClick={ () => procElection(id) }
						className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
						Continue
					</button>
				</div>
				<div id="recaptcha-container"></div>
			</div>
		</>
	);
}

export default Home
