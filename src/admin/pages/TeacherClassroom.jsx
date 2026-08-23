import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./TeacherClassroom.css";

const emptyBatch = {
  name: "", course: "", language_level: "", schedule_days: "",
  start_time: "", end_time: "", room: "",
};

const studentName = (student) => student.student_name_en || student.student_name_bn || "Unnamed student";

export default function TeacherClassroom() {
  const [data, setData] = useState({ students: [], batches: [], sessions: [], batch_students: [] });
  const [batch, setBatch] = useState(emptyBatch);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState({ class_date: new Date().toISOString().slice(0, 10), topic: "", notes: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teacher_classroom.php`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load classroom.");
      setData(result);
      setSelectedBatch((current) => current || String(result.batches?.[0]?.id || ""));
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

  const selectedBatchData = useMemo(
    () => data.batches.find((item) => String(item.id) === String(selectedBatch)),
    [data.batches, selectedBatch]
  );
  const batchStudentIds = useMemo(
    () => new Set(data.batch_students.filter((item) => String(item.batch_id) === String(selectedBatch)).map((item) => String(item.id))),
    [data.batch_students, selectedBatch]
  );
  const batchStudents = data.students.filter((item) => batchStudentIds.has(String(item.id)));
  const availableStudents = data.students.filter((item) => !batchStudentIds.has(String(item.id)));

  const post = async (payload) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teacher_classroom.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
      setMessage(result.message);
      return result;
    } finally {
      setSaving(false);
    }
  };

  const createBatch = async (event) => {
    event.preventDefault();
    try {
      const result = await post({ action: "create_batch", ...batch });
      setBatch(emptyBatch);
      await load();
      setSelectedBatch(String(result.batch_id));
    } catch (error) { setMessage(error.message); }
  };

  const addStudent = async (event) => {
    event.preventDefault();
    if (!selectedBatch) return;
    try {
      await post({ action: "add_student", batch_id: selectedBatch, student_id: studentId });
      setStudentId("");
      await load();
    } catch (error) { setMessage(error.message); }
  };

  const saveClass = async (event) => {
    event.preventDefault();
    if (!selectedBatch) return;
    try {
      await post({ action: "save_class", batch_id: selectedBatch, ...session });
      setSession((current) => ({ ...current, topic: "", notes: "" }));
      await load();
    } catch (error) { setMessage(error.message); }
  };

  return (
    <div className="classroom-page">
      <header className="classroom-header">
        <div><h1>My Classroom</h1><p>শিক্ষার্থী, ব্যাচ ও ক্লাস—সবকিছু এক জায়গায় পরিচালনা করুন।</p></div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>রিফ্রেশ</button>
      </header>

      {message && <div className="classroom-message" role="status">{message}</div>}
      {loading ? <div className="classroom-card">তথ্য লোড হচ্ছে...</div> : <>
        <section className="classroom-summary" aria-label="Classroom summary">
          <div><span>Assigned Students</span><strong>{data.students.length}</strong></div>
          <div><span>My Batches</span><strong>{data.batches.length}</strong></div>
          <div><span>Classes Recorded</span><strong>{data.sessions.length}</strong></div>
        </section>

        <section className="classroom-card">
          <div className="card-heading"><div><h2>Assigned Students</h2><p>আপনার কাছে assigned থাকা শিক্ষার্থী।</p></div></div>
          {data.students.length ? <div className="student-grid">{data.students.map((student) => (
            <div className="student-chip" key={student.id}>
              <strong>{studentName(student)}</strong>
              <span>{student.student_id} · {student.course || "Course not set"}{student.language_level ? ` · ${student.language_level}` : ""}</span>
              {student.student_mobile && <small>{student.student_mobile}</small>}
            </div>
          ))}</div> : <p className="empty-state">এখনও কোনো শিক্ষার্থী assign করা হয়নি। Admin থেকে শিক্ষার্থী assign করুন।</p>}
        </section>

        <div className="classroom-columns">
          <section className="classroom-card">
            <div className="card-heading"><div><h2>নতুন Batch তৈরি করুন</h2><p>প্রথমে ব্যাচের রুটিন দিন, তারপর শিক্ষার্থী যোগ করুন।</p></div></div>
            <form className="classroom-form" onSubmit={createBatch}>
              <input required placeholder="Batch name (যেমন: IELTS Evening A)" value={batch.name} onChange={(e) => setBatch({ ...batch, name: e.target.value })} />
              <div className="form-row"><input placeholder="Course" value={batch.course} onChange={(e) => setBatch({ ...batch, course: e.target.value })} /><input placeholder="Level" value={batch.language_level} onChange={(e) => setBatch({ ...batch, language_level: e.target.value })} /></div>
              <input placeholder="Class days (যেমন: Sun, Tue, Thu)" value={batch.schedule_days} onChange={(e) => setBatch({ ...batch, schedule_days: e.target.value })} />
              <div className="form-row"><input aria-label="Start time" type="time" value={batch.start_time} onChange={(e) => setBatch({ ...batch, start_time: e.target.value })} /><input aria-label="End time" type="time" value={batch.end_time} onChange={(e) => setBatch({ ...batch, end_time: e.target.value })} /></div>
              <input placeholder="Room / online link" value={batch.room} onChange={(e) => setBatch({ ...batch, room: e.target.value })} />
              <button disabled={saving}>Batch তৈরি করুন</button>
            </form>
          </section>

          <section className="classroom-card">
            <div className="card-heading"><div><h2>আমার Batches</h2><p>একটি batch নির্বাচন করে শিক্ষার্থী ও class পরিচালনা করুন।</p></div></div>
            <div className="batch-list">{data.batches.map((item) => <button className={`batch-item ${String(selectedBatch) === String(item.id) ? "selected" : ""}`} key={item.id} type="button" onClick={() => setSelectedBatch(String(item.id))}>
              <strong>{item.name}</strong><span>{item.schedule_days || "রুটিন দেওয়া হয়নি"} · {item.start_time || "সময় নেই"}{item.room ? ` · ${item.room}` : ""}</span><small>{item.student_count} জন শিক্ষার্থী</small>
            </button>)}</div>
            {!data.batches.length && <p className="empty-state">শুরু করতে একটি batch তৈরি করুন।</p>}
          </section>
        </div>

        {selectedBatchData && <section className="selected-batch-section">
          <div className="selected-batch-title"><div><span>Selected batch</span><h2>{selectedBatchData.name}</h2><p>{selectedBatchData.schedule_days || "রুটিন নেই"} · {selectedBatchData.start_time || "সময় নেই"}{selectedBatchData.end_time ? `–${selectedBatchData.end_time}` : ""}</p></div></div>
          <div className="classroom-columns">
            <section className="classroom-card"><h2>Batch-এ শিক্ষার্থী যোগ করুন</h2>
              <form className="classroom-form" onSubmit={addStudent}><select required value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!availableStudents.length || saving}><option value="">{availableStudents.length ? "Assigned student নির্বাচন করুন" : "যোগ করার মতো শিক্ষার্থী নেই"}</option>{availableStudents.map((student) => <option key={student.id} value={student.id}>{studentName(student)} ({student.student_id})</option>)}</select><button disabled={!availableStudents.length || saving}>Batch-এ যোগ করুন</button></form>
              <h3 className="subheading">এই Batch-এর শিক্ষার্থী ({batchStudents.length})</h3>
              {batchStudents.length ? <ul className="batch-student-list">{batchStudents.map((student) => <li key={student.id}>{studentName(student)} <span>{student.student_id}</span></li>)}</ul> : <p className="empty-state">এখনও কাউকে এই batch-এ যোগ করা হয়নি।</p>}
            </section>
            <section className="classroom-card"><h2>আজকের Class সংরক্ষণ করুন</h2>
              <form className="classroom-form" onSubmit={saveClass}><input required type="date" value={session.class_date} onChange={(e) => setSession({ ...session, class_date: e.target.value })} /><input required placeholder="আজকের topic / lesson" value={session.topic} onChange={(e) => setSession({ ...session, topic: e.target.value })} /><textarea placeholder="হোমওয়ার্ক বা অতিরিক্ত নোট (ঐচ্ছিক)" value={session.notes} onChange={(e) => setSession({ ...session, notes: e.target.value })} /><button disabled={saving}>Class Record সংরক্ষণ করুন</button></form>
            </section>
          </div>
        </section>}

        <section className="classroom-card"><div className="card-heading"><div><h2>Recent Class Records</h2><p>সর্বশেষ সংরক্ষিত ক্লাসগুলো।</p></div></div>
          <div className="session-list">{data.sessions.map((item) => <div key={item.id}><strong>{item.class_date} · {item.batch_name}</strong><span>{item.topic}{item.notes ? ` — ${item.notes}` : ""}</span></div>)}{!data.sessions.length && <p className="empty-state">এখনও কোনো class record নেই।</p>}</div>
        </section>
      </>}
    </div>
  );
}