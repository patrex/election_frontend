import Navbar from "./Navbar";
import Toast from "@/utils/ToastMsg";

import { useAuth } from "@/contexts/AuthContext";

import { signOut } from "firebase/auth";
import { authman } from "@/utils/fireloader";

function Header() {
	const { logout } = useAuth();

	async function logout(){
		try {
			await logout();
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