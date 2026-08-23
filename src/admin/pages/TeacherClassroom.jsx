import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./TeacherClassroom.css";

const emptyBatch = { name: "", course: "", language_level: "", schedule_days: "", start_time: "", end_time: "", room: "" };

export default function TeacherClassroom() {
  const [data, setData] = useState({ students: [], batches: [], sessions: [] });
  const [batch, setBatch] = useState(emptyBatch);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState({ class_date: new Date().toISOString().slice(0, 10), topic: "", notes: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL + "/teacher_classroom.php", { credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load classroom.");
      setData(result);
    } catch (error) {
      setMessage(error.message || "Could not load classroom.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const post = async (payload) => {
    const response = await fetch(API_BASE_URL + "/teacher_classroom.php", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
    setMessage(result.message);
    await load();
  };

  const createBatch = async (event) => {
    event.preventDefault();
    try { await post({ action: "create_batch", ...batch }); setBatch(emptyBatch); }
    catch (error) { setMessage(error.message); }
  };

  const addStudent = async (event) => {
    event.preventDefault();
    try { await post({ action: "add_student", batch_id: selectedBatch, student_id: studentId }); setStudentId(""); }
    catch (error) { setMessage(error.message); }
  };

  const saveClass = async (event) => {
    event.preventDefault();
    try { await post({ action: "save_class", batch_id: selectedBatch, ...session }); setSession({ ...session, topic: "", notes: "" }); }
    catch (error) { setMessage(error.message); }
  };

  return (
    <div className="classroom-page">
      <header className="classroom-header">
        <div><h1>My Classroom</h1><p>Assigned students, batches and class schedule</p></div>
        <button type="button" onClick={load}>Refresh</button>
      </header>
      {message && <div className="classroom-message">{message}</div>}
      {loading ? <p>Loading classroom...</p> : <>
        <section className="classroom-card">
          <h2>Assigned Students ({data.students.length})</h2>
          <div className="student-grid">
            {data.students.map((student) => <div className="student-chip" key={student.id}>
              <strong>{student.student_name_en || student.student_name_bn}</strong>
              <span>{student.student_id} · {student.course || "No course"}</span>
            </div>)}
            {!data.students.length && <p>No assigned students yet.</p>}
          </div>
        </section>

        <div className="classroom-columns">
          <section className="classroom-card">
            <h2>Create Batch</h2>
            <form className="classroom-form" onSubmit={createBatch}>
              <input required placeholder="Batch name" value={batch.name} onChange={(e) => setBatch({ ...batch, name: e.target.value })} />
              <input placeholder="Course" value={batch.course} onChange={(e) => setBatch({ ...batch, course: e.target.value })} />
              <input placeholder="Level" value={batch.language_level} onChange={(e) => setBatch({ ...batch, language_level: e.target.value })} />
              <input placeholder="Days (e.g. Sun, Tue)" value={batch.schedule_days} onChange={(e) => setBatch({ ...batch, schedule_days: e.target.value })} />
              <div><input type="time" value={batch.start_time} onChange={(e) => setBatch({ ...batch, start_time: e.target.value })} /> <input type="time" value={batch.end_time} onChange={(e) => setBatch({ ...batch, end_time: e.target.value })} /></div>
              <input placeholder="Room" value={batch.room} onChange={(e) => setBatch({ ...batch, room: e.target.value })} />
              <button>Create Batch</button>
            </form>
          </section>
          <section className="classroom-card">
            <h2>Your Batches</h2>
            {data.batches.map((item) => <button className={"batch-item " + (String(selectedBatch) === String(item.id) ? "selected" : "")} key={item.id} type="button" onClick={() => setSelectedBatch(item.id)}>
              <strong>{item.name}</strong><span>{item.schedule_days || "Schedule not set"} · {item.start_time || "--"} · {item.student_count} students</span>
            </button>)}
            {!data.batches.length && <p>Create your first batch.</p>}
          </section>
        </div>

        {selectedBatch && <div className="classroom-columns">
          <section className="classroom-card"><h2>Add Assigned Student</h2>
            <form className="classroom-form" onSubmit={addStudent}><select required value={studentId} onChange={(e) => setStudentId(e.target.value)}><option value="">Select student</option>{data.students.map((s) => <option key={s.id} value={s.id}>{s.student_name_en || s.student_name_bn} ({s.student_id})</option>)}</select><button>Add to Batch</button></form>
          </section>
          <section className="classroom-card"><h2>Maintain Class</h2>
            <form className="classroom-form" onSubmit={saveClass}><input required type="date" value={session.class_date} onChange={(e) => setSession({ ...session, class_date: e.target.value })} /><input required placeholder="Topic covered" value={session.topic} onChange={(e) => setSession({ ...session, topic: e.target.value })} /><textarea placeholder="Class notes" value={session.notes} onChange={(e) => setSession({ ...session, notes: e.target.value })} /><button>Save Class</button></form>
          </section>
        </div>}

        <section className="classroom-card"><h2>Recent Classes</h2>
          <div className="session-list">{data.sessions.map((item) => <div key={item.id}><strong>{item.class_date} · {item.batch_name}</strong><span>{item.topic}{item.notes ? " — " + item.notes : ""}</span></div>)}{!data.sessions.length && <p>No class sessions saved yet.</p>}</div>
        </section>
      </>}
    </div>
  );
}