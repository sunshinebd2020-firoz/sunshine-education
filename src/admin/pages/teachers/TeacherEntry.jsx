import { useEffect, useState } from "react";
import "./TeacherEntry.css";
import API_BASE_URL from "../../../config/api";

export default function TeacherEntry({ editData = null, onSuccess }) {
  const [formData, setFormData] = useState({
    id: "",
    teacherId: "",
    nameBn: "",
    nameEn: "",
    shortName: "",
    designation: "",
    course: "",
    branch: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    joiningDate: "",
    qualification: "",
    address: "",
    status: "Present",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // =========================================
  // Edit Data Load Setup (ID গায়েব হওয়া রোধ করতে)
  // =========================================
  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || "",
        teacherId: editData.teacher_id || editData.teacherId || "",
        nameBn: editData.name_bn || editData.nameBn || "",
        nameEn: editData.name_en || editData.nameEn || "",
        shortName: editData.short_name || editData.shortName || "",
        designation: editData.designation || "",
        course: editData.course || "",
        branch: editData.branch || "",
        mobile: editData.mobile || "",
        email: editData.email || "",
        dateOfBirth: editData.date_of_birth || editData.dateOfBirth || "",
        joiningDate: editData.joining_date || editData.joiningDate || "",
        qualification: editData.qualification || "",
        address: editData.address || "",
        status: editData.status || "Present",
      });
    }
  }, [editData]);

  // =========================
  // Fetch Branches
  // =========================
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/branch_list.php`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Network error loading branches");

        const result = await response.json();

        if (result.success && Array.isArray(result.branches)) {
          setBranches(result.branches);
        } else {
          setBranches([]);
        }
      } catch (error) {
        console.error("Error loading branches:", error);
        setBranches([]);
      } finally {
        setBranchLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // শুধুমাত্র NEW ENTRY করার সময় joiningDate পরিবর্তন হলে Prefix তৈরি হবে।
      // Edit Mode-এ (id থাকলে) teacherId পরিবর্তন হবে না।
      if (name === "joiningDate" && !prev.id) {
        if (value) {
          const cleanDate = value.replace(/-/g, "").substring(2);
          updated.teacherId = `SE${cleanDate}`;
        } else {
          updated.teacherId = "";
        }
      }

      return updated;
    });
  };

  // =========================
  // Photo Change
  // =========================
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  // =========================
  // Submit Form
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setMessage({ type: "", text: "" });

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key] ?? "");
    });

    if (photo) {
      data.append("photo", photo);
    }

    const isEditMode = Boolean(formData.id);
    const endpoint = isEditMode
      ? `${API_BASE_URL}/update_teacher.php`
      : `${API_BASE_URL}/teacher_entry.php`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text:
            result.message ||
            (isEditMode
              ? "Teacher updated successfully!"
              : `Teacher added successfully! ID: ${result.teacher_id}`),
        });

        if (!isEditMode) {
          handleReset();
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to process request.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: "Server connection failed! Please check PHP API.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Reset Form
  // =========================
  const handleReset = () => {
    setFormData({
      id: "",
      teacherId: "",
      nameBn: "",
      nameEn: "",
      shortName: "",
      designation: "",
      course: "",
      branch: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      joiningDate: "",
      qualification: "",
      address: "",
      status: "Present",
    });

    setPhoto(null);

    const photoInput = document.getElementById("photo");
    if (photoInput) {
      photoInput.value = "";
    }
  };

  return (
    <div className="teacher-entry">
      {/* Header */}
      <div className="teacher-entry-header">
        <h2>{formData.id ? "Edit Teacher" : "Teacher Entry"}</h2>
        <p>
          {formData.id
            ? "Update teacher information"
            : "Enter teacher information"}
        </p>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="teacher-form" onSubmit={handleSubmit}>
        {/* Hidden Field for Database Primary Key ID */}
        <input type="hidden" name="id" value={formData.id} />

        {/* Teacher ID */}
        <div className="form-group">
          <label htmlFor="teacherId">Teacher ID</label>
          <input
            type="text"
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            placeholder="Teacher ID"
            disabled={!formData.id && !formData.joiningDate}
          />
          <small>
            {formData.id
              ? "শিক্ষকের ইউনিক ID"
              : "Joining Date দিলে ID-এর prefix তৈরি হবে।"}
          </small>
        </div>

        {/* English Name */}
        <div className="form-group">
          <label htmlFor="nameEn">Teacher Name (English) *</label>
          <input
            type="text"
            id="nameEn"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            placeholder="Enter teacher name in English"
            required
          />
        </div>

        {/* Bangla Name */}
        <div className="form-group">
          <label htmlFor="nameBn">Teacher Name (Bangla)</label>
          <input
            type="text"
            id="nameBn"
            name="nameBn"
            value={formData.nameBn}
            onChange={handleChange}
            placeholder="বাংলা নাম লিখুন"
          />
        </div>

        {/* Short Name */}
        <div className="form-group">
          <label htmlFor="shortName">Short Name</label>
          <input
            type="text"
            id="shortName"
            name="shortName"
            value={formData.shortName}
            onChange={handleChange}
            placeholder="e.g. AR"
          />
        </div>

        {/* Designation */}
        <div className="form-group">
          <label htmlFor="designation">Designation</label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Enter designation"
          />
        </div>

        {/* Course */}
        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter course name"
          />
        </div>

        {/* Branch */}
        <div className="form-group">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
          >
            <option value="">
              {branchLoading ? "Loading branches..." : "Select Branch"}
            </option>
            {!branchLoading &&
              branches.map((item) => (
                <option key={item.id} value={item.branch_name}>
                  {item.branch_name}
                </option>
              ))}
          </select>
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {/* Joining Date */}
        <div className="form-group">
          <label htmlFor="joiningDate">Joining Date *</label>
          <input
            type="date"
            id="joiningDate"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Present">Present</option>
            <option value="Ex Teacher">Ex Teacher</option>
          </select>
        </div>

        {/* Qualification */}
        <div className="form-group">
          <label htmlFor="qualification">Qualification</label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="e.g. M.Sc in Mathematics"
          />
        </div>

        {/* Address */}
        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter teacher address"
          />
        </div>

        {/* Photo */}
        <div className="form-group full-width">
          <label htmlFor="photo">Teacher Photo</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="save-teacher"
            disabled={loading}
          >
            {loading
              ? "💾 Saving..."
              : formData.id
              ? "💾 Update Teacher"
              : "💾 Save Teacher"}
          </button>

          <button
            type="button"
            className="reset-teacher"
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Reset
          </button>
        </div>
      </form>
    </div>
  );
}