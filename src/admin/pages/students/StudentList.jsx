import { useEffect, useState } from "react";
import "./StudentList.css";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadStudents = () => {
    fetch("http://localhost/sunshine-api/api/students.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
        } else {
          setMessage("Student data পাওয়া যায়নি");
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Server connection failed");
      });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Active / Inactive
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
        setMessage(data.message);
        loadStudents();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই শিক্ষার্থীকে Delete করতে চান?"
    );

    if (!confirmDelete) return;

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
        setMessage(data.message);
        loadStudents();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed");
    }
  };

  // Search
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      (student.student_id || "")
        .toLowerCase()
        .includes(searchText) ||

      (student.student_name_bn || "")
        .toLowerCase()
        .includes(searchText) ||

      (student.student_name_en || student.student_name || "")
        .toLowerCase()
        .includes(searchText) ||

      (student.mobile || "")
        .toLowerCase()
        .includes(searchText) ||

      (student.student_mobile || "")
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
        .includes(searchText)
    );
  });

  return (
    <div className="student-list">

      <div className="student-list-header">
        <div>
          <h1>Student List</h1>
          <p>নিবন্ধিত শিক্ষার্থীদের তালিকা</p>
        </div>

        <div className="student-count">
          Total: {filteredStudents.length}
        </div>
      </div>

      <div className="student-search">
        <input
          type="text"
          placeholder="Search by ID, name, mobile, course, level or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && (
        <p className="student-message">
          {message}
        </p>
      )}

      <div className="table-container">

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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredStudents.map((student) => (

              <tr key={student.id}>

                {/* Photo */}
                <td>
                  {student.student_photo ? (
                    <img
                      src={`http://localhost/sunshine-api/uploads/students/${student.student_photo}`}
                      alt={student.student_name_en || student.student_name}
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
                    {student.student_id || `#${student.id}`}
                  </strong>
                </td>

                {/* Name */}
                <td>
                  <div className="student-name">

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

                {/* Language */}
                <td>
                  {student.course || "-"}
                </td>

                {/* Level */}
                <td>
                  {student.language_level || "-"}
                </td>

                {/* Branch */}
                <td>
                  {student.branch || "-"}
                </td>

                {/* Mobile */}
                <td>
                  {student.student_mobile ||
                    student.mobile ||
                    "-"}
                </td>

                {/* Status */}
                <td>
                  {student.status === "active" ? (
                    <span className="status-active">
                      Active
                    </span>
                  ) : (
                    <span className="status-inactive">
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <div className="student-actions">

                    {/* Details */}
                    <button
                      className="details-button"
                      onClick={() =>
                        (window.location.href =
                          `/admin/student-profile/${student.id}`)
                      }
                    >
                      👁️ Details
                    </button>

                    {/* Edit */}
                    <button
                      className="edit-button"
                      onClick={() =>
                        (window.location.href =
                          `/admin/student-edit/${student.id}`)
                      }
                    >
                      ✏️ Edit
                    </button>

                    {/* Active / Inactive */}
                    {student.status === "active" ? (
                      <button
                        className="inactive-button"
                        onClick={() =>
                          handleStatus(
                            student.id,
                            "inactive"
                          )
                        }
                      >
                        🔴 Inactive
                      </button>
                    ) : (
                      <button
                        className="active-button"
                        onClick={() =>
                          handleStatus(
                            student.id,
                            "active"
                          )
                        }
                      >
                        🟢 Active
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(student.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {filteredStudents.length === 0 && (
          <p className="no-student">
            কোনো শিক্ষার্থী পাওয়া যায়নি।
          </p>
        )}

      </div>

    </div>
  );
}