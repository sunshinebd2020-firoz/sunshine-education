import "./Courses.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* =========================================
     LOAD COURSES
  ========================================= */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost/sunshine-api/api/course_list.php"
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

        /* =====================================
           ONLY ACTIVE COURSES
        ===================================== */

        const activeCourses = courseData.filter(
          (course) => {
            const status = String(
              course.status ?? ""
            ).toLowerCase();

            return (
              status === "active" ||
              status === "1"
            );
          }
        );

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


  /* =========================================
     LANGUAGE ICON
  ========================================= */

  const getLanguageIcon = (language) => {
    const value = String(
      language || ""
    ).toLowerCase();

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি")
    ) {
      return "🇯🇵";
    }

    if (
      value.includes("german") ||
      value.includes("germany") ||
      value.includes("জার্মান")
    ) {
      return "🇩🇪";
    }

    if (
      value.includes("korean") ||
      value.includes("korea") ||
      value.includes("কোরিয়ান")
    ) {
      return "🇰🇷";
    }

    return "🌐";
  };


  /* =========================================
     LANGUAGE NAME
  ========================================= */

  const getLanguageName = (language) => {
    const value = String(
      language || ""
    ).toLowerCase();

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
      value.includes("কোরিয়ান")
    ) {
      return "Korean";
    }

    return language || "Other";
  };


  /* =========================================
     LANGUAGE DESCRIPTION
  ========================================= */

  const getDescription = (language) => {
    const value = String(
      language || ""
    ).toLowerCase();

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি")
    ) {
      return (
        "জাপানি ভাষা শেখার জন্য বিভিন্ন Level-এর কোর্স। " +
        "উচ্চশিক্ষা, চাকরি ও বিভিন্ন পরীক্ষার প্রস্তুতির জন্য " +
        "বিশেষ সহযোগিতা প্রদান করা হয়।"
      );
    }

    if (
      value.includes("german") ||
      value.includes("germany") ||
      value.includes("জার্মান")
    ) {
      return (
        "জার্মানিতে উচ্চশিক্ষা, চাকরি ও দৈনন্দিন যোগাযোগের জন্য " +
        "প্রয়োজনীয় জার্মান ভাষা শিক্ষা।"
      );
    }

    if (
      value.includes("korean") ||
      value.includes("korea") ||
      value.includes("কোরিয়ান")
    ) {
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


  /* =========================================
     GROUP COURSES BY LANGUAGE
  ========================================= */

  const groupedCourses = courses.reduce(
    (groups, course) => {
      const language = getLanguageName(
        course.language
      );

      if (!groups[language]) {
        groups[language] = [];
      }

      groups[language].push(course);

      return groups;
    },
    {}
  );


  /* =========================================
     LANGUAGE ORDER
  ========================================= */

  const languageOrder = [
    "Japanese",
    "German",
    "Korean",
  ];

  const sortedLanguages = Object.keys(
    groupedCourses
  ).sort((a, b) => {

    const indexA =
      languageOrder.indexOf(a);

    const indexB =
      languageOrder.indexOf(b);

    /* দুটিই Other হলে */
    if (
      indexA === -1 &&
      indexB === -1
    ) {
      return a.localeCompare(b);
    }

    /* A Other হলে */
    if (indexA === -1) {
      return 1;
    }

    /* B Other হলে */
    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  });


  /* =========================================
     APPLY NOW

     Courses
        ↓
     Public Student Entry
        ↓
     Course + Language + Fee
        ↓
     Auto Selected
  ========================================= */

const handleApply = (course) => {
  navigate(
    `/student-entry?course=${encodeURIComponent(
      course.course_name
    )}&language=${encodeURIComponent(
      course.language
    )}&duration=${encodeURIComponent(
      course.duration || ""
    )}&course_fee=${encodeURIComponent(
      course.course_fee || ""
    )}`
  );
};


  /* =========================================
     FORMAT FEE
  ========================================= */

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


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="courses">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

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


      {/* =====================================
          COURSE LIST
      ===================================== */}

      <section className="course-list">

        {/* ===============================
            LOADING
        =============================== */}

        {loading && (
          <div className="course-message">
            কোর্স লোড হচ্ছে...
          </div>
        )}


        {/* ===============================
            ERROR
        =============================== */}

        {!loading && error && (
          <div className="course-message error">
            {error}
          </div>
        )}


        {/* ===============================
            NO COURSE
        =============================== */}

        {!loading &&
          !error &&
          courses.length === 0 && (
            <div className="course-message">
              বর্তমানে কোনো Active কোর্স
              পাওয়া যায়নি।
            </div>
          )}


        {/* =================================
            LANGUAGE CARDS
        ================================= */}

        {!loading &&
          !error &&
          sortedLanguages.map(
            (language) => {

              const languageCourses =
                [...groupedCourses[language]]
                  .sort(
                    (a, b) =>
                      Number(
                        a.sort_order || 0
                      ) -
                      Number(
                        b.sort_order || 0
                      )
                  );

              return (
                <div
                  className="course-card"
                  key={language}
                >

                  {/* =========================
                      LANGUAGE TITLE
                  ========================= */}

                  <h2 className="course-language-title">

                    <span className="course-flag">
                      {getLanguageIcon(
                        language
                      )}
                    </span>

                    {language} Language Course

                  </h2>


                  {/* =========================
                      DESCRIPTION
                  ========================= */}

                  <p className="course-description">
                    {getDescription(
                      language
                    )}
                  </p>


                  {/* =========================
                      COURSE ITEMS
                  ========================= */}

                  <div className="course-items">

                    {languageCourses.map(
                      (course) => (

                        <div
                          className="course-item"
                          key={course.id}
                        >

                          {/* =================
                              COURSE NAME
                          ================= */}

                          <div className="course-item-header">

                            <h3>
                              {course.course_name}
                            </h3>

                          </div>


                          {/* =================
                              DETAILS
                          ================= */}

                          <div className="course-details">

                            {/* Duration */}

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


                            {/* Course Fee */}

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


                          {/* =================
                              APPLY NOW
                          ================= */}

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
                    )}

                  </div>

                </div>
              );
            }
          )}

      </section>


      {/* =====================================
          WHY OUR COURSE
      ===================================== */}

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