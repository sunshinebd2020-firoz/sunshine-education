import "./IncomeList.css";
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

export default function IncomeList() {
  const navigate = useNavigate();

  const currentDate =
    getCurrentYearMonth();

  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] =
    useState("");

  const [teacherId, setTeacherId] =
    useState("");

  const [userRole, setUserRole] =
    useState("");

  const [userBranch, setUserBranch] =
    useState("");

  const [error, setError] = useState("");

  /* =====================================================
     LOAD LOGGED USER
  ===================================================== */

  useEffect(() => {
    const user = getLoggedInUser();

    console.log(
      "Income List Logged User:",
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
     FETCH INCOME
  ===================================================== */

  const fetchIncome = async () => {
    try {
      setLoading(true);
      setError("");

      if (!teacherId) {
        setIncome([]);

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
        `${API_BASE_URL}/income_list.php?${params.toString()}`;

      console.log(
        "Income List URL:",
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
        "Income List Raw Response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error(
          "Income List JSON Error:",
          jsonError
        );

        setIncome([]);

        setError(
          "Income API থেকে সঠিক JSON response পাওয়া যায়নি।"
        );

        return;
      }

      console.log(
        "Income List Response:",
        data
      );

      if (!response.ok) {
        setIncome([]);

        setError(
          data.message ||
            `Server Error: ${response.status}`
        );

        return;
      }

      if (!data.success) {
        setIncome([]);

        setError(
          data.message ||
            "Income data পাওয়া যায়নি।"
        );

        return;
      }

      let records = [];

      if (Array.isArray(data.data)) {
        records = data.data;
      } else if (
        Array.isArray(data.income)
      ) {
        records = data.income;
      } else if (
        Array.isArray(data.incomes)
      ) {
        records = data.incomes;
      }

      setIncome(records);

      if (
        data.user_branch &&
        data.user_branch !== "ALL"
      ) {
        setUserBranch(
          data.user_branch
        );
      }
    } catch (error) {
      console.error(
        "Income fetch error:",
        error
      );

      setIncome([]);

      setError(
        "Income server-এর সাথে সংযোগ করা যাচ্ছে না।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teacherId) return;

    fetchIncome();
  }, [
    teacherId,
    userRole,
    selectedDay,
  ]);

  /* =====================================================
     CURRENT MONTH DAYS
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
        String(index + 1).padStart(
          2,
          "0"
        )
    );

  /* =====================================================
     SEARCH FILTER
  ===================================================== */

  const filteredIncome =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return income.filter(
        (item) => {
          if (!searchText) {
            return true;
          }

          return (
            String(
              item.income_type || ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              item.description || ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              item.payment_method || ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              item.student_id || ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              item.student_name || ""
            )
              .toLowerCase()
              .includes(searchText)
          );
        }
      );
    }, [income, search]);

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalIncome =
    filteredIncome.reduce(
      (total, item) =>
        total +
        Number(item.amount || 0),
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
        "আপনি কি এই Income record টি delete করতে চান?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/income_delete.php`,
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
        "Income delete error:",
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

  const handleEdit = (id) => {
    navigate(
      `/admin/income-edit/${id}`
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
    <div className="income-list">

      <div className="income-list-header">

        <div>
          <h1>
            Income List
          </h1>

          <p>
            Current Month Income
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

        <div className="income-total">

          <span>
            Total Income
          </span>

          <strong>
            ৳{" "}
            {totalIncome.toLocaleString(
              "en-BD"
            )}
          </strong>

        </div>
      </div>

      {error && (
        <div
          className="income-message"
          style={{
            marginBottom: "15px",
          }}
        >
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

        <div className="income-current-month">
          {currentDate.year}-
          {currentDate.month}
        </div>

        <select
          value={selectedDay}
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
          onClick={
            clearFilters
          }
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
                <th>Date</th>
                <th>Income Type</th>
                <th>Student</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Branch</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredIncome.map(
                (item, index) => (
                  <tr
                    key={
                      item.id ??
                      `income-${index}`
                    }
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {item.income_date ||
                        "-"}
                    </td>

                    <td>
                      <span className="income-type">
                        {item.income_type ||
                          "-"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {item.student_id ||
                          "-"}
                      </strong>

                      <br />

                      <small>
                        {item.student_name ||
                          ""}
                      </small>
                    </td>

                    <td>
                      {item.description ||
                        "-"}
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
                      {item.payment_method ||
                        "-"}
                    </td>

                    <td>
                      {item.branch ||
                        "-"}
                    </td>

                    <td>
                      <div className="income-actions">

                        <button
                          type="button"
                          className="edit-btn"
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