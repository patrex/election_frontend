import  { useState, useContext } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';

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
			<div className='dashboard-container table-responsive'>
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<th scope="col">Election</th>
							<th scope="col">Starting</th>
							<th scope="col">Ending</th>
							<th scope="col">Type</th>
							
							<th scope="col"></th>
						</tr>
					</thead>

					<tbody className='table-group-divider'>
						{electionsList.length > 0 ? electionsList.map(election => (
							<tr key={election._id}>
								
								<td><Link to={`/user/${params.userId}/election/${election._id}`}>{election.title}</Link></td>
								<td>{moment(election.startDate).format('MMM[-]Do[-]YY')}</td>
								<td>{moment(election.endDate).format('MMM[-]Do[-]YY')}</td>
								<td>{election.type}</td>
								
								<div className="list-btn-items">
									<td><button className="Button violet action-item" onClick={() => copyLink(election._id)}>Copy ID</button></td>
									<td><button className="Button violet action-item" onClick={() => copyLink(election.shareLink)}>Copy Link</button></td>
									<td><Link to={`/user/${params.userId}/election/${election._id}/update`}>
										<button className='Button violet action-item' disabled={new Date(election.startDate) < Date.now()}>Edit</button>
									</Link></td>
									<td><button className='Button red action-item' onClick={() => removeElection(election)}><i className="bi bi-trash3 m-1"></i></button></td>
								</div>
							</tr>
						)) : <p>No elections to show</p>}
					</tbody>
				</table>
			</div>
		</>
	);
}
 
export default Dashboard;
