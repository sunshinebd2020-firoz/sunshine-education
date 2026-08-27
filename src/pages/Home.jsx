import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import {
  clearStudentAuthStorage,
  readStudentSession,
} from "../admin/authStorage";

const API = API_BASE_URL;
const IMAGE_URL = `${API_ORIGIN}/`;

const STUDENT_STORAGE_KEYS = [
  "sunshine_student",
  "sunshine_student_user",
  "sunshine_student_logged_in",
  "student_id",
  "student_username",
  "student_role",
  "student_status",
];

export default function Home() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const [studentDetails, setStudentDetails] = useState(() =>
    readStudentSession()
  );

  const [studentUsername, setStudentUsername] =
    useState("");

  const [studentPassword, setStudentPassword] =
    useState("");

  const [studentLoginLoading, setStudentLoginLoading] =
    useState(false);

  const [studentLoginError, setStudentLoginError] =
    useState("");

  const [languages, setLanguages] = useState([]);

  const [slideDirection, setSlideDirection] =
    useState("next");

  const [isAnimating, setIsAnimating] =
    useState(false);

  /* ======================================================
     DEFAULT LANGUAGES
  ====================================================== */

  const defaultLanguages = [
    {
      id: 1,
      name: "Japanese Language",
      desc: "N5, N4, N3 এবং JFT প্রস্তুতি কোর্স।",
    },
    {
      id: 2,
      name: "German Language",
      desc: "Basic ও Skill Test প্রস্তুতি কোর্স।",
    },
    {
      id: 3,
      name: "Korean Language",
      desc: "Basic ও Skill Test প্রস্তুতি কোর্স।",
    },
  ];

  /* ======================================================
     FETCH BANNERS
  ====================================================== */

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(
          `${API}/banner_list.php`,
          {
            credentials: "include",
          }
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
          setCurrentSlide(0);
          setPreviousSlide(null);
        }
      } catch (error) {
        console.error(
          "Banner load error:",
          error
        );
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  /* ======================================================
     FETCH LANGUAGES
  ====================================================== */

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(
          `${API}/language_list.php`,
          {
            credentials: "include",
          }
        );

        const result = await response.json();

        let list = [];

        if (
          result.success &&
          Array.isArray(result.data)
        ) {
          list = result.data;
        } else if (Array.isArray(result)) {
          list = result;
        }

        const activeLangs = list.filter((lang) => {
          const status = String(
            lang.status ?? ""
          )
            .trim()
            .toLowerCase();

          return (
            status === "active" ||
            status === "1"
          );
        });

        if (activeLangs.length > 0) {
          setLanguages(activeLangs);
        } else {
          setLanguages(defaultLanguages);
        }
      } catch (error) {
        console.error(
          "Language load error:",
          error
        );

        setLanguages(defaultLanguages);
      }
    };

    fetchLanguages();
  }, []);

  /* ======================================================
     LANGUAGE ICON
  ====================================================== */

  const getLanguageIcon = (name) => {
    const lang = String(name || "")
      .toLowerCase();

    if (lang.includes("japan")) return "🇯🇵";

    if (
      lang.includes("german") ||
      lang.includes("germany")
    ) {
      return "🇩🇪";
    }

    if (
      lang.includes("korean") ||
      lang.includes("korea")
    ) {
      return "🇰🇷";
    }

    if (lang.includes("english")) return "🇬🇧";
    if (lang.includes("french")) return "🇫🇷";
    if (lang.includes("chinese")) return "🇨🇳";

    return "🌐";
  };

  /* ======================================================
     CHANGE SLIDE
  ====================================================== */

  const changeSlide = (
    newIndex,
    direction = "next"
  ) => {
    if (
      banners.length <= 1 ||
      isAnimating ||
      newIndex === currentSlide
    ) {
      return;
    }

    setPreviousSlide(currentSlide);
    setSlideDirection(direction);
    setIsAnimating(true);
    setCurrentSlide(newIndex);

    setTimeout(() => {
      setPreviousSlide(null);
      setIsAnimating(false);
    }, 800);
  };

  /* ======================================================
     NEXT
  ====================================================== */

  const nextSlide = () => {
    if (banners.length === 0) return;

    const nextIndex =
      currentSlide === banners.length - 1
        ? 0
        : currentSlide + 1;

    changeSlide(nextIndex, "next");
  };

  /* ======================================================
     PREVIOUS
  ====================================================== */

  const previousBanner = () => {
    if (banners.length === 0) return;

    const previousIndex =
      currentSlide === 0
        ? banners.length - 1
        : currentSlide - 1;

    changeSlide(previousIndex, "previous");
  };

  /* ======================================================
     AUTO SLIDE
  ====================================================== */

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        const nextIndex =
          currentSlide === banners.length - 1
            ? 0
            : currentSlide + 1;

        changeSlide(nextIndex, "next");
      }
    }, 5000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    banners.length,
    currentSlide,
    isAnimating,
  ]);

  /* ======================================================
     GO TO SLIDE
  ====================================================== */

  const goToSlide = (index) => {
    if (
      index === currentSlide ||
      isAnimating
    ) {
      return;
    }

    const direction =
      index > currentSlide
        ? "next"
        : "previous";

    changeSlide(index, direction);
  };

  /* ======================================================
     CURRENT / OLD BANNER
  ====================================================== */

  const currentBanner =
    banners[currentSlide];

  const oldBanner =
    previousSlide !== null
      ? banners[previousSlide]
      : null;

  /* ======================================================
     STUDENT LOGIN
  ====================================================== */

  const handleStudentLogin = async (event) => {
    event.preventDefault();

    setStudentLoginError("");

    const username =
      studentUsername.trim();

    const password =
      studentPassword;

    if (!username) {
      setStudentLoginError(
        "Student ID is required."
      );
      return;
    }

    if (!password) {
      setStudentLoginError(
        "Password is required."
      );
      return;
    }

    setStudentLoginLoading(true);

    try {
      const response = await fetch(
        `${API}/student_login.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const text =
        await response.text();

      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server response was invalid."
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Student login failed."
        );
      }

      const studentPayload =
        data.profile ||
        data.student ||
        data.user ||
        {};

      const normalizedStudent = {
        ...studentPayload,

        id:
          studentPayload.id ||
          studentPayload.student_id ||
          username,

        student_id:
          studentPayload.student_id ||
          studentPayload.username ||
          username,

        username:
          studentPayload.username ||
          studentPayload.student_id ||
          username,

        full_name:
          studentPayload.full_name ||
          studentPayload.name ||
          studentPayload.student_name_en ||
          studentPayload.student_name_bn ||
          studentPayload.student_name ||
          studentPayload.student_full_name ||
          "",

        name:
          studentPayload.full_name ||
          studentPayload.name ||
          studentPayload.student_name_en ||
          studentPayload.student_name_bn ||
          studentPayload.student_name ||
          studentPayload.student_full_name ||
          "",

        phone:
          studentPayload.phone ||
          studentPayload.mobile ||
          studentPayload.student_mobile ||
          "",

        email:
          studentPayload.email || "",

        role: "student",

        status:
          studentPayload.status ||
          studentPayload.student_status ||
          "active",
      };

      const authState = {
        sunshine_student:
          normalizedStudent,

        sunshine_student_user:
          normalizedStudent,

        sunshine_student_logged_in:
          "1",

        student_id:
          normalizedStudent.student_id,

        student_username:
          normalizedStudent.username,

        student_role: "student",

        student_status:
          normalizedStudent.status,
      };

      Object.entries(
        authState
      ).forEach(
        ([key, value]) => {
          if (
            value === null ||
            value === undefined ||
            value === ""
          ) {
            localStorage.removeItem(
              key
            );
            return;
          }

          localStorage.setItem(
            key,
            typeof value ===
              "string"
              ? value
              : JSON.stringify(value)
          );
        }
      );

      STUDENT_STORAGE_KEYS.forEach(
        (key) => {
          if (!authState[key]) {
            localStorage.removeItem(
              key
            );
          }
        }
      );

      setStudentDetails(
        normalizedStudent
      );

      setStudentUsername("");
      setStudentPassword("");

      navigate(
        "/student-portal",
        {
          replace: true,
        }
      );
    } catch (error) {
      clearStudentAuthStorage();
      setStudentDetails(null);

      setStudentLoginError(
        error.message ||
          "Student login failed."
      );
    } finally {
      setStudentLoginLoading(
        false
      );
    }
  };

  /* ======================================================
     STUDENT LOGOUT
  ====================================================== */

  const handleStudentLogout = () => {
    clearStudentAuthStorage();

    setStudentDetails(null);
    setStudentUsername("");
    setStudentPassword("");
    setStudentLoginError("");
  };

  /* ======================================================
     RETURN
  ====================================================== */

  return (
    <div className="home-page">

      {/* =================================================
          BANNER
      ================================================= */}

      <section className="home-banner">

        {!loadingBanners &&
          banners.length > 0 && (
            <div className="banner-slider">

              {oldBanner && (
                <div
                  key={`old-${oldBanner.id}`}
                  className={`banner-slide banner-old ${
                    slideDirection === "next"
                      ? "slide-old-left"
                      : "slide-old-right"
                  }`}
                  style={{
                    backgroundImage:
                      `url("${IMAGE_URL}${oldBanner.banner_image}")`,
                  }}
                />
              )}

              {currentBanner && (
                <div
                  key={`current-${currentBanner.id}`}
                  className={`banner-slide banner-current ${
                    isAnimating
                      ? slideDirection === "next"
                        ? "slide-new-from-right"
                        : "slide-new-from-left"
                      : "slide-new-normal"
                  }`}
                  style={{
                    backgroundImage:
                      `url("${IMAGE_URL}${currentBanner.banner_image}")`,
                  }}
                />
              )}

              {banners.length > 1 && (
                <button
                  type="button"
                  className="banner-arrow banner-prev"
                  onClick={previousBanner}
                  disabled={isAnimating}
                  aria-label="Previous Banner"
                >
                  ❮
                </button>
              )}

              {banners.length > 1 && (
                <button
                  type="button"
                  className="banner-arrow banner-next"
                  onClick={nextSlide}
                  disabled={isAnimating}
                  aria-label="Next Banner"
                >
                  ❯
                </button>
              )}

              {banners.length > 1 && (
                <div className="banner-dots">

                  {banners.map(
                    (banner, index) => (
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
                        disabled={isAnimating}
                        aria-label={`Banner ${
                          index + 1
                        }`}
                      />
                    )
                  )}

                </div>
              )}

            </div>
          )}

      </section>

      {/* =================================================
          MAIN TWO COLUMN AREA
      ================================================= */}

      <div className="home-layout">

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <main className="home-main">

          <section className="welcome">

            <h1>
              Sunshine Education
            </h1>

            <p>
              আধুনিক ও মানসম্মত শিক্ষার মাধ্যমে
              শিক্ষার্থীদের জ্ঞান, দক্ষতা ও ভবিষ্যৎ
              ক্যারিয়ার গড়ে তোলাই আমাদের লক্ষ্য।
            </p>

          </section>

          {/* COURSES */}

          <section className="home-section">

            <h2 className="section-title">
              আমাদের কোর্সসমূহ
            </h2>

            <div className="course-cards">

              {languages.map(
                (lang) => (
                  <div
                    className="home-card"
                    key={
                      lang.id ||
                      lang.name
                    }
                  >

                    <div className="card-icon">
                      {getLanguageIcon(
                        lang.name
                      )}
                    </div>

                    <h3>
                      {lang.name}
                    </h3>

                    <p>
                      {lang.desc ||
                        `${lang.name} প্রস্তুতি কোর্স।`}
                    </p>

                  </div>
                )
              )}

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
                  নতুন ব্যাচে ভর্তি কার্যক্রম শুরু হয়েছে।
                </p>
              </div>

              <div className="notice-item">
                <span className="notice-date">
                  08 Aug 2026
                </span>

                <p>
                  Japanese Language নতুন ক্লাসের
                  সময়সূচি প্রকাশ করা হয়েছে।
                </p>
              </div>

              <div className="notice-item">
                <span className="notice-date">
                  05 Aug 2026
                </span>

                <p>
                  শিক্ষার্থীদের প্রয়োজনীয় কাগজপত্র
                  অফিসে জমা দেওয়ার জন্য অনুরোধ করা হলো।
                </p>
              </div>

            </div>

          </section>

        </main>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className="home-sidebar">

          {/* STUDENT LOGIN */}

          <section className="sidebar-section">

            <div className="student-login-card">

              <div className="student-login-header">

                <h3>
                  Student Portal
                </h3>

              </div>

              {studentDetails ? (
                <div className="student-login-welcome">

                  <p>
                    Welcome,{" "}
                    <strong>
                      {studentDetails.full_name ||
                        studentDetails.name ||
                        "Student"}
                    </strong>
                  </p>

                  <div className="student-login-meta">

                    <span>
                      ID:{" "}
                      {studentDetails.student_id ||
                        studentDetails.username}
                    </span>

                    <span>
                      Status:{" "}
                      {studentDetails.status ||
                        "Active"}
                    </span>

                  </div>

                  <div className="student-login-actions">

                    <button
                      type="button"
                      className="student-login-portal-btn"
                      onClick={() =>
                        navigate(
                          "/student-portal"
                        )
                      }
                    >
                      Open Portal
                    </button>

                    <button
                      type="button"
                      className="student-login-logout"
                      onClick={
                        handleStudentLogout
                      }
                    >
                      Logout
                    </button>

                  </div>

                </div>
              ) : (
                <form
                  className="student-login-form"
                  onSubmit={
                    handleStudentLogin
                  }
                >

                  <div className="student-login-field">

                    <label htmlFor="student-username">
                      Student ID
                    </label>

                    <input
                      id="student-username"
                      type="text"
                      value={studentUsername}
                      onChange={(event) =>
                        setStudentUsername(
                          event.target.value
                        )
                      }
                      placeholder="Enter student ID"
                      autoComplete="username"
                      disabled={
                        studentLoginLoading
                      }
                    />

                  </div>

                  <div className="student-login-field">

                    <label htmlFor="student-password">
                      Password
                    </label>

                    <input
                      id="student-password"
                      type="password"
                      value={studentPassword}
                      onChange={(event) =>
                        setStudentPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter password"
                      autoComplete="current-password"
                      disabled={
                        studentLoginLoading
                      }
                    />

                  </div>

                  <button
                    type="submit"
                    className="student-login-submit"
                    disabled={
                      studentLoginLoading
                    }
                  >
                    {studentLoginLoading
                      ? "Logging in..."
                      : "Login"}
                  </button>

                  {studentLoginError && (
                    <div className="student-login-error">
                      {
                        studentLoginError
                      }
                    </div>
                  )}

                </form>
              )}

            </div>

          </section>

          {/* =================================================
              FACEBOOK
          ================================================= */}

          <section className="sidebar-section facebook-section">

            <div className="facebook-activity">

              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fsunshine.eduraj%2F&tabs=timeline&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                title="Sunshine Education Facebook Activity"
                scrolling="no"
                frameBorder="0"
                allowFullScreen
              />

            </div>

          </section>

          {/* =================================================
              YOUTUBE
          ================================================= */}

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

      {/* =================================================
          FEATURES
      ================================================= */}

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

      {/* =================================================
          ABOUT
      ================================================= */}

      <section className="about-home">

        <h2>
          প্রতিষ্ঠান সম্পর্কে
        </h2>

        <p>
          Sunshine Education একটি আধুনিক Language
          Learning Center। Japanese, German এবং
          Korean ভাষা শিক্ষার পাশাপাশি শিক্ষার্থীদের
          আন্তর্জাতিক শিক্ষা ও কর্মসংস্থানের
          প্রস্তুতিতে সহায়তা করাই আমাদের অন্যতম লক্ষ্য।
        </p>

      </section>

    </div>
  );
}