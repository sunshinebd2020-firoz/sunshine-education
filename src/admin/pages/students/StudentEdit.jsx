import "./StudentEdit.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://localhost/sunshine-api";

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [student, setStudent] = useState({
    id: "",
    student_id: "",
    branch: "",
    course: "",
    language_level: "",

    student_name_bn: "",
    student_name_en: "",
    short_name: "",

    father_name: "",
    mother_name: "",
    date_of_birth: "",
    blood_group: "",

    present_village: "",
    present_post: "",
    present_thana: "",
    present_district: "",

    permanent_village: "",
    permanent_post: "",
    permanent_thana: "",
    permanent_district: "",

    student_mobile: "",
    parents_mobile: "",
    home_mobile: "",

    course_fee: "",

    ssc_institute: "",
    ssc_board: "",
    ssc_roll: "",
    ssc_registration: "",
    ssc_group: "",
    ssc_passing_year: "",
    ssc_gpa: "",

    hsc_institute: "",
    hsc_board: "",
    hsc_roll: "",
    hsc_registration: "",
    hsc_group: "",
    hsc_passing_year: "",
    hsc_gpa: "",

    honours_institute: "",
    honours_university: "",
    honours_roll: "",
    honours_registration: "",
    honours_group: "",
    honours_passing_year: "",
    honours_result: "",

    masters_institute: "",
    masters_university: "",
    masters_roll: "",
    masters_registration: "",
    masters_group: "",
    masters_passing_year: "",
    masters_result: "",

    student_photo: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const courseOptions = [
    "Japanese",
    "German",
    "Korean",
  ];

  const levelOptions = {
    Japanese: [
      "N5",
      "N4",
      "N3",
      "JFT",
    ],

    German: [
      "A1",
      "A2",
      "B1",
      "B2",
    ],

    Korean: [
      "Basic Course",
      "TOPIK-1",
      "TOPIK-2",
      "Skill Test",
    ],
  };

  /* =====================================================
     LOAD STUDENT
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await fetch(
          `${API_BASE}/api/student_details.php?id=${encodeURIComponent(id)}`
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          console.error("Invalid JSON:", text);
          throw new Error("Server থেকে সঠিক response পাওয়া যায়নি");
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Student information load করা যায়নি"
          );
        }

        if (!data.success || !data.student) {
          throw new Error(
            data.message || "Student information পাওয়া যায়নি"
          );
        }

        if (!mounted) return;

        const s = data.student;

        const loadedStudent = {
          ...student,

          id: s.id || id,
          student_id: s.student_id || "",

          branch: s.branch || "",
          course: s.course || "",
          language_level: s.language_level || "",

          student_name_bn: s.student_name_bn || "",

          student_name_en:
            s.student_name_en ||
            s.student_name ||
            "",

          short_name: s.short_name || "",

          father_name: s.father_name || "",
          mother_name: s.mother_name || "",

          date_of_birth:
            s.date_of_birth &&
            s.date_of_birth !== "0000-00-00"
              ? s.date_of_birth
              : "",

          blood_group: s.blood_group || "",

          present_village:
            s.present_village || "",

          present_post:
            s.present_post || "",

          present_thana:
            s.present_thana || "",

          present_district:
            s.present_district || "",

          permanent_village:
            s.permanent_village || "",

          permanent_post:
            s.permanent_post || "",

          permanent_thana:
            s.permanent_thana || "",

          permanent_district:
            s.permanent_district || "",

          student_mobile:
            s.student_mobile ||
            s.mobile ||
            "",

          parents_mobile:
            s.parents_mobile || "",

          home_mobile:
            s.home_mobile || "",

          course_fee:
            s.course_fee || "",

          ssc_institute:
            s.ssc_institute || "",

          ssc_board:
            s.ssc_board || "",

          ssc_roll:
            s.ssc_roll || "",

          ssc_registration:
            s.ssc_registration || "",

          ssc_group:
            s.ssc_group || "",

          ssc_passing_year:
            s.ssc_passing_year || "",

          ssc_gpa:
            s.ssc_gpa || "",

          hsc_institute:
            s.hsc_institute || "",

          hsc_board:
            s.hsc_board || "",

          hsc_roll:
            s.hsc_roll || "",

          hsc_registration:
            s.hsc_registration || "",

          hsc_group:
            s.hsc_group || "",

          hsc_passing_year:
            s.hsc_passing_year || "",

          hsc_gpa:
            s.hsc_gpa || "",

          honours_institute:
            s.honours_institute || "",

          honours_university:
            s.honours_university || "",

          honours_roll:
            s.honours_roll || "",

          honours_registration:
            s.honours_registration || "",

          honours_group:
            s.honours_group || "",

          honours_passing_year:
            s.honours_passing_year || "",

          honours_result:
            s.honours_result || "",

          masters_institute:
            s.masters_institute || "",

          masters_university:
            s.masters_university || "",

          masters_roll:
            s.masters_roll || "",

          masters_registration:
            s.masters_registration || "",

          masters_group:
            s.masters_group || "",

          masters_passing_year:
            s.masters_passing_year || "",

          masters_result:
            s.masters_result || "",

          student_photo:
            s.student_photo || "",
        };

        setStudent(loadedStudent);

        /* Existing photo */
        if (s.student_photo) {
          setPhotoPreview(
            `${API_BASE}/uploads/students/${encodeURIComponent(
              s.student_photo
            )}?t=${Date.now()}`
          );
        } else {
          setPhotoPreview("");
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err.message ||
              "Student information load করতে সমস্যা হয়েছে"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     COURSE CHANGE
  ===================================================== */

  const handleCourseChange = (e) => {
    const course = e.target.value;

    setStudent((prev) => ({
      ...prev,
      course,
      language_level: "",
    }));
  };

  /* =====================================================
     PHOTO CHANGE
  ===================================================== */

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("শুধু image file নির্বাচন করুন।");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Photo size সর্বোচ্চ 5 MB হতে হবে।");
      return;
    }

    setError("");

    setPhoto(file);

    /*
      আগের preview URL থাকলে revoke করার দরকার নেই,
      কারণ এটি শুধুমাত্র নতুন preview-এর জন্য ব্যবহৃত হচ্ছে।
    */
    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      /* ================= BASIC ================= */

      formData.append(
        "id",
        String(student.id || id)
      );

      formData.append(
        "student_id",
        student.student_id || ""
      );

      formData.append(
        "branch",
        student.branch || ""
      );

      formData.append(
        "course",
        student.course || ""
      );

      formData.append(
        "language_level",
        student.language_level || ""
      );

      /* ================= PERSONAL ================= */

      formData.append(
        "student_name_bn",
        student.student_name_bn || ""
      );

      formData.append(
        "student_name_en",
        student.student_name_en || ""
      );

      formData.append(
        "short_name",
        student.short_name || ""
      );

      formData.append(
        "father_name",
        student.father_name || ""
      );

      formData.append(
        "mother_name",
        student.mother_name || ""
      );

      formData.append(
        "date_of_birth",
        student.date_of_birth || ""
      );

      formData.append(
        "blood_group",
        student.blood_group || ""
      );

      /* ================= PRESENT ADDRESS ================= */

      formData.append(
        "present_village",
        student.present_village || ""
      );

      formData.append(
        "present_post",
        student.present_post || ""
      );

      formData.append(
        "present_thana",
        student.present_thana || ""
      );

      formData.append(
        "present_district",
        student.present_district || ""
      );

      /* ================= PERMANENT ADDRESS ================= */

      formData.append(
        "permanent_village",
        student.permanent_village || ""
      );

      formData.append(
        "permanent_post",
        student.permanent_post || ""
      );

      formData.append(
        "permanent_thana",
        student.permanent_thana || ""
      );

      formData.append(
        "permanent_district",
        student.permanent_district || ""
      );

      /* ================= CONTACT ================= */

      formData.append(
        "student_mobile",
        student.student_mobile || ""
      );

      formData.append(
        "parents_mobile",
        student.parents_mobile || ""
      );

      formData.append(
        "home_mobile",
        student.home_mobile || ""
      );

      formData.append(
        "course_fee",
        student.course_fee || ""
      );

      /* ================= SSC ================= */

      formData.append(
        "ssc_institute",
        student.ssc_institute || ""
      );

      formData.append(
        "ssc_board",
        student.ssc_board || ""
      );

      formData.append(
        "ssc_roll",
        student.ssc_roll || ""
      );

      formData.append(
        "ssc_registration",
        student.ssc_registration || ""
      );

      formData.append(
        "ssc_group",
        student.ssc_group || ""
      );

      formData.append(
        "ssc_passing_year",
        student.ssc_passing_year || ""
      );

      formData.append(
        "ssc_gpa",
        student.ssc_gpa || ""
      );

      /* ================= HSC ================= */

      formData.append(
        "hsc_institute",
        student.hsc_institute || ""
      );

      formData.append(
        "hsc_board",
        student.hsc_board || ""
      );

      formData.append(
        "hsc_roll",
        student.hsc_roll || ""
      );

      formData.append(
        "hsc_registration",
        student.hsc_registration || ""
      );

      formData.append(
        "hsc_group",
        student.hsc_group || ""
      );

      formData.append(
        "hsc_passing_year",
        student.hsc_passing_year || ""
      );

      formData.append(
        "hsc_gpa",
        student.hsc_gpa || ""
      );

      /* ================= HONOURS ================= */

      formData.append(
        "honours_institute",
        student.honours_institute || ""
      );

      formData.append(
        "honours_university",
        student.honours_university || ""
      );

      formData.append(
        "honours_roll",
        student.honours_roll || ""
      );

      formData.append(
        "honours_registration",
        student.honours_registration || ""
      );

      formData.append(
        "honours_group",
        student.honours_group || ""
      );

      formData.append(
        "honours_passing_year",
        student.honours_passing_year || ""
      );

      formData.append(
        "honours_result",
        student.honours_result || ""
      );

      /* ================= MASTERS ================= */

      formData.append(
        "masters_institute",
        student.masters_institute || ""
      );

      formData.append(
        "masters_university",
        student.masters_university || ""
      );

      formData.append(
        "masters_roll",
        student.masters_roll || ""
      );

      formData.append(
        "masters_registration",
        student.masters_registration || ""
      );

      formData.append(
        "masters_group",
        student.masters_group || ""
      );

      formData.append(
        "masters_passing_year",
        student.masters_passing_year || ""
      );

      formData.append(
        "masters_result",
        student.masters_result || ""
      );

      /* =====================================================
         OLD PHOTO
      ===================================================== */

      formData.append(
        "old_photo",
        student.student_photo || ""
      );

      /* =====================================================
         NEW PHOTO
         IMPORTANT:
         Field name must be student_photo
      ===================================================== */

      if (photo instanceof File) {
        formData.append(
          "student_photo",
          photo,
          photo.name
        );
      }

      /* =====================================================
         DEBUG
      ===================================================== */

      console.log("Updating student:", student.id || id);

      if (photo instanceof File) {
        console.log(
          "New photo:",
          photo.name,
          photo.type,
          photo.size
        );
      } else {
        console.log("No new photo selected");
      }

      /* =====================================================
         API
      ===================================================== */

      const response = await fetch(
        `${API_BASE}/api/student_update.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      console.log(
        "Student Update Response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server থেকে সঠিক response পাওয়া যায়নি"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Student update failed"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Student update failed"
        );
      }

      /* =====================================================
         UPDATED PHOTO
      ===================================================== */

      const updatedPhoto =
        data.student_photo ||
        data.student?.student_photo ||
        "";

      if (updatedPhoto) {
        setStudent((prev) => ({
          ...prev,
          student_photo: updatedPhoto,
        }));

        setPhotoPreview(
          `${API_BASE}/uploads/students/${encodeURIComponent(
            updatedPhoto
          )}?t=${Date.now()}`
        );

        /*
          New photo already saved.
          Clear selected File so another submit does not
          accidentally upload the same file again.
        */
        setPhoto(null);
      }

      setMessage(
        data.message ||
          "Student information updated successfully"
      );

      /* =====================================================
         REDIRECT
      ===================================================== */

      setTimeout(() => {
        navigate("/admin/student-list");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Student update করতে সমস্যা হয়েছে"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="student-edit">
        <div className="edit-loading">
          Loading student information...
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error && !student.id) {
    return (
      <div className="student-edit">
        <div className="edit-error">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/student-list")
          }
        >
          ← Back to Student List
        </button>
      </div>
    );
  }

  /* =====================================================
     FORM
  ===================================================== */

  return (
    <div className="student-edit">

      {/* ================= HEADER ================= */}

      <div className="student-edit-header">

        <div>
          <h1>Edit Student</h1>

          <p>
            শিক্ষার্থীর তথ্য পরিবর্তন করুন
          </p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/admin/student-list")
          }
        >
          ← Back
        </button>

      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ================= FORM ================= */}

      <form
        className="student-edit-form"
        onSubmit={handleSubmit}
      >

        {/* ================= BASIC ================= */}

        <section className="edit-section">

          <h2>Basic Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Student ID</label>

              <input
                type="text"
                value={
                  student.student_id || ""
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Branch</label>

              <select
                name="branch"
                value={
                  student.branch || ""
                }
                onChange={handleChange}
              >
                <option value="">
                  Select Branch
                </option>

                <option value="Rajshahi Main Branch">
                  Rajshahi Main Branch
                </option>

                <option value="Ramchandrapur Branch">
                  Ramchandrapur Branch
                </option>

                <option value="Khulna Branch">
                  Khulna Branch
                </option>

                <option value="Tangail Branch">
                  Tangail Branch
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Course</label>

              <select
                name="course"
                value={
                  student.course || ""
                }
                onChange={handleCourseChange}
              >
                <option value="">
                  Select Course
                </option>

                {courseOptions.map(
                  (course) => (
                    <option
                      key={course}
                      value={course}
                    >
                      {course}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Language Level</label>

              <select
                name="language_level"
                value={
                  student.language_level || ""
                }
                onChange={handleChange}
                disabled={!student.course}
              >
                <option value="">
                  Select Level
                </option>

                {(
                  levelOptions[
                    student.course
                  ] || []
                ).map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </section>

        {/* ================= PHOTO ================= */}

        <section className="edit-section">

          <h2>Student Photo</h2>

          <div className="photo-edit-area">

            <div className="current-photo">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Student"
                />
              ) : (
                <div className="no-photo">
                  No Photo
                </div>
              )}

            </div>

            <div className="photo-upload">

              <label>
                Change Photo
              </label>

              <input
                type="file"
                name="student_photo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              <small>
                JPG, JPEG, PNG, WEBP — Maximum 5 MB
              </small>

              {photo && (
                <small className="selected-photo">
                  Selected: {photo.name}
                </small>
              )}

            </div>

          </div>

        </section>

        {/* ================= PERSONAL ================= */}

        <section className="edit-section">

          <h2>Personal Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>
                Student Name Bangla
              </label>

              <input
                type="text"
                name="student_name_bn"
                value={
                  student.student_name_bn || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Student Name English
              </label>

              <input
                type="text"
                name="student_name_en"
                value={
                  student.student_name_en || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Short Name</label>

              <input
                type="text"
                name="short_name"
                value={
                  student.short_name || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Father's Name</label>

              <input
                type="text"
                name="father_name"
                value={
                  student.father_name || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mother's Name</label>

              <input
                type="text"
                name="mother_name"
                value={
                  student.mother_name || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="date"
                name="date_of_birth"
                value={
                  student.date_of_birth || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Blood Group</label>

              <select
                name="blood_group"
                value={
                  student.blood_group || ""
                }
                onChange={handleChange}
              >
                <option value="">
                  Select
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label>Course Fee</label>

              <input
                type="number"
                name="course_fee"
                value={
                  student.course_fee || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= CONTACT ================= */}

        <section className="edit-section">

          <h2>Contact Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Student Mobile</label>

              <input
                type="text"
                name="student_mobile"
                value={
                  student.student_mobile || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Parents Mobile</label>

              <input
                type="text"
                name="parents_mobile"
                value={
                  student.parents_mobile || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Home Mobile</label>

              <input
                type="text"
                name="home_mobile"
                value={
                  student.home_mobile || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= PRESENT ADDRESS ================= */}

        <section className="edit-section">

          <h2>Present Address</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Village</label>

              <input
                type="text"
                name="present_village"
                value={
                  student.present_village || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Post</label>

              <input
                type="text"
                name="present_post"
                value={
                  student.present_post || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Thana</label>

              <input
                type="text"
                name="present_thana"
                value={
                  student.present_thana || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>District</label>

              <input
                type="text"
                name="present_district"
                value={
                  student.present_district || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= PERMANENT ADDRESS ================= */}

        <section className="edit-section">

          <h2>Permanent Address</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Village</label>

              <input
                type="text"
                name="permanent_village"
                value={
                  student.permanent_village || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Post</label>

              <input
                type="text"
                name="permanent_post"
                value={
                  student.permanent_post || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Thana</label>

              <input
                type="text"
                name="permanent_thana"
                value={
                  student.permanent_thana || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>District</label>

              <input
                type="text"
                name="permanent_district"
                value={
                  student.permanent_district || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= SSC ================= */}

        <section className="edit-section">

          <h2>SSC Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Institute</label>

              <input
                name="ssc_institute"
                value={
                  student.ssc_institute || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Board</label>

              <input
                name="ssc_board"
                value={
                  student.ssc_board || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Roll No</label>

              <input
                name="ssc_roll"
                value={
                  student.ssc_roll || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Registration No</label>

              <input
                name="ssc_registration"
                value={
                  student.ssc_registration || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Group</label>

              <input
                name="ssc_group"
                value={
                  student.ssc_group || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Passing Year</label>

              <input
                name="ssc_passing_year"
                value={
                  student.ssc_passing_year || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GPA</label>

              <input
                name="ssc_gpa"
                value={
                  student.ssc_gpa || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= HSC ================= */}

        <section className="edit-section">

          <h2>HSC Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Institute</label>

              <input
                name="hsc_institute"
                value={
                  student.hsc_institute || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Board</label>

              <input
                name="hsc_board"
                value={
                  student.hsc_board || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Roll No</label>

              <input
                name="hsc_roll"
                value={
                  student.hsc_roll || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Registration No</label>

              <input
                name="hsc_registration"
                value={
                  student.hsc_registration || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Group</label>

              <input
                name="hsc_group"
                value={
                  student.hsc_group || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Passing Year</label>

              <input
                name="hsc_passing_year"
                value={
                  student.hsc_passing_year || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GPA</label>

              <input
                name="hsc_gpa"
                value={
                  student.hsc_gpa || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= HONOURS ================= */}

        <section className="edit-section">

          <h2>Honours Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Institute</label>

              <input
                name="honours_institute"
                value={
                  student.honours_institute || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>University</label>

              <input
                name="honours_university"
                value={
                  student.honours_university || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Roll No</label>

              <input
                name="honours_roll"
                value={
                  student.honours_roll || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Registration No</label>

              <input
                name="honours_registration"
                value={
                  student.honours_registration || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Group / Subject</label>

              <input
                name="honours_group"
                value={
                  student.honours_group || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Passing Year</label>

              <input
                name="honours_passing_year"
                value={
                  student.honours_passing_year || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GPA / Division</label>

              <input
                name="honours_result"
                value={
                  student.honours_result || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= MASTERS ================= */}

        <section className="edit-section">

          <h2>Masters Information</h2>

          <div className="edit-grid">

            <div className="form-group">
              <label>Institute</label>

              <input
                name="masters_institute"
                value={
                  student.masters_institute || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>University</label>

              <input
                name="masters_university"
                value={
                  student.masters_university || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Roll No</label>

              <input
                name="masters_roll"
                value={
                  student.masters_roll || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Registration No</label>

              <input
                name="masters_registration"
                value={
                  student.masters_registration || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Group / Subject</label>

              <input
                name="masters_group"
                value={
                  student.masters_group || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Passing Year</label>

              <input
                name="masters_passing_year"
                value={
                  student.masters_passing_year || ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GPA / Division</label>

              <input
                name="masters_result"
                value={
                  student.masters_result || ""
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* ================= BUTTONS ================= */}

        <div className="edit-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/admin/student-list")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Update Student"}
          </button>

        </div>

      </form>

    </div>
  );
}