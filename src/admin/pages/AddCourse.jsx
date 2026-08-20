import "./AddCourse.css";
import API_BASE_URL from "../../config/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCourse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    language: "",
    course_name: "",
    description: "",
    duration: "",
    course_fee: "",
    status: "Active",
    sort_order: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (
      !form.language ||
      !form.course_name ||
      !form.duration ||
      !form.course_fee
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/add_course.php`,
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
        alert("Course added successfully!");
        navigate("/admin/courses");
      } else {
        setMessage(data.message || "Course could not be added.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course">

      {/* ================= HEADER ================= */}

      <div className="add-course-header">
        <div>
          <h1>Add Course</h1>
          <p>Create a new course</p>
        </div>

        <button
          type="button"
          className="back-course-btn"
          onClick={() => navigate("/admin/courses")}
        >
          ← Course List
        </button>
      </div>


      {/* ================= FORM ================= */}

      <div className="add-course-card">

        {message && (
          <div className="add-course-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Language */}

          <div className="form-group">
            <label>
              Language <span>*</span>
            </label>

            <select
              name="language"
              value={form.language}
              onChange={handleChange}
            >
              <option value="">Select Language</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
              <option value="Korean">Korean</option>
            </select>
          </div>


          {/* Course Name */}

          <div className="form-group">
            <label>
              Course Name <span>*</span>
            </label>

            <input
              type="text"
              name="course_name"
              value={form.course_name}
              onChange={handleChange}
              placeholder="Example: N5"
            />
          </div>


          {/* Description */}

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Example: Japanese N5 Course"
              rows="4"
            />
          </div>


          {/* Duration */}

          <div className="form-group">
            <label>
              Duration <span>*</span>
            </label>

            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Example: 3 Months"
            />
          </div>


          {/* Course Fee */}

          <div className="form-group">
            <label>
              Course Fee <span>*</span>
            </label>

            <input
              type="number"
              name="course_fee"
              value={form.course_fee}
              onChange={handleChange}
              placeholder="Example: 15000"
              min="0"
            />
          </div>


          {/* Status */}

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>


          {/* Sort Order */}

          <div className="form-group">
            <label>Sort Order</label>

            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              placeholder="Example: 1"
              min="0"
            />
          </div>


          {/* BUTTONS */}

          <div className="form-buttons">

            <button
              type="button"
              className="cancel-course-btn"
              onClick={() => navigate("/admin/courses")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-course-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Course"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}