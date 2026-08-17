import "./BranchEdit.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function BranchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* =====================================================
     LOAD BRANCH
  ===================================================== */

  useEffect(() => {
    const loadBranch = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(
          "http://localhost/sunshine-api/api/branch_list.php"
        );

        const data = await response.json();

        if (!data.success) {
          setMessage(
            data.message ||
              "Branch data পাওয়া যায়নি"
          );
          return;
        }

        const branchList = Array.isArray(
          data.branches
        )
          ? data.branches
          : [];

        const branch = branchList.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!branch) {
          setMessage(
            "Branch পাওয়া যায়নি"
          );
          return;
        }

        setForm({
          title: branch.title || "",
          branch_name:
            branch.branch_name || "",
          branch_name_bn:
            branch.branch_name_bn || "",
          address:
            branch.address || "",
          mobile:
            branch.mobile || "",
          email:
            branch.email || "",
          map_link:
            branch.map_link || "",
          sort_order:
            branch.sort_order || 0,
          status:
            branch.status || "active",
        });

      } catch (error) {
        console.error(
          "Branch loading error:",
          error
        );

        setMessage(
          "Server connection failed"
        );

      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [id]);


  /* =====================================================
     HANDLE CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =====================================================
     UPDATE BRANCH
  ===================================================== */

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
        "http://localhost/sunshine-api/api/branch_update.php",
        {
          method: "POST",

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
        setMessage(
          data.message ||
            "Branch updated successfully"
        );

        setTimeout(() => {
          navigate("/admin/branch-list");
        }, 700);

      } else {
        setMessage(
          data.message ||
            "Branch update failed"
        );
      }

    } catch (error) {
      console.error(
        "Branch update error:",
        error
      );

      setMessage(
        "Server connection failed"
      );

    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="branch-edit">

        <p className="branch-edit-loading">
          Loading branch...
        </p>

      </div>
    );
  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="branch-edit">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="branch-edit-header">

        <div>

          <h1>
            Edit Branch
          </h1>

          <p>
            Branch-এর তথ্য পরিবর্তন করুন
          </p>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="branch-edit-message">
          {message}
        </div>
      )}


      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="branch-edit-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            BRANCH INFORMATION
        ================================================= */}

        <div className="branch-edit-section">

          <h2>
            Branch Information
          </h2>


          {/* TITLE */}

          <div className="branch-edit-group">

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


          {/* BRANCH NAME */}

          <div className="branch-edit-group">

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


          {/* BANGLA NAME */}

          <div className="branch-edit-group">

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


          {/* ADDRESS */}

          <div className="branch-edit-group">

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


        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <div className="branch-edit-section">

          <h2>
            Contact Information
          </h2>


          {/* MOBILE */}

          <div className="branch-edit-group">

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


          {/* EMAIL */}

          <div className="branch-edit-group">

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


          {/* MAP */}

          <div className="branch-edit-group">

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


        {/* =================================================
            SETTINGS
        ================================================= */}

        <div className="branch-edit-section">

          <h2>
            Settings
          </h2>


          {/* SORT ORDER */}

          <div className="branch-edit-group">

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


          {/* STATUS */}

          <div className="branch-edit-group">

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


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="branch-edit-actions">

          <button
            type="button"
            className="branch-cancel-button"
            onClick={() =>
              navigate("/admin/branch-list")
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="branch-update-button"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Branch"}
          </button>

        </div>

      </form>

    </div>
  );
}