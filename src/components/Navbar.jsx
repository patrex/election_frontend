import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UserCircle } from "lucide-react";

const Navbar = ({ user, onLogout }) => {
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
				<div className="hidden md:flex space-x-8 ml-auto">
					<Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Home</Link>
					<Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
						About
					</Link>
					<Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
						Contact
					</Link>
				</div>

				{/* Right Side: Auth Buttons / User Menu */}
				<div className="hidden md:flex items-center space-x-4 ml-auto">
					{user ? (
						// User Dropdown Menu
						<div className="relative">
							<button
								onClick={() => setDropdownOpen(!dropdownOpen)}
								className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500"
							><UserCircle className="w-8 h-8" />
							</button>

							{dropdownOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2">
									<Link to="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
										Profile
									</Link>
									<Link to="/settings" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
										Settings
									</Link>
									<button
										onClick={onLogout}
										className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
									>Logout
									</button>
								</div>
							)}
						</div>
					) : (
						// Login & Signup Buttons
						<>
							<Link to="/login" className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-500 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800">
								Login
							</Link>
							<Link to="/signup" className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
								Sign Up
							</Link>
						</>
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
				<Link to="/about" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
					About
				</Link>
				<Link to="/contact" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
					Contact
				</Link>
				{user ? (
					<>
						<Link to="/profile" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">
							Profile
						</Link>
						<button onClick={onLogout} className="block text-red-600 hover:text-red-800">
							Logout
						</button>
					</>
				) : (
					<>
						<Link to="/login" className="block text-blue-600 dark:text-blue-400 hover:text-blue-500">
							Login
						</Link>
						<Link to="/signup" className="block text-blue-600 dark:text-blue-400 hover:text-blue-500">
							Sign Up
						</Link>
					</>
				)}
			</div>
		)}
    </nav>
  );
};

export default Navbar;
