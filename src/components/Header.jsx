import { AppContext } from "@/App";
import { useContext } from "react";
import Navbar from "./Navbar";
import Toast from "@/utils/ToastMsg";

import { signOut } from "firebase/auth";
import { authman } from "@/utils/fireloader";

function Header() {
	const { user } = useContext(AppContext);

	async function logout(){
		try {
			await signOut(authman);
		} catch (error) {
			Toast.error("There was an error logging you out");
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