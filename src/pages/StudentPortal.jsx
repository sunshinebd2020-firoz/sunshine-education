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
  ["blood_group", "Blood Group", "select"],
  ["gender", "Gender", "select"],
  ["nationality", "Nationality", "text"],
  ["katakana_name", "Katakana Name", "text"],
  ["marital_status", "Marital Status", "select"],

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

  ["hsc_institute", "HSC Institute", "text"],
  ["hsc_board", "HSC Board", "text"],
  ["hsc_roll", "HSC Roll", "text"],
  ["hsc_registration", "HSC Registration", "text"],
  ["hsc_group", "HSC Group", "text"],
  ["hsc_passing_year", "HSC Passing Year", "number"],
  ["hsc_gpa", "HSC GPA", "text"],

  ["honours_institute", "Honours Institute", "text"],
  ["honours_university", "Honours University", "text"],
  ["honours_roll", "Honours Roll", "text"],
  ["honours_registration", "Honours Registration", "text"],
  ["honours_group", "Honours Group", "text"],
  ["honours_passing_year", "Honours Passing Year", "number"],
  ["honours_result", "Honours Result", "text"],

  ["masters_institute", "Masters Institute", "text"],
  ["masters_university", "Masters University", "text"],
  ["masters_roll", "Masters Roll", "text"],
  ["masters_registration", "Masters Registration", "text"],
  ["masters_group", "Masters Group", "text"],
  ["masters_passing_year", "Masters Passing Year", "number"],
  ["masters_result", "Masters Result", "text"],

  ["additional_education", "Additional Education", "textarea"],
  ["work_history", "Work History", "textarea"],
  ["japanese_test_history", "Japanese Test History", "textarea"],
  ["english_level", "English Level", "text"],
  ["strengths", "Strengths", "textarea"],
  ["weaknesses", "Weaknesses", "textarea"],
  ["hobby", "Hobby", "textarea"],

  ["group_living", "Group Living", "select"],
  ["cooking", "Cooking", "select"],
  ["religion", "Religion", "select"],
  ["worship", "Worship", "select"],
  ["fasting", "Fasting", "select"],
  ["debt", "Debt", "select"],
  ["household_monthly_income", "Household Monthly Income", "number"],
  ["family_members", "Family Members", "number"],

  ["japan_application_reason", "Japan Application Reason", "textarea"],
  ["family_opinion", "Family Opinion", "textarea"],
  ["remittance_plan", "Remittance Plan", "textarea"],
  ["post_japan_work_plan", "Post Japan Work Plan", "textarea"],
  ["driving_license", "Driving License", "select"],
  ["international_driving_license", "International Driving License", "select"],
  ["bicycle_riding", "Bicycle Riding", "select"],
  ["previous_coe_application", "Previous COE Application", "select"],
  ["resume_other", "Resume Other", "textarea"],
  ["resume_consent", "Resume Consent", "select"],
  ["resume_consent_date", "Resume Consent Date", "date"],

  ["height_cm", "Height (cm)", "number"],
  ["weight_kg", "Weight (kg)", "number"],
  ["dominant_hand", "Dominant Hand", "select"],
  ["tattoo", "Tattoo", "select"],
  ["eyesight", "Eyesight", "text"],
  ["smoking", "Smoking", "select"],
  ["alcohol", "Alcohol", "select"],

  ["family_2_name", "Family 1 Name", "text"],
  ["family_2_date_of_birth", "Family 1 Date of Birth", "date"],
  ["family_2_age", "Family 1 Age", "number"],
  ["family_2_relationship", "Family 1 Relationship", "select"],
  ["family_2_occupation", "Family 1 Occupation", "text"],
  ["family_2_living_status", "Family 1 Living Status", "select"],

  ["family_3_name", "Family 2 Name", "text"],
  ["family_3_date_of_birth", "Family 2 Date of Birth", "date"],
  ["family_3_age", "Family 2 Age", "number"],
  ["family_3_relationship", "Family 2 Relationship", "select"],
  ["family_3_occupation", "Family 2 Occupation", "text"],
  ["family_3_living_status", "Family 2 Living Status", "select"],

  ["family_4_name", "Family 3 Name", "text"],
  ["family_4_date_of_birth", "Family 3 Date of Birth", "date"],
  ["family_4_age", "Family 3 Age", "number"],
  ["family_4_relationship", "Family 3 Relationship", "select"],
  ["family_4_occupation", "Family 3 Occupation", "text"],
  ["family_4_living_status", "Family 3 Living Status", "select"],

  ["family_5_name", "Family 4 Name", "text"],
  ["family_5_date_of_birth", "Family 4 Date of Birth", "date"],
  ["family_5_age", "Family 4 Age", "number"],
  ["family_5_relationship", "Family 4 Relationship", "select"],
  ["family_5_occupation", "Family 4 Occupation", "text"],
  ["family_5_living_status", "Family 4 Living Status", "select"],

  ["passport_no", "Passport No", "text"],
  ["passport_issue_date", "Passport Issue Date", "date"],
  ["passport_expiry_date", "Passport Expiry Date", "date"],

  ["nid_no", "NID No", "text"],
  ["nid_issue_date", "NID Issue Date", "date"],
  ["nid_expiry_date", "NID Expiry Date", "date"],

  ["birth_registration_no", "Birth Registration No", "text"],
  ["birth_registration_issue_date", "Birth Registration Issue Date", "date"],
  ["birth_registration_expiry_date", "Birth Registration Expiry Date", "date"],

  ["driving_license_no", "Driving License No", "text"],
  ["driving_license_issue_date", "Driving License Issue Date", "date"],
  ["driving_license_expiry_date", "Driving License Expiry Date", "date"],
];

const FILE_FIELDS = [
  "student_photo",
  "passport_scan",
  "nid_scan",
  "birth_registration_scan",
  "driving_license_scan",
];

const READONLY_FIELDS = ["student_id"];

/* =====================================================
   GROUPS
===================================================== */
const groups = [
  ["basic", "🏫 Basic / Course Information"],
  ["personal", "👤 Personal Information"],
  ["address", "📍 Address Information"],
  ["contact", "📞 Contact Information"],
  ["education", "🎓 Educational Qualification"],
  ["work", "💼 Work & Language"],
  ["lifestyle", "🕌 Lifestyle & Financial"],
  ["japan", "🇯🇵 Japan / Future Plan"],
  ["skills", "🛠️ Skills"],
  ["physical", "🧍 Physical Information"],
  ["family", "👨‍👩‍👧 Family Information"],
  ["documents", "📄 Document Update"],
];

