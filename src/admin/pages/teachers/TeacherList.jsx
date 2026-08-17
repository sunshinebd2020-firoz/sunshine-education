import { useEffect, useState } from "react";
import "./TeacherList.css";

const API_BASE_URL = "http://localhost/sunshine-api/api";
const IMAGE_BASE_URL = "http://localhost/sunshine-api/uploads/teachers";

export default function TeacherList({ onEditTeacher }) {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Teacher");
  const [userLoading, setUserLoading] = useState(false);

  // =====================================================
  // Teacher List
  // =====================================================

  const fetchTeachers = (signal) => {
    setLoading(true);

    fetch(`${API_BASE_URL}/teacher_list.php`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setTeachers(data.teachers || []);
          setError("");
        } else {
          setError(
            data.message || "Teacher information not found."
          );
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Teacher API Error:", err);
          setError(
            "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
          );
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchTeachers(controller.signal);

    return () => controller.abort();
  }, []);

  // =====================================================
  // Delete
  // =====================================================

  const handleDelete = async (teacherId) => {
    if (
      !window.confirm(
        `আপনি কি নিশ্চিতভাবে ID: ${teacherId} ডিলিট করতে চান?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/teacher_delete.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id: teacherId,
          }),
        }
      );

      const result = await res.json();

      if (result.success) {
        alert("Teacher deleted successfully!");

        setTeachers((prev) =>
          prev.filter(
            (t) => t.teacher_id !== teacherId
          )
        );
      } else {
        alert(
          result.message || "Delete failed!"
        );
      }
    } catch (err) {
      console.error("Delete Error:", err);

      alert(
        "Server error occurred while deleting."
      );
    }
  };

  // =====================================================
  // Edit
  // =====================================================

  const handleEdit = (teacher) => {
    if (onEditTeacher) {
      onEditTeacher(teacher);
    } else {
      alert(
        `Edit Clicked for: ${
          teacher.name_en || teacher.name_bn
        }`
      );
    }
  };

  // =====================================================
  // ADD USER MODAL
  // =====================================================

  const openAddUserModal = (teacher) => {
    setSelectedTeacher(teacher);

    // Default username
    setUsername(
      teacher.teacher_id
        ? teacher.teacher_id.toLowerCase()
        : ""
    );

    setPassword("");
    setRole("Teacher");

    setShowUserModal(true);
  };

  const closeUserModal = () => {
    if (userLoading) return;

    setShowUserModal(false);
    setSelectedTeacher(null);
    setUsername("");
    setPassword("");
    setRole("Teacher");
  };

  // =====================================================
  // CREATE USER
  // =====================================================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!selectedTeacher) {
      alert("Teacher নির্বাচন করা হয়নি।");
      return;
    }

    if (!username.trim()) {
      alert("Username দিন।");
      return;
    }

    if (!password.trim()) {
      alert("Password দিন।");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password কমপক্ষে 6 characters হতে হবে।"
      );
      return;
    }

    try {
      setUserLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/user_create.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id:
              selectedTeacher.teacher_id,

            username: username.trim(),

            password: password,

            role: role,

            status: "active",
          }),
        }
      );

      const result = await res.json();

      if (result.success) {
        alert(
          "User account successfully created!"
        );

        /*
         * Teacher list-এর local data update
         *
         * Backend থেকে user_created পাঠালে
         * সেটি true হবে।
         */

        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.teacher_id ===
            selectedTeacher.teacher_id
              ? {
                  ...teacher,
                  user_created: true,
                  user_status: "active",
                  username: username.trim(),
                  role: role,
                }
              : teacher
          )
        );

        closeUserModal();
      } else {
        alert(
          result.message ||
            "User account তৈরি করা যায়নি।"
        );
      }
    } catch (err) {
      console.error(
        "Create User Error:",
        err
      );

      alert(
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
      );
    } finally {
      setUserLoading(false);
    }
  };

  // =====================================================
  // PERMISSION
  // =====================================================

  const handlePermission = (teacher) => {
    /*
     * এখন শুধু placeholder।
     *
     * পরবর্তী ধাপে এখানে Permission Modal
     * তৈরি করব।
     */

    alert(
      `Permission সেট করার জন্য:\n\n${
        teacher.name_en ||
        teacher.name_bn
      }\n\nএই অংশে পরবর্তী ধাপে View / Add / Edit / Delete permission যোগ করা হবে।`
    );
  };

  // =====================================================
  // Search
  // =====================================================

  const filteredTeachers = teachers.filter(
    (teacher) => {
      const query =
        searchTerm.toLowerCase();

      return (
        (teacher.teacher_id &&
          teacher.teacher_id
            .toLowerCase()
            .includes(query)) ||

        (teacher.name_en &&
          teacher.name_en
            .toLowerCase()
            .includes(query)) ||

        (teacher.name_bn &&
          teacher.name_bn
            .toLowerCase()
            .includes(query)) ||

        (teacher.mobile &&
          teacher.mobile
            .toLowerCase()
            .includes(query)) ||

        (teacher.course &&
          teacher.course
            .toLowerCase()
            .includes(query)) ||

        (teacher.branch &&
          teacher.branch
            .toLowerCase()
            .includes(query))
      );
    }
  );

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="teacher-container">

      {/* Header */}
      <div className="teacher-header">

        <div className="header-text">

          <h1>Teacher List</h1>

          <p>
            নিবন্ধিত শিক্ষকদের তালিকা
          </p>

        </div>

        <div className="total-badge">
          Total: {filteredTeachers.length}
        </div>

      </div>

      {/* Search */}
      <div className="search-section">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course, designation or branch..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="search-input"
        />

      </div>

      {/* Loading */}
      {loading && (
        <div className="teacher-message">
          Loading teachers...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="teacher-message error">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="table-card">

          {filteredTeachers.length === 0 ? (

            <div className="teacher-message">
              No teachers found.
            </div>

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

                    <th>User</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTeachers.map(
                    (teacher) => (

                      <tr
                        key={
                          teacher.id ||
                          teacher.teacher_id
                        }
                      >

                        {/* Photo */}
                        <td>

                          <div className="teacher-photo">

                            {teacher.photo ? (

                              <img
                                src={`${IMAGE_BASE_URL}/${teacher.photo}`}
                                alt={
                                  teacher.name_en ||
                                  "Teacher"
                                }
                                loading="lazy"
                              />

                            ) : (

                              <div className="no-photo">
                                No Photo
                              </div>

                            )}

                          </div>

                        </td>

                        {/* ID */}
                        <td className="teacher-id">
                          {teacher.teacher_id}
                        </td>

                        {/* Name */}
                        <td>

                          <div className="name-wrapper">

                            <span className="name-en">
                              {teacher.name_en ||
                                teacher.name_bn}
                            </span>

                            {teacher.name_bn &&
                              teacher.name_en && (

                                <span className="name-bn">
                                  {teacher.name_bn}
                                </span>

                              )}

                          </div>

                        </td>

                        {/* Details */}
                        <td>
                          {teacher.course ||
                            "N/A"}
                        </td>

                        <td>
                          {teacher.designation ||
                            "N/A"}
                        </td>

                        <td>
                          {teacher.branch ||
                            "N/A"}
                        </td>

                        <td>
                          {teacher.mobile ||
                            "N/A"}
                        </td>

                        {/* Teacher Status */}
                        <td>

                          <span
                            className={`status-pill ${
                              teacher.status ===
                                "Present" ||
                              teacher.status ===
                                "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {teacher.status ||
                              "Present"}
                          </span>

                        </td>

                        {/* USER STATUS */}
                        <td>

                          {teacher.user_created ? (

                            <div className="user-status-wrapper">

                              <span className="user-active-badge">
                                ✓ Active
                              </span>

                              <small>
                                {teacher.username}
                              </small>

                            </div>

                          ) : (

                            <button
                              className="btn-add-user"
                              title="Create User Account"
                              onClick={() =>
                                openAddUserModal(
                                  teacher
                                )
                              }
                            >
                              👤 Add User
                            </button>

                          )}

                        </td>

                        {/* Actions */}
                        <td>

                          <div className="action-buttons">

                            {/* Details */}
                            <button
                              className="btn-action btn-details"
                              title="Details"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >

                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                                <circle
                                  cx="12"
                                  cy="12"
                                  r="3"
                                />

                              </svg>

                            </button>

                            {/* Edit */}
                            <button
                              className="btn-action btn-edit"
                              title="Edit"
                              onClick={() =>
                                handleEdit(
                                  teacher
                                )
                              }
                            >

                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >

                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />

                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />

                              </svg>

                            </button>

                            {/* Permission */}
                            {teacher.user_created && (

                              <button
                                className="btn-action btn-permission"
                                title="Permissions"
                                onClick={() =>
                                  handlePermission(
                                    teacher
                                  )
                                }
                              >
                                🔐
                              </button>

                            )}

                            {/* Delete */}
                            <button
                              className="btn-action btn-delete"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  teacher.teacher_id
                                )
                              }
                            >

                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >

                                <polyline points="3 6 5 6 21 6" />

                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />

                              </svg>

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}

      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {showUserModal && (
        <div
          className="user-modal-overlay"
          onClick={closeUserModal}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="user-modal-header">

              <div>

                <h2>
                  Create User Account
                </h2>

                <p>
                  Teacher-এর জন্য login account তৈরি করুন
                </p>

              </div>

              <button
                type="button"
                className="user-modal-close"
                onClick={closeUserModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleCreateUser}
              className="user-form"
            >

              {/* Teacher */}
              <div className="user-teacher-info">

                <div className="user-teacher-photo">

                  {selectedTeacher?.photo ? (

                    <img
                      src={`${IMAGE_BASE_URL}/${selectedTeacher.photo}`}
                      alt="Teacher"
                    />

                  ) : (

                    <div>
                      No Photo
                    </div>

                  )}

                </div>

                <div>

                  <strong>
                    {selectedTeacher?.name_en ||
                      selectedTeacher?.name_bn}
                  </strong>

                  <span>
                    ID:{" "}
                    {selectedTeacher?.teacher_id}
                  </span>

                  <span>
                    Branch:{" "}
                    {selectedTeacher?.branch ||
                      "N/A"}
                  </span>

                </div>

              </div>

              {/* Username */}
              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                />

              </div>

              {/* Password */}
              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />

              </div>

              {/* Role */}
              <div className="form-group">

                <label>
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >

                  <option value="Teacher">
                    Teacher
                  </option>

                  <option value="Accountant">
                    Accountant
                  </option>

                  <option value="Manager">
                    Manager
                  </option>

                  <option value="Viewer">
                    Viewer
                  </option>

                </select>

              </div>

              {/* Buttons */}
              <div className="user-form-actions">

                <button
                  type="button"
                  className="user-cancel-btn"
                  onClick={closeUserModal}
                  disabled={userLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="user-create-btn"
                  disabled={userLoading}
                >
                  {userLoading
                    ? "Creating..."
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}