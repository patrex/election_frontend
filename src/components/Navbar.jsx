import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react"; // Ensure correct import

import { AppContext } from '@/App';

function NavBar({ user, onLogout }) {
  const [navOpen, setNavOpen] = useState(false);

  const { voter } = useContext(AppContext)

  const toggleMenu = () => setNavOpen(!navOpen);
  const closeMenu = () => setNavOpen(false);

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
                <li>{user?.email} | <button onClick={onLogout}>Logout</button></li>
              </>
            )
          ) : voter ? (
            // Voters (who are not registered users)
            <>
              <li><button onClick={onLogout}>Exit</button></li>
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
