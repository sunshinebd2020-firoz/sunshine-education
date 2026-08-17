import { useEffect, useState } from "react";
import "./TeacherList.css";
import PermissionModal from "./PermissionModal";

// =====================================================
// API URL
// =====================================================

const API_BASE_URL =
  "http://localhost/sunshine-api/api";

const IMAGE_BASE_URL =
  "http://localhost/sunshine-api/uploads/teachers";

// =====================================================
// COMPONENT
// =====================================================

export default function TeacherList({ onEditTeacher }) {

  // =====================================================
  // TEACHER STATE
  // =====================================================

  const [teachers, setTeachers] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // USER MODAL STATE
  // =====================================================

  const [showUserModal, setShowUserModal] =
    useState(false);

  const [selectedTeacher, setSelectedTeacher] =
    useState(null);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("Teacher");

  const [userLoading, setUserLoading] =
    useState(false);

  // =====================================================
  // PERMISSION MODAL
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
          headers: {
            Accept: "application/json",
          },
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Teacher API Status:",
        response.status
      );

      console.log(
        "Teacher API Response:",
        responseText
      );

      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );
      }

      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Invalid JSON response from server."
        );
      }

      if (data.success) {

        setTeachers(
          Array.isArray(data.teachers)
            ? data.teachers
            : []
        );

      } else {

        setError(
          data.message ||
          "Teacher information not found."
        );
      }

    } catch (err) {

      if (
        err.name !==
        "AbortError"
      ) {

        console.error(
          "Teacher API Error:",
          err
        );

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

    const controller =
      new AbortController();

    fetchTeachers(
      controller.signal
    );

    return () => {

      controller.abort();

    };

  }, []);

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const handleDelete = async (
    teacherId
  ) => {

    if (!teacherId) {

      alert(
        "Teacher ID পাওয়া যায়নি।"
      );

      return;
    }

    const confirmed =
      window.confirm(
        `আপনি কি নিশ্চিতভাবে ID: ${teacherId} ডিলিট করতে চান?`
      );

    if (!confirmed) {

      return;
    }

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/teacher_delete.php`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              teacher_id:
                teacherId,
            }),
          }
        );

      const responseText =
        await response.text();

      console.log(
        "Delete Response:",
        responseText
      );

      let result;

      try {

        result =
          JSON.parse(
            responseText
          );

      } catch {

        alert(
          `Server থেকে invalid response এসেছে।

${responseText.substring(
            0,
            500
          )}`
        );

        return;
      }

      if (result.success) {

        alert(
          "Teacher deleted successfully!"
        );

        setTeachers(
          (prev) =>
            prev.filter(
              (teacher) =>
                String(
                  teacher.teacher_id
                ) !==
                String(
                  teacherId
                )
            )
        );

      } else {

        alert(
          result.message ||
          "Delete failed!"
        );
      }

    } catch (err) {

      console.error(
        "Delete Error:",
        err
      );

      alert(
        `Server error occurred while deleting.

${err.message}`
      );
    }
  };

  // =====================================================
  // EDIT TEACHER
  // =====================================================

  const handleEdit = (
    teacher
  ) => {

    if (onEditTeacher) {

      onEditTeacher(
        teacher
      );

    } else {

      alert(
        `Edit Clicked for: ${
          teacher.name_en ||
          teacher.name_bn ||
          teacher.teacher_id
        }`
      );
    }
  };

  // =====================================================
  // DETAILS
  // =====================================================

  const handleDetails = (
    teacher
  ) => {

    alert(
      `Teacher Details

ID: ${
        teacher.teacher_id ||
        "N/A"
      }

Name: ${
        teacher.name_en ||
        teacher.name_bn ||
        "N/A"
      }

Course: ${
        teacher.course ||
        "N/A"
      }

Designation: ${
        teacher.designation ||
        "N/A"
      }

Branch: ${
        teacher.branch ||
        "N/A"
      }

Mobile: ${
        teacher.mobile ||
        "N/A"
      }`
    );
  };

  // =====================================================
  // OPEN USER MODAL
  // =====================================================

  const openAddUserModal = (
    teacher
  ) => {

    setSelectedTeacher(
      teacher
    );

    setUsername(
      teacher.teacher_id
        ? String(
            teacher.teacher_id
          ).toLowerCase()
        : ""
    );

    setPassword("");

    setRole(
      "Teacher"
    );

    setShowUserModal(
      true
    );
  };

  // =====================================================
  // CLOSE USER MODAL
  // =====================================================

  const closeUserModal = () => {

    if (userLoading) {

      return;
    }

    setShowUserModal(
      false
    );

    setSelectedTeacher(
      null
    );

    setUsername("");

    setPassword("");

    setRole(
      "Teacher"
    );
  };

  // =====================================================
  // CREATE USER
  // =====================================================

  const handleCreateUser = async (
    e
  ) => {

    e.preventDefault();

    // ---------------------------------------------------
    // TEACHER CHECK
    // ---------------------------------------------------

    if (!selectedTeacher) {

      alert(
        "Teacher নির্বাচন করা হয়নি।"
      );

      return;
    }

    // ---------------------------------------------------
    // USERNAME
    // ---------------------------------------------------

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {

      alert(
        "Username দিন।"
      );

      return;
    }

    // ---------------------------------------------------
    // PASSWORD
    // ---------------------------------------------------

    if (!password) {

      alert(
        "Password দিন।"
      );

      return;
    }

    if (
      password.length < 6
    ) {

      alert(
        "Password কমপক্ষে 6 characters হতে হবে।"
      );

      return;
    }

    // ---------------------------------------------------
    // TEACHER ID
    // ---------------------------------------------------

    const teacherId =
      selectedTeacher.teacher_id;

    if (!teacherId) {

      alert(
        "Teacher ID পাওয়া যায়নি।"
      );

      return;
    }

    // ---------------------------------------------------
    // FULL NAME
    // ---------------------------------------------------

    const fullName =
      selectedTeacher.name_en ||
      selectedTeacher.name_bn ||
      String(teacherId);

    // ---------------------------------------------------
    // REQUEST DATA
    // ---------------------------------------------------

    const requestData = {

      teacher_id:
        String(teacherId),

      username:
        cleanUsername,

      password:
        password,

      full_name:
        fullName,

      role:
        role,

      status:
        "active",
    };

    console.log(
      "================================"
    );

    console.log(
      "CREATE USER REQUEST"
    );

    console.log(
      requestData
    );

    console.log(
      "================================"
    );

    try {

      setUserLoading(
        true
      );

      // -------------------------------------------------
      // FETCH
      // -------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/user_create.php`,
          {
            method: "POST",

            mode: "cors",

            headers: {

              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                requestData
              ),
          }
        );

      console.log(
        "User Create HTTP Status:",
        response.status
      );

      console.log(
        "User Create HTTP OK:",
        response.ok
      );

      // -------------------------------------------------
      // READ TEXT FIRST
      // -------------------------------------------------

      const responseText =
        await response.text();

      console.log(
        "Raw User Create Response:",
        responseText
      );

      // -------------------------------------------------
      // EMPTY RESPONSE
      // -------------------------------------------------

      if (
        !responseText.trim()
      ) {

        alert(
          `Server থেকে কোনো response পাওয়া যায়নি।

HTTP Status: ${response.status}`
        );

        return;
      }

      // -------------------------------------------------
      // JSON PARSE
      // -------------------------------------------------

      let result;

      try {

        result =
          JSON.parse(
            responseText
          );

      } catch (
        jsonError
      ) {

        console.error(
          "JSON Parse Error:",
          jsonError
        );

        alert(
          `PHP থেকে valid JSON পাওয়া যায়নি।

HTTP Status: ${
            response.status
          }

Server Response:

${responseText.substring(
            0,
            1500
          )}`
        );

        return;
      }

      console.log(
        "Parsed User Response:",
        result
      );

      // -------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------

      if (
        !response.ok ||
        !result.success
      ) {

        alert(
          result.message ||
          result.error ||
          `User account তৈরি করা যায়নি।

HTTP Status: ${
            response.status
          }`
        );

        return;
      }

      // -------------------------------------------------
      // USER ID
      // -------------------------------------------------

      const createdUserId =
        result.admin_id ||
        result.user_id ||
        result.id ||
        null;

      console.log(
        "Created User ID:",
        createdUserId
      );

      // -------------------------------------------------
      // UPDATE LOCAL TEACHER
      // -------------------------------------------------

      setTeachers(
        (prev) =>
          prev.map(
            (teacher) => {

              if (
                String(
                  teacher.teacher_id
                ) ===
                String(
                  teacherId
                )
              ) {

                return {

                  ...teacher,

                  user_created:
                    true,

                  user_id:
                    createdUserId,

                  admin_id:
                    createdUserId,

                  user_status:
                    "active",

                  username:
                    cleanUsername,

                  role:
                    role,
                };
              }

              return teacher;
            }
          )
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      alert(
        `User account successfully created!

Username: ${cleanUsername}

User ID: ${
          createdUserId ||
          "N/A"
        }`
      );

      // -------------------------------------------------
      // CLOSE MODAL
      // -------------------------------------------------

      setShowUserModal(
        false
      );

      setSelectedTeacher(
        null
      );

      setUsername("");

      setPassword("");

      setRole(
        "Teacher"
      );

    } catch (err) {

      console.error(
        "================================"
      );

      console.error(
        "CREATE USER FETCH ERROR"
      );

      console.error(
        err
      );

      console.error(
        "================================"
      );

      alert(
        `Server-এর সাথে যোগাযোগ করা যাচ্ছে না।

Error:
${err.message}

API:
${API_BASE_URL}/user_create.php`
      );

    } finally {

      setUserLoading(
        false
      );
    }
  };

  // =====================================================
  // PERMISSION
  // =====================================================

  const handlePermission = (
    teacher
  ) => {

    if (
      !teacher.user_created
    ) {

      alert(
        "প্রথমে এই Teacher-এর User Account তৈরি করুন।"
      );

      return;
    }

    const userId =
      teacher.user_id ||
      teacher.admin_id;

    if (!userId) {

      alert(
        "এই User-এর ID পাওয়া যাচ্ছে না। Teacher list refresh করুন।"
      );

      return;
    }

    setPermissionTeacher({

      ...teacher,

      user_id:
        userId,

      admin_id:
        userId,
    });
  };

  // =====================================================
  // CLOSE PERMISSION
  // =====================================================

  const closePermissionModal =
    () => {

      setPermissionTeacher(
        null
      );
    };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTeachers =
    teachers.filter(
      (teacher) => {

        const query =
          searchTerm
            .trim()
            .toLowerCase();

        if (!query) {

          return true;
        }

        return (

          String(
            teacher.teacher_id ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.name_en ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.name_bn ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.mobile ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.course ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.designation ||
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          String(
            teacher.branch ||
            ""
          )
            .toLowerCase()
            .includes(query)
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

          <h1>
            Teacher List
          </h1>

          <p>
            নিবন্ধিত শিক্ষকদের তালিকা
          </p>

        </div>

        <div className="total-badge">

          Total:{" "}
          {
            filteredTeachers.length
          }

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
            setSearchTerm(
              e.target.value
            )
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

      {!loading &&
        !error && (

          <div className="table-card">

            {filteredTeachers.length ===
            0 ? (

              <div className="teacher-message">

                No teachers found.

              </div>

            ) : (

              <div className="table-responsive">

                <table className="teacher-table">

                  <thead>

                    <tr>

                      <th>
                        Photo
                      </th>

                      <th>
                        ID No
                      </th>

                      <th>
                        Name
                      </th>

                      <th>
                        Course
                      </th>

                      <th>
                        Designation
                      </th>

                      <th>
                        Branch
                      </th>

                      <th>
                        Mobile
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        User
                      </th>

                      <th>
                        Action
                      </th>

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

                            {
                              teacher.teacher_id
                            }

                          </td>


                          {/* NAME */}

                          <td>

                            <div className="name-wrapper">

                              <span className="name-en">

                                {
                                  teacher.name_en ||
                                  teacher.name_bn ||
                                  "N/A"
                                }

                              </span>

                              {teacher.name_bn &&
                                teacher.name_en && (

                                  <span className="name-bn">

                                    {
                                      teacher.name_bn
                                    }

                                  </span>

                                )}

                            </div>

                          </td>


                          {/* COURSE */}

                          <td>

                            {
                              teacher.course ||
                              "N/A"
                            }

                          </td>


                          {/* DESIGNATION */}

                          <td>

                            {
                              teacher.designation ||
                              "N/A"
                            }

                          </td>


                          {/* BRANCH */}

                          <td>

                            {
                              teacher.branch ||
                              "N/A"
                            }

                          </td>


                          {/* MOBILE */}

                          <td>

                            {
                              teacher.mobile ||
                              "N/A"
                            }

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

                              {
                                teacher.status ||
                                "Present"
                              }

                            </span>

                          </td>


                          {/* USER */}

                          <td>

                            {teacher.user_created ? (

                              <div className="user-status-wrapper">

                                <span className="user-active-badge">

                                  ✓ Active

                                </span>

                                <small>

                                  {
                                    teacher.username ||
                                    "User"
                                  }

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


                          {/* ACTION */}

                          <td>

                            <div className="action-buttons">

                              {/* DETAILS */}

                              <button
                                type="button"
                                className="btn-action btn-details"
                                title="Details"
                                onClick={() =>
                                  handleDetails(
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
          CREATE USER MODAL
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
                disabled={userLoading}
              >

                ×

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleCreateUser
              }
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
                      selectedTeacher?.name_bn ||
                      "Teacher"
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
                  disabled={userLoading}
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
                  disabled={userLoading}
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
                  disabled={userLoading}
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
          teacher={
            permissionTeacher
          }
          onClose={
            closePermissionModal
          }
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