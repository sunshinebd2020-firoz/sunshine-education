import { useEffect, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";
import "./Settings.css";

const MAX_MESSAGE_WORDS = 1000;

const countWords = (text) => {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

const limitWords = (text, maxWords) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(" ");
};

export default function DirectorSettings() {
  const [form, setForm] = useState({
    director_name: "",
    director_designation: "",
    director_message: "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= LOAD ================= */

  const loadDirectorInfo = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/get_director_info.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success && data.director) {
        setForm({
          director_name: data.director.director_name || "",
          director_designation: data.director.director_designation || "",
          director_message: data.director.director_message || "",
        });

        setPreview(
          data.director.director_photo
            ? `${API_ORIGIN}/${data.director.director_photo}`
            : ""
        );
      }
    } catch (error) {
      console.error("Director info load error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectorInfo();
  }, []);

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "director_message") {
      setForm((prev) => ({
        ...prev,
        director_message: limitWords(value, MAX_MESSAGE_WORDS),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("director_name", form.director_name);
      formData.append("director_designation", form.director_designation);
      formData.append("director_message", form.director_message);

      if (photo) {
        formData.append("director_photo", photo);
      }

      const response = await fetch(
        `${API_BASE_URL}/update_director_info.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Director information সফলভাবে সংরক্ষণ হয়েছে");
        setPhoto(null);
        loadDirectorInfo();
      } else {
        setMessage(data.message || "Director information সংরক্ষণ করা যায়নি");
      }
    } catch (error) {
      console.error("Director info save error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Director Photo &amp; Message</h1>
        <p>Website Home Page-এর জন্য Director-এর তথ্য পরিচালনা করুন</p>
      </div>

      <div className="settings-card">
        <h2>Director Photo &amp; Message</h2>
        <p className="settings-card-help">
          এখানে যা সংরক্ষণ করবেন তা সরাসরি ওয়েবসাইটের Home Page-এ দেখা যাবে।
        </p>

        {loading ? (
          <div className="settings-loading">তথ্য লোড হচ্ছে...</div>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Director Photo</label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              {preview && (
                <div className="settings-photo-preview">
                  <img src={preview} alt="Director preview" />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Director Name</label>

                <input
                  type="text"
                  name="director_name"
                  value={form.director_name}
                  onChange={handleChange}
                  placeholder="Director-এর নাম লিখুন"
                />
              </div>

              <div className="form-group">
                <label>Designation</label>

                <input
                  type="text"
                  name="director_designation"
                  value={form.director_designation}
                  onChange={handleChange}
                  placeholder="Example: Managing Director"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Message{" "}
                <span className="settings-word-count">
                  ({countWords(form.director_message)}/{MAX_MESSAGE_WORDS} words)
                </span>
              </label>

              <textarea
                name="director_message"
                value={form.director_message}
                onChange={handleChange}
                placeholder="Director-এর বার্তা লিখুন"
                rows="8"
              />
            </div>

            {message && (
              <div className="settings-message">{message}</div>
            )}

            <button type="submit" className="settings-submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
