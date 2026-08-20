import "./CourseList.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseList() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();


  /* =====================================================
     FETCH COURSES
  ===================================================== */

  const fetchCourses = async () => {

    try {

      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/course_list.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {

        setCourses(data.data);

      } else {

        setMessage(
          data.message || "Course load failed"
        );

      }

    } catch (error) {

      console.error(error);

      setMessage("Server connection failed");

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     LOAD COURSES
  ===================================================== */

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();

  }, []);


  /* =====================================================
     DELETE COURSE
  ===================================================== */

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "আপনি কি এই course টি delete করতে চান?"
    );

    if (!confirmDelete) {
      return;
    }


    try {

      setMessage("");


      const response = await fetch(
        `${API_BASE_URL}/course_delete.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id: id,
          }),
        }
      );


      const data = await response.json();


      if (data.success) {

        setMessage(
          data.message || "Course deleted successfully."
        );


        /*
          Delete হওয়ার পর আবার database
          থেকে course list load হবে
        */

        fetchCourses();

      } else {

        setMessage(
          data.message || "Course delete failed."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage("Server connection failed.");

    }

  };


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredCourses = courses.filter((course) =>

    `${course.language}
     ${course.course_name}
     ${course.description}
     ${course.duration}
     ${course.course_fee}
     ${course.status}`
      .toLowerCase()
      .includes(search.toLowerCase())

  );


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <div className="course-list">


      {/* =================================================
         HEADER
      ================================================= */}

      <div className="course-list-header">

        <div>

          <h1>
            Course List
          </h1>

          <p>
            সকল কোর্সের তালিকা
          </p>

        </div>


        <div className="course-total">

          Total: {courses.length}

        </div>

      </div>


      {/* =================================================
         SEARCH
      ================================================= */}

      <div className="course-search">

        <input
          type="text"
          placeholder="Search by language, course name, duration or fee..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* =================================================
         ADD COURSE
      ================================================= */}

      <div className="course-add">

        <button
          className="add-course-btn"
          onClick={() =>
            navigate("/admin/AddCourse")
          }
        >
          + Add Course
        </button>

      </div>


      {/* =================================================
         MESSAGE
      ================================================= */}

      {message && (

        <div className="course-message">

          {message}

        </div>

      )}


      {/* =================================================
         TABLE
      ================================================= */}

      {loading ? (

        <div className="course-loading">

          Loading courses...

        </div>

      ) : (

        <div className="course-table-wrapper">

          <table className="course-table">


            {/* ================= HEADER ================= */}

            <thead>

              <tr>

                <th>SL</th>

                <th>Language</th>

                <th>Course Name</th>

                <th>Description</th>

                <th>Duration</th>

                <th>Course Fee</th>

                <th>Status</th>

                <th>Sort Order</th>

                <th>Action</th>

              </tr>

            </thead>


            {/* ================= BODY ================= */}

            <tbody>

              {filteredCourses.length > 0 ? (

                filteredCourses.map(
                  (course, index) => (

                    <tr key={course.id}>


                      {/* SL */}

                      <td>
                        {index + 1}
                      </td>


                      {/* LANGUAGE */}

                      <td>

                        <span className="language-badge">

                          {course.language}

                        </span>

                      </td>


                      {/* COURSE NAME */}

                      <td>

                        <strong>

                          {course.course_name}

                        </strong>

                      </td>


                      {/* DESCRIPTION */}

                      <td>

                        {course.description || "-"}

                      </td>


                      {/* DURATION */}

                      <td>

                        {course.duration || "-"}

                      </td>


                      {/* COURSE FEE */}

                      <td>

                        ৳{" "}

                        {Number(
                          course.course_fee
                        ).toLocaleString()}

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            course.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }
                        >

                          {course.status}

                        </span>

                      </td>


                      {/* SORT ORDER */}

                      <td>

                        {course.sort_order}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="course-actions">


                          {/* ================= EDIT ================= */}

                          <button
                            className="edit-btn"
                            onClick={() =>
                              navigate(
                                "/admin/EditCourse",
                                {
                                  state: {
                                    course: course,
                                  },
                                }
                              )
                            }
                          >

                            Edit

                          </button>


                          {/* ================= DELETE ================= */}

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(course.id)
                            }
                          >

                            Delete

                          </button>


                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="no-course"
                  >

                    No courses found

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}