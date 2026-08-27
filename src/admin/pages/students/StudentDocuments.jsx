import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDocuments.css";
import API_BASE_URL, { API_ORIGIN } from "../../../config/api";

const API = API_BASE_URL;
const IMAGE_URL = API_ORIGIN;


/* =====================================================
   JSON RESPONSE
===================================================== */

const parseJsonResponse = async (
  response,
  fallbackMessage
) => {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      fallbackMessage ||
        "Server response is empty."
    );
  }

  try {
    return JSON.parse(text.trim());
  } catch {
    console.error(
      "Invalid JSON response:",
      text
    );

    throw new Error(
      fallbackMessage ||
        "Server returned invalid JSON."
    );
  }
};


/* =====================================================
   CURRENT USER
===================================================== */

const getCurrentUser = () => {
  const keys = [
    "sunshine_user",
    "admin",
    "currentAdmin",
    "user",
    "currentUser",
    "loginUser",
  ];

  for (const key of keys) {
    try {
      const value =
        localStorage.getItem(key);

      if (!value) continue;

      const data =
        JSON.parse(value);

      if (
        data &&
        typeof data === "object"
      ) {
        return data;
      }
    } catch {
      console.warn(
        `Invalid localStorage data: ${key}`
      );
    }
  }

  return null;
};


/* =====================================================
   PENDING
===================================================== */

const isPendingApplication = (
  student
) => {
  const status = String(
    student?.application_status ||
      student?.applicationStatus ||
      student?.status ||
      ""
  )
    .trim()
    .toLowerCase();

  return [
    "pending",
    "new",
    "draft",
    "submitted",
    "approval pending",
    "waiting for approval",
  ].includes(status);
};


/* =====================================================
   FILE VALUE
===================================================== */

const getFileValue = (
  student,
  type
) => {
  if (!student) return "";

  if (type === "passport") {
    return (
      student.passport_scan ||
      student.passportScan ||
      student.passport_file ||
      student.passportFile ||
      ""
    );
  }

  if (type === "nid") {
    return (
      student.nid_scan ||
      student.nidScan ||
      student.nid_file ||
      student.nidFile ||
      ""
    );
  }

  if (type === "birth") {
    return (
      student.birth_registration_scan ||
      student.birthRegistrationScan ||
      student.birth_registration_file ||
      student.birthRegistrationFile ||
      ""
    );
  }

  return "";
};


/* =====================================================
   FILE URL
===================================================== */

const getFileUrl = (file) => {
  if (!file) {
    return "";
  }

  const cleanFile =
    String(file).trim();

  if (!cleanFile) {
    return "";
  }

  if (
    cleanFile.startsWith("http://") ||
    cleanFile.startsWith("https://") ||
    cleanFile.startsWith("data:")
  ) {
    return cleanFile;
  }

  const cleanPath = cleanFile
    .replace(
      /^https?:\/\/[^/]+/i,
      ""
    )
    .replace(/^\/+/g, "")
    .replace(
      /^uploads\/students\//i,
      ""
    )
    .replace(
      /^uploads\//i,
      ""
    )
    .replace(
      /^students\//i,
      ""
    )
    .split(/[\\\/]+/)
    .filter(Boolean)
    .map((part) =>
      encodeURIComponent(part)
    )
    .join("/");

  return cleanPath
    ? `${IMAGE_URL}/uploads/students/${cleanPath}`
    : "";
};


/* =====================================================
   PHOTO
===================================================== */

const getPhotoValue = (
  student
) => {
  return (
    student?.student_photo ||
    student?.photo ||
    student?.profile_photo ||
    student?.image ||
    ""
  );
};

const getPhotoUrl = (
  photo
) => {
  return getFileUrl(photo);
};


/* =====================================================
   DOCUMENT EXIST CHECK
===================================================== */

const hasDocument = (
  student,
  type
) => {
  return Boolean(
    getFileValue(
      student,
      type
    )
  );
};


/* =====================================================
   COMPONENT
===================================================== */