const GROUP_FIELDS = {
  basic: [
    "student_id",
    "admission_date",
    "branch",
    "course",
    "language_level",
    "assigned_teacher_id",
    "teacher_id",
    "teacher_name",
    "course_fee",
  ],
  personal: [
    "student_name_bn",
    "student_name_en",
    "short_name",
    "father_name",
    "mother_name",
    "date_of_birth",
    "blood_group",
    "gender",
    "nationality",
    "katakana_name",
    "marital_status",
  ],
  address: [
    "present_village",
    "present_post",
    "present_thana",
    "present_district",
    "permanent_village",
    "permanent_post",
    "permanent_thana",
    "permanent_district",
  ],
  contact: [
    "student_mobile",
    "parents_mobile",
    "home_mobile",
    "email",
    "emergency_contact",
    "emergency_relationship",
  ],
  work: [
    "additional_education",
    "work_history",
    "japanese_test_history",
    "english_level",
    "strengths",
    "weaknesses",
    "hobby",
  ],
  lifestyle: [
    "group_living",
    "cooking",
    "religion",
    "worship",
    "fasting",
    "debt",
    "household_monthly_income",
    "family_members",
  ],
  japan: [
    "japan_application_reason",
    "family_opinion",
    "remittance_plan",
    "post_japan_work_plan",
    "driving_license",
    "international_driving_license",
    "bicycle_riding",
    "previous_coe_application",
    "resume_other",
    "resume_consent",
    "resume_consent_date",
  ],
  skills: ["height_cm", "weight_kg"],
  physical: [
    "dominant_hand",
    "tattoo",
    "eyesight",
    "smoking",
    "alcohol",
  ],
};

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
    addHonours: "Add Honours",
    addMasters: "Add Masters",
    presentAddress: "Present Address",
    permanentAddress: "Permanent Address",
    sameAddress: "Present same as Permanent",
    educationalDetails: "Educational Details",
    familyDetails: "Family Details",
    editDocument: "Edit Information",
    saveDocument: "Save Information",
    documentSaving: "Saving...",
    saved: "Information saved successfully.",
    number: "Number",
    issueDate: "Issue Date",
    expiryDate: "Expiry Date",
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
    addHonours: "Honours যোগ করুন",
    addMasters: "Masters যোগ করুন",
    presentAddress: "বর্তমান ঠিকানা",
    permanentAddress: "স্থায়ী ঠিকানা",
    sameAddress: "বর্তমান ঠিকানা স্থায়ী ঠিকানার মতো",
    educationalDetails: "শিক্ষাগত বিস্তারিত তথ্য",
    familyDetails: "পারিবারিক তথ্য",
    editDocument: "তথ্য সম্পাদনা",
    saveDocument: "তথ্য সংরক্ষণ",
    documentSaving: "সংরক্ষণ হচ্ছে...",
    saved: "তথ্য সফলভাবে সংরক্ষণ হয়েছে।",
    number: "নম্বর",
    issueDate: "ইস্যু তারিখ",
    expiryDate: "মেয়াদ শেষের তারিখ",
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
  if (typeof value === "number") return !Number.isNaN(value);
  return String(value).trim() !== "" && String(value) !== "0000-00-00";
};

const displayValue = (value) => (isFilled(value) ? String(value) : "—");

const getFileUrl = (file) => {
  if (!file) return null;

  const clean = String(file).trim();

  if (/^(https?:|data:)/i.test(clean)) {
    return clean;
  }

  const path = clean
    .replace(/^[/\\]+/, "")
    .replace(/^uploads[/\\]+students[/\\]+/i, "")
    .replace(/^uploads[/\\]+/i, "")
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

  localStorage.setItem(
    "student_role",
    "student"
  );

  localStorage.setItem(
    "student_status",
    student.status || "active"
  );
};

/* =====================================================
   KATAKANA CONVERTER
===================================================== */
const englishToKatakana = (name) => {
  if (!name) return "";

  const value = String(name)
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const words = value.split(" ");

  const convertWord = (word) => {
    const map = [
      ["tion", "ション"],
      ["sion", "ション"],
      ["ch", "チ"],
      ["sh", "シ"],
      ["th", "ス"],
      ["ph", "フ"],
      ["wh", "ワ"],
      ["ck", "ク"],
      ["qu", "ク"],
      ["oo", "ウー"],
      ["ee", "イー"],
      ["ea", "イー"],
      ["ai", "エイ"],
      ["ay", "エイ"],
      ["ou", "アウ"],
      ["ow", "オウ"],
      ["ie", "イー"],
      ["ei", "エイ"],
      ["ar", "アー"],
      ["er", "アー"],
      ["ir", "アー"],
      ["or", "オー"],
      ["ur", "アー"],
      ["a", "ア"],
      ["i", "イ"],
      ["u", "ウ"],
      ["e", "エ"],
      ["o", "オ"],
      ["b", "ブ"],
      ["c", "ク"],
      ["d", "ド"],
      ["f", "フ"],
      ["g", "グ"],
      ["h", "ハ"],
      ["j", "ジ"],
      ["k", "ク"],
      ["l", "ル"],
      ["m", "ム"],
      ["n", "ン"],
      ["p", "プ"],
      ["q", "ク"],
      ["r", "ラ"],
      ["s", "ス"],
      ["t", "ト"],
      ["v", "ヴ"],
      ["w", "ワ"],
      ["x", "クス"],
      ["y", "イ"],
      ["z", "ズ"],
    ];

    let result = "";
    let i = 0;

    while (i < word.length) {
      let matched = false;

      for (const [from, to] of map) {
        if (word.startsWith(from, i)) {
          result += to;
          i += from.length;
          matched = true;
          break;
        }
      }

      if (!matched) i++;
    }

    return result;
  };

  return words.map(convertWord).join("・");
};

