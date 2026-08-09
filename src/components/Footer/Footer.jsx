import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">
          <h2>Sunshine Education</h2>
          <p>
            Japanese, German and Korean Language School
          </p>
        </div>

        <div className="footer-contact">
          <p>📞 01XXXXXXXXX</p>
          <p>✉️ info@sunshineeducation.com</p>
        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Sunshine Education.
          All rights reserved.
        </p>

        <p className="developer">
          Website Developed by{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firoz Mahmud
          </a>
        </p>

      </div>

    </footer>
  );
}