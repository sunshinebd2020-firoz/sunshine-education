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
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost/sunshine-api/api/notices.php"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Notice load করা যায়নি"
          );
        }

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
      } catch (err) {
        console.error("Notice fetch error:", err);

        setError(
          err.message ||
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

    const parts = String(date).split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  /* ================= RENDER ================= */

  return (
    <div className="notice">

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
              <article
                className="notice-card"
                key={notice.id}
              >

                {/* NOTICE TITLE */}

                <h2>
                  {notice.title || "Important Notice"}
                </h2>

                {/* NOTICE DATE */}

                <p className="date">
                  📅 {formatDate(notice.notice_date)}
                </p>

                {/* NOTICE DESCRIPTION */}

                <p className="description">
                  {notice.description || ""}
                </p>

              </article>
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