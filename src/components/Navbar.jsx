import { NavLink, Link } from "react-router-dom";
function NavBar({ user, onLogout}) {
	return ( 
		<>
			<div className="nav-container">
				<nav>
					<div className="logo">
						<h2>Votify</h2>
					</div>
					<ul className="nav-link">
						<li><a href="">Hello</a></li>
						<li><a href="">Dashboard</a></li>
						<li><a href="">Create Election</a></li>
					</ul>
				</nav>
			</div>
		</>
	);
}

export default NavBar;