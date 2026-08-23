import { useEffect, useMemo, useState } from "react";
import "./IncomeExpenseReport.css";
import API_BASE_URL from "../../config/api";

const API_URL = `${API_BASE_URL}/income_expense_report.php`;
const DUE_API_URL = `${API_BASE_URL}/due_list.php`;


const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


const formatNumber = (number) => {
  return Number(number || 0).toLocaleString("en-US");
};


const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("sunshine_user") || "null");
  } catch {
    return null;
  }
};



function MonthlyLineChart({ items, branch, year }) {
  const values = items.flatMap((item) => [
    Number(item.income || 0),
    Number(item.expense || 0),
    Number(item.balance || 0),
  ]);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);
  const range = maxValue - minValue || 1;
  const width = 1000;
  const height = 360;
  const padding = { top: 28, right: 28, bottom: 52, left: 66 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointFor = (value, index) => {
    const x = items.length > 1
      ? padding.left + (index * plotWidth) / (items.length - 1)
      : padding.left + plotWidth / 2;
    const y = padding.top + ((maxValue - Number(value || 0)) / range) * plotHeight;
    return [x, y];
  };
  const pointString = (field) => items.map((item, index) => pointFor(item[field], index).join(",")).join(" ");
  const series = [
    { field: "income", className: "line-income", label: "Income" },
    { field: "expense", className: "line-expense", label: "Expense" },
    { field: "balance", className: "line-balance", label: "Net Balance" },
  ];

  return (
    <section className="report-section">
      <div className="section-title">
        <div>
          <h2>Monthly Income, Expense & Net Balance</h2>
          <p>{branch === "all" ? "All branches" : branch + " branch"} · {year === "all" ? "All Years" : "Year " + year}</p>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="monthly-line-chart-wrap">
          <svg className="monthly-line-chart" viewBox={"0 0 " + width + " " + height} role="img" aria-label="Monthly income, expense and net balance line chart">
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = padding.top + step * plotHeight;
              const value = maxValue - step * range;
              return <g key={step}><line className="line-chart-grid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} /><text className="line-chart-value" x="4" y={y + 4}>Tk {formatAmount(value)}</text></g>;
            })}
            {minValue < 0 && <line className="line-chart-zero" x1={padding.left} x2={width - padding.right} y1={padding.top + ((maxValue / range) * plotHeight)} y2={padding.top + ((maxValue / range) * plotHeight)} />}
            {series.map((line) => <polyline key={line.field} className={"line-series " + line.className} points={pointString(line.field)} />)}
            {items.map((item, index) => (
              <g key={item.month}>
                {series.map((line) => {
                  const [x, y] = pointFor(item[line.field], index);
                  return <circle key={line.field} className={"line-point " + line.className + "-point"} cx={x} cy={y} r="4"><title>{item.month_name + " " + line.label + ": Tk " + formatAmount(item[line.field])}</title></circle>;
                })}
                <text className="line-chart-month" x={pointFor(0, index)[0]} y={height - 16}>{item.month_name.substring(0, 3)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : <div className="empty-report">No monthly data found.</div>}
      <div className="chart-legend line-chart-legend">
        <span><i className="legend-income"></i>Income</span>
        <span><i className="legend-expense"></i>Expense</span>
        <span><i className="legend-balance"></i>Net Balance</span>
      </div>
    </section>
  );
}

export default function IncomeExpenseReport() {

  const currentYear =
    new Date().getFullYear().toString();


  const [year, setYear] =
    useState(currentYear);

  const [month, setMonth] =
    useState("all");

  const [branch, setBranch] =
    useState("all");


  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD REPORT
  |--------------------------------------------------------------------------
  */

  const loadReport = async () => {

    try {

      setLoading(true);
      setError("");


      const params =
        new URLSearchParams();

      params.append("year", year);
      params.append("month", month);
      params.append("branch", branch);


      const user = getCurrentUser();
      const dueParams = new URLSearchParams();
      const role = String(user?.role || "admin").trim().toLowerCase();
      dueParams.append("role", role);
      if (user?.teacher_id || user?.teacherId) dueParams.append("teacher_id", user.teacher_id || user.teacherId);
      if (branch !== "all") dueParams.append("branch", branch);
      const [response, dueResponse] = await Promise.all([
        fetch(`${API_URL}?${params.toString()}`, { credentials: "include" }),
        fetch(`${DUE_API_URL}?${dueParams.toString()}`, { credentials: "include" }).catch(() => null),
      ]);


      if (!response.ok) {
        throw new Error(
          "Server error"
        );
      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
            "Report loading failed."
        );
      }


      let dueAmount = Number(data?.summary?.total_due || 0);
      if (dueResponse?.ok) {
        try {
          const dueData = await dueResponse.json();
          if (dueData?.success) dueAmount = Number(dueData.total_due || 0);
        } catch { /* Keep the report available if this secondary request fails. */ }
      }
      setReport({ ...data, summary: { ...data.summary, total_due: dueAmount } });

    } catch (err) {

      console.error(
        "Income Expense Report Error:",
        err
      );

      setError(
        err.message ||
          "Server connection failed."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOAD WHEN FILTER CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, branch]);


  /*
  |--------------------------------------------------------------------------
  | MONTH NAMES
  |--------------------------------------------------------------------------
  */

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


  /*
  |--------------------------------------------------------------------------
  | MAX MONTHLY VALUE
  |--------------------------------------------------------------------------
  */

  const maxMonthlyValue =
    useMemo(() => {

      if (
        !report ||
        !Array.isArray(report.monthly)
      ) {
        return 1;
      }


      const values =
        report.monthly.flatMap(
          (item) => [
            Number(item.income || 0),
            Number(item.expense || 0),
          ]
        );


      return Math.max(
        ...values,
        1
      );

    }, [report]);


  /*
  |--------------------------------------------------------------------------
  | MAX BRANCH VALUE
  |--------------------------------------------------------------------------
  */

  const maxBranchValue =
    useMemo(() => {

      if (
        !report ||
        !Array.isArray(report.branches)
      ) {
        return 1;
      }


      const values =
        report.branches.flatMap(
          (item) => [
            Number(item.income || 0),
            Number(item.expense || 0),
          ]
        );


      return Math.max(
        ...values,
        1
      );

    }, [report]);


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading && !report) {

    return (
      <div className="income-report-page">

        <div className="report-loading">

          <div className="loading-spinner"></div>

          <p>
            Income & Expense Report loading...
          </p>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error && !report) {

    return (
      <div className="income-report-page">

        <div className="report-error">

          <h2>
            ⚠️ Report Loading Failed
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={loadReport}
          >
            🔄 Try Again
          </button>

        </div>

      </div>
    );
  }


  const summary =
    report?.summary || {};


  return (

    <div className="income-report-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="report-header">

        <div>

          <h1>
            📊 Income & Expense Analysis
          </h1>

          <p>
            আয় ও ব্যয়ের বিস্তারিত বিশ্লেষণ
          </p>

        </div>


        <button
          type="button"
          className="report-refresh"
          onClick={loadReport}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="report-filters">

        <div className="filter-item">

          <label>
            Year
          </label>

          <select
            value={year}
            onChange={(e) =>
              setYear(e.target.value)
            }
          >

            <option value="all">
              All Years
            </option>

            {(
              report?.options?.years || []
            ).map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>


        <div className="filter-item">

          <label>
            Month
          </label>

          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          >

            <option value="all">
              All Months
            </option>

            {months.map(
              (monthName, index) => (

                <option
                  key={index}
                  value={index + 1}
                >
                  {monthName}
                </option>

              )
            )}

          </select>

        </div>


        <div className="filter-item">

          <label>
            Branch
          </label>

          <select
            value={branch}
            onChange={(e) =>
              setBranch(e.target.value)
            }
          >

            <option value="all">
              All Branches
            </option>

            {(
              report?.options?.branches || []
            ).map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>


        <div className="filter-status">

          {loading
            ? "Updating..."
            : "✓ Report Updated"}

        </div>

      </div>


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (

        <div className="report-inline-error">
          {error}
        </div>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="report-summary-grid">


        <div className="summary-card income-card">

          <div className="summary-icon">
            💰
          </div>

          <div>

            <span>
              Total Income
            </span>

            <strong>
              ৳ {formatAmount(
                summary.total_income
              )}
            </strong>

            <small>
              {formatNumber(
                summary.income_transactions
              )} transactions
            </small>

          </div>

        </div>


        <div className="summary-card expense-card">

          <div className="summary-icon">
            💸
          </div>

          <div>

            <span>
              Total Expense
            </span>

            <strong>
              ৳ {formatAmount(
                summary.total_expense
              )}
            </strong>

            <small>
              {formatNumber(
                summary.expense_transactions
              )} transactions
            </small>

          </div>

        </div>


        <div
          className={`summary-card ${
            Number(summary.net_balance || 0) >= 0
              ? "balance-positive"
              : "balance-negative"
          }`}
        >

          <div className="summary-icon">
            📈
          </div>

          <div>

            <span>
              Net Balance
            </span>

            <strong>
              ৳ {formatAmount(
                summary.net_balance
              )}
            </strong>

            <small>
              Income − Expense
            </small>

          </div>

        </div>


        <div className="summary-card transaction-card">

          <div className="summary-icon">
            🧾
          </div>

          <div>

            <span>
              Total Transactions
            </span>

            <strong>
              {formatNumber(
                Number(
                  summary.income_transactions || 0
                ) +
                Number(
                  summary.expense_transactions || 0
                )
              )}
            </strong>

            <small>
              Income + Expense
            </small>

          </div>

        </div>




        <div className="summary-card due-card">
          <div className="summary-icon">⏳</div>
          <div>
            <span>Due Amount</span>
            <strong>৳ {formatAmount(summary.total_due)}</strong>
            <small>Outstanding student fees</small>
          </div>
        </div>
      </section>


      {/* =====================================================
          MONTHLY CHART
      ===================================================== */}

      <section className="report-section">

        <div className="section-title">

          <div>

            <h2>
              📈 Monthly Income vs Expense
            </h2>

            <p>
              {year === "all"
                ? "All Years"
                : `Year ${year}`}
            </p>

          </div>

        </div>


        <div className="monthly-chart">

          {(
            report?.monthly || []
          ).map((item) => {

            const income =
              Number(item.income || 0);

            const expense =
              Number(item.expense || 0);


            const incomeHeight =
              Math.max(
                (income / maxMonthlyValue) * 100,
                income > 0 ? 3 : 0
              );

            const expenseHeight =
              Math.max(
                (expense / maxMonthlyValue) * 100,
                expense > 0 ? 3 : 0
              );


            return (

              <div
                className="month-column"
                key={item.month}
              >

                <div className="chart-bars">

                  <div
                    className="chart-bar income-bar"
                    style={{
                      height: `${incomeHeight}%`,
                    }}
                    title={`Income: ৳ ${formatAmount(income)}`}
                  >
                    {income > 0 && (
                      <span>
                        {formatAmount(income)}
                      </span>
                    )}
                  </div>


                  <div
                    className="chart-bar expense-bar"
                    style={{
                      height: `${expenseHeight}%`,
                    }}
                    title={`Expense: ৳ ${formatAmount(expense)}`}
                  >
                    {expense > 0 && (
                      <span>
                        {formatAmount(expense)}
                      </span>
                    )}
                  </div>

                </div>


                <div className="month-name">
                  {item.month_name.substring(
                    0,
                    3
                  )}
                </div>

              </div>

            );

          })}

        </div>


        <div className="chart-legend">

          <span>
            <i className="legend-income"></i>
            Income
          </span>

          <span>
            <i className="legend-expense"></i>
            Expense
          </span>

        </div>

      </section>




      <MonthlyLineChart
        items={report?.monthly || []}
        branch={branch}
        year={year}
      />

      {/* =====================================================
          BRANCH ANALYSIS
      ===================================================== */}

      <section className="report-section">

        <div className="section-title">

          <div>

            <h2>
              🏢 Branch-wise Analysis
            </h2>

            <p>
              Branch অনুযায়ী Income ও Expense
            </p>

          </div>

        </div>


        {report?.branches?.length > 0 ? (

          <div className="branch-chart">

            {report.branches.map(
              (item) => {

                const income =
                  Number(item.income || 0);

                const expense =
                  Number(item.expense || 0);


                const incomeWidth =
                  (income / maxBranchValue) * 100;

                const expenseWidth =
                  (expense / maxBranchValue) * 100;


                return (

                  <div
                    className="branch-row"
                    key={item.branch}
                  >

                    <div className="branch-name">
                      {item.branch}
                    </div>


                    <div className="branch-bars">

                      <div className="branch-bar-line">

                        <div
                          className="branch-income-bar"
                          style={{
                            width: `${incomeWidth}%`,
                          }}
                        ></div>

                        <span>
                          ৳ {formatAmount(income)}
                        </span>

                      </div>


                      <div className="branch-bar-line">

                        <div
                          className="branch-expense-bar"
                          style={{
                            width: `${expenseWidth}%`,
                          }}
                        ></div>

                        <span>
                          ৳ {formatAmount(expense)}
                        </span>

                      </div>

                    </div>


                    <div
                      className={`branch-balance ${
                        Number(item.balance) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      ৳ {formatAmount(
                        item.balance
                      )}
                    </div>

                  </div>

                );

              }
            )}

          </div>

        ) : (

          <div className="empty-report">
            কোনো branch data পাওয়া যায়নি।
          </div>

        )}


        <div className="branch-legend">

          <span>
            <i className="legend-income"></i>
            Income
          </span>

          <span>
            <i className="legend-expense"></i>
            Expense
          </span>

          <span>
            Balance = Income − Expense
          </span>

        </div>

      </section>


      {/* =====================================================
          TYPE ANALYSIS
      ===================================================== */}

      <div className="analysis-two-column">


        {/* ================= INCOME TYPES ================= */}

        <section className="report-section type-section">

          <div className="section-title">

            <div>

              <h2>
                💰 Income Type Analysis
              </h2>

            </div>

          </div>


          {report?.income_types?.length > 0 ? (

            <div className="type-list">

              {report.income_types.map(
                (item, index) => {

                  const percentage =
                    summary.total_income > 0
                      ? (
                          Number(item.total) /
                          Number(summary.total_income)
                        ) * 100
                      : 0;


                  return (

                    <div
                      className="type-item"
                      key={`${item.type}-${index}`}
                    >

                      <div className="type-top">

                        <strong>
                          {item.type || "Unknown"}
                        </strong>

                        <span>
                          ৳ {formatAmount(
                            item.total
                          )}
                        </span>

                      </div>


                      <div className="type-progress">

                        <div
                          className="type-progress-fill income-progress"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>

                      </div>


                      <div className="type-bottom">

                        <span>
                          {percentage.toFixed(1)}%
                        </span>

                        <span>
                          {formatNumber(
                            item.transactions
                          )} transactions
                        </span>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          ) : (

            <div className="empty-report">
              কোনো income data পাওয়া যায়নি।
            </div>

          )}

        </section>


        {/* ================= EXPENSE TYPES ================= */}

        <section className="report-section type-section">

          <div className="section-title">

            <div>

              <h2>
                💸 Expense Type Analysis
              </h2>

            </div>

          </div>


          {report?.expense_types?.length > 0 ? (

            <div className="type-list">

              {report.expense_types.map(
                (item, index) => {

                  const percentage =
                    summary.total_expense > 0
                      ? (
                          Number(item.total) /
                          Number(summary.total_expense)
                        ) * 100
                      : 0;


                  return (

                    <div
                      className="type-item"
                      key={`${item.type}-${index}`}
                    >

                      <div className="type-top">

                        <strong>
                          {item.type || "Unknown"}
                        </strong>

                        <span>
                          ৳ {formatAmount(
                            item.total
                          )}
                        </span>

                      </div>


                      <div className="type-progress">

                        <div
                          className="type-progress-fill expense-progress"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>

                      </div>


                      <div className="type-bottom">

                        <span>
                          {percentage.toFixed(1)}%
                        </span>

                        <span>
                          {formatNumber(
                            item.transactions
                          )} transactions
                        </span>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          ) : (

            <div className="empty-report">
              কোনো expense data পাওয়া যায়নি।
            </div>

          )}

        </section>

      </div>


      {/* =====================================================
          MONTHLY TABLE
      ===================================================== */}

      <section className="report-section">

        <div className="section-title">

          <div>

            <h2>
              📋 Monthly Summary
            </h2>

            <p>
              মাসভিত্তিক আয়, ব্যয় ও balance
            </p>

          </div>

        </div>


        <div className="report-table-container">

          <table className="report-table">

            <thead>

              <tr>

                <th>
                  Month
                </th>

                <th>
                  Income
                </th>

                <th>
                  Expense
                </th>

                <th>
                  Net Balance
                </th>

              </tr>

            </thead>


            <tbody>

              {(
                report?.monthly || []
              ).map((item) => (

                <tr
                  key={item.month}
                >

                  <td>
                    <strong>
                      {item.month_name}
                    </strong>
                  </td>

                  <td className="income-text">
                    ৳ {formatAmount(
                      item.income
                    )}
                  </td>

                  <td className="expense-text">
                    ৳ {formatAmount(
                      item.expense
                    )}
                  </td>

                  <td
                    className={
                      Number(item.balance) >= 0
                        ? "balance-text-positive"
                        : "balance-text-negative"
                    }
                  >
                    ৳ {formatAmount(
                      item.balance
                    )}
                  </td>

                </tr>

              ))}


              {/* ================= GRAND TOTAL ================= */}

              <tr className="grand-total-row">

                <td>
                  GRAND TOTAL
                </td>

                <td>
                  ৳ {formatAmount(
                    summary.total_income
                  )}
                </td>

                <td>
                  ৳ {formatAmount(
                    summary.total_expense
                  )}
                </td>

                <td>
                  ৳ {formatAmount(
                    summary.net_balance
                  )}
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>


    </div>
  );
}