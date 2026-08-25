import "./EditCourse.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const defaultLanguages = ["Japanese", "German", "Korean"];

export default function EditCourse() {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const [languageOptions, setLanguageOptions] = useState(defaultLanguages);
  const [form, setForm] = useState({
    language: "",
    course_name: "",
    description: "",
    duration: "",
    course_fee: "",
    offer_price: "",
    status: "Active",
    sort_order: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/language_list.php`, {
          credentials: "include",
        });

        const data = await response.json();
        const names = Array.isArray(data?.data)
          ? data.data.map((item) => item.name).filter(Boolean)
          : [];

        if (names.length > 0) {
          setLanguageOptions(names);
        }
      } catch (error) {
        console.error("Language load error:", error);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (!course) {
      setMessage("No course selected. Please go back to Course List and select a course.");
      return;
    }

    setForm({
      language: course.language || "",
      course_name: course.course_name || "",
      description: course.description || "",
      duration: course.duration || "",
      course_fee: course.course_fee || "",
      offer_price: course.offer_price ?? "",
      status: course.status || "Active",
      sort_order: course.sort_order ?? "",
    });
  }, [course]);

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

    if (!course) {
      setMessage("No course selected.");
      return;
    }

    if (!form.language || !form.course_name || !form.duration || !form.course_fee) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const mainFee = Number(form.course_fee);
    const offerFee = form.offer_price === "" ? null : Number(form.offer_price);

    if (!Number.isFinite(mainFee) || mainFee < 0) {
      setMessage("Valid main course fee is required.");
      return;
    }

    if (offerFee !== null && (!Number.isFinite(offerFee) || offerFee < 0)) {
      setMessage("Offer price must be a valid non-negative number.");
      return;
    }

    if (offerFee !== null && offerFee > mainFee) {
      setMessage("Offer price cannot be greater than the main price.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/course_update.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: course.id,
          language: form.language,
          course_name: form.course_name,
          description: form.description,
          duration: form.duration,
          course_fee: String(mainFee),
          offer_price: offerFee === null ? null : String(offerFee),
          status: form.status,
          sort_order: form.sort_order === "" ? 0 : Number(form.sort_order),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Course updated successfully!");
        navigate("/admin/courses");
      } else {
        setMessage(data.message || "Course update failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <div className="edit-course">
        <div className="edit-course-header">
          <div>
            <h1>Edit Course</h1>
            <p>Update course information</p>
          </div>

          <button type="button" className="back-course-btn" onClick={() => navigate("/admin/courses")}>
            ← Course List
          </button>
        </div>

        <div className="edit-course-card">
          <div className="edit-course-message">No course selected.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-course">
      <div className="edit-course-header">
        <div>
          <h1>Edit Course</h1>
          <p>Update course information</p>
        </div>

        <button type="button" className="back-course-btn" onClick={() => navigate("/admin/courses")}>
          ← Course List
        </button>
      </div>

      <div className="edit-course-card">
        {message && <div className="edit-course-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Language <span>*</span>
            </label>

            <select name="language" value={form.language} onChange={handleChange}>
              <option value="">Select Language</option>
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-group">
            <label>
              Main Price <span>*</span>
            </label>

            <input
              type="number"
              name="course_fee"
              value={form.course_fee}
              onChange={handleChange}
              placeholder="Example: 15000"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Offer Price (Optional)</label>

            <input
              type="number"
              name="offer_price"
              value={form.offer_price}
              onChange={handleChange}
              placeholder="Example: 12000"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

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

          <div className="form-buttons">
            <button type="button" className="cancel-course-btn" onClick={() => navigate("/admin/courses")}>
              Cancel
            </button>

            <button type="submit" className="save-course-btn" disabled={saving}>
              {saving ? "Saving..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}