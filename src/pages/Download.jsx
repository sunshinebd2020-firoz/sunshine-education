import { useEffect, useMemo, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import "./Download.css";

export default function Download() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD DOWNLOADS
  ===================================================== */

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/download_public.php`
        );

        if (!response.ok) {
          throw new Error("Download server error.");
        }

        const data = await response.json();

        console.log("Download Public API:", data);

        if (!data.success) {
          throw new Error(
            data.message || "Download data could not be loaded."
          );
        }

        if (Array.isArray(data.data)) {
          setDownloads(data.data);
        } else {
          setDownloads([]);
        }
      } catch (err) {
        console.error("Download fetch error:", err);

        setError(
          "ডাউনলোডের তথ্য লোড করা যাচ্ছে না।"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDownloads();
  }, []);

  /* =====================================================
     GET COURSE NAME
  ===================================================== */

  const getCourseName = (download) => {
    const courseName =
      download?.course_name ||
      download?.course ||
      download?.course_title ||
      download?.courseName;

    if (courseName) {
      return String(courseName).trim();
    }

    /*
      যদি API থেকে course_id আসে কিন্তু course_name না আসে,
      তাহলে আপাতত course_id অনুযায়ী category হবে।
    */

    if (
      download?.course_id !== undefined &&
      download?.course_id !== null &&
      String(download.course_id).trim() !== ""
    ) {
      return `Course ${download.course_id}`;
    }

    return "Other Downloads";
  };

  /* =====================================================
     GET FILE URL
  ===================================================== */

  const getFileUrl = (download) => {
    const target = download?.file_url;

    if (!target) {
      return "";
    }

    if (
      target.startsWith("http://") ||
      target.startsWith("https://")
    ) {
      return target;
    }

    if (target.startsWith("/")) {
      return `${API_ORIGIN}${target}`;
    }

    return `${API_ORIGIN}/${target}`;
  };

  /* =====================================================
     GROUP DOWNLOADS BY COURSE
  ===================================================== */

  const groupedDownloads = useMemo(() => {
    const groups = {};

    downloads.forEach((download) => {
      const courseName = getCourseName(download);

      if (!groups[courseName]) {
        groups[courseName] = [];
      }

      groups[courseName].push(download);
    });

    return groups;
  }, [downloads]);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories = Object.keys(groupedDownloads);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="download">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="download-header">

        <h1>
          ডাউনলোড
        </h1>

        <p>
          প্রয়োজনীয় ফরম, নোটিশ ও শিক্ষামূলক উপকরণ
          এখান থেকে ডাউনলোড করুন।
        </p>

      </section>


      {/* =================================================
          DOWNLOAD CONTENT
      ================================================= */}

      <section className="download-list">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="download-message">
            <span className="download-loading-icon">
              ⏳
            </span>

            <p>
              ডাউনলোড লোড হচ্ছে...
            </p>
          </div>
        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="download-message error">

            <span>
              ⚠️
            </span>

            <p>
              {error}
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          downloads.length === 0 && (

            <div className="download-message">

              <span>
                📂
              </span>

              <p>
                কোনো download পাওয়া যায়নি।
              </p>

            </div>

          )}


        {/* =================================================
            CATEGORY WISE DOWNLOAD
        ================================================= */}

        {!loading &&
          !error &&
          categories.length > 0 && (

            <div className="download-categories">

              {categories.map((category) => {

                const categoryDownloads =
                  groupedDownloads[category];

                return (

                  <section
                    className="download-category"
                    key={category}
                  >

                    {/* =====================================
                        CATEGORY HEADER
                    ===================================== */}

                    <div className="download-category-header">

                      <div className="download-category-icon">
                        📚
                      </div>

                      <div className="download-category-title">

                        <h2>
                          {category}
                        </h2>

                        <p>
                          {categoryDownloads.length}টি
                          resource
                        </p>

                      </div>

                    </div>


                    {/* =====================================
                        DOWNLOAD LIST
                    ===================================== */}

                    <div className="download-category-list">

                      {categoryDownloads.map(
                        (download) => {

                          const href =
                            getFileUrl(download);

                          return (

                            <article
                              className="download-card"
                              key={download.id}
                            >

                              {/* =========================
                                  FILE ICON
                              ========================= */}

                              <div className="download-card-icon">
                                📄
                              </div>


                              {/* =========================
                                  CONTENT
                              ========================= */}

                              <div className="download-card-content">

                                <h2>
                                  {download.title}
                                </h2>

                                <p>
                                  {download.description ||
                                    "Download resource"}
                                </p>

                                {download.file_name && (
                                  <small>
                                    {download.file_name}
                                  </small>
                                )}

                              </div>


                              {/* =========================
                                  DOWNLOAD BUTTON
                              ========================= */}

                              {href && (

                                <a
                                  href={href}
                                  className="download-button"
                                  rel="noreferrer"
                                  download
                                >

                                  <span>
                                    Download
                                  </span>

                                  <span className="download-button-icon">
                                    ↓
                                  </span>

                                </a>

                              )}

                            </article>

                          );
                        }
                      )}

                    </div>

                  </section>

                );
              })}

            </div>

          )}

      </section>

    </div>
  );
}