import "./Courses.css";

export default function Courses() {
  return (
    <div className="courses">

      <section className="course-header">
        <h1>আমাদের কোর্সসমূহ</h1>
        <p>
          আন্তর্জাতিক ভাষা শিক্ষার মাধ্যমে শিক্ষার্থীদের
          বিদেশে উচ্চশিক্ষা, চাকরি ও যোগাযোগের দক্ষতা বৃদ্ধিতে
          আমরা সহায়তা করি।
        </p>
      </section>


      <section className="course-list">

        <div className="course-card">
          <h2>🇯🇵 Japanese Language Course</h2>
          <p>
            জাপানি ভাষা শেখার জন্য Beginner থেকে Advanced Level পর্যন্ত
            কোর্স। JLPT পরীক্ষার প্রস্তুতির বিশেষ ব্যবস্থা রয়েছে।
          </p>

          <ul>
            <li>Basic Japanese (N5)</li>
            <li>Intermediate Japanese (N4-N3)</li>
            <li>JLPT Preparation</li>
            <li>Speaking Practice</li>
          </ul>
        </div>


        <div className="course-card">
          <h2>🇩🇪 German Language Course</h2>
          <p>
            জার্মানিতে উচ্চশিক্ষা, চাকরি ও দৈনন্দিন যোগাযোগের জন্য
            প্রয়োজনীয় জার্মান ভাষা শিক্ষা।
          </p>

          <ul>
            <li>German A1 Level</li>
            <li>German A2 Level</li>
            <li>Speaking & Grammar</li>
            <li>Exam Preparation</li>
          </ul>
        </div>


        <div className="course-card">
          <h2>🇰🇷 Korean Language Course</h2>
          <p>
            কোরিয়ান ভাষা শেখার মাধ্যমে EPS-TOPIK ও অন্যান্য প্রয়োজনীয়
            পরীক্ষার প্রস্তুতি গ্রহণ করুন।
          </p>

          <ul>
            <li>Basic Korean</li>
            <li>TOPIK Preparation</li>
            <li>Conversation Practice</li>
            <li>Korean Grammar</li>
          </ul>
        </div>

      </section>


      <section className="why-course">
        <h2>কেন আমাদের কোর্স করবেন?</h2>

        <p>
          ✔ অভিজ্ঞ প্রশিক্ষক দ্বারা পাঠদান<br/>
          ✔ নিয়মিত Speaking Practice<br/>
          ✔ আধুনিক শিক্ষা পদ্ধতি<br/>
          ✔ পরীক্ষার প্রস্তুতির বিশেষ সহযোগিতা
        </p>

      </section>

    </div>
  );
}