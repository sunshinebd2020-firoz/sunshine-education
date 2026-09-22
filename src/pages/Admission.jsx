import "./Admission.css";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import { useEffect, useState } from "react";

export default function Admission() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/latest_students.php`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students || []);
        }
      })
      .catch((error) => {
        console.error("Student loading error:", error);
      });
  }, []);

  // =========================
  // Auto Fetch Active Courses
  // =========================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourseLoading(true);

        const response = await fetch(`${API_BASE_URL}/course_list.php`);

        if (!response.ok) {
          throw new Error("Course server error");
        }

        const result = await response.json();
        console.log("Admission Course List API:", result);

        let courseData = [];

        if (Array.isArray(result)) {
          courseData = result;
        } else if (result && Array.isArray(result.data)) {
          courseData = result.data;
        }

        const activeCourses = courseData
          .filter((course) => {
            const status = String(course.status ?? "")
              .trim()
              .toLowerCase();

            return status === "active" || status === "1";
          })
          .sort(
            (a, b) =>
              Number(a.sort_order || 0) - Number(b.sort_order || 0)
          );

        setCourses(activeCourses);
      } catch (error) {
        console.error("Course loading error:", error);
        setCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // =========================
  // Language Name
  // =========================
  const getLanguageName = (language) => {
    const value = String(language || "").trim().toLowerCase();

    if (
      value.includes("japanese") ||
      value.includes("japan") ||
      value.includes("জাপানি") ||
      value.includes("জাপানিজ")
    ) {
      return "Japanese";
    }

    if (
      value.includes("german") ||
      value.includes("germany") ||
      value.includes("জার্মান")
    ) {
      return "German";
    }

    if (
      value.includes("korean") ||
      value.includes("korea") ||
      value.includes("কোরিয়ান") ||
      value.includes("কোরিয়ান")
    ) {
      return "Korean";
    }

    if (
      value.includes("english") ||
      value.includes("england") ||
      value.includes("ইংরেজি") ||
      value.includes("ইংলিশ")
    ) {
      return "English";
    }

    if (
      value.includes("french") ||
      value.includes("france") ||
      value.includes("ফরাসি") ||
      value.includes("ফ্রেঞ্চ")
    ) {
      return "French";
    }

    if (
      value.includes("chinese") ||
      value.includes("china") ||
      value.includes("চীনা") ||
      value.includes("চাইনিজ")
    ) {
      return "Chinese";
    }

    if (
      value.includes("arabic") ||
      value.includes("saudi") ||
      value.includes("আরবি")
    ) {
      return "Arabic";
    }

    if (value.length > 0) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return "Other";
  };

  // =========================
  // Group Courses by Language
  // =========================
  const groupedCourses = courses.reduce((groups, course) => {
    const language = getLanguageName(course.language);

    if (!groups[language]) {
      groups[language] = [];
    }

    groups[language].push(course);

    return groups;
  }, {});

  // =========================
  // Language Flag
  // =========================
  const getLanguageFlag = (language) => {
    const lang = String(language || "").trim().toLowerCase();

    if (lang.includes("japanese") || lang.includes("japan")) {
      return "/flags/jp.svg";
    }

    if (lang.includes("german") || lang.includes("germany")) {
      return "/flags/de.svg";
    }

    if (lang.includes("korean") || lang.includes("korea")) {
      return "/flags/kr.svg";
    }

    if (
      lang.includes("english") ||
      lang.includes("england") ||
      lang.includes("uk") ||
      lang.includes("usa")
    ) {
      return "/flags/gb.svg";
    }

    if (lang.includes("french") || lang.includes("france")) {
      return "/flags/fr.svg";
    }

    if (lang.includes("chinese") || lang.includes("china")) {
      return "/flags/cn.svg";
    }

    return "";
  };

  // =========================
  // Course Fee
  // =========================
  const formatFee = (fee) => {
    if (fee === null || fee === undefined || fee === "") {
      return "N/A";
    }

    const number = Number(fee);

    if (Number.isNaN(number)) {
      return fee;
    }

    return `৳ ${number.toLocaleString()}`;
  };

  return (
    <div className="admission">
      <section className="admission-header">
        <h1>ভর্তি কার্যক্রম</h1>
        <p>
          আমাদের Japanese, German ও Korean Language Course-এ
          ভর্তি চলছে।
        </p>
      </section>

      {/* =========================
          Latest Students Slider
      ========================= */}
      {students.length > 0 && (
        <section className="latest-students">
          <h2>সর্বশেষ ভর্তি হওয়া শিক্ষার্থী</h2>

          <div className="student-slider">
            <div className="student-slider-track">
              {[...students, ...students].map((student, index) => {
                const photoUrl = (() => {
                  const rawPhoto =
                    student.student_photo ||
                    student.photo ||
                    student.profile_photo ||
                    "";

                  if (!rawPhoto) {
                    return "/default-student.png";
                  }

                  const cleanPhoto = String(rawPhoto).trim();

                  if (
                    cleanPhoto.startsWith("http://") ||
                    cleanPhoto.startsWith("https://") ||
                    cleanPhoto.startsWith("data:")
                  ) {
                    return cleanPhoto;
                  }

                  const relativePath = cleanPhoto
                    .replace(/^https?:\/\/[^/]+/i, "")
                    .replace(/^\/+/g, "")
                    .replace(/^uploads\/students\//i, "")
                    .replace(/^uploads\//i, "")
                    .replace(/^students\//i, "")
                    .replace(/.*?uploads\/students\//i, "")
                    .split(/[\\/]+/)
                    .filter(Boolean)
                    .map((part) => encodeURIComponent(part))
                    .join("/");

                  return relativePath
                    ? `${API_ORIGIN}/uploads/students/${relativePath}`
                    : "/default-student.png";
                })();

                return (
                  <div
                    className="student-slide"
                    key={`${student.student_id}-${index}`}
                  >
                    <div className="student-card">
                      <img
                        src={photoUrl}
                        alt={student.student_name_bn}
                        className="student-round-photo"
                      />

                      <div className="student-card-name">
                        {student.student_name_bn}
                      </div>

                      <div className="student-card-course">
                        {student.course}
                      </div>

                      <div className="student-card-level">
                        {student.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="admission-content">
        <div className="admission-card">
          <h2>ভর্তির জন্য প্রয়োজনীয় তথ্য</h2>

          <ul>
            <li>শিক্ষার্থীর নাম (বাংলা ও ইংরেজি)</li>
            <li>পিতা ও মাতার নাম</li>
            <li>জন্ম তারিখ ও রক্তের গ্রুপ</li>
            <li>বর্তমান ও স্থায়ী ঠিকানা</li>
            <li>শিক্ষার্থীর মোবাইল নম্বর</li>
            <li>অভিভাবকের মোবাইল নম্বর</li>
            <li>পাসপোর্ট সাইজ ছবি</li>
            <li>শিক্ষাগত যোগ্যতার তথ্য</li>
          </ul>
        </div>

        {/* =========================
            Auto Fetched Courses
        ========================= */}
        <div className="admission-card">
          <h2>উপলব্ধ কোর্স</h2>

          {courseLoading ? (
            <div className="course-loading">
              কোর্স লোড হচ্ছে...
            </div>
          ) : Object.keys(groupedCourses).length > 0 ? (
            Object.entries(groupedCourses).map(
              ([language, languageCourses]) => {
                const flag = getLanguageFlag(language);

                return (
                  <div className="course-group" key={language}>
                    <div className="course-title">
                      {flag ? (
                        <img
                          src={flag}
                          alt={`${language} flag`}
                          style={{
                            width: "24px",
                            height: "16px",
                            objectFit: "cover",
                            marginRight: "8px",
                            verticalAlign: "middle",
                          }}
                        />
                      ) : (
                        "🌐 "
                      )}

                      {language} Language Course
                    </div>

                    <ul>
                      {languageCourses.map((course) => {
                        const mainFee = Number(
                          course.course_fee || 0
                        );

                        const offerFee = Number(
                          course.offer_price || 0
                        );

                        const hasOffer =
                          offerFee > 0 &&
                          offerFee < mainFee;

                        return (
                          <li key={course.id}>
                            <strong>
                              {course.course_name || "Course"}
                            </strong>

                            {course.duration && (
                              <span>
                                {" "}
                                — {course.duration}
                              </span>
                            )}

                            {mainFee > 0 && (
                              <span>
                                {" "}
                                —{" "}
                                {hasOffer ? (
                                  <>
                                    <span
                                      style={{
                                        textDecoration:
                                          "line-through",
                                        opacity: 0.65,
                                        marginRight: 6,
                                      }}
                                    >
                                      {formatFee(mainFee)}
                                    </span>

                                    {formatFee(offerFee)}
                                  </>
                                ) : (
                                  formatFee(mainFee)
                                )}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }
            )
          ) : (
            <div className="course-loading">
              বর্তমানে কোনো Active course পাওয়া যায়নি।
            </div>
          )}
        </div>

        <div className="admission-card">
          <h2>ভর্তি প্রক্রিয়া</h2>

          <ol>
            <li>কোর্স নির্বাচন করুন</li>
            <li>ভর্তি ফরম পূরণ করুন</li>
            <li>প্রয়োজনীয় তথ্য জমা দিন</li>
            <li>ক্লাস শুরু করুন</li>
          </ol>
        </div>
      </section>
    </div>
  );
}