import { Fragment, useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./BatchMonitoring.css";

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

const teacherLabel = (teacher = {}) => {
  return (
    teacher.name_en ||
    teacher.name_bn ||
    teacher.teacher_id ||
    "Unnamed teacher"
  );
};

const studentLabel = (student = {}) => {
  return (
    student.student_name_en ||
    student.student_name_bn ||
    student.student_code ||
    "Unnamed student"
  );
};

const parseJsonResponse = async (
  response,
  fallbackMessage = "Server request failed."
) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", text);
    throw new Error(fallbackMessage);
  }
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function BatchMonitoring() {
  const [data, setData] = useState({
    teachers: [],
    batches: [],
    batch_students: [],
    sessions: [],
    attendance: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    teacher: "",
    batch: "",
    course: "",
    status: "",
  });

  const [expandedBatchId, setExpandedBatchId] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  const load = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/admin_batch_monitoring.php`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      const result = await parseJsonResponse(
        response,
        "Could not load batch monitoring data."
      );

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Could not load batch monitoring data."
        );
      }

      setData({
        teachers: asArray(result.teachers),
        batches: asArray(result.batches),
        batch_students: asArray(result.batch_students),
        sessions: asArray(result.sessions),
        attendance: asArray(result.attendance),
      });
    } catch (error) {
      console.error("Batch monitoring load error:", error);
      setMessage(error?.message || "Could not load batch monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  const courseOptions = useMemo(() => {
    const set = new Set(
      data.batches.map((batch) => String(batch.course || "").trim()).filter(Boolean)
    );

    return Array.from(set).sort();
  }, [data.batches]);

  const statusOptions = useMemo(() => {
    const set = new Set(
      data.batches.map((batch) => String(batch.status || "").trim()).filter(Boolean)
    );

    return Array.from(set).sort();
  }, [data.batches]);

  /*
  |--------------------------------------------------------------------------
  | FILTERED BATCHES
  |--------------------------------------------------------------------------
  */

  const filteredBatches = useMemo(() => {
    const teacherFilter = filters.teacher.trim();
    const batchFilter = filters.batch.trim().toLowerCase();
    const courseFilter = filters.course.trim().toLowerCase();
    const statusFilter = filters.status.trim().toLowerCase();

    return data.batches.filter((batch) => {
      if (teacherFilter && getId(batch.teacher_id) !== teacherFilter) {
        return false;
      }

      if (
        batchFilter &&
        !String(batch.name || "").toLowerCase().includes(batchFilter)
      ) {
        return false;
      }

      if (
        courseFilter &&
        String(batch.course || "").toLowerCase() !== courseFilter
      ) {
        return false;
      }

      if (
        statusFilter &&
        String(batch.status || "").toLowerCase() !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [data.batches, filters]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const totalStudentsInBatches = useMemo(() => {
    return data.batch_students.length;
  }, [data.batch_students]);

  const activeBatchCount = useMemo(() => {
    return data.batches.filter(
      (batch) => String(batch.status || "").toLowerCase() !== "inactive"
    ).length;
  }, [data.batches]);

  /*
  |--------------------------------------------------------------------------
  | BATCH DETAIL (students / sessions / attendance)
  |--------------------------------------------------------------------------
  */

  const getBatchStudents = (batchId) => {
    return data.batch_students.filter(
      (item) => getId(item.batch_id) === getId(batchId)
    );
  };

  const getBatchSessions = (batchId) => {
    return data.sessions.filter(
      (item) => getId(item.batch_id) === getId(batchId)
    );
  };

  const getBatchAttendanceSummary = (batchId) => {
    const rows = data.attendance.filter(
      (item) => getId(item.batch_id) === getId(batchId)
    );

    const present = rows.filter(
      (item) =>
        String(item.attendance_status || "").toLowerCase() === "present"
    ).length;

    return {
      total: rows.length,
      present,
      absent: rows.length - present,
    };
  };

  const toggleBatchDetail = (batchId) => {
    setExpandedBatchId((current) =>
      getId(current) === getId(batchId) ? "" : getId(batchId)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="batch-monitoring-page">
      <header className="batch-monitoring-header">
        <div>
          <h1>Batch Monitoring</h1>
          <p>সকল teacher-এর batch, student ও attendance একসাথে monitor করুন।</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {message && (
        <div className="batch-monitoring-message" role="status">
          {message}
        </div>
      )}

      <section className="batch-monitoring-summary">
        <div>
          <span>Teachers</span>
          <strong>{data.teachers.length}</strong>
        </div>

        <div>
          <span>Total Batches</span>
          <strong>{data.batches.length}</strong>
        </div>

        <div>
          <span>Active Batches</span>
          <strong>{activeBatchCount}</strong>
        </div>

        <div>
          <span>Students in Batches</span>
          <strong>{totalStudentsInBatches}</strong>
        </div>
      </section>

      <section className="batch-monitoring-filters">
        <select
          value={filters.teacher}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, teacher: event.target.value }))
          }
          aria-label="Filter by teacher"
        >
          <option value="">All Teachers</option>
          {data.teachers.map((teacher) => (
            <option
              key={getId(teacher.teacher_id)}
              value={getId(teacher.teacher_id)}
            >
              {teacherLabel(teacher)}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search batch name..."
          value={filters.batch}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, batch: event.target.value }))
          }
        />

        <select
          value={filters.course}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, course: event.target.value }))
          }
          aria-label="Filter by course"
        >
          <option value="">All Courses</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value }))
          }
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setFilters({ teacher: "", batch: "", course: "", status: "" })
          }
        >
          Clear Filters
        </button>
      </section>

      {loading ? (
        <div className="batch-monitoring-card">তথ্য লোড হচ্ছে...</div>
      ) : (
        <section className="batch-monitoring-card">
          {filteredBatches.length ? (
            <div className="table-wrap">
              <table className="batch-monitoring-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Batch</th>
                    <th>Course / Level</th>
                    <th>Schedule</th>
                    <th>Students</th>
                    <th>Last Class</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBatches.map((batch) => {
                    const isExpanded =
                      getId(expandedBatchId) === getId(batch.id);

                    const batchStudents = getBatchStudents(batch.id);
                    const batchSessions = getBatchSessions(batch.id);
                    const attendanceSummary = getBatchAttendanceSummary(
                      batch.id
                    );

                    return (
                      <Fragment key={getId(batch.id)}>
                        <tr>
                          <td>
                            {batch.teacher_name_en ||
                              batch.teacher_name_bn ||
                              batch.teacher_id ||
                              "—"}
                          </td>

                          <td>{batch.name || "—"}</td>

                          <td>
                            {batch.course || "—"}
                            {batch.language_level
                              ? ` / ${batch.language_level}`
                              : ""}
                          </td>

                          <td>
                            {batch.schedule_days || "—"}
                            {batch.start_time
                              ? ` · ${batch.start_time}`
                              : ""}
                            {batch.end_time ? `–${batch.end_time}` : ""}
                          </td>

                          <td>{Number(batch.student_count) || 0}</td>

                          <td>{batch.last_class_date || "—"}</td>

                          <td>
                            <span
                              className={`batch-status ${
                                String(batch.status || "").toLowerCase() ===
                                "inactive"
                                  ? "inactive"
                                  : "active"
                              }`}
                            >
                              {batch.status || "Active"}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="small-button"
                              onClick={() => toggleBatchDetail(batch.id)}
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="batch-detail-row">
                            <td colSpan={8}>
                              <div className="batch-detail-columns">
                                <div>
                                  <h3>
                                    Students ({batchStudents.length})
                                  </h3>

                                  {batchStudents.length ? (
                                    <ul className="batch-detail-list">
                                      {batchStudents.map((student) => (
                                        <li key={getId(student.id)}>
                                          <span>{studentLabel(student)}</span>
                                          <small>
                                            {student.student_code || "—"}
                                          </small>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="empty-state">
                                      No students in this batch yet.
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <h3>Attendance</h3>

                                  <p className="attendance-summary">
                                    Present:{" "}
                                    <strong>
                                      {attendanceSummary.present}
                                    </strong>{" "}
                                    · Absent:{" "}
                                    <strong>{attendanceSummary.absent}</strong>{" "}
                                    · Total: {attendanceSummary.total}
                                  </p>

                                  <h3>Class Records</h3>

                                  {batchSessions.length ? (
                                    <ul className="batch-detail-list">
                                      {batchSessions.map((session) => (
                                        <li key={getId(session.id)}>
                                          <span>
                                            {session.class_date || "—"} —{" "}
                                            {session.topic || "No topic"}
                                          </span>

                                          {session.notes && (
                                            <small>{session.notes}</small>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="empty-state">
                                      No class records yet.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">
              কোনো batch পাওয়া যায়নি। Filter পরিবর্তন করে দেখুন।
            </p>
          )}
        </section>
      )}
    </div>
  );
}
