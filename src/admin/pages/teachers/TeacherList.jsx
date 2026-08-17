import { useEffect, useState } from "react";
import "./TeacherList.css";
import PermissionModal from "./PermissionModal";

const API_BASE_URL = "http://localhost/sunshine-api/api";
const IMAGE_BASE_URL =
  "http://localhost/sunshine-api/uploads/teachers";

export default function TeacherList({ onEditTeacher }) {
  // =====================================================
  // TEACHER STATE
  // =====================================================

  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // USER MODAL STATE
  // =====================================================

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Teacher");
  const [userLoading, setUserLoading] = useState(false);

  // =====================================================
  // PERMISSION MODAL STATE
  // =====================================================

  const [permissionTeacher, setPermissionTeacher] =
    useState(null);

  // =====================================================
  // FETCH TEACHERS
  // =====================================================

  const fetchTeachers = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/teacher_list.php`,
        {
          method: "GET",
          signal,
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      if (data.success) {
        setTeachers(data.teachers || []);
      } else {
        setError(
          data.message || "Teacher information not found."
        );
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Teacher API Error:", err);

        setError(
          "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // LOAD TEACHERS
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();

    fetchTeachers(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const handleDelete = async (teacherId) => {
    if (!teacherId) {
      alert("Teacher ID পাওয়া যায়নি।");
      return;
    }

    const confirmed = window.confirm(
      `আপনি কি নিশ্চিতভাবে ID: ${teacherId} ডিলিট করতে চান?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
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

      const result = await response.json();

      if (result.success) {
        alert("Teacher deleted successfully!");

        setTeachers((prev) =>
          prev.filter(
            (teacher) =>
              teacher.teacher_id !== teacherId
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
  // EDIT TEACHER
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
  // OPEN ADD USER MODAL
  // =====================================================

  const openAddUserModal = (teacher) => {
    setSelectedTeacher(teacher);

    setUsername(
      teacher.teacher_id
        ? teacher.teacher_id.toLowerCase()
        : ""
    );

    setPassword("");
    setRole("Teacher");

    setShowUserModal(true);
  };

  // =====================================================
  // CLOSE ADD USER MODAL
  // =====================================================

  const closeUserModal = () => {
    if (userLoading) {
      return;
    }

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

      const response = await fetch(
        `${API_BASE_URL}/user_create.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id:
              selectedTeacher.teacher_id,

            username:
              username.trim(),

            password: password,

            role: role,

            status: "active",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(
          "User account successfully created!"
        );

        // Backend থেকে User ID নেওয়া
        const createdUserId =
          result.user_id ||
          result.admin_id ||
          result.id ||
          null;

        // Local teacher data update
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.teacher_id ===
            selectedTeacher.teacher_id
              ? {
                  ...teacher,

                  user_created: true,

                  user_id:
                    createdUserId ||
                    teacher.user_id ||
                    null,

                  user_status: "active",

                  username:
                    username.trim(),

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
  // OPEN PERMISSION MODAL
  // =====================================================

  const handlePermission = (teacher) => {
    if (!teacher.user_created) {
      alert(
        "প্রথমে এই Teacher-এর User Account তৈরি করুন।"
      );
      return;
    }

    if (!teacher.user_id) {
      alert(
        "এই User-এর ID পাওয়া যাচ্ছে না। Teacher list refresh করুন।"
      );
      return;
    }

    setPermissionTeacher(teacher);
  };

  // =====================================================
  // CLOSE PERMISSION MODAL
  // =====================================================

  const closePermissionModal = () => {
    setPermissionTeacher(null);
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTeachers = teachers.filter(
    (teacher) => {
      const query =
        searchTerm.trim().toLowerCase();

      if (!query) {
        return true;
      }

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

        (teacher.designation &&
          teacher.designation
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

      {/* =================================================
          HEADER
      ================================================= */}

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

      {/* =================================================
          SEARCH
      ================================================= */}

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

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="teacher-message">
          Loading teachers...
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="teacher-message error">
          {error}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

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

                        {/* PHOTO */}

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

                        {/* NAME */}

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

                        {/* COURSE */}

                        <td>
                          {teacher.course || "N/A"}
                        </td>

                        {/* DESIGNATION */}

                        <td>
                          {teacher.designation ||
                            "N/A"}
                        </td>

                        {/* BRANCH */}

                        <td>
                          {teacher.branch || "N/A"}
                        </td>

                        {/* MOBILE */}

                        <td>
                          {teacher.mobile || "N/A"}
                        </td>

                        {/* TEACHER STATUS */}

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
                                {teacher.username ||
                                  "User"}
                              </small>

                            </div>

                          ) : (

                            <button
                              type="button"
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

                        {/* ACTIONS */}

                        <td>

                          <div className="action-buttons">

                            {/* DETAILS */}

                            <button
                              type="button"
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

                            {/* EDIT */}

                            <button
                              type="button"
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

                            {/* PERMISSION */}

                            {teacher.user_created && (
                              <button
                                type="button"
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

                            {/* DELETE */}

                            <button
                              type="button"
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

            {/* HEADER */}

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

            {/* FORM */}

            <form
              onSubmit={handleCreateUser}
              className="user-form"
            >

              {/* TEACHER INFO */}

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
                    {
                      selectedTeacher?.name_en ||
                      selectedTeacher?.name_bn
                    }
                  </strong>

                  <span>
                    ID:{" "}
                    {
                      selectedTeacher?.teacher_id
                    }
                  </span>

                  <span>
                    Branch:{" "}
                    {
                      selectedTeacher?.branch ||
                      "N/A"
                    }
                  </span>

                </div>

              </div>

              {/* USERNAME */}

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

              {/* PASSWORD */}

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

              {/* ROLE */}

              <div className="form-group">

                <label>
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value
                    )
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

              {/* BUTTONS */}

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

      {/* =================================================
          PERMISSION MODAL
      ================================================= */}

      {permissionTeacher && (

        <PermissionModal
          teacher={permissionTeacher}
          onClose={closePermissionModal}
          onSaved={() => {
            console.log(
              "Permissions updated successfully."
            );
          }}
        />

      )}

    </div>
  );
}