import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Notice from "./pages/Notice";
import Teachers from "./pages/Teachers";
import About from "./pages/About";
import Download from "./pages/Download";
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
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/download" element={<Download />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />

    </div>
  );
}