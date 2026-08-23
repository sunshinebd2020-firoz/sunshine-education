import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentList.css";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

const API = API_BASE_URL;
const IMAGE_URL = API_ORIGIN;

export default function StudentList() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [teacherLoading, setTeacherLoading] =
    useState(false);

  const [showAssignModal, setShowAssignModal] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [selectedTeacher, setSelectedTeacher] =
    useState("");


  /*
  =====================================================
  GET CURRENT LOGIN
  =====================================================
  */

  const getCurrentUser = () => {

    const possibleKeys = [
      "sunshine_user",
      "admin",
      "currentAdmin",
      "user",
      "currentUser",
      "loginUser",
    ];

    for (const key of possibleKeys) {

      try {

        const value =
          localStorage.getItem(key);

        if (!value) continue;

        const data =
          JSON.parse(value);

        if (data && typeof data === "object") {

          return data;
        }

      } catch {

        console.warn(
          `Invalid localStorage data: ${key}`
        );

      }
    }

    return null;
  };


  /*
  =====================================================
  LOGIN USER
  =====================================================
  */

  const currentUser =
    getCurrentUser();


  const userRole = String(
    currentUser?.role ||
    currentUser?.user_role ||
    currentUser?.admin_role ||
    ""
  ).trim();


  const isAdmin =
    userRole.toLowerCase() === "admin" ||
    userRole.toLowerCase() === "super admin" ||
    userRole.toLowerCase() === "superadmin";


  /*
  =====================================================
  LOAD STUDENTS
  =====================================================
  */

  const loadStudents = async () => {

    try {

      setLoading(true);

      setMessage("");


      const params =
        new URLSearchParams();


      params.set(
        "role",
        userRole
      );


      const response = await fetch(
        `${API}/students.php?${params.toString()}`,
        { credentials: "include" }
      );


      const data =
        await response.json();


      if (data.success) {

        setStudents(
          Array.isArray(data.students)
            ? data.students
            : []
        );

        setMessage("");

      } else {

        setStudents([]);

        setMessage(
          data.message ||
          "Student data পাওয়া যায়নি।"
        );
      }

    } catch (error) {

      console.error(
        "Student loading error:",
        error
      );

      setStudents([]);

      setMessage(
        "Server connection failed"
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  =====================================================
  LOAD TEACHERS
  =====================================================
  */

  const loadTeachers = async () => {

    try {

      setTeacherLoading(true);


      const response = await fetch(
        `${API}/teacher_list.php`,
        { credentials: "include" }
      );


      const data =
        await response.json();


      if (data.success) {

        setTeachers(
          Array.isArray(data.teachers)
            ? data.teachers
            : []
        );

      } else {

        setTeachers([]);

        setMessage(
          data.message ||
          "Teacher list পাওয়া যায়নি।"
        );
      }

    } catch (error) {

      console.error(
        "Teacher loading error:",
        error
      );

      setTeachers([]);

      setMessage(
        "Teacher server connection failed"
      );

    } finally {

      setTeacherLoading(false);
    }
  };


  /*
  =====================================================
  INITIAL LOAD
  =====================================================
  */

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /*
  =====================================================
  ASSIGN MODAL
  =====================================================
  */

  const openAssignModal = (student) => {

    setSelectedStudent(student);

    setSelectedTeacher("");

    setShowAssignModal(true);

    loadTeachers();
  };


  /*
  =====================================================
  CLOSE MODAL
  =====================================================
  */

  const closeAssignModal = () => {

    setShowAssignModal(false);

    setSelectedStudent(null);

    setSelectedTeacher("");
  };


  /*
  =====================================================
  ASSIGN TEACHER
  =====================================================
  */

  const handleAssignTeacher = async () => {

    if (!selectedStudent) {

      setMessage(
        "Student নির্বাচন করা হয়নি।"
      );

      return;
    }


    if (!selectedTeacher) {

      setMessage(
        "অনুগ্রহ করে একজন teacher নির্বাচন করুন।"
      );

      return;
    }


    try {

      setMessage("");


      const response = await fetch(
        `${API}/student_teacher_assign.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            student_id:
              selectedStudent.id,

            teacher_id:
              selectedTeacher,
          }),
        }
      );


      const data =
        await response.json();


      if (data.success) {

        setMessage(
          data.message ||
          "Teacher assigned successfully."
        );

        closeAssignModal();

      } else {

        setMessage(
          data.message ||
          "Teacher assignment failed."
        );
      }

    } catch (error) {

      console.error(
        "Teacher assignment error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };


  /*
  =====================================================
  ACTIVE / INACTIVE
  =====================================================
  */

  const handleStatus = async (
    id,
    status
  ) => {

    try {

      const response = await fetch(
        `${API}/student_status.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
            status,
          }),
        }
      );


      const data =
        await response.json();


      if (data.success) {

        setMessage(
          data.message ||
          "Status updated successfully"
        );

        loadStudents();

      } else {

        setMessage(
          data.message ||
          "Status update failed"
        );
      }

    } catch (error) {

      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };


  /*
  =====================================================
  DELETE STUDENT
  =====================================================
  */

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "আপনি কি এই শিক্ষার্থীকে Delete করতে চান?"
      );


    if (!confirmDelete) {

      return;
    }


    try {

      const response = await fetch(
        `${API}/delete_student.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );


      const data =
        await response.json();


      if (data.success) {

        setMessage(
          data.message ||
          "Student deleted successfully"
        );

        loadStudents();

      } else {

        setMessage(
          data.message ||
          "Student delete failed"
        );
      }

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };


  /*
  =====================================================
  SEARCH
  =====================================================
  */

  const filteredStudents =
    students.filter((student) => {

      const searchText =
        search.trim().toLowerCase();


      if (!searchText) {

        return true;
      }


      return (

        String(
          student.student_id || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          student.student_name_bn || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          student.student_name_en ||
          student.student_name ||
          ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          student.student_mobile ||
          student.mobile ||
          ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          student.course || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          student.language_level || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });


  /*
  =====================================================
  PHOTO
  =====================================================
  */

  const getPhotoUrl = (photo) => {

    if (!photo) {

      return "";
    }


    return `${IMAGE_URL}/uploads/students/${photo}`;
  };


  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (

    <div className="student-list">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="student-list-header">

        <div>

          <h1>
            Student List
          </h1>

          <p>
            নিবন্ধিত শিক্ষার্থীদের তালিকা
          </p>

        </div>


        <button
          type="button"
          className="admin-list-add-button"
          onClick={() => navigate("/admin/students")}
        >
          + Add Student
        </button>


        <div className="student-count">

          Total: {filteredStudents.length}

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="student-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course or level..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <p className="student-message">

          {message}

        </p>

      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-container">

        {loading ? (

          <p className="no-student">
            Loading students...
          </p>

        ) : (

          <>

            <table>

              <thead>

                <tr>

                  <th>
                    Photo
                  </th>

                  <th>
                    ID No
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Language
                  </th>

                  <th>
                    Level
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                    >


                      {/* PHOTO */}

                      <td>

                        {student.student_photo ? (

                          <img
                            src={getPhotoUrl(
                              student.student_photo
                            )}
                            alt={
                              student.student_name_en ||
                              student.student_name ||
                              "Student"
                            }
                            className="student-photo"
                          />

                        ) : (

                          <span className="no-photo">
                            No Photo
                          </span>

                        )}

                      </td>


                      {/* ID */}

                      <td>

                        <strong className="student-id">

                          {student.student_id ||
                            `#${student.id}`}

                        </strong>

                      </td>


                      {/* NAME */}

                      <td>

                        <div className="student-name">

                          <strong>

                            {student.student_name_en ||
                              student.student_name ||
                              "-"}

                          </strong>


                          {student.student_name_bn && (

                            <span>

                              {
                                student.student_name_bn
                              }

                            </span>

                          )}

                        </div>

                      </td>


                      {/* LANGUAGE */}

                      <td>

                        {student.course || "-"}

                      </td>


                      {/* LEVEL */}

                      <td>

                        {student.language_level ||
                          "-"}

                      </td>


                      {/* MOBILE */}

                      <td>

                        {student.student_mobile ||
                          student.mobile ||
                          "-"}

                      </td>


                      {/* STATUS */}

                      <td>

                        {String(
                          student.status
                        ).toLowerCase() ===
                        "active" ? (

                          <span className="status-active">
                            Active
                          </span>

                        ) : (

                          <span className="status-inactive">
                            Inactive
                          </span>

                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="student-actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            className="details-button"
                            title="View Student"
                            onClick={() =>
                              navigate(
                                `/admin/student-profile/${student.id}`
                              )
                            }
                          >
                            👁️
                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            className="edit-button"
                            title="Edit Student"
                            onClick={() =>
                              navigate(
                                `/admin/student-edit/${student.id}`
                              )
                            }
                          >
                            ✏️
                          </button>


                          {/* ASSIGN TEACHER */}

                          {isAdmin && (

                            <button
                              type="button"
                              className="assign-teacher-button"
                              title="Assign Teacher"
                              onClick={() =>
                                openAssignModal(
                                  student
                                )
                              }
                            >
                              👨‍🏫
                            </button>

                          )}


                          {/* STATUS */}

                          {String(
                            student.status
                          ).toLowerCase() ===
                          "active" ? (

                            <button
                              type="button"
                              className="inactive-button"
                              title="Make Inactive"
                              onClick={() =>
                                handleStatus(
                                  student.id,
                                  "inactive"
                                )
                              }
                            >
                              🔴
                            </button>

                          ) : (

                            <button
                              type="button"
                              className="active-button"
                              title="Make Active"
                              onClick={() =>
                                handleStatus(
                                  student.id,
                                  "active"
                                )
                              }
                            >
                              🟢
                            </button>

                          )}


                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete Student"
                            onClick={() =>
                              handleDelete(
                                student.id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {filteredStudents.length === 0 && (

              <p className="no-student">

                কোনো শিক্ষার্থী পাওয়া যায়নি।

              </p>

            )}

          </>

        )}

      </div>


      {/* =================================================
          ASSIGN TEACHER MODAL
      ================================================= */}

      {showAssignModal && (

        <div
          className="assign-modal-overlay"
          onClick={closeAssignModal}
        >

          <div
            className="assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="assign-modal-header">

              <div>

                <h2>
                  Assign Teacher
                </h2>

                <p>
                  শিক্ষার্থীকে শিক্ষক assign করুন
                </p>

              </div>


              <button
                type="button"
                className="assign-close-button"
                onClick={closeAssignModal}
              >
                ×
              </button>

            </div>


            {/* STUDENT */}

            {selectedStudent && (

              <div className="selected-student-box">

                <strong>

                  {
                    selectedStudent.student_name_en ||
                    selectedStudent.student_name_bn ||
                    "-"
                  }

                </strong>

                <span>

                  ID:
                  {" "}
                  {
                    selectedStudent.student_id ||
                    selectedStudent.id
                  }

                </span>

              </div>

            )}


            {/* TEACHER */}

            <div className="assign-form-group">

              <label>
                Select Teacher
              </label>


              {teacherLoading ? (

                <div className="teacher-loading">

                  Loading teachers...

                </div>

              ) : (

                <select
                  value={selectedTeacher}
                  onChange={(e) =>
                    setSelectedTeacher(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    -- Select Teacher --
                  </option>


                  {teachers.map(
                    (teacher) => (

                      <option
                        key={teacher.id}
                        value={teacher.teacher_id}
                      >

                        {teacher.name_en ||
                          teacher.name_bn ||
                          teacher.teacher_id}

                        {" — "}

                        {teacher.designation || ""}

                      </option>

                    )
                  )}

                </select>

              )}

            </div>


            {/* BUTTONS */}

            <div className="assign-modal-actions">

              <button
                type="button"
                className="assign-cancel-button"
                onClick={closeAssignModal}
              >
                Cancel
              </button>


              <button
                type="button"
                className="assign-save-button"
                onClick={
                  handleAssignTeacher
                }
              >
                👨‍🏫 Assign Teacher
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
