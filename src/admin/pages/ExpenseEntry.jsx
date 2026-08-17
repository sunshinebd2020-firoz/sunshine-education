import "./ExpenseEntry.css";
import { useState } from "react";

const initialForm = {
  expense_date: new Date().toISOString().split("T")[0],
  expense_type: "",
  description: "",
  amount: "",
  payment_method: "",
  branch: "",
  note: "",
};

export default function ExpenseEntry() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/add_expense.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      console.log("Expense API Response:", data);

      if (data.success) {
        setMessage("Expense সফলভাবে যোগ হয়েছে!");

        setForm({
          ...initialForm,
          expense_date: new Date()
            .toISOString()
            .split("T")[0],
        });
      } else {
        setMessage(
          data.message || "Expense যোগ করা যায়নি"
        );
      }
    } catch (error) {
      console.error("Expense submit error:", error);

      setMessage(
        "Server-এর সাথে সংযোগ করা যাচ্ছে না"
      );
    }
  };

  return (
    <div className="expense-entry">

      {/* ================= HEADER ================= */}

      <div className="expense-entry-header">
        <div>
          <h1>Expense Entry</h1>
          <p>নতুন Expense তথ্য যোগ করুন</p>
        </div>
      </div>

      {/* ================= FORM ================= */}

      <form
        className="expense-form"
        onSubmit={handleSubmit}
      >

        <div className="expense-form-grid">

          {/* ================= DATE ================= */}

          <div className="expense-form-group">
            <label>Expense Date *</label>

            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* ================= TYPE ================= */}

          <div className="expense-form-group">
            <label>Expense Type *</label>

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

          {/* ================= AMOUNT ================= */}

          <div className="expense-form-group">
            <label>Amount *</label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* ================= PAYMENT METHOD ================= */}

          <div className="expense-form-group">
            <label>Payment Method</label>

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

          {/* ================= BRANCH ================= */}

          <div className="expense-form-group">
            <label>Branch</label>

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

          {/* ================= DESCRIPTION ================= */}

          <div className="expense-form-group expense-full-width">
            <label>Description</label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Expense description"
            />
          </div>

          {/* ================= NOTE ================= */}

          <div className="expense-form-group expense-full-width">
            <label>Note</label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Additional note"
              rows="4"
            ></textarea>
          </div>

        </div>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="expense-message">
            {message}
          </div>
        )}

        {/* ================= BUTTON ================= */}

        <div className="expense-form-actions">
          <button type="submit">
            Save Expense
          </button>
        </div>

      </form>
    </div>
  );
}