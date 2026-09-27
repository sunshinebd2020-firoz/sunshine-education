import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./Settings.css";

export default function Settings() {
  const [hotline, setHotline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= LOAD ================= */

  const loadSettings = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/get_site_settings.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success && data.settings) {
        setHotline(data.settings.hotline_number || "");
      }
    } catch (error) {
      console.error("Site settings load error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/update_site_settings.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotline_number: hotline.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Settings সফলভাবে সংরক্ষণ হয়েছে");
        loadSettings();
      } else {
        setMessage(data.message || "Settings সংরক্ষণ করা যায়নি");
      }
    } catch (error) {
      console.error("Site settings save error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>General Settings</h1>
        <p>Website-এর সাধারণ সেটিংস এখান থেকে পরিচালনা করুন</p>
      </div>

      <div className="settings-card">
        <h2>Hotline</h2>
        <p className="settings-card-help">
          Hotline number Header-এ দেখা যাবে।
        </p>

        {loading ? (
          <div className="settings-loading">তথ্য লোড হচ্ছে...</div>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hotline Number</label>

              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="Example: +8801XXXXXXXXX"
              />
            </div>

            {message && <div className="settings-message">{message}</div>}

            <button type="submit" className="settings-submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
