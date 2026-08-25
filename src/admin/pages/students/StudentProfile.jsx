import { useEffect, useState } from "react";
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
          throw new Error();
        }

        const data = await response.json();

        if (data.success) {
          setStudent(data.student);
        } else {
          setMessage(
            data.message ||
              "Student data পাওয়া যায়নি"
          );
        }
      } catch (error) {
        console.error(error);
        setMessage(
          "Server connection failed"
        );
      }
    };

    if (id) {
      loadStudent();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  /* =====================================================
     STUDENT PHOTO
  ===================================================== */

  const getFileUrl = (file) => {
    if (!file) {
      return null;
    }

    const cleanFile = String(file).trim();

    if (!cleanFile) {
      return null;
    }

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
      .map((part) =>
        encodeURIComponent(part)
      )
      .join("/");

    return relativePath
      ? `${API_ORIGIN}/uploads/students/${relativePath}`
      : null;
  };

  if (message) {
    return (
      <div className="student-profile">
        <p className="profile-error">
          {message}
        </p>
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

  const photoUrl = getFileUrl(
    student.student_photo ||
      student.photo ||
      student.profile_photo ||
      ""
  );

  return (
    <div className="student-profile">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="profile-header no-print">

        <div>
          <h1>
            Student Profile
          </h1>

          <p>
            শিক্ষার্থীর সম্পূর্ণ তথ্য
          </p>
        </div>

        <div className="profile-buttons">

          <button
            className="back-button"
            onClick={() =>
              navigate(
                "/admin/student-list"
              )
            }
          >
            ← Back
          </button>

          <button
            className="print-button"
            onClick={handlePrint}
          >
            🖨 Print / PDF
          </button>

        </div>
      </div>


      {/* =================================================
          A4 DOCUMENT
      ================================================= */}

      <div className="profile-card">

        {/* =================================================
            PROFILE TOP
        ================================================= */}

        <div className="profile-top">

          <div className="profile-photo-box">

            {photoUrl ? (
              <img
                src={photoUrl}
                alt={
                  student.student_name_en ||
                  "Student"
                }
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
                {student.student_id ||
                  `#${student.id}`}
              </strong>
            </div>

            <div className="profile-tags">

              <span>
                {student.branch ||
                  "Branch"}
              </span>

              <span>
                {student.course ||
                  "Course"}
              </span>

              <span>
                {student.language_level ||
                  "Level"}
              </span>

            </div>

          </div>
        </div>


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="profile-section">

          <h3>
            Personal Information
          </h3>

          <div className="single-info-table">

            <div className="single-info-row">
              <div className="single-info-label">
                Short Name
              </div>

              <div className="single-info-value">
                {student.short_name ||
                  "—"}
              </div>
            </div>


            <div className="single-info-row">
              <div className="single-info-label">
                Father's Name
              </div>

              <div className="single-info-value">
                {student.father_name ||
                  "—"}
              </div>
            </div>


            <div className="single-info-row">
              <div className="single-info-label">
                Mother's Name
              </div>

              <div className="single-info-value">
                {student.mother_name ||
                  "—"}
              </div>
            </div>


            <div className="single-info-row">
              <div className="single-info-label">
                Date of Birth
              </div>

              <div className="single-info-value">
                {student.date_of_birth ||
                  "—"}
              </div>
            </div>


            <div className="single-info-row">
              <div className="single-info-label">
                Blood Group
              </div>

              <div className="single-info-value">
                {student.blood_group ||
                  "—"}
              </div>
            </div>


            <div className="single-info-row">
              <div className="single-info-label">
                Admission Date
              </div>

              <div className="single-info-value">
                {student.admission_date ||
                  "—"}
              </div>
            </div>

          </div>

        </section>


        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <section className="profile-section">

          <h3>
            Contact Information
          </h3>

          <div className="contact-table">

            <div className="contact-item">
              <label>
                Student Mobile
              </label>

              <p>
                {student.student_mobile ||
                  student.mobile ||
                  "—"}
              </p>
            </div>


            <div className="contact-item">
              <label>
                Parents Mobile
              </label>

              <p>
                {student.parents_mobile ||
                  "—"}
              </p>
            </div>


            <div className="contact-item">
              <label>
                Home Mobile
              </label>

              <p>
                {student.home_mobile ||
                  "—"}
              </p>
            </div>


            <div className="contact-item">
              <label>
                Course Fee
              </label>

              <p>
                ৳{" "}
                {Number(
                  student.course_fee || 0
                ).toLocaleString("en-BD")}
              </p>
            </div>

          </div>

        </section>


        {/* =================================================
            ADDRESS
        ================================================= */}

        <section className="profile-section">

          <h3>
            Address Information
          </h3>

          <div className="address-table">

            <div className="address-row address-header">

              <div>
                Address Type
              </div>

              <div>
                Village
              </div>

              <div>
                Post
              </div>

              <div>
                Thana
              </div>

              <div>
                District
              </div>

            </div>


            <div className="address-row">

              <div className="address-type">
                Present
              </div>

              <div>
                {student.present_village ||
                  "—"}
              </div>

              <div>
                {student.present_post ||
                  "—"}
              </div>

              <div>
                {student.present_thana ||
                  "—"}
              </div>

              <div>
                {student.present_district ||
                  "—"}
              </div>

            </div>


            <div className="address-row">

              <div className="address-type">
                Permanent
              </div>

              <div>
                {student.permanent_village ||
                  "—"}
              </div>

              <div>
                {student.permanent_post ||
                  "—"}
              </div>

              <div>
                {student.permanent_thana ||
                  "—"}
              </div>

              <div>
                {student.permanent_district ||
                  "—"}
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PASSPORT INFORMATION
        ================================================= */}

        <section className="profile-section">

          <h3>
            Passport Information
          </h3>

          <div className="passport-info-row">

            <div className="passport-info-item">

              <div className="passport-label">
                Passport No
              </div>

              <div className="passport-value">
                {student.passport_no ||
                  "—"}
              </div>

            </div>


            <div className="passport-info-item">

              <div className="passport-label">
                Issue Date
              </div>

              <div className="passport-value">
                {student.passport_issue_date &&
                student.passport_issue_date !==
                  "0000-00-00"
                  ? student.passport_issue_date
                  : "—"}
              </div>

            </div>


            <div className="passport-info-item">

              <div className="passport-label">
                Expiry Date
              </div>

              <div className="passport-value">
                {student.passport_expiry_date &&
                student.passport_expiry_date !==
                  "0000-00-00"
                  ? student.passport_expiry_date
                  : "—"}
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            EDUCATIONAL QUALIFICATION
        ================================================= */}

        <section className="profile-section">

          <h3>
            Educational Qualification
          </h3>

          <div className="education-table">

            <div className="education-row education-header">

              <div>
                Exam
              </div>

              <div>
                Institute / University
              </div>

              <div>
                Board
              </div>

              <div>
                Roll
              </div>

              <div>
                Registration
              </div>

              <div>
                Group / Subject
              </div>

              <div>
                Year
              </div>

              <div>
                Result
              </div>

            </div>


            {/* SSC */}

            <div className="education-row">

              <div className="education-exam">
                SSC
              </div>

              <div>
                {student.ssc_institute ||
                  "—"}
              </div>

              <div>
                {student.ssc_board ||
                  "—"}
              </div>

              <div>
                {student.ssc_roll ||
                  "—"}
              </div>

              <div>
                {student.ssc_registration ||
                  "—"}
              </div>

              <div>
                {student.ssc_group ||
                  "—"}
              </div>

              <div>
                {student.ssc_passing_year ||
                  "—"}
              </div>

              <div>
                {student.ssc_gpa ||
                  "—"}
              </div>

            </div>


            {/* HSC */}

            <div className="education-row">

              <div className="education-exam">
                HSC
              </div>

              <div>
                {student.hsc_institute ||
                  "—"}
              </div>

              <div>
                {student.hsc_board ||
                  "—"}
              </div>

              <div>
                {student.hsc_roll ||
                  "—"}
              </div>

              <div>
                {student.hsc_registration ||
                  "—"}
              </div>

              <div>
                {student.hsc_group ||
                  "—"}
              </div>

              <div>
                {student.hsc_passing_year ||
                  "—"}
              </div>

              <div>
                {student.hsc_gpa ||
                  "—"}
              </div>

            </div>


            {/* HONOURS */}

            <div className="education-row">

              <div className="education-exam">
                Honours
              </div>

              <div>
                {student.honours_institute ||
                  student.honours_university ||
                  "—"}
              </div>

              <div>
                —
              </div>

              <div>
                {student.honours_roll ||
                  "—"}
              </div>

              <div>
                {student.honours_registration ||
                  "—"}
              </div>

              <div>
                {student.honours_group ||
                  "—"}
              </div>

              <div>
                {student.honours_passing_year ||
                  "—"}
              </div>

              <div>
                {student.honours_result ||
                  "—"}
              </div>

            </div>


            {/* MASTERS */}

            <div className="education-row">

              <div className="education-exam">
                Masters
              </div>

              <div>
                {student.masters_institute ||
                  student.masters_university ||
                  "—"}
              </div>

              <div>
                —
              </div>

              <div>
                {student.masters_roll ||
                  "—"}
              </div>

              <div>
                {student.masters_registration ||
                  "—"}
              </div>

              <div>
                {student.masters_group ||
                  "—"}
              </div>

              <div>
                {student.masters_passing_year ||
                  "—"}
              </div>

              <div>
                {student.masters_result ||
                  "—"}
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="profile-footer">

          <span>
            Sunshine Education
          </span>

          <span>
            Student Profile
          </span>

        </div>

      </div>
    </div>
  );
}