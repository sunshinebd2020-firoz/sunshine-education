import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../../config/api";
import "./TeacherEdit.css";

const fields = [
  ["teacherId", "Teacher ID"], ["name_en", "English Name"], ["name_bn", "Bangla Name"],
  ["short_name", "Short Name"], ["course", "Course"], ["designation", "Designation"],
  ["branch", "Branch"], ["mobile", "Mobile"], ["email", "Email"],
  ["date_of_birth", "Date of Birth"], ["joining_date", "Joining Date"],
  ["qualification", "Qualification"], ["address", "Address"], ["status", "Status"],
];

export default function TeacherEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/teacher_details.php?id=${encodeURIComponent(id)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => { if (data.success) setForm(data.teacher); else setMessage(data.message || "Teacher not found."); })
      .catch(() => setMessage("Teacher could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault(); setMessage("");
    const body = new FormData();
    body.append("id", id);
    const apiKeys = { teacherId: "teacherId", name_en: "nameEn", name_bn: "nameBn", short_name: "shortName", date_of_birth: "dateOfBirth", joining_date: "joiningDate" };
    fields.forEach(([key]) => body.append(apiKeys[key] || key, form[key] || ""));
    if (photo) body.append("photo", photo);
    try {
      const response = await fetch(`${API_BASE_URL}/teacher_update.php`, { method: "POST", credentials: "include", body });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Update failed.");
      navigate(`/admin/teacher-profile/${id}`);
    } catch (error) { setMessage(error.message); }
  };

  if (loading) return <div className="teacher-edit"><p>Loading teacher...</p></div>;
  return (
    <div className="teacher-edit">
      <div className="edit-header"><div><h1>Edit Teacher</h1><p>Update teacher information</p></div><button type="button" className="secondary" onClick={() => navigate(`/admin/teacher-profile/${id}`)}>Back</button></div>
      {message && <p className="edit-error">{message}</p>}
      <form className="teacher-edit-form" onSubmit={handleSubmit}>
        {fields.map(([key, label]) => <label key={key}>{label}{key === "address" ? <textarea value={form[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /> : key === "status" ? <select value={form[key] || "Present"} onChange={(event) => setForm({ ...form, [key]: event.target.value })}><option>Present</option><option>Ex Teacher</option><option>active</option><option>inactive</option></select> : <input type={key.includes("date") ? "date" : key === "email" ? "email" : "text"} value={form[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />}</label>)}
        <label>Teacher Photo<input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files[0] || null)} /></label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
