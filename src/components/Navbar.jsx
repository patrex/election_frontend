import { NavLink, Link } from "react-router-dom";
import {X, Menu} from 'lucide-react'
import { useState } from "react";

function NavBar({ user, onLogout}) {
	const [navOpen, setNavOpen] = useState(false)

	const toggleMenu = function () {
		setNavOpen(!navOpen)
	}

	return ( 
		<>
			<div className="nav-container">
				<nav>
					<div className="logo">
						<h2><Link to={`/`} className="link-item">Votify</Link></h2>
					</div>
					<ul className={navOpen ? 'nav-link active' : 'nav-link'}>
						{user ? (
							<>
								<li><NavLink to="" className={(isActive) => {isActive ? "active" : "link-item"}}>Dashboard</NavLink></li>
								<li><NavLink to="" className={(isActive) => {isActive ? "active" : "link-item"}}>Create Election</NavLink></li>
								<li>{user?.email} | <button onClick={onLogout}></button></li>
							</>
							) : (
							<>
								<li><NavLink to={`/login`} className={(isActive) => {isActive ? "active" : "link-item"}}>Login</NavLink></li>
								<li><NavLink to={`/signup`} className={(isActive) => {isActive ? "active" : "link-item"}}>Sign Up</NavLink></li>
							</>
						)}

						
					</ul>

					<div className="res-menu-icons">
						<Menu className="menu-bar" onClick={toggleMenu}/>
					</div>
				</nav>
			</div>
		</>
	);
}

export default NavBar;