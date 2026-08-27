import "./PendingStudentList.css";
import { useEffect, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";

export default function PendingStudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
        console.error("Invalid JSON:", text);
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

      if (data.success) {
        const pendingStudents = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.students)
            ? data.students
            : Array.isArray(data.pending_students)
              ? data.pending_students
              : [];

        setStudents(pendingStudents);
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
        error.message ||
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        String(studentId)
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
  // RENDER
  // =====================================================

  return (
    <div className="pending-student-list">

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

      {message && (
        <div className="pending-message">
          {message}
        </div>
      )}

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

                        <td>

                          <strong className="pending-student-id">
                            {studentId ||
                              `#${student.id}`}
                          </strong>

                        </td>

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

                        <td>
                          {student.course ||
                            "-"}
                        </td>

                        <td>
                          {student.language_level ||
                            "-"}
                        </td>

                        <td>
                          {student.branch ||
                            "-"}
                        </td>

                        <td>
                          {mobile}
                        </td>

                        <td>
                          {formatDate(
                            student.admission_date
                          )}
                        </td>

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