import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/student_details.php?id=${id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.success) {
          setStudent(data.student);
        } else {
          setMessage(
            data.message || "Student data পাওয়া যায়নি"
          );
        }
      } catch (error) {
        console.error(error);
        setMessage("Server connection failed");
      }
    };

    if (id) {
      loadStudent();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getFileUrl = (file) => {
    if (!file) return null;
    const cleanFile = String(file).trim();
    if (!cleanFile) return null;

    if (
      cleanFile.startsWith("http://") ||
      cleanFile.startsWith("https://") ||
      cleanFile.startsWith("data:")
    ) {
      return cleanFile;
    }

    const relativePath = cleanFile
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/g, "")
      .replace(/^uploads\/students\//i, "")
      .replace(/^uploads\//i, "")
      .replace(/^students\//i, "")
      .split(/[\\/]+/)
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/");

    return relativePath
      ? `${API_ORIGIN}/uploads/students/${relativePath}`
      : null;
  };

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
        <p className="profile-loading">Loading student profile...</p>
      </div>
    );
  }

  const photoUrl = getFileUrl(
    student.student_photo || student.photo || student.profile_photo || ""
  );

  return (
    <div className="student-profile">
      {/* HEADER ACTIONS */}
      <div className="profile-header no-print">
        <div>
          <h1>Student Profile</h1>
          <p>শিক্ষার্থীর সম্পূর্ণ তথ্য (Full Resume Details)</p>
        </div>

        <div className="profile-buttons">
          <button
            className="back-button"
            onClick={() => navigate("/admin/student-list")}
          >
            ← Back
          </button>

          <button className="print-button" onClick={handlePrint}>
            🖨 Print / PDF
          </button>
        </div>
      </div>

      {/* A4 CARD DOCUMENT */}
      <div className="profile-card">
        {/* TOP BASIC INFO */}
        <div className="profile-top">
          <div className="profile-photo-box">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.student_name_en || "Student"}
              />
            ) : (
              <div className="profile-no-photo">No Photo</div>
            )}
          </div>

          <div className="profile-basic">
            <h2>{student.student_name_en || student.student_name || "N/A"}</h2>
            {student.student_name_bn && (
              <p className="bangla-name">{student.student_name_bn}</p>
            )}
            {student.katakana_name && (
              <p className="katakana-name">
                <strong>Katakana:</strong> {student.katakana_name}
              </p>
            )}

            <div className="profile-id">
              Student ID:{" "}
              <strong>
                {student.student_id && student.student_id !== "0"
                  ? student.student_id
                  : `#${student.id}`}
              </strong>
            </div>

            <div className="profile-tags">
              <span><strong>Branch:</strong> {student.branch || "—"}</span>
              <span><strong>Course:</strong> {student.course || "—"}</span>
              <span><strong>Level:</strong> {student.language_level || "—"}</span>
              <span><strong>Status:</strong> {student.status || "—"}</span>
            </div>
          </div>
        </div>

        {/* 1. PERSONAL DETAILS */}
        <section className="profile-section">
          <h3>Personal Details</h3>
          <div className="single-info-table">
            <div className="single-info-row">
              <div className="single-info-label">Short Name</div>
              <div className="single-info-value">{student.short_name || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Father's Name</div>
              <div className="single-info-value">{student.father_name || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Mother's Name</div>
              <div className="single-info-value">{student.mother_name || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Date of Birth</div>
              <div className="single-info-value">{student.date_of_birth || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Gender / Marital Status</div>
              <div className="single-info-value">
                {student.gender || "—"} / {student.marital_status || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Nationality / Religion</div>
              <div className="single-info-value">
                {student.nationality || "—"} / {student.religion || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Blood Group</div>
              <div className="single-info-value">{student.blood_group || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Admission Date</div>
              <div className="single-info-value">{student.admission_date || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Assigned Teacher</div>
              <div className="single-info-value">
                {student.teacher_name || student.teacher_id || student.assigned_teacher_id || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* 2. CONTACT INFORMATION */}
        <section className="profile-section">
          <h3>Contact & Emergency Information</h3>
          <div className="contact-table">
            <div className="contact-item">
              <label>Email Address</label>
              <p>{student.email || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Student Mobile</label>
              <p>{student.student_mobile || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Parents Mobile</label>
              <p>{student.parents_mobile || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Home Mobile</label>
              <p>{student.home_mobile || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Emergency Contact</label>
              <p>{student.emergency_contact || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Emergency Relation</label>
              <p>{student.emergency_relationship || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Course Fee</label>
              <p>৳ {Number(student.course_fee || 0).toLocaleString("en-BD")}</p>
            </div>
          </div>
        </section>

        {/* 3. ADDRESS INFORMATION */}
        <section className="profile-section">
          <h3>Address Information</h3>
          <div className="address-table">
            <div className="address-row address-header">
              <div>Type</div>
              <div>Village</div>
              <div>Post</div>
              <div>Thana</div>
              <div>District</div>
            </div>
            <div className="address-row">
              <div className="address-type">Present</div>
              <div>{student.present_village || "—"}</div>
              <div>{student.present_post || "—"}</div>
              <div>{student.present_thana || "—"}</div>
              <div>{student.present_district || "—"}</div>
            </div>
            <div className="address-row">
              <div className="address-type">Permanent</div>
              <div>{student.permanent_village || "—"}</div>
              <div>{student.permanent_post || "—"}</div>
              <div>{student.permanent_thana || "—"}</div>
              <div>{student.permanent_district || "—"}</div>
            </div>
          </div>
        </section>

        {/* 4. PHYSICAL & LIFESTYLE */}
        <section className="profile-section">
          <h3>Physical Attributes & Habits</h3>
          <div className="contact-table">
            <div className="contact-item">
              <label>Height / Weight</label>
              <p>
                {student.height_cm ? `${student.height_cm} cm` : "—"} /{" "}
                {student.weight_kg ? `${student.weight_kg} kg` : "—"}
              </p>
            </div>
            <div className="contact-item">
              <label>Dominant Hand</label>
              <p>{student.dominant_hand || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Eyesight</label>
              <p>{student.eyesight || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Tattoo</label>
              <p>{student.tattoo || "—"}</p>
            </div>
            <div className="contact-item">
              <label>Smoking / Alcohol</label>
              <p>
                {student.smoking || "No"} / {student.alcohol || "No"}
              </p>
            </div>
            <div className="contact-item">
              <label>Worship / Fasting</label>
              <p>
                {student.worship || "—"} / {student.fasting || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* 5. IDENTIFICATION & PASSPORT */}
        <section className="profile-section">
          <h3>Identity & Passport Documents</h3>
          <div className="passport-info-row">
            <div className="passport-info-item">
              <div className="passport-label">Passport No</div>
              <div className="passport-value">{student.passport_no || "—"}</div>
            </div>
            <div className="passport-info-item">
              <div className="passport-label">Issue Date</div>
              <div className="passport-value">
                {student.passport_issue_date &&
                student.passport_issue_date !== "0000-00-00"
                  ? student.passport_issue_date
                  : "—"}
              </div>
            </div>
            <div className="passport-info-item">
              <div className="passport-label">Expiry Date</div>
              <div className="passport-value">
                {student.passport_expiry_date &&
                student.passport_expiry_date !== "0000-00-00"
                  ? student.passport_expiry_date
                  : "—"}
              </div>
            </div>
            <div className="passport-info-item">
              <div className="passport-label">NID / Birth Registration No</div>
              <div className="passport-value">
                {student.nid_no || student.birth_registration_no || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* 6. EDUCATIONAL QUALIFICATION */}
        <section className="profile-section">
          <h3>Educational Qualifications</h3>
          <div className="education-table">
            <div className="education-row education-header">
              <div>Exam</div>
              <div>Institute / University</div>
              <div>Board / Type</div>
              <div>Roll / Reg</div>
              <div>Major / Group</div>
              <div>Year / Period</div>
              <div>Result</div>
            </div>

            {/* SSC */}
            <div className="education-row">
              <div className="education-exam">SSC</div>
              <div>{student.ssc_institute || "—"}</div>
              <div>{student.ssc_board || student.ssc_school_type || "—"}</div>
              <div>
                {student.ssc_roll
                  ? `${student.ssc_roll} / ${student.ssc_registration || ""}`
                  : "—"}
              </div>
              <div>{student.ssc_group || student.ssc_major || "—"}</div>
              <div>{student.ssc_passing_year || student.ssc_period || "—"}</div>
              <div>{student.ssc_gpa || "—"}</div>
            </div>

            {/* HSC */}
            <div className="education-row">
              <div className="education-exam">HSC</div>
              <div>{student.hsc_institute || "—"}</div>
              <div>{student.hsc_board || student.hsc_school_type || "—"}</div>
              <div>
                {student.hsc_roll
                  ? `${student.hsc_roll} / ${student.hsc_registration || ""}`
                  : "—"}
              </div>
              <div>{student.hsc_group || student.hsc_major || "—"}</div>
              <div>{student.hsc_passing_year || student.hsc_period || "—"}</div>
              <div>{student.hsc_gpa || "—"}</div>
            </div>

            {/* Honours */}
            <div className="education-row">
              <div className="education-exam">Honours</div>
              <div>
                {student.honours_institute || student.honours_university || "—"}
              </div>
              <div>{student.honours_school_type || "—"}</div>
              <div>
                {student.honours_roll
                  ? `${student.honours_roll} / ${
                      student.honours_registration || ""
                    }`
                  : "—"}
              </div>
              <div>{student.honours_group || student.honours_major || "—"}</div>
              <div>
                {student.honours_passing_year || student.honours_period || "—"}
              </div>
              <div>{student.honours_result || "—"}</div>
            </div>

            {/* Masters */}
            <div className="education-row">
              <div className="education-exam">Masters</div>
              <div>
                {student.masters_institute || student.masters_university || "—"}
              </div>
              <div>{student.masters_school_type || "—"}</div>
              <div>
                {student.masters_roll
                  ? `${student.masters_roll} / ${
                      student.masters_registration || ""
                    }`
                  : "—"}
              </div>
              <div>{student.masters_group || student.masters_major || "—"}</div>
              <div>
                {student.masters_passing_year || student.masters_period || "—"}
              </div>
              <div>{student.masters_result || "—"}</div>
            </div>
          </div>

          {student.additional_education && (
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              <strong>Additional Education:</strong> {student.additional_education}
            </p>
          )}
        </section>

        {/* 7. SKILLS, EXPERIENCE & PREFERENCES */}
        <section className="profile-section">
          <h3>Skills, Experience & Preferences</h3>
          <div className="single-info-table">
            <div className="single-info-row">
              <div className="single-info-label">Work History</div>
              <div className="single-info-value">{student.work_history || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Japanese Test History</div>
              <div className="single-info-value">
                {student.japanese_test_history || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">English Level</div>
              <div className="single-info-value">{student.english_level || "—"}</div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Strengths & Weaknesses</div>
              <div className="single-info-value">
                <strong>Strengths:</strong> {student.strengths || "—"} |{" "}
                <strong>Weaknesses:</strong> {student.weaknesses || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Hobby / Cooking</div>
              <div className="single-info-value">
                {student.hobby || "—"} (Cooking Skill: {student.cooking || "—"})
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Driving License / Bicycle</div>
              <div className="single-info-value">
                Regular License: {student.driving_license || "No"} |
                International: {student.international_driving_license || "No"} |
                Bicycle: {student.bicycle_riding || "No"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Group Living Adaptability</div>
              <div className="single-info-value">
                {student.group_living || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* 8. JAPAN APPLICATION & FUTURE PLANS */}
        <section className="profile-section">
          <h3>Japan Application & Financial Profile</h3>
          <div className="single-info-table">
            <div className="single-info-row">
              <div className="single-info-label">Reason for Japan Application</div>
              <div className="single-info-value">
                {student.japan_application_reason || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Post-Japan Work Plan</div>
              <div className="single-info-value">
                {student.post_japan_work_plan || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Remittance Plan</div>
              <div className="single-info-value">
                {student.remittance_plan || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Previous COE Application</div>
              <div className="single-info-value">
                {student.previous_coe_application || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Household Income / Debt</div>
              <div className="single-info-value">
                Monthly Income: {student.household_monthly_income || "—"} |
                Debt Status: {student.debt || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Family Support & Opinion</div>
              <div className="single-info-value">
                Members: {student.family_members || "—"} | Family Opinion:{" "}
                {student.family_opinion || "—"}
              </div>
            </div>
            <div className="single-info-row">
              <div className="single-info-label">Resume Consent & Date</div>
              <div className="single-info-value">
                Consent: {student.resume_consent || "—"} | Date:{" "}
                {student.resume_consent_date || "—"}
              </div>
            </div>
            {student.resume_other && (
              <div className="single-info-row">
                <div className="single-info-label">Other Resume Notes</div>
                <div className="single-info-value">{student.resume_other}</div>
              </div>
            )}
          </div>
        </section>

        {/* 9. FAMILY MEMBERS INFORMATION */}
        <section className="profile-section">
          <h3>Family Details</h3>
          <div className="address-table">
            <div className="address-row address-header">
              <div>#</div>
              <div>Name</div>
              <div>Relationship</div>
              <div>Age</div>
              <div>Occupation</div>
              <div>Living Status</div>
            </div>
            {[1, 2, 3, 4, 5].map((index) => {
              const name = student[`family_${index}_name`];
              const rel = student[`family_${index}_relationship`];
              const age = student[`family_${index}_age`];
              const occ = student[`family_${index}_occupation`];
              const status = student[`family_${index}_living_status`];

              if (!name && !rel && !occ) return null;

              return (
                <div className="address-row" key={index}>
                  <div>Member {index}</div>
                  <div>{name || "—"}</div>
                  <div>{rel || "—"}</div>
                  <div>{age || "—"}</div>
                  <div>{occ || "—"}</div>
                  <div>{status || "—"}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <div className="profile-footer">
          <span>Sunshine Education</span>
          <span>Generated Profile Document</span>
        </div>
      </div>
    </div>
  );
}