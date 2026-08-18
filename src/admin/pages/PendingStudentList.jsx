import "./PendingStudentList.css";
import { useEffect, useState } from "react";

export default function PendingStudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API = "http://localhost/sunshine-api/api/";
  const UPLOADS = "http://localhost/sunshine-api/uploads/students/";

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
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStudents(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } else {
        setStudents([]);
        setMessage(
          data.message ||
            "Pending student data পাওয়া যায়নি।"
        );
      }
    } catch (error) {
      console.error(
        "Load pending students error:",
        error
      );

      setStudents([]);
      setMessage(
        "Server connection failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStudents();
  }, []);

  // =====================================================
  // APPROVE STUDENT
  // =====================================================

  const approveStudent = async (studentId) => {
    if (!studentId) {
      setMessage(
        "Student ID পাওয়া যায়নি।"
      );
      return;
    }

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
        studentId
      );

      const response = await fetch(
        `${API}approve_student.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Student successfully approved."
        );

        setStudents((prev) =>
          prev.filter(
            (student) =>
              String(student.student_id) !==
              String(studentId)
          )
        );
      } else {
        setMessage(
          data.message ||
            "Failed to approve student."
        );
      }
    } catch (error) {
      console.error(
        "Approve student error:",
        error
      );

      setMessage(
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
        studentId
      );

      const response = await fetch(
        `${API}reject_student.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Student application rejected."
        );

        setStudents((prev) =>
          prev.filter(
            (student) =>
              String(student.student_id) !==
              String(studentId)
          )
        );
      } else {
        setMessage(
          data.message ||
            "Failed to reject student."
        );
      }
    } catch (error) {
      console.error(
        "Reject student error:",
        error
      );

      setMessage(
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
  // RENDER
  // =====================================================

  return (
    <div className="pending-student-list">

      {/* =================================================
          HEADER
      ================================================= */}

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

      {/* =================================================
          SEARCH AREA
      ================================================= */}

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
          onClick={loadStudents}
          disabled={loading}
        >
          🔄 {loading ? "Loading..." : "Refresh"}
        </button>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="pending-message">
          {message}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

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
                  Language
                </th>

                <th>
                  Level
                </th>

                <th>
                  Branch
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Application Date
                </th>

                <th>
                  Action
                </th>

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

                    return (
                      <tr
                        key={
                          student.id ||
                          studentId
                        }
                      >

                        {/* =========================
                            PHOTO
                        ========================= */}

                        <td>

                          {photo ? (

                            <img
                              src={`${UPLOADS}${photo}`}
                              alt={
                                studentName
                              }
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

                        {/* =========================
                            ID
                        ========================= */}

                        <td>

                          <strong className="pending-student-id">
                            {studentId ||
                              `#${student.id}`}
                          </strong>

                        </td>

                        {/* =========================
                            NAME
                        ========================= */}

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

                        {/* =========================
                            LANGUAGE
                        ========================= */}

                        <td>
                          {student.course ||
                            "-"}
                        </td>

                        {/* =========================
                            LEVEL
                        ========================= */}

                        <td>
                          {student.language_level ||
                            "-"}
                        </td>

                        {/* =========================
                            BRANCH
                        ========================= */}

                        <td>
                          {student.branch ||
                            "-"}
                        </td>

                        {/* =========================
                            MOBILE
                        ========================= */}

                        <td>
                          {mobile}
                        </td>

                        {/* =========================
                            DATE
                        ========================= */}

                        <td>
                          {formatDate(
                            student.admission_date
                          )}
                        </td>

                        {/* =========================
                            ACTION
                        ========================= */}

                        <td>

                          <div className="pending-actions">

                            <button
                              type="button"
                              className="approve-button"
                              onClick={() =>
                                approveStudent(
                                  studentId
                                )
                              }
                              title="Approve Student"
                              disabled={!studentId}
                            >
                              ✓
                            </button>

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
                    colSpan="9"
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

    </div>
  );
}