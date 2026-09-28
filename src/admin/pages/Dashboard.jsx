import "./Dashboard.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    data?.branch?.length ??
    data?.batches?.length ??
    data?.data?.length ??
    data?.items?.length ??
    data?.result?.length ??
    fallback;

  return Number(value || 0);
};

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);

  const [downloadCount, setDownloadCount] = useState(0);
  const [branchCount, setBranchCount] = useState(0);
  const [languageCount, setLanguageCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);
  const [financialSummary, setFinancialSummary] = useState({});
  const [contactMessageCount, setContactMessageCount] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);

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

    fetch(`${API_BASE_URL}/admin_batch_monitoring.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Batch count could not be loaded.");
        if (response.ok && data.success) {
          setBatchCount(readCount(data));
        }
      })
      .catch((error) => {
        console.error("Batch count error:", error);
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

    fetch(`${API_BASE_URL}/download_list.php`, {
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

    fetch(`${API_BASE_URL}/gallery_list.php`, {
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

    fetch(`${API_BASE_URL}/banner_list.php`, {
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

    fetch(`${API_BASE_URL}/language_list.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Language count could not be loaded.");
        if (response.ok && data.success) {
          setLanguageCount(readCount(data));
        }
      })
      .catch((error) => {
        console.error("Language count error:", error);
      });

    const currentYear = new Date().getFullYear();
    fetch(
      `${API_BASE_URL}/income_expense_report.php?year=${currentYear}&month=all&branch=all`,
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      }
    )
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Financial summary could not be loaded.");
        if (response.ok && data.success) {
          setFinancialSummary(data.summary || {});
        }
      })
      .catch((error) => {
        console.error("Financial summary error:", error);
      });

    fetch(`${API_BASE_URL}/contact_messages_list.php`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await parseJsonResponse(response, "Contact messages could not be loaded.");
        if (response.ok && data.success) {
          const messages = Array.isArray(data.data) ? data.data : [];
          const unanswered = messages.filter((item) => !item.reply_message);
          setContactMessageCount(messages.length);
          setPendingMessages(unanswered.length);
          setRecentMessages(
            [...unanswered]
              .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
              .slice(0, 4)
          );
        }
      })
      .catch((error) => {
        console.error("Contact messages error:", error);
      });
  }, []);

  /* =====================================================
     USER NAME
  ===================================================== */

  const userName =
    user?.full_name ||
    user?.username ||
    "User";

  const formatCurrency = (amount) =>
    `৳ ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const bengaliDate = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);
  const hijriDate = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

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
        <div className="dashboard-date-stack">
          <time className="dashboard-today" dateTime={todayIso}>
            {today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            })}
          </time>
          <span className="dashboard-bengali-date">{bengaliDate}</span>
          <span className="dashboard-hijri-date">Hijri: {hijriDate}</span>
        </div>
      </header>

      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <section className="dashboard-cards">

        {/* BRANCHES */}

        <Link to="/admin/branch-list" className="dashboard-card dashboard-card-branches">
          <h3>🏢 Branches</h3>
          <p>{branchCount}</p>
          <span>Manage branches →</span>
        </Link>

        {/* LANGUAGES */}

        <Link to="/admin/languages" className="dashboard-card dashboard-card-languages">
          <h3>🌐 Languages</h3>
          <p>{languageCount}</p>
          <span>Manage languages →</span>
        </Link>

        {/* COURSES */}

        <Link to="/admin/courses" className="dashboard-card dashboard-card-courses">
          <h3>📚 Courses</h3>
          <p>{courseCount}</p>
          <span>Manage courses →</span>
        </Link>

        {/* BATCHES */}

        <Link to="/admin/batch-monitoring" className="dashboard-card dashboard-card-batches">
          <h3>🗂️ Batches</h3>
          <p>{batchCount}</p>
          <span>Monitor batches →</span>
        </Link>

        {/* TEACHERS */}

        <Link to="/admin/teacher-list" className="dashboard-card dashboard-card-teachers">
          <h3>👨‍🏫 Teachers</h3>
          <p>{teacherCount}</p>
          <span>View teacher list →</span>
        </Link>

        {/* STUDENTS */}

        <Link to="/admin/student-list" className="dashboard-card dashboard-card-students">
          <h3>👨‍🎓 Students</h3>
          <p>{studentCount}</p>
          <span>View student list →</span>
        </Link>

        {/* NOTICES */}

        <Link to="/admin/notices" className="dashboard-card dashboard-card-notices">
          <h3>📢 Notices</h3>
          <p>{noticeCount}</p>
          <span>Manage notices →</span>
        </Link>

        {/* CONTACT MESSAGES */}

        <Link to="/admin/contact-messages" className="dashboard-card dashboard-card-messages">
          <h3>✉️ Contact Messages</h3>
          <p>{contactMessageCount}</p>
          <span>Open contact inbox →</span>
        </Link>

        {/* DOWNLOADS */}

        <Link to="/admin/downloads" className="dashboard-card dashboard-card-downloads">
          <h3>📥 Downloads</h3>
          <p>{downloadCount}</p>
          <span>Manage downloads →</span>
        </Link>

        {/* GALLERY */}

        <Link to="/admin/gallery-list" className="dashboard-card dashboard-card-gallery">
          <h3>🖼️ Gallery</h3>
          <p>{galleryCount}</p>
          <span>Manage gallery →</span>
        </Link>

        {/* BANNERS */}

        <Link to="/admin/banner-list" className="dashboard-card dashboard-card-banners">
          <h3>🖼️ Banners</h3>
          <p>{bannerCount}</p>
          <span>Manage banners →</span>
        </Link>

      </section>

      <section className="dashboard-overview-grid" aria-label="Operational overview">
        <div className="dashboard-panel dashboard-finance-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Financial overview</h2>
              <p>{new Date().getFullYear()} totals</p>
            </div>
            <Link to="/admin/income-expense-report">Full report →</Link>
          </div>
          <div className="dashboard-finance-grid">
            <div className="dashboard-finance-item income">
              <span>Income</span>
              <strong>{formatCurrency(financialSummary.total_income)}</strong>
              <small>{Number(financialSummary.income_transactions || 0).toLocaleString("en-US")} transactions</small>
            </div>
            <div className="dashboard-finance-item expense">
              <span>Expenses</span>
              <strong>{formatCurrency(financialSummary.total_expense)}</strong>
              <small>{Number(financialSummary.expense_transactions || 0).toLocaleString("en-US")} transactions</small>
            </div>
            <div className="dashboard-finance-item balance">
              <span>Net balance</span>
              <strong>{formatCurrency(financialSummary.net_balance)}</strong>
              <small>Income minus expenses</small>
            </div>
            <div className="dashboard-finance-item due">
              <span>Outstanding fees</span>
              <strong>{formatCurrency(financialSummary.total_due)}</strong>
              <small><Link to="/admin/due-list">Review student dues →</Link></small>
            </div>
          </div>
        </div>

        <div className="dashboard-panel dashboard-messages-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Contact inbox</h2>
              <p>{pendingMessages} awaiting a reply</p>
            </div>
            <Link to="/admin/contact-messages">Open inbox →</Link>
          </div>
          {recentMessages.length ? (
            <ul className="dashboard-message-list">
              {recentMessages.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.name || "Website visitor"}</strong>
                    <p>{item.message || "No message text"}</p>
                  </div>
                  <time dateTime={item.created_at || undefined}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "New"}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty-inbox">No unanswered messages.</p>
          )}
        </div>
      </section>

      <nav className="dashboard-quick-links" aria-label="Quick actions">
        <Link to="/admin/students">Add student <span>→</span></Link>
        <Link to="/admin/income">Record income <span>→</span></Link>
        <Link to="/admin/expense">Record expense <span>→</span></Link>
        <Link to="/admin/my-classroom">Classroom <span>→</span></Link>
      </nav>
    </div>
  );
}