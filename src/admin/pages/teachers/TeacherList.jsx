import { useEffect, useState } from "react";
import "./TeacherList.css";

const API_BASE_URL = "http://localhost/sunshine-api/api";
const IMAGE_BASE_URL = "http://localhost/sunshine-api/uploads/teachers";

export default function TeacherList({ onEditTeacher }) {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // শিক্ষক তালিকা লোড করা
  const fetchTeachers = (signal) => {
    fetch(`${API_BASE_URL}/teacher_list.php`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setTeachers(data.teachers || []);
        } else {
          setError(data.message || "Teacher information not found.");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Teacher API Error:", err);
          setError("Server-এর সাথে সংযোগ করা যাচ্ছে না।");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTeachers(controller.signal);
    return () => controller.abort();
  }, []);

  // 🗑️ Delete Handler
  const handleDelete = async (teacherId) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ID: ${teacherId} ডিলিট করতে চান?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/teacher_delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: teacherId }),
      });
      const result = await res.json();

      if (result.success) {
        alert("Teacher deleted successfully!");
        setTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
      } else {
        alert(result.message || "Delete failed!");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Server error occurred while deleting.");
    }
  };

  // ✏️ Edit Handler
  const handleEdit = (teacher) => {
    if (onEditTeacher) {
      onEditTeacher(teacher); // মূল পেজ বা মডালে ডাটা পাঠানোর জন্য
    } else {
      alert(`Edit Clicked for: ${teacher.name_en || teacher.name_bn}`);
    }
  };

  // সার্চ ফিল্টারিং
  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchTerm.toLowerCase();
    return (
      (teacher.teacher_id && teacher.teacher_id.toLowerCase().includes(query)) ||
      (teacher.name_en && teacher.name_en.toLowerCase().includes(query)) ||
      (teacher.name_bn && teacher.name_bn.toLowerCase().includes(query)) ||
      (teacher.mobile && teacher.mobile.toLowerCase().includes(query)) ||
      (teacher.course && teacher.course.toLowerCase().includes(query)) ||
      (teacher.branch && teacher.branch.toLowerCase().includes(query))
    );
  });

  return (
    <div className="teacher-container">
      {/* ১. হেডার সেকশন */}
      <div className="teacher-header">
        <div className="header-text">
          <h1>Teacher List</h1>
          <p>নিবন্ধিত শিক্ষকদের তালিকা</p>
        </div>
        <div className="total-badge">Total: {filteredTeachers.length}</div>
      </div>

      {/* ২. সার্চ বার */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by ID, name, mobile, course, designation or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* লোডিং ও এরর স্ট্যাটাস */}
      {loading && <div className="teacher-message">Loading teachers...</div>}
      {error && <div className="teacher-message error">{error}</div>}

      {/* ৩. মূল টেবিল */}
      {!loading && !error && (
        <div className="table-card">
          {filteredTeachers.length === 0 ? (
            <div className="teacher-message">No teachers found.</div>
          ) : (
            <div className="table-responsive">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>ID No</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Designation</th>
                    <th>Branch</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id || teacher.teacher_id}>
                      {/* Photo */}
                      <td>
                        <div className="teacher-photo">
                          {teacher.photo ? (
                            <img
                              src={`${IMAGE_BASE_URL}/${teacher.photo}`}
                              alt={teacher.name_en || "Teacher"}
                              loading="lazy"
                            />
                          ) : (
                            <div className="no-photo">No Photo</div>
                          )}
                        </div>
                      </td>

                      {/* ID No */}
                      <td className="teacher-id">{teacher.teacher_id}</td>

                      {/* Name */}
                      <td>
                        <div className="name-wrapper">
                          <span className="name-en">{teacher.name_en || teacher.name_bn}</span>
                          {teacher.name_bn && teacher.name_en && (
                            <span className="name-bn">{teacher.name_bn}</span>
                          )}
                        </div>
                      </td>

                      {/* Details */}
                      <td>{teacher.course || "N/A"}</td>
                      <td>{teacher.designation || "N/A"}</td>
                      <td>{teacher.branch || "N/A"}</td>
                      <td>{teacher.mobile || "N/A"}</td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-pill ${
                            teacher.status === "Present" || teacher.status === "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {teacher.status || "Present"}
                        </span>
                      </td>

                      {/* Action Buttons (Square Shaped: Details, Edit, Delete) */}
                      <td>
                        <div className="action-buttons">
                          {/* Details Button */}
                          <button className="btn-action btn-details" title="Details">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>

                          {/* Edit Button */}
                          <button
                            className="btn-action btn-edit"
                            title="Edit"
                            onClick={() => handleEdit(teacher)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn-action btn-delete"
                            title="Delete"
                            onClick={() => handleDelete(teacher.teacher_id)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}