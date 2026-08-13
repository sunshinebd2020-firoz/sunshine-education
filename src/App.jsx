import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Login from "./admin/Login";
import AdminLayout from "./admin/AdminLayout";

import Dashboard from "./admin/pages/Dashboard";

import StudentEntry from "./admin/pages/students/StudentEntry";
import StudentList from "./admin/pages/students/StudentList";
import StudentEdit from "./admin/pages/students/StudentEdit";
import StudentProfile from "./admin/pages/students/StudentProfile";

import TeacherEntry from "./admin/pages/teachers/TeacherEntry";
import TeacherList from "./admin/pages/teachers/TeacherList";
import GalleryEntry from "./admin/pages/GalleryEntry";
import GalleryList from "./admin/pages/GalleryList";
import BannerEntry from "./admin/pages/BannerEntry";
import BannerList from "./admin/pages/BannerList";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Notice from "./pages/Notice";
import Teachers from "./pages/Teachers";
import Download from "./pages/Download";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Admission from "./pages/Admission";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <div className="app">

      <Header />
      <Navbar />

      <main className="content">

        <Routes>

          {/* ================= WEBSITE ================= */}

          <Route path="/" element={<Home />} />

          <Route
            path="/gallery"
            element={<Gallery />}
          />

          <Route
            path="/notice"
            element={<Notice />}
          />

          <Route
            path="/teachers"
            element={<Teachers />}
          />

          <Route
            path="/download"
            element={<Download />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/courses"
            element={<Courses />}
          />

          <Route
            path="/admission"
            element={<Admission />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />


          {/* ================= ADMIN LOGIN ================= */}

          <Route
            path="/admin/login"
            element={<Login />}
          />


          {/* ================= ADMIN PANEL ================= */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* Dashboard */}

            <Route
              path="dashboard"
              element={<Dashboard />}
            />


            {/* ================= STUDENTS ================= */}

            <Route
              path="students"
              element={<StudentEntry />}
            />

            <Route
              path="student-list"
              element={<StudentList />}
            />

            <Route
              path="student-profile/:id"
              element={<StudentProfile />}
            />

            <Route
              path="student-edit/:id"
              element={<StudentEdit />}
            />


            {/* ================= TEACHERS ================= */}

            <Route
              path="teachers"
              element={<TeacherEntry />}
            />

            <Route
              path="teacher-list"
              element={<TeacherList />}
            />

            {/* ================= GALLERY ================= */}
            <Route path="gallery" element={<GalleryEntry />} />
            <Route path="gallery-list" element={<GalleryList />} />

            {/* ================= BANNER ================= */}
            <Route path="banner-entry" element={<BannerEntry />} />
            <Route path="banner-list" element={<BannerList />} />

          </Route>

        </Routes>

      </main>

      <Footer />

    </div>
  );
}