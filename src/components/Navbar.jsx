import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Icons for menu toggle

function NavBar({ user, voter, onLogout }) {
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setNavOpen(!navOpen);
  const closeMenu = () => setNavOpen(false);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  // Get first letter of email if no profile picture
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <div className="nav-container">
      <nav className="navbar">
        <div className="logo">
          <h2>
            <Link to="/" className="link-item">Votify</Link>
          </h2>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${navOpen ? "active" : ""}`}>
          {user ? (
            !voter && (
              <>
                <li><NavLink to={`/user/${user?.uid}`} className="link-item" onClick={closeMenu}>Dashboard</NavLink></li>
                <li><NavLink to={`/user/${user?.uid}/create-election`} className="link-item" onClick={closeMenu}>Create Election</NavLink></li>
              </>
            )
          ) : voter ? (
            <>
              <li><NavLink to="/vote" className="link-item" onClick={closeMenu}>Vote</NavLink></li>
            </>
          ) : (
            <>
              <li><NavLink to="/login" className="link-item" onClick={closeMenu}>Login</NavLink></li>
              <li><NavLink to="/signup" className="link-item" onClick={closeMenu}>Sign Up</NavLink></li>
            </>
          )}
        </ul>

        {/* User Profile Dropdown */}
        {user && !voter && (
          <div className="profile-menu" ref={profileRef}>
            <div className="profile-pic" onClick={toggleProfile}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
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

        {/* Mobile Menu Toggle */}
        <div className="menu-toggle">
          {navOpen ? (
            <X className="menu-icon" onClick={toggleMenu} />
          ) : (
            <Menu className="menu-icon" onClick={toggleMenu} />
          )}
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
