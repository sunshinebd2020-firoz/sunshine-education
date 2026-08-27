import { useEffect, useState } from "react";
import API_BASE_URL from "../../../config/api";
import "./StudentList.css";

const API = API_BASE_URL;

const parseJsonResponse = async (response, fallbackMessage) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage || "Server response is empty.");
  }

  const trimmed = text.trim();
  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

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
    throw new Error(
      fallbackMessage || "Server returned an invalid response format."
    );
  }
};

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
      const value = localStorage.getItem(key);

      if (!value) continue;

      const data = JSON.parse(value);

      if (data && typeof data === "object") {
        return data;
      }
    } catch {
      console.warn(`Invalid localStorage data: ${key}`);
    }
  }

  return null;
};

const getStudentId = (student) => {
  if (!student) return "";

  return String(
    student.student_id ??
      student.studentId ??
      student.id ??
      ""
  ).trim();
};

const getTeacherId = (teacher) => {
  if (!teacher) return "";

  return String(
    teacher.teacher_id ??
      teacher.teacherId ??
      teacher.id ??
      ""
  ).trim();
};

const getTeacherName = (teacher) => {
  if (!teacher) return "Unknown Teacher";

  return (
    teacher.name_en ||
    teacher.name_bn ||
    teacher.full_name ||
    teacher.teacher_name ||
    "Unknown Teacher"
  );
};

const getStudentName = (student) => {
  if (!student) return "";

  return (
    student.student_name_en ||
    student.student_name ||
    student.name_en ||
    student.name ||
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
  )
    .trim()
    .toLowerCase();

  return [
    "pending",
    "new",
    "draft",
    "submitted",
    "approval pending",
    "waiting for approval",
  ].includes(applicationStatus);
};

