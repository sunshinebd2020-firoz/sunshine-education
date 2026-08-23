import { useEffect, useMemo, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import "./Download.css";

export default function Download() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeLanguage, setActiveLanguage] = useState("Japanese");

  /* =====================================================
     LANGUAGE LIST
  ===================================================== */

  const languages = [
    {
      name: "Japanese",
      label: "Japanese",
      flag: "🇯🇵",
    },
    {
      name: "German",
      label: "German",
      flag: "🇩🇪",
    },
    {
      name: "Korean",
      label: "Korean",
      flag: "🇰🇷",
    },
  ];

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
            data.message ||
              "Download data could not be loaded."
          );
        }

        setDownloads(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } catch (err) {
        console.error(
          "Download fetch error:",
          err
        );

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
     NORMALIZE LANGUAGE
  ===================================================== */

  const getLanguageName = (download) => {
    const value = String(
      download?.language ||
        download?.language_name ||
        download?.languageName ||
        ""
    )
      .trim()
      .toLowerCase();

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি") ||
      value.includes("জাপান")
    ) {
      return "Japanese";
    }

    if (
      value.includes("german") ||
      value.includes("germany") ||
      value.includes("জার্মান") ||
      value.includes("জার্মানি")
    ) {
      return "German";
    }

    if (
      value.includes("korean") ||
      value.includes("korea") ||
      value.includes("কোরিয়ান") ||
      value.includes("কোরিয়ান") ||
      value.includes("কোরিয়া") ||
      value.includes("কোরিয়া")
    ) {
      return "Korean";
    }

    return "Other";
  };

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
     FILTER BY LANGUAGE
  ===================================================== */

  const languageDownloads = useMemo(() => {
    return downloads.filter(
      (download) =>
        getLanguageName(download) ===
        activeLanguage
    );
  }, [downloads, activeLanguage]);

  /* =====================================================
     GROUP BY COURSE
  ===================================================== */

  const groupedDownloads = useMemo(() => {
    const groups = {};

    languageDownloads.forEach((download) => {
      const courseName =
        getCourseName(download);

      if (!groups[courseName]) {
        groups[courseName] = [];
      }

      groups[courseName].push(download);
    });

    return groups;
  }, [languageDownloads]);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories =
    Object.keys(groupedDownloads);

  /* =====================================================
     ACTIVE LANGUAGE DATA
  ===================================================== */

  const activeLanguageData =
    languages.find(
      (language) =>
        language.name === activeLanguage
    ) || languages[0];

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
          প্রয়োজনীয় ফরম, নোটিশ ও শিক্ষামূলক
          উপকরণ এখান থেকে ডাউনলোড করুন।
        </p>

      </section>


      {/* =================================================
          LANGUAGE TABS
      ================================================= */}

      <div className="download-language-tabs">

        {languages.map((language) => (

          <button
            type="button"
            key={language.name}
            className={
              activeLanguage ===
              language.name
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveLanguage(
                language.name
              )
            }
          >

            <span className="download-tab-flag">
              {language.flag}
            </span>

            <span>
              {language.label}
            </span>

          </button>

        ))}

      </div>


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
            LANGUAGE HEADER
        ================================================= */}

        {!loading &&
          !error && (

            <div className="download-selected-language">

              <div className="download-selected-language-icon">
                {activeLanguageData.flag}
              </div>

              <div>

                <h2>
                  {activeLanguageData.label}
                  {" "}
                  Downloads
                </h2>

                <p>
                  {languageDownloads.length}টি
                  resource পাওয়া গেছে
                </p>

              </div>

            </div>

          )}


        {/* =================================================
            NO DOWNLOAD
        ================================================= */}

        {!loading &&
          !error &&
          languageDownloads.length === 0 && (

            <div className="download-message">

              <span>
                📂
              </span>

              <p>
                এই ভাষার কোনো download
                বর্তমানে পাওয়া যায়নি।
              </p>

            </div>

          )}


        {/* =================================================
            COURSE CATEGORIES
        ================================================= */}

        {!loading &&
          !error &&
          categories.length > 0 && (

            <div className="download-categories">

              {categories.map(
                (category) => {

                  const categoryDownloads =
                    groupedDownloads[
                      category
                    ];

                  return (

                    <section
                      className="download-category"
                      key={category}
                    >

                      {/* ================================
                          CATEGORY HEADER
                      ================================= */}

                      <div className="download-category-header">

                        <div className="download-category-icon">
                          📚
                        </div>

                        <div className="download-category-title">

                          <h2>
                            {category}
                          </h2>

                          <p>
                            {
                              categoryDownloads.length
                            }
                            টি download
                          </p>

                        </div>

                      </div>


                      {/* ================================
                          DOWNLOAD ITEMS
                      ================================= */}

                      <div className="download-category-list">

                        {categoryDownloads.map(
                          (download) => {

                            const href =
                              getFileUrl(
                                download
                              );

                            return (

                              <article
                                className="download-card"
                                key={download.id}
                              >

                                {/* ==========================
                                    FILE ICON
                                =========================== */}

                                <div className="download-card-icon">
                                  📄
                                </div>


                                {/* ==========================
                                    CONTENT
                                =========================== */}

                                <div className="download-card-content">

                                  <h2>
                                    {
                                      download.title
                                    }
                                  </h2>

                                  <p>
                                    {
                                      download.description ||
                                      "Download resource"
                                    }
                                  </p>

                                  {download.file_name && (
                                    <small>
                                      {
                                        download.file_name
                                      }
                                    </small>
                                  )}

                                </div>


                                {/* ==========================
                                    DOWNLOAD BUTTON
                                =========================== */}

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
                }
              )}

            </div>

          )}

      </section>

    </div>
  );
}