import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL, { API_ORIGIN } from "../config/api";

import {
  clearStudentAuthStorage,
  readStudentSession,
} from "../admin/authStorage";

import "./StudentPortal.css";

/* =====================================================
   ALL STUDENT TABLE FIELDS
===================================================== */

const STUDENT_FIELDS = [
  ["student_id", "Student ID", "text", true],
  ["admission_date", "Admission Date", "date", true],
  ["branch", "Branch", "text"],
  ["course", "Course", "text"],
  ["language_level", "Language Level", "text"],
  ["assigned_teacher_id", "Assigned Teacher ID", "text", true],
  ["teacher_id", "Teacher ID", "text", true],
  ["teacher_name", "Teacher Name", "text", true],

  ["student_name_bn", "বাংলা নাম", "text"],
  ["student_name_en", "English Name", "text"],
  ["short_name", "Short Name", "text"],
  ["father_name", "Father's Name", "text"],
  ["mother_name", "Mother's Name", "text"],
  ["date_of_birth", "Date of Birth", "date"],
  ["blood_group", "Blood Group", "text"],
  ["gender", "Gender", "text"],
  ["nationality", "Nationality", "text"],
  ["katakana_name", "Katakana Name", "text"],
  ["marital_status", "Marital Status", "text"],

  ["present_village", "Present Village", "text"],
  ["present_post", "Present Post", "text"],
  ["present_thana", "Present Thana", "text"],
  ["present_district", "Present District", "text"],
  ["permanent_village", "Permanent Village", "text"],
  ["permanent_post", "Permanent Post", "text"],
  ["permanent_thana", "Permanent Thana", "text"],
  ["permanent_district", "Permanent District", "text"],

  ["student_mobile", "Student Mobile", "text"],
  ["parents_mobile", "Parents Mobile", "text"],
  ["home_mobile", "Home Mobile", "text"],
  ["email", "Email", "email"],
  ["emergency_contact", "Emergency Contact", "text"],
  ["emergency_relationship", "Emergency Relationship", "text"],
  ["course_fee", "Course Fee", "number"],

  ["ssc_institute", "SSC Institute", "text"],
  ["ssc_board", "SSC Board", "text"],
  ["ssc_roll", "SSC Roll", "text"],
  ["ssc_registration", "SSC Registration", "text"],
  ["ssc_group", "SSC Group", "text"],
  ["ssc_passing_year", "SSC Passing Year", "number"],
  ["ssc_gpa", "SSC GPA", "text"],
  ["ssc_period", "SSC Period", "text"],
  ["ssc_school_type", "SSC School Type", "text"],
  ["ssc_major", "SSC Major", "text"],

  ["hsc_institute", "HSC Institute", "text"],
  ["hsc_board", "HSC Board", "text"],
  ["hsc_roll", "HSC Roll", "text"],
  ["hsc_registration", "HSC Registration", "text"],
  ["hsc_group", "HSC Group", "text"],
  ["hsc_passing_year", "HSC Passing Year", "number"],
  ["hsc_gpa", "HSC GPA", "text"],
  ["hsc_period", "HSC Period", "text"],
  ["hsc_school_type", "HSC School Type", "text"],
  ["hsc_major", "HSC Major", "text"],

  ["honours_institute", "Honours Institute", "text"],
  ["honours_university", "Honours University", "text"],
  ["honours_roll", "Honours Roll", "text"],
  ["honours_registration", "Honours Registration", "text"],
  ["honours_group", "Honours Group", "text"],
  ["honours_passing_year", "Honours Passing Year", "number"],
  ["honours_result", "Honours Result", "text"],
  ["honours_period", "Honours Period", "text"],
  ["honours_school_type", "Honours School Type", "text"],
  ["honours_major", "Honours Major", "text"],

  ["masters_institute", "Masters Institute", "text"],
  ["masters_university", "Masters University", "text"],
  ["masters_roll", "Masters Roll", "text"],
  ["masters_registration", "Masters Registration", "text"],
  ["masters_group", "Masters Group", "text"],
  ["masters_passing_year", "Masters Passing Year", "number"],
  ["masters_result", "Masters Result", "text"],
  ["masters_period", "Masters Period", "text"],
  ["masters_school_type", "Masters School Type", "text"],
  ["masters_major", "Masters Major", "text"],

  ["additional_education", "Additional Education", "textarea"],
  ["work_history", "Work History", "textarea"],
  ["japanese_test_history", "Japanese Test History", "textarea"],
  ["english_level", "English Level", "text"],
  ["strengths", "Strengths", "textarea"],
  ["weaknesses", "Weaknesses", "textarea"],
  ["hobby", "Hobby", "textarea"],

  ["group_living", "Group Living", "text"],
  ["cooking", "Cooking", "text"],
  ["religion", "Religion", "text"],
  ["worship", "Worship", "text"],
  ["fasting", "Fasting", "text"],
  ["debt", "Debt", "text"],
  ["household_monthly_income", "Household Monthly Income", "number"],
  ["family_members", "Family Members", "number"],

  ["japan_application_reason", "Japan Application Reason", "textarea"],
  ["family_opinion", "Family Opinion", "textarea"],
  ["remittance_plan", "Remittance Plan", "textarea"],
  ["post_japan_work_plan", "Post Japan Work Plan", "textarea"],

  ["driving_license", "Driving License", "text"],
  ["international_driving_license", "International Driving License", "text"],
  ["bicycle_riding", "Bicycle Riding", "text"],
  ["previous_coe_application", "Previous COE Application", "text"],
  ["resume_other", "Resume Other", "textarea"],
  ["resume_consent", "Resume Consent", "text"],
  ["resume_consent_date", "Resume Consent Date", "date"],

  ["height_cm", "Height (cm)", "number"],
  ["weight_kg", "Weight (kg)", "number"],
  ["dominant_hand", "Dominant Hand", "text"],
  ["tattoo", "Tattoo", "text"],
  ["eyesight", "Eyesight", "text"],
  ["smoking", "Smoking", "text"],
  ["alcohol", "Alcohol", "text"],

  ["family_1_name", "Family 1 Name", "text"],
  ["family_1_relationship", "Family 1 Relationship", "text"],
  ["family_1_age", "Family 1 Age", "number"],
  ["family_1_occupation", "Family 1 Occupation", "text"],
  ["family_1_living_status", "Family 1 Living Status", "text"],

  ["family_2_name", "Family 2 Name", "text"],
  ["family_2_relationship", "Family 2 Relationship", "text"],
  ["family_2_age", "Family 2 Age", "number"],
  ["family_2_occupation", "Family 2 Occupation", "text"],
  ["family_2_living_status", "Family 2 Living Status", "text"],

  ["family_3_name", "Family 3 Name", "text"],
  ["family_3_relationship", "Family 3 Relationship", "text"],
  ["family_3_age", "Family 3 Age", "number"],
  ["family_3_occupation", "Family 3 Occupation", "text"],
  ["family_3_living_status", "Family 3 Living Status", "text"],

  ["family_4_name", "Family 4 Name", "text"],
  ["family_4_relationship", "Family 4 Relationship", "text"],
  ["family_4_age", "Family 4 Age", "number"],
  ["family_4_occupation", "Family 4 Occupation", "text"],
  ["family_4_living_status", "Family 4 Living Status", "text"],

  ["family_5_name", "Family 5 Name", "text"],
  ["family_5_relationship", "Family 5 Relationship", "text"],
  ["family_5_age", "Family 5 Age", "number"],
  ["family_5_occupation", "Family 5 Occupation", "text"],
  ["family_5_living_status", "Family 5 Living Status", "text"],

  ["passport_no", "Passport No", "text"],
  ["passport_issue_date", "Passport Issue Date", "date"],
  ["passport_expiry_date", "Passport Expiry Date", "date"],
  ["nid_no", "NID No", "text"],
  ["birth_registration_no", "Birth Registration No", "text"],
];

