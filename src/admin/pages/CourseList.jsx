import "./CourseList.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =====================================================
   WEB FLAG CDN
===================================================== */

const FLAG_CDN =
  "https://flags.restcountries.com/v5/w160";

/* =====================================================
   NORMALIZE TEXT
===================================================== */

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

/* =====================================================
   LANGUAGE → COUNTRY CODE
   Used for flags
===================================================== */

const LANGUAGE_COUNTRY_CODES = {
  japanese: "jp",
  german: "de",
  korean: "kr",
  english: "gb",
  french: "fr",
  chinese: "cn",
  arabic: "sa",
  spanish: "es",
  italian: "it",
  portuguese: "pt",
  russian: "ru",
  turkish: "tr",
  hindi: "in",
  bengali: "bd",
  bangla: "bd",
  urdu: "pk",
  persian: "ir",
  dutch: "nl",
  thai: "th",
  vietnamese: "vn",
  indonesian: "id",
  malay: "my",
  greek: "gr",
  polish: "pl",
  swedish: "se",
  danish: "dk",
  norwegian: "no",
  finnish: "fi",
  hebrew: "il",
  ukrainian: "ua",
  romanian: "ro",
  czech: "cz",
  hungarian: "hu",
  filipino: "ph",
};

/* =====================================================
   LANGUAGE FLAG
===================================================== */

const getLanguageFlag = (language) => {
  const value = normalizeText(language);

  const code =
    LANGUAGE_COUNTRY_CODES[value];

  if (!code) {
    return "";
  }

  return `${FLAG_CDN}/${code}.png`;
};

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* =====================================================
     EFFECTIVE COURSE PRICE
  ===================================================== */

  const getEffectiveCoursePrice = (course) => {
    const mainPrice = Number(
      course?.course_fee ?? 0
    );

    const offerPrice = Number(
      course?.offer_price ?? 0
    );

    if (
      Number.isFinite(offerPrice) &&
      offerPrice > 0 &&
      offerPrice < mainPrice
    ) {
      return offerPrice;
    }

    return mainPrice;
  };

  /* =====================================================
     FETCH COURSES
  ===================================================== */

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/course_list.php`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setCourses(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } else {
        setMessage(
          data.message ||
            "Course load failed"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Server connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchCourses();
  }, []);

  /* =====================================================
     DELETE COURSE
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "আপনি কি এই course টি delete করতে চান?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/course_delete.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        setMessage(
          data.message ||
            "Course deleted successfully."
        );

        fetchCourses();
      } else {
        setMessage(
          data.message ||
            "Course delete failed."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Server connection failed."
      );
    }
  };

  /* =====================================================
     FILTER COURSES
  ===================================================== */

  const filteredCourses =
    courses.filter((course) =>
      `
      ${course.language}
      ${course.course_name}
      ${course.description}
      ${course.duration}
      ${course.course_fee}
      ${course.offer_price ?? ""}
      ${course.effective_price ?? course.course_fee}
      ${course.status}
      `
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="course-list">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="course-list-header">

        <div>
          <h1>Course List</h1>

          <p>
            সকল কোর্সের তালিকা
          </p>
        </div>

        <div className="course-list-actions">
          <button
            type="button"
            className="admin-list-add-button"
            onClick={() =>
              navigate(
                "/admin/AddCourse"
              )
            }
          >
            + Add Course
          </button>

        </div>

        <div className="course-total">
          Total: {courses.length}
        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="course-search">

        <input
          type="text"
          placeholder="Search by language, course name, duration or fee..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="course-message">
          {message}
        </div>
      )}

      {/* =================================================
          COURSE TABLE
      ================================================= */}

      {loading ? (

        <div className="course-loading">
          Loading courses...
        </div>

      ) : (

        <div className="course-table-wrapper">

          <table className="course-table">

            <thead>

              <tr>
                <th>SL</th>
                <th>Language</th>
                <th>Course Name</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Course Fee</th>
                <th>Status</th>
                <th>Sort Order</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredCourses.length > 0 ? (

                filteredCourses.map(
                  (course, index) => {

                    const effectivePrice =
                      getEffectiveCoursePrice(
                        course
                      );

                    const hasOffer =
                      Number(
                        course?.offer_price ??
                          0
                      ) > 0 &&
                      Number(
                        course.offer_price
                      ) <
                        Number(
                          course.course_fee ||
                            0
                        );

                    const courseFlag =
                      getLanguageFlag(
                        course.language
                      );

                    return (

                      <tr
                        key={
                          course.id
                        }
                      >

                        {/* SL */}

                        <td>
                          {index + 1}
                        </td>

                        {/* LANGUAGE */}

                        <td>

                          <span
                            className="language-badge"
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap:
                                "8px",
                            }}
                          >

                            {courseFlag ? (

                              <img
                                src={
                                  courseFlag
                                }
                                alt={`${course.language} flag`}
                                loading="lazy"
                                style={{
                                  width:
                                    "28px",
                                  height:
                                    "19px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "3px",
                                }}
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            ) : (

                              <span>
                                🌐
                              </span>

                            )}

                            <span>
                              {
                                course.language
                              }
                            </span>

                          </span>

                        </td>

                        {/* COURSE NAME */}

                        <td>

                          <strong>
                            {
                              course.course_name
                            }
                          </strong>

                        </td>

                        {/* DESCRIPTION */}

                        <td>
                          {
                            course.description ||
                            "-"
                          }
                        </td>

                        {/* DURATION */}

                        <td>
                          {
                            course.duration ||
                            "-"
                          }
                        </td>

                        {/* COURSE FEE */}

                        <td>

                          {hasOffer ? (

                            <>

                              <div>
                                <s>
                                  ৳{" "}
                                  {Number(
                                    course.course_fee ||
                                      0
                                  ).toLocaleString()}
                                </s>
                              </div>

                              <strong>
                                ৳{" "}
                                {Number(
                                  effectivePrice
                                ).toLocaleString()}
                              </strong>

                            </>

                          ) : (

                            <>
                              ৳{" "}
                              {Number(
                                course.course_fee ||
                                  0
                              ).toLocaleString()}
                            </>

                          )}

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              course.status ===
                              "Active"
                                ? "status-active"
                                : "status-inactive"
                            }
                          >
                            {
                              course.status
                            }
                          </span>

                        </td>

                        {/* SORT ORDER */}

                        <td>
                          {
                            course.sort_order
                          }
                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="course-actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                navigate(
                                  "/admin/EditCourse",
                                  {
                                    state: {
                                      course,
                                    },
                                  }
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  course.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="no-course"
                  >
                    No courses found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}