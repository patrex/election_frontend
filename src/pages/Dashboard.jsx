import { useState, useContext, useMemo } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

export async function dashboardLoader({ params }) {
	const res = await fetch(`${backendUrl}/elections/${params.userId}`, {
		headers: {
			'Content-Type': 'application/json'
		}
	})

	const elections = await res.json();
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

					setElectionsList(electionsList.filter(e => e._id !== election._id));
					Toast.success('The event was removed successfully')
				} catch (error) {
					Toast.error("An error occurred")
					console.error(error);
				}
			}
		});
	}

	function copyLink(link) {
		navigator.clipboard.writeText(link).then(() => {
			Toast.success("Copied")
		});
	}

	const columns = useMemo(() => [
		{
			header: 'Election',
			accessorKey: 'title',
			cell: ({ row }) => (
				<Link to={`/user/${params.userId}/election/${row.original._id}`}>
					{row.original.title}
				</Link>
			),
		},
		{
			header: 'Starting',
			accessorKey: 'startDate',
			cell: ({ getValue }) => moment(getValue()).format('MMM[-]Do[-]YY'),
		},
		{
			header: 'Ending',
			accessorKey: 'endDate',
			cell: ({ getValue }) => moment(getValue()).format('MMM[-]Do[-]YY'),
		},
		{
			header: 'Type',
			accessorKey: 'type',
		},
		{
			header: '',
			id: 'actions',
			cell: ({ row }) => {
				const election = row.original;
				return (
					<div className="flex flex-wrap gap-2">
						<button className="Button violet action-item" onClick={() => copyLink(election._id)}>Copy ID</button>
						<button className="Button violet action-item" onClick={() => copyLink(election.shareLink)}>Copy Link</button>
						<Link to={`/user/${params.userId}/election/${election._id}/update`}>
							<button className='Button violet action-item' disabled={new Date(election.startDate) < Date.now()}>Edit</button>
						</Link>
						<button className='Button red action-item' onClick={() => removeElection(election)}><i className="bi bi-trash3 m-1"></i></button>
					</div>
				);
			},
		},
	], [copyLink, removeElection, params.userId]);

	const table = useReactTable({
		data: electionsList,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className='dashboard-container overflow-x-auto mt-4'>
			{electionsList.length === 0 ? (
				<p>No elections to show</p>
			) : (
				<table className="table-auto w-full text-left border-collapse">
					<thead>
						{table.getHeaderGroups().map(headerGroup => (
							<tr key={headerGroup.id} className="bg-gray-100">
								{headerGroup.headers.map(header => (
									<th key={header.id} className="p-3 border-b font-medium">
										{flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y">
						{table.getRowModel().rows.map(row => (
							<tr key={row.id} className="hover:bg-gray-50">
								{row.getVisibleCells().map(cell => (
									<td key={cell.id} className="p-3">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default Dashboard;
