import "./IncomeList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IncomeList() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  const fetchIncome = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/sunshine-api/api/income_list.php"
      );

      const data = await response.json();

      if (data.success) {
        setIncome(data.data);
      } else {
        setIncome([]);
      }
    } catch (error) {
      console.error("Income fetch error:", error);
      setIncome([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  /* ================= FILTER ================= */

  const filteredIncome = income.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.income_type?.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText) ||
      item.payment_method?.toLowerCase().includes(searchText);

    const matchesBranch =
      branch === "" || item.branch === branch;

    const matchesDate =
      date === "" || item.income_date === date;

    return matchesSearch && matchesBranch && matchesDate;
  });

  /* ================= TOTAL ================= */

  const totalIncome = filteredIncome.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই Income record টি delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/income_delete.php",
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
        alert("Income সফলভাবে delete হয়েছে।");
        fetchIncome();
      } else {
        alert(data.message || "Delete করা যায়নি।");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server-এর সাথে সংযোগ করা যাচ্ছে না।");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (id) => {
    navigate(`/admin/income-edit/${id}`);
  };

  return (
    <div className="income-list">

      {/* ================= HEADER ================= */}

      <div className="income-list-header">

        <div>
          <h1>Income List</h1>
          <p>All income records</p>
        </div>

        <div className="income-total">
          <span>Total Income</span>

          <strong>
            ৳ {totalIncome.toLocaleString()}
          </strong>
        </div>

      </div>


      {/* ================= FILTERS ================= */}

      <div className="income-filters">

        <input
          type="text"
          placeholder="Search income..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="">All Branches</option>

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
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          type="button"
          className="clear-filter"
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
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Branch</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredIncome.map((item, index) => (

                <tr key={item.id}>

                  <td>{index + 1}</td>

                  <td>
                    {item.income_date}
                  </td>

                  <td>
                    <span className="income-type">
                      {item.income_type}
                    </span>
                  </td>

                  <td>
                    {item.description || "-"}
                  </td>

                  <td className="income-amount">
                    ৳ {Number(item.amount).toLocaleString()}
                  </td>

                  <td>
                    {item.payment_method || "-"}
                  </td>

                  <td>
                    {item.branch || "-"}
                  </td>

                  <td>

                    <div className="income-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(item.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}