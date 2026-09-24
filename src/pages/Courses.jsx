import "./Courses.css";
import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

/* =====================================================
   EXTERNAL FLAG SERVICE
   REST COUNTRIES FLAG CDN
===================================================== */

const FLAG_CDN =
  "https://flags.restcountries.com/v5/w160";

/* =====================================================
   LANGUAGE → COUNTRY ISO CODE
===================================================== */

const LANGUAGE_COUNTRY_CODES = {
  japanese: "jp",
  japan: "jp",

  german: "de",
  germany: "de",

  korean: "kr",
  korea: "kr",
  "south korea": "kr",

  english: "gb",
  england: "gb",
  uk: "gb",
  "united kingdom": "gb",

  french: "fr",
  france: "fr",

  chinese: "cn",
  china: "cn",

  arabic: "sa",
  "saudi arabia": "sa",

  spanish: "es",
  spain: "es",

  italian: "it",
  italy: "it",

  russian: "ru",
  russia: "ru",

  turkish: "tr",
  turkey: "tr",

  hindi: "in",
  india: "in",

  bengali: "bd",
  bangla: "bd",
  bangladesh: "bd",

  portuguese: "pt",
  portugal: "pt",

  dutch: "nl",
  netherlands: "nl",

  thai: "th",
  thailand: "th",

  vietnamese: "vn",
  vietnam: "vn",

  indonesian: "id",
  indonesia: "id",

  malay: "my",
  malaysia: "my",

  urdu: "pk",
  pakistan: "pk",

  persian: "ir",
  iran: "ir",

  greek: "gr",
  greece: "gr",

  polish: "pl",
  poland: "pl",

  swedish: "se",
  sweden: "se",

  danish: "dk",
  denmark: "dk",

  norwegian: "no",
  norway: "no",

  finnish: "fi",
  finland: "fi",

  hebrew: "il",
  israel: "il",

  ukrainian: "ua",
  ukraine: "ua",

  romanian: "ro",
  romania: "ro",

  czech: "cz",
  czechia: "cz",

  hungarian: "hu",
  hungary: "hu",

  filipino: "ph",
  philippines: "ph",
};

/* =====================================================
   NORMALIZE LANGUAGE
===================================================== */

