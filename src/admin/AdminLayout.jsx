import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();

  /* ================= ACTIVE MENU ================= */

  const getActiveMenu = (pathname) => {

    // STUDENTS
    if (
      pathname === "/admin/students" ||
      pathname === "/admin/student-list" ||
      pathname === "/admin/pending-students" ||
      pathname.startsWith("/admin/student-profile/") ||
      pathname.startsWith("/admin/student-edit/")
    ) {
      return "students";
    }


    // COURSES
    if (
      pathname === "/admin/courses" ||
      pathname === "/admin/course-entry" ||
      pathname === "/admin/AddCourse" ||
      pathname === "/admin/EditCourse"
    ) {
      return "courses";
    }


    // ACCOUNTS
    if (
      pathname === "/admin/income" ||
      pathname === "/admin/income-list" ||
      pathname.startsWith("/admin/income-edit/") ||
      pathname === "/admin/expense" ||
      pathname === "/admin/expense-list" ||
      pathname.startsWith("/admin/expense-edit/") ||
      pathname === "/admin/accounts"
    ) {
      return "accounts";
    }


    // TEACHERS
    if (
      pathname === "/admin/teachers" ||
      pathname === "/admin/teacher-list"
    ) {
      return "teachers";
    }


    // NOTICES
    if (
      pathname === "/admin/notices" ||
      pathname === "/admin/notice-entry" ||
      pathname.startsWith("/admin/notice-edit/")
    ) {
      return "notices";
    }


    // GALLERY
    if (
      pathname === "/admin/gallery" ||
      pathname === "/admin/gallery-list"
    ) {
      return "gallery";
    }


    // BANNERS
    if (
      pathname === "/admin/banner-list" ||
      pathname === "/admin/banner-entry"
    ) {
      return "banners";
    }


    // DOWNLOADS
    if (
      pathname === "/admin/downloads" ||
      pathname === "/admin/download-entry"
    ) {
      return "downloads";
    }


    // BRANCHES
    if (
      pathname === "/admin/branch-list" ||
      pathname === "/admin/branch-entry" ||
      pathname.startsWith("/admin/branch-edit/")
    ) {
      return "branches";
    }


    // SETTINGS
    if (
      pathname === "/admin/settings" ||
      pathname === "/admin/admin-users"
    ) {
      return "settings";
    }


    return "";
  };


  /* ================= OPEN MENU ================= */

  const [openMenu, setOpenMenu] = useState(
    getActiveMenu(location.pathname)
  );


  /* ================= AUTO OPEN ================= */

  useEffect(() => {

    const activeMenu = getActiveMenu(
      location.pathname
    );

    if (activeMenu) {
      setOpenMenu(activeMenu);
    }

  }, [location.pathname]);


  /* ================= TOGGLE ================= */

  const toggleMenu = (menu) => {

    setOpenMenu((current) =>
      current === menu ? "" : menu
    );

  };


  /* ================= MENU ACTIVE ================= */

  const isMenuActive = (menu) => {

    return (
      getActiveMenu(location.pathname) === menu
    );

  };


  return (
    <div className="admin-layout-container">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        {/* ================= HEADER ================= */}

        <div className="sidebar-header">

          <h2>Sunshine</h2>

          <p>Admin Panel</p>

        </div>


        {/* ================= MENU ================= */}

        <nav className="sidebar-menu">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>🏠 Dashboard</span>
          </NavLink>


          {/* =================================================
              STUDENTS
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("students")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("students")
              }
            >

              <span>👨‍🎓 Students</span>

              <span className="menu-arrow">

                {openMenu === "students"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "students" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/students"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Student Entry
                </NavLink>


                <NavLink
                  to="/admin/student-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Student List
                </NavLink>


                <NavLink
                  to="/admin/pending-students"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  🕐 Pending Applications
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              COURSES
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("courses")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("courses")
              }
            >

              <span>📚 Courses</span>

              <span className="menu-arrow">

                {openMenu === "courses"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "courses" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/courses"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📖 Course List
                </NavLink>


                <NavLink
                  to="/admin/AddCourse"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Course Entry
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              INCOME & EXPENSE
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("accounts")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("accounts")
              }
            >

              <span>💰 Income & Expense</span>

              <span className="menu-arrow">

                {openMenu === "accounts"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "accounts" && (

              <div className="sidebar-submenu">

                {/* ================= INCOME ================= */}

                <NavLink
                  to="/admin/income"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Income Entry
                </NavLink>


                <NavLink
                  to="/admin/income-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Income List
                </NavLink>


                {/* ================= EXPENSE ================= */}

                <NavLink
                  to="/admin/expense"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Expense Entry
                </NavLink>


                <NavLink
                  to="/admin/expense-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Expense List
                </NavLink>


                {/* ================= REPORT ================= */}

                <NavLink
                  to="/admin/income-expense-report"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📊 Income & Expense Report
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              TEACHERS
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("teachers")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("teachers")
              }
            >

              <span>👨‍🏫 Teachers</span>

              <span className="menu-arrow">

                {openMenu === "teachers"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "teachers" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/teacher-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Teacher List
                </NavLink>


                <NavLink
                  to="/admin/teachers"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Teacher Entry
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              NOTICES
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("notices")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("notices")
              }
            >

              <span>📢 Notices</span>

              <span className="menu-arrow">

                {openMenu === "notices"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "notices" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/notices"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Notice List
                </NavLink>


                <NavLink
                  to="/admin/notice-entry"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Add Notice
                </NavLink>


                <NavLink
                  to="/admin/notice-edit"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ✏️ Edit Notice
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              GALLERY
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("gallery")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("gallery")
              }
            >

              <span>🖼️ Gallery</span>

              <span className="menu-arrow">

                {openMenu === "gallery"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "gallery" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/gallery"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Add Photo
                </NavLink>


                <NavLink
                  to="/admin/gallery-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  🖼️ Gallery List
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              BANNERS
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("banners")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("banners")
              }
            >

              <span>🎞️ Banners</span>

              <span className="menu-arrow">

                {openMenu === "banners"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "banners" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/banner-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Banner List
                </NavLink>


                <NavLink
                  to="/admin/banner-entry"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Add Banner
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              DOWNLOADS
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("downloads")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("downloads")
              }
            >

              <span>📥 Downloads</span>

              <span className="menu-arrow">

                {openMenu === "downloads"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "downloads" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/downloads"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📥 Download List
                </NavLink>


                <NavLink
                  to="/admin/download-entry"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Add Download
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              BRANCHES
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("branches")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("branches")
              }
            >

              <span>🏢 Branches</span>

              <span className="menu-arrow">

                {openMenu === "branches"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "branches" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/branch-list"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  📋 Branch List
                </NavLink>


                <NavLink
                  to="/admin/branch-entry"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ➕ Branch Entry
                </NavLink>

              </div>

            )}

          </div>


          {/* =================================================
              SETTINGS
          ================================================= */}

          <div className="sidebar-group">

            <button
              type="button"
              className={`sidebar-parent ${
                isMenuActive("settings")
                  ? "parent-active"
                  : ""
              }`}
              onClick={() =>
                toggleMenu("settings")
              }
            >

              <span>⚙️ Settings</span>

              <span className="menu-arrow">

                {openMenu === "settings"
                  ? "▲"
                  : "▼"}

              </span>

            </button>


            {openMenu === "settings" && (

              <div className="sidebar-submenu">

                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  ⚙️ General Settings
                </NavLink>


                <NavLink
                  to="/admin/admin-users"
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
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


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-main">

        <Outlet />

      </main>

    </div>
  );
}