export default function AssignStudent() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = getCurrentUser();

  const userRole = String(
    currentUser?.role ||
      currentUser?.user_role ||
      currentUser?.admin_role ||
      ""
  )
    .trim()
    .toLowerCase();

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);

      const response = await fetch(`${API}/teacher_list.php`, {
        credentials: "include",
      });

      const data = await parseJsonResponse(
        response,
        "Teacher list unavailable."
      );

      if (data.success) {
        const teacherRows = Array.isArray(data.teachers)
          ? data.teachers
          : [];

        const activeTeachers = teacherRows.filter((teacher) => {
          const status = String(
            teacher?.status ?? teacher?.teacher_status ?? ""
          )
            .trim()
            .toLowerCase();

          const role = String(
            teacher?.role ?? teacher?.user_role ?? ""
          )
            .trim()
            .toLowerCase();

          return (
            status === "active" ||
            status === "present" ||
            status === "1" ||
            status === "" ||
            role === "teacher"
          );
        });

        setTeachers(activeTeachers);
      } else {
        setTeachers([]);
        setMessage(data.message || "Teacher list unavailable.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Teacher loading error:", error);

      setTeachers([]);
      setMessage("Teacher server connection failed.");
      setMessageType("error");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setMessage("");

      const params = new URLSearchParams();

      if (userRole) {
        params.set("role", userRole);
      }

      const response = await fetch(
        `${API}/students.php?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      const data = await parseJsonResponse(
        response,
        "Student data unavailable."
      );

      if (data.success) {
        const approvedStudents = Array.isArray(data.students)
          ? data.students.filter(
              (student) => !isPendingApplication(student)
            )
          : [];

        setStudents(approvedStudents);
      } else {
        setStudents([]);
        setMessage(data.message || "Student data unavailable.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Student loading error:", error);

      setStudents([]);
      setMessage("Server connection failed.");
      setMessageType("error");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadStudents();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  useEffect(() => {
    const courses = Array.from(
      new Set(
        students
          .map((student) => String(student.course || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    const levels = Array.from(
      new Set(
        students
          .map((student) =>
            String(
              student.language_level || student.level || ""
            ).trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    setAvailableCourses(courses);
    setAvailableLevels(levels);

    if (selectedCourse && !courses.includes(selectedCourse)) {
      setSelectedCourse("");
    }

    if (selectedLevel && !levels.includes(selectedLevel)) {
      setSelectedLevel("");
    }
  }, [students, selectedCourse, selectedLevel]);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [selectedTeacherId]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCourse("");
    setSelectedLevel("");
  };

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();

    const studentId = getStudentId(student).toLowerCase();
    const name = getStudentName(student).toLowerCase();

    const mobile = String(
      student.student_mobile || student.mobile || ""
    ).toLowerCase();

    const course = String(student.course || "").trim();
    const level = String(
      student.language_level || student.level || ""
    ).trim();

    const matchesSearch =
      !query ||
      [
        studentId,
        name,
        mobile,
        course.toLowerCase(),
        level.toLowerCase(),
      ].some((value) => value.includes(query));

    const matchesCourse =
      !selectedCourse || course === selectedCourse;

    const matchesLevel =
      !selectedLevel || level === selectedLevel;

    return (
      matchesSearch &&
      matchesCourse &&
      matchesLevel
    );
  });

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentIds.includes(getStudentId(student))
    );

  const handleSelectAll = () => {
    const visibleIds = filteredStudents
      .map((student) => getStudentId(student))
      .filter(Boolean);

    if (allVisibleSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !visibleIds.includes(String(id)))
      );

      return;
    }

    setSelectedStudentIds((prev) =>
      Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const toggleStudentSelection = (studentId) => {
    const nextId = String(studentId).trim();

    if (!nextId) return;

    setSelectedStudentIds((prev) => {
      if (prev.includes(nextId)) {
        return prev.filter((id) => id !== nextId);
      }

      return [...prev, nextId];
    });
  };

  const handleAssign = async (event) => {
    event.preventDefault();

    /*
     * ONLY Teacher + at least one Student are required.
     * Course and Level are filters only.
     */

    if (!selectedTeacherId) {
      setMessage("Please select a teacher before assigning students.");
      setMessageType("error");
      return;
    }

    if (!selectedStudentIds.length) {
      setMessage("Please select at least one student to assign.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("info");

    try {
      const normalizedTeacherId =
        String(selectedTeacherId).trim();

      const selectedValues = selectedStudentIds
        .map((value) => String(value).trim())
        .filter(Boolean);

      if (!normalizedTeacherId) {
        setMessage("Teacher ID is invalid.");
        setMessageType("error");
        return;
      }

      if (!selectedValues.length) {
        setMessage("Selected student IDs are invalid.");
        setMessageType("error");
        return;
      }

      let successfulAssignments = 0;

      for (const selectedValue of selectedValues) {
        const payload = {
          teacher_id: normalizedTeacherId,
          student_id: selectedValue,
        };

        console.log(
          "Sending Payload:",
          JSON.stringify(payload)
        );

        const response = await fetch(
          `${API}/student_teacher_assign.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await parseJsonResponse(
          response,
          "Teacher assignment failed."
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Failed to assign student ${selectedValue}.`
          );
        }

        successfulAssignments += 1;
      }

      setMessage(
        successfulAssignments > 1
          ? `${successfulAssignments} students assigned successfully.`
          : "Selected student assigned successfully."
      );

      setMessageType("success");

      setSelectedTeacherId("");
      setSelectedStudentIds([]);

      await loadStudents();
    } catch (error) {
      console.error("Assign students error:", error);

      setMessage(
        error.message || "Server connection failed."
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const alertStyle =
    messageType === "success"
      ? {
          padding: "0.9rem 1rem",
          borderRadius: "8px",
          background: "#ecfdf5",
          color: "#166534",
          border: "1px solid #a7f3d0",
          margin: "1rem 0",
          fontWeight: 600,
        }
      : messageType === "error"
        ? {
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            background: "#fef3f2",
            color: "#b42318",
            border: "1px solid #f9b7af",
            margin: "1rem 0",
            fontWeight: 600,
          }
        : {
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            margin: "1rem 0",
            fontWeight: 600,
          };

  const assignDisabled =
    submitting ||
    !selectedTeacherId ||
    selectedStudentIds.length === 0;

  return (
    <div className="student-list">
      <div className="student-list-header">
        <div>
          <h1>Assign Students</h1>
          <p>
            Select a teacher and assign students in bulk.
          </p>
        </div>
      </div>

      <form onSubmit={handleAssign}>
        <div
          className="student-search"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 280px) minmax(180px, 220px) minmax(180px, 220px) minmax(180px, 220px) auto",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label style={{ fontWeight: 600 }}>
              Course
            </label>

            <select
              value={selectedCourse}
              onChange={(event) =>
                setSelectedCourse(event.target.value)
              }
              style={{
                width: "100%",
                padding: "0.7rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #d0d5dd",
                background: "#fff",
              }}
            >
              <option value="">All Courses</option>

              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label style={{ fontWeight: 600 }}>
              Level
            </label>

            <select
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(event.target.value)
              }
              style={{
                width: "100%",
                padding: "0.7rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #d0d5dd",
                background: "#fff",
              }}
            >
              <option value="">All Levels</option>

              {availableLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label style={{ fontWeight: 600 }}>
              Teacher
            </label>

            <select
              value={selectedTeacherId}
              onChange={(event) =>
                setSelectedTeacherId(event.target.value)
              }
              disabled={loadingTeachers}
              style={{
                width: "100%",
                padding: "0.7rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #d0d5dd",
                background: "#fff",
              }}
            >
              <option value="">
                {loadingTeachers
                  ? "Loading teachers..."
                  : "Select Teacher"}
              </option>

              {teachers.map((teacher) => {
                const teacherId =
                  getTeacherId(teacher);

                const teacherName =
                  getTeacherName(teacher);

                return (
                  <option
                    key={
                      teacherId ||
                      teacher.id ||
                      teacherName
                    }
                    value={teacherId}
                  >
                    {teacherName}
                    {teacherId
                      ? ` (${teacherId})`
                      : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label style={{ fontWeight: 600 }}>
              Search Students
            </label>

            <input
              type="text"
              placeholder="Search by ID, name, mobile, course or level..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                width: "100%",
                padding: "0.7rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #d0d5dd",
              }}
            />
          </div>

          <button
            type="button"
            className="admin-list-add-button"
            onClick={clearFilters}
            style={{
              height: "fit-content",
              whiteSpace: "nowrap",
            }}
          >
            Clear Filters
          </button>
        </div>

        {message && (
          <p style={alertStyle}>{message}</p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            margin: "0.75rem 0 0.5rem",
          }}
        >
          <strong>
            {filteredStudents.length} Students
          </strong>

          <strong>
            {selectedStudentIds.length} Selected
          </strong>
        </div>

        <div className="table-container">
          {loadingStudents ? (
            <p className="no-student">
              Loading students...
            </p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all visible students"
                      />
                    </th>

                    <th>ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Level</th>
                    <th>Mobile</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const studentId =
                      getStudentId(student);

                    const checked =
                      selectedStudentIds.includes(
                        studentId
                      );

                    return (
                      <tr
                        key={
                          studentId ||
                          `${student.id}-row`
                        }
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleStudentSelection(
                                studentId
                              )
                            }
                            aria-label={`Select ${
                              getStudentName(student) ||
                              "student"
                            }`}
                          />
                        </td>

                        <td>
                          <strong className="student-id">
                            {studentId ||
                              `#${student.id}`}
                          </strong>
                        </td>

                        <td>
                          <div className="student-name">
                            <strong>
                              {getStudentName(student) ||
                                "-"}
                            </strong>

                            {student.student_name_bn && (
                              <span>
                                {student.student_name_bn}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          {student.course || "-"}
                        </td>

                        <td>
                          {student.language_level ||
                            student.level ||
                            "-"}
                        </td>

                        <td>
                          {student.student_mobile ||
                            student.mobile ||
                            "-"}
                        </td>

                        <td>
                          {String(
                            student.status || ""
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <p className="no-student">
                  No students found for this search.
                </p>
              )}
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}
        >
          <button
            type="submit"
            className="admin-list-add-button"
            disabled={assignDisabled}
            style={{
              opacity: assignDisabled ? 0.7 : 1,
              cursor: assignDisabled
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting
              ? "Assigning..."
              : "Assign Selected Students"}
          </button>
        </div>
      </form>
    </div>
  );
}