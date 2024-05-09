import { Outlet, NavLink } from "react-router-dom";

function UserLayout() {
	const linkStyles = {
		fontWeight: 'bold',
		textDecoration: 'underline',
		color: '#161616',
		fontFamily: 'sans-serif',
		fontSize: '1.2em'
	}

	return ( 
		<>
			<nav className="subnav">
				<NavLink to='.'
					end
					style={({isActive}) => isActive ? linkStyles : null}
				>Dashboard</NavLink>

				<NavLink to='create-election'
					style={({isActive}) => isActive ? linkStyles : null}
				>Create New Election</NavLink>
			</nav>
			<Outlet />
		</>
		
	);
}

export default UserLayout;