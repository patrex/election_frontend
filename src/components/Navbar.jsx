import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { AppContext } from "@/App";

function NavBar({ user, onLogout }) {
	const [navOpen, setNavOpen] = useState(false);
	const navigate = useNavigate();
	const menuRef = useRef(null);

	const { voter } = useContext(AppContext);

	const toggleMenu = () => setNavOpen(!navOpen);
	const closeMenu = () => setNavOpen(false);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setNavOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className="nav-container shadow-md px-6 py-4 bg-white">
			<nav className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Logo */}
				<div className="logo">
					<h2 className="text-2xl font-bold">
						<Link to="/" className="link-item">Votify</Link>
					</h2>
				</div>

				{/* Desktop Menu */}
				<ul className="hidden md:flex items-center gap-6 list-none">
					{user ? (
						!voter && (
							<>
								<li><NavLink to={`/user/${user?.uid}`} className="link-item">Dashboard</NavLink></li>
								<li><NavLink to={`/user/${user?.uid}/create-election`} className="link-item">Create Election</NavLink></li>
								<li>{user?.email} | <button onClick={onLogout}>Logout</button></li>
							</>
						)
					) : voter ? (
						<li><button onClick={() => navigate("/")}>Exit</button></li>
					) : (
						<>
							<li><NavLink to="/login" className="link-item">Login</NavLink></li>
							<li><NavLink to="/signup" className="link-item">Sign Up</NavLink></li>
						</>
					)}
				</ul>

				{/* Mobile Menu Toggle */}
				<div className="md:hidden z-30">
					<Menu
						className="menu-bar w-8 h-8 cursor-pointer"
						onClick={toggleMenu}
						aria-expanded={navOpen}
					/>
				</div>

				{/* Mobile Menu */}
				{navOpen && (
					<ul
						ref={menuRef}
						className="absolute top-full left-0 w-full bg-white flex flex-col gap-4 px-6 py-4 shadow-md transition-all duration-300 md:hidden z-20 list-none"
					>
						{user ? (
							!voter && (
								<>
									<li><NavLink  to={`/user/${user.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
									<li><NavLink to={`/user/${user.uid}/create-election`} className="link-item" onClick={closeMenu}>Create Election</NavLink></li>
									<li>{user.email} | <button onClick={() => { onLogout(); closeMenu(); }}>Logout</button></li>
								</>
							)
						) : voter ? (
							<li><button onClick={() => { navigate("/"); closeMenu(); }}>Exit</button></li>
						) : (
							<>
								<li><NavLink to="/login" className="link-item" onClick={closeMenu}>Login</NavLink></li>
								<li><NavLink to="/signup" className="link-item" onClick={closeMenu}>Sign Up</NavLink></li>
							</>
						)}
					</ul>
				)}
			</nav>
		</header>
	);
}

export default NavBar;
