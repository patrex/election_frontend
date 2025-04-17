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
									<td data-cell="Name">{<Link to={`/user/${params.userId}/election/${election._id}`}>
													{election.title}
												</Link>}</td>
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
		</>
	);
}
 
export default Dashboard;
