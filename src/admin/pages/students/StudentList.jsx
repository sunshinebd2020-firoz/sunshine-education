import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentList.css";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

const API = API_BASE_URL;
const IMAGE_URL = API_ORIGIN;

const parseJsonResponse = async (response, fallbackMessage) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage || "Server response is empty.");
  }

  const trimmed = text.trim();
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (
    !contentType.includes("application/json") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    throw new Error(
      "Backend API is not responding with JSON. Check if the PHP API URL is correct and the server is running."
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error("Invalid JSON response:", trimmed);
    throw new Error(fallbackMessage || "Server returned an invalid response format.");
  }
};

export default function StudentList() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [teacherLoading, setTeacherLoading] =
    useState(false);

  const getStudentIdentifier = (student) => {
    if (!student) return "";

    return (
      student.student_id ??
      student.studentId ??
      student.id ??
      ""
    );
  };

  const getTeacherIdentifier = (teacher) => {
    if (!teacher) return "";

    return (
      teacher.teacher_id ??
      teacher.teacherId ??
      teacher.id ??
      ""
    );
  };

  const isPendingApplication = (student) => {
    if (!student || typeof student !== "object") return false;

    const applicationStatus = String(
      student.application_status ||
      student.applicationStatus ||
      student.status ||
      ""
    ).trim().toLowerCase();

    return (
      applicationStatus === "pending" ||
      applicationStatus === "new" ||
      applicationStatus === "draft" ||
      applicationStatus === "submitted" ||
      applicationStatus === "approval pending" ||
      applicationStatus === "waiting for approval"
    );
  };


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

  const normalizedRole = userRole
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isAdmin =
    normalizedRole === "admin" ||
    normalizedRole === "administrator" ||
    normalizedRole === "super admin" ||
    normalizedRole === "superadmin" ||
    normalizedRole.includes("admin");


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

      const data = await parseJsonResponse(response, "Student data পাওয়া যায়নি।");


      if (data.success) {

        const approvedStudents = Array.isArray(data.students)
          ? data.students.filter((student) => !isPendingApplication(student))
          : [];

        setStudents(approvedStudents);

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

      const data = await parseJsonResponse(response, "Teacher list পাওয়া যায়নি।");


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

  const getPhotoValue = (student) => {
    if (!student) return "";

    return (
      student.student_photo ||
      student.photo ||
      student.profile_photo ||
      student.image ||
      student.studentImage ||
      student.image_url ||
      ""
    );
  };

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return "";
    }

    const photoPath = String(photo).trim();

    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("data:")
    ) {
      return photoPath;
    }

    const cleanPath = photoPath
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/g, "")
      .replace(/^uploads\/students\//i, "")
      .replace(/^uploads\//i, "")
      .replace(/^students\//i, "")
      .replace(/^.*?uploads\//i, "")
      .split(/[\\/]+/)
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/");

    if (!cleanPath) {
      return "";
    }

    return `${IMAGE_URL}/uploads/students/${cleanPath}`;
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

                        {getPhotoValue(student) ? (

                          <img
                            src={getPhotoUrl(
                              getPhotoValue(student)
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

    </div>
  );
}