const normalizeLanguage = (language) => {
  return String(language || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* =====================================================
     NORMALIZE LANGUAGE NAME
  ===================================================== */

  const getLanguageName = (language) => {
    const value = normalizeLanguage(language);

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি") ||
      value.includes("জাপানিজ")
    ) {
      return "Japanese";
    }

    if (
      value.includes("german") ||
      value.includes("germany") ||
      value.includes("জার্মান")
    ) {
      return "German";
    }

    if (
      value.includes("korean") ||
      value.includes("korea") ||
      value.includes("কোরিয়ান") ||
      value.includes("কোরিয়ান")
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
      value.includes("ফরাসি") ||
      value.includes("ফ্রেঞ্চ")
    ) {
      return "French";
    }

    if (
      value.includes("chinese") ||
      value.includes("china") ||
      value.includes("চীনা") ||
      value.includes("চাইনিজ")
    ) {
      return "Chinese";
    }

    if (
      value.includes("arabic") ||
      value.includes("saudi") ||
      value.includes("আরবি")
    ) {
      return "Arabic";
    }

    if (value.length > 0) {
      return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
      );
    }

    return "Other";
  };

  /* =====================================================
     GET FLAG FROM WEB
  ===================================================== */

  const getLanguageFlag = (language) => {
    const normalized = normalizeLanguage(language);

    const countryCode =
      LANGUAGE_COUNTRY_CODES[normalized];

    if (!countryCode) {
      return "";
    }

    return `${FLAG_CDN}/${countryCode}.png`;
  };

  /* =====================================================
     LOAD COURSES + LANGUAGES
  ===================================================== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        /* =================================================
           LOAD COURSES
        ================================================= */

        const courseResponse = await fetch(
          `${API_BASE_URL}/course_list.php`
        );

        if (!courseResponse.ok) {
          throw new Error(
            "Course server error"
          );
        }

        const courseResult =
          await courseResponse.json();

        console.log(
          "Course List API:",
          courseResult
        );

        let courseData = [];

        if (Array.isArray(courseResult)) {
          courseData = courseResult;
        } else if (
          courseResult &&
          Array.isArray(courseResult.data)
        ) {
          courseData = courseResult.data;
        }

        /* =================================================
           ONLY ACTIVE COURSES
        ================================================= */

        const activeCourses = courseData.filter(
          (course) => {
            const status = String(
              course.status ?? ""
            )
              .trim()
              .toLowerCase();

            return (
              status === "active" ||
              status === "1"
            );
          }
        );

        setCourses(activeCourses);

        /* =================================================
           LOAD LANGUAGES
        ================================================= */

        const languageResponse = await fetch(
          `${API_BASE_URL}/language_list.php`,
          {
            credentials: "include",
          }
        );

        if (!languageResponse.ok) {
          throw new Error(
            "Language server error"
          );
        }

        const languageResult =
          await languageResponse.json();

        console.log(
          "Language List API:",
          languageResult
        );

        let languageData = [];

        if (Array.isArray(languageResult)) {
          languageData = languageResult;
        } else if (
          languageResult &&
          Array.isArray(languageResult.data)
        ) {
          languageData =
            languageResult.data;
        }

        /* =================================================
           ONLY ACTIVE LANGUAGES
        ================================================= */

        const activeLanguages =
          languageData.filter((language) => {
            const status = String(
              language.status ?? ""
            )
              .trim()
              .toLowerCase();

            return (
              status === "active" ||
              status === "1"
            );
          });

        /* =================================================
           UNIQUE LANGUAGES
        ================================================= */

        const uniqueLanguages = [];

        activeLanguages.forEach((language) => {
          const normalized =
            getLanguageName(
              language.name
            );

          if (
            normalized &&
            !uniqueLanguages.includes(
              normalized
            )
          ) {
            uniqueLanguages.push(
              normalized
            );
          }
        });

        setLanguages(uniqueLanguages);

        /* =================================================
           SELECT LANGUAGE FROM URL
        ================================================= */

        const requestedLanguage =
          searchParams.get("language");

        if (
          uniqueLanguages.length > 0
        ) {
          const matchedLanguage =
            requestedLanguage
              ? uniqueLanguages.find(
                  (language) =>
                    getLanguageName(
                      language
                    ) ===
                    getLanguageName(
                      requestedLanguage
                    )
                )
              : null;

          setActiveLanguage(
            matchedLanguage ||
              uniqueLanguages[0]
          );
        } else {
          setActiveLanguage("");
        }

      } catch (err) {
        console.error(
          "Courses API Error:",
          err
        );

        setError(
          "কোর্সের তথ্য লোড করা যাচ্ছে না।"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  /* =====================================================
     LANGUAGE DESCRIPTION
  ===================================================== */

  const getDescription = (language) => {
    const lang = String(
      language
    ).toLowerCase();

    if (lang.includes("japanese")) {
      return (
        "জাপানি ভাষা শেখার জন্য বিভিন্ন Level-এর কোর্স। " +
        "উচ্চশিক্ষা, চাকরি ও বিভিন্ন পরীক্ষার প্রস্তুতির জন্য " +
        "বিশেষ সহযোগিতা প্রদান করা হয়।"
      );
    }

    if (lang.includes("german")) {
      return (
        "জার্মানিতে উচ্চশিক্ষা, চাকরি ও দৈনন্দিন যোগাযোগের জন্য " +
        "প্রয়োজনীয় জার্মান ভাষা শিক্ষা।"
      );
    }

    if (lang.includes("korean")) {
      return (
        "কোরিয়ান ভাষা শেখার মাধ্যমে EPS-TOPIK, TOPIK ও " +
        "অন্যান্য প্রয়োজনীয় পরীক্ষার প্রস্তুতি গ্রহণ করুন।"
      );
    }

    return (
      `${language} ভাষা শিক্ষার মাধ্যমে আপনার ` +
      "আন্তর্জাতিক যোগাযোগের দক্ষতা বৃদ্ধি করুন এবং ক্যারিয়ার সমৃদ্ধ করুন।"
    );
  };

  /* =====================================================
     APPLY NOW
  ===================================================== */

  const handleApply = (course) => {
    const effectiveFee = Number(
      course?.offer_price &&
        Number(course.offer_price) > 0 &&
        Number(course.offer_price) <
          Number(course.course_fee || 0)
        ? course.offer_price
        : course.course_fee || 0
    );

    navigate(
      `/student-entry?course=${encodeURIComponent(
        course.course_name || ""
      )}&language=${encodeURIComponent(
        course.language || ""
      )}&duration=${encodeURIComponent(
        course.duration || ""
      )}&course_fee=${encodeURIComponent(
        String(effectiveFee)
      )}`
    );
  };

  /* =====================================================
     FORMAT FEE
  ===================================================== */

  const formatFee = (fee) => {
    if (
      fee === null ||
      fee === undefined ||
      fee === ""
    ) {
      return "N/A";
    }

    const number = Number(fee);

    if (Number.isNaN(number)) {
      return fee;
    }

    return `৳ ${number.toLocaleString()}`;
  };

  /* =====================================================
     DISCOUNT
  ===================================================== */

  const getDiscountPercentage = (
    mainFee,
    offerFee
  ) => {
    const main = Number(mainFee);
    const offer = Number(offerFee);

    if (
      main > 0 &&
      offer > 0 &&
      offer < main
    ) {
      const discount = Math.round(
        ((main - offer) / main) * 100
      );

      return `${discount}% OFF`;
    }

    return null;
  };

  /* =====================================================
     FILTER COURSES
  ===================================================== */

  const filteredCourses = courses
    .filter(
      (course) =>
        getLanguageName(
          course.language
        ) === activeLanguage
    )
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) -
        Number(b.sort_order || 0)
    );

  const activeLanguageFlag =
    getLanguageFlag(activeLanguage);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="courses">

      {/* =================================================
          LANGUAGE TABS
      ================================================= */}

      {!loading &&
        !error &&
        languages.length > 0 && (
          <div className="course-tabs">

            {languages.map((lang) => {
              const flag =
                getLanguageFlag(lang);

              return (
                <button
                  key={lang}
                  type="button"
                  className={
                    activeLanguage === lang
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveLanguage(lang)
                  }
                >

                  <span className="tab-flag">

                    {flag ? (
                      <img
                        src={flag}
                        alt={`${lang} flag`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      "🌐"
                    )}

                  </span>

                  <span>
                    {lang}
                  </span>

                </button>
              );
            })}

          </div>
        )}

      {/* =================================================
          COURSE AREA
      ================================================= */}

      <section className="course-list">

        {/* LOADING */}

        {loading && (
          <div className="course-message">
            কোর্স লোড হচ্ছে...
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="course-message error">
            {error}
          </div>
        )}

        {/* COURSE CONTENT */}

        {!loading &&
          !error &&
          activeLanguage && (

            <div className="course-card">

              {/* LANGUAGE HEADER */}

              <div className="course-card-header">

                <div className="course-language-title">

                  <span className="course-flag">

                    {activeLanguageFlag ? (
                      <img
                        src={activeLanguageFlag}
                        alt={`${activeLanguage} flag`}
                        loading="lazy"
                      />
                    ) : (
                      "🌐"
                    )}

                  </span>

                  <div>

                    <h2>
                      {activeLanguage} Language Course
                    </h2>

                    <p>
                      {getDescription(
                        activeLanguage
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* COURSE ITEMS */}

              <div className="course-items">

                {filteredCourses.length > 0 ? (

                  filteredCourses.map(
                    (course) => {

                      const hasOffer =
                        Number(
                          course.offer_price || 0
                        ) > 0 &&
                        Number(
                          course.offer_price
                        ) <
                          Number(
                            course.course_fee || 0
                          );

                      const discountText =
                        hasOffer
                          ? getDiscountPercentage(
                              course.course_fee,
                              course.offer_price
                            )
                          : null;

                      return (
                        <div
                          className={`course-item ${
                            hasOffer
                              ? "has-offer"
                              : ""
                          }`}
                          key={course.id}
                        >

                          {/* COURSE NAME */}

                          <div className="course-item-name">

                            <h3>

                              <span className="course-name-text">
                                {course.course_name ||
                                  "Course"}
                              </span>

                              {hasOffer && (
                                <span className="offer-badge">
                                  🏷️{" "}
                                  {discountText ||
                                    "OFFER"}
                                </span>
                              )}

                            </h3>

                          </div>

                          {/* COURSE DETAILS */}

                          <div className="course-details">

                            <div className="course-detail">

                              <span className="detail-icon">
                                ⏱
                              </span>

                              <div>

                                <small>
                                  Duration
                                </small>

                                <strong>
                                  {course.duration ||
                                    "N/A"}
                                </strong>

                              </div>

                            </div>

                            <div className="course-detail">

                              <span className="detail-icon">
                                ৳
                              </span>

                              <div>

                                <small>
                                  Course Fee
                                </small>

                                <strong>

                                  {hasOffer ? (
                                    <>

                                      <span
                                        style={{
                                          textDecoration:
                                            "line-through",
                                          opacity: 0.7,
                                          marginRight: 8,
                                        }}
                                      >
                                        {formatFee(
                                          course.course_fee
                                        )}
                                      </span>

                                      {formatFee(
                                        course.offer_price
                                      )}

                                    </>
                                  ) : (
                                    formatFee(
                                      course.course_fee
                                    )
                                  )}

                                </strong>

                              </div>

                            </div>

                          </div>

                          {/* APPLY BUTTON */}

                          <button
                            type="button"
                            className="apply-course-btn"
                            onClick={() =>
                              handleApply(
                                course
                              )
                            }
                          >

                            <span>
                              Apply Now
                            </span>

                            <span>
                              →
                            </span>

                          </button>

                        </div>
                      );
                    }
                  )

                ) : (

                  <div className="course-message">
                    এই ভাষার কোনো Active course
                    বর্তমানে পাওয়া যায়নি।
                  </div>

                )}

              </div>

            </div>
          )}

      </section>

    </div>
  );
}