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
        <img
          src={logo}
          alt="Sunshine Education Logo"
          className="logo"
        />

        {/* Header Text */}
        <div className="header-text">
          <h1>Sunshine Education</h1>
          <p>
            Japanese, German and Korean Language School
          </p>
        </div>

        {/* Social Icons */}
        <div className="social-links">

          <a
            href="https://wa.me/8801540019837?text=Hello%20Sunshine%20Education"
            className="social whatsapp"
            title="WhatsApp"
          >
            <FaWhatsapp />
          </a>

          <a
            href="https://www.facebook.com/sunshine.eduraj"
            className="social facebook"
            title="Facebook Page"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.facebook.com/groups/sunshine.eduraj"
            className="social facebook"
            title="Facebook Group"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.youtube.com/@SunshineEducationlanguage"
            className="social youtube"
            title="YouTube"
          >
            <FaYoutube />
          </a>

        </div>

      </div>

    </header>
  );
}