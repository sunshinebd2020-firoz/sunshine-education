import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Login from "./admin/Login";
import AdminLayout from "./admin/AdminLayout";

import Dashboard from "./admin/pages/Dashboard";

// ================= STUDENTS =================
import StudentEntry from "./admin/pages/students/StudentEntry";
import StudentList from "./admin/pages/students/StudentList";
import StudentEdit from "./admin/pages/students/StudentEdit";
import StudentProfile from "./admin/pages/students/StudentProfile";

// Pending Student List
import PendingStudentList from "./admin/pages/PendingStudentList";

// ================= TEACHERS =================
import TeacherEntry from "./admin/pages/teachers/TeacherEntry";
import TeacherList from "./admin/pages/teachers/TeacherList";

// ================= GALLERY =================
import GalleryEntry from "./admin/pages/GalleryEntry";
import GalleryList from "./admin/pages/GalleryList";

// ================= BANNER =================
import BannerEntry from "./admin/pages/BannerEntry";
import BannerList from "./admin/pages/BannerList";

// ================= INCOME =================
import IncomeEntry from "./admin/pages/IncomeEntry";
import IncomeList from "./admin/pages/IncomeList";
import IncomeEdit from "./admin/pages/IncomeEdit";

// ================= NOTICE =================
import NoticeEntry from "./admin/pages/NoticeEntry";
import NoticeList from "./admin/pages/NoticeList";
import NoticeEdit from "./admin/pages/NoticeEdit";

// ================= COURSE =================
import CourseList from "./admin/pages/CourseList";
import AddCourse from "./admin/pages/AddCourse";
import EditCourse from "./admin/pages/EditCourse";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Notice from "./pages/Notice";
import Teachers from "./pages/Teachers";
import Download from "./pages/Download";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Admission from "./pages/Admission";
import Contact from "./pages/Contact";

// ================= PUBLIC STUDENT ENTRY =================
import PublicStudentEntry from "./pages/StudentEntry";


export default function App() {
  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <Header />

      {/* ================= NAVBAR ================= */}

      <Navbar />

      {/* ================= MAIN CONTENT ================= */}

      <main className="content">

        <Routes>

          {/* =====================================================
              PUBLIC WEBSITE
          ===================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

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


          {/* =====================================================
              PUBLIC STUDENT APPLICATION
          ===================================================== */}

          <Route
            path="/student-entry"
            element={<PublicStudentEntry />}
          />


          {/* =====================================================
              ADMIN LOGIN
          ===================================================== */}

          <Route
            path="/admin/login"
            element={<Login />}
          />


          {/* =====================================================
              ADMIN PANEL
          ===================================================== */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* ================= DASHBOARD ================= */}

            <Route
              path="dashboard"
              element={<Dashboard />}
            />


            {/* =================================================
                STUDENTS
            ================================================= */}

            <Route
              path="students"
              element={<StudentEntry />}
            />

            <Route
              path="student-list"
              element={<StudentList />}
            />

            {/* Pending Student Applications */}

            <Route
              path="pending-students"
              element={<PendingStudentList />}
            />

            <Route
              path="student-profile/:id"
              element={<StudentProfile />}
            />

            <Route
              path="student-edit/:id"
              element={<StudentEdit />}
            />


            {/* =================================================
                TEACHERS
            ================================================= */}

            <Route
              path="teachers"
              element={<TeacherEntry />}
            />

            <Route
              path="teacher-list"
              element={<TeacherList />}
            />


            {/* =================================================
                GALLERY
            ================================================= */}

            <Route
              path="gallery"
              element={<GalleryEntry />}
            />

            <Route
              path="gallery-list"
              element={<GalleryList />}
            />


            {/* =================================================
                BANNER
            ================================================= */}

            <Route
              path="banner-entry"
              element={<BannerEntry />}
            />

            <Route
              path="banner-list"
              element={<BannerList />}
            />


            {/* =================================================
                INCOME
            ================================================= */}

            <Route
              path="income"
              element={<IncomeEntry />}
            />

            <Route
              path="income-list"
              element={<IncomeList />}
            />

            <Route
              path="income-edit/:id"
              element={<IncomeEdit />}
            />


            {/* =================================================
                NOTICE
            ================================================= */}

            <Route
              path="notices"
              element={<NoticeList />}
            />

            <Route
              path="notice-entry"
              element={<NoticeEntry />}
            />

            <Route
              path="notice-edit/:id"
              element={<NoticeEdit />}
            />


            {/* =================================================
                COURSE
            ================================================= */}

            <Route
              path="courses"
              element={<CourseList />}
            />

            <Route
              path="AddCourse"
              element={<AddCourse />}
            />

            <Route
              path="EditCourse"
              element={<EditCourse />}
            />

          </Route>

        </Routes>

      </main>


      {/* ================= FOOTER ================= */}

      <Footer />

    </div>
  );
}