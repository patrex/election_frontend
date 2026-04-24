import Navbar from "./Navbar";
import NavBar1 from "./NavBar1";

import { useAuth } from "@/contexts/AuthContext";

import { signOut } from "firebase/auth";
import { authman } from "@/utils/fireloader";

function Header() {
	const { logout, user } = useAuth();

	return ( 
		<>	
			<NavBar1 />
		</>
		
	);
}

export default Header;