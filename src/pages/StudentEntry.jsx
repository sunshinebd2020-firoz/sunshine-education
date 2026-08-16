import "./StudentEntry.css";
import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

export default function StudentEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isPublicEntry =
    window.location.pathname === "/student-entry";

  const getToday = () =>
    new Date().toISOString().split("T")[0];

  const initialForm = {
    studentId: "",
    admissionDate: getToday(),

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
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* =====================================================
     LOAD COURSES
  ===================================================== */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourseLoading(true);

        const response = await fetch(
          "http://localhost/sunshine-api/api/course_list.php"
        );

        if (!response.ok) {
          throw new Error("Course server error");
        }

        const data = await response.json();

        let courseData = [];

        if (Array.isArray(data)) {
          courseData = data;
        } else if (
          data &&
          Array.isArray(data.data)
        ) {
          courseData = data.data;
        }

        const activeCourses = courseData.filter(
          (course) => {
            const status = String(
              course.status ?? ""
            ).toLowerCase();

            return (
              status === "active" ||
              status === "1"
            );
          }
        );

        setCourses(activeCourses);
      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );

        setMessage(
          "কোর্সের তথ্য লোড করা যাচ্ছে না।"
        );
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /* =====================================================
     PUBLIC APPLY DATA
  ===================================================== */

  useEffect(() => {
    if (!isPublicEntry) return;

    const course =
      searchParams.get("course") || "";

    const language =
      searchParams.get("language") || "";

    const courseFee =
      searchParams.get("course_fee") || "";

    setForm((prev) => ({
      ...prev,
      course: language || prev.course,
      level: course || prev.level,
      courseFee:
        courseFee || prev.courseFee,
    }));
  }, [searchParams, isPublicEntry]);

  /* =====================================================
     STUDENT ID
  ===================================================== */

  const generateStudentId = (date) => {
    if (!date) return "";

    const cleanDate = date
      .replace(/-/g, "")
      .substring(2);

    return `SE${cleanDate}`;
  };

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "admissionDate") {
        updated.studentId =
          generateStudentId(value);
      }

      return updated;
    });
  };

  /* =====================================================
     COURSE CHANGE
  ===================================================== */

  const handleCourseChange = (e) => {
    const course = e.target.value;

    setForm((prev) => ({
      ...prev,
      course,
      level: "",
      courseFee: "",
    }));
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(
            key,
            value ?? ""
          );
        }
      );

      formData.append(
        "application_status",
        isPublicEntry
          ? "pending"
          : "approved"
      );

      if (studentPhoto) {
        formData.append(
          "student_photo",
          studentPhoto
        );
      }

      const response = await fetch(
        "http://localhost/sunshine-api/api/add_student.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Server error"
        );
      }

      if (!data.success) {
        setMessage(
          data.message ||
            "Student save failed."
        );
        return;
      }

      /* =====================================
         PUBLIC SUCCESS
      ===================================== */

      if (isPublicEntry) {
        setCompleted(true);

        setTimeout(() => {
          navigate("/");
        }, 5000);

        return;
      }

      /* =====================================
         ADMIN SUCCESS
      ===================================== */

      setMessage(
        `Student Saved Successfully. ID: ${
          data.student_id ||
          form.studentId ||
          ""
        }`
      );

      setForm({
        ...initialForm,
        admissionDate: getToday(),
      });

      setStudentPhoto(null);

      const photoInput =
        document.getElementById(
          "studentPhoto"
        );

      if (photoInput) {
        photoInput.value = "";
      }
    } catch (error) {
      console.error(
        "Submit error:",
        error
      );

      setMessage(
        error.message ||
          "Server connection failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     COMPLETION REPORT
  ===================================================== */

  if (
    isPublicEntry &&
    completed
  ) {
    return (
      <div className="student-entry">
        <div className="application-complete">
          <div className="success-icon">
            ✓
          </div>

          <h1>
            আবেদন সফলভাবে জমা হয়েছে
          </h1>

          <p>
            আপনার আবেদনটি সফলভাবে
            গ্রহণ করা হয়েছে।
          </p>

          <p>
            আবেদনটি বর্তমানে কর্তৃপক্ষের
            অনুমোদনের অপেক্ষায় রয়েছে।
          </p>

          <p>
            কর্তৃপক্ষ যাচাই করার পর
            আবেদনটি অনুমোদন করবে।
          </p>

          <p className="redirect-message">
            ৫ সেকেন্ডের মধ্যে Home
            Page-এ নিয়ে যাওয়া হবে...
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     SELECTED COURSE
  ===================================================== */

  const selectedCourse =
    courses.find(
      (course) =>
        course.course_name ===
        form.level
    );

  /* =====================================================
     LANGUAGE LIST
  ===================================================== */

  const languages = [
    ...new Set(
      courses
        .map(
          (course) =>
            course.language
        )
        .filter(Boolean)
    ),
  ];

  /* =====================================================
     LEVEL LIST
  ===================================================== */

  const levels = courses
    .filter(
      (course) =>
        course.language ===
        form.course
    )
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) -
        Number(b.sort_order || 0)
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className={`student-entry ${
        isPublicEntry
          ? "public-student-entry"
          : ""
      }`}
    >
      <div className="student-entry-header">
        <h1>
          {isPublicEntry
            ? "Student Application"
            : "Student Entry"}
        </h1>

        <p>
          {isPublicEntry
            ? "নতুন শিক্ষার্থী হিসেবে আবেদন করুন"
            : "নতুন শিক্ষার্থীর তথ্য সংরক্ষণ করুন"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* =====================================
            PERSONAL INFORMATION
        ===================================== */}

        <h2>Personal Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Student ID</label>

            <input
              type="text"
              name="studentId"
              value={form.studentId}
              readOnly
              placeholder="Auto generated"
            />
          </div>

          <div className="form-group">
            <label>
              Admission Date *
            </label>

            <input
              type="date"
              name="admissionDate"
              value={
                form.admissionDate
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Branch *</label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
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

              <option value="Online">
                Online
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Course *</label>

            <select
              name="course"
              value={form.course}
              onChange={
                handleCourseChange
              }
              required
            >
              <option value="">
                {courseLoading
                  ? "Loading courses..."
                  : "Select Course"}
              </option>

              {!courseLoading &&
                languages.map(
                  (language) => (
                    <option
                      key={language}
                      value={language}
                    >
                      {language}
                    </option>
                  )
                )}
            </select>
          </div>

          <div className="form-group">
            <label>Level *</label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Level
              </option>

              {levels.map(
                (course) => (
                  <option
                    key={course.id}
                    value={
                      course.course_name
                    }
                  >
                    {course.course_name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Course Fee</label>

            <input
              type="number"
              name="courseFee"
              value={form.courseFee}
              onChange={handleChange}
              readOnly={
                isPublicEntry &&
                !!selectedCourse
              }
            />
          </div>

          <div className="form-group">
            <label>Student Photo</label>

            <input
              type="file"
              id="studentPhoto"
              accept="image/*"
              onChange={(e) =>
                setStudentPhoto(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Student's Name (Bangla) *
            </label>

            <input
              type="text"
              name="studentNameBn"
              value={
                form.studentNameBn
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Student's Name (English) *
            </label>

            <input
              type="text"
              name="studentNameEn"
              value={
                form.studentNameEn
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Short Name</label>

            <input
              type="text"
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Father's Name</label>

            <input
              type="text"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mother's Name</label>

            <input
              type="text"
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
              value={
                form.dateOfBirth
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Blood Group</label>

            <select
              name="bloodGroup"
              value={
                form.bloodGroup
              }
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

        {/* =====================================
            PRESENT ADDRESS
        ===================================== */}

        <h2>Present Address</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Village</label>
            <input
              name="presentVillage"
              value={
                form.presentVillage
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Post</label>
            <input
              name="presentPost"
              value={
                form.presentPost
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Thana</label>
            <input
              name="presentThana"
              value={
                form.presentThana
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              name="presentDistrict"
              value={
                form.presentDistrict
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* =====================================
            PERMANENT ADDRESS
        ===================================== */}

        <h2>Permanent Address</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Village</label>
            <input
              name="permanentVillage"
              value={
                form.permanentVillage
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Post</label>
            <input
              name="permanentPost"
              value={
                form.permanentPost
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Thana</label>
            <input
              name="permanentThana"
              value={
                form.permanentThana
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              name="permanentDistrict"
              value={
                form.permanentDistrict
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* =====================================
            CONTACT
        ===================================== */}

        <h2>Contact Information</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>
              Student Mobile *
            </label>

            <input
              name="studentMobile"
              value={
                form.studentMobile
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Parents Mobile
            </label>

            <input
              name="parentsMobile"
              value={
                form.parentsMobile
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Home Mobile
            </label>

            <input
              name="homeMobile"
              value={
                form.homeMobile
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* =====================================
            EDUCATION
        ===================================== */}

        <h2>
          Educational Qualification
        </h2>

        {/* SSC */}

        <h3>SSC</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="sscInstitute"
              value={
                form.sscInstitute
              }
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
            <label>
              Registration No
            </label>
            <input
              name="sscRegistration"
              value={
                form.sscRegistration
              }
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
            <label>
              Passing Year
            </label>
            <input
              name="sscPassingYear"
              value={
                form.sscPassingYear
              }
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
              value={
                form.hscInstitute
              }
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
            <label>
              Registration No
            </label>
            <input
              name="hscRegistration"
              value={
                form.hscRegistration
              }
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
            <label>
              Passing Year
            </label>
            <input
              name="hscPassingYear"
              value={
                form.hscPassingYear
              }
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

        {/* HONOURS */}

        <h3>Honours</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="honoursInstitute"
              value={
                form.honoursInstitute
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>University</label>
            <input
              name="honoursUniversity"
              value={
                form.honoursUniversity
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="honoursRoll"
              value={
                form.honoursRoll
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Registration No
            </label>
            <input
              name="honoursRegistration"
              value={
                form.honoursRegistration
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Group / Subject
            </label>
            <input
              name="honoursGroup"
              value={
                form.honoursGroup
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Passing Year
            </label>
            <input
              name="honoursPassingYear"
              value={
                form.honoursPassingYear
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              GPA / Division
            </label>
            <input
              name="honoursResult"
              value={
                form.honoursResult
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* MASTERS */}

        <h3>Masters</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Institute Name</label>
            <input
              name="mastersInstitute"
              value={
                form.mastersInstitute
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>University</label>
            <input
              name="mastersUniversity"
              value={
                form.mastersUniversity
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              name="mastersRoll"
              value={
                form.mastersRoll
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Registration No
            </label>
            <input
              name="mastersRegistration"
              value={
                form.mastersRegistration
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Group / Subject
            </label>
            <input
              name="mastersGroup"
              value={
                form.mastersGroup
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Passing Year
            </label>
            <input
              name="mastersPassingYear"
              value={
                form.mastersPassingYear
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              GPA / Division
            </label>
            <input
              name="mastersResult"
              value={
                form.mastersResult
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`student-message ${
              submitting
                ? "loading"
                : ""
            }`}
          >
            {message}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          className="save-student-button"
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : isPublicEntry
            ? "Submit Application"
            : "Save Student"}
        </button>
      </form>
    </div>
  );
}