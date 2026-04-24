import { Link, NavLink, useNavigate } from 'react-router-dom';

function NavBar1() {
    const baseLinkStyle = "p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer";

    return <>
        <header className="flex justify-between items-center text-black py-6 px-8 md:px-32">
             <Link to="/" className="flex items-center gap-2 no-underline group" onClick={closeMenu}>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                    Voteng
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
                {user && !voter ? (
                    <>
                        <NavLink to={`/user/${user.id}`} end className={baseLinkStyle}>
                            <LayoutDashboard size={18} /> Dashboard
                        </NavLink>
                        <NavLink to={`/user/${user.id}/create-election`} className={baseLinkStyle}>
                            <PlusCircle size={18} /> Create New Election
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
                    <>
                        <button onClick={handleExit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            <DoorOpen size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <NavLink to="/login" className={baseLinkStyle}>Login</NavLink>
                        <NavLink to="/signup" className={baseLinkStyle}>
                            Sign Up
                        </NavLink>
                    </div>
                )}
            </div>
        </header>
    </>
}

export default NavBar1;