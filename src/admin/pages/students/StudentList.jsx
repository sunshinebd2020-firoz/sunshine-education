import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentList.css";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

const API = API_BASE_URL;
const IMAGE_URL = API_ORIGIN;

const parseJsonResponse = async (response, fallbackMessage) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      fallbackMessage || "Server response is empty."
    );
  }

  const trimmed = text.trim();

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  if (
    !contentType.includes("application/json") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    throw new Error(
      "Backend API is not responding with JSON. Check if the PHP API URL is correct and the server is running."
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error("Invalid JSON response:", trimmed);

    throw new Error(
      fallbackMessage ||
        "Server returned an invalid response format."
    );
  }
};

export default function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const getCurrentUser = () => {
    const possibleKeys = [
      "sunshine_user",
      "admin",
      "currentAdmin",
      "user",
      "currentUser",
      "loginUser",
    ];

    for (const key of possibleKeys) {
      try {
        const value = localStorage.getItem(key);

        if (!value) continue;

        const data = JSON.parse(value);

        if (data && typeof data === "object") {
          return data;
        }
      } catch {
        console.warn(
          `Invalid localStorage data: ${key}`
        );
      }
    }

    return null;
  };

  const currentUser = getCurrentUser();

  const userRole = String(
    currentUser?.role ||
      currentUser?.user_role ||
      currentUser?.admin_role ||
      ""
  ).trim();

  /* =====================================================
     PENDING APPLICATION
  ===================================================== */

  const isPendingApplication = (student) => {
    if (!student || typeof student !== "object") {
      return false;
    }

    const status = String(
      student.application_status ||
        student.applicationStatus ||
        student.status ||
        ""
    )
      .trim()
      .toLowerCase();

    return [
      "pending",
      "new",
      "draft",
      "submitted",
      "approval pending",
      "waiting for approval",
    ].includes(status);
  };

  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  const loadStudents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams();

params.set("role", userRole);

if (String(userRole).toLowerCase() === "teacher") {

  const teacherId =
    currentUser?.teacher_id ||
    currentUser?.teacherId ||
    currentUser?.id ||
    "";

  params.set("teacher_id", teacherId);
}

