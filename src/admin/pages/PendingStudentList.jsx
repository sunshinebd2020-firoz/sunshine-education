import "./PendingStudentList.css";
import { useEffect, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";

export default function PendingStudentList() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const API = `${API_BASE_URL}/`;
  const UPLOADS = `${API_ORIGIN}/uploads/students/`;

  // =====================================================
  // LOAD PENDING STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}pending_students.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      if (!text.trim()) {
        throw new Error("Empty server response.");
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Pending student invalid JSON:", text);
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}`
        );
      }

      if (!data.success) {
        setStudents([]);

        setMessage(
          data.message ||
            "Pending student data পাওয়া যায়নি।"
        );

        return;
      }

      const pendingStudents =
        Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.students)
            ? data.students
            : Array.isArray(data.pending_students)
              ? data.pending_students
              : [];

      setStudents(pendingStudents);

    } catch (error) {
      console.error(
        "Load pending students error:",
        error
      );

      setStudents([]);

      setMessage(
        error.message ||
          "Server connection failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRESENT TEACHERS
  // =====================================================

  const loadTeachers = async () => {
    try {
      setTeacherLoading(true);

      const response = await fetch(
        `${API}teacher_list.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      if (!text.trim()) {
        throw new Error(
          "Teacher API returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error(
          "Teacher API invalid JSON:",
          text
        );

        throw new Error(
          "Teacher API returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}`
        );
      }

      if (!data.success) {
        setTeachers([]);

        throw new Error(
          data.message ||
            "Teacher list পাওয়া যায়নি।"
        );
      }

      const teacherList =
        Array.isArray(data.teachers)
          ? data.teachers
          : Array.isArray(data.data)
            ? data.data
            : [];

      // =================================================
      // ONLY PRESENT TEACHERS
      // =================================================

      const presentTeachers =
        teacherList.filter((teacher) => {
          const status = String(
            teacher.status ?? ""
          )
            .trim()
            .toLowerCase();

          return status === "present";
        });

      console.log(
        "All teachers:",
        teacherList
      );

      console.log(
        "Present teachers:",
        presentTeachers
      );

      setTeachers(presentTeachers);

    } catch (error) {
      console.error(
        "Load teachers error:",
        error
      );

      setTeachers([]);

      setMessage(
        error.message ||
          "Teacher list load করা যায়নি।"
      );
    } finally {
      setTeacherLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStudents();
    loadTeachers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const refreshAll = () => {
    loadStudents();
    loadTeachers();
  };

  // =====================================================
  // OPEN ASSIGN TEACHER MODAL
  // =====================================================

  const openAssignTeacher = (student) => {
    setMessage("");

    setSelectedStudent(student);

    const existingTeacher =
      student.teacher_id ||
      student.assigned_teacher_id ||
      "";

    setSelectedTeacher(
      String(existingTeacher || "")
    );
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeAssignTeacher = () => {
    if (assigning) {
      return;
    }

    setSelectedStudent(null);
    setSelectedTeacher("");
  };

  // =====================================================
  // GET TEACHER ID
  // =====================================================

  const getTeacherId = (teacher) => {
    return (
      teacher.teacher_id ||
      teacher.id ||
      ""
    );
  };

  // =====================================================
  // GET TEACHER NAME
  // =====================================================

  const getTeacherDisplayName = (teacher) => {
    return (
      teacher.name_en ||
      teacher.name_bn ||
      teacher.short_name ||
      "Unnamed Teacher"
    );
  };

  // =====================================================
  // ASSIGN TEACHER
  // =====================================================

  const assignTeacher = async () => {
    if (!selectedStudent) {
      setMessage(
        "Student নির্বাচন করা হয়নি।"
      );
      return;
    }

    if (!selectedTeacher) {
      setMessage(
        "অনুগ্রহ করে একজন Present teacher নির্বাচন করুন।"
      );
      return;
    }

    const studentId =
      selectedStudent.student_id;

    if (!studentId) {
      setMessage(
        "Student ID পাওয়া যায়নি।"
      );
      return;
    }

    // =================================================
    // VERIFY SELECTED TEACHER IS PRESENT
    // =================================================

    const selectedTeacherObject =
      teachers.find(
        (teacher) =>
          String(getTeacherId(teacher)) ===
          String(selectedTeacher)
      );

    if (!selectedTeacherObject) {
      setMessage(
        "Selected teacher বর্তমানে Present নেই। অনুগ্রহ করে আবার teacher নির্বাচন করুন।"
      );
      return;
    }

    const selectedTeacherStatus =
      String(
        selectedTeacherObject.status ?? ""
      )
        .trim()
        .toLowerCase();

    if (selectedTeacherStatus !== "present") {
      setMessage(
        "Selected teacher বর্তমানে Present নেই।"
      );
      return;
    }

    try {
      setAssigning(true);
      setMessage("");

      const formData = new FormData();

      formData.append(
        "student_id",
        String(studentId)
      );

      formData.append(
        "teacher_id",
        String(selectedTeacher)
      );

      const response = await fetch(
        `${API}assign_student_teacher.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      if (!text.trim()) {
        throw new Error(
          "Assign Teacher API returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error(
          "Assign Teacher invalid response:",
          text
        );

        throw new Error(
          "Assign Teacher API returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Teacher assignment failed."
        );
      }

      // =================================================
      // UPDATE LOCAL STUDENT
      // =================================================

      setStudents((prev) =>
        prev.map((student) => {
          if (
            String(student.student_id) ===
            String(studentId)
          ) {
            return {
              ...student,

              teacher_id:
                data.teacher_id ||
                selectedTeacher,

              assigned_teacher_id:
                data.teacher_id ||
                selectedTeacher,

              teacher_name_en:
                data.teacher_name_en ||
                selectedTeacherObject.name_en ||
                "",

              teacher_name_bn:
                data.teacher_name_bn ||
                selectedTeacherObject.name_bn ||
                "",
            };
          }

          return student;
        })
      );

      setMessage(
        data.message ||
          "Teacher successfully assigned."
      );

      setSelectedStudent(null);
      setSelectedTeacher("");

    } catch (error) {
      console.error(
        "Assign teacher error:",
        error
      );

      setMessage(
        error.message ||
          "Teacher assignment failed."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =====================================================
  // APPROVE STUDENT
  // =====================================================

  const approveStudent = async (student) => {
    const studentId =
      student.student_id;

    if (!studentId) {
      setMessage(
        "Student ID পাওয়া যায়নি।"
      );
      return;
    }

    const teacherId =
      student.teacher_id ||
      student.assigned_teacher_id ||
      "";

    if (!teacherId) {
      setMessage(
        "প্রথমে এই student-এর জন্য একজন Present teacher assign করুন।"
      );

      openAssignTeacher(student);

      return;
    }

    // =================================================
    // VERIFY ASSIGNED TEACHER
    // =================================================

    const assignedTeacher =
      teachers.find(
        (teacher) =>
          String(getTeacherId(teacher)) ===
          String(teacherId)
      );

    if (!assignedTeacher) {
      setMessage(
        "Assigned teacher বর্তমানে Present নেই। Approve করার আগে একজন Present teacher assign করুন।"
      );

      openAssignTeacher(student);

      return;
    }

    const teacherStatus =
      String(
        assignedTeacher.status ?? ""
      )
        .trim()
        .toLowerCase();

    if (teacherStatus !== "present") {
      setMessage(
        "Assigned teacher বর্তমানে Present নেই।"
      );

      openAssignTeacher(student);

      return;
    }

    // =================================================
    // CONFIRM
    // =================================================

    const confirmApprove =
      window.confirm(
        "এই student application approve করতে চান?"
      );

    if (!confirmApprove) {
      return;
    }

    try {
      setMessage("");

      const formData = new FormData();

      formData.append(
        "student_id",
        String(studentId)
      );

      formData.append(
        "teacher_id",
        String(teacherId)
      );

      const response = await fetch(
        `${API}approve_student.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      if (!text.trim()) {
        throw new Error(
          "Approve API returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error(
          "Approve API invalid response:",
          text
        );

        throw new Error(
          "Approve API returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to approve student."
        );
      }

      // =================================================
      // REMOVE FROM PENDING LIST
      // =================================================

      setStudents((prev) =>
        prev.filter(
          (item) =>
            String(item.student_id) !==
            String(studentId)
        )
      );

      setMessage(
        data.message ||
          "Student successfully approved."
      );

    } catch (error) {
      console.error(
        "Approve student error:",
        error
      );

      setMessage(
        error.message ||
          "Server connection failed."
      );
    }
  };

  // =====================================================
  // REJECT STUDENT
  // =====================================================

  const rejectStudent = async (studentId) => {
    if (!studentId) {
      setMessage(
        "Student ID পাওয়া যায়নি।"
      );
      return;
    }

    const confirmReject =
      window.confirm(
        "এই student application reject করতে চান?"
      );

    if (!confirmReject) {
      return;
    }

    try {
      setMessage("");

      const formData = new FormData();

      formData.append(
        "student_id",
        String(studentId)
      );

      const response = await fetch(
        `${API}reject_student.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      if (!text.trim()) {
        throw new Error(
          "Reject API returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error(
          "Reject API invalid response:",
          text
        );

        throw new Error(
          "Reject API returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to reject student."
        );
      }

      setStudents((prev) =>
        prev.filter(
          (student) =>
            String(student.student_id) !==
            String(studentId)
        )
      );

      setMessage(
        data.message ||
          "Student application rejected."
      );

    } catch (error) {
      console.error(
        "Reject student error:",
        error
      );

      setMessage(
        error.message ||
          "Server connection failed."
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const dateString = String(date);

    const parts =
      dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText =
    search.trim().toLowerCase();

  const filteredStudents =
    students.filter((student) => {
      return (
        String(
          student.student_id || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.student_name_en || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.student_name_bn || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.student_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.course || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.language_level || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.branch || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.student_mobile || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          student.mobile || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =====================================================
  // GET ASSIGNED TEACHER NAME
  // =====================================================

  const getTeacherName = (student) => {
    const teacherId =
      student.teacher_id ||
      student.assigned_teacher_id ||
      "";

    if (!teacherId) {
      return "";
    }

    // First use API response
    if (
      student.teacher_name_en ||
      student.teacher_name_bn
    ) {
      return (
        student.teacher_name_en ||
        student.teacher_name_bn
      );
    }

    // Then search Present teacher list
    const teacher =
      teachers.find(
        (item) =>
          String(getTeacherId(item)) ===
          String(teacherId)
      );

    if (!teacher) {
      return String(teacherId);
    }

    return getTeacherDisplayName(
      teacher
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pending-student-list">

      {/* HEADER */}

      <div className="pending-list-header">

        <div>
          <h1>
            Pending Student List
          </h1>

          <p>
            Admin approval-এর অপেক্ষায় থাকা
            শিক্ষার্থীদের তালিকা
          </p>
        </div>

        <div className="pending-count">
          Pending: {filteredStudents.length}
        </div>

      </div>

      {/* SEARCH */}

      <div className="pending-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course, level or branch..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          type="button"
          className="pending-refresh"
          onClick={refreshAll}
          disabled={
            loading ||
            teacherLoading
          }
        >
          🔄{" "}
          {loading || teacherLoading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="pending-message">
          {message}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="pending-loading">

          <div className="pending-spinner"></div>

          <p>
            Pending students loading...
          </p>

        </div>

      ) : (

        <div className="pending-table-container">

          <table>

            <thead>

              <tr>

                <th>Photo</th>
                <th>ID No</th>
                <th>Name</th>
                <th>Language</th>
                <th>Level</th>
                <th>Branch</th>
                <th>Mobile</th>
                <th>Teacher</th>
                <th>Application Date</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.length > 0 ? (

                filteredStudents.map(
                  (student) => {

                    const studentId =
                      student.student_id;

                    const photo =
                      student.student_photo;

                    const studentName =
                      student.student_name_en ||
                      student.student_name ||
                      "-";

                    const mobile =
                      student.student_mobile ||
                      student.mobile ||
                      "-";

                    const assignedTeacher =
                      getTeacherName(student);

                    return (

                      <tr
                        key={
                          student.id ||
                          studentId
                        }
                      >

                        {/* PHOTO */}

                        <td>

                          {photo ? (

                            <img
                              src={`${UPLOADS}${photo}`}
                              alt={studentName}
                              className="pending-student-photo"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                const parent =
                                  e.currentTarget
                                    .parentElement;

                                if (
                                  parent &&
                                  !parent.querySelector(
                                    ".pending-no-photo"
                                  )
                                ) {
                                  const span =
                                    document.createElement(
                                      "span"
                                    );

                                  span.className =
                                    "pending-no-photo";

                                  span.innerText =
                                    "No Photo";

                                  parent.appendChild(
                                    span
                                  );
                                }
                              }}
                            />

                          ) : (

                            <span className="pending-no-photo">
                              No Photo
                            </span>

                          )}

                        </td>

                        {/* ID */}

                        <td>

                          <strong className="pending-student-id">
                            {studentId ||
                              `#${student.id}`}
                          </strong>

                        </td>

                        {/* NAME */}

                        <td>

                          <div className="pending-student-name">

                            <strong>
                              {studentName}
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
                          {student.course ||
                            "-"}
                        </td>

                        {/* LEVEL */}

                        <td>
                          {student.language_level ||
                            "-"}
                        </td>

                        {/* BRANCH */}

                        <td>
                          {student.branch ||
                            "-"}
                        </td>

                        {/* MOBILE */}

                        <td>
                          {mobile}
                        </td>

                        {/* TEACHER */}

                        <td>

                          {assignedTeacher ? (

                            <span className="assigned-teacher">
                              👨‍🏫{" "}
                              {assignedTeacher}
                            </span>

                          ) : (

                            <span className="teacher-not-assigned">
                              Not Assigned
                            </span>

                          )}

                        </td>

                        {/* DATE */}

                        <td>
                          {formatDate(
                            student.admission_date
                          )}
                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="pending-actions">

                            {/* ASSIGN */}

                            <button
                              type="button"
                              className="assign-teacher-button"
                              onClick={() =>
                                openAssignTeacher(
                                  student
                                )
                              }
                              title="Assign Present Teacher"
                            >
                              👨‍🏫
                            </button>

                            {/* APPROVE */}

                            <button
                              type="button"
                              className="approve-button"
                              onClick={() =>
                                approveStudent(
                                  student
                                )
                              }
                              title={
                                assignedTeacher
                                  ? "Approve Student"
                                  : "Assign Present teacher first"
                              }
                            >
                              ✓
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              className="reject-button"
                              onClick={() =>
                                rejectStudent(
                                  studentId
                                )
                              }
                              title="Reject Student"
                              disabled={!studentId}
                            >
                              ✕
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
                    colSpan="10"
                    className="pending-empty-cell"
                  >
                    {search.trim()
                      ? "আপনার search অনুযায়ী কোনো student পাওয়া যায়নি।"
                      : "বর্তমানে কোনো pending application নেই।"}
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

      {/* =================================================
          ASSIGN TEACHER MODAL
      ================================================= */}

      {selectedStudent && (

        <div
          className="assign-teacher-overlay"
          onClick={closeAssignTeacher}
        >

          <div
            className="assign-teacher-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="assign-teacher-header">

              <div>

                <h2>
                  Assign Teacher
                </h2>

                <p>
                  {selectedStudent.student_name_en ||
                    selectedStudent.student_name_bn ||
                    selectedStudent.student_name ||
                    "-"}
                </p>

                <small>
                  ID:{" "}
                  {
                    selectedStudent.student_id
                  }
                </small>

              </div>

              <button
                type="button"
                className="assign-close-button"
                onClick={closeAssignTeacher}
                disabled={assigning}
              >
                ✕
              </button>

            </div>

            {/* BODY */}

            <div className="assign-teacher-body">

              <label>
                Select Present Teacher
              </label>

              <select
                value={selectedTeacher}
                onChange={(e) =>
                  setSelectedTeacher(
                    e.target.value
                  )
                }
                disabled={
                  teacherLoading ||
                  assigning
                }
              >

                <option value="">
                  -- Select Present Teacher --
                </option>

                {teachers.map(
                  (teacher) => {

                    const teacherId =
                      getTeacherId(
                        teacher
                      );

                    const teacherName =
                      getTeacherDisplayName(
                        teacher
                      );

                    if (!teacherId) {
                      return null;
                    }

                    return (

                      <option
                        key={teacherId}
                        value={teacherId}
                      >
                        {teacherName}
                        {" — "}
                        {teacherId}

                        {teacher.branch
                          ? ` — ${teacher.branch}`
                          : ""}

                      </option>

                    );
                  }
                )}

              </select>

              {teacherLoading && (

                <p className="teacher-loading-text">
                  Present teacher list loading...
                </p>

              )}

              {!teacherLoading &&
                teachers.length === 0 && (

                  <p className="teacher-empty-text">
                    বর্তমানে কোনো Present teacher পাওয়া যায়নি।
                  </p>

                )}

            </div>

            {/* FOOTER */}

            <div className="assign-teacher-footer">

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
                disabled={
                  assigning ||
                  teacherLoading ||
                  !selectedTeacher
                }
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Teacher"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}