const FILE_FIELDS = [
  "student_photo",
  "passport_scan",
  "nid_scan",
  "birth_registration_scan",
];

const READONLY_FIELDS = [
  "student_id",
];

/* =====================================================
   GROUPS
===================================================== */

const groups = [
  ["basic", "🏫 Basic / Course Information", STUDENT_FIELDS.slice(0, 8)],
  ["personal", "👤 Personal Information", STUDENT_FIELDS.slice(8, 20)],
  ["address", "📍 Address Information", STUDENT_FIELDS.slice(20, 28)],
  ["contact", "📞 Contact Information", STUDENT_FIELDS.slice(28, 34)],
  ["education", "🎓 Educational Qualification", STUDENT_FIELDS.slice(34, 75)],
  ["work", "💼 Work & Language", STUDENT_FIELDS.slice(75, 82)],
  ["lifestyle", "🕌 Lifestyle & Financial", STUDENT_FIELDS.slice(82, 92)],
  ["japan", "🇯🇵 Japan / Future Plan", STUDENT_FIELDS.slice(92, 96)],
  ["skills", "🛠️ Skills", STUDENT_FIELDS.slice(96, 101)],
  ["physical", "🧍 Physical Information", STUDENT_FIELDS.slice(101, 108)],
  ["family", "👨‍👩‍👧 Family Information", STUDENT_FIELDS.slice(108, 133)],
  ["documents", "📄 Document Update", []],
];

