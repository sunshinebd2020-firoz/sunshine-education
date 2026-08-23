import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import "./AdminLayout.css";
import { API_ORIGIN } from "../config/api";

export default function AdminLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================================
     USER
  ===================================================== */

  const [user, setUser] = useState(null);

  useEffect(() => {

    const savedUser =
      localStorage.getItem("sunshine_user");

    if (!savedUser) {

      navigate(
        "/admin/login",
        { replace: true }
      );

      return;
    }

    try {

      const loggedInUser =
        JSON.parse(savedUser);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(loggedInUser);

    } catch (error) {

      console.error(
        "User parse error:",
        error
      );

      localStorage.removeItem(
        "sunshine_user"
      );

      localStorage.removeItem(
        "sunshine_logged_in"
      );

      localStorage.removeItem(
        "teacher_branch"
      );

      localStorage.removeItem(
        "is_admin"
      );

      navigate(
        "/admin/login",
        { replace: true }
      );
    }

  }, [navigate]);

  /* =====================================================
     ROLE
  ===================================================== */

  const role =
    String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

  const isAdmin =
    role === "admin" ||
    role === "administrator" ||
    role === "super admin" ||
    role === "superadmin";
  const isTeacher =
    !isAdmin &&
    Boolean(String(user?.teacher_id || "").trim());


  /*
    IMPORTANT:

    Admin-এর teacher_id না থাকলেও কোনো সমস্যা নেই।

    Teacher-এর branch user.branch থেকে নেওয়া হবে।
  */

  const userBranch =
    String(
      user?.branch ||
      user?.branch_name ||
      ""
    ).trim();

  /* =====================================================
     PERMISSIONS
  ===================================================== */

  const permissions =
    Array.isArray(
      user?.permissions
    )
      ? user.permissions
      : [];

  /* =====================================================
     NORMALIZE PERMISSION
  ===================================================== */

  const normalizePermission =
    (value) => {

      if (!value) {
        return "";
      }

      return String(value)
        .trim()
        .toLowerCase()
        .replace(
          /[\s_-]+/g,
          ""
        )
        .replace(
          /s$/,
          ""
        );
    };

  /* =====================================================
     HAS PERMISSION
  ===================================================== */

  const hasPermission =
    (
      moduleName,
      action = "can_view"
    ) => {

      const normalizedModule =
        normalizePermission(
          moduleName
        );

      /*
        "all" permission থাকলেও full access
      */

      const allPermission =
        permissions.find(
          (item) =>
            normalizePermission(
              item?.permission
            ) === "all"
        );

      if (allPermission) {

        return (
          Number(
            allPermission[action]
          ) === 1 ||
          allPermission[action] === true
        );
      }

      const permission =
        permissions.find(
          (item) =>
            normalizePermission(
              item?.permission
            ) ===
            normalizedModule
        );

      if (!permission) {
        return false;
      }

      return (
        Number(
          permission[action]
        ) === 1 ||
        permission[action] === true
      );
    };

  /* =====================================================
     MODULE MAP
  ===================================================== */

  const permissionMap = {

    students: "student",

    courses: "course",

    accounts: "account",

    teachers: "teacher",

    notices: "notice",

    gallery: "gallery",

    banners: "banner",

    downloads: "download",

    branches: "branch",

    settings: "setting",
  };

  /* =====================================================
     ACCOUNT PARENT
  ===================================================== */

  const canViewAccounts =
    isAdmin ||
    hasPermission(
      "income",
      "can_view"
    ) ||
    hasPermission(
      "expense",
      "can_view"
    ) ||
    hasPermission(
      "report",
      "can_view"
    );

  /* =====================================================
     MENU VIEW
  ===================================================== */

  const canViewMenu =
    (menu) => {

      if (menu === "accounts") {
        return canViewAccounts;
      }

      return hasPermission(
        permissionMap[menu],
        "can_view"
      );
    };

  /* =====================================================
     ACTIVE MENU
  ===================================================== */

  const getActiveMenu =
    (pathname) => {

      if (
        pathname === "/admin/students" ||
        pathname === "/admin/student-list" ||
        pathname === "/admin/pending-students" ||
        pathname.startsWith(
          "/admin/student-profile/"
        ) ||
        pathname.startsWith(
          "/admin/student-edit/"
        )
      ) {

        return "students";
      }

      if (
        pathname === "/admin/courses" ||
        pathname === "/admin/AddCourse" ||
        pathname === "/admin/course-entry"
      ) {

        return "courses";
      }

      if (
        pathname === "/admin/income" ||
        pathname === "/admin/income-list" ||
        pathname.startsWith(
          "/admin/income-edit/"
        ) ||
        pathname === "/admin/due-list" ||
        pathname.startsWith(
          "/admin/due-edit/"
        ) ||
        pathname === "/admin/expense" ||
        pathname === "/admin/expense-list" ||
        pathname.startsWith(
          "/admin/expense-edit/"
        ) ||
        pathname ===
          "/admin/income-expense-report"
      ) {

        return "accounts";
      }

      if (
        pathname === "/admin/teachers" ||
        pathname === "/admin/teacher-list"
      ) {

        return "teachers";
      }

      if (
        pathname === "/admin/notices" ||
        pathname === "/admin/notice-entry" ||
        pathname.startsWith(
          "/admin/notice-edit/"
        )
      ) {

        return "notices";
      }

      if (
        pathname === "/admin/gallery" ||
        pathname === "/admin/gallery-list"
      ) {

        return "gallery";
      }

      if (
        pathname === "/admin/banner-list" ||
        pathname === "/admin/banner-entry"
      ) {

        return "banners";
      }

      if (
        pathname === "/admin/downloads" ||
        pathname === "/admin/download-entry"
      ) {

        return "downloads";
      }

      if (
        pathname === "/admin/branch-list" ||
        pathname === "/admin/branch-entry" ||
        pathname.startsWith(
          "/admin/branch-edit/"
        )
      ) {

        return "branches";
      }

      if (
        pathname === "/admin/settings" ||
        pathname === "/admin/admin-users"
      ) {

        return "settings";
      }

      return "";
    };

  /* =====================================================
     OPEN MENU
  ===================================================== */

  const [openMenu, setOpenMenu] =
    useState(
      getActiveMenu(
        location.pathname
      )
    );

  useEffect(() => {

    const activeMenu =
      getActiveMenu(
        location.pathname
      );

    if (activeMenu) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenMenu(activeMenu);
    }

  }, [location.pathname]);

  /* =====================================================
     DIRECT URL PROTECTION
  ===================================================== */

  useEffect(() => {

    if (!user) {
      return;
    }

    if (
      location.pathname ===
      "/admin/dashboard"
    ) {
      return;
    }

    const activeMenu =
      getActiveMenu(
        location.pathname
      );

    if (!activeMenu) {
      return;
    }

    /* =================================================
       ACCOUNTS
    ================================================= */

    if (
      activeMenu === "accounts"
    ) {

      let allowed = false;

      /* Income Entry */

      if (
        location.pathname ===
        "/admin/income"
      ) {

        allowed =
          hasPermission(
            "income",
            "can_add"
          );
      }

      /* Income List */

      else if (
        location.pathname ===
        "/admin/income-list"
      ) {

        allowed =
          hasPermission(
            "income",
            "can_view"
          );
      }

      /* Income Edit */

      else if (
        location.pathname.startsWith(
          "/admin/income-edit/"
        )
      ) {

        allowed =
          hasPermission(
            "income",
            "can_edit"
          );
      }

      /* Due List */

      else if (
        location.pathname ===
        "/admin/due-list"
      ) {

        allowed =
          hasPermission(
            "income",
            "can_view"
          );
      }

      /* Due Edit */

      else if (
        location.pathname.startsWith(
          "/admin/due-edit/"
        )
      ) {

        allowed =
          hasPermission(
            "income",
            "can_edit"
          );
      }

      /* Expense Entry */

      else if (
        location.pathname ===
        "/admin/expense"
      ) {

        allowed =
          hasPermission(
            "expense",
            "can_add"
          );
      }

      /* Expense List */

      else if (
        location.pathname ===
        "/admin/expense-list"
      ) {

        allowed =
          hasPermission(
            "expense",
            "can_view"
          );
      }

      /* Expense Edit */

      else if (
        location.pathname.startsWith(
          "/admin/expense-edit/"
        )
      ) {

        allowed =
          hasPermission(
            "expense",
            "can_edit"
          );
      }

      /* Report */

      else if (
        location.pathname ===
        "/admin/income-expense-report"
      ) {

        allowed =
          hasPermission(
            "report",
            "can_view"
          );
      }

      if (!allowed) {

        navigate(
          "/admin/dashboard",
          {
            replace: true
          }
        );
      }

      return;
    }

    /* =================================================
       OTHER MODULES
    ================================================= */

    if (
      !canViewMenu(
        activeMenu
      )
    ) {

      navigate(
        "/admin/dashboard",
        {
          replace: true
        }
      );
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    location.pathname
  ]);

  /* =====================================================
     TOGGLE MENU
  ===================================================== */

  const toggleMenu =
    (menu) => {

      setOpenMenu(
        (current) =>
          current === menu
            ? ""
            : menu
      );
    };

  /* =====================================================
     MENU ACTIVE
  ===================================================== */

  const isMenuActive =
    (menu) => {

      return (
        getActiveMenu(
          location.pathname
        ) === menu
      );
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    () => {

      localStorage.removeItem(
        "sunshine_user"
      );

      localStorage.removeItem(
        "sunshine_logged_in"
      );

      localStorage.removeItem(
        "teacher_branch"
      );

      localStorage.removeItem(
        "is_admin"
      );

      localStorage.removeItem(
        "admin"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "loggedInUser"
      );

      localStorage.removeItem(
        "admin_id"
      );

      localStorage.removeItem(
        "user_id"
      );

      sessionStorage.clear();

      navigate(
        "/admin/login",
        {
          replace: true
        }
      );
    };

  /* =====================================================
     USER NAME
  ===================================================== */

  const userName =
    user?.full_name ||
    user?.username ||
    "User";

  /* =====================================================
     USER ROLE
  ===================================================== */

  const userRole =
    user?.role ||
    "User";

  /* =====================================================
     USER PHOTO
  ===================================================== */

  const userPhoto =
    user?.photo ||
    user?.profile_photo ||
    user?.avatar ||
    "";

  /* =====================================================
     USER PHOTO URL
  ===================================================== */

  const getUserPhotoUrl =
    () => {

      if (!userPhoto) {
        return "";
      }

      const photo =
        String(
          userPhoto
        ).trim();

      if (
        photo.startsWith(
          "http://"
        ) ||
        photo.startsWith(
          "https://"
        ) ||
        photo.startsWith(
          "data:"
        )
      ) {

        return photo;
      }

      const cleanPhoto =
        photo.replace(
          /^[/\\]+/,
          ""
        );

      return (
        `${API_ORIGIN}/uploads/teachers/` +
        cleanPhoto
      );
    };

  const userPhotoUrl =
    getUserPhotoUrl();

  /* =====================================================
     USER INITIAL
  ===================================================== */

  const userInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

  /* =====================================================
     WAIT
  ===================================================== */

  if (!user) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px"
        }}
      >
        Loading...
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="admin-layout-container">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        {/* =================================================
            USER PROFILE
        ================================================= */}

        <div className="sidebar-user-profile">

          <div className="sidebar-user-photo">

            {userPhotoUrl ? (

              <img
                src={userPhotoUrl}
                alt={userName}
                onError={(e) => {

                  e.currentTarget.style.display =
                    "none";

                  e.currentTarget.parentElement
                    .classList.add(
                      "photo-fallback"
                    );
                }}
              />

            ) : (

              <span>
                {userInitial}
              </span>

            )}

          </div>

          <div className="sidebar-user-info">

            <div className="sidebar-user-name">
              {userName}
            </div>

            <div className="sidebar-user-role">
              {userRole}
            </div>

            {/* Teacher-এর branch দেখাবে */}
            {!isAdmin && userBranch && (

              <div
                className="sidebar-user-branch"
                title={userBranch}
              >
                {userBranch}
              </div>

            )}

          </div>

        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <nav className="sidebar-menu">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <span>
              🏠 Dashboard
            </span>

          </NavLink>
          {isTeacher && (
            <NavLink
              to="/admin/my-classroom"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>My Classroom</span>
            </NavLink>
          )}

          {/* =================================================
              STUDENTS
          ================================================= */}

          {canViewMenu("students") && (

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

                <span>
                  👨‍🎓 Students
                </span>

                <span className="menu-arrow">
                  {openMenu === "students"
                    ? "▲"
                    : "▼"}
                </span>

              </button>

              {openMenu === "students" && (

                <div className="sidebar-submenu">

                  {hasPermission(
                    "student",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/student-list"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      📋 Student List
                    </NavLink>

                  )}

                  {hasPermission(
                    "student",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/pending-students"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      🕐 Pending Applications
                    </NavLink>

                  )}

                </div>

              )}

            </div>
          )}

          {/* =================================================
              COURSES
          ================================================= */}

          {canViewMenu("courses") && (
            <NavLink
              to="/admin/courses"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>📚 Courses</span>
            </NavLink>
          )}

          {/* =================================================
              ACCOUNTS
          ================================================= */}

          {canViewAccounts && (

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

                <span>
                  💰 Income & Expense
                </span>

                <span className="menu-arrow">
                  {openMenu === "accounts"
                    ? "▲"
                    : "▼"}
                </span>

              </button>

              {openMenu === "accounts" && (

                <div className="sidebar-submenu">

                  {/* Income List */}

                  {hasPermission(
                    "income",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/income-list"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      📋 Income List
                    </NavLink>

                  )}

                  {/* Due List */}

                  {hasPermission(
                    "income",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/due-list"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      💳 Due List
                    </NavLink>

                  )}

                  {/* Expense List */}

                  {hasPermission(
                    "expense",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/expense-list"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      📋 Expense List
                    </NavLink>

                  )}

                  {/* Report */}

                  {hasPermission(
                    "report",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/income-expense-report"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      📊 Income & Expense Report
                    </NavLink>

                  )}

                </div>

              )}

            </div>
          )}

          {/* =================================================
              TEACHERS
          ================================================= */}

          {canViewMenu("teachers") && (
            <NavLink
              to="/admin/teacher-list"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>👨‍🏫 Teachers</span>
            </NavLink>
          )}

          {/* =================================================
              NOTICES
          ================================================= */}

          {canViewMenu("notices") && (
            <NavLink
              to="/admin/notices"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>📢 Notices</span>
            </NavLink>
          )}

          {/* =================================================
              GALLERY
          ================================================= */}

          {canViewMenu("gallery") && (
            <NavLink
              to="/admin/gallery-list"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>🖼️ Gallery</span>
            </NavLink>
          )}

          {/* =================================================
              BANNERS
          ================================================= */}

          {canViewMenu("banners") && (
            <NavLink
              to="/admin/banner-list"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>🎞️ Banners</span>
            </NavLink>
          )}

          {/* =================================================
              DOWNLOADS
          ================================================= */}

          {canViewMenu("downloads") && (
            <NavLink
              to="/admin/downloads"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>📥 Downloads</span>
            </NavLink>
          )}

          {/* =================================================
              BRANCHES
          ================================================= */}

          {canViewMenu("branches") && (
            <NavLink
              to="/admin/branch-list"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>🏢 Branches</span>
            </NavLink>
          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {canViewMenu("settings") && (

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

                <span>
                  ⚙️ Settings
                </span>

                <span className="menu-arrow">
                  {openMenu === "settings"
                    ? "▲"
                    : "▼"}
                </span>

              </button>

              {openMenu === "settings" && (

                <div className="sidebar-submenu">

                  {hasPermission(
                    "setting",
                    "can_view"
                  ) && (

                    <NavLink
                      to="/admin/settings"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      ⚙️ General Settings
                    </NavLink>

                  )}

                  {(isAdmin ||
                    hasPermission("setting", "can_add") ||
                    hasPermission("setting", "can_edit")) && (

                    <NavLink
                      to="/admin/admin-users"
                      className={({ isActive }) =>
                        isActive
                          ? "active"
                          : ""
                      }
                    >
                      👤 Admin Users
                    </NavLink>

                  )}

                </div>

              )}

            </div>
          )}

        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="admin-main">

        <Outlet />

      </main>

    </div>
  );
}
