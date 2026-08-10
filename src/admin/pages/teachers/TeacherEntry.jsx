import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherEntry.css";

export default function TeacherEntry() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teacherId: "",
    nameBn: "",
    nameEn: "",
    shortName: "",
    branch: "",
    course: "",
    designation: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    joiningDate: "",
    qualification: "",
    address: "",
    status: "active",
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/teacher_entry.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("HTTP Error: " + response.status);
      }

      const data = await response.json();

      if (data.success) {
        setMessage("Teacher added successfully");

        setForm({
          teacherId: "",
          nameBn: "",
          nameEn: "",
          shortName: "",
          branch: "",
          course: "",
          designation: "",
          mobile: "",
          email: "",
          dateOfBirth: "",
          joiningDate: "",
          qualification: "",
          address: "",
          status: "active",
        });

        setPhoto(null);

        const photoInput = document.getElementById("teacher-photo");

        if (photoInput) {
          photoInput.value = "";
        }

        setTimeout(() => {
          navigate("/admin/teacher-list");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to add teacher");
      }
    } catch (error) {
      console.error("Teacher Entry Error:", error);
      setMessage("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-entry-page">

      <div className="teacher-entry-header">
        <div>
          <h1>Teacher Entry</h1>
          <p>নতুন শিক্ষকের তথ্য যোগ করুন</p>
        </div>
      </div>

      <form
        className="teacher-entry-form"
        onSubmit={handleSubmit}
      >

        {/* Personal Information */}

        <h2>Personal Information</h2>

        <div className="teacher-form-grid">

          <div className="teacher-form-group">
            <label>Teacher ID</label>

            <input
              type="text"
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              placeholder="Teacher ID"
            />
          </div>

          <div className="teacher-form-group">
            <label>Teacher Photo</label>

            <input
              id="teacher-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="teacher-form-group">
            <label>Name (Bangla)</label>

            <input
              type="text"
              name="nameBn"
              value={form.nameBn}
              onChange={handleChange}
              placeholder="বাংলায় নাম"
            />
          </div>

          <div className="teacher-form-group">
            <label>Name (English)</label>

            <input
              type="text"
              name="nameEn"
              value={form.nameEn}
              onChange={handleChange}
              placeholder="English Name"
              required
            />
          </div>

          <div className="teacher-form-group">
            <label>Short Name</label>

            <input
              type="text"
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
              placeholder="Short Name"
            />
          </div>

          <div className="teacher-form-group">
            <label>Designation</label>

            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Designation"
            />
          </div>

        </div>


        {/* Teaching Information */}

        <h2>Teaching Information</h2>

        <div className="teacher-form-grid">

          <div className="teacher-form-group">
            <label>Branch</label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
            >
              <option value="">Select Branch</option>

              <option value="Rajshahi Main Branch">
                Rajshahi Main Branch
              </option>

              <option value="Ramchandrapur Branch">
                Ramchandrapur Branch
              </option>

              <option value="Khulna Branch">
                Khulna Branch
              </option>

              <option value="Tangail Branch">
                Tangail Branch
              </option>
            </select>
          </div>


          <div className="teacher-form-group">
            <label>Course / Subject</label>

            <select
              name="course"
              value={form.course}
              onChange={handleChange}
            >
              <option value="">Select Course</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
              <option value="Korean">Korean</option>
            </select>
          </div>


          <div className="teacher-form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

        </div>


        {/* Contact Information */}

        <h2>Contact Information</h2>

        <div className="teacher-form-grid">

          <div className="teacher-form-group">
            <label>Mobile</label>

            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
            />
          </div>


          <div className="teacher-form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
          </div>


          <div className="teacher-form-group">
            <label>Date of Birth</label>

            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>


          <div className="teacher-form-group">
            <label>Joining Date</label>

            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
            />
          </div>

        </div>


        {/* Educational Qualification */}

        <h2>Educational Qualification</h2>

        <div className="teacher-form-full">

          <div className="teacher-form-group">
            <label>Qualification</label>

            <textarea
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="Educational Qualification"
              rows="4"
            />
          </div>

        </div>


        {/* Address */}

        <h2>Address</h2>

        <div className="teacher-form-full">

          <div className="teacher-form-group">
            <label>Address</label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full Address"
              rows="4"
            />
          </div>

        </div>


        {/* Buttons */}

        <div className="teacher-form-buttons">

          <button
            type="submit"
            className="teacher-save-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Teacher"}
          </button>


          <button
            type="button"
            className="teacher-cancel-button"
            onClick={() => navigate("/admin/teacher-list")}
          >
            Cancel
          </button>

        </div>


        {message && (
          <p className="teacher-message">
            {message}
          </p>
        )}

      </form>

    </div>
  );
}