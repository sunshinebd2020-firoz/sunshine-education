import "./Dashboard.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>Sunshine</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-menu">

          <Link to="/admin/dashboard">
            🏠 Dashboard
          </Link>

          {/* Students */}
          <div className="sidebar-group">

            <div className="sidebar-parent">
              👨‍🎓 Students
            </div>

            <div className="sidebar-submenu">

              <Link to="/admin/students">
                ➕ Student Entry
              </Link>

              <Link to="/admin/student-list">
                📋 Student List
              </Link>

            </div>

          </div>

          <Link to="/admin/courses">
            📚 Courses
          </Link>

          <Link to="/admin/teachers">
            👨‍🏫 Teachers
          </Link>

          <Link to="/admin/notices">
            📢 Notices
          </Link>

          <Link to="/admin/gallery">
            🖼️ Gallery
          </Link>

          <Link to="/admin/downloads">
            📥 Downloads
          </Link>

          <Link to="/admin/settings">
            ⚙️ Settings
          </Link>

        </nav>

        <button className="logout-button">
          🚪 Logout
        </button>

      </aside>


      {/* Main Content */}
      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome to Sunshine Education Admin Panel
            </p>
          </div>

        </header>


        {/* Dashboard Cards */}
        <section className="dashboard-cards">

          <div className="dashboard-card">
            <h3>👨‍🎓 Students</h3>
            <p>0</p>
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

      </main>

    </div>
  );
}