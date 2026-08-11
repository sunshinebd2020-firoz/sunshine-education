import "./StudentEntry.css";
import { useState } from "react";

export default function StudentEntry() {
  const initialForm = {
    studentId: "",
    admissionDate: new Date().toISOString().split("T")[0],

    branch: "",
    course: "",
    level: "",

    studentNameBn: "",
    studentNameEn: "",
    shortName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    bloodGroup: "",

    presentVillage: "",
    presentPost: "",
    presentThana: "",
    presentDistrict: "",

    permanentVillage: "",
    permanentPost: "",
    permanentThana: "",
    permanentDistrict: "",

    studentMobile: "",
    parentsMobile: "",
    homeMobile: "",

    sscInstitute: "",
    sscBoard: "",
    sscRoll: "",
    sscRegistration: "",
    sscGroup: "",
    sscPassingYear: "",
    sscGpa: "",

    hscInstitute: "",
    hscBoard: "",
    hscRoll: "",
    hscRegistration: "",
    hscGroup: "",
    hscPassingYear: "",
    hscGpa: "",

    honoursInstitute: "",
    honoursUniversity: "",
    honoursRoll: "",
    honoursRegistration: "",
    honoursGroup: "",
    honoursPassingYear: "",
    honoursResult: "",

    mastersInstitute: "",
    mastersUniversity: "",
    mastersRoll: "",
    mastersRegistration: "",
    mastersGroup: "",
    mastersPassingYear: "",
    mastersResult: "",

    courseFee: "",
  };

  const [form, setForm] = useState(initialForm);

  const [studentPhoto, setStudentPhoto] = useState(null);

  const [message, setMessage] = useState("");

  /* =========================
     Input Change
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      /*
        Admission Date থেকে
        Student ID preview

        Example:
        2026-08-11
        ↓
        SE260811
      */

      if (name === "admissionDate") {
        if (value) {
          const cleanDate = value.replace(/-/g, "").substring(2);

          updated.studentId = `SE${cleanDate}`;
        } else {
          updated.studentId = "";
        }
      }

      return updated;
    });
  };

  /* =========================
     Course Change
  ========================= */

  const handleCourseChange = (e) => {
    const course = e.target.value;

    setForm((prev) => ({
      ...prev,
      course,
      level: "",
    }));
  };

  /* =========================
     Submit
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (studentPhoto) {
      formData.append("student_photo", studentPhoto);
    }

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/add_student.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Student Saved Successfully. ID: ${data.student_id}`
        );

        setForm(initialForm);

        setStudentPhoto(null);

        const photoInput = document.getElementById("studentPhoto");

        if (photoInput) {
          photoInput.value = "";
        }
      } else {
        setMessage(data.message || "Failed to save student.");
      }
    } catch (error) {
      console.error("Error:", error);

      setMessage("Server connection failed");
    }
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="student-entry">

      <h1>Student Entry</h1>

      <p>নতুন শিক্ষার্থীর তথ্য সংরক্ষণ করুন</p>

      <form onSubmit={handleSubmit}>

        {/* =========================
            Personal Information
        ========================= */}

        <h2>Personal Information</h2>

        <div className="form-grid">

          {/* Student ID */}

          <div className="form-group">
            <label>Student ID</label>

            <input
              type="text"
              name="studentId"
              value={form.studentId}
              readOnly
              placeholder="Admission Date দিন"
            />

            <small>
              শেষের serial number server থেকে নির্ধারিত হবে।
            </small>
          </div>

          {/* Admission Date */}

          <div className="form-group">
            <label>Admission Date *</label>

            <input
              type="date"
              name="admissionDate"
              value={form.admissionDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Branch */}

          <div className="form-group">
            <label>Branch</label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>

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

              <option value="Online">
                Online
              </option>
            </select>
          </div>

          {/* Course */}

          <div className="form-group">
            <label>Course</label>

            <select
              name="course"
              value={form.course}
              onChange={handleCourseChange}
              required
            >
              <option value="">Select Course</option>

              <option value="Japanese">
                Japanese
              </option>

              <option value="German">
                German
              </option>

              <option value="Korean">
                Korean
              </option>
            </select>
          </div>

          {/* Level */}

          <div className="form-group">
  <label>Level</label>

  <select
    name="level"
    value={form.level}
    onChange={handleChange}
    required
  >
    <option value="">Select Level</option>

    {/* Korean Language */}
    {form.course === "Korean" && (
      <>
        <option value="Basic Course">Basic Course</option>
        <option value="TOPIK-1">TOPIK-1</option>
        <option value="TOPIK-2">TOPIK-2</option>
        <option value="Skill Test">Skill Test</option>
      </>
    )}

    {/* German Language */}
    {form.course === "German" && (
      <>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
      </>
    )}

    {/* Japanese Language */}
    {form.course === "Japanese" && (
      <>
        <option value="N5">N5</option>
        <option value="N4">N4</option>
        <option value="N3">N3</option>
        <option value="JFT">JFT</option>
        <option value="Mock Test Preparation">
          Mock Test Preparation
        </option>
        <option value="Interview Preparation">
          Interview Preparation
        </option>
        <option value="Skill Test (Construction)">
          Skill Test (Construction)
        </option>
        <option value="Skill Test (Agriculture)">
          Skill Test (Agriculture)
        </option>
        <option value="Skill Test (Caregiver)">
          Skill Test (Caregiver)
        </option>
      </>
    )}
  </select>
