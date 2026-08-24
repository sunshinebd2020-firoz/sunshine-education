import "./Dashboard.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

const parseJsonResponse = async (response, fallbackMessage) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage || "Empty server response.");
  }

  const trimmed = text.trim();
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (
    !contentType.includes("application/json") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    throw new Error("Backend API is not responding with JSON.");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error("Invalid JSON response:", trimmed);
    throw new Error(fallbackMessage || "Server returned an invalid response format.");
  }
};

const readCount = (data, fallback = 0) => {
  const value =
    data?.total ??
    data?.count ??
    data?.count_total ??
    data?.total_count ??
    data?.data?.length ??
    data?.items?.length ??
    data?.result?.length ??
    fallback;

  return Number(value || 0);
};

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);

  const [downloadCount, setDownloadCount] = useState(0);
  const [branchCount, setBranchCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);

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

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(loggedInUser);

        console.log("Logged-in User:", loggedInUser);
      } catch (error) {
        console.error("User data parse error:", error);
      }
    }

    /* =====================================================
       STUDENT COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/student_count.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Student count could not be loaded.");
        if (response.ok && (data.success || data.total !== undefined || data.count !== undefined)) {
          setStudentCount(readCount(data));
        }
      })
      .catch((error) => {
        console.error("Student count error:", error);
      });

    /* =====================================================
       TEACHER COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/teacher_count.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Teacher count could not be loaded.");
        if (response.ok && (data.success || data.total !== undefined || data.count !== undefined)) {
          setTeacherCount(readCount(data));
        }
      })
      .catch((error) => {
        console.error("Teacher count error:", error);
      });

    /* =====================================================
       COURSE COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/course_list.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Course count could not be loaded.");
        if (response.ok) {
          setCourseCount(readCount(data, Array.isArray(data?.courses) ? data.courses.length : 0));
        }
      })
      .catch((error) => {
        console.error("Course count error:", error);
      });

    /* =====================================================
       NOTICE COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/notices.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Notice count could not be loaded.");
        if (response.ok) {
          setNoticeCount(readCount(data, Array.isArray(data?.notices) ? data.notices.length : 0));
        }
      })
      .catch((error) => {
        console.error("Notice count error:", error);
      });

    /* =====================================================
       DOWNLOAD COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/downloads.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Download count could not be loaded.");
        if (response.ok) {
          setDownloadCount(readCount(data, Array.isArray(data?.downloads) ? data.downloads.length : 0));
        }
      })
      .catch((error) => {
        console.error("Download count error:", error);
      });

    /* =====================================================
       BRANCH COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/branch_list.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Branch count could not be loaded.");
        if (response.ok) {
          setBranchCount(readCount(data, Array.isArray(data?.branches) ? data.branches.length : 0));
        }
      })
      .catch((error) => {
        console.error("Branch count error:", error);
      });

    /* =====================================================
       GALLERY COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/gallery.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Gallery count could not be loaded.");
        if (response.ok) {
          setGalleryCount(readCount(data, Array.isArray(data?.gallery) ? data.gallery.length : 0));
        }
      })
      .catch((error) => {
        console.error("Gallery count error:", error);
      });

    /* =====================================================
       BANNER COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/banners.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Banner count could not be loaded.");
        if (response.ok) {
          setBannerCount(readCount(data, Array.isArray(data?.banners) ? data.banners.length : 0));
        }
      })
      .catch((error) => {
        console.error("Banner count error:", error);
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
          <h1>Dashboard</h1>

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

        <div className="dashboard-card dashboard-card-students">
          <h3>👨‍🎓 Students</h3>
          <p>{studentCount}</p>
        </div>

        {/* COURSES */}

        <div className="dashboard-card dashboard-card-courses">
          <h3>📚 Courses</h3>
          <p>{courseCount}</p>
        </div>

        {/* TEACHERS */}

        <div className="dashboard-card dashboard-card-teachers">
          <h3>👨‍🏫 Teachers</h3>
          <p>{teacherCount}</p>
        </div>

        {/* NOTICES */}

        <div className="dashboard-card dashboard-card-notices">
          <h3>📢 Notices</h3>
          <p>{noticeCount}</p>
        </div>

        {/* DOWNLOADS */}

        <div className="dashboard-card dashboard-card-downloads">
          <h3>📥 Downloads</h3>
          <p>{downloadCount}</p>
        </div>

        {/* BRANCHES */}

        <div className="dashboard-card dashboard-card-branches">
          <h3>🏢 Branches</h3>
          <p>{branchCount}</p>
        </div>

        {/* GALLERY */}

        <div className="dashboard-card dashboard-card-gallery">
          <h3>🖼️ Gallery</h3>
          <p>{galleryCount}</p>
        </div>

        {/* BANNERS */}

        <div className="dashboard-card dashboard-card-banners">
          <h3>🖼️ Banners</h3>
          <p>{bannerCount}</p>
        </div>

      </section>
    </div>
  );
}