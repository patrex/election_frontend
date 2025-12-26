import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, PlusCircle, LogOut, LogIn, UserPlus, DoorOpen } from 'lucide-react';
import { AppContext } from "@/App";

const Navbar = ({ user, onLogout }) => {
    const [navOpen, setNavOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const { voter, setVoter } = useContext(AppContext);

    // --- Logic Handlers ---
    const toggleMenu = () => setNavOpen(!navOpen);
    const closeMenu = () => setNavOpen(false);

    const handleLogout = () => {
        onLogout();
        closeMenu();
    };

    const handleExit = () => {
	setVoter(null);
        navigate('/');
        closeMenu();
    };

    // --- Side Effects ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeMenu();
        };

        if (navOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [navOpen]);

    // --- Shared Styles ---
    const linkBase = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline";
    const desktopLink = ({ isActive }) => 
        `${linkBase} ${isActive ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-700'}`;
    
    const mobileLink = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all no-underline ${isActive ? 'bg-violet-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-gray-900'}`;

    return (
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 no-underline group" onClick={closeMenu}>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                            Votify
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {user && !voter ? (
                            <>
                                <NavLink to={`/user/${user.uid}`} end className={desktopLink}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </NavLink>
                                <NavLink to={`/user/${user.uid}/create-election`} className={desktopLink}>
                                    <PlusCircle size={18} /> Create
                                </NavLink>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
                                <div className="flex items-center gap-3 pl-2">
                                    <span className="text-xs font-medium text-gray-500 max-w-[150px] truncate">{user.email}</span>
                                    <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : voter ? (
                            <button onClick={handleExit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                <DoorOpen size={18} /> Exit System
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-violet-600 no-underline">Login</NavLink>
                                <NavLink to="/signup" className="px-5 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-all no-underline shadow-lg shadow-violet-200 dark:shadow-none">
                                    Sign Up
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {navOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Panel */}
                {navOpen && (
                    <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-white dark:bg-gray-950">
                        <div ref={menuRef} className="p-4 space-y-2 h-full flex flex-col">
                            {user && !voter ? (
                                <>
                                    <NavLink to={`/user/${user.uid}`} onClick={closeMenu} className={mobileLink}>
                                        <LayoutDashboard size={20} /> Dashboard
                                    </NavLink>
                                    <NavLink to={`/user/${user.uid}/create-election`} onClick={closeMenu} className={mobileLink}>
                                        <PlusCircle size={20} /> Create Election
                                    </NavLink>
                                    
                                    <div className="mt-auto pb-8 pt-4 border-t border-gray-100 dark:border-gray-900">
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                                            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 truncate">{user.email}</p>
                                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold">
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3 pt-4">
                                    <NavLink to="/login" onClick={closeMenu} className={mobileLink}><LogIn size={20} /> Login</NavLink>
                                    <NavLink to="/signup" onClick={closeMenu} className="flex items-center justify-center gap-2 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold no-underline"><UserPlus size={20} /> Get Started</NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;