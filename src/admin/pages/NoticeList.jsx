import "./NoticeList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD NOTICES ================= */

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/notices.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setNotices(data.data || []);
      } else {
        setMessage(
          data.message || "Notice load করা যায়নি"
        );
      }
    } catch (error) {
      console.error("Notice fetch error:", error);

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "এই Notice টি কি Delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/delete_notice.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Notice সফলভাবে Delete হয়েছে!");

        setNotices((prev) =>
          prev.filter(
            (notice) => notice.id !== id
          )
        );
      } else {
        setMessage(
          data.message ||
            "Notice Delete করা যায়নি"
        );
      }
    } catch (error) {
      console.error("Delete error:", error);

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    }
  };

  /* ================= DATE FORMAT ================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  /* ================= SEARCH ================= */

  const filteredNotices = notices.filter(
    (notice) => {
      const searchText =
        search.trim().toLowerCase();

      if (!searchText) return true;

      return (
        String(notice.title || "")
          .toLowerCase()
          .includes(searchText) ||

        String(notice.description || "")
          .toLowerCase()
          .includes(searchText) ||

        String(notice.status || "")
          .toLowerCase()
          .includes(searchText) ||

        String(notice.notice_date || "")
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="notice-list">

      {/* ================= HEADER ================= */}

      <div className="notice-list-header">

        <div>
          <h1>Notice List</h1>

          <p>
            সকল Notice-এর তালিকা
          </p>
        </div>

        <button
          type="button"
          className="admin-list-add-button"
          onClick={() =>
            navigate("/admin/notice-entry")
          }
        >
          ➕ Add Notice
        </button>

      </div>


      {/* ================= TOOLBAR ================= */}

      <div className="notice-list-toolbar">

        <div className="notice-count">
          Total Notice:{" "}
          <strong>{filteredNotices.length}</strong>
        </div>

        <input
          type="text"
          className="notice-search"
          placeholder="Search notice..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="notice-list-message">
          {message}
        </div>
      )}


      {/* ================= LOADING ================= */}

      {loading ? (
        <div className="notice-loading">
          Notice loading হচ্ছে...
        </div>
      ) : filteredNotices.length === 0 ? (

        <div className="notice-empty">

          {search
            ? "Search অনুযায়ী কোনো Notice পাওয়া যায়নি।"
            : "কোনো Notice পাওয়া যায়নি।"}

        </div>

      ) : (

        /* ================= TABLE ================= */

        <div className="notice-table-wrapper">

          <table className="notice-table">

            <thead>

              <tr>

                <th>#</th>

                <th>Notice Date</th>

                <th>Title</th>

                <th>Description</th>

                <th>Status</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredNotices.map(
                (notice, index) => (

                  <tr key={notice.id}>

                    {/* NUMBER */}

                    <td className="notice-number">
                      {index + 1}
                    </td>


                    {/* DATE */}

                    <td className="notice-date">
                      {formatDate(
                        notice.notice_date
                      )}
                    </td>


                    {/* TITLE */}

                    <td className="notice-title">
                      {notice.title || "-"}
                    </td>


                    {/* DESCRIPTION */}

                    <td className="notice-description">

                      {notice.description
                        ? notice.description
                        : "-"}

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`notice-status ${
                          notice.status ===
                          "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {notice.status}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="notice-actions">

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            navigate(
                              `/admin/notice-edit/${notice.id}`
                            )
                          }
                        >
                          ✏️ Edit
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              notice.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

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
  );
}