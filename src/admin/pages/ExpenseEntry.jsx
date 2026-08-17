import "./ExpenseEntry.css";
import { useEffect, useState } from "react";

const initialForm = {
  expense_date: new Date().toISOString().split("T")[0],
  expense_type: "",
  staff_id: "",
  staff_name: "",
  description: "",
  amount: "",
  payment_method: "",
  branch: "",
  note: "",
};

export default function ExpenseEntry() {
  const [form, setForm] = useState(initialForm);

  const [staffs, setStaffs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");

  const [message, setMessage] = useState("");

  /* ================= LOAD STAFF ================= */

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await fetch(
          "http://localhost/sunshine-api/api/teacher_list.php"
        );

        const data = await response.json();

        console.log("Teacher API Response:", data);

        if (data.success) {
          setStaffs(
            data.data ||
            data.teachers ||
            []
          );
        } else {
          console.error(
            "Teacher API Error:",
            data.message
          );
        }

      } catch (error) {
        console.error(
          "Staff fetch error:",
          error
        );
      }
    };

    fetchStaffs();
  }, []);


  /* ================= STAFF ID ================= */

  const getStaffId = (staff) => {
    return (
      staff.teacher_id ||
      staff.staff_id ||
      staff.id ||
      ""
    );
  };


  /* ================= STAFF NAME ================= */

  const getStaffName = (staff) => {
    return (
      staff.nameBn ||
      staff.name_bn ||
      staff.nameEn ||
      staff.name_en ||
      staff.name ||
      ""
    );
  };


  /* ================= SEARCH STAFF ================= */

  const searchStaffs = (value) => {

    const search = value
      .trim()
      .toLowerCase();

    if (!search) {
      setSuggestions([]);
      return;
    }

    const filtered = staffs
      .filter((staff) => {

        const staffId = String(
          getStaffId(staff)
        ).toLowerCase();

        const staffName = String(
          getStaffName(staff)
        ).toLowerCase();

        return (
          staffId.includes(search) ||
          staffName.includes(search)
        );

      })
      .slice(0, 8);

    setSuggestions(filtered);
  };


  /* ================= STAFF ID CHANGE ================= */

  const handleStaffIdChange = (e) => {

    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      staff_id: value,
    }));

    setActiveField("staff-id");

    searchStaffs(value);
  };


  /* ================= STAFF NAME CHANGE ================= */

  const handleStaffNameChange = (e) => {

    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      staff_name: value,
    }));

    setActiveField("staff-name");

    searchStaffs(value);
  };


  /* ================= SELECT STAFF ================= */

  const selectStaff = (staff) => {

    setForm((prev) => ({
      ...prev,
      staff_id: getStaffId(staff),
      staff_name: getStaffName(staff),
    }));

    setSuggestions([]);
    setActiveField("");
  };


  /* ================= BLUR ================= */

  const handleBlur = () => {

    setTimeout(() => {
      setSuggestions([]);
      setActiveField("");
    }, 200);

  };


  /* ================= NORMAL CHANGE ================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    /* Salary না হলে staff information clear */

    if (
      name === "expense_type" &&
      value !== "Salary"
    ) {

      setForm((prev) => ({
        ...prev,
        expense_type: value,
        staff_id: "",
        staff_name: "",
      }));

      setSuggestions([]);
      setActiveField("");

    }

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

      console.log(
        "Expense API Response:",
        data
      );

      if (data.success) {

        setMessage(
          "Expense সফলভাবে যোগ হয়েছে!"
        );

        setForm({
          ...initialForm,
          expense_date:
            new Date()
              .toISOString()
              .split("T")[0],
        });

        setSuggestions([]);
        setActiveField("");

      } else {

        setMessage(
          data.message ||
          "Expense যোগ করা যায়নি"
        );

      }

    } catch (error) {

      console.error(
        "Expense submit error:",
        error
      );

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

          <p>
            নতুন Expense তথ্য যোগ করুন
          </p>

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


          {/* ================= EXPENSE TYPE ================= */}

          <div className="expense-form-group">

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

              <option value="Transport">
                Transport
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Stationery">
                Stationery
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* =================================================
              STAFF ID
              শুধুমাত্র Salary হলে দেখাবে
          ================================================= */}

          {form.expense_type === "Salary" && (

            <div className="expense-form-group staff-autocomplete">

              <label>
                Staff ID
              </label>

              <input
                type="text"
                name="staff_id"
                value={form.staff_id}
                onChange={handleStaffIdChange}
                onFocus={() => {

                  setActiveField(
                    "staff-id"
                  );

                  searchStaffs(
                    form.staff_id
                  );

                }}
                onBlur={handleBlur}
                placeholder="Enter Staff ID"
                autoComplete="off"
              />


              {activeField === "staff-id" &&
                suggestions.length > 0 && (

                  <div className="staff-suggestions">

                    {suggestions.map(
                      (staff) => (

                        <div
                          key={
                            getStaffId(
                              staff
                            )
                          }
                          className="staff-suggestion"
                          onMouseDown={() =>
                            selectStaff(
                              staff
                            )
                          }
                        >

                          <strong>
                            {getStaffId(
                              staff
                            )}
                          </strong>

                          <span>
                            {getStaffName(
                              staff
                            )}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              <small>
                Staff ID লিখলে suggestion দেখাবে
              </small>

            </div>

          )}


          {/* =================================================
              STAFF NAME
              শুধুমাত্র Salary হলে দেখাবে
          ================================================= */}

          {form.expense_type === "Salary" && (

            <div className="expense-form-group staff-autocomplete">

              <label>
                Staff Name
              </label>

              <input
                type="text"
                name="staff_name"
                value={form.staff_name}
                onChange={handleStaffNameChange}
                onFocus={() => {

                  setActiveField(
                    "staff-name"
                  );

                  searchStaffs(
                    form.staff_name
                  );

                }}
                onBlur={handleBlur}
                placeholder="Enter Staff Name"
                autoComplete="off"
              />


              {activeField === "staff-name" &&
                suggestions.length > 0 && (

                  <div className="staff-suggestions">

                    {suggestions.map(
                      (staff) => (

                        <div
                          key={
                            getStaffId(
                              staff
                            )
                          }
                          className="staff-suggestion"
                          onMouseDown={() =>
                            selectStaff(
                              staff
                            )
                          }
                        >

                          <strong>
                            {getStaffId(
                              staff
                            )}
                          </strong>

                          <span>
                            {getStaffName(
                              staff
                            )}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              <small>
                Staff Name লিখলে suggestion দেখাবে
              </small>

            </div>

          )}


          {/* ================= AMOUNT ================= */}

          <div className="expense-form-group">

            <label>
              Amount *
            </label>

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


          {/* ================= PAYMENT ================= */}

          <div className="expense-form-group">

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


          {/* ================= BRANCH ================= */}

          <div className="expense-form-group">

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


          {/* ================= DESCRIPTION ================= */}

          <div className="expense-form-group full-width">

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


          {/* ================= NOTE ================= */}

          <div className="expense-form-group full-width">

            <label>
              Note
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Additional note"
              rows="4"
            />

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