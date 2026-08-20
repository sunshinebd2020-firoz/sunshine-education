import "./StudentEntry.css";
import API_BASE_URL from "../../../config/api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function StudentEntry() {
  const [searchParams] = useSearchParams();

  const appliedCourse = searchParams.get("course") || "";

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
  };

  const [form, setForm] = useState(initialForm);

  const [studentPhoto, setStudentPhoto] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [sameAddress, setSameAddress] =
    useState(false);

  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] =
    useState(true);

  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] =
    useState(true);

  const [showHsc, setShowHsc] =
    useState(false);

  const [showHonours, setShowHonours] =
    useState(false);

  const [showMasters, setShowMasters] =
    useState(false);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "admissionDate") {
        if (value) {
          const cleanDate = value
            .replace(/-/g, "")
            .substring(2);

          updated.studentId =
            `SE${cleanDate}`;
        } else {
          updated.studentId = "";
        }
      }

      return updated;
    });
  };

  /* =========================================
     PHOTO
  ========================================= */

  const handlePhotoChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setStudentPhoto(file);

    if (file) {
      setPhotoPreview(
        URL.createObjectURL(file)
      );
    } else {
      setPhotoPreview("");
    }
  };

  /* =========================================
     SAME AS PRESENT ADDRESS
  ========================================= */

  const handleSameAddress = (e) => {
    const checked = e.target.checked;

    setSameAddress(checked);

    if (checked) {
      setForm((prev) => ({
        ...prev,

        permanentVillage:
          prev.presentVillage,

        permanentPost:
          prev.presentPost,

        permanentThana:
          prev.presentThana,

        permanentDistrict:
          prev.presentDistrict,
      }));
    }
  };

  /* =========================================
     KEEP PERMANENT ADDRESS UPDATED
     WHEN CHECKED
  ========================================= */

  useEffect(() => {
    if (!sameAddress) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((prev) => ({
      ...prev,

      permanentVillage:
        prev.presentVillage,

      permanentPost:
        prev.presentPost,

      permanentThana:
        prev.presentThana,

      permanentDistrict:
        prev.presentDistrict,
    }));
  }, [
    sameAddress,
    form.presentVillage,
    form.presentPost,
    form.presentThana,
    form.presentDistrict,
  ]);

  /* =========================================
     COURSE CHANGE
  ========================================= */

  const handleCourseChange = (e) => {
    const course = e.target.value;

    setForm((prev) => ({
      ...prev,
      course,
      level: "",
      courseFee: "",
    }));
  };

  /* =========================================
     LEVEL CHANGE
  ========================================= */

  const handleLevelChange = (e) => {
    const level = e.target.value;

    const selectedCourse = courses.find(
      (course) =>
        course.language === form.course &&
        course.course_name === level
    );

    setForm((prev) => ({
      ...prev,
      level,
      courseFee:
        selectedCourse?.course_fee ||
        prev.courseFee ||
        "",
    }));
  };

  /* =========================================
     LOAD COURSES
  ========================================= */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourseLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/course_list.php`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(
            "Course server error"
          );
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

        const activeCourses =
          courseData.filter((course) => {
            const status = String(
              course.status ?? ""
            ).toLowerCase();

            return (
              status === "active" ||
              status === "1"
            );
          });

        setCourses(activeCourses);

        /* Apply Now থেকে course এলে */

        if (appliedCourse) {
          const selectedCourse =
            activeCourses.find(
              (course) =>
                String(
                  course.course_name
                )
                  .trim()
                  .toLowerCase() ===
                String(appliedCourse)
                  .trim()
                  .toLowerCase()
            );

          if (selectedCourse) {
            setForm((prev) => ({
              ...prev,

              course:
                selectedCourse.language,

              level:
                selectedCourse.course_name,

              courseFee:
                selectedCourse.course_fee ||
                "",
            }));
          }
        }
      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, [appliedCourse]);

  /* =========================================
     LOAD BRANCHES
  ========================================= */

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/branch_list.php`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(
            "Branch server error"
          );
        }

        const data = await response.json();

        if (data.success) {
          setBranches(
            data.branches || []
          );
        }
      } catch (error) {
        console.error(
          "Branch loading error:",
          error
        );
      } finally {
        setBranchLoading(false);
      }
    };

    fetchBranches();
  }, []);

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const formData = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        formData.append(
          key,
          value ?? ""
        );
      }
    );

    if (studentPhoto) {
      formData.append(
        "student_photo",
        studentPhoto
      );
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/add_student.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Student Saved Successfully. ID: ${
            data.student_id ||
            form.studentId
          }`
        );

        setForm({
          ...initialForm,
          admissionDate: getToday(),
        });

        setStudentPhoto(null);
        setPhotoPreview("");
        setSameAddress(false);

        setShowHsc(false);
        setShowHonours(false);
        setShowMasters(false);

        const photoInput =
          document.getElementById(
            "studentPhoto"
          );

        if (photoInput) {
          photoInput.value = "";
        }
      } else {
        setMessage(
          data.message ||
            "Failed to save student."
        );
      }
    } catch (error) {
      console.error(
        "Submit error:",
        error
      );

      setMessage(
        "Server connection failed."
      );
    }
  };

  /* =========================================
     UNIQUE LANGUAGES
  ========================================= */

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

  /* =========================================
     SELECTED LEVELS
  ========================================= */

  const selectedLevels = courses
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

  /* =========================================
     ACTIVE BRANCHES
  ========================================= */

  const activeBranches =
    branches.filter((branch) => {
      const status = String(
        branch.status ?? ""
      ).toLowerCase();

      return (
        status === "active" ||
        status === "1"
      );
    });

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="student-entry">

      <div className="student-entry-header">
        <h1>Student Entry</h1>

        <p>
          নতুন শিক্ষার্থীর তথ্য সংরক্ষণ করুন
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* =================================
            PERSONAL INFORMATION
        ================================= */}

        <h2>Personal Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>
              Student ID
            </label>

            <input
              type="text"
              value={
                form.studentId
              }
              readOnly
              placeholder="Auto generated"
            />

            <small>
              শেষের serial number
              server থেকে নির্ধারিত হবে।
            </small>
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
            <label>
              Branch *
            </label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">
                {branchLoading
                  ? "Loading branches..."
                  : "Select Branch"}
              </option>

              {!branchLoading &&
                activeBranches.map(
                  (branch) => (
                    <option
                      key={branch.id}
                      value={
                        branch.branch_name
                      }
                    >
                      {
                        branch.branch_name
                      }
                    </option>
                  )
                )}
            </select>
          </div>

          <div className="form-group">
            <label>
              Course *
            </label>

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

              {languages.map(
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
            <label>
              Level *
            </label>

            <select
              name="level"
              value={form.level}
              onChange={
                handleLevelChange
              }
              required
            >
              <option value="">
                Select Level
              </option>

              {selectedLevels.map(
                (course) => (
                  <option
                    key={course.id}
                    value={
                      course.course_name
                    }
                  >
                    {
                      course.course_name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* PHOTO */}

          <div className="student-photo-section">

            <div className="form-group photo-upload">
              <label>
                Student Photo
              </label>

              <input
                type="file"
                id="studentPhoto"
                accept="image/*"
                onChange={
                  handlePhotoChange
                }
              />
            </div>

            {photoPreview && (
              <div className="student-photo-preview">
                <img
                  src={photoPreview}
                  alt="Student Preview"
                />
              </div>
            )}

          </div>

          {/* NAME */}

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
            <label>
              Short Name
            </label>

            <input
              type="text"
              name="shortName"
              value={
                form.shortName
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Course Fee
            </label>

            <input
              type="number"
              name="courseFee"
              value={
                form.courseFee
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Father's Name
            </label>

            <input
              type="text"
              name="fatherName"
              value={
                form.fatherName
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Mother's Name
            </label>

            <input
              type="text"
              name="motherName"
              value={
                form.motherName
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Date of Birth
            </label>

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
            <label>
              Blood Group
            </label>

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

              <option value="A+">
                A+
              </option>

              <option value="A-">
                A-
              </option>

              <option value="B+">
                B+
              </option>

              <option value="B-">
                B-
              </option>

              <option value="AB+">
                AB+
              </option>

              <option value="AB-">
                AB-
              </option>

              <option value="O+">
                O+
              </option>

              <option value="O-">
                O-
              </option>
            </select>
          </div>

        </div>

        {/* =================================
            PRESENT ADDRESS
        ================================= */}

        <h2>
          Present Address
        </h2>

        <div className="form-grid address-grid">

          <div className="form-group">
            <label>
              Village
            </label>

            <input
              name="presentVillage"
              value={
                form.presentVillage
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Post
            </label>

            <input
              name="presentPost"
              value={
                form.presentPost
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Thana
            </label>

            <input
              name="presentThana"
              value={
                form.presentThana
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              District
            </label>

            <input
              name="presentDistrict"
              value={
                form.presentDistrict
              }
              onChange={handleChange}
            />
          </div>

        </div>

        {/* =================================
            PERMANENT ADDRESS
        ================================= */}

        <div className="permanent-header">

          <h2>
            Permanent Address
          </h2>

          <label className="same-address">

            <input
              type="checkbox"
              checked={sameAddress}
              onChange={
                handleSameAddress
              }
            />

            <span>
              Same as Present Address
            </span>

          </label>

        </div>

        <div className="form-grid address-grid">

          <div className="form-group">
            <label>
              Village
            </label>

            <input
              name="permanentVillage"
              value={
                form.permanentVillage
              }
              onChange={handleChange}
              disabled={sameAddress}
            />
          </div>

          <div className="form-group">
            <label>
              Post
            </label>

            <input
              name="permanentPost"
              value={
                form.permanentPost
              }
              onChange={handleChange}
              disabled={sameAddress}
            />
          </div>

          <div className="form-group">
            <label>
              Thana
            </label>

            <input
              name="permanentThana"
              value={
                form.permanentThana
              }
              onChange={handleChange}
              disabled={sameAddress}
            />
          </div>

          <div className="form-group">
            <label>
              District
            </label>

            <input
              name="permanentDistrict"
              value={
                form.permanentDistrict
              }
              onChange={handleChange}
              disabled={sameAddress}
            />
          </div>

        </div>

        {/* =================================
            CONTACT
        ================================= */}

        <h2>
          Contact Information
        </h2>

        <div className="contact-grid">

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

        {/* =================================
            EDUCATION
        ================================= */}

        <h2>
          Educational Qualification
        </h2>

        {/* SSC */}

        <div className="qualification-section">

          <h3>SSC</h3>

          <div className="education-grid">

            <div className="form-group">
              <label>
                Institute Name
              </label>

              <input
                name="sscInstitute"
                value={
                  form.sscInstitute
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Board
              </label>

              <input
                name="sscBoard"
                value={
                  form.sscBoard
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Roll No
              </label>

              <input
                name="sscRoll"
                value={
                  form.sscRoll
                }
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
              <label>
                Group
              </label>

              <input
                name="sscGroup"
                value={
                  form.sscGroup
                }
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
              <label>
                GPA
              </label>

              <input
                name="sscGpa"
                value={
                  form.sscGpa
                }
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        {/* =================================
            ADD QUALIFICATION
        ================================= */}

        <div className="qualification-buttons">

          {!showHsc && (
            <button
              type="button"
              onClick={() =>
                setShowHsc(true)
              }
            >
              + Add HSC
            </button>
          )}

          {!showHonours && (
            <button
              type="button"
              onClick={() =>
                setShowHonours(true)
              }
            >
              + Add Honours
            </button>
          )}

          {!showMasters && (
            <button
              type="button"
              onClick={() =>
                setShowMasters(true)
              }
            >
              + Add Masters
            </button>
          )}

        </div>

        {/* =================================
            HSC
        ================================= */}

        {showHsc && (
          <div className="qualification-section">

            <div className="qualification-title">

              <h3>
                HSC
              </h3>

              <button
                type="button"
                className="remove-qualification"
                onClick={() =>
                  setShowHsc(false)
                }
              >
                Remove
              </button>

            </div>

            <div className="education-grid">

              <div className="form-group">
                <label>
                  Institute Name
                </label>

                <input
                  name="hscInstitute"
                  value={
                    form.hscInstitute
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Board
                </label>

                <input
                  name="hscBoard"
                  value={
                    form.hscBoard
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Roll No
                </label>

                <input
                  name="hscRoll"
                  value={
                    form.hscRoll
                  }
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Group
                </label>

                <input
                  name="hscGroup"
                  value={
                    form.hscGroup
                  }
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  GPA
                </label>

                <input
                  name="hscGpa"
                  value={
                    form.hscGpa
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>
          </div>
        )}

        {/* =================================
            HONOURS
        ================================= */}

        {showHonours && (
          <div className="qualification-section">

            <div className="qualification-title">

              <h3>
                Honours
              </h3>

              <button
                type="button"
                className="remove-qualification"
                onClick={() =>
                  setShowHonours(false)
                }
              >
                Remove
              </button>

            </div>

            <div className="education-grid">

              <div className="form-group">
                <label>
                  Institute Name
                </label>

                <input
                  name="honoursInstitute"
                  value={
                    form.honoursInstitute
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  University
                </label>

                <input
                  name="honoursUniversity"
                  value={
                    form.honoursUniversity
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Roll No
                </label>

                <input
                  name="honoursRoll"
                  value={
                    form.honoursRoll
                  }
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>
          </div>
        )}

        {/* =================================
            MASTERS
        ================================= */}

        {showMasters && (
          <div className="qualification-section">

            <div className="qualification-title">

              <h3>
                Masters
              </h3>

              <button
                type="button"
                className="remove-qualification"
                onClick={() =>
                  setShowMasters(false)
                }
              >
                Remove
              </button>

            </div>

            <div className="education-grid">

              <div className="form-group">
                <label>
                  Institute Name
                </label>

                <input
                  name="mastersInstitute"
                  value={
                    form.mastersInstitute
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  University
                </label>

                <input
                  name="mastersUniversity"
                  value={
                    form.mastersUniversity
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Roll No
                </label>

                <input
                  name="mastersRoll"
                  value={
                    form.mastersRoll
                  }
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>
          </div>
        )}

        {/* =================================
            SAVE
        ================================= */}

        <button
          type="submit"
          className="save-student-button"
        >
          Save Student
        </button>

        {message && (
          <p className="student-message">
            {message}
          </p>
        )}

      </form>
    </div>
  );
}