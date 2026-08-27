import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../../config/api";
import "./TeacherEdit.css";

const fields = [
  ["teacherId", "Teacher ID", "teacherId"],
  ["name_en", "English Name", "nameEn"],
  ["name_bn", "Bangla Name", "nameBn"],
  ["short_name", "Short Name", "shortName"],
  ["course", "Course", "course"],
  ["designation", "Designation", "designation"],
  ["branch", "Branch", "branch"],
  ["mobile", "Mobile", "mobile"],
  ["email", "Email", "email"],
  ["date_of_birth", "Date of Birth", "dateOfBirth"],
  ["joining_date", "Joining Date", "joiningDate"],
  ["qualification", "Qualification", "qualification"],
  ["address", "Address", "address"],
  ["status", "Status", "status"],
];

export default function TeacherEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [branches, setBranches] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Branch List Fetch
    const fetchBranches = fetch(`${API_BASE_URL}/branch_list.php`, {
      credentials: "include",
    }).then((res) => res.json());

    // Teacher Details Fetch
    const fetchTeacher = fetch(
      `${API_BASE_URL}/teacher_details.php?id=${encodeURIComponent(id)}`,
      { credentials: "include" }
    ).then((res) => res.json());

    Promise.all([fetchBranches, fetchTeacher])
      .then(([branchData, teacherData]) => {
        // ১. ব্রাঞ্চ ডাটা সেটিং
        if (branchData && branchData.success && Array.isArray(branchData.branch)) {
          setBranches(branchData.branch);
        }

        // ২. টিচার ডাটা সেটিং
        if (teacherData && teacherData.success && teacherData.teacher) {
          const t = teacherData.teacher;
          setForm({
            teacherId: t.teacher_id || t.teacherId || t.id || "",
            name_en: t.name_en || t.nameEn || "",
            name_bn: t.name_bn || t.nameBn || "",
            short_name: t.short_name || t.shortName || "",
            course: t.course || "",
            designation: t.designation || "",
            branch: t.branch || t.branch_name || "",
            mobile: t.mobile || "",
            email: t.email || "",
            date_of_birth: t.date_of_birth || t.dateOfBirth || "",
            joining_date: t.joining_date || t.joiningDate || "",
            qualification: t.qualification || "",
            address: t.address || "",
            status: t.status || "active",
          });
        } else {
          setMessage(teacherData.message || "Teacher not found.");
        }
      })
      .catch((err) => {
        console.error("Data Load Error:", err);
        setMessage("Failed to load component data.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const body = new FormData();
    body.append("id", id);

    fields.forEach(([stateKey, , apiKey]) => {
      body.append(apiKey, form[stateKey] || "");
    });

    if (photo) {
      body.append("photo", photo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/teacher_update.php`, {
        method: "POST",
        credentials: "include",
        body,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Update failed.");
      }

      navigate(`/admin/teacher-profile/${id}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div className="teacher-edit">
        <p>Loading teacher details...</p>
      </div>
    );
  }

  return (
    <div className="teacher-edit">
      <div className="edit-header">
        <div>
          <h1>Edit Teacher</h1>
          <p>Update teacher information</p>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => navigate(`/admin/teacher-profile/${id}`)}
        >
          Back
        </button>
      </div>

      {message && <p className="edit-error">{message}</p>}

      <form className="teacher-edit-form" onSubmit={handleSubmit}>
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === "address" ? (
              <textarea
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ) : key === "branch" ? (
              <select
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => {
                  // branch_name না থাকলে title থেকে নাম নিবে
                  const bName = b.branch_name || b.title;
                  const bValue = b.branch_name || b.title;
                  return (
                    <option key={b.id} value={bValue}>
                      {bName} {b.branch_name_bn ? `(${b.branch_name_bn})` : ""}
                    </option>
                  );
                })}
              </select>
            ) : key === "status" ? (
              <select
                value={form[key] || "active"}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="Present">Present</option>
                <option value="Ex Teacher">Ex Teacher</option>
              </select>
            ) : (
              <input
                type={
                  key.includes("date")
                    ? "date"
                    : key === "email"
                    ? "email"
                    : "text"
                }
                value={form[key] || ""}
                disabled={key === "teacherId"}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </label>
        ))}

        <label>
          Teacher Photo
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files[0] || null)}
          />
        </label>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}