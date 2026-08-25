import "./AddCourse.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultLanguages = ["Japanese", "German", "Korean"];

export default function AddCourse() {
  const navigate = useNavigate();
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      const payload = {
        ...form,
        course_fee: String(mainFee),
        offer_price: offerFee === null ? null : String(offerFee),
        sort_order: form.sort_order === "" ? 0 : Number(form.sort_order),
      };

      const response = await fetch(`${API_BASE_URL}/add_course.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Response Text চেক করা যাতে JSON Parse Error হলে বোঝা যায়
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("Server returned non-JSON response:", responseText);
        throw new Error("Invalid server response format");
      }

      if (response.ok && data.success) {
        alert("Course added successfully!");
        navigate("/admin/courses");
      } else {
        setMessage(data.message || "Course could not be added.");
      }
    } catch (error) {
      console.error("API Error details:", error);
      setMessage(`Server connection failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course">
      <div className="add-course-header">
        <div>
          <h1>Add Course</h1>
          <p>Create a new course</p>
        </div>

        <button type="button" className="back-course-btn" onClick={() => navigate("/admin/courses")}>
          ← Course List
        </button>
      </div>

      <div className="add-course-card">
        {message && <div className="add-course-message">{message}</div>}

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

            <button type="submit" className="save-course-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}