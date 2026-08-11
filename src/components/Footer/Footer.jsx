import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <h2 className="branches-title">Our Branches</h2>

        <div className="branches-line"></div>

        <div className="branches-list">

 {/* Rajshahi Main */} <div className="branch"> <h3>📍 রাজশাহী প্রধান শাখা</h3> <p>নগর ভবনের পূর্ব পাশে</p> <p>☎️ 01540-019837</p> <p>☎️ 01723-913228</p> <p>📱 01890-411154 (WhatsApp)</p> </div> {/* Hat Ramchandrapur */} <div className="branch"> <h3>📍 হাট রামচন্দ্রপুর শাখা</h3> <p>আজিজ ম্যানশন, পবা, রাজশাহী</p> <p>☎️ 01339-441034</p> </div> {/* Khulna */} <div className="branch"> <h3>📍 খুলনা শাখা</h3> <p>ঠিকানা এখানে লিখুন</p> <p>☎️ 01XXXXXXXXX</p> </div> {/* Tangail */} <div className="branch"> <h3>📍 টাঙ্গাইল শাখা</h3> <p>ঠিকানা এখানে লিখুন</p> <p>☎️ 01XXXXXXXXX</p> </div>
        </div>

      </div>

      <div className="footer-bottom">

<p>
  Copyright © {new Date().getFullYear()} Sunshine Education.{" "}
  All rights reserved
  <a
    href="/admin/login"
    className="admin-login-link"
  >
    .
  </a>{" "}  
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