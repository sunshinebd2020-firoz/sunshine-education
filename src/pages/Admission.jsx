import "./Admission.css";
import { useEffect, useState } from "react";

export default function Admission() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost/sunshine-api/api/latest_students.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students);
        }
      })
      .catch((error) => {
        console.error("Student loading error:", error);
      });
  }, []);

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

                const photoUrl = student.student_photo
                  ? `http://localhost/sunshine-api/uploads/students/${student.student_photo}`
                  : "/default-student.png";

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


<div className="admission-card">
  <h2>উপলব্ধ কোর্স</h2>

  <div className="course-group">
    <div className="course-title">
      🇯🇵 Japanese Language Course
    </div>

    <ul>
      <li>N5</li>
      <li>N4</li>
      <li>N3</li>
      <li>JFT</li>
      <li>Mock Test Preparation</li>
      <li>Interview Preparation</li>
      <li>Skill Test (Construction)</li>
      <li>Skill Test (Agriculture)</li>
      <li>Skill Test (Caregiver)</li>
    </ul>
  </div>

  <div className="course-group">
    <div className="course-title">
      🇩🇪 German Language Course
    </div>

    <ul>
      <li>A1</li>
      <li>A2</li>
      <li>B1</li>
      <li>B2</li>
    </ul>
  </div>

  <div className="course-group">
    <div className="course-title">
      🇰🇷 Korean Language Course
    </div>

    <ul>
      <li>Basic Course</li>
      <li>TOPIK-1</li>
      <li>TOPIK-2</li>
      <li>Skill Test</li>
    </ul>
  </div>
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