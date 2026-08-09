import { useEffect, useState } from "react";
import "./StudentList.css";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost/sunshine-api/api/students.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
        } else {
          setMessage("Student data পাওয়া যায়নি");
        }
      })
      .catch(() => {
        setMessage("Server connection failed");
      });
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.student_name.toLowerCase().includes(searchText) ||
      student.mobile.toLowerCase().includes(searchText) ||
      student.course.toLowerCase().includes(searchText) ||
      student.date_of_birth.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="student-list">

      <h1>Student List</h1>
      <p>নিবন্ধিত শিক্ষার্থীদের তালিকা</p>

      {/* Search */}
      <div className="student-search">
        <input
          type="text"
          placeholder="Search by name, mobile, course or date of birth..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <p>{message}</p>}

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Serial</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Course</th>
              <th>Date of Birth</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody>

            {filteredStudents.map((student, index) => (
              <tr key={student.id}>

                <td>{index + 1}</td>

                <td>{student.student_name}</td>

                <td>{student.mobile}</td>

                <td>{student.course}</td>

                <td>{student.date_of_birth}</td>

                <td>{student.address}</td>

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