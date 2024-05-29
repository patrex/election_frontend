import  { useState } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import { toast } from 'sonner'
import backendUrl from '../utils/backendurl'

export async function dashboardLoader({params}) {
	const res = await fetch(`${backendUrl}/elections/${params.userId}`)
	const elections = await res.json()

	return elections;
}


function Dashboard() {
	const params = useParams();
	const elections = useLoaderData();

	const [electionsList, setElectionsList] = useState(elections);
	const [modalOpen, setModalOpen] = useState(false);
	const [phoneNos, setPhoneNos] = useState('')
	const [election, setElection] = useState({});

	const [positionModalOpen, setPositionModalOpen] = useState(false);
	const [newPosition, setNewPosition] = useState("");

	const removeElection = async (election) => {
		Swal.fire({
			title: `Delete ${election.title}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/delete`, {
					method: 'delete',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
						'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'
					},
					mode: 'cors',
				})
	
				if(res.ok) {
					setElectionsList(electionsList.filter(e => e._id != election._id ));
					toast.success('The event was removed successfully')
				}
			}
		});
	}

	function handleChange(e) {
		setPhoneNos(e.target.value)
	}

	function handlePositionChange(e) {
		setNewPosition(e.target.value);
	}

	function addPhoneNosToDB (voterlist) {
		fetch(`${backendUrl}/election/${election._id}/addvoters`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			mode: 'cors',
			body: JSON.stringify({
				election: election._id,
				voterList: voterlist
			}),
		}).then(r => {
			toast.success('Your list of voters was added')
			setPhoneNos('');
		}).catch(err => toast.warning(err))	
	}

	function procPhoneNos () {
		if (!phoneNos) {
			toast.warning("you need to enter at least one phone number");
			return;
		}
		
		const countryCodePattern = /^(?:\+?234|0)?(7\d{8})$/;
		const phoneNumberPattern = /^(0|\+?234)(\d{10})$/;

		let invalid = false;
		const voterList = phoneNos.split(',')
			.map(phoneno => {
				const phoneNumber = phoneno.trim();

				if (phoneNumber.match(countryCodePattern)) return phoneNumber;
				if (phoneNumber.match(phoneNumberPattern)) return phoneNumber.replace(phoneNumberPattern, '234$2');

				invalid = true;

				return phoneNumber;
			});
		
		if (invalid) toast.warning("One or more phone numbers not properly formatted")
		
		closeModal()
		addPhoneNosToDB(voterList)
	}

	const openModal = (election) => {
		setElection(election);
		setModalOpen(true);
	}

	const closeModal = () => {
		setModalOpen(false);
	}
	const openPostionModal = (election) => {
		setPositionModalOpen(true);
		setElection(election)
	}

	const closePositionModal = () => {
		setPositionModalOpen(false);
	}

	const handleAddPosition = () => {
		if (newPosition) {
			closePositionModal();
			
			fetch(`${backendUrl}/election/${election._id}/position`, {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({
					position: newPosition,
					electionId: election._id
				}),
			})
			.then((response) => response.json())
			.then((data) => {
				toast.success('position was added')
			})
			.catch((error) => {
				toast.warning('could not add the position')
			});
		} else toast.warning("you need to enter a new position to continue")
	}

	function copyLink(link) {
		let text = '';
		text = navigator.clipboard.writeText(link);

		if (text) toast.success("copied")
	}



	return (
		<>
			<div className='dashboard-container table-responsive'>
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<th scope="col">Election</th>
							
							<th scope="col">Starting</th>
							<th scope="col">Ending</th>
							<th scope="col">Type</th>
							<th scope="col"></th>
							<th scope="col"></th>
							<th scope="col"></th>
							<th scope='col'></th>
							<th scope='col'></th>
						</tr>
					</thead>

					<tbody className='table-group-divider'>
						{electionsList && electionsList.map(election => (
							<tr key={election._id}>
								<td><Link to={`/user/${params.userId}/election/${election._id}`}>{election.title}</Link></td>
							
								<td>{moment(election.startDate).format('LLL')}</td>
								<td>{moment(election.endDate).format('LLL')}</td>
								<td>{election.type}</td>
								<td><button className='Button violet' onClick={() => openPostionModal(election)}>Add Position</button></td>
								<td><Link to={`/user/${params.userId}/election/${election._id}/addcandidate`}><button className='Button violet'>Add Candidate</button></Link></td>
								<td>{election.type === 'closed' && (<button className='Button violet' onClick={() => openModal(election)}>Add Voters</button>) }</td>
								<td><button className="Button violet" onClick={() => copyLink(election._id)}><i className="bi bi-clipboard"></i></button></td>
								<td><button className="Button violet" onClick={() => copyLink(election.shareLink)}><i className="bi bi-link-45deg"></i></button></td>
								<td><button className='Button red' onClick={() => removeElection(election)}><i className="bi bi-trash3 m-1"></i></button></td>
							</tr>
						)) || <p>No elections to show</p>}
					</tbody>
				</table>

				{positionModalOpen && (
					<div className="modal-overlay">
						<div className="w-1/2 max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter a new position for <strong>{`${election.title}`}</strong></span>
							<br />
							<input 
								type='text'
								placeholder="Enter new position"
								id='newposition' 
								value={newPosition}
								onChange={handlePositionChange}
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="my-2">
								<button className='Button violet' onClick={handleAddPosition}>Add Position</button>
								<button className='Button red my-0 mx-3 w-20' onClick={closePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}

				{modalOpen && ( 
					<div className="modal-overlay">
						<div className="w-full sm:w-1/2 max-w-full sm:max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter list of participants for <strong>{`${election.title}`}</strong></span>
							<br />
							<textarea 
								placeholder="Enter/paste phone numbers. Seperate with commas"
								id='phonenos' 
								rows={5} 
								cols={30}
								value={phoneNos}
								onChange={handleChange}
								className='block resize-none p-2.5 my-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-transparent focus:outline-none'
							/>
							<div className="my-2">
								<button className='Button violet' onClick={procPhoneNos}>Add Numbers</button>
								<button className='Button red my-0 mx-3 w-20' onClick={closeModal}>Cancel</button>
							</div>
						</div>
					</div>
				)}
			</div>
		
		</>
	);
}
 
export default Dashboard;
