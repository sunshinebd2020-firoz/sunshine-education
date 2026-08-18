import "./Dashboard.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  // Logged-in user
  const [user, setUser] = useState(null);

  useEffect(() => {
    /* =====================================================
       LOGGED-IN USER
    ===================================================== */

    const savedUser = localStorage.getItem("sunshine_user");

    if (savedUser) {
      try {
        const loggedInUser = JSON.parse(savedUser);

        setUser(loggedInUser);

        console.log("Logged-in User:", loggedInUser);
      } catch (error) {
        console.error("User data parse error:", error);
      }
    }


    /* =====================================================
       STUDENT COUNT
    ===================================================== */

    fetch(
      "http://localhost/sunshine-api/api/student_count.php"
    )
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
        console.error(
          "Student count error:",
          error
        );
      });


    /* =====================================================
       TEACHER COUNT
    ===================================================== */

    fetch(
      "http://localhost/sunshine-api/api/teacher_count.php"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setTeacherCount(data.total);
        }
      })
      .catch((error) => {
        console.error(
          "Teacher count error:",
          error
        );
      });

  }, []);


  /* =====================================================
     USER NAME
  ===================================================== */

  const userName =
    user?.full_name ||
    user?.username ||
    "User";


  return (
    <div className="dashboard-content">

      {/* =================================================
          DASHBOARD HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome, <strong>{userName}</strong>
          </p>

        </div>

      </header>


      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <section className="dashboard-cards">

        {/* STUDENTS */}

        <div className="dashboard-card">

          <h3>
            👨‍🎓 Students
          </h3>

          <p>
            {studentCount}
          </p>

        </div>


        {/* COURSES */}

        <div className="dashboard-card">

          <h3>
            📚 Courses
          </h3>

          <p>
            3
          </p>

        </div>


        {/* TEACHERS */}

        <div className="dashboard-card">

          <h3>
            👨‍🏫 Teachers
          </h3>

          <p>
            {teacherCount}
          </p>

        </div>


        {/* NOTICES */}

        <div className="dashboard-card">

          <h3>
            📢 Notices
          </h3>

          <p>
            0
          </p>

        </div>

      </section>

    </div>
  );
}