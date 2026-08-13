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

      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h2>Sunshine</h2>
          <p>Admin Panel</p>
        </div>

        {/* Sidebar Menu */}
        <nav className="sidebar-menu">

          {/* ================= DASHBOARD ================= */}
          <NavLink
            to="/admin/dashboard"
            className="sidebar-link"
          >
            🏠 Dashboard
          </NavLink>


          {/* ================= STUDENTS ================= */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("students")}
            >
              <span>👨‍🎓 Students</span>
              <span>
                {openMenu === "students" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "students" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/students">
                  ➕ Student Entry
                </NavLink>

                <NavLink to="/admin/student-list">
                  📋 Student List
                </NavLink>

              </div>
            )}
          </div>


          {/* ================= COURSES ================= */}
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("courses")}
            >
              <span>📚 Courses</span>
              <span>
                {openMenu === "courses" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "courses" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/courses">
                  📖 Course List
                </NavLink>

                <NavLink to="/admin/course-entry">
                  ➕ Course Entry
                </NavLink>

              </div>
            )}
          </div>


          {/* ================= INCOME & EXPENSE ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("accounts")}
            >
              <span>💰 Income & Expense</span>

              <span>
                {openMenu === "accounts" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "accounts" && (
              <div className="sidebar-submenu">

                {/* Income Entry */}
                <NavLink to="/admin/income">
                  ➕ Income Entry
                </NavLink>

                {/* Income List */}
                <NavLink to="/admin/income-list">
                  📋 Income List
                </NavLink>

                {/* Expense Entry */}
                <NavLink to="/admin/expense">
                  ➕ Expense Entry
                </NavLink>

                {/* Expense List */}
                <NavLink to="/admin/expense-list">
                  📋 Expense List
                </NavLink>

                {/* Report */}
                <NavLink to="/admin/accounts">
                  📊 Income & Expense Report
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= TEACHERS ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("teachers")}
            >
              <span>👨‍🏫 Teachers</span>

              <span>
                {openMenu === "teachers" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "teachers" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/teacher-list">
                  📋 Teacher List
                </NavLink>

                <NavLink to="/admin/teachers">
                  ➕ Teacher Entry
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= NOTICES ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("notices")}
            >
              <span>📢 Notices</span>

              <span>
                {openMenu === "notices" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "notices" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/notices">
                  📢 Notice List
                </NavLink>

                <NavLink to="/admin/notice-entry">
                  ➕ Add Notice
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= GALLERY ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("gallery")}
            >
              <span>🖼️ Gallery</span>

              <span>
                {openMenu === "gallery" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "gallery" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/gallery">
                  ➕ Add Photo
                </NavLink>

                <NavLink to="/admin/gallery-list">
                  🖼️ Gallery List
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= BANNERS ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("banners")}
            >
              <span>🎞️ Banners</span>

              <span>
                {openMenu === "banners" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "banners" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/banner-list">
                  📋 Banner List
                </NavLink>

                <NavLink to="/admin/banner-entry">
                  ➕ Add Banner
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= DOWNLOADS ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("downloads")}
            >
              <span>📥 Downloads</span>

              <span>
                {openMenu === "downloads" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "downloads" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/downloads">
                  📥 Download List
                </NavLink>

                <NavLink to="/admin/download-entry">
                  ➕ Add Download
                </NavLink>

              </div>
            )}

          </div>


          {/* ================= SETTINGS ================= */}
          <div className="sidebar-group">

            <button
              type="button"
              className="sidebar-parent"
              onClick={() => toggleMenu("settings")}
            >
              <span>⚙️ Settings</span>

              <span>
                {openMenu === "settings" ? "▲" : "▼"}
              </span>
            </button>

            {openMenu === "settings" && (
              <div className="sidebar-submenu">

                <NavLink to="/admin/settings">
                  ⚙️ General Settings
                </NavLink>

                <NavLink to="/admin/admin-users">
                  👤 Admin Users
                </NavLink>

              </div>
            )}

          </div>

        </nav>


        {/* ================= LOGOUT ================= */}
        <button
          type="button"
          className="logout-button"
        >
          🚪 Logout
        </button>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="admin-main">
        <Outlet />
      </main>

    </div>
  );
}