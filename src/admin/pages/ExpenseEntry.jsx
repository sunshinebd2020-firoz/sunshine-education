import "./ExpenseEntry.css";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";


/* =====================================================
   TODAY
===================================================== */

const getToday = () => {

  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

};


/* =====================================================
   INITIAL FORM
===================================================== */

const initialForm = {

  expense_date:
    getToday(),

  expense_type: "",

  staff_id: "",

  staff_name: "",

  description: "",

  amount: "",

  payment_method: "",

  branch: "",

  note: "",

};


/* =====================================================
   GET USER
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
      localStorage.getItem(
        key
      );


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

const isAdminRole = (
  role
) => {

  const normalized =
    String(
      role || ""
    )
      .trim()
      .toLowerCase();


  return [
    "admin",
    "administrator",
    "super admin",
    "superadmin",
  ].includes(
    normalized
  );

};


/* =====================================================
   ADMIN ID
===================================================== */

const getAdminId = (
  user
) => {

  if (!user) return "";

  return String(
    user.admin_id ||
      user.adminId ||
      user.id ||
      user.user_id ||
      user.userId ||
      ""
  ).trim();

};


/* =====================================================
   TEACHER ID
===================================================== */

const getTeacherId = (
  user
) => {

  if (!user) return "";

  return String(
    user.teacher_id ||
      user.teacherId ||
      user.teacherID ||
      ""
  ).trim();

};


/* =====================================================
   COMPONENT
===================================================== */

