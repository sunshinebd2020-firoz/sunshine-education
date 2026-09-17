import { useState, useEffect } from "react";
import "./Header.css";
import logo from "../../assets/logo/logo.png";
import API_BASE_URL from "../../config/api";

import {
  FaWhatsapp,
  FaFacebookF,
  FaYoutube,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Header() {
  const [hotline, setHotline] = useState("");
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_hotline.php`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Hotline API Response:", data);

        if (
          data &&
          data.hotline &&
          data.hotline.trim() !== ""
        ) {
          setHotline(data.hotline.trim());
        }
      })
      .catch((err) =>
        console.error("Error fetching hotline:", err)
      );
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/language_list.php`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status}`
          );
        }

        const result = await response.json();

        let list = [];

        if (
          result.success &&
          Array.isArray(result.data)
        ) {
          list = result.data;
        } else if (Array.isArray(result)) {
          list = result;
        }

        const activeLangs = list.filter((lang) => {
          const status = String(
            lang.status ?? ""
          )
            .trim()
            .toLowerCase();

          return (
            status === "active" ||
            status === "1"
          );
        });

        setLanguages(activeLangs);
      } catch (error) {
        console.error(
          "Language load error:",
          error
        );
        setLanguages([]);
      }
    };

    fetchLanguages();
  }, []);

const languageNames = languages
  .map((lang) => lang.name)
  .filter(Boolean);

const formattedLanguageNames =
  languageNames.length <= 1
    ? languageNames.join("")
    : languageNames.length === 2
    ? languageNames.join(" & ")
    : `${languageNames.slice(0, -1).join(", ")} & ${
        languageNames[languageNames.length - 1]
      }`;

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
  {formattedLanguageNames
    ? `${formattedLanguageNames} Language School`
    : "Language School"}
</p>
        </div>

        {/* Social Links & Hotline */}
        <div className="social-links">

          {/* Hotline Button */}
          {hotline && (
            <a
              href={`tel:${hotline}`}
              className="hotline-btn"
              title="Call Hotline"
            >
              <FaPhoneAlt className="hotline-icon" />
              <span className="hotline-number">
                {hotline}
              </span>
            </a>
          )}

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