import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import {
  clearStudentAuthStorage,
  readStudentSession,
} from "../admin/authStorage";
import "./StudentPortal.css";


/* =====================================================
   DISPLAY VALUE
===================================================== */

const getDisplayValue = (...values) => {
  for (const value of values) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    const text = String(value).trim();

    if (text !== "") {
      return text;
    }
  }

  return "—";
};


/* =====================================================
   FILE URL
   ONLY USED FOR OFFICIAL PHOTO
===================================================== */

const getFileUrl = (file) => {
  if (!file) {
    return null;
  }

  const cleanFile =
    String(file).trim();

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

  const relativePath =
    cleanFile
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


/* =====================================================
   DATE
===================================================== */

const formatDate = (value) => {
  if (
    !value ||
    value === "0000-00-00"
  ) {
    return "—";
  }

  return String(value);
};


/* =====================================================
   DOCUMENT NAME
   NO DOCUMENT PREVIEW
===================================================== */

const getDocumentName = (value) => {
  if (!value) {
    return "Not uploaded";
  }

  const cleanValue =
    String(value).trim();

  if (!cleanValue) {
    return "Not uploaded";
  }

  const fileName =
    cleanValue.split("/").pop();

  return fileName || "Uploaded";
};

/* =====================================================
   PROFILE COMPLETION
===================================================== */

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;

  const text = String(value).trim();
  if (!text || text === "0000-00-00" || text === "—") {
    return false;
  }

  return true;
};

