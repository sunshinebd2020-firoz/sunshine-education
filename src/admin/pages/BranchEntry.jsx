import "./BranchEntry.css";
import API_BASE_URL from "../../config/api";
import { useState } from "react";

export default function BranchEntry() {
  const [form, setForm] = useState({
    title: "",
    branch_name: "",
    branch_name_bn: "",
    address: "",
    mobile: "",
    email: "",
    map_link: "",
    sort_order: 0,
    status: "active",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================================
     HANDLE CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!form.title.trim()) {
      setMessage("Title দিন।");
      return;
    }

    if (!form.branch_name.trim()) {
      setMessage("Branch Name দিন।");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/branch_add.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message || "Branch added successfully"
        );

        setForm({
          title: "",
          branch_name: "",
          branch_name_bn: "",
          address: "",
          mobile: "",
          email: "",
          map_link: "",
          sort_order: 0,
          status: "active",
        });
      } else {
        setMessage(
          data.message || "Branch add failed"
        );
      }

    } catch (error) {
      console.error("Branch add error:", error);

      setMessage("Server connection failed");

    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="branch-entry">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="branch-entry-header">

        <div>
          <h1>Branch Entry</h1>

          <p>
            নতুন শাখার তথ্য যুক্ত করুন
          </p>
        </div>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="branch-entry-message">
          {message}
        </div>
      )}


      {/* =====================================
          FORM
      ===================================== */}

      <form
        className="branch-entry-form"
        onSubmit={handleSubmit}
      >

        {/* =================================
            BASIC INFORMATION
        ================================= */}

        <div className="branch-form-section">

          <h2>
            Branch Information
          </h2>


          {/* Title */}

          <div className="branch-form-group">

            <label>
              Title
              <span>*</span>
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Rajshahi Branch"
            />

          </div>


          {/* Branch Name */}

          <div className="branch-form-group">

            <label>
              Branch Name
              <span>*</span>
            </label>

            <input
              type="text"
              name="branch_name"
              value={form.branch_name}
              onChange={handleChange}
              placeholder="Example: Rajshahi Main Branch"
            />

          </div>


          {/* Bangla Name */}

          <div className="branch-form-group">

            <label>
              Branch Name (বাংলা)
            </label>

            <input
              type="text"
              name="branch_name_bn"
              value={form.branch_name_bn}
              onChange={handleChange}
              placeholder="উদাহরণ: রাজশাহী প্রধান শাখা"
            />

          </div>


          {/* Address */}

          <div className="branch-form-group">

            <label>
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Branch address লিখুন"
              rows="3"
            />

          </div>

        </div>


        {/* =================================
            CONTACT INFORMATION
        ================================= */}

        <div className="branch-form-section">

          <h2>
            Contact Information
          </h2>


          {/* Mobile */}

          <div className="branch-form-group">

            <label>
              Mobile
            </label>

            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
            />

          </div>


          {/* Email */}

          <div className="branch-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="branch@example.com"
            />

          </div>


          {/* Map Link */}

          <div className="branch-form-group">

            <label>
              Google Maps Link
            </label>

            <textarea
              name="map_link"
              value={form.map_link}
              onChange={handleChange}
              placeholder="Google Maps link এখানে paste করুন"
              rows="3"
            />

          </div>

        </div>


        {/* =================================
            SETTINGS
        ================================= */}

        <div className="branch-form-section">

          <h2>
            Settings
          </h2>


          {/* Sort Order */}

          <div className="branch-form-group">

            <label>
              Sort Order
            </label>

            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              min="0"
            />

          </div>


          {/* Status */}

          <div className="branch-form-group">

            <label>
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* =================================
            BUTTON
        ================================= */}

        <div className="branch-form-actions">

          <button
            type="submit"
            className="branch-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Branch"}
          </button>

        </div>

      </form>

    </div>
  );
}