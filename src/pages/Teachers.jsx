import "./Teachers.css";
import { useEffect, useState } from "react";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost/sunshine-api/api/teacher_list.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setTeachers(data.teachers || []);
        } else {
          setError(
            data.message || "Teacher information not found."
          );
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Server-এর সাথে সংযোগ করা যাচ্ছে না।");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Present Teachers - Ascending Order
const presentTeachers = teachers
  .filter(
    (teacher) =>
      teacher.status?.toLowerCase() === "present"
  )
  .sort((a, b) =>
    a.teacher_id.localeCompare(b.teacher_id)
  );


// Ex Teachers - Ascending Order
const exTeachers = teachers
  .filter((teacher) => {
    const status = teacher.status?.toLowerCase();

    return (
      status === "ex teacher" ||
      status === "ex"
    );
  })
  .sort((a, b) =>
    a.teacher_id.localeCompare(b.teacher_id)
  );

  // Teacher Card
  const renderTeacherCard = (teacher) => (
    <div
      className="teacher-card"
      key={teacher.id}
    >

      {/* Teacher Photo */}
      <div className="teacher-image">

        {teacher.photo ? (
          <img
            src={`http://localhost/sunshine-api/uploads/teachers/${teacher.photo}`}
            alt={
              teacher.name_en ||
              teacher.name_bn ||
              "Teacher"
            }
          />
        ) : (
          <div className="no-photo">
            No Photo
          </div>
        )}

      </div>


      {/* Bengali Name */}
      {teacher.name_bn && (
        <h2>
          {teacher.name_bn}
        </h2>
      )}


      {/* English Name */}
      {teacher.name_en && (
        <h3>
          {teacher.name_en}
        </h3>
      )}


      {/* Designation */}
      {teacher.designation && (
        <p className="designation">
          {teacher.designation}
        </p>
      )}


      {/* Subject */}
      {teacher.course && (
        <p className="course">
          <strong>Subject:</strong>{" "}
          {teacher.course}
        </p>
      )}


      {/* Branch */}
      {teacher.branch && (
        <p className="branch">
          <strong>Branch:</strong>{" "}
          {teacher.branch}
        </p>
      )}


      {/* Mobile */}
      {teacher.mobile && (
        <p className="mobile">
          <strong>Mobile:</strong>{" "}

          <a href={`tel:${teacher.mobile}`}>
            {teacher.mobile}
          </a>
        </p>
      )}

    </div>
  );


  return (
    <div className="teachers-page">

      {/* ==============================
          Header
      ============================== */}

      <div className="teacher-header">

        <h1>Our Teachers</h1>

        <p>
          অভিজ্ঞ ও দক্ষ প্রশিক্ষকদের মাধ্যমে
          মানসম্মত ভাষা শিক্ষা প্রদান করা হয়।
        </p>

      </div>


      {/* ==============================
          Loading
      ============================== */}

      {loading && (
        <div className="teacher-message">
          শিক্ষক তথ্য লোড হচ্ছে...
        </div>
      )}


      {/* ==============================
          Error
      ============================== */}

      {error && (
        <div className="teacher-message error">
          {error}
        </div>
      )}


      {/* ==============================
          Teacher Content
      ============================== */}

      {!loading && !error && (

        <>

          {/* =================================
              Present Teachers
          ================================= */}

          {presentTeachers.length > 0 && (
            <section className="teacher-group">

              <div className="teacher-group-header">
                <h2>Present Teachers</h2>

                <p>
                  বর্তমানে আমাদের প্রতিষ্ঠানে কর্মরত শিক্ষকবৃন্দ
                </p>
              </div>


              <div className="teacher-list">

                {presentTeachers.map(
                  renderTeacherCard
                )}

              </div>

            </section>
          )}


          {/* =================================
              Ex Teachers
          ================================= */}

          {exTeachers.length > 0 && (
            <section className="teacher-group ex-teachers">

              <div className="teacher-group-header">

                <h2>Ex Teachers</h2>

                <p>
                  আমাদের প্রতিষ্ঠানে পূর্বে কর্মরত সম্মানিত শিক্ষকবৃন্দ
                </p>

              </div>


              <div className="teacher-list">

                {exTeachers.map(
                  renderTeacherCard
                )}

              </div>

            </section>
          )}


          {/* =================================
              No Teacher
          ================================= */}

          {presentTeachers.length === 0 &&
            exTeachers.length === 0 && (
              <div className="teacher-message">

                কোনো শিক্ষক তথ্য পাওয়া যায়নি।

              </div>
            )}

        </>

      )}

    </div>
  );
}