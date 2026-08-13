import "./NoticeEntry.css";
import { useState } from "react";

export default function NoticeEntry() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    notice_date: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  const [message, setMessage] = useState("");

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/notice_entry.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Notice সফলভাবে যোগ হয়েছে!");

        setForm({
          title: "",
          description: "",
          notice_date: new Date()
            .toISOString()
            .split("T")[0],
          status: "Active",
        });
      } else {
        setMessage(
          data.message || "Notice যোগ করা যায়নি"
        );
      }
    } catch (error) {
      console.error("Notice Entry Error:", error);

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    }
  };

  return (
    <div className="notice-entry">

      {/* ================= HEADER ================= */}

      <div className="notice-entry-header">
        <div>
          <h1>Notice Entry</h1>
          <p>নতুন Notice যোগ করুন</p>
        </div>
      </div>

      {/* ================= FORM ================= */}

      <form
        className="notice-form"
        onSubmit={handleSubmit}
      >

        <div className="notice-form-grid">

          {/* Notice Date */}

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


          {/* Status */}

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


          {/* Title */}

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


          {/* Description */}

          <div className="notice-form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write notice details..."
              rows="8"
            ></textarea>
          </div>

        </div>


        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="notice-message">
            {message}
          </div>
        )}


        {/* ================= BUTTON ================= */}

        <div className="notice-form-actions">
          <button type="submit">
            Save Notice
          </button>
        </div>

      </form>

    </div>
  );
}