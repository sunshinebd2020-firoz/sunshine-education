import "./IncomeList.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "http://localhost/sunshine-api/api";


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
   DATE
===================================================== */

const getCurrentDate = () => {

  const now =
    new Date();

  return {
    year:
      now.getFullYear(),

    month:
      String(
        now.getMonth() + 1
      ).padStart(2, "0"),
  };
};


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


    setTeacherId(id);

    setAdminId(aid);

    setUserRole(role);

    setUserBranch(branch);

  }, []);


  /* =====================================================
     FETCH
  ===================================================== */

  const fetchIncome =
    async () => {

      try {

        setLoading(true);

        setError("");


        if (
          !teacherId &&
          !adminId
        ) {

          setIncome([]);

          setError(
            "Login user ID পাওয়া যাচ্ছে না। আবার login করুন।"
          );

          setLoading(false);

          return;
        }


        const params =
          new URLSearchParams();


        if (teacherId) {

          params.append(
            "teacher_id",
            teacherId
          );
        }


        if (adminId) {

          params.append(
            "admin_id",
            adminId
          );
        }


        params.append(
          "year",
          currentDate.year
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


        const response =
          await fetch(
            `${API_BASE_URL}/income_list.php?${params.toString()}`
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


        if (!data.success) {

          setIncome([]);

          setError(
            data.message ||
            "Income data পাওয়া যায়নি।"
          );

          return;
        }


        const records =
          Array.isArray(
            data.data
          )
            ? data.data
            : [];


        setIncome(
          records
        );


        setTotalIncome(
          Number(
            data.total_income || 0
          )
        );


        if (
          data.user_branch &&
          data.user_branch !== "ALL"
        ) {

          setUserBranch(
            data.user_branch
          );

        } else if (
          data.user_branch === "ALL"
        ) {

          setUserBranch("");

        }

      } catch (error) {

        console.error(
          "Income fetch error:",
          error
        );

        setIncome([]);

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

    if (
      !teacherId &&
      !adminId
    ) {
      return;
    }

    fetchIncome();

  }, [
    teacherId,
    adminId,
    selectedDay,
  ]);


  /* =====================================================
     DAYS
  ===================================================== */

  const daysInMonth =
    new Date(
      currentDate.year,
      Number(
        currentDate.month
      ),
      0
    ).getDate();


  const dayOptions =
    Array.from(
      {
        length:
          daysInMonth,
      },
      (_, index) =>
        String(
          index + 1
        ).padStart(2, "0")
    );


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredIncome =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase();


      if (!text) {
        return income;
      }


      return income.filter(
        (item) => {

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
    ]);


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
     CLEAR
  ===================================================== */

  const clearFilters =
    () => {

      setSearch("");

      setSelectedDay("");
    };


  return (

    <div className="income-list">

      <div className="income-list-header">

        <div className="income-title">

          <h1>
            Income List
          </h1>

          <p>
            Current Month Income
          </p>


          {isAdminRole(
            userRole
          ) ? (

            <p>
              Branch:{" "}
              <strong>
                All Branches
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


        <div className="income-total">

          <span>
            Total Income
          </span>

          <strong>
            ৳{" "}
            {Number(
              totalIncome
            ).toLocaleString(
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
          value={
            search
          }
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

        ) : filteredIncome.length ===
          0 ? (

          <div className="income-empty">
            No income records found.
          </div>

        ) : (

          <table className="income-table">

            <thead>

              <tr>

                <th>#</th>

                <th>Date</th>

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