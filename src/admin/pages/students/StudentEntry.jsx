import "./StudentEntry.css";
import { useState } from "react";

export default function StudentEntry() {
  const [studentName, setStudentName] = useState("");
  const [mobile, setMobile] = useState("");
  const [course, setCourse] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const formData = new FormData();

    formData.append("student_name", studentName);
    formData.append("mobile", mobile);
    formData.append("course", course);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("address", address);

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/add_student.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Student Saved Successfully");

        setStudentName("");
        setMobile("");
        setCourse("");
        setDateOfBirth("");
        setAddress("");
      } else {
        setMessage(data.message);
      }

    } catch (error) {
      setMessage("Server connection failed");
    }
  };

  return (
    <div className="student-entry">

      <h1>Student Entry</h1>

      <p>নতুন শিক্ষার্থীর তথ্য সংরক্ষণ করুন</p>

      <form
        className="student-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label>Student Name</label>

          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </div>


        <div className="form-group">
          <label>Mobile Number</label>

          <input
            type="text"
            placeholder="মোবাইল নম্বর"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>


        <div className="form-group">
          <label>Course</label>

          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="">Select Course</option>

            <option value="Japanese">
              Japanese Language
            </option>

            <option value="German">
              German Language
            </option>

            <option value="Korean">
              Korean Language
            </option>
          </select>
        </div>


        <div className="form-group">
          <label>Date of Birth</label>

          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>


        <div className="form-group">
          <label>Address</label>

          <textarea
            placeholder="ঠিকানা"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>
        </div>


        <button type="submit">
          Save Student
        </button>

        {message && (
          <p className="student-message">
            {message}
          </p>
        )}

      </form>

    </div>
  );
}