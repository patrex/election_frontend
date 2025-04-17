import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Toggle icons
import { AppContext } from "@/App";

function NavBar({ user, onLogout }) {
	const [navOpen, setNavOpen] = useState(false);
	const navigate = useNavigate();
	const { voter } = useContext(AppContext);

	const toggleMenu = () => setNavOpen(!navOpen);
	const closeMenu = () => setNavOpen(false);

	// Click outside to close
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (navOpen && !e.target.closest(".nav-inner")) {
				setNavOpen(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [navOpen]);

	return (
		<div className="nav-container bg-white shadow-sm border-b border-gray-200">
			<nav className="nav-inner max-w-7xl mx-auto flex justify-between items-center px-6 py-4 relative">
				
				{/* Logo */}
				<div className="logo text-xl font-bold">
					<h2>
						<Link to="/" className="link-item">Votify</Link>
					</h2>
				</div>

				{/* Desktop Menu */}
				<ul className="hidden md:flex items-center gap-6">
					{user ? (
						!voter && (
							<>
								<li><NavLink to={`/user/${user?.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
								<li><NavLink to={`/user/${user?.uid}/create-election`} className="link-item" onClick={closeMenu}>Create Election</NavLink></li>
								<li>{user?.email} | <button onClick={onLogout}>Logout</button></li>
							</>
						)
					) : voter ? (
						<li><button onClick={() => navigate("/")}>Exit</button></li>
					) : (
						<>
							<li><NavLink to="/login" className="link-item" onClick={closeMenu}>Login</NavLink></li>
							<li><NavLink to="/signup" className="link-item" onClick={closeMenu}>Sign Up</NavLink></li>
						</>
					)}
				</ul>

				{/* Hamburger Toggle */}
				<div className="md:hidden z-20">
					<button onClick={toggleMenu} aria-expanded={navOpen}>
						{navOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{navOpen && (
					<ul className="absolute top-full left-0 w-full bg-white flex flex-col items-start gap-4 px-6 py-4 shadow-md md:hidden z-10">
						{user ? (
							!voter && (
								<>
									<li><NavLink to={`/user/${user?.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
									<li><NavLink to={`/user/${user?.uid}/create-election`} className="link-item" onClick={closeMenu}>Create Election</NavLink></li>
									<li>{user?.email} | <button onClick={onLogout}>Logout</button></li>
								</>
							)
						) : voter ? (
							<li><button onClick={() => navigate("/")}>Exit</button></li>
						) : (
							<>
								<li><NavLink to="/login" className="link-item" onClick={closeMenu}>Login</NavLink></li>
								<li><NavLink to="/signup" className="link-item" onClick={closeMenu}>Sign Up</NavLink></li>
							</>
						)}
					</ul>
				)}
			</nav>
		</div>
	);
}

export default NavBar;
