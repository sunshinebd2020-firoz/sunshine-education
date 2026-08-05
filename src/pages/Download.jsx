import "./Download.css";

export default function Download() {
  return (
    <div className="download">

      <section className="download-header">
        <h1>ডাউনলোড</h1>
        <p>
          প্রয়োজনীয় ফরম, নোটিশ ও শিক্ষামূলক উপকরণ এখান থেকে ডাউনলোড করুন।
        </p>
      </section>


      <section className="download-list">

        <div className="download-card">
          <h2>ভর্তি ফরম</h2>
          <p>Language Course Admission Form</p>
          <button>Download PDF</button>
        </div>


        <div className="download-card">
          <h2>কোর্স সিলেবাস</h2>
          <p>
            Japanese, German ও Korean Language Course Syllabus
          </p>
          <button>Download PDF</button>
        </div>


        <div className="download-card">
          <h2>নোটিশ</h2>
          <p>প্রতিষ্ঠানের গুরুত্বপূর্ণ নোটিশসমূহ</p>
          <button>Download</button>
        </div>

      </section>

    </div>
  );
}