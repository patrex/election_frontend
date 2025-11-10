import { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

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

		if (navOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [navOpen]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && navOpen) {
				setNavOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [navOpen]);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (navOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [navOpen]);

	const handleLogout = () => {
		onLogout();
		closeMenu();
	};

	const handleExit = () => {
		navigate('/');
		closeMenu();
	};

	return (
		<header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Link
							to="/"
							className="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
						>
							Votify
						</Link>
					</div>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-1">
						{user && !voter ? (
							<>
								<NavLink
									to={`/user/${user.uid}`}
									end
									className={({ isActive }) =>
										`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											isActive
												? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
										}`
									}
								>
									Dashboard
								</NavLink>
								<NavLink
									to={`/user/${user.uid}/create-election`}
									className={({ isActive }) =>
										`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											isActive
												? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
										}`
									}
								>
									Create Election
								</NavLink>

								{/* User Menu */}
								<div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
									<span className="text-sm text-gray-600 dark:text-gray-400">
										{user.email}
									</span>
									<button
										onClick={onLogout}
										className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										Logout
									</button>
								</div>
							</>
						) : voter ? (
							<button
								onClick={() => navigate('/')}
								className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								Exit
							</button>
						) : (
							<>
								<NavLink
									to="/login"
									className={({ isActive }) =>
										`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											isActive
												? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
										}`
									}
								>
									Login
								</NavLink>
								<NavLink
									to="/signup"
									className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
								>
									Sign Up
								</NavLink>
							</>
						)}
					</div>

					{/* Mobile Menu Toggle */}
					<button
						onClick={toggleMenu}
						className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						aria-expanded={navOpen}
						aria-label="Toggle menu"
					>
						{navOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{navOpen && (
					<>
						{/* Backdrop */}
						<div
							className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
							onClick={closeMenu}
							aria-hidden="true"
						/>

						{/* Menu Panel */}
						<div
							ref={menuRef}
							className="fixed top-16 left-0 right-0 bottom-0 bg-white dark:bg-gray-950 md:hidden overflow-y-auto"
						>
							<div className="px-4 py-6 space-y-2">
								{user && !voter ? (
									<>
										<NavLink
											to={`/user/${user.uid}`}
											end
											onClick={closeMenu}
											className={({ isActive }) =>
												`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
													isActive
														? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
														: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
												}`
											}
										>
											Dashboard
										</NavLink>
										<NavLink
											to={`/user/${user.uid}/create-election`}
											onClick={closeMenu}
											className={({ isActive }) =>
												`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
													isActive
														? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
														: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
												}`
											}
										>
											Create Election
										</NavLink>

										{/* User Info Section */}
										<div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
											<div className="px-4 py-2">
												<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
													Signed in as
												</p>
												<p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
													{user.email}
												</p>
												<button
													onClick={handleLogout}
													className="w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
												>
													Logout
												</button>
											</div>
										</div>
									</>
								) : voter ? (
									<button
										onClick={handleExit}
										className="w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										Exit
									</button>
								) : (
									<>
										<NavLink
											to="/login"
											onClick={closeMenu}
											className={({ isActive }) =>
												`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
													isActive
														? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
														: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
												}`
											}
										>
											Login
										</NavLink>
										<NavLink
											to="/signup"
											onClick={closeMenu}
											className="block px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-base font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-center"
										>
											Sign Up
										</NavLink>
									</>
								)}
							</div>
						</div>
					</>
				)}
			</nav>
		</header>
	);
}

export default NavBar;