const profileCompletionCategories = [
  {
    key: "personal",
    icon: "👤",
    title: "Personal Information",
    target: "personal-information",
    fields: [
      ["student_name_bn", "বাংলা নাম"],
      ["student_name_en", "English Name"],
      ["date_of_birth", "Date of Birth"],
      ["gender", "Gender"],
      ["nationality", "Nationality"],
      ["katakana_name", "Katakana Name"],
    ],
  },
  {
    key: "contact",
    icon: "📞",
    title: "Address & Contact",
    target: "contact-information",
    fields: [
      ["student_mobile", "Student Mobile"],
      ["email", "Email"],
      ["present_village", "Present Village"],
      ["present_post", "Present Post"],
      ["present_thana", "Present Thana"],
      ["present_district", "Present District"],
      ["permanent_village", "Permanent Village"],
      ["permanent_post", "Permanent Post"],
      ["permanent_thana", "Permanent Thana"],
      ["permanent_district", "Permanent District"],
      ["emergency_contact", "Emergency Contact"],
      ["emergency_relationship", "Emergency Relationship"],
    ],
  },
  {
    key: "family",
    icon: "👨‍👩‍👧",
    title: "Family Information",
    target: "family-information",
    fields: [
      ["father_name", "Father's Name"],
      ["mother_name", "Mother's Name"],
      ["family_members", "Family Members"],
    ],
  },
  {
    key: "education",
    icon: "🎓",
    title: "Education",
    target: "education-information",
    fields: [
      ["ssc_institute", "SSC Institute"],
      ["ssc_board", "SSC Board"],
      ["ssc_passing_year", "SSC Passing Year"],
      ["ssc_gpa", "SSC GPA"],
      ["hsc_institute", "HSC Institute"],
      ["hsc_board", "HSC Board"],
      ["hsc_passing_year", "HSC Passing Year"],
      ["hsc_gpa", "HSC GPA"],
    ],
  },
  {
    key: "work_language",
    icon: "💼",
    title: "Work & Language",
    target: "work-language-information",
    fields: [
      ["work_history", "Work History"],
      ["japanese_test_history", "Japanese Test History"],
      ["english_level", "English Level"],
      ["strengths", "Strengths"],
      ["weaknesses", "Weaknesses"],
      ["hobby", "Hobby"],
    ],
  },
  {
    key: "japan",
    icon: "🇯🇵",
    title: "Japan / Future Plan",
    target: "japan-future-information",
    fields: [
      ["japan_application_reason", "Japan Application Reason"],
      ["family_opinion", "Family Opinion"],
      ["remittance_plan", "Remittance Plan"],
      ["post_japan_work_plan", "Post-Japan Work Plan"],
      ["previous_coe_application", "Previous COE Application"],
    ],
  },
  {
    key: "skills",
    icon: "🛠️",
    title: "Skills & Lifestyle",
    target: "skills-information",
    fields: [
      ["driving_license", "Driving License"],
      ["international_driving_license", "International Driving License"],
      ["bicycle_riding", "Bicycle Riding"],
      ["cooking", "Cooking"],
      ["group_living", "Group Living"],
    ],
  },
  {
    key: "documents",
    icon: "📄",
    title: "Passport & Documents",
    target: "document-update",
    fields: [
      ["passport_no", "Passport No"],
      ["passport_issue_date", "Passport Issue Date"],
      ["passport_expiry_date", "Passport Expiry Date"],
      ["passport_scan", "Passport Scan"],
      ["nid_no", "NID No"],
      ["nid_scan", "NID Scan"],
      ["birth_registration_no", "Birth Registration No"],
      ["birth_registration_scan", "Birth Registration Scan"],
    ],
  },
  {
    key: "financial",
    icon: "💰",
    title: "Financial Information",
    target: "financial-information",
    fields: [
      ["debt", "Debt"],
      ["household_monthly_income", "Household Monthly Income"],
    ],
  },
  {
    key: "other",
    icon: "🕌",
    title: "Other Information",
    target: "other-information",
    fields: [
      ["religion", "Religion"],
      ["worship", "Worship"],
      ["fasting", "Fasting"],
      ["marital_status", "Marital Status"],
      ["blood_group", "Blood Group"],
    ],
  },
  {
    key: "resume",
    icon: "📋",
    title: "Resume / Consent",
    target: "resume-information",
    fields: [
      ["resume_other", "Resume Other"],
      ["resume_consent", "Resume Consent"],
      ["resume_consent_date", "Consent Date"],
    ],
  },
  {
    key: "physical",
    icon: "🧍",
    title: "Physical / Personal",
    target: "physical-information",
    fields: [
      ["height_cm", "Height"],
      ["weight_kg", "Weight"],
      ["dominant_hand", "Dominant Hand"],
      ["tattoo", "Tattoo"],
      ["eyesight", "Eyesight"],
      ["smoking", "Smoking"],
      ["alcohol", "Alcohol"],
    ],
  },
  {
    key: "admin",
    icon: "🏫",
    title: "Sunshine / Admin Information",
    target: "course-information",
    fields: [
      ["student_id", "Student ID"],
      ["admission_date", "Admission Date"],
      ["branch", "Branch"],
      ["course", "Course"],
      ["language_level", "Language Level"],
      ["assigned_teacher_id", "Assigned Teacher"],
    ],
  },
];


