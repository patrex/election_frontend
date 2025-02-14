import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UserCircle } from "lucide-react";

const Navbar = ({ user = {uid: 1}, onLogout }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	return (
		<nav className="bg-white dark:bg-gray-900 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							Votify
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex space-x-8">
						<Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
						Home
						</Link>
						{user && (
							<>
								<Link to={`/user/${user.uid}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
								Dashboard
								</Link>
								<Link to={`/user/${user.uid}/create-election`} className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
								Create Election
								</Link>
							</>
							)
						}
					</div>

					{/* User Dropdown */}
					<div className="relative hidden md:block">
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500"
						><UserCircle className="w-8 h-8" />
						</button>

						{dropdownOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2">
								{user && (
									<>
										<Link to={`/user/${user.uid}`} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
											Dashboard
										</Link>
										<Link to={`/user/${user.uid}/create-election`} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
											Create Election
										</Link>
										<button
											onClick={onLogout}
											className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
										> Logout
										</button>
									</>
								)}
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
					{menuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{menuOpen && (
				<div className="md:hidden bg-white dark:bg-gray-900 px-4 py-2 space-y-2">
					<Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
						Home
					</Link>
					{user && (
						<>
							<Link to={`/user/${user.uid}`} className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
								Dashboard
							</Link>
							<Link to={`/user/${user.uid}/create-election`} className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
								Create Election
							</Link>
							<button onClick={onLogout} className="block text-red-600 hover:text-red-800">
								Logout
							</button>
						</>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
