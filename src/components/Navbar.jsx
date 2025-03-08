import { NavLink, Link } from "react-router-dom";
import { X, Menu, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

function NavBar({ user, onLogout }) {
  const [navOpen, setNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Toggle nav menu
  const toggleMenu = () => {
    setNavOpen(!navOpen);
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <>
      <div className="nav-container">
        <nav>
          <div className="logo">
            <h2>
              <Link to={`/`} className="link-item">
                Votify
              </Link>
            </h2>
          </div>
          <ul className={navOpen ? "nav-link active" : "nav-link"}>
            {user ? (
              <>
                <li>
                  <NavLink to={`user/${user?.uid}`} className="link-item">
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={`user/${user?.uid}/create-election`}
                    className="link-item"
                  >
                    Create Election
                  </NavLink>
                </li>
                <li>
                  {user?.email} | <button onClick={onLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to={`/login`} className="link-item">
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`/signup`} className="link-item">
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="menu-toggle" onClick={toggleMenu}>
            {navOpen ? <X className="menu-bar" /> : <Menu className="menu-bar" />}
          </div>
        </nav>
      </div>
    </>
  );
}

export default NavBar;
