import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Courses",
      path: "/courses",
    },
    {
      label: "Admission",
      path: "/admission",
    },
    {
      label: "Download",
      path: "/download",
    },
    {
      label: "Gallery",
      path: "/gallery",
    },
    {
      label: "Notice",
      path: "/notice",
    },
    {
      label: "Teachers",
      path: "/teachers",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  return (
    <nav className="navbar">

      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      <button
        type="button"
        className={`navbar-toggle ${
          menuOpen ? "active" : ""
        }`}
        onClick={toggleMenu}
        aria-label={
          menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        className={`navbar-menu-wrapper ${
          menuOpen ? "open" : ""
        }`}
      >
        <ul className="navbar-menu">

          {navItems.map((item) => (
            <li
              key={item.path}
              className="navbar-item"
            >
              <NavLink
                to={item.path}
                end={
                  item.path === "/"
                }
                onClick={closeMenu}
                className={({ isActive }) =>
                  `navbar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}

        </ul>
      </div>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {menuOpen && (
        <button
          type="button"
          className="navbar-overlay"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

    </nav>
  );
}