import "./Courses.css";
import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("");

  const navigate = useNavigate();

  /* =====================================================
     LOAD COURSES
  ===================================================== */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetching active course list
        const response = await fetch(
          `${API_BASE_URL}/course_list.php`
        );

        if (!response.ok) {
          throw new Error("Server error");
        }

        const result = await response.json();

        console.log("Course List API:", result);

        let courseData = [];

        if (Array.isArray(result)) {
          courseData = result;
        } else if (
          result &&
          Array.isArray(result.data)
        ) {
          courseData = result.data;
        }

        /* =================================================
           ONLY ACTIVE COURSES
        ================================================= */

        const activeCourses = courseData.filter((course) => {
          const status = String(
            course.status ?? ""
          )
            .trim()
            .toLowerCase();

          return (
            status === "active" ||
            status === "1"
          );
        });

        setCourses(activeCourses);

        /* =================================================
           EXTRACT DYNAMIC LANGUAGES FROM DB DATA
        ================================================= */

        const uniqueLanguages = [];

        activeCourses.forEach((course) => {
          const rawLang = String(course.language || "").trim();
          if (rawLang) {
            const normalized = getLanguageName(rawLang);
            if (!uniqueLanguages.includes(normalized)) {
              uniqueLanguages.push(normalized);
            }
          }
        });

        setLanguages(uniqueLanguages);

        // Set the first language as default active language if available
        if (uniqueLanguages.length > 0) {
          setActiveLanguage(uniqueLanguages[0]);
        }

      } catch (err) {
        console.error(
          "Course API Error:",
          err
        );

        setError(
          "কোর্সের তথ্য লোড করা যাচ্ছে না।"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  /* =====================================================
     NORMALIZE LANGUAGE
  ===================================================== */

  const getLanguageName = (language) => {
    const value = String(
      language || ""
    )
      .trim()
      .toLowerCase();

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি")
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
      value.includes("কোরিয়ান")
    ) {
      return "Korean";
    }

    // capitalize first letter if it's another language from database
    if (value.length > 0) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return "Other";
  };


  /* =====================================================
     LANGUAGE ICON
  ===================================================== */

  const getLanguageIcon = (language) => {
    const lang = String(language).toLowerCase();

    if (lang.includes("japanese") || lang.includes("japan")) {
      return "🇯🇵";
    }

    if (lang.includes("german") || lang.includes("germany")) {
      return "🇩🇪";
    }

    if (lang.includes("korean") || lang.includes("korea")) {
      return "🇰🇷";
    }

    if (lang.includes("english") || lang.includes("uk") || lang.includes("usa")) {
      return "🇬🇧";
    }

    if (lang.includes("french") || lang.includes("france")) {
      return "🇫🇷";
    }

    if (lang.includes("chinese") || lang.includes("china")) {
      return "🇨🇳";
    }

    if (lang.includes("arabic")) {
      return "🇸🇦";
    }

    return "🌐";
  };


  /* =====================================================
     LANGUAGE DESCRIPTION
  ===================================================== */

  const getDescription = (language) => {
    const lang = String(language).toLowerCase();

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
      course?.offer_price && Number(course.offer_price) > 0 && Number(course.offer_price) < Number(course.course_fee || 0)
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
     CALCULATE DISCOUNT PERCENTAGE
  ===================================================== */

  const getDiscountPercentage = (mainFee, offerFee) => {
    const main = Number(mainFee);
    const offer = Number(offerFee);

    if (main > 0 && offer > 0 && offer < main) {
      const discount = Math.round(((main - offer) / main) * 100);
      return `${discount}% OFF`;
    }
    return null;
  };


  /* =====================================================
     FILTER COURSES BY SELECTED LANGUAGE
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


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="courses">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="course-header">

        <h1>
          আমাদের কোর্সসমূহ
        </h1>

        <p>
          আন্তর্জাতিক ভাষা শিক্ষার মাধ্যমে
          শিক্ষার্থীদের বিদেশে উচ্চশিক্ষা,
          চাকরি ও যোগাযোগের দক্ষতা বৃদ্ধিতে
          আমরা সহায়তা করি।
        </p>

      </section>


      {/* =================================================
          DYNAMIC LANGUAGE TABS
      ================================================= */}

      {!loading && !error && languages.length > 0 && (
        <div className="course-tabs">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              className={activeLanguage === lang ? "active" : ""}
              onClick={() => setActiveLanguage(lang)}
            >
              <span className="tab-flag">
                {getLanguageIcon(lang)}
              </span>

              <span>
                {lang}
              </span>
            </button>
          ))}
        </div>
      )}


      {/* =================================================
          COURSE AREA
      ================================================= */}

      <section className="course-list">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="course-message">
            কোর্স লোড হচ্ছে...
          </div>
        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="course-message error">
            {error}
          </div>
        )}


        {/* =================================================
            COURSE CONTENT
        ================================================= */}

        {!loading && !error && activeLanguage && (

          <div className="course-card">

            {/* =============================================
                LANGUAGE HEADER
            ============================================= */}

            <div className="course-card-header">

              <div className="course-language-title">

                <span className="course-flag">
                  {getLanguageIcon(
                    activeLanguage
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


            {/* =============================================
                COURSE ITEMS
            ============================================= */}

            <div className="course-items">

              {filteredCourses.length > 0 ? (

                filteredCourses.map(
                  (course) => {
                    const hasOffer = Number(course.offer_price || 0) > 0 && Number(course.offer_price) < Number(course.course_fee || 0);
                    const discountText = hasOffer ? getDiscountPercentage(course.course_fee, course.offer_price) : null;

                    return (
                      <div
                        className={`course-item ${hasOffer ? "has-offer" : ""}`}
                        key={course.id}
                        style={{ position: "relative" }}
                      >

                        {/* OFFER BADGE */}
                        {hasOffer && (
                          <div className="offer-badge" style={badgeStyle}>
                            🏷️ {discountText || "OFFER"}
                          </div>
                        )}

                        {/* =================================
                            COURSE NAME
                        ================================= */}

                        <div className="course-item-name">

                          <h3>
                            {course.course_name ||
                              "Course"}
                          </h3>

                        </div>


                        {/* =================================
                            COURSE DETAILS
                        ================================= */}

                        <div className="course-details">

                          {/* DURATION */}

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


                          {/* COURSE FEE */}

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
                                    <span style={{ textDecoration: "line-through", opacity: 0.7, marginRight: 8 }}>
                                      {formatFee(course.course_fee)}
                                    </span>
                                    {formatFee(course.offer_price)}
                                  </>
                                ) : (
                                  formatFee(course.course_fee)
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>


                        {/* =================================
                            APPLY BUTTON
                        ================================= */}

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


      {/* =================================================
          WHY OUR COURSE
      ================================================= */}

      <section className="why-course">

        <h2>
          কেন আমাদের কোর্স করবেন?
        </h2>

        <p>
          ✔ অভিজ্ঞ প্রশিক্ষক দ্বারা পাঠদান
          <br />

          ✔ নিয়মিত Speaking Practice
          <br />

          ✔ আধুনিক শিক্ষা পদ্ধতি
          <br />

          ✔ পরীক্ষার প্রস্তুতির বিশেষ সহযোগিতা
        </p>

      </section>

    </div>
  );
}

/* =====================================================
   INLINE STYLES FOR OFFER BADGE (or add to Courses.css)
===================================================== */
const badgeStyle = {
  position: "absolute",
  top: "-10px",
  right: "12px",
  backgroundColor: "#e63946",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "bold",
  padding: "4px 10px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
  zIndex: 2,
};