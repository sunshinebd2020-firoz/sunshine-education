import "./EditCourse.css";
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";

export default function EditCourse() {

  const location = useLocation();
  const navigate = useNavigate();


  /* =========================================
     SELECTED COURSE
  ========================================= */

  const course = location.state?.course;


  /* =========================================
     FORM
  ========================================= */

  const [form, setForm] = useState({

    language: "",
    course_name: "",
    description: "",
    duration: "",
    course_fee: "",
    status: "Active",
    sort_order: "",

  });


  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");


  /* =========================================
     LOAD COURSE DATA
  ========================================= */

  useEffect(() => {

    if (!course) {

      setMessage(
        "No course selected. Please go back to Course List and select a course."
      );

      return;

    }


    setForm({

      language: course.language || "",

      course_name:
        course.course_name || "",

      description:
        course.description || "",

      duration:
        course.duration || "",

      course_fee:
        course.course_fee || "",

      status:
        course.status || "Active",

      sort_order:
        course.sort_order ?? "",

    });

  }, [course]);


  /* =========================================
     HANDLE CHANGE
  ========================================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((prev) => ({

      ...prev,

      [name]: value,

    }));

  };


  /* =========================================
     UPDATE
  ========================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();


    setMessage("");


    if (!course) {

      setMessage(
        "No course selected."
      );

      return;

    }


    if (
      !form.language ||
      !form.course_name ||
      !form.duration ||
      !form.course_fee
    ) {

      setMessage(
        "Please fill in all required fields."
      );

      return;

    }


    try {

      setSaving(true);


      const response = await fetch(
        "http://localhost/sunshine-api/api/course_update.php",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            id: course.id,

            language:
              form.language,

            course_name:
              form.course_name,

            description:
              form.description,

            duration:
              form.duration,

            course_fee:
              form.course_fee,

            status:
              form.status,

            sort_order:
              form.sort_order,

          }),

        }
      );


      const data =
        await response.json();


      if (data.success) {

        alert(
          "Course updated successfully!"
        );


        navigate(
          "/admin/courses"
        );

      } else {

        setMessage(
          data.message ||
          "Course update failed."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Server connection failed."
      );

    } finally {

      setSaving(false);

    }

  };


  /* =========================================
     NO COURSE
  ========================================= */

  if (!course) {

    return (

      <div className="edit-course">

        <div className="edit-course-header">

          <div>

            <h1>
              Edit Course
            </h1>

            <p>
              Update course information
            </p>

          </div>


          <button
            type="button"
            className="back-course-btn"
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
          >
            ← Course List
          </button>

        </div>


        <div className="edit-course-card">

          <div className="edit-course-message">
            No course selected.
          </div>

        </div>

      </div>

    );

  }


  /* =========================================
     PAGE
  ========================================= */

  return (

    <div className="edit-course">


      {/* ================= HEADER ================= */}

      <div className="edit-course-header">

        <div>

          <h1>
            Edit Course
          </h1>

          <p>
            Update course information
          </p>

        </div>


        <button
          type="button"
          className="back-course-btn"
          onClick={() =>
            navigate(
              "/admin/courses"
            )
          }
        >
          ← Course List
        </button>

      </div>


      {/* ================= CARD ================= */}

      <div className="edit-course-card">


        {message && (

          <div className="edit-course-message">
            {message}
          </div>

        )}


        <form onSubmit={handleSubmit}>


          {/* LANGUAGE */}

          <div className="form-group">

            <label>
              Language <span>*</span>
            </label>


            <select
              name="language"
              value={form.language}
              onChange={handleChange}
            >

              <option value="">
                Select Language
              </option>

              <option value="Japanese">
                Japanese
              </option>

              <option value="German">
                German
              </option>

              <option value="Korean">
                Korean
              </option>

            </select>

          </div>


          {/* COURSE NAME */}

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


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>


            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Example: Japanese N5 Course"
              rows="4"
            />

          </div>


          {/* DURATION */}

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


          {/* COURSE FEE */}

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


          {/* STATUS */}

          <div className="form-group">

            <label>
              Status
            </label>


            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>


          {/* SORT ORDER */}

          <div className="form-group">

            <label>
              Sort Order
            </label>


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
              onClick={() =>
                navigate(
                  "/admin/courses"
                )
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="save-course-btn"
              disabled={saving}
            >

              {saving
                ? "Updating..."
                : "Update Course"}

            </button>


          </div>

        </form>

      </div>

    </div>

  );

}