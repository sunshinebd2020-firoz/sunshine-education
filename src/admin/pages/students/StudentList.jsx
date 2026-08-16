import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentList.css";

export default function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/sunshine-api/api/students.php"
      );

      const data = await response.json();

      if (data.success) {
        setStudents(
          Array.isArray(data.students)
            ? data.students
            : []
        );
        setMessage("");
      } else {
        setStudents([]);
        setMessage(
          data.message ||
            "Student data পাওয়া যায়নি"
        );
      }
    } catch (error) {
      console.error("Student loading error:", error);

      setMessage(
        "Server connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);


  /* =====================================================
     ACTIVE / INACTIVE
  ===================================================== */

  const handleStatus = async (id, status) => {
    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/student_status.php",
        {
          method: "POST",
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
     DELETE STUDENT
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই শিক্ষার্থীকে Delete করতে চান?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/delete_student.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
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

  const filteredStudents =
    students.filter((student) => {
      const searchText =
        search.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

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
          student.mobile ||
            student.student_mobile ||
            ""
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
          .includes(searchText)
      );
    });


  /* =====================================================
     PHOTO URL
  ===================================================== */

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return "";
    }

    return `http://localhost/sunshine-api/uploads/students/${photo}`;
  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="student-list">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="student-list-header">

        <div>
          <h1>
            Student List
          </h1>

          <p>
            নিবন্ধিত শিক্ষার্থীদের তালিকা
          </p>
        </div>

        <div className="student-count">
          Total: {filteredStudents.length}
        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="student-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course, level or branch..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <p className="student-message">
          {message}
        </p>
      )}


      {/* =================================================
          TABLE
      ================================================= */}

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
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                    >

                      {/* ================= PHOTO ================= */}

                      <td>

                        {student.student_photo ? (

                          <img
                            src={getPhotoUrl(
                              student.student_photo
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


                      {/* ================= ID ================= */}

                      <td>

                        <strong className="student-id">
                          {student.student_id ||
                            `#${student.id}`}
                        </strong>

                      </td>


                      {/* ================= NAME ================= */}

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


                      {/* ================= LANGUAGE ================= */}

                      <td>
                        {student.course ||
                          "-"}
                      </td>


                      {/* ================= LEVEL ================= */}

                      <td>
                        {student.language_level ||
                          "-"}
                      </td>


                      {/* ================= BRANCH ================= */}

                      <td>
                        {student.branch ||
                          "-"}
                      </td>


                      {/* ================= MOBILE ================= */}

                      <td>
                        {student.student_mobile ||
                          student.mobile ||
                          "-"}
                      </td>


                      {/* ================= STATUS ================= */}

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


                      {/* ================= ACTION ================= */}

                      <td>

                        <div className="student-actions">

                          {/* Details */}

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


                          {/* Edit */}

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


                          {/* Active / Inactive */}

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


                          {/* Delete */}

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

                  )
                )}

              </tbody>

            </table>


            {/* =================================================
                NO STUDENT
            ================================================= */}

            {filteredStudents.length === 0 && (

              <p className="no-student">
                কোনো শিক্ষার্থী পাওয়া যায়নি।
              </p>

            )}

          </>

        )}

      </div>

    </div>
  );
}