const response = await fetch(
  `${API}/students.php?${params.toString()}`,
  {
    credentials: "include",
  }
);

      const data = await parseJsonResponse(
        response,
        "Student data পাওয়া যায়নি।"
      );

      if (data.success) {
        const approvedStudents = Array.isArray(
          data.students
        )
          ? data.students.filter(
              (student) =>
                !isPendingApplication(student)
            )
          : [];

        setStudents(approvedStudents);
      } else {
        setStudents([]);
        setMessage(
          data.message ||
            "Student data পাওয়া যায়নি।"
        );
      }
    } catch (error) {
      console.error(
        "Student loading error:",
        error
      );

      setStudents([]);
      setMessage("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD TEACHERS FOR ASSIGNMENT
  ===================================================== */

  const getTeacherId = (teacher) =>
    String(
      teacher?.teacher_id ??
        teacher?.teacherId ??
        teacher?.id ??
        ""
    ).trim();

  const getTeacherName = (teacher) =>
    teacher?.name_en ||
    teacher?.teacher_name_en ||
    teacher?.name_bn ||
    teacher?.teacher_name_bn ||
    teacher?.full_name ||
    teacher?.teacher_name ||
    "Unnamed Teacher";

  const loadTeachers = async () => {
    try {
      setTeacherLoading(true);

      const response = await fetch(`${API}/teacher_list.php`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await parseJsonResponse(
        response,
        "Teacher list could not be loaded."
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Teacher list could not be loaded."
        );
      }

      const teacherList = Array.isArray(data.teachers)
        ? data.teachers
        : Array.isArray(data.data)
          ? data.data
          : [];

      setTeachers(
        teacherList.filter((teacher) => {
          const status = String(
            teacher?.status ?? teacher?.teacher_status ?? ""
          ).trim().toLowerCase();

          return status !== "inactive" && status !== "0";
        })
      );
    } catch (error) {
      console.error("Teacher loading error:", error);
      setTeachers([]);
      setMessage(error.message || "Teacher list could not be loaded.");
    } finally {
      setTeacherLoading(false);
    }
  };

  /* =====================================================
     ASSIGN TEACHER
  ===================================================== */

  const getAssignedTeacherId = (student) => {
    const teacherId =
      student?.assigned_teacher_id ??
      student?.assigned_to_teacher ??
      student?.teacher_id ??
      student?.teacherId ??
      "";

    const normalizedId = String(teacherId).trim();

    return ["", "0", "false", "null", "undefined", "unassigned", "none"].includes(
      normalizedId.toLowerCase()
    )
      ? ""
      : normalizedId;
  };

  const getAssignedTeacherName = (student) => {
    const savedName =
      student?.teacher_name_en ||
      student?.assigned_teacher_name_en ||
      student?.teacher_name_bn ||
      student?.assigned_teacher_name_bn ||
      student?.assigned_teacher_name ||
      student?.teacher_name;

    if (savedName) return savedName;

    const teacherId = getAssignedTeacherId(student);

    if (!teacherId) return "No teacher assigned yet";

    const teacher = teachers.find(
      (item) => getTeacherId(item) === teacherId
    );

    return teacher ? getTeacherName(teacher) : `Teacher ID: ${teacherId}`;
  };
  const openAssignTeacher = (student) => {
    setMessage("");
    setSelectedStudent(student);

    const assignedTeacherId = getAssignedTeacherId(student);

    setSelectedTeacher(
      teachers.some(
        (teacher) => getTeacherId(teacher) === assignedTeacherId
      )
        ? assignedTeacherId
        : ""
    );
  };

  const closeAssignTeacher = () => {
    if (assigning) return;

    setSelectedStudent(null);
    setSelectedTeacher("");
  };

  const assignTeacher = async () => {
    if (!selectedStudent || !selectedTeacher) return;

    const studentId = selectedStudent.student_id;

    if (!studentId) {
      setMessage("Student ID could not be found.");
      return;
    }

    const teacher = teachers.find(
      (item) => getTeacherId(item) === selectedTeacher
    );

    if (!teacher) {
      setMessage("Please select a valid teacher.");
      return;
    }

    if (getAssignedTeacherId(selectedStudent) === selectedTeacher) {
      setMessage("This student is already assigned to this teacher.");
      return;
    }

    try {
      setAssigning(true);
      setMessage("");

      const response = await fetch(
        `${API}/student_teacher_assign.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            student_id: String(studentId),
            teacher_id: selectedTeacher,
          }),
        }
      );
      const data = await parseJsonResponse(
        response,
        "Teacher assignment failed."
      );

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Teacher assignment failed.");
      }

      const teacherId = String(
        data.teacher_id ||
          data.teacher?.teacher_id ||
          selectedTeacher
      );
      const teacherName =
        data.teacher_name_en ||
        data.teacher_name_bn ||
        data.teacher?.name_en ||
        data.teacher?.name_bn ||
        getTeacherName(teacher);

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          String(student.student_id || student.id) ===
            String(studentId)
            ? {
                ...student,
                teacher_id: teacherId,
                assigned_teacher_id: teacherId,
                assigned_to_teacher: teacherId,
                teacher_name_en: teacherName,
                teacher_name_bn:
                  data.teacher_name_bn ||
                  data.teacher?.name_bn ||
                  student.teacher_name_bn ||
                  "",
                teacher_name: teacherName,
                assigned_teacher_name: teacherName,
              }
            : student
        )
      );

      setSelectedStudent(null);
      setSelectedTeacher("");
      setMessage(data.message || "Teacher assigned successfully.");
    } catch (error) {
      console.error("Teacher assignment error:", error);
      setMessage(error.message || "Teacher assignment failed.");
    } finally {
      setAssigning(false);
    }
  };
  useEffect(() => {
    loadStudents();
    loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     STATUS
  ===================================================== */

  const handleStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API}/student_status.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message ||
            "Status updated successfully"
        );

        loadStudents();
      } else {
        setMessage(
          data.message ||
            "Status update failed"
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই শিক্ষার্থীকে Delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/delete_student.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message ||
            "Student deleted successfully"
        );

        loadStudents();
      } else {
        setMessage(
          data.message ||
            "Student delete failed"
        );
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredStudents = students.filter(
    (student) => {
      const searchText = search
        .trim()
        .toLowerCase();

      if (!searchText) return true;

      return (
        String(
          student.student_id || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          student.student_name_bn || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          student.student_name_en ||
            student.student_name ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          student.student_mobile ||
            student.mobile ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(student.course || "")
          .toLowerCase()
          .includes(searchText) ||
        String(
          student.language_level || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  /* =====================================================
     PHOTO URL
  ===================================================== */

  const getPhotoValue = (student) => {
    return (
      student?.student_photo ||
      student?.photo ||
      student?.profile_photo ||
      student?.image ||
      student?.studentImage ||
      student?.image_url ||
      ""
    );
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    const photoPath = String(photo).trim();

    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("data:")
    ) {
      return photoPath;
    }

    const cleanPath = photoPath
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/g, "")
      .replace(
        /^uploads\/students\//i,
        ""
      )
      .replace(/^uploads\//i, "")
      .replace(/^students\//i, "")
      .split(/[\\\/]+/)
      .filter(Boolean)
      .map((part) =>
        encodeURIComponent(part)
      )
      .join("/");

    return cleanPath
      ? `${IMAGE_URL}/uploads/students/${cleanPath}`
      : "";
  };

  /* =====================================================
     PASSPORT URL
  ===================================================== */

  const getPassportValue = (student) => {
    return (
      student?.passport_scan ||
      student?.passportScan ||
      student?.passport_file ||
      student?.passportFile ||
      ""
    );
  };

  const getPassportUrl = (passport) => {
    if (!passport) return "";

    const passportPath =
      String(passport).trim();

    if (!passportPath) return "";

    if (
      passportPath.startsWith("http://") ||
      passportPath.startsWith("https://") ||
      passportPath.startsWith("data:")
    ) {
      return passportPath;
    }

    const cleanPath = passportPath
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/g, "")
      .replace(
        /^uploads\/students\//i,
        ""
      )
      .replace(/^uploads\//i, "")
      .replace(/^students\//i, "")
      .split(/[\\\/]+/)
      .filter(Boolean)
      .map((part) =>
        encodeURIComponent(part)
      )
      .join("/");

    return cleanPath
      ? `${IMAGE_URL}/uploads/students/${cleanPath}`
      : "";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="student-list">

      {/* HEADER */}
      <div className="student-list-header">

        <div>
          <h1>Student List</h1>

          <p>
            নিবন্ধিত শিক্ষার্থীদের তালিকা
          </p>
        </div>

        <button
          type="button"
          className="admin-list-add-button"
          onClick={() =>
            navigate("/admin/students")
          }
        >
          + Add Student
        </button>

        <div className="student-count">
          Total: {filteredStudents.length}
        </div>

      </div>

      {/* SEARCH */}
      <div className="student-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course or level..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* MESSAGE */}
      {message && (
        <p className="student-message">
          {message}
        </p>
      )}

      {/* TABLE */}
      <div className="table-container">

        {loading ? (
          <p className="no-student">
            Loading students...
          </p>
        ) : (
          <>
            <table>

              <thead>
                <tr>
                  <th>Photo</th>
                  <th>ID No</th>
                  <th>Name</th>
                  <th>Language</th>
                  <th>Level</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.map(
                  (student) => {

                    const passportUrl =
                      getPassportUrl(
                        getPassportValue(
                          student
                        )
                      );

                    return (
                      <tr
                        key={student.id}
                      >

                        {/* PHOTO */}
                        <td>
                          {getPhotoValue(
                            student
                          ) ? (
                            <img
                              src={getPhotoUrl(
                                getPhotoValue(
                                  student
                                )
                              )}
                              alt={
                                student.student_name_en ||
                                student.student_name ||
                                "Student"
                              }
                              className="student-photo"
                            />
                          ) : (
                            <span className="no-photo">
                              No Photo
                            </span>
                          )}
                        </td>

                        {/* ID */}
                        <td>
                          <strong className="student-id">
                            {student.student_id ||
                              `#${student.id}`}
                          </strong>
                        </td>

                        {/* NAME */}
                        <td>
                          <div className="student-name">

                            <strong>
                              {student.student_name_en ||
                                student.student_name ||
                                "-"}
                            </strong>

                            {student.student_name_bn && (
                              <span>
                                {
                                  student.student_name_bn
                                }
                              </span>
                            )}

                          </div>
                        </td>

                        {/* LANGUAGE */}
                        <td>
                          {student.course || "-"}
                        </td>

                        {/* LEVEL */}
                        <td>
                          {student.language_level ||
                            "-"}
                        </td>

                        {/* MOBILE */}
                        <td>
                          {student.student_mobile ||
                            student.mobile ||
                            "-"}
                        </td>

                        {/* STATUS */}
                        <td>
                          {String(
                            student.status
                          ).toLowerCase() ===
                          "active" ? (
                            <span className="status-active">
                              Active
                            </span>
                          ) : (
                            <span className="status-inactive">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td>

                          <div className="student-actions">

                            {/* ASSIGN */}

                            <button
                              type="button"
                              className="assign-student-button"
                              title="Assign or change teacher"
                              onClick={() => openAssignTeacher(student)}
                            >
                              👨‍🏫
                            </button>

                            {/* VIEW */}

                            <button
                              type="button"
                              className="details-button"
                              title="View Student"
                              onClick={() =>
                                navigate(
                                  `/admin/student-profile/${student.id}`
                                )
                              }
                            >
                              👁️
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              className="edit-button"
                              title="Edit Student"
                              onClick={() =>
                                navigate(
                                  `/admin/student-edit/${student.id}`
                                )
                              }
                            >
                              ✏️
                            </button>

                            {/* STATUS */}

                            {String(
                              student.status
                            ).toLowerCase() ===
                            "active" ? (
                              <button
                                type="button"
                                className="inactive-button"
                                title="Make Inactive"
                                onClick={() =>
                                  handleStatus(
                                    student.id,
                                    "inactive"
                                  )
                                }
                              >
                                🔴
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="active-button"
                                title="Make Active"
                                onClick={() =>
                                  handleStatus(
                                    student.id,
                                    "active"
                                  )
                                }
                              >
                                🟢
                              </button>
                            )}

                            {/* DELETE */}

                            <button
                              type="button"
                              className="delete-button"
                              title="Delete Student"
                              onClick={() =>
                                handleDelete(
                                  student.id
                                )
                              }
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>

            {filteredStudents.length ===
              0 && (
              <p className="no-student">
                কোনো শিক্ষার্থী পাওয়া যায়নি।
              </p>
            )}
          </>
        )}

      </div>
      {selectedStudent && (
        <div className="assign-modal-overlay" onClick={closeAssignTeacher}>
          <div
            className="assign-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-teacher-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="assign-modal-header">
              <div>
                <h2 id="assign-teacher-title">Assign Teacher</h2>
                <p>
                  {selectedStudent.student_name_en ||
                    selectedStudent.student_name_bn ||
                    selectedStudent.student_name ||
                    "Student"}
                  {selectedStudent.student_id
                    ? ` — ID: ${selectedStudent.student_id}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="assign-close-button"
                aria-label="Close"
                onClick={closeAssignTeacher}
                disabled={assigning}
              >
                ×
              </button>
            </div>

            <div className="selected-student-box">
              <strong>Currently assigned teacher</strong>
              <span>{getAssignedTeacherName(selectedStudent)}</span>
            </div>

            <div className="assign-form-group">
              <label htmlFor="student-teacher-select">Select teacher</label>
              <select
                id="student-teacher-select"
                value={selectedTeacher}
                onChange={(event) => setSelectedTeacher(event.target.value)}
                disabled={teacherLoading || assigning}
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((teacher) => {
                  const teacherId = getTeacherId(teacher);

                  return teacherId ? (
                    <option key={teacherId} value={teacherId}>
                      {getTeacherName(teacher)} — {teacherId}
                      {teacher.branch ? ` — ${teacher.branch}` : ""}
                    </option>
                  ) : null;
                })}
              </select>

              {teacherLoading && (
                <p className="teacher-loading">Loading teachers...</p>
              )}
              {!teacherLoading && teachers.length === 0 && (
                <p className="teacher-loading">No teachers are available.</p>
              )}
            </div>

            <div className="assign-modal-actions">
              <button
                type="button"
                className="assign-cancel-button"
                onClick={closeAssignTeacher}
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="assign-save-button"
                onClick={assignTeacher}
                disabled={assigning || teacherLoading || !selectedTeacher}
              >
                {assigning ? "Saving..." : "Assign Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}