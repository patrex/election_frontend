import { NavLink } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { AppContext } from "@/App";
import { useContext } from "react";


function Header() {
	const { user } = useContext(AppContext);

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
			<nav>
				{user ? (
						<NavLink to="/login"
							style={({isActive}) => isActive ? linkStyles: null}
						>Welcome, { user } <span>Logout</span></NavLink>
					) : <div>
						<NavLink to="/signup"
							style={({isActive}) => isActive ? linkStyles: null}
						>Login</NavLink>
				
						<NavLink to="/signup"
							style={({isActive}) => isActive ? linkStyles: null}
						>Signup</NavLink>
					</div>
				}
			</nav>
		</header>
	 );
}

export default Header;