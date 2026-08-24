import { useEffect, useState } from "react";
import "./DueList.css";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";


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

      const user = JSON.parse(value);

      if (
        user &&
        typeof user === "object"
      ) {
        return user;
      }

    } catch (error) {

      console.error(
        `Invalid localStorage data: ${key}`,
        error
      );

    }
  }

  return null;
};


/* =====================================================
   ADMIN ROLE
===================================================== */

const isAdminRole = (role) => {

  const normalized =
    String(role || "")
      .trim()
      .toLowerCase();

  return [
    "admin",
    "administrator",
    "super admin",
    "superadmin",
  ].includes(normalized);

};


/* =====================================================
   PHOTO URL
===================================================== */

const getPhotoUrl = (photo) => {

  if (!photo) {
    return "";
  }

  const photoPath = String(photo).trim();

  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:")
  ) {
    return photoPath;
  }

  // The API can return either a filename or an uploads/students path.
  const relativePhotoPath = photoPath
    .replace(/^\/?(?:sunshine-api\/)?uploads\/students\//i, "")
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${API_ORIGIN}/uploads/students/${relativePhotoPath}`;

};


/* =====================================================
   COMPONENT
===================================================== */

export default function DueList() {

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [, setTeacherId] =
    useState("");

  const [userRole, setUserRole] =
    useState("");

  const [userBranch, setUserBranch] =
    useState("");

  const [totalCourseFee, setTotalCourseFee] =
    useState(0);

  const [totalPaid, setTotalPaid] =
    useState(0);

  const [totalDue, setTotalDue] =
    useState(0);


  /* =====================================================
     LOAD DUE LIST
===================================================== */

  const loadDueList = async (
    currentTeacherId,
    currentRole
  ) => {

    try {

      setLoading(true);
      setMessage("");


      const admin =
        isAdminRole(currentRole);


      const params =
        new URLSearchParams();


      /*
       * Admin-এর Teacher ID প্রয়োজন নেই।
       */
      if (
        !admin &&
        currentTeacherId
      ) {
        params.append(
          "teacher_id",
          currentTeacherId
        );
      }



      params.append(
        "role",
        currentRole
      );


      const response =
        await fetch(
          `${API_BASE_URL}/due_list.php?${params.toString()}`,
          {
            method: "GET",

            credentials: "include",

            headers: {
              Accept:
                "application/json"
            }
          }
        );


      const text =
        await response.text();


      if (!text.trim()) {

        throw new Error(
          "Server থেকে কোনো response পাওয়া যায়নি।"
        );

      }


      let data;

      try {

        data =
          JSON.parse(text);

      } catch (error) {

        console.error(
          "Due List Raw Response:",
          text
        );

        throw new Error(
          "Server থেকে সঠিক JSON response পাওয়া যায়নি।",
          { cause: error }
        );

      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Due data পাওয়া যায়নি।"
        );

      }


      const records =
        Array.isArray(data.data)
          ? data.data
          : [];


      setStudents(
        records
      );


      setUserBranch(
        data.user_branch === "ALL"
          ? ""
          : data.user_branch || ""
      );


      setTotalCourseFee(
        Number(
          data.total_course_fee || 0
        )
      );


      setTotalPaid(
        Number(
          data.total_paid || 0
        )
      );


      setTotalDue(
        Number(
          data.total_due || 0
        )
      );


    } catch (error) {

      console.error(
        "Due list loading error:",
        error
      );


      setStudents([]);

      setTotalCourseFee(0);
      setTotalPaid(0);
      setTotalDue(0);


      setMessage(
        error.message ||
        "Server-এর সাথে সংযোগ করা যাচ্ছে না।"
      );


    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     INITIAL LOAD
===================================================== */

  useEffect(() => {

    const user =
      getLoggedInUser();


    if (!user) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(
        "Login user information পাওয়া যায়নি। আবার login করুন।"
      );

      setLoading(false);

      return;

    }


    const currentRole =
      String(
        user.role || ""
      )
        .trim()
        .toLowerCase();


    const currentTeacherId =
      String(
        user.teacher_id ||
        user.teacherId ||
        ""
      ).trim();




    const admin =
      isAdminRole(
        currentRole
      );


    setTeacherId(
      currentTeacherId
    );


    setUserRole(
      currentRole
    );


    /*
     * Admin-এর Teacher ID লাগবে না।
     */

    if (admin) {

      loadDueList(
        "",
        currentRole
      );

      return;

    }


    /*
     * Teacher-এর নিজের branch বের করার
     * জন্য Teacher ID প্রয়োজন।
     */

    if (!currentTeacherId) {

      setMessage(
        "Teacher ID পাওয়া যাচ্ছে না। আবার login করুন।"
      );

      setLoading(false);

      return;

    }


    loadDueList(
      currentTeacherId,
      currentRole
    );

  }, []);


  /* =====================================================
     SEARCH
===================================================== */

  const filteredStudents =
    students.filter(
      (student) => {

        const searchText =
          search
            .trim()
            .toLowerCase();


        if (!searchText) {
          return true;
        }


        const studentId =
          String(
            student.student_id || ""
          ).toLowerCase();


        const nameEn =
          String(
            student.student_name_en || ""
          ).toLowerCase();


        const nameBn =
          String(
            student.student_name_bn || ""
          ).toLowerCase();


        const course =
          String(
            student.course || ""
          ).toLowerCase();


        const level =
          String(
            student.language_level || ""
          ).toLowerCase();


        const mobile =
          String(
            student.student_mobile || ""
          ).toLowerCase();


        return (

          studentId.includes(searchText) ||

          nameEn.includes(searchText) ||

          nameBn.includes(searchText) ||

          course.includes(searchText) ||

          level.includes(searchText) ||

          mobile.includes(searchText)

        );

      }
    );


  /* =====================================================
     FORMAT MONEY
===================================================== */

  const formatMoney = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  const normalizeWhatsAppNumber = (phone) => {
    if (!phone) return "";

    const digits = String(phone).replace(/\D/g, "");

    if (!digits) return "";

    if (digits.startsWith("88")) {
      return `+${digits}`;
    }

    if (digits.startsWith("0")) {
      return `+88${digits.substring(1)}`;
    }

    if (digits.length === 11) {
      return `+88${digits}`;
    }

    return `+${digits}`;
  };

  const handleWhatsAppPayment = (student) => {
    const phone = normalizeWhatsAppNumber(
      student?.student_mobile || student?.mobile || ""
    );

    if (!phone) {
      setMessage("Student mobile number available नाही। WhatsApp payment শুরু করা যাবে না।");
      return;
    }

    const studentName =
      student?.student_name_en ||
      student?.student_name_bn ||
      "Student";

    const amount = Number(student?.due_amount || student?.due || 0);

    const message = `Assalamu Alaikum ${studentName}.\n\nYour due payment is BDT ${formatMoney(amount)}.\nPlease confirm the payment and send the payment confirmation.\n\nStudent ID: ${student?.student_id || student?.id || "N/A"}`;

    const url = `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };


  /* =====================================================
     RENDER
===================================================== */

  return (

    <div className="due-list">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="due-list-header">

        <div>

          <h1>
            Due List
          </h1>

          <p>
            যেসব শিক্ষার্থীর Course Fee বাকি আছে
          </p>


          {!isAdminRole(userRole) &&
            userBranch && (

              <p className="due-branch">

                Branch:

                <strong>
                  {" "}
                  {userBranch}
                </strong>

              </p>

            )}


          {isAdminRole(userRole) && (

            <p className="due-branch">

              Branch:

              <strong>
                {" "}
                All Branches
              </strong>

            </p>

          )}

        </div>


        <div className="due-count">

          Total Due Students:
          {" "}
          {filteredStudents.length}

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="due-summary">

        <div className="due-summary-card">

          <span>
            Total Course Fee
          </span>

          <strong>
            ৳{" "}
            {formatMoney(
              totalCourseFee
            )}
          </strong>

        </div>


        <div className="due-summary-card">

          <span>
            Total Paid
          </span>

          <strong>
            ৳{" "}
            {formatMoney(
              totalPaid
            )}
          </strong>

        </div>


        <div className="due-summary-card due-summary-danger">

          <span>
            Total Due
          </span>

          <strong>
            ৳{" "}
            {formatMoney(
              totalDue
            )}
          </strong>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="due-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, course or level..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <p className="due-message">
          {message}
        </p>

      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="due-table-container">

        {loading ? (

          <p className="no-due">
            Loading due list...
          </p>

        ) : (

          <>

            <table>

              <thead>

                <tr>

                  <th>
                    Photo
                  </th>

                  <th>
                    ID No
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Course
                  </th>

                  <th>
                    Level
                  </th>

                  <th>
                    Course Fee
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Due
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={
                        student.id
                      }
                    >


                      {/* PHOTO */}

                      <td>

                        {student.student_photo ? (

                          <>

                          <img
                            src={getPhotoUrl(
                              student.student_photo
                            )}
                            alt={
                              student.student_name_en ||
                              "Student"
                            }
                            className="due-student-photo"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextElementSibling.style.display = "inline";
                            }}
                          />

                          <span
                            className="due-no-photo"
                            style={{ display: "none" }}
                          >
                            No Photo
                          </span>

                          </>

                        ) : (

                          <span className="due-no-photo">
                            No Photo
                          </span>

                        )}

                      </td>


                      {/* ID */}

                      <td>

                        <strong className="due-student-id">

                          {student.student_id ||
                            `#${student.id}`}

                        </strong>

                      </td>


                      {/* NAME */}

                      <td>

                        <div className="due-student-name">

                          <strong>

                            {student.student_name_en ||
                              "-"}

                          </strong>


                          {student.student_name_bn && (

                            <span>

                              {
                                student.student_name_bn
                              }

                            </span>

                          )}

                        </div>

                      </td>


                      {/* MOBILE */}

                      <td>

                        <span className="due-student-mobile">

                          {student.student_mobile ||
                            "-"}

                        </span>

                      </td>


                      {/* COURSE */}

                      <td>

                        {student.course ||
                          "-"}

                      </td>


                      {/* LEVEL */}

                      <td>

                        {student.language_level ||
                          "-"}

                      </td>


                      {/* COURSE FEE */}

                      <td className="money-cell">

                        ৳{" "}

                        {formatMoney(
                          student.course_fee
                        )}

                      </td>


                      {/* PAID */}

                      <td className="money-cell paid-cell">

                        ৳{" "}

                        {formatMoney(
                          student.paid_course_fee
                        )}

                      </td>


                      {/* DUE */}

                      <td className="money-cell">

                        <strong className="due-amount">

                          ৳{" "}

                          {formatMoney(
                            student.due_amount
                          )}

                        </strong>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="due-whatsapp-button"
                          onClick={() =>
                            handleWhatsAppPayment(student)
                          }
                          title="Send WhatsApp payment message"
                        >
                          WhatsApp Pay
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {filteredStudents.length === 0 && (

              <p className="no-due">

                কোনো Due পাওয়া যায়নি।

              </p>

            )}

          </>

        )}

      </div>

    </div>

  );

}