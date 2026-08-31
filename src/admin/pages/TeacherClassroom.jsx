import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./TeacherClassroom.css";

/*
|--------------------------------------------------------------------------
| DEFAULT VALUES
|--------------------------------------------------------------------------
*/

const emptyBatch = {
  name: "",
  course: "",
  language_level: "",
  schedule_days: "",
  start_time: "",
  end_time: "",
  room: "",
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const asArray = (value) => (Array.isArray(value) ? value : []);

const getId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const getTodayLocalDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const studentName = (student = {}) => {
  return (
    student.student_name_en ||
    student.student_name_bn ||
    student.name_en ||
    student.name_bn ||
    student.student_code ||
    student.student_id ||
    "Unnamed student"
  );
};

/*
|--------------------------------------------------------------------------
| NORMALIZE STUDENT
|--------------------------------------------------------------------------
*/

const normalizeStudent = (student = {}) => {
  return {
    ...student,

    /*
    | students.id = database primary key
    */
    id:
      student.id ??
      student.studentId ??
      "",

    /*
    | students.student_id = public/student code
    */
    student_id:
      student.student_id ??
      student.studentId ??
      "",

    student_name_en:
      student.student_name_en ??
      student.name_en ??
      "",

    student_name_bn:
      student.student_name_bn ??
      student.name_bn ??
      "",

    course:
      student.course ??
      "",

    language_level:
      student.language_level ??
      student.level ??
      "",

    student_mobile:
      student.student_mobile ??
      student.mobile ??
      student.contact_no ??
      "",
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE BATCH
|--------------------------------------------------------------------------
*/

const normalizeBatch = (batch = {}) => {
  return {
    ...batch,

    id:
      batch.id ??
      batch.batch_id ??
      batch.batchId ??
      "",

    name:
      batch.name ??
      batch.batch_name ??
      "Unnamed batch",

    course:
      batch.course ??
      "",

    language_level:
      batch.language_level ??
      batch.level ??
      "",

    schedule_days:
      batch.schedule_days ??
      batch.days ??
      "",

    start_time:
      batch.start_time ??
      "",

    end_time:
      batch.end_time ??
      "",

    room:
      batch.room ??
      "",

    student_count: Number(
      batch.student_count ??
      batch.students_count ??
      batch.total_students ??
      0
    ),
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE CLASS SESSION
|--------------------------------------------------------------------------
*/

const normalizeSession = (session = {}) => {
  return {
    ...session,

    id:
      session.id ??
      session.class_session_id ??
      session.session_id ??
      "",

    class_date:
      session.class_date ??
      session.date ??
      "",

    batch_name:
      session.batch_name ??
      session.batch ??
      "",

    topic:
      session.topic ??
      "",

    notes:
      session.notes ??
      "",
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE ATTENDANCE
|--------------------------------------------------------------------------
*/

const normalizeAttendanceRow = (row = {}) => {
  return {
    ...row,

    id:
      row.id ??
      row.attendance_id ??
      "",

    class_session_id:
      row.class_session_id ??
      row.session_id ??
      row.classSessionId ??
      "",

    /*
    | IMPORTANT:
    | Backend returns students.id as student_id
    */
    student_id:
      row.student_id ??
      row.studentId ??
      "",

    /*
    | Backend returns students.student_id AS student_code
    */
    student_code:
      row.student_code ??
      "",

    attendance_status:
      row.attendance_status ??
      row.status ??
      row.attendanceState ??
      "absent",

    student_name_en:
      row.student_name_en ??
      row.name_en ??
      "",

    student_name_bn:
      row.student_name_bn ??
      row.name_bn ??
      "",
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE TRANSFER REQUEST
|--------------------------------------------------------------------------
*/

const normalizeTransferRequest = (request = {}) => {
  return {
    ...request,

    id:
      request.id ??
      request.transfer_id ??
      "",

    /*
    | student_code comes from students.student_id
    */
    student_code:
      request.student_code ??
      "",

    student_name_en:
      request.student_name_en ??
      request.name_en ??
      "",

    student_name_bn:
      request.student_name_bn ??
      request.name_bn ??
      "",

    to_teacher_id:
      request.to_teacher_id ??
      request.toTeacherId ??
      "",

    to_teacher_name_en:
      request.to_teacher_name_en ??
      request.toTeacherNameEn ??
      "",

    to_teacher_name_bn:
      request.to_teacher_name_bn ??
      request.toTeacherNameBn ??
      "",

    status:
      request.status ??
      "pending",
  };
};

/*
|--------------------------------------------------------------------------
| NORMALIZE COMPLETE API DATA
|--------------------------------------------------------------------------
*/

const normalizeData = (payload = {}) => {
  return {
    students: asArray(payload.students).map(normalizeStudent),

    batches: asArray(payload.batches).map(normalizeBatch),

    sessions: asArray(payload.sessions).map(normalizeSession),

    /*
    | batch_students backend:
    | batch_students.id
    | batch_students.batch_id
    | students.id
    | students.student_id
    */
    batch_students: asArray(payload.batch_students).map((item) => {
      return {
        ...item,

        batch_student_id:
          item.id ??
          item.batch_student_id ??
          "",

        batch_id:
          item.batch_id ??
          item.batchId ??
          "",

        /*
        | IMPORTANT:
        | student_id MUST mean students.id here.
        */
        student_id:
          item.student_id ??
          item.studentId ??
          "",

        student_code:
          item.student_code ??
          "",

        student_name_en:
          item.student_name_en ??
          item.name_en ??
          "",

        student_name_bn:
          item.student_name_bn ??
          item.name_bn ??
          "",

        student_mobile:
          item.student_mobile ??
          item.mobile ??
          item.contact_no ??
          "",
      };
    }),

    attendance:
      asArray(payload.attendance).map(
        normalizeAttendanceRow
      ),

    teachers:
      asArray(payload.teachers).map((teacher) => {
        return {
          ...teacher,

          teacher_id:
            teacher.teacher_id ??
            teacher.id ??
            teacher.teacherId ??
            "",

          name_en:
            teacher.name_en ??
            teacher.teacher_name_en ??
            "",

          name_bn:
            teacher.name_bn ??
            teacher.teacher_name_bn ??
            "",
        };
      }),

    transfer_requests:
      asArray(payload.transfer_requests).map(
        normalizeTransferRequest
      ),
  };
};

/*
|--------------------------------------------------------------------------
| SAFE JSON RESPONSE
|--------------------------------------------------------------------------
*/

const parseJsonResponse = async (
  response,
  fallbackMessage = "Server request failed."
) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      fallbackMessage || "Server response is empty."
    );
  }

  const trimmed = text.trim();

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  /*
  | PHP warning / HTML error
  */
  if (
    !contentType.includes("application/json") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    console.error(
      "Non-JSON backend response:",
      trimmed
    );

    throw new Error(
      "Backend API JSON response দিচ্ছে না। PHP API URL, XAMPP এবং PHP error check করুন।"
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error(
      "Invalid JSON response:",
      trimmed
    );

    throw new Error(
      fallbackMessage ||
        "Server returned an invalid JSON response."
    );
  }
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function TeacherClassroom() {
  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [data, setData] = useState({
    students: [],
    batches: [],
    sessions: [],
    batch_students: [],
    attendance: [],
    teachers: [],
    transfer_requests: [],
  });

  /*
  |--------------------------------------------------------------------------
  | BATCH FORM
  |--------------------------------------------------------------------------
  */

  const [batch, setBatch] = useState(emptyBatch);

  const [selectedBatch, setSelectedBatch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | CLASS SESSION
  |--------------------------------------------------------------------------
  */

  const [session, setSession] = useState({
    class_date: getTodayLocalDate(),
    topic: "",
    notes: "",
  });

  /*
  |--------------------------------------------------------------------------
  | UI STATE
  |--------------------------------------------------------------------------
  */

  const [openSessionId, setOpenSessionId] =
    useState("");

  const [editBatch, setEditBatch] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | TRANSFER
  |--------------------------------------------------------------------------
  */

  const [transferStudent, setTransferStudent] =
    useState(null);

  const [transferTeacherId, setTransferTeacherId] =
    useState("");

  const [transferNote, setTransferNote] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE SECTION
  |--------------------------------------------------------------------------
  */

  const [activeSection, setActiveSection] =
    useState("students");

  /*
  |--------------------------------------------------------------------------
  | TABS
  |--------------------------------------------------------------------------
  */

  const sectionTabs = [
    {
      key: "students",
      label: "Students",
    },
    {
      key: "batches",
      label: "Batches",
    },
    {
      key: "attendance",
      label: "Attendance",
    },
    {
      key: "records",
      label: "Class Records",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOAD CLASSROOM
  |--------------------------------------------------------------------------
  */

  const load = async (preferredBatchId = null) => {
    try {
      setLoading(true);

      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/teacher_classroom.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        await parseJsonResponse(
          response,
          "Could not load classroom."
        );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Could not load classroom."
        );
      }

      const normalized =
        normalizeData(result);

      setData(normalized);

      /*
      |--------------------------------------------------------------------------
      | SELECT BATCH
      |--------------------------------------------------------------------------
      */

      setSelectedBatch((current) => {
        const preferred =
          getId(preferredBatchId);

        if (
          preferred &&
          normalized.batches.some(
            (item) =>
              getId(item.id) === preferred
          )
        ) {
          return preferred;
        }

        const currentValue =
          getId(current);

        if (
          currentValue &&
          normalized.batches.some(
            (item) =>
              getId(item.id) ===
              currentValue
          )
        ) {
          return currentValue;
        }

        return getId(
          normalized.batches[0]?.id
        );
      });
    } catch (error) {
      console.error(
        "Teacher classroom load error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not load classroom."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        load();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SELECTED BATCH
  |--------------------------------------------------------------------------
  */

  const selectedBatchData = useMemo(() => {
    return (
      asArray(data.batches).find(
        (item) =>
          getId(item.id) ===
          getId(selectedBatch)
      ) || null
    );
  }, [
    data.batches,
    selectedBatch,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT BATCH STUDENTS
  |--------------------------------------------------------------------------
  */

  const batchStudents = useMemo(() => {
    return asArray(
      data.batch_students
    ).filter(
      (item) =>
        getId(item.batch_id) ===
        getId(selectedBatch)
    );
  }, [
    data.batch_students,
    selectedBatch,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT BATCH STUDENT IDS
  |--------------------------------------------------------------------------
  */

  const batchStudentIds = useMemo(() => {
    return new Set(
      batchStudents
        .map((item) =>
          getId(item.student_id)
        )
        .filter(Boolean)
    );
  }, [batchStudents]);

  /*
  |--------------------------------------------------------------------------
  | STUDENTS AVAILABLE TO ADD
  |--------------------------------------------------------------------------
  */

  const availableStudents =
    useMemo(() => {
      return asArray(
        data.students
      ).filter((student) => {
        const studentDbId =
          getId(student.id);

        return (
          studentDbId &&
          !batchStudentIds.has(
            studentDbId
          )
        );
      });
    }, [
      data.students,
      batchStudentIds,
    ]);

  /*
  |--------------------------------------------------------------------------
  | POST API
  |--------------------------------------------------------------------------
  */

  const post = async (payload) => {
    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher_classroom.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result =
        await parseJsonResponse(
          response,
          "Request failed."
        );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Request failed."
        );
      }

      setMessage(
        result.message ||
          "Saved successfully."
      );

      return result;
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE BATCH
  |--------------------------------------------------------------------------
  */

  const createBatch = async (event) => {
    event.preventDefault();

    if (!batch.name.trim()) {
      setMessage(
        "Batch name is required."
      );

      return;
    }

    try {
      const result = await post({
        action: "create_batch",

        name: batch.name.trim(),

        course:
          batch.course.trim(),

        language_level:
          batch.language_level.trim(),

        schedule_days:
          batch.schedule_days.trim(),

        start_time:
          batch.start_time,

        end_time:
          batch.end_time,

        room:
          batch.room.trim(),
      });

      const newBatchId =
        result?.batch_id ??
        result?.batchId ??
        "";

      setBatch({
        ...emptyBatch,
      });

      await load(newBatchId);

      if (newBatchId) {
        setSelectedBatch(
          String(newBatchId)
        );
      }

      setActiveSection(
        "batches"
      );
    } catch (error) {
      console.error(
        "Create batch error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not create batch."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD STUDENT
  |--------------------------------------------------------------------------
  */

  const addStudent = async (
    studentId
  ) => {
    if (!selectedBatch) {
      setMessage(
        "আগে একটি batch নির্বাচন করুন।"
      );

      return;
    }

    const id = Number(studentId);

    if (!Number.isInteger(id) || id <= 0) {
      setMessage(
        "Invalid student ID."
      );

      return;
    }

    try {
      await post({
        action: "add_student",

        batch_id:
          Number(selectedBatch),

        student_id: id,
      });

      await load(selectedBatch);
    } catch (error) {
      console.error(
        "Add student error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not add student."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE BATCH
  |--------------------------------------------------------------------------
  */

  const updateBatch = async (event) => {
    event.preventDefault();

    if (!selectedBatch) {
      setMessage(
        "Batch নির্বাচন করুন।"
      );

      return;
    }

    if (
      !editBatch ||
      !editBatch.name?.trim()
    ) {
      setMessage(
        "Batch name is required."
      );

      return;
    }

    try {
      await post({
        action: "update_batch",

        batch_id:
          Number(selectedBatch),

        name:
          editBatch.name.trim(),

        course:
          String(
            editBatch.course || ""
          ).trim(),

        language_level:
          String(
            editBatch.language_level ||
              ""
          ).trim(),

        schedule_days:
          String(
            editBatch.schedule_days ||
              ""
          ).trim(),

        start_time:
          editBatch.start_time || "",

        end_time:
          editBatch.end_time || "",

        room:
          String(
            editBatch.room || ""
          ).trim(),
      });

      setEditBatch(null);

      await load(selectedBatch);
    } catch (error) {
      console.error(
        "Update batch error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not update batch."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE STUDENT
  |--------------------------------------------------------------------------
  */

  const removeStudent = async (
    student
  ) => {
    if (!selectedBatch) {
      return;
    }

    const studentId =
      Number(student?.id);

    if (
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      setMessage(
        "Invalid student ID."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `${studentName(
          student
        )} কে এই batch থেকে বাদ দিতে চান?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await post({
        action: "remove_student",

        batch_id:
          Number(selectedBatch),

        student_id: studentId,
      });

      await load(selectedBatch);
    } catch (error) {
      console.error(
        "Remove student error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not remove student."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN TRANSFER MODAL
  |--------------------------------------------------------------------------
  */

  const openTransfer = (
    student
  ) => {
    setTransferStudent(student);

    setTransferTeacherId("");

    setTransferNote("");
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE TRANSFER MODAL
  |--------------------------------------------------------------------------
  */

  const closeTransfer = () => {
    if (saving) {
      return;
    }

    setTransferStudent(null);

    setTransferTeacherId("");

    setTransferNote("");
  };

  /*
  |--------------------------------------------------------------------------
  | REQUEST TRANSFER
  |--------------------------------------------------------------------------
  */

  const requestTransfer = async (
    event
  ) => {
    event.preventDefault();

    if (!transferStudent) {
      return;
    }

    const studentId =
      Number(transferStudent.id);

    if (
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      setMessage(
        "Invalid student ID."
      );

      return;
    }

    if (!transferTeacherId) {
      setMessage(
        "নতুন teacher নির্বাচন করুন।"
      );

      return;
    }

    try {
      await post({
        action:
          "request_transfer",

        student_id:
          studentId,

        to_teacher_id:
          transferTeacherId,

        request_note:
          transferNote.trim(),
      });

      setTransferStudent(null);

      setTransferTeacherId("");

      setTransferNote("");

      await load();
    } catch (error) {
      console.error(
        "Transfer request error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not send transfer request."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE CLASS + ATTENDANCE
  |--------------------------------------------------------------------------
  */

  const saveClass = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedBatch) {
      setMessage(
        "আগে একটি batch নির্বাচন করুন।"
      );

      return;
    }

    if (!session.class_date) {
      setMessage(
        "Class date is required."
      );

      return;
    }

    if (!session.topic.trim()) {
      setMessage(
        "Class topic is required."
      );

      return;
    }

    if (!batchStudents.length) {
      setMessage(
        "আগে এই batch-এ শিক্ষার্থী যোগ করুন।"
      );

      return;
    }

    /*
    | Get checked attendance IDs.
    |
    | Backend expects students.id
    */
    const attendance =
      Array.from(
        new FormData(
          event.currentTarget
        ).getAll("attendance")
      )
        .map((value) =>
          String(value)
        )
        .filter(Boolean);

    try {
      await post({
        action: "save_class",

        batch_id:
          Number(selectedBatch),

        class_date:
          session.class_date,

        topic:
          session.topic.trim(),

        notes:
          session.notes.trim(),

        attendance,
      });

      setSession({
        class_date:
          session.class_date,

        topic: "",

        notes: "",
      });

      await load(selectedBatch);

      setActiveSection(
        "records"
      );
    } catch (error) {
      console.error(
        "Save class error:",
        error
      );

      setMessage(
        error?.message ||
          "Could not save class."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="classroom-page">

      {/* ---------------------------------------------------------------
          HEADER
      --------------------------------------------------------------- */}

      <header className="classroom-header">
        <div>
          <h1>My Batch</h1>

          <p>
            শিক্ষার্থী, ব্যাচ, attendance ও
            class record একসাথে পরিচালনা করুন।
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            load(selectedBatch)
          }
          disabled={loading || saving}
        >
          রিফ্রেশ
        </button>
      </header>

      {/* ---------------------------------------------------------------
          MESSAGE
      --------------------------------------------------------------- */}

      {message && (
        <div
          className="classroom-message"
          role="status"
        >
          {message}
        </div>
      )}

      {/* ---------------------------------------------------------------
          LOADING
      --------------------------------------------------------------- */}

      {loading ? (
        <div className="classroom-card">
          তথ্য লোড হচ্ছে...
        </div>
      ) : (
        <>
          {/* -----------------------------------------------------------
              SUMMARY
          ----------------------------------------------------------- */}

          <section className="classroom-summary">

            <div>
              <span>
                Assigned Students
              </span>

              <strong>
                {data.students.length}
              </strong>
            </div>

            <div>
              <span>
                My Batches
              </span>

              <strong>
                {data.batches.length}
              </strong>
            </div>

            <div>
              <span>
                Classes Recorded
              </span>

              <strong>
                {data.sessions.length}
              </strong>
            </div>

          </section>

          {/* -----------------------------------------------------------
              SUB MENU
          ----------------------------------------------------------- */}

          <div
            className="classroom-submenu"
            aria-label="My Batch submenu"
          >
            {sectionTabs.map(
              (tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={
                    activeSection ===
                    tab.key
                      ? "submenu-button active"
                      : "submenu-button"
                  }
                  onClick={() =>
                    setActiveSection(
                      tab.key
                    )
                  }
                >
                  {tab.label}
                </button>
              )
            )}
          </div>

          {/* ===========================================================
              STUDENTS
          =========================================================== */}

          {activeSection ===
            "students" && (
            <>
              <section className="classroom-card">

                <div className="card-heading">
                  <div>
                    <h2>
                      Assigned Students
                    </h2>

                    <p>
                      আপনার কাছে assigned
                      থাকা শিক্ষার্থীর তালিকা।
                    </p>
                  </div>
                </div>

                {data.students.length ? (
                  <div className="table-wrap">
                    <table className="classroom-table">

                      <thead>
                        <tr>
                          <th>#</th>
                          <th>নাম</th>
                          <th>Student ID</th>
                          <th>
                            Course / Level
                          </th>
                          <th>Mobile</th>
                          <th>Request</th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.students.map(
                          (
                            student,
                            index
                          ) => (
                            <tr
                              key={getId(
                                student.id
                              )}
                            >
                              <td>
                                {index + 1}
                              </td>

                              <td>
                                {studentName(
                                  student
                                )}
                              </td>

                              <td>
                                {student.student_id ||
                                  "—"}
                              </td>

                              <td>
                                {student.course ||
                                  "—"}

                                {student.language_level
                                  ? ` / ${student.language_level}`
                                  : ""}
                              </td>

                              <td>
                                {student.student_mobile ||
                                  "—"}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="icon-button"
                                  title="অন্য teacher-এর কাছে transfer request পাঠান"
                                  onClick={() =>
                                    openTransfer(
                                      student
                                    )
                                  }
                                >
                                  ↗
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>
                  </div>
                ) : (
                  <p className="empty-state">
                    এখনও কোনো শিক্ষার্থী
                    assign করা হয়নি।
                  </p>
                )}
              </section>

              {/* -------------------------------------------------------
                  TRANSFER HISTORY
              ------------------------------------------------------- */}

              {data.transfer_requests
                .length > 0 && (
                <section className="classroom-card transfer-history">

                  <h2>
                    আমার Transfer Requests
                  </h2>

                  <div className="table-wrap">
                    <table className="classroom-table">

                      <thead>
                        <tr>
                          <th>
                            শিক্ষার্থী
                          </th>

                          <th>
                            নতুন Teacher
                          </th>

                          <th>
                            তারিখ
                          </th>

                          <th>
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.transfer_requests.map(
                          (request) => (
                            <tr
                              key={getId(
                                request.id
                              )}
                            >
                              <td>
                                {studentName(
                                  request
                                )}

                                {" ("}

                                {request.student_code ||
                                  "—"}

                                {")"}
                              </td>

                              <td>
                                {request.to_teacher_name_en ||
                                  request.to_teacher_name_bn ||
                                  request.to_teacher_id ||
                                  "—"}
                              </td>

                              <td>
                                {String(
                                  request.created_at ||
                                    ""
                                ).slice(
                                  0,
                                  10
                                )}
                              </td>

                              <td>
                                <span
                                  className={`attendance-status ${
                                    String(
                                      request.status
                                    ).toLowerCase() ===
                                    "approved"
                                      ? "present"
                                      : "absent"
                                  }`}
                                >
                                  {request.status ||
                                    "pending"}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ===========================================================
              BATCHES
          =========================================================== */}

          {activeSection ===
            "batches" && (
            <div className="classroom-columns">

              {/* -------------------------------------------------------
                  CREATE BATCH
              ------------------------------------------------------- */}

              <section className="classroom-card">

                <div className="card-heading">
                  <div>
                    <h2>
                      নতুন Batch তৈরি করুন
                    </h2>

                    <p>
                      রুটিন দিয়ে batch তৈরি
                      করুন।
                    </p>
                  </div>
                </div>

                <form
                  className="classroom-form"
                  onSubmit={createBatch}
                >

                  <input
                    required
                    placeholder="Batch name (যেমন: IELTS Evening A)"
                    value={batch.name}
                    onChange={(event) =>
                      setBatch({
                        ...batch,
                        name:
                          event.target.value,
                      })
                    }
                  />

                  <div className="form-row">

                    <input
                      placeholder="Course"
                      value={batch.course}
                      onChange={(event) =>
                        setBatch({
                          ...batch,
                          course:
                            event.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Level"
                      value={
                        batch.language_level
                      }
                      onChange={(event) =>
                        setBatch({
                          ...batch,
                          language_level:
                            event.target.value,
                        })
                      }
                    />

                  </div>

                  <input
                    placeholder="Class days (যেমন: Sun, Tue, Thu)"
                    value={
                      batch.schedule_days
                    }
                    onChange={(event) =>
                      setBatch({
                        ...batch,
                        schedule_days:
                          event.target.value,
                      })
                    }
                  />

                  <div className="form-row">

                    <input
                      aria-label="Start time"
                      type="time"
                      value={
                        batch.start_time
                      }
                      onChange={(event) =>
                        setBatch({
                          ...batch,
                          start_time:
                            event.target.value,
                        })
                      }
                    />

                    <input
                      aria-label="End time"
                      type="time"
                      value={
                        batch.end_time
                      }
                      onChange={(event) =>
                        setBatch({
                          ...batch,
                          end_time:
                            event.target.value,
                        })
                      }
                    />

                  </div>

                  <input
                    placeholder="Room / online link"
                    value={batch.room}
                    onChange={(event) =>
                      setBatch({
                        ...batch,
                        room:
                          event.target.value,
                      })
                    }
                  />

                  <button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "সংরক্ষণ হচ্ছে..."
                      : "Batch তৈরি করুন"}
                  </button>

                </form>
              </section>

              {/* -------------------------------------------------------
                  BATCH LIST
              ------------------------------------------------------- */}

              <section className="classroom-card">

                <div className="card-heading">
                  <div>
                    <h2>
                      আমার Batches
                    </h2>

                    <p>
                      একটি batch নির্বাচন
                      করুন।
                    </p>
                  </div>
                </div>

                <div className="batch-list">

                  {data.batches.map(
                    (item) => (
                      <button
                        className={`batch-item ${
                          getId(
                            selectedBatch
                          ) ===
                          getId(item.id)
                            ? "selected"
                            : ""
                        }`}
                        key={getId(
                          item.id
                        )}
                        type="button"
                        onClick={() =>
                          setSelectedBatch(
                            getId(item.id)
                          )
                        }
                      >

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.schedule_days ||
                            "রুটিন দেওয়া হয়নি"}

                          {" · "}

                          {item.start_time ||
                            "সময় নেই"}

                          {item.end_time
                            ? `–${item.end_time}`
                            : ""}

                          {item.room
                            ? ` · ${item.room}`
                            : ""}
                        </span>

                        <small>
                          {item.student_count ||
                            0}{" "}
                          জন শিক্ষার্থী
                        </small>

                      </button>
                    )
                  )}

                </div>

                {!data.batches.length && (
                  <p className="empty-state">
                    শুরু করতে একটি batch
                    তৈরি করুন।
                  </p>
                )}

              </section>
            </div>
          )}

          {/* ===========================================================
              ATTENDANCE / BATCH MANAGEMENT
          =========================================================== */}

          {activeSection ===
            "attendance" && (
            <section className="selected-batch-section">

              {!selectedBatchData ? (
                <section className="classroom-card">
                  <p className="empty-state">
                    আগে একটি batch তৈরি বা
                    নির্বাচন করুন।
                  </p>
                </section>
              ) : (
                <>
                  {/* ---------------------------------------------------
                      SELECTED BATCH HEADER
                  --------------------------------------------------- */}

                  <div className="selected-batch-title">

                    <div>
                      <span>
                        Selected batch
                      </span>

                      <h2>
                        {
                          selectedBatchData.name
                        }
                      </h2>

                      <p>
                        {selectedBatchData.schedule_days ||
                          "রুটিন নেই"}

                        {" · "}

                        {selectedBatchData.start_time ||
                          "সময় নেই"}

                        {selectedBatchData.end_time
                          ? `–${selectedBatchData.end_time}`
                          : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        setEditBatch({
                          ...selectedBatchData,
                        })
                      }
                    >
                      ✎ Batch Edit
                    </button>

                  </div>

                  {/* ---------------------------------------------------
                      EDIT BATCH
                  --------------------------------------------------- */}

                  {editBatch && (
                    <form
                      className="classroom-form batch-edit-form"
                      onSubmit={
                        updateBatch
                      }
                    >

                      <div className="form-row">

                        <input
                          required
                          placeholder="Batch name"
                          value={
                            editBatch.name ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              name:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <input
                          placeholder="Course"
                          value={
                            editBatch.course ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              course:
                                event.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-row">

                        <input
                          placeholder="Level"
                          value={
                            editBatch.language_level ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              language_level:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <input
                          placeholder="Class days"
                          value={
                            editBatch.schedule_days ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              schedule_days:
                                event.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <div className="form-row">

                        <input
                          type="time"
                          value={
                            editBatch.start_time ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              start_time:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <input
                          type="time"
                          value={
                            editBatch.end_time ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setEditBatch({
                              ...editBatch,
                              end_time:
                                event.target
                                  .value,
                            })
                          }
                        />

                      </div>

                      <input
                        placeholder="Room / online link"
                        value={
                          editBatch.room ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          setEditBatch({
                            ...editBatch,
                            room:
                              event.target
                                .value,
                          })
                        }
                      />

                      <div className="form-row">

                        <button
                          type="submit"
                          disabled={saving}
                        >
                          {saving
                            ? "Saving..."
                            : "পরিবর্তন Save করুন"}
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            setEditBatch(
                              null
                            )
                          }
                          disabled={saving}
                        >
                          বাতিল
                        </button>

                      </div>

                    </form>
                  )}

                  <div className="classroom-columns">

                    {/* -------------------------------------------------
                        ADD / REMOVE STUDENTS
                    ------------------------------------------------- */}

                    <section className="classroom-card">

                      <h2>
                        Batch-এ শিক্ষার্থী যোগ করুন
                      </h2>

                      <p className="section-help">
                        নিচের তালিকা থেকে একজন
                        শিক্ষার্থী যোগ করুন।
                      </p>

                      {availableStudents.length ? (
                        <div className="table-wrap">

                          <table className="classroom-table">

                            <thead>
                              <tr>
                                <th>নাম</th>
                                <th>
                                  Student ID
                                </th>
                                <th>
                                  Mobile
                                </th>
                                <th></th>
                              </tr>
                            </thead>

                            <tbody>
                              {availableStudents.map(
                                (
                                  student
                                ) => (
                                  <tr
                                    key={getId(
                                      student.id
                                    )}
                                  >
                                    <td>
                                      {studentName(
                                        student
                                      )}
                                    </td>

                                    <td>
                                      {student.student_id ||
                                        "—"}
                                    </td>

                                    <td>
                                      {student.student_mobile ||
                                        "—"}
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        className="small-button"
                                        onClick={() =>
                                          addStudent(
                                            student.id
                                          )
                                        }
                                        disabled={
                                          saving
                                        }
                                      >
                                        যোগ করুন
                                      </button>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>

                          </table>
                        </div>
                      ) : (
                        <p className="empty-state">
                          যোগ করার মতো assigned
                          student নেই।
                        </p>
                      )}

                      <h3 className="subheading">
                        এই Batch-এর শিক্ষার্থী (
                        {batchStudents.length}
                        )
                      </h3>

                      {batchStudents.length ? (
                        <div className="table-wrap">

                          <table className="classroom-table">

                            <thead>
                              <tr>
                                <th>নাম</th>
                                <th>
                                  Student ID
                                </th>
                                <th>
                                  Mobile
                                </th>
                                <th></th>
                              </tr>
                            </thead>

                            <tbody>
                              {batchStudents.map(
                                (
                                  student
                                ) => (
                                  <tr
                                    key={getId(
                                      student.batch_student_id
                                    )}
                                  >
                                    <td>
                                      {studentName(
                                        student
                                      )}
                                    </td>

                                    <td>
                                      {student.student_code ||
                                        student.student_id ||
                                        "—"}
                                    </td>

                                    <td>
                                      {student.student_mobile ||
                                        "—"}
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        className="small-button danger-button"
                                        onClick={() =>
                                          removeStudent(
                                            student
                                          )
                                        }
                                        disabled={
                                          saving
                                        }
                                      >
                                        বাদ দিন
                                      </button>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>

                          </table>
                        </div>
                      ) : (
                        <p className="empty-state">
                          এখনও কাউকে এই batch-এ
                          যোগ করা হয়নি।
                        </p>
                      )}

                    </section>

                    {/* -------------------------------------------------
                        SAVE CLASS
                    ------------------------------------------------- */}

                    <section className="classroom-card">

                      <h2>
                        আজকের Class সংরক্ষণ করুন
                      </h2>

                      <p className="section-help">
                        উপস্থিত শিক্ষার্থীদের
                        checkbox-এ tick দিন। Tick
                        না করা শিক্ষার্থী absent
                        হিসেবে সংরক্ষিত হবে।
                      </p>

                      <form
                        className="classroom-form"
                        onSubmit={
                          saveClass
                        }
                      >

                        <input
                          required
                          type="date"
                          value={
                            session.class_date
                          }
                          onChange={(
                            event
                          ) =>
                            setSession({
                              ...session,
                              class_date:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <input
                          required
                          placeholder="আজকের topic / lesson"
                          value={
                            session.topic
                          }
                          onChange={(
                            event
                          ) =>
                            setSession({
                              ...session,
                              topic:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <div className="attendance-list">

                          {batchStudents.map(
                            (
                              student
                            ) => {
                              const studentId =
                                getId(
                                  student.student_id
                                );

                              return (
                                <label
                                  key={
                                    getId(
                                      student.student_id
                                    )
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    name="attendance"
                                    value={
                                      studentId
                                    }
                                    defaultChecked
                                  />

                                  <span>
                                    {studentName(
                                      student
                                    )}

                                    <small>
                                      {student.student_code ||
                                        student.student_id}

                                      {" · "}

                                      {student.student_mobile ||
                                        "Mobile নেই"}
                                    </small>
                                  </span>
                                </label>
                              );
                            }
                          )}

                          {!batchStudents.length && (
                            <p className="empty-state">
                              আগে এই batch-এ
                              শিক্ষার্থী যোগ করুন।
                            </p>
                          )}

                        </div>

                        <textarea
                          placeholder="হোমওয়ার্ক বা অতিরিক্ত নোট (ঐচ্ছিক)"
                          value={
                            session.notes
                          }
                          onChange={(
                            event
                          ) =>
                            setSession({
                              ...session,
                              notes:
                                event.target
                                  .value,
                            })
                          }
                        />

                        <button
                          type="submit"
                          disabled={
                            saving ||
                            !batchStudents.length
                          }
                        >
                          {saving
                            ? "সংরক্ষণ হচ্ছে..."
                            : "Class ও Attendance সংরক্ষণ করুন"}
                        </button>

                      </form>

                    </section>
                  </div>
                </>
              )}
            </section>
          )}

          {/* ===========================================================
              CLASS RECORDS
          =========================================================== */}

          {activeSection ===
            "records" && (
            <section className="classroom-card">

              <div className="card-heading">

                <div>
                  <h2>
                    সর্বশেষ সংরক্ষিত ক্লাসগুলো
                  </h2>

                  <p>
                    প্রতিটি record খুলে class
                    details ও attendance দেখুন।
                  </p>
                </div>

              </div>

              <div className="session-list">

                {data.sessions.map(
                  (item) => {
                    const isOpen =
                      String(
                        openSessionId
                      ) ===
                      String(item.id);

                    const attendance =
                      data.attendance.filter(
                        (row) =>
                          String(
                            row.class_session_id
                          ) ===
                          String(item.id)
                      );

                    const presentCount =
                      attendance.filter(
                        (row) =>
                          String(
                            row.attendance_status
                          ).toLowerCase() ===
                          "present"
                      ).length;

                    return (
                      <div
                        className="session-item"
                        key={getId(
                          item.id
                        )}
                      >

                        <button
                          type="button"
                          className="session-toggle"
                          onClick={() =>
                            setOpenSessionId(
                              isOpen
                                ? ""
                                : String(
                                    item.id
                                  )
                            )
                          }
                        >

                          <span>
                            <strong>
                              {item.class_date}
                              {" · "}
                              {item.batch_name}
                            </strong>

                            <small>
                              {item.topic}
                            </small>
                          </span>

                          <span>
                            {attendance.length
                              ? `${presentCount}/${attendance.length} উপস্থিত`
                              : "Details খুলুন"}

                            {" "}

                            {isOpen
                              ? "▲"
                              : "▼"}
                          </span>

                        </button>

                        {isOpen && (
                          <div className="session-details">

                            <p>
                              <strong>
                                Topic:
                              </strong>{" "}
                              {item.topic}
                            </p>

                            {item.notes && (
                              <p>
                                <strong>
                                  Notes:
                                </strong>{" "}
                                {item.notes}
                              </p>
                            )}

                            {attendance.length ? (
                              <div className="table-wrap">

                                <table className="classroom-table">

                                  <thead>
                                    <tr>
                                      <th>
                                        শিক্ষার্থী
                                      </th>

                                      <th>
                                        Student ID
                                      </th>

                                      <th>
                                        Attendance
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {attendance.map(
                                      (
                                        row
                                      ) => (
                                        <tr
                                          key={`${getId(
                                            row.class_session_id
                                          )}-${getId(
                                            row.student_id
                                          )}`}
                                        >

                                          <td>
                                            {studentName(
                                              row
                                            )}
                                          </td>

                                          <td>
                                            {row.student_code ||
                                              "—"}
                                          </td>

                                          <td>
                                            <span
                                              className={`attendance-status ${
                                                String(
                                                  row.attendance_status
                                                ).toLowerCase() ===
                                                "present"
                                                  ? "present"
                                                  : "absent"
                                              }`}
                                            >
                                              {String(
                                                row.attendance_status
                                              ).toLowerCase() ===
                                              "present"
                                                ? "উপস্থিত"
                                                : "অনুপস্থিত"}
                                            </span>
                                          </td>

                                        </tr>
                                      )
                                    )}
                                  </tbody>

                                </table>
                              </div>
                            ) : (
                              <p className="empty-state">
                                এই পুরোনো class
                                record-এ attendance
                                সংরক্ষিত হয়নি।
                              </p>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

                {!data.sessions.length && (
                  <p className="empty-state">
                    এখনও কোনো class record নেই।
                  </p>
                )}

              </div>
            </section>
          )}

          {/* ===========================================================
              TRANSFER MODAL
          =========================================================== */}

          {transferStudent && (
            <div
              className="classroom-modal-overlay"
              onMouseDown={() =>
                closeTransfer()
              }
            >

              <div
                className="classroom-modal"
                role="dialog"
                aria-modal="true"
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              >

                <h2>
                  Transfer Request
                </h2>

                <p>
                  <strong>
                    {studentName(
                      transferStudent
                    )}
                  </strong>

                  {" ("}

                  {transferStudent.student_id ||
                    "—"}

                  {")-কে অন্য teacher-এর কাছে "}
                  transfer করার request করুন।
                </p>

                <form
                  className="classroom-form"
                  onSubmit={
                    requestTransfer
                  }
                >

                  <select
                    required
                    value={
                      transferTeacherId
                    }
                    onChange={(
                      event
                    ) =>
                      setTransferTeacherId(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      নতুন teacher নির্বাচন করুন
                    </option>

                    {data.teachers.map(
                      (teacher) => (
                        <option
                          key={getId(
                            teacher.teacher_id
                          )}
                          value={getId(
                            teacher.teacher_id
                          )}
                        >
                          {teacher.name_en ||
                            teacher.name_bn ||
                            "Unnamed teacher"}

                          {" ("}

                          {teacher.teacher_id}

                          {")"}
                        </option>
                      )
                    )}
                  </select>

                  <textarea
                    placeholder="কারণ / নোট (ঐচ্ছিক)"
                    value={
                      transferNote
                    }
                    onChange={(
                      event
                    ) =>
                      setTransferNote(
                        event.target
                          .value
                      )
                    }
                  />

                  <div className="form-row">

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !transferTeacherId
                      }
                    >
                      {saving
                        ? "পাঠানো হচ্ছে..."
                        : "Request পাঠান"}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        closeTransfer
                      }
                      disabled={saving}
                    >
                      বাতিল
                    </button>

                  </div>

                </form>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}