import { NavLink, Link } from "react-router-dom";
import {X, Menu} from 'lucide-react'
import { useState } from "react";

function NavBar({ user, onLogout}) {
	const [navOpen, setNavOpen] = useState(false)

	const toggleMenu = function () {
		setNavOpen(!navOpen)
	}

	const linkStyles = {
		fontWeight: 'bold',
		color: '',
		fontFamily: 'sans-serif',
		borderBottom: 'solid 5px blue'
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
								<li><NavLink to="" style={({isActive}) => {isActive ? linkStyles : null}}>Dashboard</NavLink></li>
								<li><NavLink to="" style={({isActive}) => {isActive ? linkStyles : null}}>Create Election</NavLink></li>
								<li>{user?.email} | <button onClick={onLogout}></button></li>
							</>
							) : (
							<>
								<li><NavLink to={`/login`} style={({isActive}) => {isActive ? linkStyles : null}}>Login</NavLink></li>
								<li><NavLink to={`/signup`} style={({isActive}) => {isActive ? linkStyles : null}}>Sign Up</NavLink></li>
							</>
						)}

						
					</ul>

					<div className="res-menu-icons">
						<Menu className="menu-bar" onClick={ toggleMenu } />
					</div>
				</nav>
			</div>
		</>
	);
}

export default NavBar;