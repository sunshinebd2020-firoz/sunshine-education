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


      {/* ================= MAIN TWO COLUMN AREA ================= */}
      <div className="home-layout">

        {/* ================= LEFT COLUMN ================= */}
        <main className="home-main">

          {/* WELCOME */}
          <section className="welcome">
            <h1>Sunshine Education</h1>

            <p>
              আধুনিক ও মানসম্মত শিক্ষার মাধ্যমে শিক্ষার্থীদের
              জ্ঞান, দক্ষতা ও ভবিষ্যৎ ক্যারিয়ার গড়ে তোলাই আমাদের লক্ষ্য।
            </p>
          </section>


          {/* COURSES */}
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


          {/* NOTICE */}
          <section className="home-section notice-section">

            <h2 className="section-title">
              📢 নোটিশ
            </h2>

            <div className="notice-box">

              <div className="notice-item">
                <span className="notice-date">
                  10 Aug 2026
                </span>

                <p>
                  নতুন ব্যাচে ভর্তি কার্যক্রম শুরু হয়েছে।
                </p>
              </div>


              <div className="notice-item">
                <span className="notice-date">
                  08 Aug 2026
                </span>

                <p>
                  Japanese Language নতুন ক্লাসের সময়সূচি প্রকাশ করা হয়েছে।
                </p>
              </div>


              <div className="notice-item">
                <span className="notice-date">
                  05 Aug 2026
                </span>

                <p>
                  শিক্ষার্থীদের প্রয়োজনীয় কাগজপত্র অফিসে জমা দেওয়ার জন্য অনুরোধ করা হলো।
                </p>
              </div>

            </div>

          </section>

        </main>


        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="home-sidebar">


          {/* YOUTUBE */}
          <section className="sidebar-section">

            <h2 className="sidebar-title">
              ▶ আমাদের ভিডিও
            </h2>

            <div className="youtube-container">

              <iframe
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="Sunshine Education YouTube Video"
                allowFullScreen
              ></iframe>

            </div>

          </section>


          {/* MOBILE APP */}
          <section className="sidebar-section">

            <h2 className="sidebar-title">
              📱 Mobile App
            </h2>

            <div className="app-sidebar-card">

              <div className="app-image">
                <img
                  src="/images/android-app.png"
                  alt="Android App"
                />
              </div>

              <h3>Sunshine Education App</h3>

              <p>
                Android মোবাইলে আমাদের App ব্যবহার করুন।
              </p>

              <a
                href="https://play.google.com/"
                target="_blank"
                rel="noreferrer"
              >
                Download App
              </a>

            </div>

          </section>


          {/* BRANCHES */}
          <section className="sidebar-section">

            <h2 className="sidebar-title">
              📍 আমাদের শাখাসমূহ
            </h2>


            <div className="sidebar-branch">

              <h3>Rajshahi Main Branch</h3>

              <p>
                Rajshahi, Bangladesh
              </p>

              <p>
                📞 01XXXXXXXXX
              </p>

            </div>


            <div className="sidebar-branch">

              <h3>Ramchandrapur Branch</h3>

              <p>
                Ramchandrapur, Rajshahi
              </p>

              <p>
                📞 01XXXXXXXXX
              </p>

            </div>


            <div className="sidebar-branch">

              <h3>Khulna Branch</h3>

              <p>
                Khulna, Bangladesh
              </p>

              <p>
                📞 01XXXXXXXXX
              </p>

            </div>


            <div className="sidebar-branch">

              <h3>Tangail Branch</h3>

              <p>
                Tangail, Bangladesh
              </p>

              <p>
                📞 01XXXXXXXXX
              </p>

            </div>

          </section>


          {/* FACEBOOK */}
          <section className="sidebar-section">

            <h2 className="sidebar-title">
              Facebook
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

        </aside>

      </div>


      {/* ================= FEATURES ================= */}
      <section className="home-section features-section">

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

        <h2>
          প্রতিষ্ঠান সম্পর্কে
        </h2>

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