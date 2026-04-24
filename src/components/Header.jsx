import Navbar from "./Navbar";
import Toast from "@/utils/ToastMsg";

import { useAuth } from "@/contexts/AuthContext";

import { signOut } from "firebase/auth";
import { authman } from "@/utils/fireloader";

function Header() {
	const { logout, user } = useAuth();

	return ( 
		<>	
			<header>
				<Navbar />
			</header>
		</>
		
	);
}

export default Header;