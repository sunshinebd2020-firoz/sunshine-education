import "./Teachers.css";

export default function Teachers() {

  const teachers = [
    {
      name: "Mr. Rahman",
      subject: "Japanese Language Instructor",
      image: "/images/teacher1.jpg"
    },
    {
      name: "Ms. Sultana",
      subject: "German Language Instructor",
      image: "/images/teacher2.jpg"
    },
    {
      name: "Mr. Karim",
      subject: "Korean Language Instructor",
      image: "/images/teacher3.jpg"
    }
  ];


  return (
    <div className="teachers">

      <section className="teacher-header">
        <h1>আমাদের শিক্ষকবৃন্দ</h1>
        <p>
          অভিজ্ঞ ও দক্ষ প্রশিক্ষকদের মাধ্যমে মানসম্মত ভাষা শিক্ষা প্রদান করা হয়।
        </p>
      </section>


      <section className="teacher-list">

        {teachers.map((teacher, index) => (
          <div className="teacher-card" key={index}>

            <img 
              src={teacher.image} 
              alt={teacher.name}
            />

            <h2>{teacher.name}</h2>

            <p>{teacher.subject}</p>

          </div>
        ))}

      </section>

    </div>
  );
}