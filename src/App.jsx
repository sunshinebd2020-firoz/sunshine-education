import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

const Login = lazy(() => import("./admin/Login"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));

const Dashboard = lazy(() => import("./admin/pages/Dashboard"));

// ================= STUDENTS =================
const StudentEntry = lazy(() => import("./admin/pages/students/StudentEntry"));
const StudentList = lazy(() => import("./admin/pages/students/StudentList"));
const StudentEdit = lazy(() => import("./admin/pages/students/StudentEdit"));
const StudentProfile = lazy(() => import("./admin/pages/students/StudentProfile"));

// Pending Student List
const PendingStudentList = lazy(() => import("./admin/pages/PendingStudentList"));

// ================= TEACHERS =================
const TeacherEntry = lazy(() => import("./admin/pages/teachers/TeacherEntry"));
const TeacherList = lazy(() => import("./admin/pages/teachers/TeacherList"));
const TeacherProfile = lazy(() => import("./admin/pages/teachers/TeacherProfile"));
const TeacherEdit = lazy(() => import("./admin/pages/teachers/TeacherEdit"));
const DownloadList = lazy(() => import("./admin/pages/DownloadList"));
const DownloadEntry = lazy(() => import("./admin/pages/DownloadEntry"));

// ================= GALLERY =================
const GalleryEntry = lazy(() => import("./admin/pages/GalleryEntry"));
const GalleryList = lazy(() => import("./admin/pages/GalleryList"));

// ================= BANNER =================
const BannerEntry = lazy(() => import("./admin/pages/BannerEntry"));
const BannerList = lazy(() => import("./admin/pages/BannerList"));

// ================= INCOME =================
const IncomeEntry = lazy(() => import("./admin/pages/IncomeEntry"));
const IncomeList = lazy(() => import("./admin/pages/IncomeList"));
const IncomeEdit = lazy(() => import("./admin/pages/IncomeEdit"));

// ================= EXPENSE =================
const ExpenseEntry = lazy(() => import("./admin/pages/ExpenseEntry"));
const ExpenseList = lazy(() => import("./admin/pages/ExpenseList"));
const ExpenseEdit = lazy(() => import("./admin/pages/ExpenseEdit"));

// ================= INCOME-EXPENSE REPORT =================
const IncomeExpenseReport = lazy(() => import("./admin/pages/IncomeExpenseReport"));
const DueList = lazy(() => import("./admin/pages/DueList"));
const IncomeVoucher = lazy(() => import("./admin/pages/IncomeVoucher"));


// ================= NOTICE =================
const NoticeEntry = lazy(() => import("./admin/pages/NoticeEntry"));
const NoticeList = lazy(() => import("./admin/pages/NoticeList"));
const NoticeEdit = lazy(() => import("./admin/pages/NoticeEdit"));

// ================= COURSE =================
const CourseList = lazy(() => import("./admin/pages/CourseList"));
const AddCourse = lazy(() => import("./admin/pages/AddCourse"));
const EditCourse = lazy(() => import("./admin/pages/EditCourse"));

// ================= BRANCH =================
const BranchEntry = lazy(() => import("./admin/pages/BranchEntry"));
const BranchList = lazy(() => import("./admin/pages/BranchList"));
const BranchEdit = lazy(() => import("./admin/pages/BranchEdit"));

// ================= PUBLIC PAGES =================
const Home = lazy(() => import("./pages/Home"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Notice = lazy(() => import("./pages/Notice"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Download = lazy(() => import("./pages/Download"));
const About = lazy(() => import("./pages/About"));
const Courses = lazy(() => import("./pages/Courses"));
const Admission = lazy(() => import("./pages/Admission"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ================= PUBLIC STUDENT ENTRY =================
const PublicStudentEntry = lazy(() => import("./pages/StudentEntry"));


export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      {!isAdminRoute && <Header />}

      {/* ================= NAVBAR ================= */}

      {!isAdminRoute && <Navbar />}

      {/* ================= MAIN CONTENT ================= */}

      <main className="content">

        <Suspense fallback={<div>Loading...</div>}>
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

            <Route path="teacher-profile/:id" element={<TeacherProfile />} />
            <Route path="teacher-edit/:id" element={<TeacherEdit />} />

            <Route path="downloads" element={<DownloadList />} />
            <Route path="download-entry" element={<DownloadEntry />} />


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
                EXPENSE
            ================================================= */}

            <Route
              path="expense"
              element={<ExpenseEntry />}
            />

            <Route
              path="expense-list"
              element={<ExpenseList />}
            />

            <Route
              path="expense-edit/:id"
              element={<ExpenseEdit />}
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


            {/* =================================================
                BRANCH
            ================================================= */}

            <Route
              path="branch-entry"
              element={<BranchEntry />}
            />

            <Route
              path="branch-list"
              element={<BranchList />}
            />

            <Route
              path="branch-edit/:id"
              element={<BranchEdit />}
            />

            <Route
              path="income-expense-report"
              element={<IncomeExpenseReport />}
            />

            <Route
              path="/admin/due-list"
              element={<DueList />}
            />

            <Route
              path="/admin/income-voucher/:id"
              element={<IncomeVoucher />}
            />

            <Route
              path="*"
              element={<NotFound />}
            />

          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />

          </Routes>
        </Suspense>

      </main>


      {/* ================= FOOTER ================= */}

      {!isAdminRoute && <Footer />}

    </div>
  );
}