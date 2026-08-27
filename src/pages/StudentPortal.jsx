import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import { clearStudentAuthStorage, readStudentSession } from "../admin/authStorage";
import "./StudentPortal.css";

const getDisplayValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    const text = String(value).trim();
    if (text !== "") {
      return text;
    }
  }

  return "N/A";
};

const getDocumentUrl = (file) => {
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
    .replace(/^\/+/, "")
    .replace(/^uploads\/students\//i, "")
    .replace(/^uploads\//i, "")
    .replace(/^students\//i, "")
    .split(/[\\/]+/)
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

  return relativePath ? `${API_ORIGIN}/uploads/students/${relativePath}` : null;
};

const getDocumentName = (value) => {
  if (!value) {
    return "No file uploaded";
  }

  const cleanValue = String(value).trim();
  if (!cleanValue) {
    return "No file uploaded";
  }

  const fileName = cleanValue.split("/").pop();
  return fileName || "Uploaded document";
};

export default function StudentPortal() {
  const navigate = useNavigate();
  const sessionStudent = useMemo(() => readStudentSession(), []);
  const [profile, setProfile] = useState(() => readStudentSession());
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const loadProfile = async (studentId) => {
    if (!studentId) {
      return;
    }

    setLoadingProfile(true);
    setProfileError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/student_profile.php?student_id=${encodeURIComponent(studentId)}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load student profile.");
      }

      const nextProfile = data.student || data.profile || sessionStudent;
      setProfile(nextProfile);
      localStorage.setItem("sunshine_student", JSON.stringify(nextProfile));
      localStorage.setItem("sunshine_student_user", JSON.stringify(nextProfile));
      localStorage.setItem("student_id", nextProfile.student_id || nextProfile.username || studentId);
      localStorage.setItem("student_username", nextProfile.username || nextProfile.student_id || studentId);
      localStorage.setItem("student_role", "student");
      localStorage.setItem("student_status", nextProfile.status || "active");
    } catch (error) {
      setProfileError(error.message || "Unable to load student profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!sessionStudent) {
      navigate("/", { replace: true });
      return;
    }

    const studentId = sessionStudent.student_id || sessionStudent.username;
    if (!studentId) {
      return;
    }

    loadProfile(studentId);
  }, [sessionStudent, navigate]);

  if (!sessionStudent) {
    return null;
  }

  const currentStudent = profile || sessionStudent;
  const studentName = getDisplayValue(
    currentStudent.full_name,
    currentStudent.name,
    currentStudent.student_name_en,
    currentStudent.student_name_bn,
    "Student"
  );
  const studentPhotoUrl = getDocumentUrl(
    currentStudent.student_photo ||
      currentStudent.photo ||
      currentStudent.profile_photo ||
      ""
  );

  const profileRows = [
    ["Student ID", getDisplayValue(currentStudent.student_id, currentStudent.username)],
    ["Full Name", studentName],
    ["Bangla Name", getDisplayValue(currentStudent.student_name_bn)],
    ["Branch", getDisplayValue(currentStudent.branch)],
    ["Course", getDisplayValue(currentStudent.course)],
    ["Language Level", getDisplayValue(currentStudent.language_level)],
    ["Admission Date", getDisplayValue(currentStudent.admission_date)],
    ["Mobile", getDisplayValue(currentStudent.student_mobile, currentStudent.mobile, currentStudent.phone)],
    ["Parents Mobile", getDisplayValue(currentStudent.parents_mobile)],
    ["Home Mobile", getDisplayValue(currentStudent.home_mobile)],
    ["Present Address", getDisplayValue(
      currentStudent.present_village,
      currentStudent.present_post,
      currentStudent.present_thana,
      currentStudent.present_district
    )],
    ["Permanent Address", getDisplayValue(
      currentStudent.permanent_village,
      currentStudent.permanent_post,
      currentStudent.permanent_thana,
      currentStudent.permanent_district
    )],
    ["Blood Group", getDisplayValue(currentStudent.blood_group)],
    ["Date of Birth", getDisplayValue(currentStudent.date_of_birth)],
    ["SSC Institute", getDisplayValue(currentStudent.ssc_institute)],
    ["SSC Board", getDisplayValue(currentStudent.ssc_board)],
    ["SSC Roll", getDisplayValue(currentStudent.ssc_roll)],
    ["SSC Registration", getDisplayValue(currentStudent.ssc_registration)],
    ["SSC Group", getDisplayValue(currentStudent.ssc_group)],
    ["SSC Passing Year", getDisplayValue(currentStudent.ssc_passing_year)],
    ["SSC GPA", getDisplayValue(currentStudent.ssc_gpa)],
    ["HSC Institute", getDisplayValue(currentStudent.hsc_institute)],
    ["HSC Board", getDisplayValue(currentStudent.hsc_board)],
    ["HSC Group", getDisplayValue(currentStudent.hsc_group)],
    ["HSC Passing Year", getDisplayValue(currentStudent.hsc_passing_year)],
    ["HSC GPA", getDisplayValue(currentStudent.hsc_gpa)],
    ["Honours Institute", getDisplayValue(currentStudent.honours_institute)],
    ["Honours University", getDisplayValue(currentStudent.honours_university)],
    ["Honours Result", getDisplayValue(currentStudent.honours_result)],
    ["Masters Institute", getDisplayValue(currentStudent.masters_institute)],
    ["Masters University", getDisplayValue(currentStudent.masters_university)],
    ["Passport No", getDisplayValue(currentStudent.passport_no)],
    ["NID No", getDisplayValue(currentStudent.nid_no)],
    ["Birth Registration No", getDisplayValue(currentStudent.birth_registration_no)],
    ["Passport Issue Date", getDisplayValue(currentStudent.passport_issue_date)],
    ["Passport Expiry Date", getDisplayValue(currentStudent.passport_expiry_date)],
    ["Status", getDisplayValue(currentStudent.status, "Active")],
  ];

  const documentCards = [
    {
      key: "official_photo",
      label: "Official Photo",
      field: "student_photo",
      value: currentStudent.student_photo,
      accept: "image/*",
    },
    {
      key: "passport",
      label: "Passport",
      field: "passport_scan",
      value: currentStudent.passport_scan,
      accept: ".pdf,image/*",
    },
    {
      key: "nid",
      label: "NID",
      field: "nid_scan",
      value: currentStudent.nid_scan,
      accept: ".pdf,image/*",
    },
    {
      key: "birth_registration",
      label: "Birth Registration",
      field: "birth_registration_scan",
      value: currentStudent.birth_registration_scan,
      accept: ".pdf,image/*",
    },
  ];

  const handleDocumentUpload = async (documentKey, file) => {
    if (!file) {
      return;
    }

    const studentId = currentStudent.student_id || currentStudent.username;
    if (!studentId) {
      setUploadError("Student session is missing. Please log in again.");
      return;
    }

    setUploadingDoc(documentKey);
    setUploadError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("student_id", studentId);

      if (documentKey === "official_photo") {
        formData.append("studentPhoto", file, file.name);
      }

      if (documentKey === "passport") {
        formData.append("passportScan", file, file.name);
      }

      if (documentKey === "nid") {
        formData.append("nidScan", file, file.name);
      }

      if (documentKey === "birth_registration") {
        formData.append("birthRegistrationScan", file, file.name);
      }

      const response = await fetch(`${API_BASE_URL}/student_update_documents.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save document.");
      }

      const nextProfile = data.student || data.profile || currentStudent;
      setProfile(nextProfile);
      setUploadMessage(`${documentKey === "official_photo" ? "Official Photo" : documentKey === "passport" ? "Passport" : documentKey === "nid" ? "NID" : "Birth Registration"} updated successfully.`);
      localStorage.setItem("sunshine_student", JSON.stringify(nextProfile));
      localStorage.setItem("sunshine_student_user", JSON.stringify(nextProfile));
      localStorage.setItem("student_id", nextProfile.student_id || nextProfile.username || studentId);
      localStorage.setItem("student_username", nextProfile.username || nextProfile.student_id || studentId);
      localStorage.setItem("student_role", "student");
      localStorage.setItem("student_status", nextProfile.status || "active");
    } catch (error) {
      setUploadError(error.message || "The document could not be updated.");
    } finally {
      setUploadingDoc("");
    }
  };

  const handleLogout = () => {
    clearStudentAuthStorage();
    navigate("/", { replace: true });
  };

  return (
    <div className="student-portal-page">
      <div className="student-portal-shell">
        <header className="student-portal-header">
          <div>
            <p className="student-portal-kicker">Student Portal</p>
            <h1>Welcome, {studentName}</h1>
          </div>

          <button
            type="button"
            className="student-portal-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        {loadingProfile && (
          <div className="student-portal-card">
            <p>Loading your complete profile...</p>
          </div>
        )}

        {profileError && (
          <div className="student-portal-card student-portal-error">
            <p>{profileError}</p>
          </div>
        )}

        {!loadingProfile && !profileError && (
          <>
            <section className="student-portal-grid">
              <div className="student-portal-card profile-card">
                <h2>Profile Overview</h2>

                <div className="student-portal-profile-header">
                  <div className="student-portal-photo-box">
                    {studentPhotoUrl ? (
                      <img src={studentPhotoUrl} alt={studentName} />
                    ) : (
                      <div className="student-portal-no-photo">No Photo</div>
                    )}
                  </div>

                  <div className="student-portal-basic-info">
                    <h3>{studentName}</h3>
                    <p>{getDisplayValue(currentStudent.student_name_bn)}</p>
                    <div className="student-portal-tags">
                      <span>{getDisplayValue(currentStudent.branch)}</span>
                      <span>{getDisplayValue(currentStudent.course)}</span>
                      <span>{getDisplayValue(currentStudent.language_level)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="student-portal-card">
                <h2>Complete Student Details</h2>

                {profileRows.map(([label, value]) => (
                  <div className="student-portal-row" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="student-portal-document-section">
              <div className="student-portal-card">
                <h2>Upload & Update Documents</h2>

                {(uploadMessage || uploadError) && (
                  <div className={`student-portal-message ${uploadError ? "error" : "success"}`}>
                    {uploadError || uploadMessage}
                  </div>
                )}

                <div className="student-portal-doc-grid">
                  {documentCards.map((card) => {
                    const docUrl = getDocumentUrl(card.value);

                    return (
                      <div className="student-portal-doc-card" key={card.key}>
                        <div className="student-portal-doc-header">
                          <div>
                            <p className="student-portal-doc-label">{card.label}</p>
                            <strong>{getDocumentName(card.value)}</strong>
                          </div>
                          <span className="student-portal-doc-badge">{card.accept.includes("pdf") ? "PDF" : "Image"}</span>
                        </div>

                        <div className="student-portal-doc-preview">
                          {docUrl ? (
                            docUrl.toLowerCase().endsWith(".pdf") ? (
                              <div className="student-portal-doc-pdf">PDF</div>
                            ) : (
                              <img src={docUrl} alt={card.label} />
                            )
                          ) : (
                            <div className="student-portal-doc-placeholder">No file uploaded</div>
                          )}
                        </div>

                        <label className="student-portal-upload-btn">
                          <input
                            type="file"
                            accept={card.accept}
                            hidden
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                handleDocumentUpload(card.key, file);
                              }
                              event.target.value = "";
                            }}
                          />
                          {uploadingDoc === card.key ? "Uploading..." : `Update ${card.label}`}
                        </label>

                        {docUrl && (
                          <a className="student-portal-doc-link" href={docUrl} target="_blank" rel="noreferrer">
                            View file
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