const calculateAge = (date) => {
  if (!date) return "";

  const birth = new Date(date);

  if (Number.isNaN(birth.getTime())) {
    return "";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (month === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "";
};

const cmToFeetInches = (cm) => {
  const value = Number(cm);

  if (!value || value <= 0) {
    return {
      feet: "",
      inches: "",
    };
  }

  const totalInches =
    value / 2.54;

  const feet =
    Math.floor(totalInches / 12);

  const inches =
    Math.round(
      totalInches - feet * 12
    );

  if (inches === 12) {
    return {
      feet: feet + 1,
      inches: 0,
    };
  }

  return {
    feet,
    inches,
  };
};

/* =====================================================
   COMPONENT
===================================================== */
export default function StudentPortal() {
  const navigate = useNavigate();

  const [language, setLanguage] =
    useState(() =>
      localStorage.getItem(
        "sunshine_student_language"
      ) === "bn"
        ? "bn"
        : "en"
    );

  const text = UI_TEXT[language];

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

  const [sameAddress, setSameAddress] =
    useState(false);

  const [showHonours, setShowHonours] =
    useState(false);

  const [showMasters, setShowMasters] =
    useState(false);

  const [heightFeet, setHeightFeet] =
    useState("");

  const [heightInches, setHeightInches] =
    useState("");

  const [documentEdit, setDocumentEdit] =
    useState({});

  const [documentSaving, setDocumentSaving] =
    useState("");

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

      const data =
        await response.json();

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
      navigate("/", {
        replace: true,
      });

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
    if (activeTab === "documents") return;

    const nextForm = {
      ...currentStudent,
    };

    setForm(nextForm);
    setSaveMessage("");
    setSaveError("");
    setEditMode(true);

    if (activeTab === "address") {
      const isSame =
        currentStudent?.present_village ===
          currentStudent?.permanent_village &&
        currentStudent?.present_post ===
          currentStudent?.permanent_post &&
        currentStudent?.present_thana ===
          currentStudent?.permanent_thana &&
        currentStudent?.present_district ===
          currentStudent?.permanent_district;

      setSameAddress(
        Boolean(
          isSame &&
            (
              isFilled(
                currentStudent?.present_village
              ) ||
              isFilled(
                currentStudent?.present_post
              ) ||
              isFilled(
                currentStudent?.present_thana
              ) ||
              isFilled(
                currentStudent?.present_district
              )
            )
        )
      );
    }

    if (activeTab === "skills") {
      const height =
        cmToFeetInches(
          currentStudent?.height_cm
        );

      setHeightFeet(height.feet);
      setHeightInches(height.inches);
    }

    if (activeTab === "education") {
      setShowHonours(
        isFilled(
          currentStudent?.honours_institute
        ) ||
          isFilled(
            currentStudent?.honours_university
          ) ||
          isFilled(
            currentStudent?.honours_result
          )
      );

      setShowMasters(
        isFilled(
          currentStudent?.masters_institute
        ) ||
          isFilled(
            currentStudent?.masters_university
          ) ||
          isFilled(
            currentStudent?.masters_result
          )
      );
    }

    setTimeout(() => {
      document
        .getElementById(
          "student-profile-edit"
        )
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

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnglishNameChange = (
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      student_name_en: value,
      katakana_name:
        englishToKatakana(value),
    }));
  };

  const handleFamilyDateChange = (
    field,
    value
  ) => {
    const ageField =
      field.replace(
        "_date_of_birth",
        "_age"
      );

    setForm((prev) => ({
      ...prev,
      [field]: value,
      [ageField]:
        calculateAge(value),
    }));
  };

  const updateHeight = (
    feet,
    inches
  ) => {
    const f =
      Number(feet) || 0;

    const i =
      Number(inches) || 0;

    setHeightFeet(feet);
    setHeightInches(inches);

    const cm =
      (f * 12 + i) * 2.54;

    setForm((prev) => ({
      ...prev,
      height_cm: cm
        ? cm.toFixed(1)
        : "",
    }));
  };

  /* =====================================================
     ADDRESS SYNC
     Present -> Permanent
  ===================================================== */
  const syncPermanentAddress = (
    nextForm
  ) => ({
    ...nextForm,
    permanent_village:
      nextForm.present_village || "",
    permanent_post:
      nextForm.present_post || "",
    permanent_thana:
      nextForm.present_thana || "",
    permanent_district:
      nextForm.present_district || "",
  });

  /* =====================================================
     SAVE PROFILE
  ===================================================== */
  const handleSave = async (
    event
  ) => {
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
      let saveForm = {
        ...form,
      };

      if (
        sameAddress &&
        activeTab === "address"
      ) {
        saveForm =
          syncPermanentAddress(
            saveForm
          );
      }

      const formData =
        new FormData();

      formData.append(
        "student_id",
        studentId
      );

      const appendField = (
        field
      ) => {
        if (
          READONLY_FIELDS.includes(
            field
          )
        ) {
          return;
        }

        formData.append(
          field,
          saveForm[field] ??
            currentStudent?.[field] ??
            ""
        );
      };

      if (
        activeTab ===
        "education"
      ) {
        [
          "ssc_institute",
          "ssc_board",
          "ssc_roll",
          "ssc_registration",
          "ssc_group",
          "ssc_passing_year",
          "ssc_gpa",

          "hsc_institute",
          "hsc_board",
          "hsc_roll",
          "hsc_registration",
          "hsc_group",
          "hsc_passing_year",
          "hsc_gpa",

          "honours_institute",
          "honours_university",
          "honours_roll",
          "honours_registration",
          "honours_group",
          "honours_passing_year",
          "honours_result",

          "masters_institute",
          "masters_university",
          "masters_roll",
          "masters_registration",
          "masters_group",
          "masters_passing_year",
          "masters_result",
        ].forEach(
          appendField
        );
      } else if (
        activeTab === "family"
      ) {
        [2, 3, 4, 5].forEach(
          (number) => {
            appendField(
              `family_${number}_name`
            );

            appendField(
              `family_${number}_date_of_birth`
            );

            appendField(
              `family_${number}_age`
            );

            appendField(
              `family_${number}_relationship`
            );

            appendField(
              `family_${number}_occupation`
            );

            appendField(
              `family_${number}_living_status`
            );
          }
        );
      } else if (
        activeTab === "skills"
      ) {
        appendField("height_cm");
        appendField("weight_kg");
      } else if (
        activeTab === "address"
      ) {
        [
          "present_village",
          "present_post",
          "present_thana",
          "present_district",
          "permanent_village",
          "permanent_post",
          "permanent_thana",
          "permanent_district",
        ].forEach(
          appendField
        );
      } else {
        (
          GROUP_FIELDS[
            activeTab
          ] || []
        ).forEach(
          appendField
        );
      }

      const response =
        await fetch(
          `${API_BASE_URL}/student_update_documents.php`,
          {
            method: "POST",
            credentials: "include",
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
            "Profile update failed."
        );
      }

      const next =
        data.student ||
        data.profile ||
        {
          ...currentStudent,
          ...saveForm,
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
    const fields =
      STUDENT_FIELDS.filter(
        ([field]) =>
          !READONLY_FIELDS.includes(
            field
          ) &&
          !FILE_FIELDS.includes(
            field
          )
      );

    const completed =
      fields.filter(
        ([field]) =>
          isFilled(
            currentStudent?.[field]
          )
      ).length;

    return fields.length
      ? Math.round(
          (completed /
            fields.length) *
            100
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
      numberField: null,
      issueField: null,
      expiryField: null,
    },
    {
      key: "passport",
      label: "Passport",
      field: "passport_scan",
      formField: "passportScan",
      accept: ".pdf,image/*",
      icon: "🛂",
      numberField: "passport_no",
      issueField:
        "passport_issue_date",
      expiryField:
        "passport_expiry_date",
    },
    {
      key: "nid",
      label: "NID",
      field: "nid_scan",
      formField: "nidScan",
      accept: ".pdf,image/*",
      icon: "🪪",
      numberField: "nid_no",
      issueField:
        "nid_issue_date",
      expiryField:
        "nid_expiry_date",
    },
    {
      key: "birth_registration",
      label: "Birth Registration",
      field:
        "birth_registration_scan",
      formField:
        "birthRegistrationScan",
      accept: ".pdf,image/*",
      icon: "📄",
      numberField:
        "birth_registration_no",
      issueField:
        "birth_registration_issue_date",
      expiryField:
        "birth_registration_expiry_date",
    },
    {
      key: "driving_license",
      label: "Driving License",
      field:
        "driving_license_scan",
      formField:
        "drivingLicenseScan",
      accept: ".pdf,image/*",
      icon: "🚗",
      numberField:
        "driving_license_no",
      issueField:
        "driving_license_issue_date",
      expiryField:
        "driving_license_expiry_date",
    },
  ];

  /* =====================================================
     DOCUMENT METADATA
  ===================================================== */
  const startDocumentEdit = (
    card
  ) => {
    if (!card.numberField) return;

    setDocumentEdit((prev) => ({
      ...prev,
      [card.key]: {
        number:
          currentStudent?.[
            card.numberField
          ] || "",
        issueDate:
          card.issueField
            ? currentStudent?.[
                card.issueField
              ] || ""
            : "",
        expiryDate:
          card.expiryField
            ? currentStudent?.[
                card.expiryField
              ] || ""
            : "",
      },
    }));

    setUploadMessage("");
    setUploadError("");
  };

  const isDocumentEditing = (
    card
  ) =>
    Boolean(
      documentEdit?.[card.key]
    );

  const handleDocumentMetaChange = (
    card,
    key,
    value
  ) => {
    setDocumentEdit(
      (prev) => ({
        ...prev,
        [card.key]: {
          ...(prev[card.key] || {}),
          [key]: value,
        },
      })
    );
  };

  const cancelDocumentEdit = (
    card
  ) => {
    setDocumentEdit(
      (prev) => {
        const next = {
          ...prev,
        };

        delete next[card.key];

        return next;
      }
    );
  };

  const saveDocumentMetadata =
    async (card) => {
      const metadata =
        documentEdit?.[
          card.key
        ];

      if (!metadata) return;

      const studentId =
        currentStudent?.student_id ||
        currentStudent?.username;

      if (!studentId) {
        setUploadError(
          "Student ID পাওয়া যায়নি। আবার login করুন।"
        );
        return;
      }

      setDocumentSaving(
        card.key
      );

      setUploadMessage("");
      setUploadError("");

      try {
        const data =
          new FormData();

        data.append(
          "student_id",
          studentId
        );

        if (card.numberField) {
          data.append(
            card.numberField,
            metadata.number || ""
          );
        }

        if (card.issueField) {
          data.append(
            card.issueField,
            metadata.issueDate || ""
          );
        }

        if (card.expiryField) {
          data.append(
            card.expiryField,
            metadata.expiryDate || ""
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/student_update_documents.php`,
            {
              method: "POST",
              credentials: "include",
              body: data,
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Document information could not be saved."
          );
        }

        const next =
          result.student ||
          result.profile ||
          currentStudent;

        setProfile(next);
        saveStudentStorage(next);

        cancelDocumentEdit(
          card
        );

        setUploadMessage(
          text.saved
        );
      } catch (error) {
        console.error(
          "DOCUMENT META ERROR:",
          error
        );

        setUploadError(
          error.message ||
            "Document information could not be saved."
        );
      } finally {
        setDocumentSaving("");
      }
    };

  /* =====================================================
     DOCUMENT UPLOAD
  ===================================================== */
  const handleDocumentUpload =
    async (
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

      setUploadingDoc(
        card.key
      );

      setUploadMessage("");
      setUploadError("");

      try {
        const data =
          new FormData();

        data.append(
          "student_id",
          studentId
        );

        data.append(
          card.formField,
          file,
          file.name
        );

        const response =
          await fetch(
            `${API_BASE_URL}/student_update_documents.php`,
            {
              method: "POST",
              credentials: "include",
              body: data,
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
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
  const handleTabChange = (
    groupKey
  ) => {
    setActiveTab(groupKey);
    setEditMode(false);
    setForm({});
    setSaveMessage("");
    setSaveError("");
    setUploadMessage("");
    setUploadError("");
    setSameAddress(false);
    setDocumentEdit({});
    setDocumentSaving("");
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

  const photoUrl =
    getFileUrl(
      currentStudent?.student_photo
    );

  const activeGroup =
    groups.find(
      ([groupKey]) =>
        groupKey === activeTab
    ) || groups[0];

  const activeGroupKey =
    activeGroup[0];

  const activeGroupTitle =
    getGroupTitle(
      activeGroupKey,
      language
    );

  const activeFieldDefinitions =
    (
      GROUP_FIELDS[
        activeGroupKey
      ] || []
    )
      .map((field) =>
        STUDENT_FIELDS.find(
          ([name]) =>
            name === field
        )
      )
      .filter(Boolean);

  /* =====================================================
     SELECT OPTIONS
  ===================================================== */
  const getSelectOptions = (
    field
  ) => {
    const options = {
      blood_group: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
      gender: [
        "Male",
        "Female",
        "Other",
      ],
      marital_status: [
        "Single",
        "Married",
        "Divorced",
        "Widowed",
      ],
      group_living: [
        "Yes",
        "No",
      ],
      cooking: [
        "Yes",
        "No",
      ],
      religion: [
        "Islam",
        "Hinduism",
        "Buddhism",
        "Christianity",
        "Other",
      ],
      worship: [
        "Yes",
        "No",
      ],
      fasting: [
        "Yes",
        "No",
      ],
      debt: [
        "Yes",
        "No",
      ],
      driving_license: [
        "Yes",
        "No",
      ],
      international_driving_license: [
        "Yes",
        "No",
      ],
      bicycle_riding: [
        "Yes",
        "No",
      ],
      previous_coe_application: [
        "Yes",
        "No",
      ],
      resume_consent: [
        "Yes",
        "No",
      ],
      dominant_hand: [
        "Left",
        "Right",
      ],
      tattoo: [
        "Yes",
        "No",
      ],
      smoking: [
        "Yes",
        "No",
      ],
      alcohol: [
        "Yes",
        "No",
      ],
      family_2_relationship: [
        "Father",
        "Mother",
        "Sister",
        "Brother",
      ],
      family_3_relationship: [
        "Father",
        "Mother",
        "Sister",
        "Brother",
      ],
      family_4_relationship: [
        "Father",
        "Mother",
        "Sister",
        "Brother",
      ],
      family_5_relationship: [
        "Father",
        "Mother",
        "Sister",
        "Brother",
      ],
      family_2_living_status: [
        "সাথে থাকে",
        "আলাদা থাকে",
        "মৃত",
      ],
      family_3_living_status: [
        "সাথে থাকে",
        "আলাদা থাকে",
        "মৃত",
      ],
      family_4_living_status: [
        "সাথে থাকে",
        "আলাদা থাকে",
        "মৃত",
      ],
      family_5_living_status: [
        "সাথে থাকে",
        "আলাদা থাকে",
        "মৃত",
      ],
    };

    return (
      options[field] || []
    );
  };

  /* =====================================================
     RENDER NORMAL FIELD
  ===================================================== */
  const renderEditField = (
    field,
    label,
    type,
    extraProps = {}
  ) => {
    const value =
      form[field] ?? "";

    if (
      field ===
      "student_name_en"
    ) {
      return (
        <div
          className="student-edit-field"
          key={field}
        >
          <label>{label}</label>

          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleEnglishNameChange(
                e.target.value
              )
            }
            disabled={saving}
          />
        </div>
      );
    }

    if (
      field ===
      "katakana_name"
    ) {
      return (
        <div
          className="student-edit-field"
          key={field}
        >
          <label>{label}</label>

          <input
            type="text"
            value={value}
            readOnly
            className="student-auto-field"
          />
        </div>
      );
    }

    if (
      type === "textarea"
    ) {
      return (
        <div
          className="student-edit-field student-edit-field-full"
          key={field}
        >
          <label>{label}</label>

          <textarea
            value={value}
            onChange={(e) =>
              handleChange(
                field,
                e.target.value
              )
            }
            disabled={
              saving ||
              extraProps.disabled
            }
            rows={3}
          />
        </div>
      );
    }

    if (
      type === "select"
    ) {
      const options =
        getSelectOptions(
          field
        );

      return (
        <div
          className="student-edit-field"
          key={field}
        >
          <label>{label}</label>

          <select
            value={value}
            onChange={(e) =>
              handleChange(
                field,
                e.target.value
              )
            }
            disabled={
              saving ||
              extraProps.disabled
            }
          >
            <option value="">
              Select
            </option>

            {options.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      );
    }

    return (
      <div
        className="student-edit-field"
        key={field}
      >
        <label>{label}</label>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            handleChange(
              field,
              e.target.value
            )
          }
          disabled={
            saving ||
            READONLY_FIELDS.includes(
              field
            ) ||
            extraProps.disabled
          }
        />
      </div>
    );
  };

  /* =====================================================
     VIEW FIELD
  ===================================================== */
  const renderViewField = (
    field,
    label
  ) => (
    <div
      className="student-info-row"
      key={field}
    >
      <div className="student-info-label">
        {label}
      </div>

      <div className="student-info-value">
        {displayValue(
          currentStudent?.[field]
        )}
      </div>
    </div>
  );

  const renderAddressView = () => (
    <div className="student-education-view">
      <div className="student-education-table-wrap">
        <table className="student-education-table">
          <thead>
            <tr>
              <th>Address Type</th>
              <th>Village</th>
              <th>Post</th>
              <th>Thana</th>
              <th>District</th>
            </tr>
          </thead>

          <tbody>
            {[
              ["Present", "present"],
              ["Permanent", "permanent"],
            ].map(([label, prefix]) => (
              <tr key={prefix}>
                <td><strong>{label}</strong></td>
                <td>{displayValue(currentStudent?.[`${prefix}_village`])}</td>
                <td>{displayValue(currentStudent?.[`${prefix}_post`])}</td>
                <td>{displayValue(currentStudent?.[`${prefix}_thana`])}</td>
                <td>{displayValue(currentStudent?.[`${prefix}_district`])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* =====================================================
     EDUCATION EDIT
  ===================================================== */
  const renderEducationEdit =
    () => (
      <div className="student-special-editor">
        <h4>
          {text.educationalDetails}
        </h4>

        <div className="student-education-table-wrap">
          <table className="student-education-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Institute</th>
                <th>Board / University</th>
                <th>Roll</th>
                <th>Registration</th>
                <th>Group</th>
                <th>Passing Year</th>
                <th>GPA / Result</th>
              </tr>
            </thead>

            <tbody>
              {[
                {
                  exam: "SSC",
                  prefix: "ssc",
                  result: "ssc_gpa",
                },
                {
                  exam: "HSC",
                  prefix: "hsc",
                  result: "hsc_gpa",
                },
              ].map(
                ({
                  exam,
                  prefix,
                  result,
                }) => (
                  <tr key={exam}>
                    <td>
                      <strong>
                        {exam}
                      </strong>
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            `${prefix}_institute`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_institute`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            `${prefix}_board`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_board`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            `${prefix}_roll`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_roll`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            `${prefix}_registration`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_registration`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            `${prefix}_group`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_group`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={
                          form[
                            `${prefix}_passing_year`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            `${prefix}_passing_year`,
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={
                          form[
                            result
                          ] || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            result,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="student-add-row-actions">
          {!showHonours && (
            <button
              type="button"
              onClick={() =>
                setShowHonours(true)
              }
            >
              +{" "}
              {text.addHonours}
            </button>
          )}

          {!showMasters && (
            <button
              type="button"
              onClick={() =>
                setShowMasters(true)
              }
            >
              +{" "}
              {text.addMasters}
            </button>
          )}
        </div>

        {showHonours && (
          <div className="student-extra-education">
            <h4>Honours</h4>

            <div className="student-edit-grid">
              {[
                [
                  "honours_institute",
                  "Institute",
                  "text",
                ],
                [
                  "honours_university",
                  "University",
                  "text",
                ],
                [
                  "honours_roll",
                  "Roll",
                  "text",
                ],
                [
                  "honours_registration",
                  "Registration",
                  "text",
                ],
                [
                  "honours_group",
                  "Group",
                  "text",
                ],
                [
                  "honours_passing_year",
                  "Passing Year",
                  "number",
                ],
                [
                  "honours_result",
                  "Result",
                  "text",
                ],
              ].map(
                ([
                  field,
                  label,
                  type,
                ]) =>
                  renderEditField(
                    field,
                    label,
                    type
                  )
              )}
            </div>
          </div>
        )}

        {showMasters && (
          <div className="student-extra-education">
            <h4>Masters</h4>

            <div className="student-edit-grid">
              {[
                [
                  "masters_institute",
                  "Institute",
                  "text",
                ],
                [
                  "masters_university",
                  "University",
                  "text",
                ],
                [
                  "masters_roll",
                  "Roll",
                  "text",
                ],
                [
                  "masters_registration",
                  "Registration",
                  "text",
                ],
                [
                  "masters_group",
                  "Group",
                  "text",
                ],
                [
                  "masters_passing_year",
                  "Passing Year",
                  "number",
                ],
                [
                  "masters_result",
                  "Result",
                  "text",
                ],
              ].map(
                ([
                  field,
                  label,
                  type,
                ]) =>
                  renderEditField(
                    field,
                    label,
                    type
                  )
              )}
            </div>
          </div>
        )}
      </div>
    );

  /* =====================================================
     ADDRESS EDIT
  ===================================================== */
  const renderAddressEdit =
    () => (
      <div className="student-special-editor">
        <div className="student-address-section">
          <h4>
            {text.presentAddress}
          </h4>

          <div className="student-edit-grid">
            {[
              [
                "present_village",
                "Village",
              ],
              [
                "present_post",
                "Post",
              ],
              [
                "present_thana",
                "Thana",
              ],
              [
                "present_district",
                "District",
              ],
            ].map(
              ([field, label]) =>
                renderEditField(
                  field,
                  label,
                  "text"
                )
            )}
          </div>
        </div>

        <div className="student-address-section">
          <div className="student-address-heading">
            <h4>
              {text.permanentAddress}
            </h4>

            <label className="student-checkbox-label">
              <input
                type="checkbox"
                checked={
                  sameAddress
                }
                onChange={(e) => {
                  const checked =
                    e.target.checked;

                  setSameAddress(
                    checked
                  );

                  if (checked) {
                    setForm(
                      (prev) =>
                        syncPermanentAddress(
                          prev
                        )
                    );
                  }
                }}
              />

              <span>
                {text.sameAddress}
              </span>
            </label>
          </div>

          <div className="student-edit-grid">
            {[
              [
                "permanent_village",
                "Village",
              ],
              [
                "permanent_post",
                "Post",
              ],
              [
                "permanent_thana",
                "Thana",
              ],
              [
                "permanent_district",
                "District",
              ],
            ].map(
              ([field, label]) =>
                renderEditField(
                  field,
                  label,
                  "text",
                  {
                    disabled:
                      sameAddress,
                  }
                )
            )}
          </div>
        </div>
      </div>
    );

  /* =====================================================
     SKILLS EDIT
  ===================================================== */
  const renderSkillsEdit =
    () => (
      <div className="student-special-editor">
        <h4>
          Height & Weight
        </h4>

        <div className="student-edit-grid">
          <div className="student-edit-field">
            <label>
              Height
            </label>

            <div className="student-height-inputs">
              <input
                type="number"
                min="1"
                max="8"
                placeholder="Feet"
                value={
                  heightFeet
                }
                onChange={(e) =>
                  updateHeight(
                    e.target.value,
                    heightInches
                  )
                }
              />

              <span>'</span>

              <input
                type="number"
                min="0"
                max="11"
                placeholder="Inches"
                value={
                  heightInches
                }
                onChange={(e) =>
                  updateHeight(
                    heightFeet,
                    e.target.value
                  )
                }
              />

              <span>"</span>

              <strong>
                {form.height_cm
                  ? `${form.height_cm} cm`
                  : "—"}
              </strong>
            </div>
          </div>

          {renderEditField(
            "weight_kg",
            "Weight (kg)",
            "number"
          )}
        </div>
      </div>
    );

  /* =====================================================
     EYESIGHT / PHYSICAL EDIT
  ===================================================== */
  const renderPhysicalEdit =
    () => {
      const eyesightParts =
        String(
          form.eyesight || ""
        )
          .split("|")
          .map((item) =>
            item.trim()
          );

      const leftEye =
        eyesightParts[0] || "";

      const rightEye =
        eyesightParts[1] || "";

      const updateEyesight = (
        left,
        right
      ) => {
        handleChange(
          "eyesight",
          `${left}|${right}`
        );
      };

      const eyeOptions = [
        "Normal",
        "0.00",
        "-0.25",
        "-0.50",
        "-0.75",
        "-1.00",
        "-1.25",
        "-1.50",
        "-1.75",
        "-2.00",
        "-2.50",
        "-3.00",
        "+0.25",
        "+0.50",
        "+0.75",
        "+1.00",
        "+1.50",
        "+2.00",
      ];

      return (
        <div className="student-special-editor">
          <div className="student-edit-grid">
            {renderEditField(
              "dominant_hand",
              "Dominant Hand",
              "select"
            )}

            {renderEditField(
              "tattoo",
              "Tattoo",
              "select"
            )}

            <div className="student-edit-field student-edit-field-full">
              <label>
                Eyesight
              </label>

              <div className="student-eyesight-grid">
                <select
                  value={
                    leftEye
                  }
                  onChange={(e) =>
                    updateEyesight(
                      e.target.value,
                      rightEye
                    )
                  }
                >
                  <option value="">
                    Left Eye
                  </option>

                  {eyeOptions.map(
                    (option) => (
                      <option
                        key={`l-${option}`}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    rightEye
                  }
                  onChange={(e) =>
                    updateEyesight(
                      leftEye,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Right Eye
                  </option>

                  {eyeOptions.map(
                    (option) => (
                      <option
                        key={`r-${option}`}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {renderEditField(
              "smoking",
              "Smoking",
              "select"
            )}

            {renderEditField(
              "alcohol",
              "Alcohol",
              "select"
            )}
          </div>
        </div>
      );
    };

  /* =====================================================
     FAMILY EDIT
  ===================================================== */
  const renderFamilyEdit =
    () => {
      const familyNumbers = [
        2,
        3,
        4,
        5,
      ];

      return (
        <div className="student-special-editor">
          <h4>
            {text.familyDetails}
          </h4>

          <div className="student-family-table-wrap">
            <table className="student-family-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Age</th>
                  <th>Relationship</th>
                  <th>Occupation</th>
                  <th>Living Status</th>
                </tr>
              </thead>

              <tbody>
                {familyNumbers.map(
                  (
                    number,
                    index
                  ) => {
                    const dateField =
                      `family_${number}_date_of_birth`;

                    return (
                      <tr
                        key={number}
                      >
                        <td>
                          <strong>
                            {index +
                              1}
                          </strong>
                        </td>

                        <td>
                          <input
                            value={
                              form[
                                `family_${number}_name`
                              ] || ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleChange(
                                `family_${number}_name`,
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="date"
                            value={
                              form[
                                dateField
                              ] || ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleFamilyDateChange(
                                dateField,
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={
                              form[
                                `family_${number}_age`
                              ] || ""
                            }
                            readOnly
                          />
                        </td>

                        <td>
                          <select
                            value={
                              form[
                                `family_${number}_relationship`
                              ] || ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleChange(
                                `family_${number}_relationship`,
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>

                            <option value="Father">
                              Father
                            </option>

                            <option value="Mother">
                              Mother
                            </option>

                            <option value="Sister">
                              Sister
                            </option>

                            <option value="Brother">
                              Brother
                            </option>
                          </select>
                        </td>

                        <td>
                          <input
                            value={
                              form[
                                `family_${number}_occupation`
                              ] || ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleChange(
                                `family_${number}_occupation`,
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <select
                            value={
                              form[
                                `family_${number}_living_status`
                              ] || ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleChange(
                                `family_${number}_living_status`,
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>

                            <option value="সাথে থাকে">
                              সাথে থাকে
                            </option>

                            <option value="আলাদা থাকে">
                              আলাদা থাকে
                            </option>

                            <option value="মৃত">
                              মৃত
                            </option>
                          </select>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

  /* =====================================================
     DOCUMENT PREVIEW
  ===================================================== */
  const renderDocumentPreview =
    (card) => {
      const url =
        getFileUrl(
          currentStudent?.[
            card.field
          ]
        );

      if (!url) {
        return (
          <div className="student-document-preview empty">
            {text.notUploaded}
          </div>
        );
      }

      const isPdf =
        /\.pdf($|\?)/i.test(
          url
        );

      return (
        <div className="student-document-preview">
          {isPdf ? (
            <iframe
              src={url}
              title={card.label}
              className="student-document-pdf"
            />
          ) : (
            <img
              src={url}
              alt={card.label}
              className="student-document-preview-image"
            />
          )}
        </div>
      );
    };

  /* =====================================================
     DOCUMENT META EDITOR
  ===================================================== */
  const renderDocumentMeta =
    (card) => {
      if (!card.numberField) {
        return null;
      }

      const editing =
        isDocumentEditing(
          card
        );

      const metadata =
        documentEdit?.[
          card.key
        ] || {};

      if (editing) {
        return (
          <div className="student-document-meta-edit">
            <div className="student-document-meta-field">
              <label>
                {text.number}
              </label>

              <input
                type="text"
                value={
                  metadata.number ||
                  ""
                }
                onChange={(e) =>
                  handleDocumentMetaChange(
                    card,
                    "number",
                    e.target.value
                  )
                }
                disabled={
                  documentSaving ===
                  card.key
                }
              />
            </div>

            {card.issueField && (
              <div className="student-document-meta-field">
                <label>
                  {text.issueDate}
                </label>

                <input
                  type="date"
                  value={
                    metadata.issueDate ||
                    ""
                  }
                  onChange={(e) =>
                    handleDocumentMetaChange(
                      card,
                      "issueDate",
                      e.target.value
                    )
                  }
                  disabled={
                    documentSaving ===
                    card.key
                  }
                />
              </div>
            )}

            {card.expiryField && (
              <div className="student-document-meta-field">
                <label>
                  {text.expiryDate}
                </label>

                <input
                  type="date"
                  value={
                    metadata.expiryDate ||
                    ""
                  }
                  onChange={(e) =>
                    handleDocumentMetaChange(
                      card,
                      "expiryDate",
                      e.target.value
                    )
                  }
                  disabled={
                    documentSaving ===
                    card.key
                  }
                />
              </div>
            )}

            <div className="student-document-meta-actions">
              <button
                type="button"
                onClick={() =>
                  saveDocumentMetadata(
                    card
                  )
                }
                disabled={
                  documentSaving ===
                  card.key
                }
              >
                {documentSaving ===
                card.key
                  ? text.documentSaving
                  : text.saveDocument}
              </button>

              <button
                type="button"
                onClick={() =>
                  cancelDocumentEdit(
                    card
                  )
                }
                disabled={
                  documentSaving ===
                  card.key
                }
              >
                {text.cancel}
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="student-document-meta-view">
          <div className="student-document-meta">
            <strong>
              {text.number}
            </strong>

            <span>
              {displayValue(
                currentStudent?.[
                  card.numberField
                ]
              )}
            </span>
          </div>

          {card.issueField && (
            <div className="student-document-meta">
              <strong>
                {text.issueDate}
              </strong>

              <span>
                {displayValue(
                  currentStudent?.[
                    card.issueField
                  ]
                )}
              </span>
            </div>
          )}

          {card.expiryField && (
            <div className="student-document-meta">
              <strong>
                {text.expiryDate}
              </strong>

              <span>
                {displayValue(
                  currentStudent?.[
                    card.expiryField
                  ]
                )}
              </span>
            </div>
          )}

          <button
            type="button"
            className="student-document-edit-meta-button"
            onClick={() =>
              startDocumentEdit(
                card
              )
            }
          >
            ✏️ {text.editDocument}
          </button>
        </div>
      );
    };

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
            {(saveMessage ||
              saveError) && (
              <div
                className={
                  saveError
                    ? "student-document-message error"
                    : "student-document-message success"
                }
              >
                {saveError ||
                  saveMessage}
              </div>
            )}

            {/* COMPLETION */}
            <section className="student-completion-section no-print">
              <div className="student-completion-header">
                <div>
                  <h3>
                    {
                      text.profileCompletion
                    }
                  </h3>

                  <p>
                    {
                      text.completionInfo
                    }
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
                        <img
                          src={
                            photoUrl
                          }
                          alt={
                            studentName
                          }
                        />
                      ) : (
                        <span>
                          👤
                        </span>
                      )}
                    </div>

                    <div className="student-sidebar-profile-details">
                      <strong>
                        {
                          studentName
                        }
                      </strong>

                      <small>
                        {
                          text.studentId
                        }
                        :{" "}
                        {displayValue(
                          currentStudent?.student_id
                        )}
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
                        className={
                          language ===
                          "bn"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setLanguage(
                            "bn"
                          )
                        }
                      >
                        বাংলা
                      </button>

                      <button
                        type="button"
                        className={
                          language ===
                          "en"
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setLanguage(
                            "en"
                          )
                        }
                      >
                        English
                      </button>
                    </div>

                    <button
                      type="button"
                      className="student-portal-logout"
                      onClick={
                        handleLogout
                      }
                    >
                      {text.logout}
                    </button>
                  </div>
                </div>

                <div className="student-tab-sidebar-title">
                  {
                    text.profileSections
                  }
                </div>

                {groups.map(
                  ([
                    groupKey,
                  ]) => (
                    <button
                      key={
                        groupKey
                      }
                      type="button"
                      className={
                        activeTab ===
                        groupKey
                          ? "student-tab-button active"
                          : "student-tab-button"
                      }
                      onClick={() =>
                        handleTabChange(
                          groupKey
                        )
                      }
                    >
                      {getGroupTitle(
                        groupKey,
                        language
                      )}
                    </button>
                  )
                )}
              </aside>

              {/* RIGHT CONTENT */}
              <main className="student-tab-content">
                {/* DOCUMENT TAB */}
                {activeTab ===
                "documents" ? (
                  <section
                    id="document-update"
                    className="student-profile-section student-active-tab-section no-print"
                  >
                    <div className="student-tab-content-header">
                      <div>
                        <h3>
                          {
                            text.documentUpdate
                          }
                        </h3>

                        <p>
                          {
                            text.documentDescription
                          }
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
                            key={
                              card.key
                            }
                          >
                            <div className="student-document-icon">
                              {
                                card.icon
                              }
                            </div>

                            <div className="student-document-content">
                              <h4>
                                {
                                  card.label
                                }
                              </h4>

                              {renderDocumentPreview(
                                card
                              )}

                              {renderDocumentMeta(
                                card
                              )}

                              <label className="student-document-button">
                                <input
                                  type="file"
                                  accept={
                                    card.accept
                                  }
                                  hidden
                                  disabled={
                                    uploadingDoc ===
                                    card.key
                                  }
                                  onChange={(
                                    e
                                  ) => {
                                    const file =
                                      e
                                        .target
                                        .files?.[0];

                                    if (
                                      file
                                    ) {
                                      handleDocumentUpload(
                                        card,
                                        file
                                      );
                                    }

                                    e.target.value =
                                      "";
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
                          {
                            activeGroupTitle
                          }
                        </h3>

                        <p>
                          {
                            text.editDescription
                          }
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={
                        handleSave
                      }
                    >
                      {activeTab ===
                      "education"
                        ? renderEducationEdit()
                        : activeTab ===
                          "address"
                        ? renderAddressEdit()
                        : activeTab ===
                          "skills"
                        ? renderSkillsEdit()
                        : activeTab ===
                          "physical"
                        ? renderPhysicalEdit()
                        : activeTab ===
                          "family"
                        ? renderFamilyEdit()
                        : (
                            <div className="student-edit-group">
                              <h4>
                                {
                                  activeGroupTitle
                                }
                              </h4>

                              <div className="student-edit-grid">
                                {activeFieldDefinitions.map(
                                  ([
                                    field,
                                    label,
                                    type,
                                  ]) =>
                                    renderEditField(
                                      field,
                                      label,
                                      type
                                    )
                                )}
                              </div>
                            </div>
                          )}

                      <div className="student-edit-actions">
                        <button
                          type="submit"
                          className="student-save-button"
                          disabled={
                            saving
                          }
                        >
                          {saving
                            ? text.saving
                            : `💾 ${text.saveSection}`}
                        </button>

                        <button
                          type="button"
                          className="student-cancel-button"
                          onClick={
                            cancelEdit
                          }
                          disabled={
                            saving
                          }
                        >
                          {
                            text.cancel
                          }
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
                          {
                            activeGroupTitle
                          }
                        </h3>

                        <p>
                          {
                            text.profileInformation
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        className="student-profile-edit-button"
                        onClick={
                          startEdit
                        }
                      >
                        ✏️{" "}
                        {
                          text.editProfile
                        }
                      </button>
                    </div>

                    {activeTab ===
                    "address" ? renderAddressView() : activeTab ===
                    "education" ? (
                      <div className="student-education-view">
                        <div className="student-education-table-wrap">
                          <table className="student-education-table">
                            <thead>
                              <tr>
                                <th>
                                  Exam
                                </th>
                                <th>
                                  Institute
                                </th>
                                <th>
                                  Board / University
                                </th>
                                <th>
                                  Roll
                                </th>
                                <th>
                                  Registration
                                </th>
                                <th>
                                  Group
                                </th>
                                <th>
                                  Passing Year
                                </th>
                                <th>
                                  GPA / Result
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              <tr>
                                <td>
                                  <strong>
                                    SSC
                                  </strong>
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_institute
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_board
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_roll
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_registration
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_group
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_passing_year
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.ssc_gpa
                                  )}
                                </td>
                              </tr>

                              <tr>
                                <td>
                                  <strong>
                                    HSC
                                  </strong>
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_institute
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_board
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_roll
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_registration
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_group
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_passing_year
                                  )}
                                </td>

                                <td>
                                  {displayValue(
                                    currentStudent?.hsc_gpa
                                  )}
                                </td>
                              </tr>

                              {(
                                isFilled(
                                  currentStudent?.honours_institute
                                ) ||
                                isFilled(
                                  currentStudent?.honours_result
                                )
                              ) && (
                                <tr>
                                  <td>
                                    <strong>
                                      Honours
                                    </strong>
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_institute
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_university
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_roll
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_registration
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_group
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_passing_year
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.honours_result
                                    )}
                                  </td>
                                </tr>
                              )}

                              {(
                                isFilled(
                                  currentStudent?.masters_institute
                                ) ||
                                isFilled(
                                  currentStudent?.masters_result
                                )
                              ) && (
                                <tr>
                                  <td>
                                    <strong>
                                      Masters
                                    </strong>
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_institute
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_university
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_roll
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_registration
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_group
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_passing_year
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.masters_result
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : activeTab ===
                      "family" ? (
                      <div className="student-family-table-wrap">
                        <table className="student-family-table">
                          <thead>
                            <tr>
                              <th>
                                SL
                              </th>
                              <th>
                                Name
                              </th>
                              <th>
                                Date of Birth
                              </th>
                              <th>
                                Age
                              </th>
                              <th>
                                Relationship
                              </th>
                              <th>
                                Occupation
                              </th>
                              <th>
                                Living Status
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {[2, 3, 4, 5].map(
                              (
                                number,
                                index
                              ) => (
                                <tr
                                  key={
                                    number
                                  }
                                >
                                  <td>
                                    {
                                      index +
                                      1
                                    }
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_name`
                                      ]
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_date_of_birth`
                                      ]
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_age`
                                      ]
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_relationship`
                                      ]
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_occupation`
                                      ]
                                    )}
                                  </td>

                                  <td>
                                    {displayValue(
                                      currentStudent?.[
                                        `family_${number}_living_status`
                                      ]
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="student-info-table">
                        {activeFieldDefinitions.map(
                          ([
                            field,
                            label,
                          ]) =>
                            renderViewField(
                              field,
                              label
                            )
                        )}
                      </div>
                    )}
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