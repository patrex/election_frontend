import { useState, useRef, useEffect } from 'react';
import { useEventStatus } from '@/hooks/useEventStatus';

function ElectionDashboardTD({ election, navigate, copyLink, removeElection, params }) {
	const [sideMenuOpen, setSideMenuOpen] = useState(false);
	const [alertOpen, setAlertOpen] = useState(false);
	const menuRef = useRef(null);
	const { isPending } = useEventStatus(new Date(election.startDate), new Date(election.endDate))

	useEffect(() => {
		const handleClickOutside = (e) => {
			// Don't close menu if alert dialog is open or if clicking on alert dialog elements
			if (alertOpen) return;
			
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setSideMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [alertOpen]);

	return (
		<>
			<td>
				<div className="side-menu" onClick={() => setSideMenuOpen((o) => !o)}>
					<i className="bi bi-three-dots-vertical side-menu-menu-icon"></i>
				</div>

				{sideMenuOpen && (
					<div className="side-menu-div">
						<ul className="side-menu-list" ref={menuRef}>
							<li className="side-list-item" onClick={() => {copyLink(election._id); setSideMenuOpen(false)}}>
								<i className="bi bi-cursor-fill side-menu-icon"></i> Copy Id
							</li>
							<li className="side-list-item" onClick={() => {copyLink(election.shareLink); setSideMenuOpen(false)}}>
								<i className="bi bi-link-45deg side-menu-icon"></i> Copy link
							</li>
							{ isPending && (
								<li
									className="side-list-item"
									onClick={() => {
										navigate(`/user/${params.userId}/election/${election._id}/update`)
										setSideMenuOpen(false)
									}}
								>
									<i className="bi bi-pencil-fill side-menu-icon"></i> Edit
								</li>
							)}
							<li
								className="side-list-item"
								style={{ color: "red" }}
							>
								<button onClick={() => {
									setSideMenuOpen(false)
									setAlertOpen(true);
								}}><i className="bi bi-trash3-fill side-menu-icon"></i>Delete</button>
							</li>

						</ul>
					</div>
				)}
			</td>

			{alertOpen && (
				<div className="modal-overlay">
					<div className="w-11/12 sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 p-4 rounded-lg shadow-md relative bg-white z-100">
						<h3>Delete Election</h3>
						<div className='p-4'>
							<p>Are you sure you want to delete the election</p>
							<p><i className='text-red text-bold'>{election.title}</i></p>
						</div>
						<div className="action-btn-container">
							<button className='Button violet action-item' onClick={() => setAlertOpen(false)}>Cancel</button>
							<button className='Button red action-item' onClick={() => removeElection(election)}>Delete</button>
						</div>
					</div>
				</div>
			)}
		</>

	);
}

export default ElectionDashboardTD;