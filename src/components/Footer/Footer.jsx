import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-main">

          {/* =========================
              BRANCHES
          ========================= */}

          <section className="branches-section">

            <h2 className="footer-section-title">
              Our Branches
            </h2>

            <div className="footer-title-line"></div>

            <div className="branches-items">

              <div className="branch">
                <h3>📍 রাজশাহী প্রধান শাখা</h3>
                <p>নগর ভবনের পূর্ব পাশে</p>
                <p>☎️ 01540-019837</p>
                <p>☎️ 01723-913228</p>
                <p>📱 01890-411154 (WhatsApp)</p>
              </div>

              <div className="branch">
                <h3>📍 হাট রামচন্দ্রপুর শাখা</h3>
                <p>আজিজ ম্যানশন, পবা, রাজশাহী</p>
                <p>☎️ 01339-441034</p>
              </div>

            </div>

          </section>


{/* =========================
    MOBILE APP
========================= */}

<section className="mobile-app-section">

  <h2 className="footer-section-title">
    Mobile App
  </h2>

  <div className="footer-title-line"></div>

  <div className="app-buttons">

    {/* Google Play */}

    <a
      href="https://play.google.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="store-button google-store"
    >
      <div className="store-icon google-icon">
        <span className="play-triangle"></span>
      </div>

      <div className="store-button-text">
        <small>GET IT ON</small>
        <strong>Google Play</strong>
      </div>
    </a>


    {/* Apple App Store */}

    <a
      href="https://apps.apple.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="store-button apple-store"
    >
      <div className="store-icon apple-icon">
        
      </div>

      <div className="store-button-text">
        <small>Download on the</small>
        <strong>App Store</strong>
      </div>
    </a>

  </div>

</section>

        </div>

      </div>


      {/* =========================
          FOOTER BOTTOM
      ========================= */}

      <div className="footer-bottom">

        <p>
          Copyright © {new Date().getFullYear()} Sunshine Education.{" "}
          All rights reserved
          <a
            href="/admin/login"
            className="admin-login-link"
          >
            .
          </a>
        </p>

        <p className="developer">
          Website Developed by{" "}
          <a
            href="https://www.facebook.com/fmfiroz18"
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