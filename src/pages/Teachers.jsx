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
      setError(data.message || "Teacher information not found.");
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

return ( <div className="teachers-page">


  <section className="teacher-header">
    <h1>আমাদের শিক্ষকবৃন্দ</h1>

    <p>
      অভিজ্ঞ ও দক্ষ প্রশিক্ষকদের মাধ্যমে মানসম্মত ভাষা শিক্ষা প্রদান করা হয়।
    </p>
  </section>

  {loading && (
    <div className="teacher-message">
      শিক্ষক তথ্য লোড হচ্ছে...
    </div>
  )}

  {error && (
    <div className="teacher-message error">
      {error}
    </div>
  )}

  {!loading && !error && teachers.length === 0 && (
    <div className="teacher-message">
      কোনো শিক্ষক তথ্য পাওয়া যায়নি।
    </div>
  )}

  {!loading && !error && teachers.length > 0 && (
    <section className="teacher-list">

      {teachers.map((teacher) => (
        <div className="teacher-card" key={teacher.id}>

          <div className="teacher-image">
            {teacher.photo ? (
              <img
                src={`http://localhost/sunshine-api/uploads/teachers/${teacher.photo}`}
                alt={teacher.name_en || teacher.name_bn}
              />
            ) : (
              <div className="no-photo">
                No Photo
              </div>
            )}
          </div>

          <h2>{teacher.name_bn}</h2>

          {teacher.name_en && (
            <h3>{teacher.name_en}</h3>
          )}

          {teacher.designation && (
            <p className="designation">
              {teacher.designation}
            </p>
          )}

          {teacher.course && (
            <p className="course">
              {teacher.course}
            </p>
          )}

          {teacher.branch && (
            <p className="branch">
              {teacher.branch}
            </p>
          )}

        </div>
      ))}

    </section>
  )}

</div>

);
}
