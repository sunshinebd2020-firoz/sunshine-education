import "./Dashboard.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost/sunshine-api/api/student_count.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setStudentCount(data.total);
        }
      })
      .catch((error) => {
        console.error("Student count error:", error);
      });
  }, []);

  return (
    <div className="dashboard-content">

      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome to Sunshine Education Admin Panel
          </p>
        </div>
      </header>

      <section className="dashboard-cards">

        <div className="dashboard-card">
          <h3>👨‍🎓 Students</h3>
          <p>{studentCount}</p>
        </div>

        <div className="dashboard-card">
          <h3>📚 Courses</h3>
          <p>3</p>
        </div>

        <div className="dashboard-card">
          <h3>👨‍🏫 Teachers</h3>
          <p>0</p>
        </div>

        <div className="dashboard-card">
          <h3>📢 Notices</h3>
          <p>0</p>
        </div>

      </section>

    </div>
  );
}