const UI_TEXT = {
  en: {
    logout: "Logout",
    studentId: "Student ID",
    loading: "Loading student profile...",
    noPhoto: "No Photo",
    profileCompletion: "Profile Completion",
    completionInfo: "Profile information completion",
    complete: "Complete",
    profileSections: "Profile Sections",
    documentUpdate: "Document Update",
    documentDescription: "Upload or update your required documents.",
    notUploaded: "Not uploaded",
    uploading: "Uploading...",
    update: "Update",
    upload: "Upload",
    editDescription: "Update the information in this section.",
    saveSection: "Save This Section",
    saving: "Saving...",
    cancel: "Cancel",
    profileInformation: "Student profile information",
    editProfile: "Edit Profile",
  },
  bn: {
    logout: "লগআউট",
    studentId: "শিক্ষার্থী আইডি",
    loading: "শিক্ষার্থীর প্রোফাইল লোড হচ্ছে...",
    noPhoto: "ছবি নেই",
    profileCompletion: "প্রোফাইল সম্পূর্ণতা",
    completionInfo: "প্রোফাইল তথ্য সম্পূর্ণতার অবস্থা",
    complete: "সম্পূর্ণ",
    profileSections: "প্রোফাইল বিভাগসমূহ",
    documentUpdate: "ডকুমেন্ট আপডেট",
    documentDescription: "প্রয়োজনীয় ডকুমেন্ট আপলোড বা আপডেট করুন।",
    notUploaded: "আপলোড করা হয়নি",
    uploading: "আপলোড হচ্ছে...",
    update: "আপডেট",
    upload: "আপলোড",
    editDescription: "এই বিভাগের তথ্য পরিবর্তন করুন।",
    saveSection: "এই বিভাগ সংরক্ষণ করুন",
    saving: "সংরক্ষণ হচ্ছে...",
    cancel: "বাতিল",
    profileInformation: "শিক্ষার্থীর প্রোফাইল তথ্য",
    editProfile: "প্রোফাইল সম্পাদনা",
  },
};

const GROUP_TITLES = {
  basic: { en: "🏫 Basic / Course Information", bn: "🏫 প্রাথমিক / কোর্স তথ্য" },
  personal: { en: "👤 Personal Information", bn: "👤 ব্যক্তিগত তথ্য" },
  address: { en: "📍 Address Information", bn: "📍 ঠিকানা তথ্য" },
  contact: { en: "📞 Contact Information", bn: "📞 যোগাযোগের তথ্য" },
  education: { en: "🎓 Educational Qualification", bn: "🎓 শিক্ষাগত যোগ্যতা" },
  work: { en: "💼 Work & Language", bn: "💼 কাজ ও ভাষা" },
  lifestyle: { en: "🕌 Lifestyle & Financial", bn: "🕌 জীবনযাপন ও আর্থিক তথ্য" },
  japan: { en: "🇯🇵 Japan / Future Plan", bn: "🇯🇵 জাপান / ভবিষ্যৎ পরিকল্পনা" },
  skills: { en: "🛠️ Skills", bn: "🛠️ দক্ষতা" },
  physical: { en: "🧍 Physical Information", bn: "🧍 শারীরিক তথ্য" },
  family: { en: "👨‍👩‍👧 Family Information", bn: "👨‍👩‍👧 পারিবারিক তথ্য" },
  documents: { en: "📄 Document Update", bn: "📄 ডকুমেন্ট আপডেট" },
};

