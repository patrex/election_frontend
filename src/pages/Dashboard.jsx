import  { useState, useContext } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import ElectionDashboardTD from '@/components/ElectionDashboardTD';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg'
import NoData from '@/components/NoData';

// import { queryClient } from '../queryClient.js'
// import { useQuery } from "@tanstack/react-query";
import { fetcher } from '@/utils/fetcher';

export async function dashboardLoader({ params }) {
	try {
		// load elections for this user from database
		return fetcher.get(`elections/${params.userId}`)	
	} catch (error) {
		console.error('There was an error', error);
	}
}


function Dashboard() {
	const params = useParams();
	const data = useLoaderData();
	const [elections, setElections] = useState(data || []);
	const navigate = useNavigate()

	const { user } = useContext(AppContext);

	// const [electionsList, setElectionsList] = useState(elections);

	async function removeElection (election) {
		try {

			fetcher.auth.delete(
				`election/${election._id}/delete`, 
				user
			)


			setElections( (old) =>
				old ? old.filter((e) => e._id !== election._id) : []
			);

			Toast.success("The election was deleted successfully");
		} catch (error) {
			Toast.error("An error occurred while deleting");
			console.error("Delete error for election:", election._id, error);
		}
	};
	      

	function copyLink(link) {
		let text = '';
		text = navigator.clipboard.writeText(link);

		if (text) Toast.success("copied")
	}

	return (
		<div className="dashboard-container">
			<div className="dashboard-table-container">
				{elections.length ? (
					<table id='dashboard-table'>
						<thead>
							<tr>
								<th>Name</th>
								<th>Start date</th>
								<th>End date</th>
								<th>Election type</th>
								<th></th>
							</tr>
						</thead>

						<tbody>
							{
								elections.map(election => (
									<tr key={election._id}>
										<td>
											<Link to={`/user/${params.userId}/election/${election._id}`}>{election.title}</Link>
										</td>

										<td>{moment(election.startDate).format("ddd, MMM D, YYYY h:mm A")}</td>
										<td>{moment(election.endDate).format("ddd, MMM D, YYYY h:mm A")}</td>
										<td>{election.type}</td>

										<ElectionDashboardTD 
											election = { election }
											navigate = { navigate }
											copyLink = { copyLink }
											removeElection = { removeElection }
											params = { params }
										/>
										
									</tr>
								))
							}
						</tbody>
					</table>
				): (
					<NoData 
						image={noDataGraphic}
						message={<>You've not created any elections. <Link to={`/user/${user.uid}/create-election`}>Create one</Link> to continue</>}
					/>
				)}
			</div>
		</div>
	);
}
 
export default Dashboard;
