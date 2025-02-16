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
						<li><Link to={`/`}></Link></li>

						{user ? (
							<>
								<li><Link to="" className="link-item">Dashboard</Link></li>
								<li><Link to="" className="link-item">Create Election</Link></li>
							</>
						) : (
							<>
								<li><Link to={`/login`} className="link-item">Login</Link></li>
								<li><Link to={`/signup`} className="link-item">Sign Up</Link></li>
							</>
						)}

						
					</ul>
				</nav>
			</div>
		</>
	);
}

export default NavBar;