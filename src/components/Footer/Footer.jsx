import "./Footer.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

export default function Footer() {
  const [branches, setBranches] = useState([]);

  /* =====================================================
     LOAD BRANCHES
  ===================================================== */

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/branch_list.php`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (data.success) {
          const activeBranch = (data.branch || []).filter(
            (branch) =>
              String(branch.status).toLowerCase() === "active"
          );

          setBranches(activeBranch);
        }
      } catch (error) {
        console.error("Branch load error:", error);
      }
    };

    fetchBranches();
  }, []);

  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-main">

          {/* =================================================
              BRANCHES
          ================================================= */}

          <section className="branches-section">

            <h2 className="footer-section-title">
              Our Branches
            </h2>

            <div className="footer-title-line"></div>

            <div className="branches-items">

              {branches.length > 0 ? (

                branches.map((branch) => (

                  <div
                    className="branch"
                    key={branch.id}
                  >

                    {/* Branch Name */}

                    <h3 className="branch-name">

                      <span className="branch-pin">
                        📍
                      </span>

                      {branch.branch_name_bn ||
                        branch.branch_name}

                    </h3>


                    {/* Address */}

                    {branch.address && (
                      <p className="branch-info">

                        <span className="branch-icon">
                          🏠
                        </span>

                        <span>
                          {branch.address}
                        </span>

                      </p>
                    )}


                    {/* Mobile */}

                    {branch.mobile && (
                      <p className="branch-info">

                        <span className="branch-icon">
                          ☎️
                        </span>

                        <span>
                          {branch.mobile}
                        </span>

                      </p>
                    )}


                    {/* Email */}

                    {branch.email && (
                      <p className="branch-info">

                        <span className="branch-icon">
                          ✉️
                        </span>

                        <span>
                          {branch.email}
                        </span>

                      </p>
                    )}


                    {/* Google Maps */}

                    {branch.map_link && (
                      <p className="branch-map">

                        <a
                          href={branch.map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >

                          <span>
                            🗺️
                          </span>

                          View on Google Maps

                        </a>

                      </p>
                    )}

                  </div>

                ))

              ) : (

                <p className="no-branches">
                  No branch information available.
                </p>

              )}

            </div>

          </section>


          {/* =================================================
              MOBILE APP
          ================================================= */}

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

                  <small>
                    GET IT ON
                  </small>

                  <strong>
                    Google Play
                  </strong>

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

                  <small>
                    Download on the
                  </small>

                  <strong>
                    App Store
                  </strong>

                </div>

              </a>

            </div>

          </section>

        </div>

      </div>


      {/* =================================================
          FOOTER BOTTOM
      ================================================= */}

      <div className="footer-bottom">

        <p>

          Copyright ©{" "}
          {new Date().getFullYear()}{" "}
          Sunshine Education.{" "}
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