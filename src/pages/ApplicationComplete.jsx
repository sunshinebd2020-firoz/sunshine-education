import "./ApplicationComplete.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function ApplicationComplete() {

  const location = useLocation();
  const navigate = useNavigate();

  const {
    studentId,
    studentName,
    course,
    language,
  } = location.state || {};

  return (
    <div className="application-complete">

      <div className="complete-card">

        <div className="complete-icon">
          ✓
        </div>

        <h1>
          Application Submitted Successfully
        </h1>

        <p className="complete-bangla">
          আপনার ভর্তি আবেদন সফলভাবে জমা হয়েছে।
        </p>


        {studentId && (
          <div className="application-id">

            <span>
              Application ID
            </span>

            <strong>
              {studentId}
            </strong>

          </div>
        )}


        {studentName && (
          <p>
            <strong>
              Applicant:
            </strong>{" "}
            {studentName}
          </p>
        )}


        {language && (
          <p>
            <strong>
              Language:
            </strong>{" "}
            {language}
          </p>
        )}


        {course && (
          <p>
            <strong>
              Course:
            </strong>{" "}
            {course}
          </p>
        )}


        <div className="pending-box">

          <strong>
            Application Status: Pending
          </strong>

          <p>
            আপনার আবেদনটি বর্তমানে কর্তৃপক্ষের
            অনুমোদনের অপেক্ষায় রয়েছে।
          </p>

          <p>
            কর্তৃপক্ষ যাচাই করার পর আপনার
            ভর্তি আবেদন অনুমোদন করবে।
          </p>

        </div>


        <button
          type="button"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>

    </div>
  );
}