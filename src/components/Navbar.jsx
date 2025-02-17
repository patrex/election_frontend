import { NavLink, Link } from "react-router-dom";
import {X, Menu} from 'lucide-react'

function NavBar({ user, onLogout}) {
	return ( 
		<>
			<div className="nav-container">
				<nav>
					<div className="logo">
						<h2><Link to={`/`} className="link-item">Votify</Link></h2>
					</div>
					<ul className="nav-link">
						{user ? (
							<>
								<li><Link to="" className="link-item">Dashboard</Link></li>
								<li><Link to="" className="link-item">Create Election</Link></li>
								<li>{user?.email} | <button onClick={onLogout}></button></li>
							</>
							) : (
							<>
								<li><Link to={`/login`} className="link-item active">Login</Link></li>
								<li><Link to={`/signup`} className="link-item">Sign Up</Link></li>
							</>
						)}

						
					</ul>

					<div className="icons md:block">
						<Menu />
						<X />
					</div>
				</nav>
			</div>
		</>
	);
}

export default NavBar;