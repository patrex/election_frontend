import { NavLink, useNavigate } from "react-router-dom";
import { Toaster } from 'sonner';
import { AppContext } from "@/App";
import { useContext } from "react";


function Header() {
	const navigate = useNavigate()
	const {user, setUser} = useContext(AppContext);

	const linkStyles = {
		fontWeight: 'bold',
		textDecoration: 'underline',
		color: '#161616',
		fontFamily: 'sans-serif',
		fontSize: '1.2em'
	}

	function logout(){
		setUser(null);
		navigate('/')
	}

	return ( 
		<header>
			<Toaster position="bottom-right" richColors/>
			<div><h2 className='banner'><NavLink to='/'>#Vote4.me</NavLink></h2></div>
			
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
			}
			
		</header>
	 );
}

export default Header;