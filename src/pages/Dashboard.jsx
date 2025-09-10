import  { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import ElectionDashboardTD from '@/components/ElectionDashboardTD';

import { queryClient } from '../queryClient.js'
import { useQuery } from "@tanstack/react-query";

async function fetchElections(userId) {
	const res = await fetch(`${backendUrl}/elections/${userId}`, {
		headers: {
			'Content-Type': 'application/json'
		}
	})

	if (!res.ok) throw new Error("Network error");
	const elections = await res.json()
  	return elections;
}

export async function dashboardLoader({ params }) {
	const queryKey = ['elections', params.userId]
	return (
		queryClient.getQueryData(queryKey) ??
		(await queryClient.fetchQuery({
		  queryKey,
		  queryFn: () => fetchElections(params.userId),
		}))
	);
}


function Dashboard() {
	const params = useParams();
	const elections = useLoaderData();
	const navigate = useNavigate()
	const menuRef = useRef(null);

	const { data } = useQuery({
		queryKey: ["elections", params.userId],
		queryFn: () => fetchElections(params.userId),
		elections,
	});
	

	const { user } = useContext(AppContext);

	// const [electionsList, setElectionsList] = useState(elections);
	const [sideMenuOpen, setSideMenuOpen] = useState(false);

	const removeElection = async (election) => {
		const result = await Swal.fire({
			title: `Delete ${election.title}?`,
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`,
		});

		if (!result.isConfirmed) return;

		try {
			const token = await user?.getIdToken();

			const res = await fetch(`${backendUrl}/election/${election._id}/delete`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				Toast.error("Could not complete the request");
				return;
			}

			queryClient.setQueryData(["elections", params.userId], (old) =>
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
							{data.length ? (
								data.map(election => (
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
							) : (
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