const getGroupTitle = (groupKey, language) =>
  GROUP_TITLES[groupKey]?.[language] ||
  GROUP_TITLES[groupKey]?.en ||
  groupKey;

/* =====================================================
   HELPERS
===================================================== */

const isFilled = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === "number") {
    return !Number.isNaN(value);
  }

  return (
    String(value).trim() !== "" &&
    String(value) !== "0000-00-00"
  );
};

const displayValue = (value) => {
  if (!isFilled(value)) return "—";
  return String(value);
};

const getFileUrl = (file) => {
  if (!file) return null;

  const clean = String(file).trim();

  if (/^(https?:|data:)/i.test(clean)) {
    return clean;
  }

  const path = clean
    .replace(/^\/+/, "")
    .replace(/^uploads[\\/]+students[\\/]+/i, "")
    .replace(/^uploads[\\/]+/i, "")
    .split(/[\\/]+/)
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return path
    ? `${API_ORIGIN}/uploads/students/${path}`
    : null;
};

const saveStudentStorage = (student) => {
  if (!student) return;

  localStorage.setItem(
    "sunshine_student",
    JSON.stringify(student)
  );

  localStorage.setItem(
    "sunshine_student_user",
    JSON.stringify(student)
  );

  if (student.student_id) {
    localStorage.setItem(
      "student_id",
      student.student_id
    );

    localStorage.setItem(
      "student_username",
      student.student_id
    );
  }

  localStorage.setItem("student_role", "student");

  localStorage.setItem(
    "student_status",
    student.status || "active"
  );
};

/* =====================================================
   COMPONENT
===================================================== */

