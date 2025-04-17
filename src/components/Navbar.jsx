import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AppContext } from "@/App";

function NavBar({ user, onLogout }) {
	const [navOpen, setNavOpen] = useState(false);
	const { voter } = useContext(AppContext);
	const navigate = useNavigate();
	const menuRef = useRef(null);

	const toggleMenu = () => setNavOpen(prev => !prev);
	const closeMenu = () => setNavOpen(false);

	// Detect click outside mobile menu
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (navOpen && menuRef.current && !menuRef.current.contains(e.target)) {
				closeMenu();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [navOpen]);

	return (
		<header className="nav-container bg-white shadow-sm border-b border-gray-200">
			<nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 relative">
				{/* Logo */}
				<div className="logo text-xl font-bold">
					<h2>
						<Link to="/" className="link-item">Votify</Link>
					</h2>
				</div>

				{/* Desktop Links */}
				<ul className="hidden md:flex items-center gap-6">
					{user ? (
						!voter && (
							<>
								<li><NavLink to={`/user/${user.uid}`} className="link-item">Dashboard</NavLink></li>
								<li><NavLink to={`/user/${user.uid}/create-election`} className="link-item">Create Election</NavLink></li>
								<li>{user.email} | <button onClick={onLogout}>Logout</button></li>
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

				{/* Hamburger Button */}
				<div className="md:hidden z-30">
					<button onClick={toggleMenu} aria-label="Toggle menu">
						{navOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu */}
				<div
					ref={menuRef}
					className={`absolute top-full left-0 w-full bg-white flex flex-col gap-4 px-6 py-4 shadow-md transition-all duration-300 md:hidden z-20 ${
						navOpen ? "block" : "hidden"
					}`}
				>
					{user ? (
						!voter && (
							<>
								<li><NavLink to={`/user/${user.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
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
				</div>
			</nav>
		</header>
	);
}

export default NavBar;
