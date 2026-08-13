import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [openMenu, setOpenMenu] = useState("students");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  return (
    <div className="admin-layout-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h2>Sunshine</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-menu">
          {/* Dashboard */}
          <NavLink to="/admin/dashboard" className="sidebar-link">
            🏠 Dashboard
          </NavLink>

          {/* Students */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("students")}
            >
              <span>👨‍🎓 Students</span>
              <span>{openMenu === "students" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "students" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/students">➕ Student Entry</NavLink>
                <NavLink to="/admin/student-list">📋 Student List</NavLink>
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("courses")}
            >
              <span>📚 Courses</span>
              <span>{openMenu === "courses" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "courses" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/courses">📖 Course List</NavLink>
                <NavLink to="/admin/course-entry">➕ Course Entry</NavLink>
              </div>
            )}
          </div>

          {/* Income & Expense */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("accounts")}
            >
              <span>💰 Income & Expense</span>
              <span>{openMenu === "accounts" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "accounts" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/income">💵 Income</NavLink>
                <NavLink to="/admin/expense">💸 Expense</NavLink>
                <NavLink to="/admin/accounts">
                  📊 Income & Expense Report
                </NavLink>
              </div>
            )}
          </div>

          {/* Teachers */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("teachers")}
            >
              <span>👨‍🏫 Teachers</span>
              <span>{openMenu === "teachers" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "teachers" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/teacher-list">📋 Teacher List</NavLink>
                <NavLink to="/admin/teachers">➕ Teacher Entry</NavLink>
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("notices")}
            >
              <span>📢 Notices</span>
              <span>{openMenu === "notices" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "notices" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/notices">📢 Notice List</NavLink>
                <NavLink to="/admin/notice-entry">➕ Add Notice</NavLink>
              </div>
            )}
          </div>

{/* Gallery */}
<div className="sidebar-group">
  <button
    type="button"
    className="sidebar-parent"
    onClick={() => toggleMenu("gallery")}
  >
    <span>🖼️ Gallery</span>
    <span>{openMenu === "gallery" ? "▲" : "▼"}</span>
  </button>

  {openMenu === "gallery" && (
    <div className="sidebar-submenu">
      <NavLink to="/admin/gallery">➕ Add Photo</NavLink>
      <NavLink to="/admin/gallery-list">🖼️ Gallery List</NavLink>
    </div>
  )}
</div>

          {/* Downloads */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("downloads")}
            >
              <span>📥 Downloads</span>
              <span>{openMenu === "downloads" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "downloads" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/downloads">📥 Download List</NavLink>
                <NavLink to="/admin/download-entry">➕ Add Download</NavLink>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("settings")}
            >
              <span>⚙️ Settings</span>
              <span>{openMenu === "settings" ? "▲" : "▼"}</span>
            </button>

            {openMenu === "settings" && (
              <div className="sidebar-submenu">
                <NavLink to="/admin/settings">⚙️ General Settings</NavLink>
                <NavLink to="/admin/admin-users">👤 Admin Users</NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <button type="button" className="logout-button">
          🚪 Logout
        </button>
      </aside>

      {/* Admin Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}