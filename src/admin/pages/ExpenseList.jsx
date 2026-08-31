import "./ExpenseList.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";


/* =====================================================
   GET LOGGED IN USER
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
   CURRENT DATE
===================================================== */

const getCurrentYearMonth = () => {

  const now =
    new Date();

  return {

    year:
      now.getFullYear(),

    month:
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      ),

    day:
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      ),
  };
};


/* =====================================================
   ADMIN
===================================================== */

const isAdminRole = (role) => {

  const normalizedRole =
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
    normalizedRole
  );
};


/* =====================================================
   ADMIN ID
===================================================== */

const getAdminIdFromUser = (user) => {

  if (!user) {
    return "";
  }

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

const getTeacherIdFromUser = (user) => {

  if (!user) {
    return "";
  }

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

export default function ExpenseList() {

  const navigate =
    useNavigate();


  const currentDate =
    getCurrentYearMonth();


  const [
    expenses,
    setExpenses
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    selectedDay,
    setSelectedDay
  ] = useState("");


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
    error,
    setError
  ] = useState("");


  /* =====================================================
     ADMIN FILTERS
  ===================================================== */

  const [
    selectedYear,
    setSelectedYear
  ] = useState("");


  const [
    selectedMonth,
    setSelectedMonth
  ] = useState("");


  const [
    selectedBranch,
    setSelectedBranch
  ] = useState("");


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    const user =
      getLoggedInUser();


    console.log(
      "Expense List Logged User:",
      user
    );


    if (!user) {

      setError(
        "Login user information পাওয়া যায়নি। আবার login করুন।"
      );

      setLoading(false);

      return;
    }


    const currentTeacherId =
      getTeacherIdFromUser(
        user
      );


    const currentAdminId =
      getAdminIdFromUser(
        user
      );


    const currentRole =
      String(
        user.role || ""
      )
        .trim()
        .toLowerCase();


    const branch =
      String(
        user.branch ||
        user.branch_name ||
        ""
      ).trim();


    const admin =
      isAdminRole(
        currentRole
      );


    if (admin) {

      setTeacherId("");

      /*
      Admin-এর year/month empty থাকবে।
      ফলে প্রথমবার সব historical data load হবে।
      */

    } else {

      setTeacherId(
        currentTeacherId
      );

      /*
      Teacher current month fixed.
      */

      setSelectedYear(
        String(
          currentDate.year
        )
      );

      setSelectedMonth(
        currentDate.month
      );
    }


    setAdminId(
      currentAdminId
    );

    setUserRole(
      currentRole
    );

    setUserBranch(
      branch
    );


    console.log(
      "Expense User Teacher ID:",
      admin
        ? "ADMIN - NOT USED"
        : currentTeacherId
    );

    console.log(
      "Expense User Admin ID:",
      currentAdminId
    );

    console.log(
      "Expense User Role:",
      currentRole
    );

    console.log(
      "Expense User Branch:",
      branch
    );

  }, []);


  /* =====================================================
     BRANCH OPTIONS
  ===================================================== */

  const branchOptions =
    useMemo(() => {

      const branches =
        expenses
          .map(
            (item) =>
              String(
                item.branch || ""
              ).trim()
          )
          .filter(Boolean);


      return [
        ...new Set(
          branches
        )
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            undefined,
            {
              sensitivity:
                "base"
            }
          )
      );

    }, [
      expenses
    ]);


  /* =====================================================
     YEAR OPTIONS
  ===================================================== */

  const yearOptions =
    useMemo(() => {

      const years =
        expenses
          .map(
            (item) => {

              const date =
                String(
                  item.expense_date ||
                  ""
                );

              return date.length >= 4
                ? date.substring(
                    0,
                    4
                  )
                : "";
            }
          )
          .filter(Boolean);


      years.push(
        String(
          currentDate.year
        )
      );


      return [
        ...new Set(
          years
        )
      ].sort(
        (a, b) =>
          Number(b) -
          Number(a)
      );

    }, [
      expenses,
      currentDate.year
    ]);


  /* =====================================================
     FETCH EXPENSE
  ===================================================== */

  const fetchExpenses =
    async () => {

      try {

        setLoading(true);
        setError("");


        const admin =
          isAdminRole(
            userRole
          );


        /*
        ---------------------------------------------------
        TEACHER
        ---------------------------------------------------
        */

        if (
          !admin &&
          !teacherId
        ) {

          setExpenses([]);

          setError(
            "Login user-এর Teacher ID পাওয়া যায়নি। আবার login করুন।"
          );

          setLoading(false);

          return;
        }


        /*
        ---------------------------------------------------
        ADMIN
        ---------------------------------------------------
        */

        if (
          admin &&
          !adminId
        ) {

          setExpenses([]);

          setError(
            "Admin ID পাওয়া যাচ্ছে না। আবার login করুন।"
          );

          setLoading(false);

          return;
        }


        const params =
          new URLSearchParams();


        params.append(
          "role",
          userRole
        );


        params.append(
          "admin_id",
          adminId
        );


        /*
        ---------------------------------------------------
        TEACHER ONLY
        ---------------------------------------------------
        */

        if (
          !admin &&
          teacherId
        ) {

          params.append(
            "teacher_id",
            teacherId
          );
        }


        /*
        ---------------------------------------------------
        ADMIN YEAR / MONTH
        ---------------------------------------------------
        */

        if (admin) {

          if (selectedYear) {

            params.append(
              "year",
              selectedYear
            );
          }

          if (selectedMonth) {

            params.append(
              "month",
              selectedMonth
            );
          }

        } else {

          /*
          Teacher-এর জন্য current month.
          */

          params.append(
            "year",
            String(
              currentDate.year
            )
          );

          params.append(
            "month",
            currentDate.month
          );
        }


        /*
        ---------------------------------------------------
        DAY
        ---------------------------------------------------
        */

        if (
          selectedDay &&
          selectedYear &&
          selectedMonth
        ) {

          params.append(
            "date",
            `${selectedYear}-${selectedMonth}-${selectedDay}`
          );
        }


        const url =
          `${API_BASE_URL}/expense_list.php?${params.toString()}`;


        console.log(
          "Expense List URL:",
          url
        );


        const response =
          await fetch(
            url,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );


        const text =
          await response.text();


        console.log(
          "Expense List Raw Response:",
          text
        );


        let data;


        try {

          data =
            JSON.parse(text);

        } catch (jsonError) {

          console.error(
            "Expense JSON Error:",
            jsonError
          );

          throw new Error(
            "Expense API থেকে সঠিক JSON response পাওয়া যায়নি।"
          );
        }


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server Error: ${response.status}`
          );
        }


        if (!data.success) {

          setExpenses([]);

          setError(
            data.message ||
            "Expense data পাওয়া যায়নি।"
          );

          return;
        }


        let records = [];


        if (
          Array.isArray(
            data.data
          )
        ) {

          records =
            data.data;

        } else if (
          Array.isArray(
            data.expenses
          )
        ) {

          records =
            data.expenses;

        } else if (
          Array.isArray(
            data.expense
          )
        ) {

          records =
            data.expense;
        }


        setExpenses(
          records
        );


        /*
        ---------------------------------------------------
        USER BRANCH
        ---------------------------------------------------
        */

        if (
          !admin &&
          data.user_branch &&
          data.user_branch !== "ALL"
        ) {

          setUserBranch(
            data.user_branch
          );
        }


      } catch (error) {

        console.error(
          "Expense fetch error:",
          error
        );

        setExpenses([]);

        setError(
          error.message ||
          "Expense server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );

      } finally {

        setLoading(false);
      }
    };


  /* =====================================================
     LOAD EXPENSE
  ===================================================== */

  useEffect(() => {

    if (!userRole) {
      return;
    }


    if (
      isAdminRole(userRole)
    ) {

      if (!adminId) {
        return;
      }

    } else {

      if (!teacherId) {
        return;
      }
    }


    fetchExpenses();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    teacherId,
    adminId,
    userRole,
    selectedYear,
    selectedMonth,
    selectedDay,
  ]);


  /* =====================================================
     DAYS
  ===================================================== */

  const daysInSelectedMonth =
    useMemo(() => {

      const year =
        selectedYear ||
        currentDate.year;

      const month =
        selectedMonth ||
        currentDate.month;


      return new Date(
        Number(year),
        Number(month),
        0
      ).getDate();

    }, [
      selectedYear,
      selectedMonth,
      currentDate.year,
      currentDate.month,
    ]);


  const dayOptions =
    Array.from(
      {
        length:
          daysInSelectedMonth,
      },
      (_, index) =>
        String(
          index + 1
        ).padStart(
          2,
          "0"
        )
    );


  /* =====================================================
     FILTERED EXPENSES
  ===================================================== */

  const filteredExpenses =
    useMemo(() => {

      const searchText =
        search
          .trim()
          .toLowerCase();


      return expenses.filter(
        (item) => {

          /*
          -------------------------------------------------
          ADMIN BRANCH
          -------------------------------------------------
          */

          if (
            isAdminRole(
              userRole
            ) &&
            selectedBranch
          ) {

            if (
              String(
                item.branch || ""
              ).trim() !==
              selectedBranch
            ) {

              return false;
            }
          }


          /*
          -------------------------------------------------
          SEARCH
          -------------------------------------------------
          */

          if (!searchText) {
            return true;
          }


          return (

            String(
              item.expense_type ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            String(
              item.description ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            String(
              item.payment_method ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            String(
              item.staff_id ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            String(
              item.staff_name ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            String(
              item.branch ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              )
          );

        }
      );

    }, [
      expenses,
      search,
      selectedBranch,
      userRole,
    ]);


  /* =====================================================
     TOTAL EXPENSE
  ===================================================== */

  const totalExpense =
    filteredExpenses.reduce(
      (total, item) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );


  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "আপনি কি এই Expense record টি delete করতে চান?"
        );


      if (!confirmDelete) {
        return;
      }


      try {

        const deleteData = {
          id,
          role:
            userRole,
        };


        if (
          !isAdminRole(
            userRole
          ) &&
          teacherId
        ) {

          deleteData.teacher_id =
            teacherId;
        }


        if (adminId) {

          deleteData.admin_id =
            adminId;
        }


        const response =
          await fetch(
            `${API_BASE_URL}/expense_delete.php`,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  deleteData
                ),
            }
          );


        const data =
          await response.json();


        if (data.success) {

          alert(
            "Expense সফলভাবে delete হয়েছে।"
          );

          fetchExpenses();

        } else {

          alert(
            data.message ||
            "Expense delete করা যায়নি।"
          );
        }

      } catch (error) {

        console.error(
          "Expense delete error:",
          error
        );

        alert(
          "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );
      }
    };


  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit =
    (id) => {

      navigate(
        `/admin/expense-edit/${id}`
      );
    };


  /* =====================================================
     CLEAR
  ===================================================== */

  const clearFilters =
    () => {

      setSearch("");
      setSelectedDay("");
      setSelectedBranch("");


      if (
        isAdminRole(
          userRole
        )
      ) {

        /*
        Admin:
        empty year/month =
        all historical data
        */

        setSelectedYear("");
        setSelectedMonth("");

      } else {

        /*
        Teacher:
        current month fixed
        */

        setSelectedYear(
          String(
            currentDate.year
          )
        );

        setSelectedMonth(
          currentDate.month
        );
      }
    };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="expense-list">

      <div className="expense-list-header">

        <div>

          <h1>
            Expense List
          </h1>


          {isAdminRole(
            userRole
          ) ? (

            <p>
              All Expense Records
            </p>

          ) : (

            <p>
              Current Month Expense
            </p>

          )}


          {isAdminRole(
            userRole
          ) ? (

            <p>
              Branch:{" "}
              <strong>
                {
                  selectedBranch ||
                  "All Branches"
                }
              </strong>
            </p>

          ) : (

            userBranch && (

              <p>

                Branch:{" "}

                <strong>
                  {userBranch}
                </strong>

              </p>

            )

          )}

        </div>


        <button
          type="button"
          className="admin-list-add-button"
          onClick={() =>
            navigate(
              "/admin/expense"
            )
          }
        >
          + Add Expense
        </button>


        {/* =================================================
            TOTAL
        ================================================= */}

        <div className="expense-total">

          <span>
            Total Expense
          </span>


          <strong>

            ৳{" "}

            {totalExpense.toLocaleString(
              "en-BD"
            )}

          </strong>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="expense-message"
          style={{
            marginBottom:
              "15px",
          }}
        >

          {error}

        </div>

      )}


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="expense-filters">

        <input
          type="text"
          placeholder="Search expense..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />


        {/* =================================================
            ADMIN YEAR
        ================================================= */}

        {isAdminRole(
          userRole
        ) ? (

          <select
            value={selectedYear}
            onChange={(e) => {

              setSelectedYear(
                e.target.value
              );

              setSelectedDay("");

            }}
          >

            <option value="">
              All Years
            </option>


            {yearOptions.map(
              (year) => (

                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>

              )
            )}

          </select>

        ) : (

          <div className="expense-current-month">

            {currentDate.year}-
            {currentDate.month}

          </div>

        )}


        {/* =================================================
            ADMIN MONTH
        ================================================= */}

        {isAdminRole(
          userRole
        ) && (

          <select
            value={selectedMonth}
            onChange={(e) => {

              setSelectedMonth(
                e.target.value
              );

              setSelectedDay("");

            }}
          >

            <option value="">
              All Months
            </option>

            <option value="01">
              January
            </option>

            <option value="02">
              February
            </option>

            <option value="03">
              March
            </option>

            <option value="04">
              April
            </option>

            <option value="05">
              May
            </option>

            <option value="06">
              June
            </option>

            <option value="07">
              July
            </option>

            <option value="08">
              August
            </option>

            <option value="09">
              September
            </option>

            <option value="10">
              October
            </option>

            <option value="11">
              November
            </option>

            <option value="12">
              December
            </option>

          </select>

        )}


        {/* =================================================
            ADMIN BRANCH
        ================================================= */}

        {isAdminRole(
          userRole
        ) && (

          <select
            value={selectedBranch}
            onChange={(e) =>
              setSelectedBranch(
                e.target.value
              )
            }
          >

            <option value="">
              All Branches
            </option>


            {branchOptions.map(
              (branch) => (

                <option
                  key={branch}
                  value={branch}
                >
                  {branch}
                </option>

              )
            )}

          </select>

        )}


        {/* =================================================
            DAY
        ================================================= */}

        <select
          value={selectedDay}
          disabled={
            !selectedYear ||
            !selectedMonth
          }
          onChange={(e) =>
            setSelectedDay(
              e.target.value
            )
          }
        >

          <option value="">
            All Days
          </option>


          {dayOptions.map(
            (day) => (

              <option
                key={day}
                value={day}
              >
                Day {Number(day)}
              </option>

            )
          )}

        </select>


        <button
          type="button"
          className="expense-clear-filter"
          onClick={
            clearFilters
          }
        >
          Clear
        </button>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="expense-table-wrapper">

        {loading ? (

          <div className="expense-loading">
            Loading...
          </div>

        ) : filteredExpenses.length === 0 ? (

          <div className="expense-empty">
            No expense records found.
          </div>

        ) : (

          <table className="expense-table">

            <thead>

              <tr>

                <th>#</th>

                <th>
                  Date
                </th>

                <th>
                  Expense Type
                </th>

                <th>
                  Staff
                </th>

                <th>
                  Description
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Branch
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredExpenses.map(
                (item, index) => (

                  <tr
                    key={
                      item.id ??
                      `expense-${index}`
                    }
                  >

                    <td>
                      {index + 1}
                    </td>


                    <td>
                      {
                        item.expense_date ||
                        "-"
                      }
                    </td>


                    <td>

                      <span className="expense-type">

                        {
                          item.expense_type ||
                          "-"
                        }

                      </span>

                    </td>


                    <td>

                      <strong>

                        {
                          item.staff_id ||
                          "-"
                        }

                      </strong>

                      <br />

                      <small>

                        {
                          item.staff_name ||
                          ""
                        }

                      </small>

                    </td>


                    <td>

                      {
                        item.description ||
                        "-"
                      }

                    </td>


                    <td className="expense-amount">

                      ৳{" "}

                      {Number(
                        item.amount ||
                        0
                      ).toLocaleString(
                        "en-BD"
                      )}

                    </td>


                    <td>

                      {
                        item.payment_method ||
                        "-"
                      }

                    </td>


                    <td>

                      {
                        item.branch ||
                        "-"
                      }

                    </td>


                    <td>

                      <div className="expense-actions">

                        <button
                          type="button"
                          className="expense-edit-btn"
                          onClick={() =>
                            handleEdit(
                              item.id
                            )
                          }
                        >
                          ✏️
                        </button>


                        <button
                          type="button"
                          className="expense-delete-btn"
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
} 