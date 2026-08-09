import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentProfile.css";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await fetch(
          `http://localhost/sunshine-api/api/student_details.php?id=${id}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        if (data.success) {
          setStudent(data.student);
        } else {
          setMessage(data.message || "Student data পাওয়া যায়নি");
        }
      } catch (error) {
        console.error(error);
        setMessage("Server connection failed");
      }
    };

    loadStudent();
  }, [id]);

  if (message) {
    return (
      <div className="student-profile">
        <p className="profile-error">{message}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile">
        <p className="profile-loading">
          Loading student profile...
        </p>
      </div>
    );
  }

  const photoUrl = student.student_photo
    ? `http://localhost/sunshine-api/uploads/students/${student.student_photo}`
    : null;

  return (
    <div className="student-profile">

      <div className="profile-header">

        <div>
          <h1>Student Profile</h1>
          <p>শিক্ষার্থীর সম্পূর্ণ তথ্য</p>
        </div>

        <div className="profile-buttons">
          <button
            className="back-button"
            onClick={() => navigate("/admin/student-list")}
          >
            ← Back
          </button>

          <button
            className="print-button"
            onClick={() => window.print()}
          >
            🖨️ Print
          </button>

        </div>

      </div>

      <div className="profile-card">

        <div className="profile-top">

          <div className="profile-photo-box">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.student_name_en || "Student"}
              />
            ) : (
              <div className="profile-no-photo">
                No Photo
              </div>
            )}
          </div>

          <div className="profile-basic">

            <h2>
              {student.student_name_en ||
                student.student_name ||
                "N/A"}
            </h2>

            {student.student_name_bn && (
              <p className="bangla-name">
                {student.student_name_bn}
              </p>
            )}

            <div className="profile-id">
              Student ID:
              <strong>
                {student.student_id || `#${student.id}`}
              </strong>
            </div>

            <div className="profile-tags">
              <span>{student.course || "N/A"}</span>
              <span>
                {student.language_level || "N/A"}
              </span>
              <span>
                {student.status || "Active"}
              </span>
            </div>

          </div>

        </div>

        <section className="profile-section">

          <h3>Personal Information</h3>

          <div className="info-grid">

            <div>
              <label>Short Name</label>
              <p>{student.short_name || "—"}</p>
            </div>

            <div>
              <label>Father's Name</label>
              <p>{student.father_name || "—"}</p>
            </div>

            <div>
              <label>Mother's Name</label>
              <p>{student.mother_name || "—"}</p>
            </div>

            <div>
              <label>Date of Birth</label>
              <p>{student.date_of_birth || "—"}</p>
            </div>

            <div>
              <label>Blood Group</label>
              <p>{student.blood_group || "—"}</p>
            </div>

            <div>
              <label>Branch</label>
              <p>{student.branch || "—"}</p>
            </div>

            <div>
              <label>Course</label>
              <p>{student.course || "—"}</p>
            </div>

            <div>
              <label>Level</label>
              <p>{student.language_level || "—"}</p>
            </div>

          </div>

        </section>

        <section className="profile-section">

          <h3>Contact Information</h3>

          <div className="info-grid">

            <div>
              <label>Student Mobile</label>
              <p>
                {student.student_mobile ||
                  student.mobile ||
                  "—"}
              </p>
            </div>

            <div>
              <label>Parents Mobile</label>
              <p>{student.parents_mobile || "—"}</p>
            </div>

            <div>
              <label>Home Mobile</label>
              <p>{student.home_mobile || "—"}</p>
            </div>

            <div>
              <label>Course Fee</label>
              <p>
                ৳ {student.course_fee || "0"}
              </p>
            </div>

          </div>

        </section>

        <section className="profile-section">

          <h3>Present Address</h3>

          <div className="info-grid">

            <div>
              <label>Village</label>
              <p>{student.present_village || "—"}</p>
            </div>

            <div>
              <label>Post</label>
              <p>{student.present_post || "—"}</p>
            </div>

            <div>
              <label>Thana</label>
              <p>{student.present_thana || "—"}</p>
            </div>

            <div>
              <label>District</label>
              <p>{student.present_district || "—"}</p>
            </div>

          </div>

        </section>

        <section className="profile-section">

          <h3>Permanent Address</h3>

          <div className="info-grid">

            <div>
              <label>Village</label>
              <p>{student.permanent_village || "—"}</p>
            </div>

            <div>
              <label>Post</label>
              <p>{student.permanent_post || "—"}</p>
            </div>

            <div>
              <label>Thana</label>
              <p>{student.permanent_thana || "—"}</p>
            </div>

            <div>
              <label>District</label>
              <p>{student.permanent_district || "—"}</p>
            </div>

          </div>

        </section>

        <section className="profile-section">

          <h3>Educational Qualification</h3>

          <div className="education-block">

            <h4>SSC</h4>

            <div className="info-grid">

              <div>
                <label>Institute</label>
                <p>{student.ssc_institute || "—"}</p>
              </div>

              <div>
                <label>Board</label>
                <p>{student.ssc_board || "—"}</p>
              </div>

              <div>
                <label>Roll No</label>
                <p>{student.ssc_roll || "—"}</p>
              </div>

              <div>
                <label>Registration No</label>
                <p>{student.ssc_registration || "—"}</p>
              </div>

              <div>
                <label>Group</label>
                <p>{student.ssc_group || "—"}</p>
              </div>

              <div>
                <label>Passing Year</label>
                <p>{student.ssc_passing_year || "—"}</p>
              </div>

              <div>
                <label>GPA</label>
                <p>{student.ssc_gpa || "—"}</p>
              </div>

            </div>

          </div>

          <div className="education-block">

            <h4>HSC</h4>

            <div className="info-grid">

              <div>
                <label>Institute</label>
                <p>{student.hsc_institute || "—"}</p>
              </div>

              <div>
                <label>Board</label>
                <p>{student.hsc_board || "—"}</p>
              </div>

              <div>
                <label>Roll No</label>
                <p>{student.hsc_roll || "—"}</p>
              </div>

              <div>
                <label>Registration No</label>
                <p>{student.hsc_registration || "—"}</p>
              </div>

              <div>
                <label>Group</label>
                <p>{student.hsc_group || "—"}</p>
              </div>

              <div>
                <label>Passing Year</label>
                <p>{student.hsc_passing_year || "—"}</p>
              </div>

              <div>
                <label>GPA</label>
                <p>{student.hsc_gpa || "—"}</p>
              </div>

            </div>

          </div>

          <div className="education-block">

            <h4>Honours</h4>

            <div className="info-grid">

              <div>
                <label>Institute</label>
                <p>{student.honours_institute || "—"}</p>
              </div>

              <div>
                <label>University</label>
                <p>{student.honours_university || "—"}</p>
              </div>

              <div>
                <label>Roll No</label>
                <p>{student.honours_roll || "—"}</p>
              </div>

              <div>
                <label>Registration No</label>
                <p>{student.honours_registration || "—"}</p>
              </div>

              <div>
                <label>Group / Subject</label>
                <p>{student.honours_group || "—"}</p>
              </div>

              <div>
                <label>Passing Year</label>
                <p>{student.honours_passing_year || "—"}</p>
              </div>

              <div>
                <label>GPA / Division</label>
                <p>{student.honours_result || "—"}</p>
              </div>

            </div>

          </div>

          <div className="education-block">

            <h4>Masters</h4>

            <div className="info-grid">

              <div>
                <label>Institute</label>
                <p>{student.masters_institute || "—"}</p>
              </div>

              <div>
                <label>University</label>
                <p>{student.masters_university || "—"}</p>
              </div>

              <div>
                <label>Roll No</label>
                <p>{student.masters_roll || "—"}</p>
              </div>

              <div>
                <label>Registration No</label>
                <p>{student.masters_registration || "—"}</p>
              </div>

              <div>
                <label>Group / Subject</label>
                <p>{student.masters_group || "—"}</p>
              </div>

              <div>
                <label>Passing Year</label>
                <p>{student.masters_passing_year || "—"}</p>
              </div>

              <div>
                <label>GPA / Division</label>
                <p>{student.masters_result || "—"}</p>
              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}