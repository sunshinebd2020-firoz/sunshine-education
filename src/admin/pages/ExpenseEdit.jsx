import "./ExpenseEdit.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ExpenseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: id,
    expense_date: "",
    expense_type: "",
    description: "",
    amount: "",
    payment_method: "",
    branch: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH EXPENSE ================= */

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/expense_list.php`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (data.success) {
          const selectedExpense = data.data.find(
            (item) => String(item.id) === String(id)
          );

          if (selectedExpense) {
            setForm({
              id: selectedExpense.id,
              expense_date:
                selectedExpense.expense_date || "",
              expense_type:
                selectedExpense.expense_type || "",
              description:
                selectedExpense.description || "",
              amount:
                selectedExpense.amount || "",
              payment_method:
                selectedExpense.payment_method || "",
              branch:
                selectedExpense.branch || "",
              note:
                selectedExpense.note || "",
            });
          } else {
            setMessage(
              "Expense record পাওয়া যায়নি।"
            );
          }
        } else {
          setMessage(
            data.message ||
              "Expense load করা যায়নি।"
          );
        }
      } catch (error) {
        console.error(
          "Expense fetch error:",
          error
        );

        setMessage(
          "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/expense_update.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          "Expense সফলভাবে update হয়েছে।"
        );

        navigate("/admin/expense-list");
      } else {
        setMessage(
          data.message ||
            "Expense update করা যায়নি।"
        );
      }
    } catch (error) {
      console.error(
        "Expense update error:",
        error
      );

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="expense-edit">
        <div className="expense-edit-loading">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="expense-edit">

      {/* ================= HEADER ================= */}

      <div className="expense-edit-header">

        <div>
          <h1>Edit Expense</h1>

          <p>
            Update expense information
          </p>
        </div>

        <button
          type="button"
          className="back-expense-btn"
          onClick={() =>
            navigate("/admin/expense-list")
          }
        >
          ← Back to List
        </button>

      </div>

      {/* ================= FORM ================= */}

      <form
        className="expense-edit-form"
        onSubmit={handleSubmit}
      >

        <div className="expense-edit-grid">

          {/* DATE */}

          <div className="expense-edit-group">
            <label>
              Expense Date *
            </label>

            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* TYPE */}

          <div className="expense-edit-group">

            <label>
              Expense Type *
            </label>

            <select
              name="expense_type"
              value={form.expense_type}
              onChange={handleChange}
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

              <option value="Marketing">
                Marketing
              </option>

              <option value="Stationery">
                Stationery
              </option>

              <option value="Transport">
                Transport
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* AMOUNT */}

          <div className="expense-edit-group">

            <label>
              Amount *
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />

          </div>

          {/* PAYMENT */}

          <div className="expense-edit-group">

            <label>
              Payment Method
            </label>

            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
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

          {/* BRANCH */}

          <div className="expense-edit-group">

            <label>
              Branch
            </label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
            >

              <option value="">
                Select Branch
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

          {/* DESCRIPTION */}

          <div className="expense-edit-group expense-full-width">

            <label>
              Description
            </label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Expense description"
            />

          </div>

          {/* NOTE */}

          <div className="expense-edit-group expense-full-width">

            <label>
              Note
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="4"
              placeholder="Additional note"
            ></textarea>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="expense-edit-message">
            {message}
          </div>
        )}

        {/* ACTIONS */}

        <div className="expense-edit-actions">

          <button
            type="button"
            className="expense-cancel-btn"
            onClick={() =>
              navigate("/admin/expense-list")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="expense-update-btn"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Expense"}
          </button>

        </div>

      </form>

    </div>
  );
}