</div>

          {/* Student Photo */}

          <div className="form-group">
            <label>Student Photo</label>

            <input
              type="file"
              id="studentPhoto"
              accept="image/*"
              onChange={(e) =>
                setStudentPhoto(e.target.files[0])
              }
            />
          </div>

          {/* Student Name Bangla */}

          <div className="form-group">
            <label>Student's Name (Bangla)</label>

            <input
              type="text"
              name="studentNameBn"
              value={form.studentNameBn}
              onChange={handleChange}
              required
            />
          </div>

          {/* Student Name English */}

          <div className="form-group">
            <label>Student's Name (English)</label>

            <input
              type="text"
              name="studentNameEn"
              value={form.studentNameEn}
              onChange={handleChange}
              required
            />
          </div>

          {/* Short Name */}

          <div className="form-group">
            <label>Short Name</label>

            <input
              type="text"
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
            />
          </div>

          {/* Father */}

          <div className="form-group">
            <label>Father's Name</label>

            <input
              type="text"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
          </div>

          {/* Mother */}

          <div className="form-group">
            <label>Mother's Name</label>

            <input
              type="text"
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
            />
          </div>

          {/* DOB */}

          <div className="form-group">
            <label>Date of Birth</label>

            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          {/* Blood Group */}

          <div className="form-group">
            <label>Blood Group</label>

            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
            >
              <option value="">
                Select Blood Group
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

        </div>

        {/* =========================
            Present Address
        ========================= */}

        <h2>Present Address</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Village</label>

            <input
              name="presentVillage"
              value={form.presentVillage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Post</label>

            <input
              name="presentPost"
              value={form.presentPost}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Thana</label>

            <input
              name="presentThana"
              value={form.presentThana}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>

            <input
              name="presentDistrict"
              value={form.presentDistrict}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* =========================
            Permanent Address
        ========================= */}

        <h2>Permanent Address</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Village</label>

            <input
              name="permanentVillage"
              value={form.permanentVillage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Post</label>

            <input
              name="permanentPost"
              value={form.permanentPost}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Thana</label>

            <input
              name="permanentThana"
              value={form.permanentThana}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>

            <input
              name="permanentDistrict"
              value={form.permanentDistrict}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* =========================
            Contact Information
        ========================= */}

        <h2>Contact Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Student Mobile</label>

            <input
              name="studentMobile"
              value={form.studentMobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Parents Mobile</label>

            <input
              name="parentsMobile"
              value={form.parentsMobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Home Mobile</label>

            <input
              name="homeMobile"
              value={form.homeMobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Course Fee</label>

            <input
              type="number"
              name="courseFee"
              value={form.courseFee}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* =========================
            Educational Qualification
        ========================= */}

        <h2>Educational Qualification</h2>

        <h3>SSC</h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="sscInstitute"
              value={form.sscInstitute}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Board</label>
            <input
              name="sscBoard"
              value={form.sscBoard}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="sscRoll"
              value={form.sscRoll}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Registration No</label>
            <input
              name="sscRegistration"
              value={form.sscRegistration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Group</label>
            <input
              name="sscGroup"
              value={form.sscGroup}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Passing Year</label>
            <input
              name="sscPassingYear"
              value={form.sscPassingYear}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>GPA</label>
            <input
              name="sscGpa"
              value={form.sscGpa}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* HSC */}

        <h3>HSC</h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="hscInstitute"
              value={form.hscInstitute}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Board</label>
            <input
              name="hscBoard"
              value={form.hscBoard}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="hscRoll"
              value={form.hscRoll}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Registration No</label>
            <input
              name="hscRegistration"
              value={form.hscRegistration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Group</label>
            <input
              name="hscGroup"
              value={form.hscGroup}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Passing Year</label>
            <input
              name="hscPassingYear"
              value={form.hscPassingYear}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>GPA</label>
            <input
              name="hscGpa"
              value={form.hscGpa}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Honours */}

        <h3>Honours</h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="honoursInstitute"
              value={form.honoursInstitute}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>University</label>
            <input
              name="honoursUniversity"
              value={form.honoursUniversity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="honoursRoll"
              value={form.honoursRoll}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Registration No</label>
            <input
              name="honoursRegistration"
              value={form.honoursRegistration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Group / Subject</label>
            <input
              name="honoursGroup"
              value={form.honoursGroup}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Passing Year</label>
            <input
              name="honoursPassingYear"
              value={form.honoursPassingYear}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>GPA / Division</label>
            <input
              name="honoursResult"
              value={form.honoursResult}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Masters */}

        <h3>Masters</h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="mastersInstitute"
              value={form.mastersInstitute}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>University</label>
            <input
              name="mastersUniversity"
              value={form.mastersUniversity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="mastersRoll"
              value={form.mastersRoll}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Registration No</label>
            <input
              name="mastersRegistration"
              value={form.mastersRegistration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Group / Subject</label>
            <input
              name="mastersGroup"
              value={form.mastersGroup}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Passing Year</label>
            <input
              name="mastersPassingYear"
              value={form.mastersPassingYear}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>GPA / Division</label>
            <input
              name="mastersResult"
              value={form.mastersResult}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* =========================
            Save
        ========================= */}

        <button
          type="submit"
          className="save-student-button"
        >
          Save Student
        </button>

        {/* Message */}

        {message && (
          <p className="student-message">
            {message}
          </p>
        )}

      </form>
    </div>
  );
}