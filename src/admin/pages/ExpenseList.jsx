import "./ExpenseList.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "http://localhost/sunshine-api/api";

const getLoggedInUser = () => {
  const keys = [
    "sunshine_user",
    "admin",
    "user",
    "loggedInUser",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      const user = JSON.parse(value);

      if (user && typeof user === "object") {
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

const getCurrentYearMonth = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: String(
      now.getMonth() + 1
    ).padStart(2, "0"),
    day: String(
      now.getDate()
    ).padStart(2, "0"),
  };
};

const isAdminRole = (role) => {
  const normalizedRole = String(
    role || ""
  )
    .trim()
    .toLowerCase();

  return [
    "admin",
    "administrator",
    "super admin",
    "superadmin",
  ].includes(normalizedRole);
};

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
        "Login user information পাওয়া যায়নি।"
      );
      return;
    }

    const id = String(
      user.teacher_id ||
        user.teacherId ||
        ""
    ).trim();

    const role = String(
      user.role || ""
    )
      .trim()
      .toLowerCase();

    const branch =
      user.branch ||
      user.branch_name ||
      "";

    setTeacherId(id);
    setUserRole(role);
    setUserBranch(branch);
  }, []);


  /* =====================================================
     FETCH EXPENSE
  ===================================================== */

  const fetchExpenses =
    async () => {
      try {
        setLoading(true);
        setError("");

        if (!teacherId) {
          setExpenses([]);

          setError(
            "Teacher ID is required."
          );

          setLoading(false);
          return;
        }

        const params =
          new URLSearchParams();

        params.append(
          "teacher_id",
          teacherId
        );

        params.append(
          "role",
          userRole
        );

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

        if (selectedDay) {
          params.append(
            "date",
            `${currentDate.year}-${currentDate.month}-${selectedDay}`
          );
        }

        const url =
          `${API_BASE_URL}/expense_list.php?${params.toString()}`;

        console.log(
          "Expense List URL:",
          url
        );

        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          });

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
            "Expense List JSON Error:",
            jsonError
          );

          setExpenses([]);

          setError(
            "Expense API থেকে সঠিক JSON response পাওয়া যায়নি।"
          );

          return;
        }

        console.log(
          "Expense List Response:",
          data
        );

        if (!response.ok) {
          setExpenses([]);

          setError(
            data.message ||
              `Server Error: ${response.status}`
          );

          return;
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

        setExpenses(records);

        if (
          data.user_branch &&
          data.user_branch !==
            "ALL"
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
          "Expense server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!teacherId) return;

    fetchExpenses();
  }, [
    teacherId,
    userRole,
    selectedDay,
  ]);


  /* =====================================================
     DAYS
  ===================================================== */

  const daysInCurrentMonth =
    useMemo(() => {
      return new Date(
        currentDate.year,
        Number(currentDate.month),
        0
      ).getDate();
    }, [
      currentDate.year,
      currentDate.month,
    ]);

  const dayOptions =
    Array.from(
      {
        length:
          daysInCurrentMonth,
      },
      (_, index) =>
        String(index + 1)
          .padStart(2, "0")
    );


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredExpenses =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return expenses.filter(
        (item) => {
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
              )
          );
        }
      );
    }, [
      expenses,
      search,
    ]);


  /* =====================================================
     TOTAL
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

  const handleDelete = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "আপনি কি এই Expense record টি delete করতে চান?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/expense_delete.php`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },

            body: JSON.stringify({
              id,
              teacher_id:
                teacherId,
              role:
                userRole,
            }),
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

  const handleEdit = (
    id
  ) => {
    navigate(
      `/admin/expense-edit/${id}`
    );
  };


  /* =====================================================
     CLEAR
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setSelectedDay("");
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

          <p>
            Current Month Expense
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

        <div className="expense-current-month">
          {currentDate.year}-
          {currentDate.month}
        </div>

        <select
          value={
            selectedDay
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


      <div className="expense-table-wrapper">

        {loading ? (
          <div className="expense-loading">
            Loading...
          </div>
        ) : filteredExpenses.length ===
          0 ? (
          <div className="expense-empty">
            No expense records found.
          </div>
        ) : (
          <table className="expense-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Expense Type</th>
                <th>Staff</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Branch</th>
                <th>Action</th>
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
                      {item.expense_date ||
                        "-"}
                    </td>

                    <td>
                      <span className="expense-type">
                        {item.expense_type ||
                          "-"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {item.staff_id ||
                          "-"}
                      </strong>

                      <br />

                      <small>
                        {item.staff_name ||
                          ""}
                      </small>
                    </td>

                    <td>
                      {item.description ||
                        "-"}
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
                      {item.payment_method ||
                        "-"}
                    </td>

                    <td>
                      {item.branch ||
                        "-"}
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