export default function StudentPortal() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    () =>
      localStorage.getItem("sunshine_student_language") === "bn"
        ? "bn"
        : "en"
  );

  const text = UI_TEXT[language];

  const sessionStudent = useMemo(
    () => readStudentSession(),
    []
  );

  const [profile, setProfile] = useState(
    () => readStudentSession()
  );

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [editMode, setEditMode] =
    useState(false);

  const [form, setForm] =
    useState({});

  const [saving, setSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [uploadingDoc, setUploadingDoc] =
    useState("");

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("basic");

  useEffect(() => {
    localStorage.setItem(
      "sunshine_student_language",
      language
    );
  }, [language]);

  const currentStudent =
    profile || sessionStudent;

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  const loadProfile = async (studentId) => {
    if (!studentId) return;

    setLoadingProfile(true);
    setProfileError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/student_profile.php?student_id=${encodeURIComponent(
          studentId
        )}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load student profile."
        );
      }

      const next =
        data.student ||
        data.profile ||
        sessionStudent;

      setProfile(next);
      saveStudentStorage(next);
    } catch (error) {
      console.error(error);

      setProfileError(
        error.message ||
          "Unable to load student profile."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!sessionStudent) {
      navigate("/", { replace: true });
      return;
    }

    const studentId =
      sessionStudent.student_id ||
      sessionStudent.username;

    if (studentId) {
      loadProfile(studentId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStudent, navigate]);

  /* =====================================================
     EDIT FORM
===================================================== */

  const startEdit = () => {
    if (activeTab === "documents") {
      return;
    }

    setForm({
      ...currentStudent,
    });

    setSaveMessage("");
    setSaveError("");
    setEditMode(true);

    setTimeout(() => {
      document
        .getElementById("student-profile-edit")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const cancelEdit = () => {
    setForm({
      ...currentStudent,
    });

    setSaveMessage("");
    setSaveError("");
    setEditMode(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =====================================================
     SAVE PROFILE
===================================================== */

  const handleSave = async (event) => {
    event.preventDefault();

    const studentId =
      currentStudent?.student_id ||
      currentStudent?.username;

    if (!studentId) {
      setSaveError(
        "Student ID পাওয়া যায়নি। আবার login করুন।"
      );
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const formData = new FormData();

      formData.append(
        "student_id",
        studentId
      );

      /*
       * শুধু active/current section-এর fields পাঠানো হচ্ছে।
       * ফলে অন্য section-এর data পরিবর্তন হবে না।
       */
      activeFields.forEach(
        ([field, label, type, readonly]) => {
          if (
            readonly ||
            READONLY_FIELDS.includes(field)
          ) {
            return;
          }

          formData.append(
            field,
            form[field] ??
              currentStudent?.[field] ??
              ""
          );
        }
      );

      const response = await fetch(
        `${API_BASE_URL}/student_update_documents.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Profile update failed."
        );
      }

      const next =
        data.student ||
        data.profile ||
        {
          ...currentStudent,
          ...form,
        };

      setProfile(next);
      setForm(next);

      saveStudentStorage(next);

      setSaveMessage(
        "Student profile successfully updated."
      );

      setEditMode(false);
    } catch (error) {
      console.error(
        "PROFILE SAVE ERROR:",
        error
      );

      setSaveError(
        error.message ||
          "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     COMPLETION
===================================================== */

  const completion = useMemo(() => {
    const fields = STUDENT_FIELDS.filter(
      ([field]) =>
        !READONLY_FIELDS.includes(field) &&
        !FILE_FIELDS.includes(field)
    );

    const completed = fields.filter(
      ([field]) =>
        isFilled(currentStudent?.[field])
    ).length;

    return fields.length
      ? Math.round(
          (completed / fields.length) * 100
        )
      : 0;
  }, [currentStudent]);

  /* =====================================================
     DOCUMENT CARDS
===================================================== */

  const documentCards = [
    {
      key: "official_photo",
      label: "Official Photo",
      field: "student_photo",
      formField: "studentPhoto",
      accept: "image/*",
      icon: "📷",
    },
    {
      key: "passport",
      label: "Passport",
      field: "passport_scan",
      formField: "passportScan",
      accept: ".pdf,image/*",
      icon: "🛂",
    },
    {
      key: "nid",
      label: "NID",
      field: "nid_scan",
      formField: "nidScan",
      accept: ".pdf,image/*",
      icon: "🪪",
    },
    {
      key: "birth_registration",
      label: "Birth Registration",
      field: "birth_registration_scan",
      formField: "birthRegistrationScan",
      accept: ".pdf,image/*",
      icon: "📄",
    },
  ];

  /* =====================================================
     DOCUMENT UPLOAD
===================================================== */

  const handleDocumentUpload = async (
    card,
    file
  ) => {
    if (!file) return;

    const studentId =
      currentStudent?.student_id ||
      currentStudent?.username;

    if (!studentId) {
      setUploadError(
        "Student ID পাওয়া যায়নি। আবার login করুন।"
      );
      return;
    }

    setUploadingDoc(card.key);
    setUploadMessage("");
    setUploadError("");

    try {
      const data = new FormData();

      data.append(
        "student_id",
        studentId
      );

      data.append(
        card.formField,
        file,
        file.name
      );

      const response = await fetch(
        `${API_BASE_URL}/student_update_documents.php`,
        {
          method: "POST",
          credentials: "include",
          body: data,
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Document update failed."
        );
      }

      const next =
        result.student ||
        result.profile ||
        currentStudent;

      setProfile(next);
      saveStudentStorage(next);

      setUploadMessage(
        `${card.label} updated successfully.`
      );
    } catch (error) {
      console.error(error);

      setUploadError(
        error.message ||
          "Document update failed."
      );
    } finally {
      setUploadingDoc("");
    }
  };

  /* =====================================================
     TAB CHANGE
===================================================== */

  const handleTabChange = (groupKey) => {
    setActiveTab(groupKey);

    // প্রতিটি sidebar section-এর edit state আলাদা থাকবে।
    setEditMode(false);
    setForm({});

    setSaveMessage("");
    setSaveError("");
    setUploadMessage("");
    setUploadError("");

    if (groupKey === "documents") {
      setEditMode(false);
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

  if (!sessionStudent) {
    return null;
  }

  const studentName =
    currentStudent?.student_name_en ||
    currentStudent?.student_name_bn ||
    "Student";

  const photoUrl = getFileUrl(
    currentStudent?.student_photo
  );

  const activeGroup =
    groups.find(
      ([groupKey]) =>
        groupKey === activeTab
    ) || groups[0];

  const activeGroupKey =
    activeGroup[0];

  const activeGroupTitle = getGroupTitle(
    activeGroupKey,
    language
  );

  const activeFields =
    activeGroup[2];

  return (
    <div className="student-portal">

      {loadingProfile && (
        <div className="student-portal-message-card no-print">
          {text.loading}
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

            {/* TOP PROFILE */}
            <div className="student-profile-top">

              <div className="student-profile-photo-box">

                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={studentName}
                  />
                ) : (
                  <div className="student-profile-no-photo">
                    {text.noPhoto}
                  </div>
                )}

              </div>

              <div className="student-profile-basic">

                <h2>
                  {studentName}
                </h2>

                {currentStudent.student_name_bn && (
                  <p className="student-bangla-name">
                    {currentStudent.student_name_bn}
                  </p>
                )}

                <div className="student-profile-id">

                  <span>
                    Student ID:
                  </span>

                  <strong>
                    {displayValue(
                      currentStudent.student_id
                    )}
                  </strong>

                </div>

                <div className="student-profile-tags">

                  <span>
                    {displayValue(
                      currentStudent.branch
                    )}
                  </span>

                  <span>
                    {displayValue(
                      currentStudent.course
                    )}
                  </span>

                  <span>
                    {displayValue(
                      currentStudent.language_level
                    )}
                  </span>

                </div>

              </div>
            </div>

            {/* MESSAGES */}
            {(saveMessage || saveError) && (
              <div
                className={
                  saveError
                    ? "student-document-message error"
                    : "student-document-message success"
                }
              >
                {saveError || saveMessage}
              </div>
            )}

            {/* COMPLETION */}
            <section className="student-completion-section no-print">

              <div className="student-completion-header">

                <div>

                  <h3>
                    {text.profileCompletion}
                  </h3>

                  <p>
                    {text.completionInfo}
                  </p>

                </div>

                <div className="student-completion-score">

                  <strong>
                    {completion}%
                  </strong>

                  <span>
                    {text.complete}
                  </span>

                </div>

              </div>

              <div className="student-completion-progress">

                <div
                  className="student-completion-progress-bar"
                  style={{
                    width: `${completion}%`,
                  }}
                />

              </div>

            </section>

            {/* TAB LAYOUT */}
            <div className="student-tab-layout">

              {/* LEFT TAB MENU */}
              <aside className="student-tab-sidebar no-print">

                <div className="student-sidebar-profile">
                  <div className="student-sidebar-profile-main">
                    <div className="student-sidebar-profile-photo">
                      {photoUrl ? (
                        <img src={photoUrl} alt={studentName} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>

                    <div className="student-sidebar-profile-details">
                      <strong>{studentName}</strong>
                      <small>
                        {text.studentId}: {displayValue(currentStudent?.student_id)}
                      </small>
                    </div>
                  </div>

                  <div className="student-sidebar-profile-actions">
                    <div
                      className="student-language-switcher"
                      aria-label="Language selection"
                    >
                      <button
                        type="button"
                        className={language === "bn" ? "active" : ""}
                        onClick={() => setLanguage("bn")}
                      >
                        বাংলা
                      </button>
                      <button
                        type="button"
                        className={language === "en" ? "active" : ""}
                        onClick={() => setLanguage("en")}
                      >
                        English
                      </button>
                    </div>

                    <button
                      type="button"
                      className="student-portal-logout"
                      onClick={handleLogout}
                    >
                      {text.logout}
                    </button>
                  </div>
                </div>

                <div className="student-tab-sidebar-title">
                  {text.profileSections}
                </div>

                {groups.map(
                  ([groupKey]) => (
                    <button
                      key={groupKey}
                      type="button"
                      className={
                        activeTab === groupKey
                          ? "student-tab-button active"
                          : "student-tab-button"
                      }
                      onClick={() =>
                        handleTabChange(
                          groupKey
                        )
                      }
                    >
                      {getGroupTitle(groupKey, language)}
                    </button>
                  )
                )}

              </aside>

              {/* RIGHT CONTENT */}
              <main className="student-tab-content">

                {/* DOCUMENT TAB */}
                {activeTab === "documents" ? (

                  <section
                    id="document-update"
                    className="student-profile-section student-active-tab-section no-print"
                  >

                    <div className="student-tab-content-header">

                      <div>

                        <h3>
                          {text.documentUpdate}
                        </h3>

                        <p>
                          {text.documentDescription}
                        </p>

                      </div>

                    </div>

                    {(uploadMessage ||
                      uploadError) && (
                      <div
                        className={
                          uploadError
                            ? "student-document-message error"
                            : "student-document-message success"
                        }
                      >
                        {uploadError ||
                          uploadMessage}
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
                              {card.icon}
                            </div>

                            <div className="student-document-content">

                              <h4>
                                {card.label}
                              </h4>

                              <p>
                                {currentStudent[
                                  card.field
                                ]
                                  ? String(
                                      currentStudent[
                                        card.field
                                      ]
                                    )
                                      .split(/[\\/]/)
                                      .pop()
                                  : text.notUploaded}
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
                                  onChange={(e) => {

                                    const file =
                                      e.target.files?.[0];

                                    if (file) {
                                      handleDocumentUpload(
                                        card,
                                        file
                                      );
                                    }

                                    e.target.value = "";
                                  }}
                                />

                                {uploadingDoc ===
                                card.key
                                  ? text.uploading
                                  : currentStudent[
                                      card.field
                                    ]
                                  ? text.update
                                  : text.upload}

                              </label>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </section>

                ) : editMode ? (

                  /* EDIT MODE */

                  <section
                    id="student-profile-edit"
                    className="student-profile-section"
                  >

                    <div className="student-edit-header">

                      <div>

                        <h3>
                          {activeGroupTitle}
                        </h3>

                        <p>
                          {text.editDescription}
                        </p>

                      </div>

                    </div>

                    <form onSubmit={handleSave}>

                      <div className="student-edit-group">

                        <h4>
                          {activeGroupTitle}
                        </h4>

                        <div className="student-edit-grid">

                          {activeFields.map(
                            ([
                              field,
                              label,
                              type,
                            ]) => (

                              <div
                                className={
                                  type === "textarea"
                                    ? "student-edit-field student-edit-field-full"
                                    : "student-edit-field"
                                }
                                key={field}
                              >

                                <label>
                                  {label}
                                </label>

                                {type ===
                                "textarea" ? (

                                  <textarea
                                    value={
                                      form[field] ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        field,
                                        e.target.value
                                      )
                                    }
                                    disabled={saving}
                                    rows={3}
                                  />

                                ) : (

                                  <input
                                    type={type}
                                    value={
                                      form[field] ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        field,
                                        e.target.value
                                      )
                                    }
                                    disabled={saving}
                                  />

                                )}

                              </div>
                            )
                          )}

                        </div>

                      </div>

                      <div className="student-edit-actions">

                        <button
                          type="submit"
                          className="student-save-button"
                          disabled={saving}
                        >
                          {saving
                            ? text.saving
                            : `💾 ${text.saveSection}`}
                        </button>

                        <button
                          type="button"
                          className="student-cancel-button"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          {text.cancel}
                        </button>

                      </div>

                    </form>

                  </section>

                ) : (

                  /* VIEW MODE */

                  <section
                    className="student-profile-section student-active-tab-section"
                    id={`profile-${activeGroupKey}`}
                  >

                    <div className="student-tab-content-header">

                      <div>

                        <h3>
                          {activeGroupTitle}
                        </h3>

                        <p>
                          {text.profileInformation}
                        </p>

                      </div>

                      <button
                        type="button"
                        className="student-profile-edit-button"
                        onClick={startEdit}
                      >
                        ✏️ {text.editProfile}
                      </button>

                    </div>

                    <div className="student-info-table">

                      {activeFields.map(
                        ([field, label]) => (

                          <div
                            className="student-info-row"
                            key={field}
                          >

                            <div className="student-info-label">
                              {label}
                            </div>

                            <div className="student-info-value">
                              {displayValue(
                                currentStudent[
                                  field
                                ]
                              )}
                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </section>
                )}

              </main>

            </div>

            {/* FOOTER */}
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