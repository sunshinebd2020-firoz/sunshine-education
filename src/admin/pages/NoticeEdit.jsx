import "./NoticeEntry.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function NoticeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    notice_date: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= LOAD NOTICE ================= */

  useEffect(() => {
    const loadNotice = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notices.php`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (data.success) {
          const notice = (data.data || []).find(
            (item) => String(item.id) === String(id)
          );

          if (notice) {
            setForm({
              title: notice.title || "",
              description: notice.description || "",
              notice_date: notice.notice_date || "",
              status: notice.status || "Active",
            });
          } else {
            setMessage("Notice পাওয়া যায়নি");
          }
        }
      } catch (error) {
        console.error(error);
        setMessage("Notice load করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    loadNotice();
  }, [id]);

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/update_notice.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            ...form,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Notice সফলভাবে Update হয়েছে!");

        setTimeout(() => {
          navigate("/admin/notices");
        }, 800);
      } else {
        setMessage(
          data.message || "Notice Update করা যায়নি"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="notice-entry">
        <div className="notice-loading">
          Notice loading হচ্ছে...
        </div>
      </div>
    );
  }

  return (
    <div className="notice-entry">

      <div className="notice-entry-header">
        <div>
          <h1>Edit Notice</h1>
          <p>Notice-এর তথ্য পরিবর্তন করুন</p>
        </div>
      </div>

      <form
        className="notice-form"
        onSubmit={handleSubmit}
      >

        <div className="notice-form-grid">

          {/* DATE */}

          <div className="notice-form-group">
            <label>Notice Date *</label>

            <input
              type="date"
              name="notice_date"
              value={form.notice_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* STATUS */}

          <div className="notice-form-group">
            <label>Status *</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* TITLE */}

          <div className="notice-form-group full-width">
            <label>Notice Title *</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter notice title"
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div className="notice-form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write notice details..."
              rows="8"
            />
          </div>

        </div>

        {message && (
          <div className="notice-message">
            {message}
          </div>
        )}

        <div className="notice-form-actions">

          <button
            type="button"
            className="notice-cancel-button"
            onClick={() => navigate("/admin/notices")}
          >
            Cancel
          </button>

          <button type="submit">
            Update Notice
          </button>

        </div>

      </form>

    </div>
  );
}