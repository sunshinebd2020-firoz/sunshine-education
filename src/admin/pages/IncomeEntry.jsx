import "./IncomeEntry.css";
import { useEffect, useState } from "react";

const initialForm = {
  income_date: new Date().toISOString().split("T")[0],
  income_type: "",
  student_id: "",
  student_name: "",
  description: "",
  amount: "",
  payment_method: "",
  branch: "",
  note: "",
};

export default function IncomeEntry() {
  const [form, setForm] = useState(initialForm);

  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");

  const [message, setMessage] = useState("");

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);

        const response = await fetch(
          "http://localhost/sunshine-api/api/students.php"
        );

        if (!response.ok) {
          throw new Error("Student server error");
        }

        const data = await response.json();

        console.log("Students API Response:", data);

        if (data.success) {
          setStudents(
            Array.isArray(data.students)
              ? data.students
              : []
          );
        } else {
          console.error(
            "Student API Error:",
            data.message
          );
        }
      } catch (error) {
        console.error(
          "Student fetch error:",
          error
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);


  /* =====================================================
     LOAD BRANCHES
  ===================================================== */

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);

        const response = await fetch(
          "http://localhost/sunshine-api/api/branch_list.php"
        );

        if (!response.ok) {
          throw new Error("Branch server error");
        }

        const data = await response.json();

        console.log("Branch API Response:", data);

        if (data.success) {
          setBranches(
            Array.isArray(data.branches)
              ? data.branches
              : []
          );
        } else {
          console.error(
            "Branch API Error:",
            data.message
          );
        }
      } catch (error) {
        console.error(
          "Branch fetch error:",
          error
        );
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);


  /* =====================================================
     GET STUDENT NAME
  ===================================================== */

  const getStudentName = (student) => {
    return (
      student.student_name ||
      student.student_name_bn ||
      student.student_name_en ||
      ""
    );
  };


  /* =====================================================
     SEARCH STUDENTS
  ===================================================== */

  const searchStudents = (value) => {
    const search = value.trim().toLowerCase();

    if (!search) {
      setSuggestions([]);
      return;
    }

    const filtered = students
      .filter((student) => {
        const studentId = String(
          student.student_id || ""
        ).toLowerCase();

        const studentName = getStudentName(
          student
        ).toLowerCase();

        return (
          studentId.includes(search) ||
          studentName.includes(search)
        );
      })
      .slice(0, 8);

    setSuggestions(filtered);
  };


  /* =====================================================
     STUDENT ID CHANGE
  ===================================================== */

  const handleStudentIdChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      student_id: value,
    }));

    setActiveField("id");

    searchStudents(value);
  };


  /* =====================================================
     STUDENT NAME CHANGE
  ===================================================== */

  const handleStudentNameChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      student_name: value,
    }));

    setActiveField("name");

    searchStudents(value);
  };


  /* =====================================================
     SELECT STUDENT
  ===================================================== */

  const selectStudent = (student) => {
    setForm((prev) => ({
      ...prev,

      student_id:
        student.student_id || "",

      student_name:
        getStudentName(student),

      branch:
        student.branch || prev.branch,
    }));

    setSuggestions([]);
    setActiveField("");
  };


  /* =====================================================
     CLOSE SUGGESTIONS
  ===================================================== */

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setActiveField("");
    }, 200);
  };


  /* =====================================================
     NORMAL CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost/sunshine-api/api/add_income.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Income server error");
      }

      const data = await response.json();

      console.log(
        "Income API Response:",
        data
      );

      if (data.success) {
        setMessage(
          "Income সফলভাবে যোগ হয়েছে!"
        );

        setForm({
          ...initialForm,

          income_date:
            new Date()
              .toISOString()
              .split("T")[0],
        });

        setSuggestions([]);
        setActiveField("");
      } else {
        setMessage(
          data.message ||
            "Income যোগ করা যায়নি"
        );
      }
    } catch (error) {
      console.error(
        "Income submit error:",
        error
      );

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="income-entry">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="income-entry-header">

        <div>

          <h1>
            Income Entry
          </h1>

          <p>
            নতুন Income তথ্য যোগ করুন
          </p>

        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="income-form"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">


          {/* =================================================
              INCOME DATE
          ================================================= */}

          <div className="form-group">

            <label>
              Income Date *
            </label>

            <input
              type="date"
              name="income_date"
              value={form.income_date}
              onChange={handleChange}
              required
            />

          </div>


          {/* =================================================
              INCOME TYPE
          ================================================= */}

          <div className="form-group">

            <label>
              Income Type *
            </label>

            <select
              name="income_type"
              value={form.income_type}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Income Type
              </option>

              <option value="Course Fee">
                Course Fee
              </option>

              <option value="Admission Fee">
                Admission Fee
              </option>

              <option value="Registration Fee">
                Registration Fee
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* =================================================
              STUDENT ID
          ================================================= */}

          <div className="form-group student-autocomplete">

            <label>
              Student ID
            </label>

            <input
              type="text"
              name="student_id"
              value={form.student_id}
              onChange={handleStudentIdChange}
              onFocus={() => {
                setActiveField("id");
                searchStudents(
                  form.student_id
                );
              }}
              onBlur={handleBlur}
              placeholder="Enter Student ID"
              autoComplete="off"
            />


            {activeField === "id" &&
              suggestions.length > 0 && (

                <div className="student-suggestions">

                  {suggestions.map(
                    (student) => (

                      <div
                        key={
                          student.id ||
                          student.student_id
                        }
                        className="student-suggestion"
                        onMouseDown={() =>
                          selectStudent(
                            student
                          )
                        }
                      >

                        <strong>
                          {
                            student.student_id
                          }
                        </strong>

                        <span>
                          {
                            getStudentName(
                              student
                            )
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


            <small>

              {loadingStudents
                ? "Student data loading..."
                : "Student ID লিখলে student suggestion দেখাবে"}

            </small>

          </div>


          {/* =================================================
              STUDENT NAME
          ================================================= */}

          <div className="form-group student-autocomplete">

            <label>
              Student Name
            </label>

            <input
              type="text"
              name="student_name"
              value={form.student_name}
              onChange={
                handleStudentNameChange
              }
              onFocus={() => {
                setActiveField("name");

                searchStudents(
                  form.student_name
                );
              }}
              onBlur={handleBlur}
              placeholder="Enter Student Name"
              autoComplete="off"
            />


            {activeField === "name" &&
              suggestions.length > 0 && (

                <div className="student-suggestions">

                  {suggestions.map(
                    (student) => (

                      <div
                        key={
                          student.id ||
                          student.student_id
                        }
                        className="student-suggestion"
                        onMouseDown={() =>
                          selectStudent(
                            student
                          )
                        }
                      >

                        <strong>
                          {
                            student.student_id
                          }
                        </strong>

                        <span>
                          {
                            getStudentName(
                              student
                            )
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


            <small>

              {loadingStudents
                ? "Student data loading..."
                : "Student Name লিখলে suggestion দেখাবে"}

            </small>

          </div>


          {/* =================================================
              AMOUNT
          ================================================= */}

          <div className="form-group">

            <label>
              Amount *
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />

          </div>


          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div className="form-group">

            <label>
              Payment Method
            </label>

            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
            >

              <option value="">
                Select Payment Method
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Bank">
                Bank
              </option>

              <option value="Bkash">
                Bkash
              </option>

              <option value="Nagad">
                Nagad
              </option>

              <option value="Rocket">
                Rocket
              </option>

            </select>

          </div>


          {/* =================================================
              BRANCH - DYNAMIC
          ================================================= */}

          <div className="form-group">

            <label>
              Branch
            </label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
            >

              <option value="">
                {loadingBranches
                  ? "Loading Branches..."
                  : "Select Branch"}
              </option>

              {branches.map(
                (branch) => (

                  <option
                    key={branch.id}
                    value={
                      branch.branch_name
                    }
                  >

                    {branch.branch_name_bn
                      ? `${branch.branch_name} - ${branch.branch_name_bn}`
                      : branch.branch_name}

                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="form-group full-width">

            <label>
              Description
            </label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Income description"
            />

          </div>


          {/* =================================================
              NOTE
          ================================================= */}

          <div className="form-group full-width">

            <label>
              Note
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Additional note"
              rows="4"
            ></textarea>

          </div>


        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="income-message">
            {message}
          </div>

        )}


        {/* =================================================
            BUTTON
        ================================================= */}

        <div className="form-actions">

          <button
            type="submit"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Income"}

          </button>

        </div>


      </form>

    </div>
  );
}