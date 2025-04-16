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
			<div className="dashboard-container">
  {electionsList.length > 0 ? (
    <div className="d-flex flex-column gap-3">
      {electionsList.map(election => (
        <div key={election._id} className="p-3 border rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <h5>
                <Link to={`/user/${params.userId}/election/${election._id}`}>
                  {election.title}
                </Link>
              </h5>
              <p className="mb-1"><strong>Start:</strong> {moment(election.startDate).format('MMM Do YY')}</p>
              <p className="mb-1"><strong>End:</strong> {moment(election.endDate).format('MMM Do YY')}</p>
              <p className="mb-2"><strong>Type:</strong> {election.type}</p>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                className="Button violet action-item"
                onClick={() => copyLink(election._id)}
              >
                Copy ID
              </button>
              <button
                className="Button violet action-item"
                onClick={() => copyLink(election.shareLink)}
              >
                Copy Link
              </button>
              <Link to={`/user/${params.userId}/election/${election._id}/update`}>
                <button
                  className="Button violet action-item"
                  disabled={new Date(election.startDate) < Date.now()}
                >
                  Edit
                </button>
              </Link>
              <button
                className="Button red action-item"
                onClick={() => removeElection(election)}
              >
                <i className="bi bi-trash3 m-1"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center">No elections to show</p>
  )}
</div>


		</>
	);
}
 
export default Dashboard;
