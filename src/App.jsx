import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Login from "./admin/Login";
import Dashboard from "./admin/pages/Dashboard";
import StudentEntry from "./admin/pages/students/StudentEntry";
import StudentList from "./admin/pages/students/StudentList";
import StudentEdit from "./admin/pages/students/StudentEdit";
import StudentProfile from "./admin/pages/students/StudentProfile";

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

          {/* Website Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/download" element={<Download />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Pages */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />

          <Route
            path="/admin/students"
            element={<StudentEntry />}
          />

          <Route
            path="/admin/student-list"
            element={<StudentList />}
          />

          <Route
            path="/admin/student-profile/:id"
            element={<StudentProfile />}
          />

          <Route
            path="/admin/student-edit/:id"
            element={<StudentEdit />}
          />

        </Routes>
      </main>

      <Footer />

    </div>
  );
}