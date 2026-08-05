import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">

      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/courses">Courses</NavLink></li>
        <li><NavLink to="/admission">Admission</NavLink></li>
        <li><NavLink to="/download">Download</NavLink></li>
        <li><NavLink to="/gallery">Gallery</NavLink></li>
        <li><NavLink to="/notice">Notice</NavLink></li>
        <li><NavLink to="/teachers">Teachers</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
      </ul>

    </nav>
  );
}