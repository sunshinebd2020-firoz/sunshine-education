import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">

      {/* ================= BANNER ================= */}
      <section className="home-banner">

        <div className="banner-content">
          <h1>স্বাগতম Sunshine Education এ</h1>

          <p>
            Japanese, German & Korean Language Learning Center
          </p>

          <button>ভর্তি সম্পর্কে জানুন</button>
        </div>

      </section>


      {/* ================= WELCOME ================= */}
      <section className="welcome">

        <h1>Sunshine Education</h1>

        <p>
          আধুনিক ও মানসম্মত শিক্ষার মাধ্যমে শিক্ষার্থীদের
          জ্ঞান, দক্ষতা ও ভবিষ্যৎ ক্যারিয়ার গড়ে তোলাই আমাদের লক্ষ্য।
        </p>

      </section>


      {/* ================= COURSES ================= */}
      <section className="home-section">

        <h2 className="section-title">
          আমাদের কোর্সসমূহ
        </h2>

        <div className="course-cards">

          <div className="home-card">
            <div className="card-icon">🇯🇵</div>
            <h3>Japanese Language</h3>
            <p>
              N5, N4, N3 এবং JFT প্রস্তুতি কোর্স।
            </p>
          </div>

          <div className="home-card">
            <div className="card-icon">🇩🇪</div>
            <h3>German Language</h3>
            <p>
              Basic ও Skill Test প্রস্তুতি কোর্স।
            </p>
          </div>

          <div className="home-card">
            <div className="card-icon">🇰🇷</div>
            <h3>Korean Language</h3>
            <p>
              Basic ও Skill Test প্রস্তুতি কোর্স।
            </p>
          </div>

        </div>

      </section>


      {/* ================= YOUTUBE ================= */}
      <section className="home-section youtube-section">

        <h2 className="section-title">
          আমাদের ভিডিও
        </h2>

        <div className="youtube-container">

          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="Sunshine Education YouTube Video"
            allowFullScreen
          ></iframe>

        </div>

      </section>


      {/* ================= FACEBOOK ================= */}
      <section className="home-section facebook-section">

        <h2 className="section-title">
          আমাদের Facebook Page
        </h2>

        <div className="facebook-box">

          <h3>Sunshine Education</h3>

          <p>
            আমাদের সর্বশেষ খবর, নোটিশ ও কার্যক্রম জানতে
            Facebook Page-এ Follow করুন।
          </p>

          <a
            href="https://www.facebook.com/YOUR_PAGE"
            target="_blank"
            rel="noreferrer"
            className="facebook-button"
          >
            Visit Facebook Page
          </a>

        </div>

      </section>


      {/* ================= MOBILE APP ================= */}
      <section className="home-section app-section">

        <h2 className="section-title">
          আমাদের Mobile App
        </h2>

        <div className="app-cards">

          <div className="app-card">

            <div className="app-image">
              <img
                src="/images/android-app.png"
                alt="Android App"
              />
            </div>

            <h3>Android App</h3>

            <p>
              Android মোবাইলে Sunshine Education App ব্যবহার করুন।
            </p>

            <a
              href="https://play.google.com/"
              target="_blank"
              rel="noreferrer"
            >
              Download Android App
            </a>

          </div>


          <div className="app-card">

            <div className="app-image">
              <img
                src="/images/apple-app.png"
                alt="Apple App"
              />
            </div>

            <h3>iPhone / iPad App</h3>

            <p>
              Apple ডিভাইসে Sunshine Education App ব্যবহার করুন।
            </p>

            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
            >
              Download Apple App
            </a>

          </div>

        </div>

      </section>


      {/* ================= BRANCHES ================= */}
      <section className="home-section branches-section">

        <h2 className="section-title">
          আমাদের শাখাসমূহ
        </h2>

        <div className="branch-cards">

          <div className="branch-card">
            <h3>📍 Rajshahi Main Branch</h3>
            <p>Rajshahi, Bangladesh</p>
            <p>Mobile: 01XXXXXXXXX</p>
          </div>

          <div className="branch-card">
            <h3>📍 Ramchandrapur Branch</h3>
            <p>Ramchandrapur, Rajshahi</p>
            <p>Mobile: 01XXXXXXXXX</p>
          </div>

          <div className="branch-card">
            <h3>📍 Khulna Branch</h3>
            <p>Khulna, Bangladesh</p>
            <p>Mobile: 01XXXXXXXXX</p>
          </div>

          <div className="branch-card">
            <h3>📍 Tangail Branch</h3>
            <p>Tangail, Bangladesh</p>
            <p>Mobile: 01XXXXXXXXX</p>
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="home-section">

        <h2 className="section-title">
          কেন Sunshine Education?
        </h2>

        <div className="features">

          <div className="home-card">
            <h2>🎯 আমাদের লক্ষ্য</h2>
            <p>
              শিক্ষার্থীদের জন্য উন্নত ও কার্যকর শিক্ষা
              পরিবেশ নিশ্চিত করা।
            </p>
          </div>

          <div className="home-card">
            <h2>👨‍🏫 অভিজ্ঞ শিক্ষক</h2>
            <p>
              দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলীর মাধ্যমে
              মানসম্মত পাঠদান।
            </p>
          </div>

          <div className="home-card">
            <h2>💻 আধুনিক শিক্ষা</h2>
            <p>
              প্রযুক্তিনির্ভর ও যুগোপযোগী শিক্ষা ব্যবস্থা।
            </p>
          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section className="about-home">

        <h2>প্রতিষ্ঠান সম্পর্কে</h2>

        <p>
          Sunshine Education একটি আধুনিক Language Learning Center।
          Japanese, German এবং Korean ভাষা শিক্ষার পাশাপাশি
          শিক্ষার্থীদের আন্তর্জাতিক শিক্ষা ও কর্মসংস্থানের
          প্রস্তুতিতে সহায়তা করাই আমাদের অন্যতম লক্ষ্য।
        </p>

      </section>

    </div>
  );
}