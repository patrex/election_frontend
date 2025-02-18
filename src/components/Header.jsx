import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "@/App";
import { useContext } from "react";
import Navbar from "./Navbar";


function Header() {
	const navigate = useNavigate()
	const {user, setUser} = useContext(AppContext);

	const linkStyles = {
		fontWeight: 'bold',
		color: '',
		fontFamily: 'sans-serif',
		borderBottom: 'solid 5px blue'
	}

	function logout(){
		setUser(null);
		navigate('/')
	}

	return ( 
		<>	
			<header>
				<Navbar user={user} onLogout={logout} />
				

				{/* <div><h2 className='banner'><NavLink to='/'>#Vote4.me</NavLink></h2></div>
				
				{user ? 
					<div style={ {display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '0 1.5rem'} }>
						<pre style={ {color: 'white'} }>Welcome, { user.firstname } | <span className="logout" onClick={ logout }>Logout</span></pre>
					</div>
					: 
					<nav>
					
						<NavLink to="/login"
							style={({isActive}) => isActive ? linkStyles: null}
						>Login</NavLink>

						<NavLink to="/signup"
							style={({isActive}) => isActive ? linkStyles: null}
						>Signup</NavLink>
					</nav>
				} */}
				
			</header>
			<section>
				<div className="nav-container">
					<div className="res-bar">
						<h2>Menu</h2>
					</div>
				</div>
			</section>

		</>
		
	 );
}

export default Header;