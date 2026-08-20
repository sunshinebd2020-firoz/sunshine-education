import "./IncomeVoucher.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      console.error(error);
    }
  }

  return null;
};


export default function IncomeVoucher() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  const [income, setIncome] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD VOUCHER
  ===================================================== */

  useEffect(() => {

    const loadVoucher =
      async () => {

        try {

          setLoading(true);

          setError("");


          const user =
            getLoggedInUser();


          if (!user) {

            setError(
              "Login user information পাওয়া যায়নি।"
            );

            return;
          }


          const teacherId =
            String(
              user.teacher_id ||
              user.teacherId ||
              ""
            ).trim();


          const adminId =
            String(
              user.admin_id ||
              user.adminId ||
              user.user_id ||
              user.userId ||
              user.id ||
              ""
            ).trim();


          const params =
            new URLSearchParams();


          params.append(
            "id",
            id
          );


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


          const response =
            await fetch(
              `${API_BASE_URL}/income_voucher.php?${params.toString()}`
            );


          const data =
            await response.json();


          if (!data.success) {

            setError(
              data.message ||
              "Voucher পাওয়া যায়নি।"
            );

            return;
          }


          setIncome(
            data.data
          );

        } catch (error) {

          console.error(
            "Voucher error:",
            error
          );

          setError(
            "Voucher load করা যাচ্ছে না।"
          );

        } finally {

          setLoading(false);
        }
      };


    loadVoucher();

  }, [id]);


  /* =====================================================
     PRINT
  ===================================================== */

  const handlePrint =
    () => {

      window.print();
    };


  /* =====================================================
     MONEY
  ===================================================== */

  const formatMoney =
    (amount) => {

      return Number(
        amount || 0
      ).toLocaleString(
        "en-BD",
        {
          minimumFractionDigits:
            2,

          maximumFractionDigits:
            2,
        }
      );
    };


  if (loading) {

    return (
      <div className="voucher-page-message">
        Voucher Loading...
      </div>
    );
  }


  if (error) {

    return (

      <div className="voucher-page-message">

        <p>
          {error}
        </p>

        <button
          onClick={() =>
            navigate(
              "/admin/income"
            )
          }
        >
          Back to Income List
        </button>

      </div>
    );
  }


  if (!income) {

    return null;
  }


  return (

    <div className="voucher-page">

      <div className="voucher-actions">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/income"
            )
          }
        >
          ← Back
        </button>


        <button
          type="button"
          onClick={
            handlePrint
          }
        >
          🖨️ Print Voucher
        </button>

      </div>


      <div className="income-voucher">

        <div className="voucher-header">

          <h1>
            Sunshine Education
          </h1>

          <p>
            Japanese, German & Korean
            Language Learning Center
          </p>

          <h2>
            INCOME VOUCHER
          </h2>

        </div>


        <div className="voucher-meta">

          <div>

            <strong>
              Voucher No:
            </strong>

            <span>
              INV-{income.id}
            </span>

          </div>


          <div>

            <strong>
              Date:
            </strong>

            <span>
              {income.income_date}
            </span>

          </div>

        </div>


        <div className="voucher-info">

          <div>

            <strong>
              Income Type
            </strong>

            <span>
              {income.income_type ||
                "-"}
            </span>

          </div>


          <div>

            <strong>
              Payment Method
            </strong>

            <span>
              {income.payment_method ||
                "-"}
            </span>

          </div>


          <div>

            <strong>
              Branch
            </strong>

            <span>
              {income.branch ||
                "-"}
            </span>

          </div>


          <div>

            <strong>
              Student ID
            </strong>

            <span>
              {income.student_id ||
                "Non-Student"}
            </span>

          </div>


          <div>

            <strong>
              Student Name
            </strong>

            <span>
              {income.student_name ||
                "-"}
            </span>

          </div>

        </div>


        <table className="voucher-table">

          <thead>

            <tr>

              <th>
                Description
              </th>

              <th>
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td>

                {income.description ||
                  income.income_type ||
                  "-"}

                {income.note && (

                  <div className="voucher-note">

                    Note:{" "}
                    {income.note}

                  </div>

                )}

              </td>

              <td className="voucher-amount">

                ৳{" "}
                {formatMoney(
                  income.amount
                )}

              </td>

            </tr>

          </tbody>

        </table>


        <div className="voucher-total">

          <span>
            Total Amount
          </span>

          <strong>
            ৳{" "}
            {formatMoney(
              income.amount
            )}
          </strong>

        </div>


        <div className="voucher-signatures">

          <div className="signature-box">

            <div className="signature-line"></div>

            <strong>
              Received By
            </strong>

            <span>
              {income.created_by_name ||
                income.entry_by_name ||
                "Authorized Person"}
            </span>

            {income.created_by_teacher_id && (

              <small>
                Teacher ID:{" "}
                {
                  income.created_by_teacher_id
                }
              </small>

            )}

          </div>


          <div className="signature-box">

            <div className="signature-line"></div>

            <strong>
              Authorized Signature
            </strong>

            <span>
              Sunshine Education
            </span>

          </div>

        </div>


        <div className="voucher-footer">

          <p>
            This is a computer generated
            income voucher.
          </p>

        </div>

      </div>

    </div>
  );
}