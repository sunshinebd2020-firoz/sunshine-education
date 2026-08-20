import "./Header.css";
import logo from "../../assets/logo/logo.png";

import {
  FaWhatsapp,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">

        {/* Logo */}
        <div className="logo-wrapper">
          <img
            src={logo}
            alt="Sunshine Education Logo"
            className="logo"
          />
        </div>

        {/* Header Text */}
        <div className="header-text">
          <h1>Sunshine Education</h1>

          <div className="header-divider">
            <span></span>
          </div>

          <p>
            Japanese, German and Korean Language School
          </p>
        </div>

        {/* Social Icons */}
        <div className="social-links">

          {/* WhatsApp */}
          <a
            href="https://wa.me/8801540019837?text=Hello%20Sunshine%20Education"
            className="social whatsapp"
            title="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
          </a>

          {/* Facebook Page */}
          <a
            href="https://www.facebook.com/sunshine.eduraj"
            className="social facebook"
            title="Facebook Page"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>

          {/* Facebook Group */}
          <a
            href="https://www.facebook.com/groups/sunshine.eduraj"
            className="social facebook"
            title="Facebook Group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@SunshineEducationlanguage"
            className="social youtube"
            title="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube />
          </a>

        </div>

      </div>
    </header>
  );
}