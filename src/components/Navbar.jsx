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
						<li className="nav-link"><a href="">Gello</a></li>
						<li className="nav-link"><a href="">Dashboard</a></li>
						<li className="nav-link"><a href="">Create Election</a></li>
					</ul>
				</nav>
			</div>
		</>
	);
}

export default NavBar;