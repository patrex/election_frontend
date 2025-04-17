import  { useState, useContext } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit'

export async function dashboardLoader({ params }) {
	const res = await fetch(`${backendUrl}/elections/${params.userId}`, {
		headers: {
			'Content-Type': 'application/json'
		}
	})
	
	const elections = await res.json()
	return elections;
}


function Dashboard() {
	const params = useParams();
	const elections = useLoaderData();
	const navigate = useNavigate()
	

	const { user } = useContext(AppContext);

	const [electionsList, setElectionsList] = useState(elections);

	const removeElection = async (election) => {
		Swal.fire({
			title: `Delete ${election.title}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const res = await fetch(`${backendUrl}/election/${election._id}/delete`, {
						method: 'delete',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${await user?.getIdToken()}`
						},
					})

					if (!res.ok) {
						Toast.warning("Could not complete the request")
						return;
					}

					setElectionsList(electionsList.filter( e => e._id != election._id ));
					Toast.success('The event was removed successfully')
				} catch (error) {
					Toast.error("An error occured")
					console.error(error);
				}
			}
		});
	}

	function copyLink(link) {
		let text = '';
		text = navigator.clipboard.writeText(link);

		if (text) Toast.success("copied")
	}


	return (
		<>
			<div className="dashboard-container">
				<div className="dashboard-table-container">

					<table>
						<tr>
							<th>Name</th>
							<th>Start date</th>
							<th>End date</th>
							<th>Election type</th>
							<th></th>
						</tr>

						{electionsList.length > 0 ? (
							electionsList.map(election => (
								<tr key={election._id}>
									<td data-cell="Name">{election.title}</td>
									<td data-cell="Start date">{moment(election.startDate).format('dddd, MMMM Do YYYY, h:mm:ss a')}</td>
									<td data-cell="End date">{moment(election.startDate).format('dddd, MMMM Do YYYY, h:mm:ss a')}</td>
									<td data-cell="Election type">{election.type}</td>
									<td data-cell="">
										<>
											<ButtonGroup variant="contained" aria-label="Basic button group">
												<Button>ID</Button>
												<Button>URL</Button>
												<Button><EditIcon /></Button>
												<Button><DeleteIcon /></Button>
											</ButtonGroup>
										</>
									</td>
								</tr>
							))
						):(
							<tr>
								<td>No elections to show</td>
							</tr>
						)}
					</table>
				</div>
			</div>
			<div class="flex items-center justify-center min-h-screen bg-gray-100">
				<div className="
					bg-white shadow-lg rounded-2xl 
					p-6 sm:p-8 md:p-10 lg:p-14 xl:p-16 
					w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2
					text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl
					transition-all duration-300 ease-in-out"
				>
					{electionsList.length > 0 ? (
						<div className="d-flex flex-column gap-3">
							{electionsList.map(election => (
								<div key={election._id} className="p-3 border rounded shadow-sm">
									<div className="d-flex justify-content-between align-items-start flex-wrap">
										<div>
											<h5>
												<Link to={`/user/${params.userId}/election/${election._id}`}>
													{election.title}
												</Link>
											</h5>
											<p className="mb-1"><strong>Start:</strong> {moment(election.startDate).format('dddd, MMMM Do YYYY, h:mm:ss a')}</p>
											<p className="mb-1"><strong>End:</strong> {moment(election.endDate).format('dddd, MMMM Do YYYY, h:mm:ss a')}</p>
											<p className="mb-2"><strong>Type:</strong> {election.type}</p>
										</div>

										<div className="d-flex flex-wrap gap-2 mt-2">
											<button
												className="Button violet action-item"
												onClick={() => copyLink(election._id)}
											>
												Copy ID
											</button>
											<button
												className="Button violet action-item"
												onClick={() => copyLink(election.shareLink)}
											>
												Copy Link
											</button>
											<Link to={`/user/${params.userId}/election/${election._id}/update`}>
												<button
													className="Button violet action-item"
													disabled={new Date(election.startDate) < Date.now()}
												>
													Edit
												</button>
											</Link>
											<IconButton color="error" onClick={ () => removeElection(election) }>
												<DeleteIcon />
											</IconButton>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-center">No elections to show</p>
					)}
				</div>
			</div>
		</>
	);
}
 
export default Dashboard;
