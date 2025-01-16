import { NavLink } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { AppContext } from "@/App";
import { useContext } from "react";


function Header() {
	const {user, setUser} = useContext(AppContext);

	const linkStyles = {
		fontWeight: 'bold',
		textDecoration: 'underline',
		color: '#161616',
		fontFamily: 'sans-serif',
		fontSize: '1.2em'
	}

	

	return ( 
		<header>
			<Toaster position="top-right" richColors/>
			<h2 className='banner'><NavLink to='/'>#Vote4.me</NavLink></h2>
			{user ? 
				<pre>Welcome, { user.firstname } <span>Logout</span></pre> : 
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