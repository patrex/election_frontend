import  { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import ElectionDashboardTD from '@/components/ElectionDashboardTD';

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
	const menuRef = useRef(null);
	

	const { user } = useContext(AppContext);

	const [electionsList, setElectionsList] = useState(elections);
	const [sideMenuOpen, setSideMenuOpen] = useState(false);


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

	const toggleSideMenu = () => setSideMenuOpen(!sideMenuOpen);

	const handleToggle = (e, elctionId) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setAnchorPos({ top: rect.bottom, left: rect.right });
		setSideMenuOpen(true);
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setSideMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);


	return (
		<>
			<div className="dashboard-container">
				<div className="dashboard-table-container">

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
							{electionsList.length > 0 ? (
								electionsList.map(election => (
									<tr key={election._id}>
										<td>
											{<Link to={`/user/${params.userId}/election/${election._id}`}>{election.title}</Link>}
										</td>
										<td>{moment(election.startDate).format("ddd, MMM D, YYYY h:mm A")}</td>
										<td>{moment(election.startDate).format("ddd, MMM D, YYYY h:mm A")}</td>
										<td>{election.type}</td>
										<ElectionDashboardTD 
											election = {election}
											navigate = {navigate}
											copyLink = {copyLink}
											removeElection = {removeElection}
											params = {params}
										/>
										
									</tr>
								))
							):(
								<tr>
									<td colSpan={5}>No elections to show</td>
								</tr>
							)}
						</tbody>

					</table>
				</div>
			</div>
		</>
	);
}
 
export default Dashboard;
