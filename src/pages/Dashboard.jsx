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
		}
	};
	      

	function copyLink(link) {
		let text = '';
		text = navigator.clipboard.writeText(link);

		if (text) Toast.success("copied")
	}

	return (
		<div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-[50vh]">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-indigo-500 pb-3">
					Your Elections Dashboard
				</h2>

				<div className="dashboard-table-container overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
					{elections.length ? (
						<table id='dashboard-table' className="min-w-full divide-y divide-gray-200">
							<thead>
								<tr className="bg-gray-100">
									<th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
										Name
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hidden sm:table-cell">
										Start Date
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hidden md:table-cell">
										End Date
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
										Type
									</th>
									<th scope="col" className="px-6 py-3">
										<span className="sr-only">Actions</span>
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-gray-200">
								{
									elections.map((election, index) => (
										<tr
											key={election._id}
											className={`
                                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                                        hover:bg-indigo-50 transition-colors
                                    `} // Alternating Row Colors + Hover Effect
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												<Link
													to={`/user/${params.userId}/election/${election._id}`}
													className="text-indigo-600 hover:text-indigo-800 font-semibold"
												>
													{election.title}
												</Link>
											</td>

											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
												{moment(election.startDate).format("ddd, MMM D, YYYY h:mm A")}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
												{moment(election.endDate).format("ddd, MMM D, YYYY h:mm A")}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
												<span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-800">
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
