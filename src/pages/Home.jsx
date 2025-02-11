import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "@/App";

import Toast from '@/utils/ToastMsg';
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
			let s = await fetch(`${backendUrl}/election/${OTPVal}/verifyOTP`);
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
				mode: 'cors',
				body: JSON.stringify({ participant, electionId: election._id }),
			})

			setVoter(participant)
			
			navigate(`/election/${election._id}/${participant}`)
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
				if (election.type == 'Closed') {
					Toast.warning(`This is a closed event. Ensure your admin has added your ${election.userAuthType == 'email' ? 'email' : 'number'} and try again`)
					return;
				}
	
				// create an OTP for verification
				const response = election.userAuthType == "phone" ? await fetch(`${backendUrl}/election/getOTP`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						participant,
						electionId: election._id
					}),
				}) : await fetch(`${backendUrl}/election/getOTP/email`, {
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
			} else {
				setVoter(participant)
				navigate(`/election/${election._id}/${participant}`)
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
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailAddr.match(emailRegex)) {
					Toast.warning("The email address is invalid")
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
					const phone = phoneNumber.replace(phoneNumberPattern, '234$2');
	
					setParticipant(phone)
					procOTP(phone)
				} else {
					Toast.warning("A valid phone number is required to continue")
					return;
				}
			}
		} else Toast.warning("You must enter a phone number to continue")
	}

	return (
		<>
			
		</>
	);
}

export default Home