export default function StudentPortal() {
  const navigate = useNavigate();

  const sessionStudent = useMemo(
    () => readStudentSession(),
    []
  );

  const [profile, setProfile] =
    useState(() => readStudentSession());

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [uploadingDoc, setUploadingDoc] =
    useState("");

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  const loadProfile = async (studentId) => {
    if (!studentId) {
      return;
    }

    setLoadingProfile(true);
    setProfileError("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/student_profile.php?student_id=${encodeURIComponent(
            studentId
          )}`,
          {
            credentials: "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load student profile."
        );
      }

      const nextProfile =
        data.student ||
        data.profile ||
        sessionStudent;

      setProfile(nextProfile);

      localStorage.setItem(
        "sunshine_student",
        JSON.stringify(nextProfile)
      );

      localStorage.setItem(
        "sunshine_student_user",
        JSON.stringify(nextProfile)
      );

      localStorage.setItem(
        "student_id",
        nextProfile.student_id ||
          nextProfile.username ||
          studentId
      );

      localStorage.setItem(
        "student_username",
        nextProfile.username ||
          nextProfile.student_id ||
          studentId
      );

      localStorage.setItem(
        "student_role",
        "student"
      );

      localStorage.setItem(
        "student_status",
        nextProfile.status ||
          "active"
      );

    } catch (error) {

      console.error(
        "Student profile error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to load student profile."
      );

    } finally {
      setLoadingProfile(false);
    }
  };


  /* =====================================================
     INITIAL PROFILE LOAD
  ===================================================== */

  useEffect(() => {

    if (!sessionStudent) {

      navigate("/", {
        replace: true,
      });

      return;
    }

    const studentId =
      sessionStudent.student_id ||
      sessionStudent.username;

    if (!studentId) {
      return;
    }

    loadProfile(studentId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionStudent,
    navigate,
  ]);


  /* =====================================================
     SESSION CHECK
  ===================================================== */

  if (!sessionStudent) {
    return null;
  }


  const currentStudent =
    profile || sessionStudent;


  const completionData = useMemo(() => {
    const categories = profileCompletionCategories.map((category) => {
      const missing = category.fields
        .filter(([field]) => !isFilled(currentStudent?.[field]))
        .map(([, label]) => label);

      const total = category.fields.length;
      const completed = total - missing.length;
      const percent = total
        ? Math.round((completed / total) * 100)
        : 0;

      return {
        ...category,
        total,
        completed,
        percent,
        missing,
      };
    });

    const totalFields = categories.reduce(
      (sum, category) => sum + category.total,
      0
    );

    const completedFields = categories.reduce(
      (sum, category) => sum + category.completed,
      0
    );

    return {
      categories,
      overall: totalFields
        ? Math.round((completedFields / totalFields) * 100)
        : 0,
    };
  }, [currentStudent]);

  const scrollToSection = (target) => {
    const element = document.getElementById(target);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getCompletionStatus = (percent) => {
    if (percent >= 100) {
      return {
        text: "সম্পূর্ণ",
        className: "complete",
      };
    }

    if (percent > 0) {
      return {
        text: "অসম্পূর্ণ",
        className: "incomplete",
      };
    }

    return {
      text: "তথ্য নেই",
      className: "empty",
    };
  };


  /* =====================================================
     NAME
  ===================================================== */

  const studentName =
    getDisplayValue(
      currentStudent.full_name,
      currentStudent.name,
      currentStudent.student_name_en,
      currentStudent.student_name_bn,
      "Student"
    );


  /* =====================================================
     OFFICIAL PHOTO
===================================================== */

  const studentPhotoUrl =
    getFileUrl(
      currentStudent.student_photo ||
        currentStudent.photo ||
        currentStudent.profile_photo ||
        ""
    );


  /* =====================================================
     DOCUMENT UPLOADS
===================================================== */

  const documentCards = [

    {
      key: "official_photo",
      label: "Official Photo",
      field: "student_photo",
      value:
        currentStudent.student_photo,
      accept: "image/*",
    },

    {
      key: "passport",
      label: "Passport",
      field: "passport_scan",
      value:
        currentStudent.passport_scan,
      accept: ".pdf,image/*",
    },

    {
      key: "nid",
      label: "NID",
      field: "nid_scan",
      value:
        currentStudent.nid_scan,
      accept: ".pdf,image/*",
    },

    {
      key: "birth_registration",
      label: "Birth Registration",
      field:
        "birth_registration_scan",
      value:
        currentStudent.birth_registration_scan,
      accept: ".pdf,image/*",
    },
  ];


  /* =====================================================
     DOCUMENT LABEL
===================================================== */

  const getDocumentLabel = (key) => {

    switch (key) {

      case "official_photo":
        return "Official Photo";

      case "passport":
        return "Passport";

      case "nid":
        return "NID";

      case "birth_registration":
        return "Birth Registration";

      default:
        return "Document";
    }
  };


  /* =====================================================
     UPLOAD
===================================================== */

  const handleDocumentUpload =
    async (
      documentKey,
      file
    ) => {

      if (!file) {
        return;
      }

      const studentId =
        currentStudent.student_id ||
        currentStudent.username;

      if (!studentId) {

        setUploadError(
          "Student session is missing. Please log in again."
        );

        return;
      }

      setUploadingDoc(
        documentKey
      );

      setUploadError("");
      setUploadMessage("");

      try {

        const formData =
          new FormData();

        formData.append(
          "student_id",
          studentId
        );


        if (
          documentKey ===
          "official_photo"
        ) {

          formData.append(
            "studentPhoto",
            file,
            file.name
          );
        }


        if (
          documentKey ===
          "passport"
        ) {

          formData.append(
            "passportScan",
            file,
            file.name
          );
        }


        if (
          documentKey ===
          "nid"
        ) {

          formData.append(
            "nidScan",
            file,
            file.name
          );
        }


        if (
          documentKey ===
          "birth_registration"
        ) {

          formData.append(
            "birthRegistrationScan",
            file,
            file.name
          );
        }


        const response =
          await fetch(
            `${API_BASE_URL}/student_update_documents.php`,
            {
              method: "POST",

              credentials:
                "include",

              body: formData,
            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
              "Unable to save document."
          );
        }


        const nextProfile =
          data.student ||
          data.profile ||
          currentStudent;


        setProfile(
          nextProfile
        );


        localStorage.setItem(
          "sunshine_student",
          JSON.stringify(
            nextProfile
          )
        );

        localStorage.setItem(
          "sunshine_student_user",
          JSON.stringify(
            nextProfile
          )
        );

        localStorage.setItem(
          "student_id",
          nextProfile.student_id ||
            nextProfile.username ||
            studentId
        );

        localStorage.setItem(
          "student_username",
          nextProfile.username ||
            nextProfile.student_id ||
            studentId
        );

        localStorage.setItem(
          "student_role",
          "student"
        );

        localStorage.setItem(
          "student_status",
          nextProfile.status ||
            "active"
        );


        setUploadMessage(
          `${getDocumentLabel(
            documentKey
          )} updated successfully.`
        );

      } catch (error) {

        console.error(
          "Document upload error:",
          error
        );

        setUploadError(
          error.message ||
            "The document could not be updated."
        );

      } finally {

        setUploadingDoc("");
      }
    };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    clearStudentAuthStorage();

    navigate("/", {
      replace: true,
    });
  };


  /* =====================================================
     PROFILE ROW DATA
  ===================================================== */

  const personalRows = [

    [
      "Student ID",
      getDisplayValue(
        currentStudent.student_id,
        currentStudent.username
      ),
    ],

    [
      "Short Name",
      getDisplayValue(
        currentStudent.short_name
      ),
    ],

    [
      "Father's Name",
      getDisplayValue(
        currentStudent.father_name
      ),
    ],

    [
      "Mother's Name",
      getDisplayValue(
        currentStudent.mother_name
      ),
    ],

    [
      "Date of Birth",
      formatDate(
        currentStudent.date_of_birth
      ),
    ],

    [
      "Blood Group",
      getDisplayValue(
        currentStudent.blood_group
      ),
    ],

    [
      "Admission Date",
      formatDate(
        currentStudent.admission_date
      ),
    ],

  ];


  const contactRows = [

    [
      "Student Mobile",
      getDisplayValue(
        currentStudent.student_mobile,
        currentStudent.mobile,
        currentStudent.phone
      ),
    ],

    [
      "Parents Mobile",
      getDisplayValue(
        currentStudent.parents_mobile
      ),
    ],

    [
      "Home Mobile",
      getDisplayValue(
        currentStudent.home_mobile
      ),
    ],

    [
      "Email",
      getDisplayValue(
        currentStudent.email
      ),
    ],

  ];


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="student-portal">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="student-portal-header no-print">

        <div>

          <h1>
            Student Portal
          </h1>

          <p>
            আপনার সম্পূর্ণ শিক্ষার্থী প্রোফাইল
          </p>

        </div>


        <button
          type="button"
          className="student-portal-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {loadingProfile && (

        <div className="student-portal-message-card no-print">
          Loading student profile...
        </div>

      )}


      {profileError && (

        <div className="student-portal-error-card no-print">
          {profileError}
        </div>

      )}


      {!loadingProfile &&
        !profileError && (

          <div className="student-portal-card">

            {/* =================================================
                PROFILE TOP
            ================================================= */}

            <div className="student-profile-top">

              <div className="student-profile-photo-box">

                {studentPhotoUrl ? (

                  <img
                    src={
                      studentPhotoUrl
                    }
                    alt={
                      studentName
                    }
                  />

                ) : (

                  <div className="student-profile-no-photo">
                    No Photo
                  </div>

                )}

              </div>


              <div className="student-profile-basic">

                <h2>
                  {studentName}
                </h2>

                {currentStudent.student_name_bn && (

                  <p className="student-bangla-name">
                    {
                      currentStudent.student_name_bn
                    }
                  </p>

                )}


                <div className="student-profile-id">

                  <span>
                    Student ID:
                  </span>

                  <strong>
                    {getDisplayValue(
                      currentStudent.student_id,
                      currentStudent.username
                    )}
                  </strong>

                </div>


                <div className="student-profile-tags">

                  <span>
                    {getDisplayValue(
                      currentStudent.branch
                    )}
                  </span>

                  <span>
                    {getDisplayValue(
                      currentStudent.course
                    )}
                  </span>

                  <span>
                    {getDisplayValue(
                      currentStudent.language_level
                    )}
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                PROFILE COMPLETION
            ================================================= */}

            <section className="student-completion-section no-print">
              <div className="student-completion-header">
                <div>
                  <h3>Profile Completion</h3>
                  <p>
                    আপনার প্রোফাইলের কোন তথ্য সম্পূর্ণ এবং কোন তথ্য বাকি আছে
                    তা এখানে দেখুন।
                  </p>
                </div>

                <div className="student-completion-score">
                  <strong>{completionData.overall}%</strong>
                  <span>সম্পূর্ণ</span>
                </div>
              </div>

              <div className="student-completion-progress">
                <div
                  className="student-completion-progress-bar"
                  style={{
                    width: `${completionData.overall}%`,
                  }}
                />
              </div>

              <div className="student-completion-grid">
                {completionData.categories.map((category) => {
                  const status =
                    getCompletionStatus(category.percent);

                  return (
                    <div
                      className={`student-completion-card ${status.className}`}
                      key={category.key}
                    >
                      <div className="student-completion-card-top">
                        <div className="student-completion-icon">
                          {category.icon}
                        </div>

                        <div className="student-completion-title">
                          <h4>{category.title}</h4>
                          <span>
                            {category.completed}/{category.total} তথ্য পূরণ
                          </span>
                        </div>

                        <strong className="student-completion-percent">
                          {category.percent}%
                        </strong>
                      </div>

                      <div className="student-completion-mini-progress">
                        <div
                          style={{
                            width: `${category.percent}%`,
                          }}
                        />
                      </div>

                      <div className="student-completion-status">
                        <span className={`status-badge ${status.className}`}>
                          {status.text}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            scrollToSection(category.target)
                          }
                        >
                          {category.percent >= 100
                            ? "দেখুন"
                            : "এখনই পূরণ করুন"}
                        </button>
                      </div>

                      {category.missing.length > 0 && (
                        <div className="student-completion-missing">
                          <strong>বাকি তথ্য:</strong>
                          <div>
                            {category.missing
                              .slice(0, 4)
                              .map((item) => (
                                <span key={item}>
                                  {item}
                                </span>
                              ))}
                            {category.missing.length > 4 && (
                              <span>
                                +{category.missing.length - 4} আরও
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="student-completion-note">
                ℹ️ 100% সম্পূর্ণ করার জন্য শুধু এই তালিকায় নির্ধারিত
                প্রয়োজনীয় তথ্যগুলো পূরণ করা হয়েছে। Optional তথ্য খালি থাকলেও
                Profile 100% হতে পারবে।
              </div>
            </section>


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section id="personal-information" className="student-profile-section">

              <h3>
                Personal Information
              </h3>

              <div className="student-info-table">

                {personalRows.map(
                  ([label, value]) => (

                    <div
                      className="student-info-row"
                      key={label}
                    >

                      <div className="student-info-label">
                        {label}
                      </div>

                      <div className="student-info-value">
                        {value}
                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* =================================================
                CONTACT
            ================================================= */}

            <section id="contact-information" className="student-profile-section">

              <h3>
                Contact Information
              </h3>

              <div className="student-contact-table">

                {contactRows.map(
                  ([label, value]) => (

                    <div
                      className="student-contact-item"
                      key={label}
                    >

                      <label>
                        {label}
                      </label>

                      <p>
                        {value}
                      </p>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* =================================================
                COURSE
            ================================================= */}

            <section id="course-information" className="student-profile-section">

              <h3>
                Course Information
              </h3>

              <div className="student-info-table">

                <div className="student-info-row">

                  <div className="student-info-label">
                    Branch
                  </div>

                  <div className="student-info-value">
                    {getDisplayValue(
                      currentStudent.branch
                    )}
                  </div>

                </div>


                <div className="student-info-row">

                  <div className="student-info-label">
                    Course
                  </div>

                  <div className="student-info-value">
                    {getDisplayValue(
                      currentStudent.course
                    )}
                  </div>

                </div>


                <div className="student-info-row">

                  <div className="student-info-label">
                    Language Level
                  </div>

                  <div className="student-info-value">
                    {getDisplayValue(
                      currentStudent.language_level
                    )}
                  </div>

                </div>


                <div className="student-info-row">

                  <div className="student-info-label">
                    Course Fee
                  </div>

                  <div className="student-info-value">
                    ৳{" "}
                    {Number(
                      currentStudent.course_fee ||
                        0
                    ).toLocaleString(
                      "en-BD"
                    )}
                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                ADDRESS
            ================================================= */}

            <section id="contact-information" className="student-profile-section">

              <h3>
                Address Information
              </h3>

              <div className="student-address-table">

                <div className="student-address-row student-address-header">

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


                <div className="student-address-row">

                  <div className="student-address-type">
                    Present
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.present_village
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.present_post
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.present_thana
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.present_district
                    )}
                  </div>

                </div>


                <div className="student-address-row">

                  <div className="student-address-type">
                    Permanent
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.permanent_village
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.permanent_post
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.permanent_thana
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.permanent_district
                    )}
                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                EDUCATION
            ================================================= */}

            <section id="education-information" className="student-profile-section">

              <h3>
                Educational Qualification
              </h3>

              <div className="student-education-table">

                <div className="student-education-row student-education-header">

                  <div>Exam</div>
                  <div>Institute / University</div>
                  <div>Board</div>
                  <div>Roll</div>
                  <div>Registration</div>
                  <div>Group / Subject</div>
                  <div>Year</div>
                  <div>Result</div>

                </div>


                {/* SSC */}

                <div className="student-education-row">

                  <div className="student-education-exam">
                    SSC
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_institute
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_board
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_roll
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_registration
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_group
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_passing_year
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.ssc_gpa
                    )}
                  </div>

                </div>


                {/* HSC */}

                <div className="student-education-row">

                  <div className="student-education-exam">
                    HSC
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_institute
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_board
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_roll
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_registration
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_group
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_passing_year
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.hsc_gpa
                    )}
                  </div>

                </div>


                {/* HONOURS */}

                <div className="student-education-row">

                  <div className="student-education-exam">
                    Honours
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_institute,
                      currentStudent.honours_university
                    )}
                  </div>

                  <div>
                    —
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_roll
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_registration
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_group
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_passing_year
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.honours_result
                    )}
                  </div>

                </div>


                {/* MASTERS */}

                <div className="student-education-row">

                  <div className="student-education-exam">
                    Masters
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_institute,
                      currentStudent.masters_university
                    )}
                  </div>

                  <div>
                    —
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_roll
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_registration
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_group
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_passing_year
                    )}
                  </div>

                  <div>
                    {getDisplayValue(
                      currentStudent.masters_result
                    )}
                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                PASSPORT
            ================================================= */}

            <section id="passport-information" className="student-profile-section">

              <h3>
                Passport Information
              </h3>

              <div className="student-passport-row">

                <div className="student-passport-item">

                  <div className="student-passport-label">
                    Passport No
                  </div>

                  <div className="student-passport-value">
                    {getDisplayValue(
                      currentStudent.passport_no
                    )}
                  </div>

                </div>


                <div className="student-passport-item">

                  <div className="student-passport-label">
                    Issue Date
                  </div>

                  <div className="student-passport-value">
                    {formatDate(
                      currentStudent.passport_issue_date
                    )}
                  </div>

                </div>


                <div className="student-passport-item">

                  <div className="student-passport-label">
                    Expiry Date
                  </div>

                  <div className="student-passport-value">
                    {formatDate(
                      currentStudent.passport_expiry_date
                    )}
                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                NID / BIRTH REGISTRATION
            ================================================= */}

            <section id="documents-information" className="student-profile-section">

              <h3>
                Other Identification
              </h3>

              <div className="student-info-table">

                <div className="student-info-row">

                  <div className="student-info-label">
                    NID No
                  </div>

                  <div className="student-info-value">
                    {getDisplayValue(
                      currentStudent.nid_no
                    )}
                  </div>

                </div>


                <div className="student-info-row">

                  <div className="student-info-label">
                    Birth Registration No
                  </div>

                  <div className="student-info-value">
                    {getDisplayValue(
                      currentStudent.birth_registration_no
                    )}
                  </div>

                </div>

              </div>

            </section>



            <div className="student-profile-completion-anchors no-print">
              <div id="family-information" />
              <div id="work-language-information" />
              <div id="japan-future-information" />
              <div id="skills-information" />
              <div id="financial-information" />
              <div id="other-information" />
              <div id="resume-information" />
              <div id="physical-information" />
            </div>

            {/* =================================================
                DOCUMENT UPDATE
            ================================================= */}

            <section id="document-update" className="student-profile-section no-print">

              <h3>
                Document Update
              </h3>


              {(
                uploadMessage ||
                uploadError
              ) && (

                <div
                  className={
                    uploadError
                      ? "student-document-message error"
                      : "student-document-message success"
                  }
                >
                  {
                    uploadError ||
                    uploadMessage
                  }
                </div>

              )}


              <div className="student-document-grid">

                {documentCards.map(
                  (card) => (

                    <div
                      className="student-document-card"
                      key={card.key}
                    >

                      <div className="student-document-icon">

                        {card.key ===
                          "official_photo" && "📷"}

                        {card.key ===
                          "passport" && "🛂"}

                        {card.key ===
                          "nid" && "🪪"}

                        {card.key ===
                          "birth_registration" &&
                          "📄"}

                      </div>


                      <div className="student-document-content">

                        <h4>
                          {card.label}
                        </h4>

                        <p>
                          {getDocumentName(
                            card.value
                          )}
                        </p>


                        <label className="student-document-button">

                          <input
                            type="file"
                            accept={card.accept}
                            hidden
                            disabled={
                              uploadingDoc ===
                              card.key
                            }
                            onChange={(
                              event
                            ) => {

                              const file =
                                event
                                  .target
                                  .files?.[0];

                              if (file) {

                                handleDocumentUpload(
                                  card.key,
                                  file
                                );
                              }

                              event.target.value =
                                "";
                            }}
                          />

                          {uploadingDoc ===
                          card.key
                            ? "Uploading..."
                            : card.value
                            ? "Update"
                            : "Upload"}

                        </label>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="student-profile-footer">

              <span>
                Sunshine Education
              </span>

              <span>
                Student Portal
              </span>

            </div>

          </div>
        )}

    </div>
  );
}