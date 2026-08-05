import "./Notice.css";

export default function Notice() {

  const notices = [
    {
      title: "Japanese Language Course ভর্তি শুরু",
      date: "05 August 2026",
      details: "Japanese Language Course-এ নতুন ব্যাচের ভর্তি চলছে।"
    },
    {
      title: "Korean Language Course ক্লাস শুরু",
      date: "10 August 2026",
      details: "নতুন শিক্ষার্থীদের ক্লাস আগামী সপ্তাহ থেকে শুরু হবে।"
    },
    {
      title: "German Language Course পরীক্ষা",
      date: "15 August 2026",
      details: "German Language Course এর মূল্যায়ন পরীক্ষা অনুষ্ঠিত হবে।"
    }
  ];


  return (
    <div className="notice">

      <section className="notice-header">
        <h1>Notice Board</h1>
        <p>
          প্রতিষ্ঠানের সর্বশেষ নোটিশ ও গুরুত্বপূর্ণ তথ্য
        </p>
      </section>


      <section className="notice-list">

        {notices.map((notice, index) => (
          <div className="notice-card" key={index}>

            <h2>{notice.title}</h2>

            <p className="date">
              📅 {notice.date}
            </p>

            <p>
              {notice.details}
            </p>

            <button>
              View Details
            </button>

          </div>
        ))}

      </section>

    </div>
  );
}