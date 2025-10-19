import { useState, useRef, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

function ElectionDashboardTD({ election, navigate, copyLink, removeElection, params }) {
	const [sideMenuOpen, setSideMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setSideMenuOpen(false);
			}
			if (e.target.closest(".AlertDialogContent")) return;
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
						<li className="side-list-item" onClick={() => copyLink(election.shareLink)}>
							<i className="bi bi-link-45deg side-menu-icon"></i> Copy link
						</li>
						<li
							className="side-list-item"
							onClick={() => {
								navigate(`/user/${params.userId}/election/${election._id}/update`)
								setSideMenuOpen(false)
							}}
						>
							<i className="bi bi-pencil-fill side-menu-icon"></i> Edit
						</li>

						<AlertDialog.Root>
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
									<button  className="Button mauve">Cancel</button>
								</AlertDialog.Cancel>
								<AlertDialog.Action asChild>
									<button className="Button red" onClick={ () => removeElection(election) }>Delete</button>
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
