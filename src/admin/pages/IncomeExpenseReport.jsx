import "./IncomeExpenseReport.css";
import { useEffect, useState } from "react";

export default function IncomeExpenseReport() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [branch, setBranch] = useState("");
  const [search, setSearch] = useState("");

  /* =====================================================
     CURRENT MONTH
  ===================================================== */

  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const currentMonthName = today.toLocaleString("en-US", {
    month: "long",
  });

  /* =====================================================
     LOAD REPORT DATA
  ===================================================== */

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost/sunshine-api/api/income_expense_report.php"
      );

      const data = await response.json();

      console.log("Report API Response:", data);

      if (data.success) {
        setIncome(data.income || []);
        setExpenses(data.expenses || []);
      } else {
        setError(
          data.message || "Report data পাওয়া যায়নি।"
        );
      }
    } catch (error) {
      console.error("Report fetch error:", error);

      setError(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  /* =====================================================
     CURRENT MONTH FILTER
  ===================================================== */

  const isCurrentMonth = (date) => {
    if (!date) return false;

    const parts = date.split("-");

    if (parts.length !== 3) return false;

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    return (
      year === currentYear &&
      month === currentMonth
    );
  };

  /* =====================================================
     FILTER INCOME
  ===================================================== */

  const filteredIncome = income.filter((item) => {
    const matchesDate = isCurrentMonth(
      item.income_date
    );

    const matchesBranch =
      branch === "" ||
      String(item.branch || "") === branch;

    const searchText = search
      .trim()
      .toLowerCase();

    const matchesSearch =
      searchText === "" ||
      String(item.income_type || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.description || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.payment_method || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.branch || "")
        .toLowerCase()
        .includes(searchText);

    return (
      matchesDate &&
      matchesBranch &&
      matchesSearch
    );
  });

  /* =====================================================
     FILTER EXPENSE
  ===================================================== */

  const filteredExpenses = expenses.filter(
    (item) => {
      const matchesDate = isCurrentMonth(
        item.expense_date
      );

      const matchesBranch =
        branch === "" ||
        String(item.branch || "") === branch;

      const searchText = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        searchText === "" ||
        String(item.expense_type || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.description || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.payment_method || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.branch || "")
          .toLowerCase()
          .includes(searchText);

      return (
        matchesDate &&
        matchesBranch &&
        matchesSearch
      );
    }
  );

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalIncome = filteredIncome.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const totalExpense = filteredExpenses.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const netBalance =
    totalIncome - totalExpense;

  /* =====================================================
     CLEAR FILTER
  ===================================================== */

  const clearFilters = () => {
    setBranch("");
    setSearch("");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="income-expense-report">
        <div className="report-loading">
          Report loading হচ্ছে...
        </div>
      </div>
    );
  }

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="income-expense-report">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-header">

        <div>
          <h1>
            Income & Expense Report
          </h1>

          <p>
            প্রতিষ্ঠানের আয় ও ব্যয়ের বিস্তারিত হিসাব
          </p>

          <div className="current-month">
            Current Month:{" "}
            <strong>
              {currentMonthName} {currentYear}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="report-refresh-btn"
          onClick={fetchReportData}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="report-filters">

        <div className="report-filter-group">

          <label>Branch</label>

          <select
            value={branch}
            onChange={(e) =>
              setBranch(e.target.value)
            }
          >

            <option value="">
              All Branches
            </option>

            <option value="Rajshahi Main Branch">
              Rajshahi Main Branch
            </option>

            <option value="Ramchandrapur Branch">
              Ramchandrapur Branch
            </option>

            <option value="Khulna Branch">
              Khulna Branch
            </option>

            <option value="Tangail Branch">
              Tangail Branch
            </option>

          </select>

        </div>

        <div className="report-filter-group search-group">

          <label>Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search income / expense..."
          />

        </div>

        <button
          type="button"
          className="report-clear-btn"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="report-summary">

        <div className="summary-card income-card">

          <div className="summary-icon">
            ↑
          </div>

          <div>
            <span>Total Income</span>

            <strong>
              ৳ {totalIncome.toLocaleString()}
            </strong>
          </div>

        </div>

        <div className="summary-card expense-card">

          <div className="summary-icon">
            ↓
          </div>

          <div>
            <span>Total Expense</span>

            <strong>
              ৳ {totalExpense.toLocaleString()}
            </strong>
          </div>

        </div>

        <div
          className={`summary-card ${
            netBalance >= 0
              ? "balance-positive"
              : "balance-negative"
          }`}
        >

          <div className="summary-icon">
            ৳
          </div>

          <div>
            <span>Net Balance</span>

            <strong>
              ৳ {netBalance.toLocaleString()}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          REPORT INFO
      ================================================= */}

      <div className="report-info">

        <span>
          Income Records:{" "}
          <strong>
            {filteredIncome.length}
          </strong>
        </span>

        <span>
          Expense Records:{" "}
          <strong>
            {filteredExpenses.length}
          </strong>
        </span>

      </div>

      {/* =================================================
          INCOME SECTION
      ================================================= */}

      <section className="report-section">

        <div className="report-section-header income-section-header">

          <div>

            <h2>
              Income Details
            </h2>

            <p>
              {currentMonthName} {currentYear} income records
            </p>

          </div>

          <strong>
            ৳ {totalIncome.toLocaleString()}
          </strong>

        </div>

        <div className="report-table-wrapper">

          {filteredIncome.length === 0 ? (

            <div className="report-empty">
              এই মাসে কোনো Income record পাওয়া যায়নি।
            </div>

          ) : (

            <table className="report-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Income Type</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th>Branch</th>
                  <th>Amount</th>
                </tr>

              </thead>

              <tbody>

                {filteredIncome.map(
                  (item, index) => (

                    <tr key={item.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {formatDate(
                          item.income_date
                        )}
                      </td>

                      <td>
                        <span className="income-badge">
                          {item.income_type || "-"}
                        </span>
                      </td>

                      <td>
                        {item.description || "-"}
                      </td>

                      <td>
                        {item.payment_method || "-"}
                      </td>

                      <td>
                        {item.branch || "-"}
                      </td>

                      <td className="income-amount">
                        ৳{" "}
                        {Number(
                          item.amount || 0
                        ).toLocaleString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </section>

      {/* =================================================
          EXPENSE SECTION
      ================================================= */}

      <section className="report-section">

        <div className="report-section-header expense-section-header">

          <div>

            <h2>
              Expense Details
            </h2>

            <p>
              {currentMonthName} {currentYear} expense records
            </p>

          </div>

          <strong>
            ৳ {totalExpense.toLocaleString()}
          </strong>

        </div>

        <div className="report-table-wrapper">

          {filteredExpenses.length === 0 ? (

            <div className="report-empty">
              এই মাসে কোনো Expense record পাওয়া যায়নি।
            </div>

          ) : (

            <table className="report-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Expense Type</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th>Branch</th>
                  <th>Amount</th>
                </tr>

              </thead>

              <tbody>

                {filteredExpenses.map(
                  (item, index) => (

                    <tr key={item.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {formatDate(
                          item.expense_date
                        )}
                      </td>

                      <td>
                        <span className="expense-badge">
                          {item.expense_type || "-"}
                        </span>
                      </td>

                      <td>
                        {item.description || "-"}
                      </td>

                      <td>
                        {item.payment_method || "-"}
                      </td>

                      <td>
                        {item.branch || "-"}
                      </td>

                      <td className="expense-amount">
                        ৳{" "}
                        {Number(
                          item.amount || 0
                        ).toLocaleString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </section>

    </div>
  );
}