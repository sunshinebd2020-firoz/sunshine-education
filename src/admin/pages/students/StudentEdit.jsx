import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentEdit.css";

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentId: "",
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
    courseFee: "",

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
  });

  const [oldPhoto, setOldPhoto] = useState("");
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await fetch(
          `http://localhost/sunshine-api/api/student_details.php?id=${id}`
        );

        const text = await response.text();

        console.log("Student Details Response:", text);

        if (!response.ok) {
          throw new Error("HTTP Error: " + response.status);
        }

        const data = JSON.parse(text);

        if (!data.success) {
          setMessage(data.message || "Student data পাওয়া যায়নি");
          return;
        }

        const student = data.student;

        setForm({
          studentId: student.student_id || "",
          branch: student.branch || "",
          course: student.course || "",
          level: student.language_level || "",

          studentNameBn: student.student_name_bn || "",
          studentNameEn:
            student.student_name_en ||
            student.student_name ||
            "",

          shortName: student.short_name || "",
          fatherName: student.father_name || "",
          motherName: student.mother_name || "",
          dateOfBirth: student.date_of_birth || "",
          bloodGroup: student.blood_group || "",

          presentVillage: student.present_village || "",
          presentPost: student.present_post || "",
          presentThana: student.present_thana || "",
          presentDistrict: student.present_district || "",

          permanentVillage: student.permanent_village || "",
          permanentPost: student.permanent_post || "",
          permanentThana: student.permanent_thana || "",
          permanentDistrict: student.permanent_district || "",

          studentMobile:
            student.student_mobile ||
            student.mobile ||
            "",

          parentsMobile: student.parents_mobile || "",
          homeMobile: student.home_mobile || "",
          courseFee: student.course_fee || "",

          sscInstitute: student.ssc_institute || "",
          sscBoard: student.ssc_board || "",
          sscRoll: student.ssc_roll || "",
          sscRegistration: student.ssc_registration || "",
          sscGroup: student.ssc_group || "",
          sscPassingYear: student.ssc_passing_year || "",
          sscGpa: student.ssc_gpa || "",

          hscInstitute: student.hsc_institute || "",
          hscBoard: student.hsc_board || "",
          hscRoll: student.hsc_roll || "",
          hscRegistration: student.hsc_registration || "",
          hscGroup: student.hsc_group || "",
          hscPassingYear: student.hsc_passing_year || "",
          hscGpa: student.hsc_gpa || "",

          honoursInstitute: student.honours_institute || "",
          honoursUniversity: student.honours_university || "",
          honoursRoll: student.honours_roll || "",
          honoursRegistration: student.honours_registration || "",
          honoursGroup: student.honours_group || "",
          honoursPassingYear: student.honours_passing_year || "",
          honoursResult: student.honours_result || "",

          mastersInstitute: student.masters_institute || "",
          mastersUniversity: student.masters_university || "",
          mastersRoll: student.masters_roll || "",
          mastersRegistration: student.masters_registration || "",
          mastersGroup: student.masters_group || "",
          mastersPassingYear: student.masters_passing_year || "",
          mastersResult: student.masters_result || "",
        });

        setOldPhoto(student.student_photo || "");
      } catch (error) {
        console.error("Student Load Error:", error);
        setMessage("Server connection failed");
      }
    };

    loadStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCourseChange = (e) => {
    setForm((previous) => ({
      ...previous,
      course: e.target.value,
      level: "",
    }));
  };

  const handlePhotoChange = (e) => {
    setStudentPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();

    formData.append("id", id);

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (studentPhoto) {
      formData.append("student_photo", studentPhoto);
    }

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/student_update.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      console.log("PHP Response:", text);

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status + ": " + text
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON from PHP:", text);
        throw new Error("PHP returned invalid response");
      }

      if (data.success) {
        setMessage("Student Updated Successfully");

        setTimeout(() => {
          navigate("/admin/student-list");
        }, 1000);
      } else {
        setMessage(data.message || "Update failed");
        console.error("PHP Error:", data);
      }
    } catch (error) {
      console.error("Update Error:", error);
      setMessage(error.message || "Server connection failed");
    }
  };

  return (
    <div className="student-edit">

      <div className="edit-header">
        <div>
          <h1>Edit Student</h1>
          <p>শিক্ষার্থীর তথ্য পরিবর্তন করুন</p>
        </div>

        <div className="student-id-box">
          Student ID
          <strong>
            {form.studentId || `#${id}`}
          </strong>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        <h2>Personal Information</h2>

        <div className="form-grid">

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
            </select>
          </div>

          <div className="form-group">
            <label>Course</label>
            <select
              name="course"
              value={form.course}
              onChange={handleCourseChange}
              required
            >
              <option value="">Select Course</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
              <option value="Korean">Korean</option>
            </select>
          </div>

          <div className="form-group">
            <label>Level</label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="">Select Level</option>

              {form.course === "Japanese" && (
                <>
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="JFT">JFT</option>
                </>
              )}

              {(form.course === "German" ||
                form.course === "Korean") && (
                <>
                  <option value="Basic">Basic</option>
                  <option value="Skill Test">
                    Skill Test
                  </option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Student Photo</label>

            {oldPhoto && (
              <img
                src={`http://localhost/sunshine-api/uploads/students/${oldPhoto}`}
                alt="Student"
                className="edit-student-photo"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="form-group">
            <label>Student's Name (Bangla)</label>
            <input
              name="studentNameBn"
              value={form.studentNameBn}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Student's Name (English)</label>
            <input
              name="studentNameEn"
              value={form.studentNameEn}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Short Name</label>
            <input
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Father's Name</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mother's Name</label>
            <input
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
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

        <h2>Contact Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Student Mobile</label>
            <input
              name="studentMobile"
              value={form.studentMobile}
              onChange={handleChange}
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

        <div className="edit-buttons">

          <button
            type="submit"
            className="update-button"
          >
            Update Student
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/admin/student-list")
            }
          >
            Cancel
          </button>

        </div>

        {message && (
          <p className="student-message">
            {message}
          </p>
        )}

      </form>

    </div>
  );
}