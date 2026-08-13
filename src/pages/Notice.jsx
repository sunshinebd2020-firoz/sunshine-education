import "./Notice.css";
import { useEffect, useState } from "react";

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD NOTICES ================= */

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(
          "http://localhost/sunshine-api/api/notices.php"
        );

        const data = await response.json();

        if (data.success) {
          // শুধু Active Notice দেখাবে
          const activeNotices = (data.data || []).filter(
            (notice) =>
              String(notice.status || "").toLowerCase() ===
              "active"
          );

          setNotices(activeNotices);
        } else {
          setError(
            data.message || "Notice load করা যায়নি"
          );
        }
      } catch (error) {
        console.error("Notice fetch error:", error);

        setError(
          "Server-এর সাথে সংযোগ করা যাচ্ছে না"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  /* ================= DATE FORMAT ================= */

  const formatDate = (date) => {
    if (!date) return "";

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  return (
    <div className="notice">

      {/* ================= HEADER ================= */}

      <section className="notice-header">
        <h1>Notice Board</h1>

        <p>
          প্রতিষ্ঠানের সর্বশেষ নোটিশ ও গুরুত্বপূর্ণ তথ্য
        </p>
      </section>


      {/* ================= LOADING ================= */}

      {loading && (
        <div className="notice-loading">
          Notice loading হচ্ছে...
        </div>
      )}


      {/* ================= ERROR ================= */}

      {!loading && error && (
        <div className="notice-error">
          {error}
        </div>
      )}


      {/* ================= NOTICE LIST ================= */}

      {!loading &&
        !error &&
        notices.length > 0 && (
          <section className="notice-list">

            {notices.map((notice) => (
              <div
                className="notice-card"
                key={notice.id}
              >

                <h2>
                  {notice.title}
                </h2>

                <p className="date">
                  📅 {formatDate(notice.notice_date)}
                </p>

                <p>
                  {notice.description || ""}
                </p>

                <button type="button">
                  View Details
                </button>

              </div>
            ))}

          </section>
        )}


      {/* ================= NO NOTICE ================= */}

      {!loading &&
        !error &&
        notices.length === 0 && (
          <div className="notice-empty">
            বর্তমানে কোনো Notice নেই।
          </div>
        )}

    </div>
  );
}