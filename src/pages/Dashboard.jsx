import  { useState, useContext } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import ElectionDashboardTD from '@/components/ElectionDashboardTD';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg'
import NoData from '@/components/NoData';

import { fetcher } from '@/utils/fetcher';

export async function dashboardLoader({ params }) {
	try {
		// load elections for this user from database
		return await fetcher.get(`elections/${params.userId}`)	
	} catch (error) {
		console.error('There was an error', error);
		return null;
	}
}


function Dashboard() {
	const params = useParams();
	const data = useLoaderData();
	const [elections, setElections] = useState(data || []);
	const navigate = useNavigate()

	const { user } = useContext(AppContext);

	async function removeElection (election) {
		try {

			await fetcher.auth.delete(
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
			return {}
		}
	};
	      

	function copyLink(link) {
		let text = '';
		text = navigator.clipboard.writeText(link);

		if (text) Toast.success("copied")
	}

	return (
		<div >
			<div>
				<div className="dashboard-table-container">
					{elections.length ? (
						<main className="table">
							<section className='table-header'>Your events</section>
							<section className='table-body'>
								<table>
									<thead>
										<tr>
											<th>#</th>
											<th>Election</th>
											<th>Start Date</th>
											<th>End Date</th>
											<th>Election Type</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{
											elections.map((election, index) => (
												<tr
													key={election._id}
												>
													<td>
														{index + 1}
													</td>
													<td>
														<Link
															to={`/user/${params.userId}/election/${election._id}`}
															
														>
															{election.title}
														</Link>
													</td>

													<td >
														{moment(election.startDate).format("ddd, MMM D, YYYY h:mm A")}
													</td>
													<td >
														{moment(election.endDate).format("ddd, MMM D, YYYY h:mm A")}
													</td>
													<td>
														<span className="status">
															{election.type}
														</span>
													</td>

													<ElectionDashboardTD
														election={election}
														navigate={navigate}
														copyLink={copyLink}
														removeElection={removeElection}
														params={params}
													/>
												</tr>
											))
										}

									</tbody>
								</table>
							</section>
						</main>
						
					) : (
						<NoData
							image={noDataGraphic}
							message={<>You've not created any elections. <Link to={`/user/${user.uid}/create-election`} className="text-indigo-600 hover:text-indigo-800 font-medium">Create one</Link> to continue</>}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
 
export default Dashboard;
