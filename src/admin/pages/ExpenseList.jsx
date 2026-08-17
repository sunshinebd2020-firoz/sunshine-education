import "./ExpenseList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD EXPENSES ================= */

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/sunshine-api/api/expense_list.php"
      );

      const data = await response.json();

      console.log("Expense API Response:", data);

      if (data.success) {
        setExpenses(data.data || []);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Expense fetch error:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /* ================= FILTER ================= */

  const filteredExpenses = expenses.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(item.expense_type || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.description || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.payment_method || "")
        .toLowerCase()
        .includes(searchText);

    const matchesBranch =
      branch === "" || item.branch === branch;

    const matchesDate =
      date === "" || item.expense_date === date;

    return (
      matchesSearch &&
      matchesBranch &&
      matchesDate
    );
  });

  /* ================= TOTAL ================= */

  const totalExpense = filteredExpenses.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই Expense record টি delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/expense_delete.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Expense সফলভাবে delete হয়েছে।");

        fetchExpenses();
      } else {
        alert(
          data.message ||
            "Expense delete করা যায়নি।"
        );
      }
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
      );
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (id) => {
    navigate(`/admin/expense-edit/${id}`);
  };

  return (
    <div className="expense-list">

      {/* ================= HEADER ================= */}

      <div className="expense-list-header">

        <div>
          <h1>Expense List</h1>

          <p>
            All expense records
          </p>
        </div>

        <div className="expense-total">

          <span>
            Total Expense
          </span>

          <strong>
            ৳ {totalExpense.toLocaleString()}
          </strong>

        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="expense-filters">

        <input
          type="text"
          placeholder="Search expense..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

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

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

        <button
          type="button"
          className="expense-clear-filter"
          onClick={() => {
            setSearch("");
            setBranch("");
            setDate("");
          }}
        >
          Clear
        </button>

      </div>

      {/* ================= TABLE ================= */}

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

                <th>Date</th>

                <th>Expense Type</th>

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

                  <tr key={item.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {item.expense_date}
                    </td>

                    <td>

                      <span className="expense-type">
                        {item.expense_type}
                      </span>

                    </td>

                    <td>
                      {item.description || "-"}
                    </td>

                    <td className="expense-amount">
                      ৳{" "}
                      {Number(
                        item.amount || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      {item.payment_method ||
                        "-"}
                    </td>

                    <td>
                      {item.branch || "-"}
                    </td>

                    <td>

                      <div className="expense-actions">

                        <button
                          type="button"
                          className="expense-edit-btn"
                          onClick={() =>
                            handleEdit(item.id)
                          }
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="expense-delete-btn"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          title="Delete"
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