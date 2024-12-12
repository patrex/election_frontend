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

	const [positionModalOpen, setPositionModalOpen] = useState(false);
	const [newPosition, setNewPosition] = useState("");

	const [elec, setElection] = useState(election);


	function handlePositionChange(e) {
		setNewPosition(e.target.value);
	}

	const openPostionModal = () => {
		setPositionModalOpen(true);
		setElection(elec)
	}

	const closePositionModal = () => {
		setPositionModalOpen(false);
	}

	const handleAddPosition = () => {
		if (newPosition) {
			closePositionModal();
			
			fetch(`${backendUrl}/election/${election._id}/position`, {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({
					position: newPosition,
					electionId: election._id
				}),
			})
			.then((response) => response.json())
			.then((data) => {
				toast.success('position was added')
				setPositionsList((prev) => [...prev, data])
			})
			.catch((error) => {
				toast.warning('could not add the position')
			});
		} else toast.warning("you need to enter a new position to continue")
	}

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
				} else toast.warning('Could not remove the position: ')
			}
		});	
	}
	

	return ( 
		<div className="pos-detail-container">
			<div className="pos-heading-banner">

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
						<tr>
							<th></th>
							<td><button className='Button violet' onClick={() => openPostionModal(election)}>Add Position</button></td>
						</tr>
					</tbody>
				</table>
			</div>

			{positionModalOpen && (
					<div className="modal-overlay">
						<div className="w-1/2 max-w-1/2vw p-4 rounded-lg shadow-md relative bg-white">
							<span>Enter a new position for <strong>{`${election.title}`}</strong></span>
							<br />
							<input 
								type='text'
								placeholder="Enter new position"
								id='newposition' 
								value={newPosition}
								onChange={handlePositionChange}
								className='w-95 p-2 border border-goldenrod rounded-md text-base my-2'
							/>
							<div className="my-2">
								<button className='Button violet' onClick={handleAddPosition}>Add Position</button>
								<button className='Button red my-0 mx-3 w-20' onClick={closePositionModal}>Cancel</button>
							</div>
						</div>
					</div>
			)}

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
