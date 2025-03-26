import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react"; // Ensure correct import

import { AppContext } from '@/App';

function NavBar({ user, onLogout }) {
	const [navOpen, setNavOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const navigate = useNavigate();

	const { voter } = useContext(AppContext)

	const toggleMenu = () => setNavOpen(!navOpen);
	const closeMenu = () => setNavOpen(false);

	const toggleProfile = () => setProfileOpen(!profileOpen);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
		  if (navOpen && !e.target.closest(".nav-container")) setNavOpen(false);
		  if (profileOpen && !e.target.closest(".profile-menu")) setProfileOpen(false);
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [navOpen, profileOpen]);

	const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

	return (
		<div className="nav-container">
			<nav>
				<div className="logo">
					<h2>
						<Link to="/" className="link-item">Votify</Link>
					</h2>
				</div>

				<ul className={navOpen ? "nav-link active" : "nav-link"}>
					{user ? (
						// Logged-in users (excluding voters)
						!voter && (
							<>
								<li><NavLink to={`/user/${user?.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
								<li><NavLink to={`/user/${user?.uid}/create-election`} className="link-item" onClick={closeMenu}>Create Election</NavLink></li>
								<li>
									{(user && !voter) && (
										<div className="profile-menu" onClick={toggleProfile}>
											<div className="profile-pic" >
												{user?.photoURL ? (
													<img src={user.photoURL} alt="User Profile" />
												) : (
													<span className="profile-initial">{userInitial}</span>
												)}
											</div>
											{profileOpen && (
												<div className="dropdown-menu">
													<p>{user?.email}</p>
													<button onClick={onLogout}>Logout</button>
												</div>
											)}
										</div>
									)} 
								</li>
							</>
						)
					) : voter ? (
						// Voters (who are not registered users)
						<>
							<li><button onClick={navigate('/')}>Exit</button></li>
						</>
					) : (
						// Completely unauthenticated users
						<>
							<li><NavLink to="/login" className="link-item" onClick={closeMenu}>Login</NavLink></li>
							<li><NavLink to="/signup" className="link-item" onClick={closeMenu}>Sign Up</NavLink></li>
						</>
					)}
				</ul>

				

				<div className="menu-toggle">
					<Menu className="menu-bar" onClick={toggleMenu} aria-expanded={navOpen} />
				</div>
			</nav>
		</div>
	);
}

export default NavBar;
