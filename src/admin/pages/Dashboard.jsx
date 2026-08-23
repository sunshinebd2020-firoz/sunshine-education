import "./Dashboard.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

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
    })
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

    /* =====================================================
       TEACHER COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/teacher_count.php`, {
      credentials: "include",
    })
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
        console.error("Teacher count error:", error);
      });

    /* =====================================================
       COURSE COUNT
    ===================================================== */

    fetch(`${API_BASE_URL}/course_list.php`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCourseCount(data.data.length);
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNoticeCount(data.data.length);
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDownloadCount(data.data.length);
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBranchCount(data.data.length);
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setGalleryCount(data.data.length);
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBannerCount(data.data.length);
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