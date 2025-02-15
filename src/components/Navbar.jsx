import { NavLink, Link } from "react-router-dom";
function NavBar({ user, onLogout}) {
	return ( 
		<>
			<div className="nav-container">
				<nav className="nav-container">
					<div className="logo">
						<h2>Votify</h2>
					</div>
					<ul>
						<li className="nav-link"><Link to={'/'} className="anchor-tag"></Link></li>
						<li className="nav-link"><Link to={`/user/${user.uid}`} className="anchor-tag">Dashboard</Link></li>
						<li className="nav-link"><Link to={`/user/${user.uid}/create-election`} className="anchor-tag">Create Election</Link></li>
					</ul>
				</nav>
			</div>
		</>
	);
}

export default NavBar;