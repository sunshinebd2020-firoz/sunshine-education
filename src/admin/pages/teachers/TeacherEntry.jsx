import { useState } from "react";
import "./TeacherEntry.css";
import API_BASE_URL from "../../../config/api";

export default function TeacherEntry() {
  const [formData, setFormData] = useState({
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
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

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

      // Joining Date পরিবর্তন হলে
      // শুধু SEYYMMDD অংশ তৈরি হবে
      // শেষের serial server থেকে আসবে
      if (name === "joiningDate") {
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
  // Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setMessage({
      type: "",
      text: "",
    });

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (photo) {
      data.append("photo", photo);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher_entry.php`,
        {
          method: "POST",
          credentials: "include",
          body: data,
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text:
            result.message ||
            `Teacher added successfully! ID: ${result.teacher_id}`,
        });

        handleReset();
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to save teacher.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      setMessage({
        type: "error",
        text: "Server connection failed!",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Reset
  // =========================
  const handleReset = () => {
    setFormData({
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
        <h2>Teacher Entry</h2>
        <p>Enter teacher information</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="teacher-form" onSubmit={handleSubmit}>

        {/* Teacher ID */}
        <div className="form-group">
          <label htmlFor="teacherId">
            Teacher ID
          </label>

          <input
            type="text"
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            placeholder="Joining Date দিন"
            disabled={!formData.joiningDate}
          />

          <small>
            Joining Date দিলে ID-এর prefix তৈরি হবে।
            শেষের serial server থেকে নির্ধারিত হবে।
          </small>
        </div>

        {/* English Name */}
        <div className="form-group">
          <label htmlFor="nameEn">
            Teacher Name (English) *
          </label>

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
          <label htmlFor="nameBn">
            Teacher Name (Bangla)
          </label>

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
          <label htmlFor="shortName">
            Short Name
          </label>

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
          <label htmlFor="designation">
            Designation
          </label>

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
          <label htmlFor="course">
            Course
          </label>

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
          <label htmlFor="branch">
            Branch
          </label>

          <input
            type="text"
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="Enter branch name"
          />
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label htmlFor="mobile">
            Mobile Number
          </label>

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
          <label htmlFor="email">
            Email
          </label>

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
          <label htmlFor="dateOfBirth">
            Date of Birth
          </label>

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
          <label htmlFor="joiningDate">
            Joining Date *
          </label>

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
          <label htmlFor="status">
            Status *
          </label>

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
          <label htmlFor="qualification">
            Qualification
          </label>

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
          <label htmlFor="address">
            Address
          </label>

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
          <label htmlFor="photo">
            Teacher Photo
          </label>

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
            {loading ? "💾 Saving..." : "💾 Save Teacher"}
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