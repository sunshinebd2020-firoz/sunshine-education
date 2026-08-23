import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./TeacherClassroom.css";

const emptyBatch = { name: "", course: "", language_level: "", schedule_days: "", start_time: "", end_time: "", room: "" };
const studentName = (student) => student.student_name_en || student.student_name_bn || "Unnamed student";

export default function TeacherClassroom() {
  const [data, setData] = useState({ students: [], batches: [], sessions: [], batch_students: [], attendance: [], teachers: [], transfer_requests: [] });
  const [batch, setBatch] = useState(emptyBatch);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [session, setSession] = useState({ class_date: new Date().toISOString().slice(0, 10), topic: "", notes: "" });
  const [openSessionId, setOpenSessionId] = useState("");
  const [editBatch, setEditBatch] = useState(null);
  const [transferStudent, setTransferStudent] = useState(null);
  const [transferTeacherId, setTransferTeacherId] = useState("");
  const [transferNote, setTransferNote] = useState("");
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
    } catch (error) { setMessage(error.message || "Could not load classroom."); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  const selectedBatchData = useMemo(() => data.batches.find((item) => String(item.id) === String(selectedBatch)), [data.batches, selectedBatch]);
  const batchStudents = useMemo(() => data.batch_students.filter((item) => String(item.batch_id) === String(selectedBatch)), [data.batch_students, selectedBatch]);
  const batchStudentIds = useMemo(() => new Set(batchStudents.map((item) => String(item.id))), [batchStudents]);
  const availableStudents = data.students.filter((item) => !batchStudentIds.has(String(item.id)));

  const post = async (payload) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teacher_classroom.php`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
      setMessage(result.message);
      return result;
    } finally { setSaving(false); }
  };

  const createBatch = async (event) => {
    event.preventDefault();
    try { const result = await post({ action: "create_batch", ...batch }); setBatch(emptyBatch); await load(); setSelectedBatch(String(result.batch_id)); }
    catch (error) { setMessage(error.message); }
  };

  const addStudent = async (studentId) => {
    try { await post({ action: "add_student", batch_id: selectedBatch, student_id: studentId }); await load(); }
    catch (error) { setMessage(error.message); }
  };

  const updateBatch = async (event) => {
    event.preventDefault();
    try { await post({ action: "update_batch", batch_id: selectedBatch, ...editBatch }); setEditBatch(null); await load(); }
    catch (error) { setMessage(error.message); }
  };

  const removeStudent = async (student) => {
    if (!window.confirm(`${studentName(student)} কে এই batch থেকে বাদ দিতে চান?`)) return;
    try { await post({ action: "remove_student", batch_id: selectedBatch, student_id: student.id }); await load(); }
    catch (error) { setMessage(error.message); }
  };

  const openTransfer = (student) => {
    setTransferStudent(student); setTransferTeacherId(""); setTransferNote("");
  };

  const requestTransfer = async (event) => {
    event.preventDefault();
    try {
      await post({ action: "request_transfer", student_id: transferStudent.id, to_teacher_id: transferTeacherId, request_note: transferNote });
      setTransferStudent(null); await load();
    } catch (error) { setMessage(error.message); }
  };
  const saveClass = async (event) => {
    event.preventDefault();
    const attendance = new FormData(event.currentTarget).getAll("attendance");
    try {
      await post({ action: "save_class", batch_id: selectedBatch, ...session, attendance });
      setSession((current) => ({ ...current, topic: "", notes: "" }));
      await load();
    } catch (error) { setMessage(error.message); }
  };

  return <div className="classroom-page">
    <header className="classroom-header"><div><h1>My Classroom</h1><p>শিক্ষার্থী, ব্যাচ, attendance ও ক্লাস record এক জায়গায়।</p></div><button type="button" className="secondary-button" onClick={load} disabled={loading}>রিফ্রেশ</button></header>
    {message && <div className="classroom-message" role="status">{message}</div>}
    {loading ? <div className="classroom-card">তথ্য লোড হচ্ছে...</div> : <>
      <section className="classroom-summary"><div><span>Assigned Students</span><strong>{data.students.length}</strong></div><div><span>My Batches</span><strong>{data.batches.length}</strong></div><div><span>Classes Recorded</span><strong>{data.sessions.length}</strong></div></section>

      <section className="classroom-card"><div className="card-heading"><div><h2>Assigned Students</h2><p>আপনার কাছে assigned থাকা শিক্ষার্থীর তালিকা।</p></div></div>
        {data.students.length ? <div className="table-wrap"><table className="classroom-table"><thead><tr><th>#</th><th>নাম</th><th>Student ID</th><th>Course / Level</th><th>Mobile</th><th>Request</th></tr></thead><tbody>{data.students.map((student, index) => <tr key={student.id}><td>{index + 1}</td><td>{studentName(student)}</td><td>{student.student_id}</td><td>{student.course || "—"}{student.language_level ? ` / ${student.language_level}` : ""}</td><td>{student.student_mobile || "—"}</td><td><button type="button" className="icon-button" title="অন্য teacher-এর কাছে transfer request পাঠান" onClick={() => openTransfer(student)}>↗</button></td></tr>)}</tbody></table></div> : <p className="empty-state">এখনও কোনো শিক্ষার্থী assign করা হয়নি।</p>}</section>

      <div className="classroom-columns"><section className="classroom-card"><div className="card-heading"><div><h2>নতুন Batch তৈরি করুন</h2><p>রুটিন দিয়ে batch তৈরি করুন।</p></div></div><form className="classroom-form" onSubmit={createBatch}><input required placeholder="Batch name (যেমন: IELTS Evening A)" value={batch.name} onChange={(e) => setBatch({ ...batch, name: e.target.value })} /><div className="form-row"><input placeholder="Course" value={batch.course} onChange={(e) => setBatch({ ...batch, course: e.target.value })} /><input placeholder="Level" value={batch.language_level} onChange={(e) => setBatch({ ...batch, language_level: e.target.value })} /></div><input placeholder="Class days (যেমন: Sun, Tue, Thu)" value={batch.schedule_days} onChange={(e) => setBatch({ ...batch, schedule_days: e.target.value })} /><div className="form-row"><input aria-label="Start time" type="time" value={batch.start_time} onChange={(e) => setBatch({ ...batch, start_time: e.target.value })} /><input aria-label="End time" type="time" value={batch.end_time} onChange={(e) => setBatch({ ...batch, end_time: e.target.value })} /></div><input placeholder="Room / online link" value={batch.room} onChange={(e) => setBatch({ ...batch, room: e.target.value })} /><button disabled={saving}>Batch তৈরি করুন</button></form></section>
      <section className="classroom-card"><div className="card-heading"><div><h2>আমার Batches</h2><p>একটি batch নির্বাচন করুন।</p></div></div><div className="batch-list">{data.batches.map((item) => <button className={`batch-item ${String(selectedBatch) === String(item.id) ? "selected" : ""}`} key={item.id} type="button" onClick={() => setSelectedBatch(String(item.id))}><strong>{item.name}</strong><span>{item.schedule_days || "রুটিন দেওয়া হয়নি"} · {item.start_time || "সময় নেই"}{item.room ? ` · ${item.room}` : ""}</span><small>{item.student_count} জন শিক্ষার্থী</small></button>)}</div>{!data.batches.length && <p className="empty-state">শুরু করতে একটি batch তৈরি করুন।</p>}</section></div>

      {selectedBatchData && <section className="selected-batch-section"><div className="selected-batch-title"><div><span>Selected batch</span><h2>{selectedBatchData.name}</h2><p>{selectedBatchData.schedule_days || "রুটিন নেই"} · {selectedBatchData.start_time || "সময় নেই"}{selectedBatchData.end_time ? `–${selectedBatchData.end_time}` : ""}</p></div><button type="button" className="secondary-button" onClick={() => setEditBatch({ ...selectedBatchData })}>✎ Batch Edit</button></div>{editBatch && <form className="classroom-form batch-edit-form" onSubmit={updateBatch}><div className="form-row"><input required placeholder="Batch name" value={editBatch.name || ""} onChange={(e) => setEditBatch({ ...editBatch, name: e.target.value })} /><input placeholder="Course" value={editBatch.course || ""} onChange={(e) => setEditBatch({ ...editBatch, course: e.target.value })} /></div><div className="form-row"><input placeholder="Level" value={editBatch.language_level || ""} onChange={(e) => setEditBatch({ ...editBatch, language_level: e.target.value })} /><input placeholder="Class days" value={editBatch.schedule_days || ""} onChange={(e) => setEditBatch({ ...editBatch, schedule_days: e.target.value })} /></div><div className="form-row"><input type="time" value={editBatch.start_time || ""} onChange={(e) => setEditBatch({ ...editBatch, start_time: e.target.value })} /><input type="time" value={editBatch.end_time || ""} onChange={(e) => setEditBatch({ ...editBatch, end_time: e.target.value })} /></div><input placeholder="Room / online link" value={editBatch.room || ""} onChange={(e) => setEditBatch({ ...editBatch, room: e.target.value })} /><div className="form-row"><button disabled={saving}>পরিবর্তন Save করুন</button><button type="button" className="secondary-button" onClick={() => setEditBatch(null)}>বাতিল</button></div></form>}<div className="classroom-columns">
        <section className="classroom-card"><h2>Batch-এ শিক্ষার্থী যোগ করুন</h2><p className="section-help">নিচের তালিকা থেকে একজন শিক্ষার্থী যোগ করুন।</p>{availableStudents.length ? <div className="table-wrap"><table className="classroom-table"><thead><tr><th>নাম</th><th>Student ID</th><th>Mobile</th><th></th></tr></thead><tbody>{availableStudents.map((student) => <tr key={student.id}><td>{studentName(student)}</td><td>{student.student_id}</td><td>{student.student_mobile || "—"}</td><td><button type="button" className="small-button" onClick={() => addStudent(student.id)} disabled={saving}>যোগ করুন</button></td></tr>)}</tbody></table></div> : <p className="empty-state">যোগ করার মতো assigned student নেই।</p>}<h3 className="subheading">এই Batch-এর শিক্ষার্থী ({batchStudents.length})</h3>{batchStudents.length ? <div className="table-wrap"><table className="classroom-table"><thead><tr><th>নাম</th><th>Student ID</th><th>Mobile</th><th></th></tr></thead><tbody>{batchStudents.map((student) => <tr key={student.id}><td>{studentName(student)}</td><td>{student.student_id}</td><td>{student.student_mobile || "—"}</td><td><button type="button" className="small-button danger-button" onClick={() => removeStudent(student)} disabled={saving}>বাদ দিন</button></td></tr>)}</tbody></table></div> : <p className="empty-state">এখনও কাউকে এই batch-এ যোগ করা হয়নি।</p>}</section>
        <section className="classroom-card"><h2>আজকের Class সংরক্ষণ করুন</h2><p className="section-help">উপস্থিত শিক্ষার্থীদের checkbox-এ tick দিন। Tick না করা শিক্ষার্থী absent হিসেবে সংরক্ষিত হবে।</p><form className="classroom-form" onSubmit={saveClass}><input required type="date" value={session.class_date} onChange={(e) => setSession({ ...session, class_date: e.target.value })} /><input required placeholder="আজকের topic / lesson" value={session.topic} onChange={(e) => setSession({ ...session, topic: e.target.value })} /><div className="attendance-list">{batchStudents.map((student) => <label key={student.id}><input type="checkbox" name="attendance" value={student.id} defaultChecked /> <span>{studentName(student)} <small>{student.student_id} · {student.student_mobile || "Mobile নেই"}</small></span></label>)}{!batchStudents.length && <p className="empty-state">আগে এই batch-এ শিক্ষার্থী যোগ করুন।</p>}</div><textarea placeholder="হোমওয়ার্ক বা অতিরিক্ত নোট (ঐচ্ছিক)" value={session.notes} onChange={(e) => setSession({ ...session, notes: e.target.value })} /><button disabled={saving || !batchStudents.length}>Class ও Attendance সংরক্ষণ করুন</button></form></section>
      </div></section>}

      <section className="classroom-card"><div className="card-heading"><div><h2>সর্বশেষ সংরক্ষিত ক্লাসগুলো</h2><p>প্রতিটি record খুলে class details ও attendance দেখুন।</p></div></div><div className="session-list">{data.sessions.map((item) => { const isOpen = String(openSessionId) === String(item.id); const attendance = data.attendance.filter((row) => String(row.class_session_id) === String(item.id)); const presentCount = attendance.filter((row) => row.attendance_status === "present").length; return <div className="session-item" key={item.id}><button type="button" className="session-toggle" onClick={() => setOpenSessionId(isOpen ? "" : String(item.id))}><span><strong>{item.class_date} · {item.batch_name}</strong><small>{item.topic}</small></span><span>{attendance.length ? `${presentCount}/${attendance.length} উপস্থিত` : "Details খুলুন"} {isOpen ? "▲" : "▼"}</span></button>{isOpen && <div className="session-details"><p><strong>Topic:</strong> {item.topic}</p>{item.notes && <p><strong>Notes:</strong> {item.notes}</p>}{attendance.length ? <div className="table-wrap"><table className="classroom-table"><thead><tr><th>শিক্ষার্থী</th><th>Student ID</th><th>Attendance</th></tr></thead><tbody>{attendance.map((row) => <tr key={row.student_id}><td>{studentName(row)}</td><td>{row.student_code}</td><td><span className={`attendance-status ${row.attendance_status}`}>{row.attendance_status === "present" ? "উপস্থিত" : "অনুপস্থিত"}</span></td></tr>)}</tbody></table></div> : <p className="empty-state">এই পুরোনো class record-এ attendance সংরক্ষিত হয়নি।</p>}</div>}</div>; })}{!data.sessions.length && <p className="empty-state">এখনও কোনো class record নেই।</p>}</div></section>
      {transferStudent && <div className="classroom-modal-overlay" onMouseDown={() => !saving && setTransferStudent(null)}><div className="classroom-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><h2>Transfer Request</h2><p><strong>{studentName(transferStudent)}</strong> ({transferStudent.student_id})-কে অন্য teacher-এর কাছে পাঠানোর request করুন।</p><form className="classroom-form" onSubmit={requestTransfer}><select required value={transferTeacherId} onChange={(event) => setTransferTeacherId(event.target.value)}><option value="">নতুন teacher নির্বাচন করুন</option>{data.teachers.map((teacher) => <option key={teacher.teacher_id} value={teacher.teacher_id}>{teacher.name_en || teacher.name_bn} ({teacher.teacher_id})</option>)}</select><textarea placeholder="কারণ / নোট (ঐচ্ছিক)" value={transferNote} onChange={(event) => setTransferNote(event.target.value)} /><div className="form-row"><button disabled={saving}>Request পাঠান</button><button type="button" className="secondary-button" onClick={() => setTransferStudent(null)}>বাতিল</button></div></form></div></div>}
      {data.transfer_requests.length > 0 && <section className="classroom-card transfer-history"><h2>আমার Transfer Requests</h2><div className="table-wrap"><table className="classroom-table"><thead><tr><th>শিক্ষার্থী</th><th>নতুন Teacher</th><th>তারিখ</th><th>Status</th></tr></thead><tbody>{data.transfer_requests.map((request) => <tr key={request.id}><td>{studentName(request)} ({request.student_code})</td><td>{request.to_teacher_name_en || request.to_teacher_name_bn || request.to_teacher_id}</td><td>{String(request.created_at).slice(0, 10)}</td><td><span className="attendance-status absent">{request.status}</span></td></tr>)}</tbody></table></div></section>}    </>}</div>;
}