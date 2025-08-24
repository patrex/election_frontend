function ElectionRow({ election, navigate, copyLink, removeElection, params }) {
	const [sideMenuOpen, setSideMenuOpen] = useState(false);
	const menuRef = useRef(null);

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
		<td>
			<div className="side-menu" onClick={() => setSideMenuOpen((o) => !o)}>
				<i className="bi bi-three-dots-vertical side-menu-menu-icon"></i>
			</div>

			{sideMenuOpen && (
				<div className="side-menu-div">
					<ul className="side-menu-list" ref={menuRef}>
						<li className="side-list-item" onClick={() => copyLink(election._id)}>
							<i className="bi bi-cursor-fill side-menu-icon"></i> Copy Id
						</li>
						<li className="side-list-item" onClick={() => copyLink(election.shareLink)}>
							<i className="bi bi-link-45deg side-menu-icon"></i> Copy link
						</li>
						<li
							className="side-list-item"
							onClick={() =>
								navigate(`/user/${params.userId}/election/${election._id}/update`)
							}
						>
							<i className="bi bi-pencil-fill side-menu-icon"></i> Edit
						</li>
						<li
							className="side-list-item"
							style={{ color: "red" }}
							onClick={() => removeElection(election)}
						>
							<i className="bi bi-trash3-fill side-menu-icon"></i> Delete
						</li>
					</ul>
				</div>
			)}
		</td>
	);
}