export default function StudentDocuments() {
  const navigate = useNavigate();

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  const loadStudents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const currentUser =
        getCurrentUser();

      const role = String(
        currentUser?.role ||
          currentUser?.user_role ||
          currentUser?.admin_role ||
          ""
      ).trim();

      const params =
        new URLSearchParams();

      params.set(
        "role",
        role
      );

      const response =
        await fetch(
          `${API}/students.php?${params.toString()}`,
          {
            credentials:
              "include",
          }
        );

      const data =
        await parseJsonResponse(
          response,
          "Student data পাওয়া যায়নি।"
        );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Student data পাওয়া যায়নি।"
        );
      }

      const list =
        Array.isArray(
          data.students
        )
          ? data.students
          : [];

      const documentStudents =
        list.filter(
          (student) =>
            !isPendingApplication(
              student
            ) &&
            (
              hasDocument(
                student,
                "passport"
              ) ||
              hasDocument(
                student,
                "nid"
              ) ||
              hasDocument(
                student,
                "birth"
              )
            )
        );

      setStudents(
        documentStudents
      );

    } catch (error) {
      console.error(
        "Student documents loading error:",
        error
      );

      setStudents([]);

      setMessage(
        error.message ||
          "Server connection failed"
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadStudents();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        return (
          String(
            student.student_id ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            student.student_name_en ||
              student.student_name ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            student.student_name_bn ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            student.student_mobile ||
              student.mobile ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            student.branch ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            student.course ||
              ""
          )
            .toLowerCase()
            .includes(searchText)
        );
      }
    );


  /* =====================================================
     DOWNLOAD BUTTON
===================================================== */

  const renderDownloadButton = (
    student,
    type,
    icon,
    title
  ) => {
    const file =
      getFileValue(
        student,
        type
      );

    const url =
      getFileUrl(file);

    if (!url) {
      return (
        <span
          className="document-not-available"
          title={`${title} not available`}
        >
          {icon}
        </span>
      );
    }

    return (
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={`document-download-button ${type}`}
        title={`Download ${title}`}
      >
        {icon}
      </a>
    );
  };


  /* =====================================================
     RENDER
===================================================== */

  return (
    <div className="student-documents">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="student-documents-header">

        <div>

          <h1>
            Student Documents
          </h1>

          <p>
            Passport, NID ও Birth Registration uploaded students
          </p>

        </div>


        <div className="student-documents-count">
          Total:{" "}
          {filteredStudents.length}
        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="student-documents-search">

        <input
          type="text"
          placeholder="Search by ID, name, mobile, branch or course..."
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
        <p className="student-documents-message">
          {message}
        </p>
      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="student-documents-table-container">

        {loading ? (

          <p className="student-documents-empty">
            Loading student documents...
          </p>

        ) : (

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
                  Branch
                </th>

                <th>
                  Course
                </th>

                <th>
                  Passport
                </th>

                <th>
                  NID
                </th>

                <th>
                  Birth Registration
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredStudents.map(
                (student) => {

                  const photo =
                    getPhotoValue(
                      student
                    );

                  const photoUrl =
                    getPhotoUrl(
                      photo
                    );

                  return (

                    <tr
                      key={
                        student.id
                      }
                    >

                      {/* PHOTO */}

                      <td>

                        {photoUrl ? (

                          <img
                            src={photoUrl}
                            alt={
                              student.student_name_en ||
                              "Student"
                            }
                            className="student-doc-photo"
                          />

                        ) : (

                          <span className="student-doc-no-photo">
                            No Photo
                          </span>

                        )}

                      </td>


                      {/* ID */}

                      <td>

                        <strong className="student-doc-id">
                          {student.student_id ||
                            `#${student.id}`}
                        </strong>

                      </td>


                      {/* NAME */}

                      <td>

                        <div className="student-doc-name">

                          <strong>
                            {student.student_name_en ||
                              student.student_name ||
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


                      {/* BRANCH */}

                      <td>
                        {student.branch ||
                          "-"}
                      </td>


                      {/* COURSE */}

                      <td>
                        {student.course ||
                          "-"}
                      </td>


                      {/* PASSPORT */}

                      <td>

                        {hasDocument(
                          student,
                          "passport"
                        ) ? (

                          <span className="document-status uploaded">
                            Uploaded
                          </span>

                        ) : (

                          <span className="document-status missing">
                            —
                          </span>

                        )}

                      </td>


                      {/* NID */}

                      <td>

                        {hasDocument(
                          student,
                          "nid"
                        ) ? (

                          <span className="document-status uploaded">
                            Uploaded
                          </span>

                        ) : (

                          <span className="document-status missing">
                            —
                          </span>

                        )}

                      </td>


                      {/* BIRTH */}

                      <td>

                        {hasDocument(
                          student,
                          "birth"
                        ) ? (

                          <span className="document-status uploaded">
                            Uploaded
                          </span>

                        ) : (

                          <span className="document-status missing">
                            —
                          </span>

                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="student-document-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="document-view-button"
                            title="View Student"
                            onClick={() =>
                              navigate(
                                `/admin/student-profile/${student.id}`
                              )
                            }
                          >
                            👁️
                          </button>


                          {/* PASSPORT */}

                          {renderDownloadButton(
                            student,
                            "passport",
                            "🛂",
                            "Passport"
                          )}


                          {/* NID */}

                          {renderDownloadButton(
                            student,
                            "nid",
                            "🪪",
                            "NID"
                          )}


                          {/* BIRTH */}

                          {renderDownloadButton(
                            student,
                            "birth",
                            "📄",
                            "Birth Registration"
                          )}

                        </div>

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>
        )}


        {!loading &&
          filteredStudents.length === 0 && (

            <p className="student-documents-empty">
              কোনো uploaded document পাওয়া যায়নি।
            </p>

          )}

      </div>

    </div>
  );
}