export default function ExpenseEntry() {

  const [
    form,
    setForm
  ] = useState(
    initialForm
  );


  const [
    staffs,
    setStaffs
  ] = useState([]);


  const [
    branches,
    setBranches
  ] = useState([]);


  const [
    suggestions,
    setSuggestions
  ] = useState([]);


  const [
    activeField,
    setActiveField
  ] = useState("");


  const [
    message,
    setMessage
  ] = useState("");


  const [
    loadingStaffs,
    setLoadingStaffs
  ] = useState(true);


  const [
    loadingBranches,
    setLoadingBranches
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    teacherId,
    setTeacherId
  ] = useState("");


  const [
    adminId,
    setAdminId
  ] = useState("");


  const [
    userRole,
    setUserRole
  ] = useState("");


  const [
    userBranch,
    setUserBranch
  ] = useState("");

  const [
    branchScope,
    setBranchScope
  ] = useState("own");


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    const loadUser =
      async () => {

        const user =
          getLoggedInUser();


        console.log(
          "Expense Entry Logged User:",
          user
        );


        if (!user) {

          setMessage(
            "Login user information পাওয়া যায়নি। আবার login করুন।"
          );

          return;
        }


        const currentTeacherId =
          getTeacherId(
            user
          );


        const currentAdminId =
          getAdminId(
            user
          );


        const currentRole =
          String(
            user.role || ""
          )
            .trim()
            .toLowerCase();


        const savedBranch =
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


        if (savedBranch) {

          setUserBranch(
            savedBranch
          );

        }

        setBranchScope(
          user.branch_scope === "all" ? "all" : "own"
        );


        console.log(
          "Expense Teacher ID:",
          currentTeacherId
        );

        console.log(
          "Expense Admin ID:",
          currentAdminId
        );


        /*
         * Teacher ID localStorage-এ না থাকলেও
         * admin_id থাকলে backend থেকে teacher_id
         * resolve করা হবে।
         */

        if (
          currentTeacherId
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
                    teacher.teacher_id ||
                      ""
                  ).trim() ===
                  currentTeacherId
              );


            if (
              currentTeacher
            ) {

              const branch =
                String(
                  currentTeacher.branch ||
                    currentTeacher.branch_name ||
                    ""
                ).trim();


              if (branch) {

                setUserBranch(
                  branch
                );


                if (
                  !isAdminRole(
                    currentRole
                  )
                ) {

                  setForm(
                    (prev) => ({
                      ...prev,
                      branch,
                    })
                  );

                }

              }

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
     LOAD STAFFS
  ===================================================== */

  useEffect(() => {

    const fetchStaffs =
      async () => {

        try {

          setLoadingStaffs(
            true
          );


          const response =
            await fetch(
              `${API_BASE_URL}/teacher_list.php`,
              { credentials: "include" }
            );


          if (!response.ok) {

            throw new Error(
              "Teacher server error"
            );

          }


          const data =
            await response.json();


          const records =
            Array.isArray(
              data.data
            )
              ? data.data
              : Array.isArray(
                  data.teachers
                )
              ? data.teachers
              : [];


          setStaffs(
            records
          );

        } catch (error) {

          console.error(
            "Staff fetch error:",
            error
          );

          setStaffs([]);

        } finally {

          setLoadingStaffs(
            false
          );

        }

      };


    fetchStaffs();

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


          if (!response.ok) {

            throw new Error(
              "Branch server error"
            );

          }


          const data =
            await response.json();


          const records =
            Array.isArray(
              data.branch
            )
              ? data.branch
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
     STAFF ID
  ===================================================== */

  const getStaffId = (
    staff
  ) => {

    return (
      staff.teacher_id ||
      staff.staff_id ||
      staff.id ||
      ""
    );

  };


  /* =====================================================
     STAFF NAME
  ===================================================== */

  const getStaffName = (
    staff
  ) => {

    return (
      staff.nameBn ||
      staff.name_bn ||
      staff.nameEn ||
      staff.name_en ||
      staff.name ||
      staff.teacher_name_bn ||
      staff.teacher_name_en ||
      ""
    );

  };


  /* =====================================================
     SEARCH STAFF
  ===================================================== */

  const searchStaffs = (
    value
  ) => {

    const search =
      String(
        value || ""
      )
        .trim()
        .toLowerCase();


    if (!search) {

      setSuggestions([]);

      return;

    }


    const filtered =
      staffs
        .filter(
          (staff) => {

            const staffId =
              String(
                getStaffId(
                  staff
                )
              ).toLowerCase();


            const staffName =
              String(
                getStaffName(
                  staff
                )
              ).toLowerCase();


            return (
              staffId.includes(
                search
              ) ||
              staffName.includes(
                search
              )
            );

          }
        )
        .slice(
          0,
          8
        );


    setSuggestions(
      filtered
    );

  };


  /* =====================================================
     STAFF ID CHANGE
  ===================================================== */

  const handleStaffIdChange =
    (e) => {

      const value =
        e.target.value;


      setForm(
        (prev) => ({
          ...prev,
          staff_id:
            value,
        })
      );


      setActiveField(
        "staff-id"
      );


      searchStaffs(
        value
      );

    };


  /* =====================================================
     STAFF NAME CHANGE
  ===================================================== */

  const handleStaffNameChange =
    (e) => {

      const value =
        e.target.value;


      setForm(
        (prev) => ({
          ...prev,
          staff_name:
            value,
        })
      );


      setActiveField(
        "staff-name"
      );


      searchStaffs(
        value
      );

    };


  /* =====================================================
     SELECT STAFF
  ===================================================== */

  const selectStaff = (
    staff
  ) => {

    setForm(
      (prev) => ({
        ...prev,

        staff_id:
          getStaffId(
            staff
          ),

        staff_name:
          getStaffName(
            staff
          ),

        branch:
          isAdminRole(
            userRole
          )
            ? (
                staff.branch ||
                staff.branch_name ||
                prev.branch
              )
            : userBranch,
      })
    );


    setSuggestions([]);

    setActiveField("");

  };


  /* =====================================================
     BLUR
  ===================================================== */

  const handleBlur = () => {

    setTimeout(() => {

      setSuggestions([]);

      setActiveField("");

    }, 200);

  };


  /* =====================================================
     CHANGE
  ===================================================== */

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


if (
  name === "branch" &&
  !isAdminRole(userRole) &&
  branchScope !== "all"
) {
  return;
}


    if (
      name === "expense_type" &&
      value !== "Salary"
    ) {

      setForm(
        (prev) => ({
          ...prev,

          expense_type:
            value,

          staff_id:
            "",

          staff_name:
            "",

          branch:
            isAdminRole(
              userRole
            )
              ? prev.branch
              : userBranch,
        })
      );


      setSuggestions([]);

      setActiveField("");

      return;

    }


    setForm(
      (prev) => ({
        ...prev,

        [name]:
          value,
      })
    );

  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setMessage("");


      /*
       * Teacher ID না থাকলেও Admin ID থাকলে
       * backend সেটি দিয়ে teacher_id বের করবে।
       */

      if (
        !teacherId &&
        !adminId
      ) {

        setMessage(
          "Login user-এর Admin ID / Teacher ID পাওয়া যাচ্ছে না। আবার login করুন।"
        );

        return;

      }


      if (
        !isAdminRole(
          userRole
        ) &&
        !userBranch
      ) {

        setMessage(
          "আপনার branch assign করা হয়নি।"
        );

        return;

      }


      if (
        isAdminRole(
          userRole
        ) &&
        !form.branch
      ) {

        setMessage(
          "Branch নির্বাচন করুন।"
        );

        return;

      }


      if (
        form.expense_type ===
          "Salary" &&
        (
          !form.staff_id ||
          !form.staff_name
        )
      ) {

        setMessage(
          "Salary-এর জন্য Staff ID এবং Staff Name নির্বাচন করুন।"
        );

        return;

      }


      try {

        setSaving(
          true
        );


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


        console.log(
          "Expense Payload:",
          payload
        );


        const response =
          await fetch(
            `${API_BASE_URL}/add_expense.php`,
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


        console.log(
          "Expense Response:",
          text
        );


        let data;


        try {

          data =
            JSON.parse(
              text
            );

        } catch {

          setMessage(
            "Server থেকে সঠিক JSON response পাওয়া যায়নি।"
          );

          return;

        }


        if (
          data.success
        ) {

          setMessage(
            "Expense সফলভাবে যোগ হয়েছে!"
          );


          setForm({
            ...initialForm,

            expense_date:
              getToday(),

            branch:
              isAdminRole(
                userRole
              )
                ? ""
                : userBranch,

          });


          setSuggestions([]);

          setActiveField("");

        } else {

          setMessage(
            data.message ||
              "Expense যোগ করা যায়নি।"
          );

        }

      } catch (error) {

        console.error(
          "Expense submit error:",
          error
        );


        setMessage(
          "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="expense-entry">

      <div className="expense-entry-header">

        <div>

          <h1>
            Expense Entry
          </h1>

          <p>
            নতুন Expense তথ্য যোগ করুন
          </p>


          {!isAdminRole(
            userRole
          ) &&
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
        className="expense-form"
        onSubmit={
          handleSubmit
        }
      >

        <div className="expense-form-grid">


          <div className="expense-form-group">

            <label>
              Expense Date *
            </label>

            <input
              type="date"
              name="expense_date"
              value={
                form.expense_date
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          <div className="expense-form-group">

            <label>
              Expense Type *
            </label>

            <select
              name="expense_type"
              value={
                form.expense_type
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Select Expense Type
              </option>

              <option value="Salary">
                Salary
              </option>

              <option value="Office Rent">
                Office Rent
              </option>

              <option value="Electricity Bill">
                Electricity Bill
              </option>

              <option value="Internet Bill">
                Internet Bill
              </option>

              <option value="Transport">
                Transport
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Stationery">
                Stationery
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {form.expense_type ===
            "Salary" && (

            <div className="expense-form-group staff-autocomplete">

              <label>
                Staff ID
              </label>

              <input
                type="text"
                name="staff_id"
                value={
                  form.staff_id
                }
                onChange={
                  handleStaffIdChange
                }
                onFocus={() => {

                  setActiveField(
                    "staff-id"
                  );

                  searchStaffs(
                    form.staff_id
                  );

                }}
                onBlur={
                  handleBlur
                }
                placeholder="Enter Staff ID"
                autoComplete="off"
              />


              {activeField ===
                "staff-id" &&
                suggestions.length >
                  0 && (

                <div className="staff-suggestions">

                  {suggestions.map(
                    (staff) => (

                      <div
                        key={String(
                          getStaffId(
                            staff
                          )
                        )}
                        className="staff-suggestion"
                        onMouseDown={() =>
                          selectStaff(
                            staff
                          )
                        }
                      >

                        <strong>
                          {getStaffId(
                            staff
                          )}
                        </strong>

                        <span>
                          {getStaffName(
                            staff
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


              <small>
                {loadingStaffs
                  ? "Staff data loading..."
                  : "Staff ID লিখলে suggestion দেখাবে"}
              </small>

            </div>

          )}


          {form.expense_type ===
            "Salary" && (

            <div className="expense-form-group staff-autocomplete">

              <label>
                Staff Name
              </label>

              <input
                type="text"
                name="staff_name"
                value={
                  form.staff_name
                }
                onChange={
                  handleStaffNameChange
                }
                onFocus={() => {

                  setActiveField(
                    "staff-name"
                  );

                  searchStaffs(
                    form.staff_name
                  );

                }}
                onBlur={
                  handleBlur
                }
                placeholder="Enter Staff Name"
                autoComplete="off"
              />


              {activeField ===
                "staff-name" &&
                suggestions.length >
                  0 && (

                <div className="staff-suggestions">

                  {suggestions.map(
                    (staff) => (

                      <div
                        key={String(
                          getStaffId(
                            staff
                          )
                        )}
                        className="staff-suggestion"
                        onMouseDown={() =>
                          selectStaff(
                            staff
                          )
                        }
                      >

                        <strong>
                          {getStaffId(
                            staff
                          )}
                        </strong>

                        <span>
                          {getStaffName(
                            staff
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


              <small>
                {loadingStaffs
                  ? "Staff data loading..."
                  : "Staff Name লিখলে suggestion দেখাবে"}
              </small>

            </div>

          )}


          <div className="expense-form-group">

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


          <div className="expense-form-group">

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


          <div className="expense-form-group">

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
                  loadingBranches &&
                  !userBranch
                    ? "Loading..."
                    : userBranch ||
                      "Branch not assigned"
                }
                readOnly
              />

            )}

          </div>


          <div className="expense-form-group full-width">

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
              placeholder="Expense description"
            />

          </div>


          <div className="expense-form-group full-width">

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

          <div className="expense-message">
            {message}
          </div>

        )}


        <div className="expense-form-actions">

          <button
            type="submit"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Expense"}

          </button>

        </div>

      </form>

    </div>

  );

}