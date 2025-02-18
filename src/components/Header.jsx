import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "@/App";
import { useContext } from "react";
import Navbar from "./Navbar";
import Toast from "@/utils/ToastMsg";

import { signOut } from "firebase/auth";
import { authman } from "@/utils/fireloader";


function Header() {
	const navigate = useNavigate()
	const {user, setUser} = useContext(AppContext);

	async function logout(){
		try {
			const logout_req = await signOut(authman);
		} catch (error) {
			Toast.error("There was an error")
		}
	}

	return ( 
		<>	
			<header>
				<Navbar user={user} onLogout={ logout } />
			</header>
		</>
		
	 );
}

export default Header;