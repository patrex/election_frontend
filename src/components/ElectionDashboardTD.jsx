import { useState, useRef, useEffect } from 'react';
import { useEventStatus } from '@/hooks/useEventStatus';
import * as AlertDialog from '@radix-ui/react-alert-dialog';


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

						<AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
							<AlertDialog.Trigger asChild>
								<li
									className="side-list-item"
									style={{ color: "red" }}
								>
									<button><i className="bi bi-trash3-fill side-menu-icon"></i> Delete</button>
								</li>
							</AlertDialog.Trigger>
							<AlertDialog.Portal>
								<AlertDialog.Overlay className="AlertDialogOverlay" />
								<AlertDialog.Content className="AlertDialogContent">
									<AlertDialog.Title className="AlertDialogTitle">Delete Election</AlertDialog.Title>
									<AlertDialog.Description className="AlertDialogDescription">
										{`Delete election: ${ election.title }?`}
									</AlertDialog.Description>
									<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
										<AlertDialog.Cancel asChild>
											<button className="Button mauve" onClick={() => setAlertOpen(false)}>Cancel</button>
										</AlertDialog.Cancel>
										<AlertDialog.Action asChild>
											<button className="Button red" onClick={() => {
												setSideMenuOpen(false);
												removeElection(election);
												setAlertOpen(false);
											}}>Delete</button>
										</AlertDialog.Action>
									</div>
								</AlertDialog.Content>
							</AlertDialog.Portal>
  						</AlertDialog.Root>
					</ul>
				</div>
			)}
		</td>
	);
}

export default ElectionDashboardTD;