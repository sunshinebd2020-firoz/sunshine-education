import { useEffect, useMemo, useState } from "react";
import "./TeacherList.css";
import PermissionModal from "./PermissionModal";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

const IMAGE_BASE_URL = `${API_ORIGIN}/uploads/teachers`;

export default function TeacherList({ onEditTeacher }) {

  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myPermissions, setMyPermissions] = useState({});
  const [permissionLoading, setPermissionLoading] =
    useState(true);

  const [showUserModal, setShowUserModal] =
    useState(false);

  const [selectedTeacher, setSelectedTeacher] =
    useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Teacher");

  const [userLoading, setUserLoading] =
    useState(false);

  const [permissionTeacher, setPermissionTeacher] =
    useState(null);


  /* =====================================================
     CURRENT USER
  ===================================================== */

  const getCurrentAdmin = () => {

    const possibleKeys = [
      "sunshine_user",
      "admin",
      "user",
      "loggedInUser",
      "currentUser",
      "adminUser",
      "userData"
    ];

    for (const key of possibleKeys) {

      try {

        const value =
          localStorage.getItem(key);

        if (!value) continue;

        const parsed =
          JSON.parse(value);

        if (
          parsed &&
          (
            parsed.id ||
            parsed.admin_id ||
            parsed.user_id
          )
        ) {
          return parsed;
        }

      } catch {
        // Ignore invalid JSON
      }
    }

    const adminId =
      localStorage.getItem("admin_id") ||
      localStorage.getItem("user_id");

    if (adminId) {

      return {
        id: adminId,
        admin_id: adminId
      };
    }

    return null;
  };


  /* =====================================================
     CURRENT ADMIN ID
  ===================================================== */

  const getCurrentAdminId = () => {

    const admin =
      getCurrentAdmin();

    if (!admin) return "";

    return String(
      admin.id ||
      admin.admin_id ||
      admin.user_id ||
      ""
    ).trim();
  };


  /* =====================================================
     CURRENT ROLE
  ===================================================== */

  const getCurrentRole = () => {

    const admin =
      getCurrentAdmin();

    if (!admin) return "";

    return String(
      admin.role ||
      admin.user_role ||
      admin.userRole ||
      ""
    )
      .trim()
      .toLowerCase();
  };


  /* =====================================================
     ADMINISTRATOR CHECK
  ===================================================== */

  const isAdministrator = () => {

    const roleValue =
      getCurrentRole();

    return [
      "admin",
      "administrator",
      "super admin",
      "superadmin"
    ].includes(roleValue);
  };


  /* =====================================================
     LOAD MY PERMISSIONS
  ===================================================== */

  const loadMyPermissions = async () => {

    /*
    -----------------------------------------------------
    ADMINISTRATOR = FULL ACCESS
    -----------------------------------------------------
    */

    if (isAdministrator()) {

      setMyPermissions({

        teacher: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        student: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        course: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        branch: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        income: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        expense: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        report: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        notice: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        gallery: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        banner: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        download: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        },

        setting: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        }

      });

      setPermissionLoading(false);
      return;
    }


    const adminId =
      getCurrentAdminId();

    if (!adminId) {

      setMyPermissions({});
      setPermissionLoading(false);

      return;
    }


    try {

      setPermissionLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/permission_get.php?admin_id=${encodeURIComponent(
            adminId
          )}`,
          {
            method: "GET",
            credentials: "include",

            headers: {
              Accept: "application/json"
            }
          }
        );


      const responseText =
        await response.text();


      if (!responseText.trim()) {

        throw new Error(
          "Permission server returned empty response."
        );
      }


      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Invalid JSON response from permission_get.php."
        );
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Permission load failed."
        );
      }


      const permissionMap = {};


      if (
        Array.isArray(
          data.permissions
        )
      ) {

        data.permissions.forEach(
          item => {

            /*
            ------------------------------------------------
            IMPORTANT:
            permission / module / name সব support করবে
            ------------------------------------------------
            */

            const key =
              String(
                item.permission ||
                item.module ||
                item.name ||
                ""
              )
                .trim()
                .toLowerCase();


            if (!key) return;


            permissionMap[key] = {

              can_view:
                Number(item.can_view) === 1,

              can_add:
                Number(item.can_add) === 1,

              can_edit:
                Number(item.can_edit) === 1,

              can_delete:
                Number(item.can_delete) === 1

            };

          }
        );
      }


      setMyPermissions(
        permissionMap
      );

    } catch (err) {

      console.error(
        "Permission Load Error:",
        err
      );

      setMyPermissions({});

    } finally {

      setPermissionLoading(false);

    }
  };


  /* =====================================================
     TEACHER PERMISSIONS
  ===================================================== */

  const teacherPermission =
    myPermissions.teacher || {};


  /*
  ---------------------------------------------------------
  VIEW ONLY USER-ও Teacher List দেখতে পারবে
  ---------------------------------------------------------
  */

  const canViewTeacher =
    isAdministrator() ||
    teacherPermission.can_view === true;


  const canAddTeacher =
    isAdministrator() ||
    teacherPermission.can_add === true;


  const canEditTeacher =
    isAdministrator() ||
    teacherPermission.can_edit === true;


  const canDeleteTeacher =
    isAdministrator() ||
    teacherPermission.can_delete === true;


  /* =====================================================
     PERMISSION MANAGEMENT
  ===================================================== */

  const settingPermission =
    myPermissions.setting || {};


  const canManagePermissions =
    isAdministrator() ||
    settingPermission.can_add === true ||
    settingPermission.can_edit === true;


  /* =====================================================
     FETCH TEACHERS
  ===================================================== */

  const fetchTeachers = async signal => {

    try {

      setLoading(true);
      setError("");


      const response =
        await fetch(
          `${API_BASE_URL}/teacher_list.php`,
          {
            method: "GET",
            credentials: "include",
            signal,

            headers: {
              Accept: "application/json"
            }
          }
        );


      const responseText =
        await response.text();


      console.log(
        "Teacher API Response:",
        responseText
      );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );
      }


      if (!responseText.trim()) {

        throw new Error(
          "Empty server response."
        );
      }


      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Invalid JSON response from teacher_list.php"
        );
      }


      if (
        data.success &&
        Array.isArray(data.teachers)
      ) {

        /*
        ---------------------------------------------------
        OLD → NEW
        ---------------------------------------------------

        admission/joining/created date অনুযায়ী
        পুরোনো Teacher আগে থাকবে।
        */

        const sortedTeachers =
          [...data.teachers].sort(
            (a, b) => {

              const dateA =
                new Date(
                  a.joining_date ||
                  a.created_at ||
                  a.id ||
                  0
                ).getTime();

              const dateB =
                new Date(
                  b.joining_date ||
                  b.created_at ||
                  b.id ||
                  0
                ).getTime();


              if (
                Number.isNaN(dateA) ||
                Number.isNaN(dateB)
              ) {

                return (
                  Number(a.id || 0) -
                  Number(b.id || 0)
                );
              }


              return dateA - dateB;

            }
          );


        setTeachers(
          sortedTeachers
        );

      } else {

        throw new Error(
          data.message ||
          "Teacher information not found."
        );
      }

    } catch (err) {

      if (
        err.name === "AbortError"
      ) {
        return;
      }


      console.error(
        "Teacher List Error:",
        err
      );


      setError(
        `Teacher List load করা যাচ্ছে না। ${
          err.message || ""
        }`
      );

    } finally {

      if (!signal?.aborted) {

        setLoading(false);

      }
    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    const controller =
      new AbortController();


    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMyPermissions();

    fetchTeachers(
      controller.signal
    );


    return () => {

      controller.abort();

    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async teacherId => {

    if (!canDeleteTeacher) {

      alert(
        "আপনার Teacher Delete করার permission নেই।"
      );

      return;
    }


    if (!teacherId) {

      alert(
        "Teacher ID পাওয়া যায়নি।"
      );

      return;
    }


    const confirmed =
      window.confirm(
        `আপনি কি নিশ্চিতভাবে ID: ${teacherId} ডিলিট করতে চান?`
      );


    if (!confirmed) return;


    try {

      const response =
        await fetch(
          `${API_BASE_URL}/teacher_delete.php`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json"
            },

            body: JSON.stringify({

              teacher_id:
                teacherId,

              requester_admin_id:
                getCurrentAdminId()

            })
          }
        );


      const text =
        await response.text();


      let result;

      try {

        result =
          JSON.parse(text);

      } catch {

        alert(
          "Server থেকে invalid response এসেছে।"
        );

        return;
      }


      if (result.success) {

        alert(
          "Teacher deleted successfully!"
        );


        setTeachers(
          prev =>
            prev.filter(
              teacher =>
                String(
                  teacher.teacher_id
                ) !==
                String(
                  teacherId
                )
            )
        );

      } else {

        alert(
          result.message ||
          "Delete failed!"
        );
      }

    } catch (err) {

      console.error(
        "Delete Error:",
        err
      );


      alert(
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
      );
    }
  };


  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = teacher => {

    if (!canEditTeacher) {

      alert(
        "আপনার Teacher Edit করার permission নেই।"
      );

      return;
    }


    if (onEditTeacher) {

      onEditTeacher(
        teacher
      );

    } else {

      alert(
        `Edit: ${
          teacher.name_en ||
          teacher.name_bn ||
          teacher.teacher_id
        }`
      );
    }
  };


  /* =====================================================
     DETAILS
  ===================================================== */

  const handleDetails = teacher => {

    if (!canViewTeacher) {

      alert(
        "আপনার Teacher List দেখার permission নেই।"
      );

      return;
    }


    alert(
      `Teacher Details

ID:
${teacher.teacher_id || "N/A"}

Name:
${
  teacher.name_en ||
  teacher.name_bn ||
  "N/A"
}

Course:
${teacher.course || "N/A"}

Designation:
${teacher.designation || "N/A"}

Branch:
${teacher.branch || "N/A"}

Mobile:
${teacher.mobile || "N/A"}

User:
${
  teacher.user_created
    ? teacher.username
    : "Not Created"
}

Role:
${teacher.role || "N/A"}`
    );
  };


  /* =====================================================
     ADD USER
  ===================================================== */

  const openAddUserModal = teacher => {

    if (!canAddTeacher) {

      alert(
        "আপনার Teacher-এর User Account তৈরি করার permission নেই।"
      );

      return;
    }


    setSelectedTeacher(
      teacher
    );


    setUsername(
      teacher.teacher_id
        ? String(
            teacher.teacher_id
          ).toLowerCase()
        : ""
    );


    setPassword("");
    setRole("Teacher");

    setShowUserModal(true);
  };


  /* =====================================================
     CLOSE USER MODAL
  ===================================================== */

  const closeUserModal = () => {

    if (userLoading) return;

    setShowUserModal(false);
    setSelectedTeacher(null);
    setUsername("");
    setPassword("");
    setRole("Teacher");
  };


  /* =====================================================
     CREATE USER
  ===================================================== */

  const handleCreateUser = async e => {

    e.preventDefault();


    if (!canAddTeacher) {

      alert(
        "আপনার User Account তৈরি করার permission নেই।"
      );

      return;
    }


    if (!selectedTeacher) {

      alert(
        "Teacher নির্বাচন করা হয়নি।"
      );

      return;
    }


    const cleanUsername =
      username.trim();


    if (!cleanUsername) {

      alert(
        "Username দিন।"
      );

      return;
    }


    if (!password) {

      alert(
        "Password দিন।"
      );

      return;
    }


    if (password.length < 6) {

      alert(
        "Password কমপক্ষে 6 characters হতে হবে।"
      );

      return;
    }


    const teacherId =
      selectedTeacher.teacher_id;


    if (!teacherId) {

      alert(
        "Teacher ID পাওয়া যায়নি।"
      );

      return;
    }


    const fullName =
      selectedTeacher.name_en ||
      selectedTeacher.name_bn ||
      String(teacherId);


    const requestData = {

      teacher_id:
        String(teacherId),

      username:
        cleanUsername,

      password:
        password,

      full_name:
        fullName,

      role:
        role,

      status:
        "1"
    };


    try {

      setUserLoading(true);


      const response =
        await fetch(
          `${API_BASE_URL}/user_create.php`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json"
            },

            body:
              JSON.stringify(
                requestData
              )
          }
        );


      const responseText =
        await response.text();


      if (!responseText.trim()) {

        alert(
          `Server থেকে কোনো response পাওয়া যায়নি।

HTTP Status: ${response.status}`
        );

        return;
      }


      let result;

      try {

        result =
          JSON.parse(
            responseText
          );

      } catch {

        alert(
          `PHP থেকে valid JSON পাওয়া যায়নি।

${responseText.substring(
  0,
  1000
)}`
        );

        return;
      }


      if (
        !response.ok ||
        !result.success
      ) {

        alert(
          result.message ||
          "User account তৈরি করা যায়নি।"
        );

        return;
      }


      const adminId =
        result.admin_id ||
        result.user_id ||
        null;


      setTeachers(
        prev =>
          prev.map(
            teacher => {

              if (
                String(
                  teacher.teacher_id
                ) ===
                String(
                  teacherId
                )
              ) {

                return {

                  ...teacher,

                  user_created:
                    true,

                  user_id:
                    adminId,

                  admin_id:
                    adminId,

                  username:
                    cleanUsername,

                  role:
                    role,

                  user_role:
                    role,

                  user_status:
                    "1"
                };
              }


              return teacher;
            }
          )
      );


      alert(
        `User account successfully created!

Username: ${cleanUsername}

Admin ID: ${
          adminId || "N/A"
        }`
      );


      closeUserModal();

    } catch (err) {

      console.error(
        "Create User Error:",
        err
      );


      alert(
        `Server-এর সাথে যোগাযোগ করা যাচ্ছে না।

Error:
${err.message}`
      );

    } finally {

      setUserLoading(false);
    }
  };


  /* =====================================================
     PERMISSION MODAL
  ===================================================== */

  const handlePermission = teacher => {

    if (!canManagePermissions) {

      alert(
        "আপনার অন্য User-এর permission পরিবর্তন করার permission নেই।"
      );

      return;
    }


    if (!teacher.user_created) {

      alert(
        "প্রথমে এই Teacher-এর User Account তৈরি করুন।"
      );

      return;
    }


    const userId =
      teacher.admin_id ||
      teacher.user_id;


    if (!userId) {

      alert(
        "এই User-এর ID পাওয়া যাচ্ছে না।"
      );

      return;
    }


    if (
      String(userId) ===
      String(getCurrentAdminId())
    ) {

      alert(
        "আপনি নিজের permission নিজে পরিবর্তন করতে পারবেন না।"
      );

      return;
    }


    setPermissionTeacher({

      ...teacher,

      user_id:
        userId,

      admin_id:
        userId

    });
  };


  const closePermissionModal =
    () => {

      setPermissionTeacher(
        null
      );

    };


  /* =====================================================
     UNIQUE BRANCHES
  ===================================================== */

  const branchOptions =
    useMemo(() => {

      return [
        ...new Set(
          teachers
            .map(
              teacher =>
                String(
                  teacher.branch || ""
                ).trim()
            )
            .filter(Boolean)
        )
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            "en",
            {
              sensitivity:
                "base"
            }
          )
      );

    }, [teachers]);


  /* =====================================================
     UNIQUE DESIGNATIONS
  ===================================================== */

  const designationOptions =
    useMemo(() => {

      return [
        ...new Set(
          teachers
            .map(
              teacher =>
                String(
                  teacher.designation || ""
                ).trim()
            )
            .filter(Boolean)
        )
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            "en",
            {
              sensitivity:
                "base"
            }
          )
      );

    }, [teachers]);


  /* =====================================================
     FILTER + OLD TO NEW
  ===================================================== */

  const filteredTeachers =
    useMemo(() => {

      const query =
        searchTerm
          .trim()
          .toLowerCase();


      const filtered =
        teachers.filter(
          teacher => {

            const matchesSearch =
              !query ||
              String(
                teacher.teacher_id || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.name_en || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.name_bn || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.mobile || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.course || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.designation || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.branch || ""
              )
                .toLowerCase()
                .includes(query) ||

              String(
                teacher.username || ""
              )
                .toLowerCase()
                .includes(query);


            const matchesBranch =
              !selectedBranch ||
              String(
                teacher.branch || ""
              ).trim() ===
              selectedBranch;


            const matchesDesignation =
              !selectedDesignation ||
              String(
                teacher.designation || ""
              ).trim() ===
              selectedDesignation;


            return (
              matchesSearch &&
              matchesBranch &&
              matchesDesignation
            );

          }
        );


      /*
      -----------------------------------------------------
      OLD → NEW
      -----------------------------------------------------
      */

      return [...filtered].sort(
        (a, b) => {

          const dateA =
            new Date(
              a.joining_date ||
              a.created_at ||
              0
            ).getTime();

          const dateB =
            new Date(
              b.joining_date ||
              b.created_at ||
              0
            ).getTime();


          if (
            !Number.isNaN(dateA) &&
            !Number.isNaN(dateB) &&
            dateA !== dateB
          ) {

            return dateA - dateB;
          }


          /*
          একই date হলে ID দিয়ে পুরোনো আগে
          */

          return (
            Number(a.id || 0) -
            Number(b.id || 0)
          );

        }
      );

    }, [
      teachers,
      searchTerm,
      selectedBranch,
      selectedDesignation
    ]);


  /* =====================================================
     CLEAR FILTER
  ===================================================== */

  const clearFilters = () => {

    setSearchTerm("");
    setSelectedBranch("");
    setSelectedDesignation("");

  };


  /* =====================================================
     VIEW PERMISSION
  ===================================================== */

  if (
    !permissionLoading &&
    !canViewTeacher
  ) {

    return (

      <div className="teacher-container">

        <div className="teacher-message error">

          আপনার Teacher List দেখার permission নেই।

        </div>

      </div>

    );
  }


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="teacher-container">


      {/* =================================================
          HEADER — INCOME STYLE
      ================================================= */}

      <div className="teacher-header">

        <div className="header-text">

          <h1>
            Teacher List
          </h1>

          <p>
            নিবন্ধিত শিক্ষকদের তালিকা
          </p>

          <p className="teacher-current-info">

            {selectedBranch
              ? `Branch: ${selectedBranch}`
              : "All Branches"}

            {" • "}

            {selectedDesignation
              ? `Designation: ${selectedDesignation}`
              : "All Designations"}

          </p>

        </div>


        <div className="total-badge">

          <span>
            Total Teachers
          </span>

          <strong>
            {filteredTeachers.length}
          </strong>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="teacher-filters">

        <input
          type="text"

          placeholder="Search ID, name, mobile, course, branch..."

          value={searchTerm}

          onChange={e =>
            setSearchTerm(
              e.target.value
            )
          }

          className="search-input"
        />


        <select
          value={selectedBranch}

          onChange={e =>
            setSelectedBranch(
              e.target.value
            )
          }

          className="teacher-filter-select"
        >

          <option value="">
            All Branches
          </option>

          {branchOptions.map(
            branch => (

              <option
                key={branch}
                value={branch}
              >
                {branch}
              </option>

            )
          )}

        </select>


        <select
          value={selectedDesignation}

          onChange={e =>
            setSelectedDesignation(
              e.target.value
            )
          }

          className="teacher-filter-select"
        >

          <option value="">
            All Designations
          </option>

          {designationOptions.map(
            designation => (

              <option
                key={designation}
                value={designation}
              >
                {designation}
              </option>

            )
          )}

        </select>


        <button
          type="button"

          className="teacher-clear-filter"

          onClick={
            clearFilters
          }
        >
          Clear
        </button>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="teacher-message">

          Loading teachers...

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="teacher-message error">

          {error}

        </div>

      )}


      {/* =================================================
          TABLE
      ================================================= */}

      {!loading &&
        !error && (

          <div className="table-card">

            {filteredTeachers.length === 0 ? (

              <div className="teacher-message">

                No teachers found.

              </div>

            ) : (

              <div className="table-responsive">

                <table className="teacher-table">

                  <thead>

                    <tr>

                      <th>Photo</th>
                      <th>ID No</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Designation</th>
                      <th>Branch</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>User</th>
                      <th>Action</th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredTeachers.map(
                      teacher => (

                        <tr
                          key={
                            teacher.id ||
                            teacher.teacher_id
                          }
                        >


                          {/* PHOTO */}

                          <td>

                            <div className="teacher-photo">

                              {teacher.photo ? (

                                <img
                                  src={`${IMAGE_BASE_URL}/${teacher.photo}`}

                                  alt={
                                    teacher.name_en ||
                                    "Teacher"
                                  }

                                  loading="lazy"
                                />

                              ) : (

                                <div className="no-photo">

                                  No Photo

                                </div>

                              )}

                            </div>

                          </td>


                          {/* ID */}

                          <td className="teacher-id">

                            {
                              teacher.teacher_id
                            }

                          </td>


                          {/* NAME */}

                          <td>

                            <div className="name-wrapper">

                              <span className="name-en">

                                {
                                  teacher.name_en ||
                                  teacher.name_bn ||
                                  "N/A"
                                }

                              </span>


                              {teacher.name_bn &&
                                teacher.name_en && (

                                  <span className="name-bn">

                                    {
                                      teacher.name_bn
                                    }

                                  </span>

                                )}

                            </div>

                          </td>


                          {/* COURSE */}

                          <td>

                            {
                              teacher.course ||
                              "N/A"
                            }

                          </td>


                          {/* DESIGNATION */}

                          <td>

                            {
                              teacher.designation ||
                              "N/A"
                            }

                          </td>


                          {/* BRANCH */}

                          <td>

                            {
                              teacher.branch ||
                              "N/A"
                            }

                          </td>


                          {/* MOBILE */}

                          <td>

                            {
                              teacher.mobile ||
                              "N/A"
                            }

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-pill ${
                                teacher.status ===
                                  "Present" ||
                                teacher.status ===
                                  "active" ||
                                teacher.status ===
                                  "1"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >

                              {
                                teacher.status ||
                                "Present"
                              }

                            </span>

                          </td>


                          {/* USER */}

                          <td>

                            {teacher.user_created ? (

                              <div className="user-status-wrapper">

                                <span className="user-active-badge">

                                  ✓ Active

                                </span>


                                <small>

                                  {
                                    teacher.username ||
                                    "User"
                                  }

                                </small>


                                {teacher.role && (

                                  <small>

                                    Role:{" "}

                                    {
                                      teacher.role
                                    }

                                  </small>

                                )}

                              </div>

                            ) : canAddTeacher ? (

                              <button
                                type="button"

                                className="btn-add-user"

                                title="Create User Account"

                                onClick={() =>
                                  openAddUserModal(
                                    teacher
                                  )
                                }
                              >

                                👤 Add User

                              </button>

                            ) : (

                              <span>
                                No User
                              </span>

                            )}

                          </td>


                          {/* ACTION */}

                          <td>

                            <div className="action-buttons">


                              {/* VIEW */}

                              {canViewTeacher && (

                                <button
                                  type="button"

                                  className="btn-action btn-details"

                                  title="Details"

                                  onClick={() =>
                                    handleDetails(
                                      teacher
                                    )
                                  }
                                >

                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >

                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="3"
                                    />

                                  </svg>

                                </button>

                              )}


                              {/* EDIT */}

                              {canEditTeacher && (

                                <button
                                  type="button"

                                  className="btn-action btn-edit"

                                  title="Edit"

                                  onClick={() =>
                                    handleEdit(
                                      teacher
                                    )
                                  }
                                >

                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >

                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />

                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />

                                  </svg>

                                </button>

                              )}


                              {/* PERMISSION */}

                              {teacher.user_created &&
                                canManagePermissions &&
                                String(
                                  teacher.admin_id ||
                                  teacher.user_id ||
                                  ""
                                ) !==
                                  String(
                                    getCurrentAdminId()
                                  ) && (

                                  <button
                                    type="button"

                                    className="btn-action btn-permission"

                                    title="Permissions"

                                    onClick={() =>
                                      handlePermission(
                                        teacher
                                      )
                                    }
                                  >

                                    🔐

                                  </button>

                                )}


                              {/* DELETE */}

                              {canDeleteTeacher && (

                                <button
                                  type="button"

                                  className="btn-action btn-delete"

                                  title="Delete"

                                  onClick={() =>
                                    handleDelete(
                                      teacher.teacher_id
                                    )
                                  }
                                >

                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >

                                    <polyline points="3 6 5 6 21 6" />

                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />

                                  </svg>

                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}


      {/* =================================================
          CREATE USER MODAL
      ================================================= */}

      {showUserModal && (

        <div
          className="user-modal-overlay"

          onClick={closeUserModal}
        >

          <div
            className="user-modal"

            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="user-modal-header">

              <div>

                <h2>
                  Create User Account
                </h2>

                <p>
                  Teacher-এর জন্য login account তৈরি করুন
                </p>

              </div>


              <button
                type="button"

                className="user-modal-close"

                onClick={closeUserModal}

                disabled={userLoading}
              >

                ×

              </button>

            </div>


            <form
              onSubmit={
                handleCreateUser
              }

              className="user-form"
            >


              {/* TEACHER INFO */}

              <div className="user-teacher-info">

                <div className="user-teacher-photo">

                  {selectedTeacher?.photo ? (

                    <img
                      src={`${IMAGE_BASE_URL}/${selectedTeacher.photo}`}

                      alt="Teacher"
                    />

                  ) : (

                    <div>
                      No Photo
                    </div>

                  )}

                </div>


                <div>

                  <strong>

                    {
                      selectedTeacher?.name_en ||
                      selectedTeacher?.name_bn ||
                      "Teacher"
                    }

                  </strong>


                  <span>

                    ID:{" "}

                    {
                      selectedTeacher?.teacher_id
                    }

                  </span>


                  <span>

                    Branch:{" "}

                    {
                      selectedTeacher?.branch ||
                      "N/A"
                    }

                  </span>

                </div>

              </div>


              {/* USERNAME */}

              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"

                  value={username}

                  onChange={e =>
                    setUsername(
                      e.target.value
                    )
                  }

                  placeholder="Enter username"

                  autoComplete="username"

                  disabled={userLoading}
                />

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"

                  value={password}

                  onChange={e =>
                    setPassword(
                      e.target.value
                    )
                  }

                  placeholder="Minimum 6 characters"

                  autoComplete="new-password"

                  disabled={userLoading}
                />

              </div>


              {/* ROLE */}

              <div className="form-group">

                <label>
                  Role
                </label>

                <select
                  value={role}

                  onChange={e =>
                    setRole(
                      e.target.value
                    )
                  }

                  disabled={userLoading}
                >

                  <option value="Teacher">
                    Teacher
                  </option>

                  <option value="Accountant">
                    Accountant
                  </option>

                  <option value="Manager">
                    Manager
                  </option>

                  <option value="Viewer">
                    Viewer
                  </option>

                </select>

              </div>


              {/* FORM BUTTONS */}

              <div className="user-form-actions">

                <button
                  type="button"

                  className="user-cancel-btn"

                  onClick={
                    closeUserModal
                  }

                  disabled={userLoading}
                >

                  Cancel

                </button>


                <button
                  type="submit"

                  className="user-create-btn"

                  disabled={userLoading}
                >

                  {userLoading
                    ? "Creating..."
                    : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          PERMISSION MODAL
      ================================================= */}

      {permissionTeacher && (

        <PermissionModal

          teacher={
            permissionTeacher
          }

          onClose={
            closePermissionModal
          }

          onSaved={() => {

            loadMyPermissions();

          }}

        />

      )}

    </div>

  );
}