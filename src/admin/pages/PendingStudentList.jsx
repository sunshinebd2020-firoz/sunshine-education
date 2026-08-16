import "./PendingStudentList.css";
import { useEffect, useState } from "react";

export default function PendingStudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API = "http://localhost/sunshine-api/api/";

  // ================= LOAD PENDING STUDENTS =================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}pending_students.php`
      );

      const data = await response.json();

      if (data.success) {
        setStudents(data.data || []);
      } else {
        setMessage(
          data.message || "Pending student data পাওয়া যায়নি।"
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ================= APPROVE =================

  const approveStudent = async (studentId) => {
    const confirmApprove = window.confirm(
      "এই student application approve করতে চান?"
    );

    if (!confirmApprove) return;

    try {
      const formData = new FormData();

      formData.append("student_id", studentId);

      const response = await fetch(
        `${API}approve_student.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Student successfully approved.");

        setStudents((prev) =>
          prev.filter(
            (student) =>
              student.student_id !== studentId
          )
        );
      } else {
        setMessage(
          data.message ||
            "Failed to approve student."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    }
  };

  // ================= REJECT =================

  const rejectStudent = async (studentId) => {
    const confirmReject = window.confirm(
      "এই student application reject করতে চান?"
    );

    if (!confirmReject) return;

    try {
      const formData = new FormData();

      formData.append("student_id", studentId);

      const response = await fetch(
        `${API}reject_student.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Student application rejected."
        );

        setStudents((prev) =>
          prev.filter(
            (student) =>
              student.student_id !== studentId
          )
        );
      } else {
        setMessage(
          data.message ||
            "Failed to reject student."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    }
  };

  // ================= DATE =================

  const formatDate = (date) => {
    if (!date) return "-";

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // ================= SEARCH =================

  const filteredStudents = students.filter(
    (student) => {
      const searchText =
        search.toLowerCase();

      return (
        (student.student_id || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.student_name_en || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.student_name_bn || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.course || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.language_level || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.branch || "")
          .toLowerCase()
          .includes(searchText) ||

        (student.student_mobile || "")
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="pending-student-list">

      {/* ================= HEADER ================= */}

      <div className="pending-list-header">

        <div>
          <h1>Pending Student List</h1>

          <p>
            Admin approval-এর অপেক্ষায় থাকা
            শিক্ষার্থীদের তালিকা
          </p>
        </div>

        <div className="pending-count">
          Pending: {filteredStudents.length}
        </div>

      </div>


      {/* ================= SEARCH ================= */}

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
          className="pending-refresh"
          onClick={loadStudents}
        >
          🔄 Refresh
        </button>

      </div>


      {/* ================= MESSAGE ================= */}

      {message && (
        <p className="pending-message">
          {message}
        </p>
      )}


      {/* ================= LOADING ================= */}

      {loading ? (

        <div className="pending-loading">
          Loading...
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
                <th>Application Date</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(
                (student) => (

                  <tr key={student.id}>

                    {/* PHOTO */}

                    <td>

                      {student.student_photo ? (

                        <img
                          src={`http://localhost/sunshine-api/uploads/students/${student.student_photo}`}
                          alt={
                            student.student_name_en ||
                            "Student"
                          }
                          className="pending-student-photo"
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
                        {student.student_id ||
                          `#${student.id}`}
                      </strong>

                    </td>


                    {/* NAME */}

                    <td>

                      <div className="pending-student-name">

                        <strong>
                          {student.student_name_en ||
                            student.student_name ||
                            "-"}
                        </strong>

                        {student.student_name_bn && (
                          <span>
                            {student.student_name_bn}
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


                    {/* BRANCH */}

                    <td>
                      {student.branch || "-"}
                    </td>


                    {/* MOBILE */}

                    <td>
                      {student.student_mobile ||
                        student.mobile ||
                        "-"}
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

                        <button
                          className="approve-button"
                          onClick={() =>
                            approveStudent(
                              student.student_id
                            )
                          }
                          title="Approve"
                        >
                          ✓
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            rejectStudent(
                              student.student_id
                            )
                          }
                          title="Reject"
                        >
                          ✕
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {/* ================= EMPTY ================= */}

          {filteredStudents.length === 0 && (

            <p className="no-pending-student">
              বর্তমানে কোনো pending application নেই।
            </p>

          )}

        </div>

      )}

    </div>
  );
}