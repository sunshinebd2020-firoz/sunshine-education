import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../../config/api";
import "./TeacherProfile.css";

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/teacher_details.php?id=${encodeURIComponent(id)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setTeacher(data.teacher);
        else setError(data.message || "Teacher details could not be loaded.");
      })
      .catch(() => setError("Teacher details could not be loaded."));
  }, [id]);

  if (error) return <div className="teacher-profile"><p className="profile-error">{error}</p></div>;
  if (!teacher) return <div className="teacher-profile"><p>Loading teacher profile...</p></div>;

  const fields = [
    ["Teacher ID", teacher.teacher_id], ["English Name", teacher.name_en],
    ["Bangla Name", teacher.name_bn], ["Short Name", teacher.short_name],
    ["Course", teacher.course], ["Designation", teacher.designation],
    ["Branch", teacher.branch], ["Mobile", teacher.mobile], ["Email", teacher.email],
    ["Date of Birth", teacher.date_of_birth], ["Joining Date", teacher.joining_date],
    ["Qualification", teacher.qualification], ["Status", teacher.status], ["Address", teacher.address],
  ];

  return (
    <div className="teacher-profile">
      <div className="profile-header">
        <div>
          <h1>Teacher Profile</h1>
          <p>Complete teacher information</p>
        </div>
        <div className="profile-actions">
          <button type="button" onClick={() => navigate(`/admin/teacher-edit/${teacher.id}`)}>Edit Teacher</button>
          <button type="button" className="secondary" onClick={() => navigate("/admin/teacher-list")}>Back</button>
        </div>
      </div>
      <div className="profile-card">
        {teacher.photo && (() => {
          const rawPhoto = String(teacher.photo).trim();
          const cleanPhoto = rawPhoto
            .replace(/^https?:\/\/[^/]+/i, "")
            .replace(/^\/+/g, "")
            .replace(/^uploads\/teachers\//i, "")
            .replace(/^uploads\//i, "")
            .replace(/^teachers\//i, "")
            .replace(/^.*?uploads\//i, "")
            .split(/[\\/]+/)
            .filter(Boolean)
            .map((part) => encodeURIComponent(part))
            .join("/");

          const photoSrc = cleanPhoto
            ? `${API_BASE_URL.replace("/api", "")}/uploads/teachers/${cleanPhoto}`
            : "";

          return photoSrc ? <img className="profile-photo" src={photoSrc} alt={teacher.name_en || "Teacher"} /> : null;
        })()}
        <div className="profile-grid">
          {fields.map(([label, value]) => <div className="profile-field" key={label}><span>{label}</span><strong>{value || "N/A"}</strong></div>)}
        </div>
      </div>
    </div>
  );
}
