import "./IncomeList.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";


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
        "Invalid user storage:",
        error
      );
    }
  }

  return null;
};


/* =====================================================
   ADMIN
===================================================== */

const isAdminRole = (role) => {

  const value =
    String(role || "")
      .trim()
      .toLowerCase();

  return [
    "admin",
    "administrator",
    "super admin",
    "superadmin",
  ].includes(value);
};


/* =====================================================
   CURRENT DATE
===================================================== */

const getCurrentDate = () => {

  const now = new Date();

  return {
    year:
      now.getFullYear(),

    month:
      String(
        now.getMonth() + 1
      ).padStart(2, "0"),
  };
};


/* =====================================================
   COMPONENT
===================================================== */

export default function IncomeList() {

  const navigate =
    useNavigate();


  const currentDate =
    getCurrentDate();


  const [income, setIncome] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedDay, setSelectedDay] =
    useState("");

  const [teacherId, setTeacherId] =
    useState("");

  const [adminId, setAdminId] =
    useState("");

  const [userRole, setUserRole] =
    useState("");

  const [userBranch, setUserBranch] =
    useState("");

  const [error, setError] =
    useState("");

  const [totalIncome, setTotalIncome] =
    useState(0);


  /* =====================================================
     ADMIN FILTERS
  ===================================================== */

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [selectedBranch, setSelectedBranch] =
    useState("");


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    const user =
      getLoggedInUser();


    if (!user) {

      setError(
        "Login user information পাওয়া যায়নি। আবার login করুন।"
      );

      setLoading(false);

      return;
    }


    const id =
      String(
        user.teacher_id ||
        user.teacherId ||
        ""
      ).trim();


    const aid =
      String(
        user.admin_id ||
        user.adminId ||
        user.user_id ||
        user.userId ||
        user.id ||
        ""
      ).trim();


    const role =
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


    setTeacherId(
      isAdminRole(role)
        ? ""
        : id
    );

    setAdminId(aid);

    setUserRole(role);

    setUserBranch(branch);


    /*
    -----------------------------------------------------
    Teacher-এর জন্য current month fixed.
    Admin-এর জন্য filter empty থাকবে,
    অর্থাৎ সব historical data।
    -----------------------------------------------------
    */

    if (!isAdminRole(role)) {

      setSelectedYear(
        String(currentDate.year)
      );

      setSelectedMonth(
        currentDate.month
      );
    }

  }, []);


  /* =====================================================
     BRANCH OPTIONS
  ===================================================== */

  const branchOptions =
    useMemo(() => {

      const branches =
        income
          .map(
            (item) =>
              String(
                item.branch || ""
              ).trim()
          )
          .filter(Boolean);

      return [
        ...new Set(branches)
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            undefined,
            {
              sensitivity: "base"
            }
          )
      );

    }, [income]);


  /* =====================================================
     YEAR OPTIONS
  ===================================================== */

  const yearOptions =
    useMemo(() => {

      const years =
        income
          .map((item) => {

            const date =
              String(
                item.income_date || ""
              );

            return date.length >= 4
              ? date.substring(0, 4)
              : "";

          })
          .filter(Boolean);


      const currentYear =
        String(
          currentDate.year
        );


      years.push(
        currentYear
      );


      return [
        ...new Set(years)
      ].sort(
        (a, b) =>
          Number(b) -
          Number(a)
      );

    }, [income]);


  /* =====================================================
     FETCH INCOME
  ===================================================== */

  const fetchIncome =
    async () => {

      try {

        setLoading(true);
        setError("");


        const admin =
          isAdminRole(userRole);


        /*
        ---------------------------------------------------
        TEACHER
        ---------------------------------------------------
        */

        if (
          !admin &&
          !teacherId
        ) {

          setIncome([]);

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

          setIncome([]);

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
          Teacher-এর জন্য backend-ও current month
          enforce করবে।
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


        const response =
          await fetch(
            `${API_BASE_URL}/income_list.php?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",

              headers: {
                Accept:
                  "application/json",
              },
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
            "Income API থেকে সঠিক JSON পাওয়া যায়নি।"
          );
        }


        if (!response.ok) {

          throw new Error(
            data.message ||
            `Server Error: ${response.status}`
          );
        }


        if (!data.success) {

          setIncome([]);

          setError(
            data.message ||
            "Income data পাওয়া যায়নি।"
          );

          return;
        }


        const records =
          Array.isArray(data.data)
            ? data.data
            : [];


        setIncome(records);


        /*
        ---------------------------------------------------
        Branch
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


        /*
        ---------------------------------------------------
        Backend total
        ---------------------------------------------------
        */

        setTotalIncome(
          Number(
            data.total_income || 0
          )
        );


      } catch (error) {

        console.error(
          "Income fetch error:",
          error
        );

        setIncome([]);

        setTotalIncome(0);

        setError(
          error.message ||
          "Income server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );

      } finally {

        setLoading(false);
      }
    };


  /* =====================================================
     LOAD
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


    fetchIncome();

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
        ).padStart(2, "0")
    );


  /* =====================================================
     FILTERED DATA
  ===================================================== */

  const filteredIncome =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase();


      return income.filter(
        (item) => {

          /*
          -------------------------------------------------
          ADMIN BRANCH FILTER
          -------------------------------------------------
          */

          if (
            isAdminRole(userRole) &&
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

          if (!text) {
            return true;
          }


          return (

            String(
              item.income_type || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.student_id || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.student_name || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.description || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.payment_method || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.branch || ""
            )
              .toLowerCase()
              .includes(text) ||

            String(
              item.entry_by_name || ""
            )
              .toLowerCase()
              .includes(text)
          );

        }
      );

    }, [
      income,
      search,
      selectedBranch,
      userRole,
    ]);


  /* =====================================================
     DISPLAY TOTAL
  ===================================================== */

  const displayTotalIncome =
    filteredIncome.reduce(
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

      if (
        !window.confirm(
          "আপনি কি এই Income record টি delete করতে চান?"
        )
      ) {
        return;
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/income_delete.php`,
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
                JSON.stringify({

                  id,

                  teacher_id:
                    teacherId,

                  admin_id:
                    adminId,

                  role:
                    userRole,
                }),
            }
          );


        const data =
          await response.json();


        if (data.success) {

          alert(
            "Income সফলভাবে delete হয়েছে।"
          );

          fetchIncome();

        } else {

          alert(
            data.message ||
            "Income delete করা যায়নি।"
          );
        }

      } catch (error) {

        console.error(
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
        `/admin/income-edit/${id}`
      );
    };


  /* =====================================================
     VOUCHER
  ===================================================== */

  const handleVoucher =
    (id) => {

      navigate(
        `/admin/income-voucher/${id}`
      );
    };


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters =
    () => {

      setSearch("");
      setSelectedDay("");
      setSelectedBranch("");

      /*
      Admin-এর ক্ষেত্রে clear করলে
      year/month empty = ALL historical data.
      */

      if (
        isAdminRole(userRole)
      ) {

        setSelectedYear("");
        setSelectedMonth("");

      } else {

        /*
        Teacher-এর current month fixed.
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

    <div className="income-list">

      <div className="income-list-header">

        <div className="income-title">

          <h1>
            Income List
          </h1>


          {isAdminRole(userRole) ? (

            <p>
              All Income Records
            </p>

          ) : (

            <p>
              Current Month Income
            </p>
          )}


          {isAdminRole(userRole) ? (

            <p>
              Branch:{" "}
              <strong>
                {selectedBranch ||
                  "All Branches"}
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
            navigate("/admin/income")
          }
        >
          + Add Income
        </button>


        <div className="income-total">

          <span>
            Total Income
          </span>

          <strong>
            ৳{" "}
            {displayTotalIncome.toLocaleString(
              "en-BD"
            )}
          </strong>

        </div>

      </div>


      {error && (

        <div className="income-message">
          {error}
        </div>

      )}


      <div className="income-filters">

        <input
          type="text"
          placeholder="Search income..."
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

        {isAdminRole(userRole) ? (

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

          <div className="income-current-month">

            {currentDate.year}-
            {currentDate.month}

          </div>
        )}


        {/* =================================================
            ADMIN MONTH
        ================================================= */}

        {isAdminRole(userRole) ? (

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

        ) : null}


        {/* =================================================
            ADMIN BRANCH
        ================================================= */}

        {isAdminRole(userRole) && (

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
          className="clear-filter"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>


      <div className="income-table-wrapper">

        {loading ? (

          <div className="income-loading">
            Loading...
          </div>

        ) : filteredIncome.length === 0 ? (

          <div className="income-empty">
            No income records found.
          </div>

        ) : (

          <table className="income-table">

            <thead>

              <tr>

                <th>#</th>

                <th>
                  Date
                </th>

                <th>
                  Income Type
                </th>

                <th>
                  Student
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
                  Entry By
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredIncome.map(
                (item, index) => (

                  <tr
                    key={
                      item.id ||
                      index
                    }
                  >

                    <td>
                      {index + 1}
                    </td>


                    <td>
                      {
                        item.income_date ||
                        "-"
                      }
                    </td>


                    <td>

                      <span className="income-type">

                        {
                          item.income_type ||
                          "-"
                        }

                      </span>

                    </td>


                    <td>

                      {item.student_id ? (

                        <>

                          <strong>
                            {
                              item.student_id
                            }
                          </strong>

                          <br />

                          <small>
                            {
                              item.student_name ||
                              ""
                            }
                          </small>

                        </>

                      ) : (

                        <span className="non-student">
                          Non-Student
                        </span>

                      )}

                    </td>


                    <td>
                      {
                        item.description ||
                        "-"
                      }
                    </td>


                    <td className="income-amount">

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

                      <small>
                        {
                          item.entry_by_name ||
                          "-"
                        }
                      </small>

                    </td>


                    <td>

                      <div className="income-actions">

                        <button
                          type="button"
                          className="voucher-btn"
                          title="Open Voucher"
                          onClick={() =>
                            handleVoucher(
                              item.id
                            )
                          }
                        >
                          🧾
                        </button>


                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit"
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
                          className="delete-btn"
                          title="Delete"
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