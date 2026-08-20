import "./IncomeEdit.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function IncomeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: id,
    income_date: "",
    income_type: "",
    description: "",
    amount: "",
    payment_method: "",
    branch: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH SINGLE INCOME ================= */

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/income_list.php`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (data.success) {
          const selectedIncome = data.data.find(
            (item) => String(item.id) === String(id)
          );

          if (selectedIncome) {
            setForm({
              id: selectedIncome.id,
              income_date: selectedIncome.income_date || "",
              income_type: selectedIncome.income_type || "",
              description: selectedIncome.description || "",
              amount: selectedIncome.amount || "",
              payment_method: selectedIncome.payment_method || "",
              branch: selectedIncome.branch || "",
              note: selectedIncome.note || "",
            });
          } else {
            setMessage("Income record পাওয়া যায়নি।");
          }
        }
      } catch (error) {
        console.error(error);
        setMessage("Server-এর সাথে সংযোগ করা যাচ্ছে না।");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [id]);

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/income_update.php`,
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
        alert("Income সফলভাবে update হয়েছে।");

        navigate("/admin/income-list");
      } else {
        setMessage(data.message || "Income update করা যায়নি।");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server-এর সাথে সংযোগ করা যাচ্ছে না।");
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="income-edit">
        <div className="income-edit-loading">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="income-edit">

      {/* ================= HEADER ================= */}

      <div className="income-edit-header">

        <div>
          <h1>Edit Income</h1>
          <p>Update income information</p>
        </div>

        <button
          type="button"
          className="back-income-btn"
          onClick={() => navigate("/admin/income-list")}
        >
          ← Back to List
        </button>

      </div>


      {/* ================= FORM ================= */}

      <form
        className="income-edit-form"
        onSubmit={handleSubmit}
      >

        <div className="income-edit-grid">

          {/* Date */}

          <div className="income-edit-group">

            <label>Income Date *</label>

            <input
              type="date"
              name="income_date"
              value={form.income_date}
              onChange={handleChange}
              required
            />

          </div>


          {/* Income Type */}

          <div className="income-edit-group">

            <label>Income Type *</label>

            <select
              name="income_type"
              value={form.income_type}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Income Type
              </option>

              <option value="Course Fee">
                Course Fee
              </option>

              <option value="Admission Fee">
                Admission Fee
              </option>

              <option value="Registration Fee">
                Registration Fee
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* Amount */}

          <div className="income-edit-group">

            <label>Amount *</label>

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


          {/* Payment */}

          <div className="income-edit-group">

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


          {/* Branch */}

          <div className="income-edit-group">

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


          {/* Description */}

          <div className="income-edit-group full-width">

            <label>Description</label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Income description"
            />

          </div>


          {/* Note */}

          <div className="income-edit-group full-width">

            <label>Note</label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="4"
              placeholder="Additional note"
            ></textarea>

          </div>

        </div>


        {/* Message */}

        {message && (
          <div className="income-edit-message">
            {message}
          </div>
        )}


        {/* Buttons */}

        <div className="income-edit-actions">

          <button
            type="button"
            className="income-cancel-btn"
            onClick={() => navigate("/admin/income-list")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="income-update-btn"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Income"}
          </button>

        </div>

      </form>

    </div>
  );
}