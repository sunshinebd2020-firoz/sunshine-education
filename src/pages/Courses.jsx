import "./Courses.css";
import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("Japanese");

  const navigate = useNavigate();

  /* =====================================================
     LOAD COURSES
  ===================================================== */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        // This is a public endpoint. Sending credentials here makes browsers
        // reject the API response when the backend allows cross-origin access
        // with `Access-Control-Allow-Origin: *`.
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
      value.includes("কোরিয়ান") ||
      value.includes("কোরিয়ান")
    ) {
      return "Korean";
    }

    return "Other";
  };


  /* =====================================================
     LANGUAGE ICON
  ===================================================== */

  const getLanguageIcon = (language) => {
    if (language === "Japanese") {
      return "🇯🇵";
    }

    if (language === "German") {
      return "🇩🇪";
    }

    if (language === "Korean") {
      return "🇰🇷";
    }

    return "🌐";
  };


  /* =====================================================
     LANGUAGE DESCRIPTION
  ===================================================== */

  const getDescription = (language) => {
    if (language === "Japanese") {
      return (
        "জাপানি ভাষা শেখার জন্য বিভিন্ন Level-এর কোর্স। " +
        "উচ্চশিক্ষা, চাকরি ও বিভিন্ন পরীক্ষার প্রস্তুতির জন্য " +
        "বিশেষ সহযোগিতা প্রদান করা হয়।"
      );
    }

    if (language === "German") {
      return (
        "জার্মানিতে উচ্চশিক্ষা, চাকরি ও দৈনন্দিন যোগাযোগের জন্য " +
        "প্রয়োজনীয় জার্মান ভাষা শিক্ষা।"
      );
    }

    if (language === "Korean") {
      return (
        "কোরিয়ান ভাষা শেখার মাধ্যমে EPS-TOPIK, TOPIK ও " +
        "অন্যান্য প্রয়োজনীয় পরীক্ষার প্রস্তুতি গ্রহণ করুন।"
      );
    }

    return (
      "আন্তর্জাতিক ভাষা শিক্ষার মাধ্যমে আপনার " +
      "ভাষাগত দক্ষতা বৃদ্ধি করুন।"
    );
  };


  /* =====================================================
     APPLY NOW
  ===================================================== */

  const handleApply = (course) => {
    navigate(
      `/student-entry?course=${encodeURIComponent(
        course.course_name || ""
      )}&language=${encodeURIComponent(
        course.language || ""
      )}&duration=${encodeURIComponent(
        course.duration || ""
      )}&course_fee=${encodeURIComponent(
        course.course_fee || ""
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
          আমরা সহায়তা করি।
        </p>

      </section>


      {/* =================================================
          LANGUAGE TABS
      ================================================= */}

      <div className="course-tabs">

        <button
          type="button"
          className={
            activeLanguage === "Japanese"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveLanguage("Japanese")
          }
        >
          <span className="tab-flag">
            🇯🇵
          </span>

          <span>
            Japanese
          </span>
        </button>


        <button
          type="button"
          className={
            activeLanguage === "German"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveLanguage("German")
          }
        >
          <span className="tab-flag">
            🇩🇪
          </span>

          <span>
            German
          </span>
        </button>


        <button
          type="button"
          className={
            activeLanguage === "Korean"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveLanguage("Korean")
          }
        >
          <span className="tab-flag">
            🇰🇷
          </span>

          <span>
            Korean
          </span>
        </button>

      </div>


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

        {!loading && !error && (

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
                  (course) => (

                    <div
                      className="course-item"
                      key={course.id}
                    >

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
                              {formatFee(
                                course.course_fee
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

                  )
                )

              ) : (

                <div className="course-message">
                  এই ভাষার কোনো Active course
                  বর্তমানে পাওয়া যায়নি।
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

          ✔ নিয়মিত Speaking Practice
          <br />

          ✔ আধুনিক শিক্ষা পদ্ধতি
          <br />

          ✔ পরীক্ষার প্রস্তুতির বিশেষ সহযোগিতা
        </p>

      </section>

    </div>
  );
}
