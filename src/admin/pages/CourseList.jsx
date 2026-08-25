import "./CourseList.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageName, setLanguageName] = useState("");

  const navigate = useNavigate();

  const getEffectiveCoursePrice = (course) => {
    const mainPrice = Number(course?.course_fee ?? 0);
    const offerPrice = Number(course?.offer_price ?? 0);

    if (Number.isFinite(offerPrice) && offerPrice > 0 && offerPrice < mainPrice) {
      return offerPrice;
    }

    return mainPrice;
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/course_list.php`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
      } else {
        setMessage(data.message || "Course load failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddLanguage = async () => {
    const trimmed = languageName.trim();

    if (!trimmed) {
      setMessage("Language name is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/language_add.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await response.json();

      if (data.success) {
        setShowLanguageModal(false);
        setLanguageName("");
        setMessage(data.message || "Language added successfully.");
      } else {
        setMessage(data.message || "Language could not be added.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("আপনি কি এই course টি delete করতে চান?");

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/course_delete.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "Course deleted successfully.");
        fetchCourses();
      } else {
        setMessage(data.message || "Course delete failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    }
  };

  const filteredCourses = courses.filter((course) =>
    `${course.language} ${course.course_name} ${course.description} ${course.duration} ${course.course_fee} ${course.offer_price ?? ""} ${course.effective_price ?? course.course_fee} ${course.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="course-list">
      <div className="course-list-header">
        <div>
          <h1>Course List</h1>
          <p>সকল কোর্সের তালিকা</p>
        </div>

        <div className="course-list-actions">
          <button type="button" className="admin-list-add-button secondary" onClick={() => setShowLanguageModal(true)}>
            + Add Language
          </button>

          <button type="button" className="admin-list-add-button" onClick={() => navigate("/admin/AddCourse")}>
            + Add Course
          </button>
        </div>

        <div className="course-total">Total: {courses.length}</div>
      </div>

      <div className="course-search">
        <input
          type="text"
          placeholder="Search by language, course name, duration or fee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <div className="course-message">{message}</div>}

      {showLanguageModal && (
        <div className="language-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="language-modal" style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", width: "min(420px, 90vw)" }}>
            <h3 style={{ marginTop: 0 }}>Add Language</h3>
            <input
              type="text"
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              placeholder="Enter language name"
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", border: "1px solid #dfe5ef", borderRadius: "8px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="cancel-course-btn" onClick={() => setShowLanguageModal(false)}>
                Cancel
              </button>
              <button type="button" className="save-course-btn" onClick={handleAddLanguage}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="course-loading">Loading courses...</div>
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
                filteredCourses.map((course, index) => {
                  const effectivePrice = getEffectiveCoursePrice(course);
                  const hasOffer = Number(course?.offer_price ?? 0) > 0 && Number(course.offer_price) < Number(course.course_fee || 0);

                  return (
                    <tr key={course.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="language-badge">{course.language}</span>
                      </td>

                      <td>
                        <strong>{course.course_name}</strong>
                      </td>

                      <td>{course.description || "-"}</td>

                      <td>{course.duration || "-"}</td>

                      <td>
                        {hasOffer ? (
                          <>
                            <div><s>৳ {Number(course.course_fee || 0).toLocaleString()}</s></div>
                            <strong>৳ {Number(effectivePrice).toLocaleString()}</strong>
                          </>
                        ) : (
                          <>৳ {Number(course.course_fee || 0).toLocaleString()}</>
                        )}
                      </td>

                      <td>
                        <span className={course.status === "Active" ? "status-active" : "status-inactive"}>
                          {course.status}
                        </span>
                      </td>

                      <td>{course.sort_order}</td>

                      <td>
                        <div className="course-actions">
                          <button className="edit-btn" onClick={() => navigate("/admin/EditCourse", { state: { course } })}>
                            Edit
                          </button>

                          <button className="delete-btn" onClick={() => handleDelete(course.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-course">
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