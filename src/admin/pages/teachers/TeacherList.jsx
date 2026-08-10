import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherList.css";

export default function TeacherList() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/teacher_list.php"
      );

      if (!response.ok) {
        throw new Error("HTTP Error: " + response.status);
      }

      const data = await response.json();

      if (data.success) {
        setTeachers(data.teachers || []);
      } else {
        setMessage(data.message || "Failed to load teachers");
      }
    } catch (error) {
      console.error("Teacher List Error:", error);
      setMessage("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await fetch(
        "http://localhost/sunshine-api/api/teacher_delete.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setTeachers((previous) =>
          previous.filter((teacher) => teacher.id !== id)
        );
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return (
      <div className="teacher-list-page">
        <p className="teacher-loading">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="teacher-list-page">

      <div className="teacher-list-header">

        <div>
          <h1>Teacher List</h1>
          <p>সকল শিক্ষকের তালিকা</p>
        </div>

        <button
          className="add-teacher-button"
          onClick={() => navigate("/admin/teachers")}
        >
          ➕ Add Teacher
        </button>

      </div>


      {message && (
        <div className="teacher-list-message">
          {message}
        </div>
      )}


      <div className="teacher-table-wrapper">

        <table className="teacher-table">

          <thead>
            <tr>
              <th>Photo</th>
              <th>Teacher ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Branch</th>
              <th>Designation</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="no-teacher"
                >
                  No teacher found
                </td>
              </tr>
            ) : (

              teachers.map((teacher) => (

                <tr key={teacher.id}>

                  <td>
                    {teacher.photo ? (
                      <img
                        src={`http://localhost/sunshine-api/uploads/teachers/${teacher.photo}`}
                        alt={teacher.name_en}
                        className="teacher-photo"
                      />
                    ) : (
                      <div className="no-photo">
                        👨‍🏫
                      </div>
                    )}
                  </td>


                  <td>
                    {teacher.teacher_id || "-"}
                  </td>


                  <td>
                    <strong>
                      {teacher.name_en}
                    </strong>

                    {teacher.name_bn && (
                      <small>
                        {teacher.name_bn}
                      </small>
                    )}
                  </td>


                  <td>
                    {teacher.course || "-"}
                  </td>


                  <td>
                    {teacher.branch || "-"}
                  </td>


                  <td>
                    {teacher.designation || "-"}
                  </td>


                  <td>
                    {teacher.mobile || "-"}
                  </td>


                  <td>
                    <span
                      className={
                        teacher.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {teacher.status}
                    </span>
                  </td>


                  <td>

                    <div className="teacher-actions">

                      <button
                        className="details-button"
                        onClick={() =>
                          navigate(
                            `/admin/teacher-profile/${teacher.id}`
                          )
                        }
                      >
                        👁️
                      </button>


                      <button
                        className="edit-button"
                        onClick={() =>
                          navigate(
                            `/admin/teacher-edit/${teacher.id}`
                          )
                        }
                      >
                        ✏️
                      </button>


                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(teacher.id)
                        }
                      >
                        🗑️
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}