import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiBookOpen,
  FiDownload,
  FiFileText,
  FiInbox,
  FiLoader,
} from "react-icons/fi";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import "./Download.css";

export default function Download() {
  const [downloads, setDownloads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeLanguage, setActiveLanguage] = useState("Japanese");

  /* =====================================================
     LANGUAGE LIST
  ===================================================== */

  const [languages, setLanguages] = useState([]);

  /* =====================================================
     LOAD LANGUAGES FROM DATABASE
  ===================================================== */

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/language_list.php`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Language server error.");
        }

        const data = await response.json();

        const languageList = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        const activeLanguages = languageList.filter(
          (language) =>
            String(language.status || "")
              .trim()
              .toLowerCase() === "active" ||
            String(language.status || "").trim() === "1"
        );

        const mappedLanguages = activeLanguages.map(
          (language) => {
            const languageName =
              language.name ||
              language.language_name ||
              language.language ||
              "";

            const value = String(languageName)
              .trim()
              .toLowerCase();

            let flag = "";

            if (
              value.includes("japanese") ||
              value.includes("japan")
            ) {
              flag = "/flags/jp.svg";
            } else if (
              value.includes("german") ||
              value.includes("germany")
            ) {
              flag = "/flags/de.svg";
            } else if (
              value.includes("korean") ||
              value.includes("korea")
            ) {
              flag = "/flags/kr.svg";
            } else if (
              value.includes("english") ||
              value.includes("england")
            ) {
              flag = "/flags/gb.svg";
            } else if (
              value.includes("french") ||
              value.includes("france")
            ) {
              flag = "/flags/fr.svg";
            } else if (
              value.includes("chinese") ||
              value.includes("china")
            ) {
              flag = "/flags/cn.svg";
            }

            return {
              name: languageName,
              label: languageName,
              flag,
            };
          }
        );

        setLanguages(mappedLanguages);

        if (mappedLanguages.length > 0) {
          setActiveLanguage((current) => {
            const exists = mappedLanguages.some(
              (language) =>
                language.name === current
            );

            return exists
              ? current
              : mappedLanguages[0].name;
          });
        }
      } catch (err) {
        console.error(
          "Language fetch error:",
          err
        );

        setLanguages([]);
      }
    };

    loadLanguages();
  }, []);

  /* =====================================================
     LOAD DOWNLOADS
  ===================================================== */

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        setLoading(true);
        setError("");

        const [downloadResponse, courseResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/download_public.php`),
            fetch(`${API_BASE_URL}/course_list.php`),
          ]);

        if (
          !downloadResponse.ok ||
          !courseResponse.ok
        ) {
          throw new Error("Download server error.");
        }

        const [downloadData, courseData] =
          await Promise.all([
            downloadResponse.json(),
            courseResponse.json(),
          ]);

        if (!downloadData.success) {
          throw new Error(
            downloadData.message ||
              "Download data could not be loaded."
          );
        }

        setDownloads(
          Array.isArray(downloadData.data)
            ? downloadData.data
            : []
        );

        const courseList = Array.isArray(courseData)
          ? courseData
          : Array.isArray(courseData.data)
          ? courseData.data
          : [];

        setCourses(
          courseList.filter(
            (course) =>
              String(course.status || "")
                .trim()
                .toLowerCase() === "active"
          )
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

    if (
      value.includes("english") ||
      value.includes("england") ||
      value.includes("ইংরেজি") ||
      value.includes("ইংলিশ")
    ) {
      return "English";
    }

    if (
      value.includes("french") ||
      value.includes("france") ||
      value.includes("ফ্রেঞ্চ") ||
      value.includes("ফরাসি")
    ) {
      return "French";
    }

    if (
      value.includes("chinese") ||
      value.includes("china") ||
      value.includes("চাইনিজ") ||
      value.includes("চীনা")
    ) {
      return "Chinese";
    }

    return "Other";
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
     FILTER COURSES BY LANGUAGE
  ===================================================== */

  const languageCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        getLanguageName(course) ===
        activeLanguage
    );
  }, [courses, activeLanguage]);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories = useMemo(() => {
    return languageCourses.map((course) => ({
      id: String(course.id),
      name:
        course.course_name ||
        `Course ${course.id}`,
      downloads: languageDownloads.filter(
        (download) =>
          String(download.course_id) ===
          String(course.id)
      ),
    }));
  }, [languageCourses, languageDownloads]);

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
          LANGUAGE TABS
      ================================================= */}

      <div className="download-language-tabs">

        {languages.map((language) => (

          <button
            type="button"
            key={language.name}
            className={
              activeLanguage === language.name
                ? "active"
                : ""
            }
            aria-pressed={
              activeLanguage === language.name
            }
            onClick={() =>
              setActiveLanguage(
                language.name
              )
            }
          >

            <span className="download-tab-flag">

              <img
                src={language.flag}
                alt={`${language.label} flag`}
              />

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

            <FiLoader
              className="download-loading-icon"
              aria-hidden="true"
            />

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

            <FiAlertCircle
              aria-hidden="true"
            />

            <p>
              {error}
            </p>

          </div>

        )}

        {/* =================================================
            LANGUAGE HEADER
        ================================================= */}

        {!loading &&
          !error &&
          activeLanguageData && (

            <div className="download-selected-language">

              <div className="download-selected-language-icon">

                <img
                  src={activeLanguageData.flag}
                  alt={`${activeLanguageData.label} flag`}
                />

              </div>

              <div>

                <h2>
                  {activeLanguageData.label} Downloads
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
          languageCourses.length === 0 && (

            <div className="download-message">

              <FiInbox
                aria-hidden="true"
              />

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

              {categories.map((category) => {

                const categoryDownloads =
                  category.downloads;

                return (

                  <section
                    className="download-category"
                    key={category.id}
                  >

                    {/* ================================
                        CATEGORY HEADER
                    ================================= */}

                    <div className="download-category-header">

                      <div className="download-category-icon">

                        <FiBookOpen
                          aria-hidden="true"
                        />

                      </div>

                      <div className="download-category-title">

                        <h2>
                          {category.name}
                        </h2>

                        <p>
                          {categoryDownloads.length}
                          টি download
                        </p>

                      </div>

                    </div>

                    {/* ================================
                        DOWNLOAD ITEMS
                    ================================= */}

                    <div className="download-category-list">

                      {categoryDownloads.length > 0 ? (

                        categoryDownloads.map(
                          (download) => {

                            const href =
                              getFileUrl(download);

                            return (

                              <article
                                className="download-card"
                                key={`${category.id}-${download.id}`}
                              >

                                {/* ==========================
                                    FILE ICON
                                =========================== */}

                                <div className="download-card-icon">

                                  <FiFileText
                                    aria-hidden="true"
                                  />

                                </div>

                                {/* ==========================
                                    CONTENT
                                =========================== */}

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

                                    <FiDownload
                                      className="download-button-icon"
                                      aria-hidden="true"
                                    />

                                  </a>

                                )}

                              </article>

                            );
                          }
                        )

                      ) : (

                        <div className="download-category-empty">

                          <FiInbox
                            aria-hidden="true"
                          />

                          <span>
                            এই category-তে কোনো
                            download নেই।
                          </span>

                        </div>

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