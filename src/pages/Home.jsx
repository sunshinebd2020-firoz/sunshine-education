import "./Home.css";
import { useEffect, useState } from "react";

const API = "http://localhost/sunshine-api/api";
const IMAGE_URL = "http://localhost/sunshine-api/";

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingBanners, setLoadingBanners] = useState(true);

  /* ================= FETCH BANNERS ================= */

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(
          `${API}/banner_list.php`
        );

        const data = await response.json();

        if (data.success) {
          const activeBanners = data.data
            .filter(
              (banner) =>
                banner.status === "Active" ||
                banner.status === "active" ||
                banner.status === 1 ||
                banner.status === "1"
            )
            .sort(
              (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
            );

          setBanners(activeBanners);
        }
      } catch (error) {
        console.error("Banner load error:", error);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);


  /* ================= AUTO SLIDE ================= */

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1
          ? 0
          : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);


  /* ================= NEXT ================= */

  const nextSlide = () => {
    if (banners.length === 0) return;

    setCurrentSlide((prev) =>
      prev === banners.length - 1
        ? 0
        : prev + 1
    );
  };


  /* ================= PREVIOUS ================= */

  const previousSlide = () => {
    if (banners.length === 0) return;

    setCurrentSlide((prev) =>
      prev === 0
        ? banners.length - 1
        : prev - 1
    );
  };


  /* ================= GO TO SLIDE ================= */

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };


  return (
    <div className="home-page">

      {/* ================= BANNER ================= */}

      <section className="home-banner">

        {!loadingBanners && banners.length > 0 && (

          <div className="banner-slider">

            {banners.map((banner, index) => (

              <div
                key={banner.id}
                className={`banner-slide ${
                  index === currentSlide
                    ? "active"
                    : ""
                }`}
                style={{
                  backgroundImage: `url("${IMAGE_URL}${banner.banner_image}")`,
                }}
              />

            ))}


            {/* PREVIOUS */}

            {banners.length > 1 && (
              <button
                type="button"
                className="banner-arrow banner-prev"
                onClick={previousSlide}
                aria-label="Previous Banner"
              >
                ❮
              </button>
            )}


            {/* NEXT */}

            {banners.length > 1 && (
              <button
                type="button"
                className="banner-arrow banner-next"
                onClick={nextSlide}
                aria-label="Next Banner"
              >
                ❯
              </button>
            )}


            {/* DOTS */}

            {banners.length > 1 && (

              <div className="banner-dots">

                {banners.map((banner, index) => (

                  <button
                    key={banner.id}
                    type="button"
                    className={
                      index === currentSlide
                        ? "banner-dot active"
                        : "banner-dot"
                    }
                    onClick={() =>
                      goToSlide(index)
                    }
                    aria-label={`Banner ${
                      index + 1
                    }`}
                  />

                ))}

              </div>

            )}

          </div>

        )}

      </section>


      {/* ================= MAIN TWO COLUMN AREA ================= */}

      <div className="home-layout">

        {/* ================= LEFT COLUMN ================= */}

        <main className="home-main">

          {/* WELCOME */}

          <section className="welcome">

            <h1>
              Sunshine Education
            </h1>

            <p>
              আধুনিক ও মানসম্মত শিক্ষার মাধ্যমে
              শিক্ষার্থীদের জ্ঞান, দক্ষতা ও ভবিষ্যৎ
              ক্যারিয়ার গড়ে তোলাই আমাদের লক্ষ্য।
            </p>

          </section>


          {/* COURSES */}

          <section className="home-section">

            <h2 className="section-title">
              আমাদের কোর্সসমূহ
            </h2>

            <div className="course-cards">

              <div className="home-card">

                <div className="card-icon">
                  🇯🇵
                </div>

                <h3>
                  Japanese Language
                </h3>

                <p>
                  N5, N4, N3 এবং JFT প্রস্তুতি কোর্স।
                </p>

              </div>


              <div className="home-card">

                <div className="card-icon">
                  🇩🇪
                </div>

                <h3>
                  German Language
                </h3>

                <p>
                  Basic ও Skill Test প্রস্তুতি কোর্স।
                </p>

              </div>


              <div className="home-card">

                <div className="card-icon">
                  🇰🇷
                </div>

                <h3>
                  Korean Language
                </h3>

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
                  Japanese Language নতুন ক্লাসের
                  সময়সূচি প্রকাশ করা হয়েছে।
                </p>

              </div>


              <div className="notice-item">

                <span className="notice-date">
                  05 Aug 2026
                </span>

                <p>
                  শিক্ষার্থীদের প্রয়োজনীয় কাগজপত্র
                  অফিসে জমা দেওয়ার জন্য অনুরোধ করা হলো।
                </p>

              </div>

            </div>

          </section>

        </main>


        {/* ================= RIGHT SIDEBAR ================= */}

        <aside className="home-sidebar">

          {/* FACEBOOK */}

          <section className="sidebar-section">

            <div className="facebook-activity">

              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fsunshine.eduraj%2F&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                width="100%"
                height="500"
                style={{
                  border: "none",
                  overflow: "hidden",
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                title="Sunshine Education Facebook Activity"
              />

            </div>

          </section>


          {/* YOUTUBE */}

          <section className="sidebar-section">

            <div className="youtube-container">

              <iframe
                src="https://www.youtube.com/embed/BvjzXbMtSpA"
                title="Sunshine Education YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

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

            <h2>
              🎯 আমাদের লক্ষ্য
            </h2>

            <p>
              শিক্ষার্থীদের জন্য উন্নত ও কার্যকর
              শিক্ষা পরিবেশ নিশ্চিত করা।
            </p>

          </div>


          <div className="home-card">

            <h2>
              👨‍🏫 অভিজ্ঞ শিক্ষক
            </h2>

            <p>
              দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলীর মাধ্যমে
              মানসম্মত পাঠদান।
            </p>

          </div>


          <div className="home-card">

            <h2>
              💻 আধুনিক শিক্ষা
            </h2>

            <p>
              প্রযুক্তিনির্ভর ও যুগোপযোগী
              শিক্ষা ব্যবস্থা।
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
          Sunshine Education একটি আধুনিক Language
          Learning Center। Japanese, German এবং
          Korean ভাষা শিক্ষার পাশাপাশি শিক্ষার্থীদের
          আন্তর্জাতিক শিক্ষা ও কর্মসংস্থানের
          প্রস্তুতিতে সহায়তা করাই আমাদের অন্যতম লক্ষ্য।
        </p>

      </section>

    </div>
  );
}