import "./IncomeEntry.css";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";


const getToday = () => {

  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};


const initialForm = {
  income_date: getToday(),
  income_type: "",
  student_id: "",
  student_name: "",
  description: "",
  amount: "",
  payment_method: "",
  branch: "",
  note: "",
};


/* =====================================================
   LOGIN USER
===================================================== */

const getLoggedInUser = () => {

  const keys = [
    "sunshine_user",
    "admin",
    "user",
    "loggedInUser",
  ];

  for (const key of keys) {

    const value =
      localStorage.getItem(key);

    if (!value) continue;

    try {

      const user =
        JSON.parse(value);

      if (
        user &&
        typeof user === "object"
      ) {
        return user;
      }

    } catch (error) {

      console.error(
        `Invalid localStorage data: ${key}`,
        error
      );
    }
  }

  return null;
};


/* =====================================================
   ADMIN ROLE
===================================================== */

const isAdminRole = (role) => {

  const normalized =
    String(role || "")
      .trim()
      .toLowerCase();

  return [
    "admin",
    "administrator",
    "super admin",
    "superadmin",
  ].includes(normalized);
};


export default function IncomeEntry() {

  const [form, setForm] =
    useState(initialForm);

  const [students, setStudents] =
    useState([]);

  const [branches, setBranches] =
    useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  const [activeField, setActiveField] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [, setLoadingStudents] =
    useState(true);

  const [loadingBranches, setLoadingBranches] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [teacherId, setTeacherId] =
    useState("");

  const [adminId, setAdminId] =
    useState("");

  const [userRole, setUserRole] =
    useState("");

  const [userBranch, setUserBranch] =
    useState("");

  const [branchScope, setBranchScope] =
    useState("own");


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    const loadUser = async () => {

      const user =
        getLoggedInUser();

      if (!user) {

        setMessage(
          "Login user information পাওয়া যায়নি। আবার login করুন।"
        );

        return;
      }


      const currentTeacherId =
        String(
          user.teacher_id ||
          user.teacherId ||
          ""
        ).trim();


      const currentAdminId =
        String(
          user.admin_id ||
          user.adminId ||
          user.user_id ||
          user.userId ||
          user.id ||
          ""
        ).trim();


      const currentRole =
        String(
          user.role || ""
        )
          .trim()
          .toLowerCase();


      const storedBranch =
        String(
          user.branch ||
          user.branch_name ||
          ""
        ).trim();


      setTeacherId(
        currentTeacherId
      );

      setAdminId(
        currentAdminId
      );

      setUserRole(
        currentRole
      );

      setUserBranch(
        storedBranch
      );

      setBranchScope(
        user.branch_scope === "all" ? "all" : "own"
      );


      /*
       * Teacher/Staff-এর branch
       * teacher_list থেকে নেওয়া হবে
       * যদি login storage-এ না থাকে।
       */

      if (
        currentTeacherId &&
        !isAdminRole(currentRole)
      ) {

        try {

          const response =
            await fetch(
              `${API_BASE_URL}/teacher_list.php`,
              { credentials: "include" }
            );

          const data =
            await response.json();

          const teachers =
            Array.isArray(
              data.data
            )
              ? data.data
              : Array.isArray(
                  data.teachers
                )
              ? data.teachers
              : [];

          const currentTeacher =
            teachers.find(
              (teacher) =>
                String(
                  teacher.teacher_id || ""
                ).trim() ===
                currentTeacherId
            );


          if (currentTeacher) {

            const branch =
              String(
                currentTeacher.branch ||
                currentTeacher.branch_name ||
                ""
              ).trim();

            setUserBranch(
              branch
            );

            setForm((prev) => ({
              ...prev,
              branch,
            }));
          }

        } catch (error) {

          console.error(
            "Teacher branch fetch error:",
            error
          );
        }
      }

    };

    loadUser();

  }, []);


  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  useEffect(() => {

    const fetchStudents =
      async () => {

        try {

          setLoadingStudents(
            true
          );

          const response =
            await fetch(
              `${API_BASE_URL}/students.php`,
              { credentials: "include" }
            );

          const data =
            await response.json();

          const records =
            Array.isArray(
              data.students
            )
              ? data.students
              : Array.isArray(
                  data.data
                )
              ? data.data
              : [];

          setStudents(
            records
          );

        } catch (error) {

          console.error(
            "Student fetch error:",
            error
          );

          setStudents([]);

        } finally {

          setLoadingStudents(
            false
          );
        }
      };

    fetchStudents();

  }, []);


  /* =====================================================
     LOAD BRANCHES
  ===================================================== */

  useEffect(() => {

    const fetchBranches =
      async () => {

        try {

          setLoadingBranches(
            true
          );

          const response =
            await fetch(
              `${API_BASE_URL}/branch_list.php`,
              { credentials: "include" }
            );

          const data =
            await response.json();

          const records =
            Array.isArray(
              data.branches
            )
              ? data.branches
              : Array.isArray(
                  data.data
                )
              ? data.data
              : [];

          setBranches(
            records
          );

        } catch (error) {

          console.error(
            "Branch fetch error:",
            error
          );

          setBranches([]);

        } finally {

          setLoadingBranches(
            false
          );
        }
      };

    fetchBranches();

  }, []);


  /* =====================================================
     STUDENT NAME
  ===================================================== */

  const getStudentName =
    (student) =>
      student.student_name ||
      student.student_name_bn ||
      student.student_name_en ||
      "";


  /* =====================================================
     SEARCH
  ===================================================== */

  const searchStudents =
    (value) => {

      const search =
        String(value || "")
          .trim()
          .toLowerCase();

      if (!search) {

        setSuggestions([]);

        return;
      }

      const filtered =
        students
          .filter((student) => {

            const id =
              String(
                student.student_id || ""
              ).toLowerCase();

            const name =
              getStudentName(
                student
              ).toLowerCase();

            return (
              id.includes(search) ||
              name.includes(search)
            );
          })
          .slice(0, 8);

      setSuggestions(
        filtered
      );
    };


  const handleStudentIdChange =
    (e) => {

      const value =
        e.target.value;

      setForm((prev) => ({
        ...prev,
        student_id: value,
      }));

      setActiveField("id");

      searchStudents(
        value
      );
    };


  const handleStudentNameChange =
    (e) => {

      const value =
        e.target.value;

      setForm((prev) => ({
        ...prev,
        student_name: value,
      }));

      setActiveField("name");

      searchStudents(
        value
      );
    };


  /* =====================================================
     SELECT STUDENT
  ===================================================== */

  const selectStudent =
    (student) => {

      setForm((prev) => ({
        ...prev,

        student_id:
          student.student_id ||
          "",

        student_name:
          getStudentName(
            student
          ),

        branch:
          isAdminRole(userRole)
            ? student.branch ||
              prev.branch
            : userBranch,
      }));

      setSuggestions([]);

      setActiveField("");
    };


  const handleBlur = () => {

    setTimeout(() => {

      setSuggestions([]);

      setActiveField("");

    }, 200);
  };


  /* =====================================================
     CHANGE
  ===================================================== */

  const handleChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;

      if (
        name === "branch" &&
        !isAdminRole(userRole)
      ) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setMessage("");


      if (
        !teacherId &&
        !adminId
      ) {

        setMessage(
          "Login user ID পাওয়া যাচ্ছে না। আবার login করুন।"
        );

        return;
      }


      if (
        !isAdminRole(userRole) &&
        !userBranch
      ) {

        setMessage(
          "আপনার branch assign করা হয়নি।"
        );

        return;
      }


      if (
        isAdminRole(userRole) &&
        !form.branch
      ) {

        setMessage(
          "Branch নির্বাচন করুন।"
        );

        return;
      }


      try {

        setSaving(true);


        const payload = {

          ...form,

          teacher_id:
            teacherId,

          admin_id:
            adminId,

          role:
            userRole,

          branch:
            isAdminRole(userRole) || branchScope === "all"
              ? form.branch
              : userBranch,
        };


        const response =
          await fetch(
            `${API_BASE_URL}/add_income.php`,
            {
              method: "POST",
              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        const text =
          await response.text();


        let data;

        try {

          data =
            JSON.parse(text);

        } catch {

          throw new Error(
            text
          );
        }


        if (data.success) {

          setMessage(
            "Income সফলভাবে যোগ হয়েছে!"
          );


          setForm({
            ...initialForm,

            income_date:
              getToday(),

            branch:
              isAdminRole(userRole)
                ? ""
                : userBranch,
          });


          setSuggestions([]);

          setActiveField("");

        } else {

          setMessage(
            data.message ||
            "Income যোগ করা যায়নি।"
          );
        }

      } catch (error) {

        console.error(
          "Income submit error:",
          error
        );

        setMessage(
          error.message ||
          "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );

      } finally {

        setSaving(false);
      }
    };


  return (

    <div className="income-entry">

      <div className="income-entry-header">

        <div>

          <h1>
            Income Entry
          </h1>

          <p>
            নতুন Income তথ্য যোগ করুন
          </p>

          {!isAdminRole(userRole) &&
            userBranch && (

              <p>
                Branch:{" "}
                <strong>
                  {userBranch}
                </strong>
              </p>
            )}

        </div>

      </div>


      <form
        className="income-form"
        onSubmit={
          handleSubmit
        }
      >

        <div className="form-grid">

          <div className="form-group">

            <label>
              Income Date *
            </label>

            <input
              type="date"
              name="income_date"
              value={
                form.income_date
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Income Type *
            </label>

            <select
              name="income_type"
              value={
                form.income_type
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Select Income Type
              </option>

              <option value="Course Fee">
                Course Fee
              </option>

              <option value="Registration Fee">
                Registration Fee
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="form-group student-autocomplete">

            <label>
              Student ID
            </label>

            <input
              type="text"
              value={
                form.student_id
              }
              onChange={
                handleStudentIdChange
              }
              onFocus={() => {

                setActiveField(
                  "id"
                );

                searchStudents(
                  form.student_id
                );

              }}
              onBlur={
                handleBlur
              }
              placeholder="Enter Student ID"
              autoComplete="off"
            />


            {activeField ===
              "id" &&
              suggestions.length >
                0 && (

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

          </div>


          <div className="form-group student-autocomplete">

            <label>
              Student Name
            </label>

            <input
              type="text"
              value={
                form.student_name
              }
              onChange={
                handleStudentNameChange
              }
              onFocus={() => {

                setActiveField(
                  "name"
                );

                searchStudents(
                  form.student_name
                );

              }}
              onBlur={
                handleBlur
              }
              placeholder="Enter Student Name"
              autoComplete="off"
            />


            {activeField ===
              "name" &&
              suggestions.length >
                0 && (

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

          </div>


          <div className="form-group">

            <label>
              Amount *
            </label>

            <input
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />

          </div>


          <div className="form-group">

            <label>
              Payment Method
            </label>

            <select
              name="payment_method"
              value={
                form.payment_method
              }
              onChange={
                handleChange
              }
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


          <div className="form-group">

            <label>
              Branch
            </label>


            {isAdminRole(userRole) || branchScope === "all" ? (

              <select
                name="branch"
                value={
                  form.branch
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  {loadingBranches
                    ? "Loading Branches..."
                    : "Select Branch"}
                </option>

                {branches.map(
                  (branchItem) => (

                    <option
                      key={
                        branchItem.id
                      }
                      value={
                        branchItem.branch_name
                      }
                    >

                      {branchItem.branch_name_bn
                        ? `${branchItem.branch_name} - ${branchItem.branch_name_bn}`
                        : branchItem.branch_name}

                    </option>

                  )
                )}

              </select>

            ) : (

              <input
                type="text"
                value={
                  userBranch ||
                  "Branch not assigned"
                }
                readOnly
              />

            )}

          </div>


          <div className="form-group full-width">

            <label>
              Description
            </label>

            <input
              type="text"
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Income description"
            />

          </div>


          <div className="form-group full-width">

            <label>
              Note
            </label>

            <textarea
              name="note"
              value={
                form.note
              }
              onChange={
                handleChange
              }
              placeholder="Additional note"
              rows="4"
            />

          </div>

        </div>


        {message && (

          <div className="income-message">
            {message}
          </div>

        )}


        <div className="form-actions">

          <button
            type="submit"
            disabled={
              saving
            }
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