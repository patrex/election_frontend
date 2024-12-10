import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import backendUrl from '../utils/backendurl'

export async function electionDetailLoader({params}) {
	let election, positions = undefined;

	try {
		const res1 = await fetch(`${backendUrl}/election/${params.id}`)
		const res2 = await fetch(`${backendUrl}/election/${params.id}/positions`)

		election = await res1.json()
		positions = await res2.json()

	} catch (error) {
		console.log(error);
	}

	return [election, positions]
}

function ElectionDetail() {
	const [election, positions] = useLoaderData();
	const [positionsList, setPositionsList] = useState(positions);

	function editPosition(position) {
		
	}

	function removePosition(position) {
		Swal.fire({
			title: `Delete <strong>${position.position}</strong> from <strong>${election.title}?</strong>`,
			text: 'This will also remove every candidate under this position',
			icon: 'warning',
			showDenyButton: true,
			confirmButtonText: "Delete",
			denyButtonText: `Cancel`
		}).then(async (result) => {
			let i = undefined;
			if (result.isConfirmed) {
				const res = await fetch(`${backendUrl}/election/${election._id}/${position._id}/delete`, {
					method: 'delete',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
						'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS'},
					mode: 'cors',
				})

				if(res.ok) {
					setPositionsList(positionsList.filter(p => p._id != position._id))
					toast.success("The position was removed")	
				} else toast.warning('could not remove the position: ')
			}
		});	
	}
	

	return ( 
		<div className="detail-container">
			<table className="table table-hover table-striped">
				<thead>
					<tr>
						<th>Election</th>
						<th>{election.title}</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope='row'>Created On</th>
						<td>{moment(election.dateCreated).format('LLL')}</td>
					</tr>
					<tr>
						<th scope='row'>Starting On</th>
						<td>{moment(election.startDate).format('LLL')}</td>
					</tr>
					<tr>
						<th scope='row'>Ending On</th>
						<td>{moment(election.endDate).format('LLL')}</td>
					</tr>
				</tbody>
			</table>

			<div className="pos-list-container">
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<th scope='col'>Positions</th>
							<th scope="col">Actions</th>
						</tr>
					</thead>
					<tbody>
						{
							positionsList.map(position => (
								<tr className="position-row" key={position._id}>
									<td>
										<Link to={`./position/${position.position}`}>{position.position}</Link>
									</td>

									<td>
										<button className='Button red' 
											onClick={() => removePosition(position)}>
												<i className="bi bi-trash3 m-1"></i></button>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>

		</div>
	 );
}

export default ElectionDetail;
