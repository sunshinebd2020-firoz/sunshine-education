import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import "./DownloadAdmin.css";

export default function DownloadEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("id");

  /* =====================================================
     FORM
  ===================================================== */

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  /* =====================================================
     COURSES
  ===================================================== */

  const [courses, setCourses] = useState([]);

  const [courseLoading, setCourseLoading] =
    useState(true);

  /* =====================================================
     LANGUAGE
  ===================================================== */

  const [activeLanguage, setActiveLanguage] =
    useState("");

  /* =====================================================
     SELECTED COURSES
  ===================================================== */

  const [selectedCourses, setSelectedCourses] =
    useState([]);

  /* =====================================================
     FILE
  ===================================================== */

  const [file, setFile] = useState(null);

  /* =====================================================
     MESSAGE
  ===================================================== */

  const [message, setMessage] = useState("");

  const [loading, setLoading] =
    useState(false);


  /* =====================================================
     LOAD COURSES
  ===================================================== */

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCourseLoading(true);
        setMessage("");

        const response = await fetch(
          `${API_BASE_URL}/course_list.php`
        );

        if (!response.ok) {
          throw new Error(
            "Course server error."
          );
        }

        const result =
          await response.json();

        console.log(
          "Course API:",
          result
        );

        const data =
          Array.isArray(result)
            ? result
            : Array.isArray(result.data)
            ? result.data
            : [];

        const activeCourses =
          data.filter((course) => {
            const status =
              String(
                course.status ?? ""
              )
                .trim()
                .toLowerCase();

            return (
              status === "1" ||
              status === "active" ||
              status === ""
            );
          });

        setCourses(
          activeCourses
        );

        /* ===============================================
           DEFAULT LANGUAGE
        =============================================== */

        if (
          activeCourses.length > 0
        ) {
          const firstLanguage =
            activeCourses[0]
              .language || "";

          setActiveLanguage(
            firstLanguage
          );
        }

      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );

        setMessage(
          error.message ||
            "Course list could not be loaded."
        );
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourses();
  }, []);


  /* =====================================================
     LOAD EXISTING DOWNLOAD
  ===================================================== */

  useEffect(() => {
    if (!editId) {
      return;
    }

    const loadDownload = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/download_list.php`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Download server error."
          );
        }

        const result =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Download could not be loaded."
          );
        }

        const item =
          (result.data || []).find(
            (entry) =>
              String(entry.id) ===
              String(editId)
          );

        if (!item) {
          throw new Error(
            "Download not found."
          );
        }

        setForm({
          title:
            item.title || "",
          description:
            item.description || "",
        });

        if (
          Array.isArray(
            item.course_ids_array
          )
        ) {
          setSelectedCourses(
            item.course_ids_array.map(
              (id) => String(id)
            )
          );
        }

      } catch (error) {
        console.error(
          "Download loading error:",
          error
        );

        setMessage(
          error.message ||
            "Download could not be loaded."
        );
      }
    };

    loadDownload();
  }, [editId]);


  /* =====================================================
     LANGUAGE LIST
  ===================================================== */

  const languages = useMemo(() => {
    const values =
      courses
        .map(
          (course) =>
            String(
              course.language || ""
            ).trim()
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ];
  }, [courses]);


  /* =====================================================
     FILTER COURSES
  ===================================================== */

  const filteredCourses =
    useMemo(() => {
      return courses.filter(
        (course) =>
          String(
            course.language || ""
          )
            .trim()
            .toLowerCase() ===
          String(
            activeLanguage || ""
          )
            .trim()
            .toLowerCase()
      );
    }, [
      courses,
      activeLanguage,
    ]);


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     COURSE CHECKBOX
  ===================================================== */

  const handleCourseCheck = (
    courseId
  ) => {
    const id =
      String(courseId);

    setSelectedCourses(
      (previous) => {
        if (
          previous.includes(id)
        ) {
          return previous.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...previous,
          id,
        ];
      }
    );

    setMessage("");
  };


  /* =====================================================
     SELECT ALL CURRENT LANGUAGE
  ===================================================== */

  const handleSelectAll = () => {
    const currentIds =
      filteredCourses.map(
        (course) =>
          String(course.id)
      );

    setSelectedCourses(
      (previous) => {
        const allSelected =
          currentIds.every(
            (id) =>
              previous.includes(id)
          );

        if (allSelected) {
          return previous.filter(
            (id) =>
              !currentIds.includes(id)
          );
        }

        return [
          ...new Set([
            ...previous,
            ...currentIds,
          ]),
        ];
      }
    );

    setMessage("");
  };


  /* =====================================================
     FILE CHANGE
  ===================================================== */

  const handleFileChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0] ||
      null;

    setFile(
      selectedFile
    );
  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const submit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");

    /* ===============================================
       TITLE
    =============================================== */

    if (
      !form.title.trim()
    ) {
      setMessage(
        "Please enter download title."
      );
      return;
    }


    /* ===============================================
       COURSE
    =============================================== */

    if (
      selectedCourses.length === 0
    ) {
      setMessage(
        "Please select at least one course."
      );
      return;
    }


    /* ===============================================
       FILE
    =============================================== */

    if (
      !editId &&
      !file
    ) {
      setMessage(
        "Please select a file."
      );
      return;
    }


    setLoading(true);

    try {
      const body =
        new FormData();

      body.append(
        "title",
        form.title.trim()
      );

      body.append(
        "description",
        form.description.trim()
      );


      /* =============================================
         IMPORTANT
         MULTIPLE COURSE IDS
      ============================================= */

      selectedCourses.forEach(
        (courseId) => {
          body.append(
            "course_ids[]",
            courseId
          );
        }
      );


      if (file) {
        body.append(
          "file",
          file
        );
      }


      /* =============================================
         DEBUG
      ============================================= */

      console.log(
        "Selected Courses:",
        selectedCourses
      );


      /* =============================================
         API
      ============================================= */

      const endpoint =
        editId
          ? `${API_BASE_URL}/download_update.php?id=${editId}`
          : `${API_BASE_URL}/download_add.php`;


      const response =
        await fetch(
          endpoint,
          {
            method: "POST",
            credentials: "include",
            body,
          }
        );


      const text =
        await response.text();

      console.log(
        "Download API:",
        text
      );


      let data;

      try {
        data =
          JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned invalid JSON. Check PHP error."
        );
      }


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Server error."
        );
      }


      if (!data.success) {
        throw new Error(
          data.message ||
            "Download save failed."
        );
      }


      navigate(
        "/admin/downloads"
      );

    } catch (error) {
      console.error(
        "Download save error:",
        error
      );

      setMessage(
        error.message ||
          "Download save failed."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     CURRENT LANGUAGE SELECT ALL STATUS
  ===================================================== */

  const currentIds =
    filteredCourses.map(
      (course) =>
        String(course.id)
    );

  const allCurrentSelected =
    currentIds.length > 0 &&
    currentIds.every(
      (id) =>
        selectedCourses.includes(id)
    );


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="download-admin">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="download-admin-header">

        <div>
          <h1>
            {editId
              ? "Edit Download"
              : "Add Download"}
          </h1>

          <p>
            Select language and one or
            more courses for this file.
          </p>
        </div>

        <button
          type="button"
          className="secondary"
          onClick={() =>
            navigate(
              "/admin/downloads"
            )
          }
        >
          Back
        </button>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="download-error">
          {message}
        </div>
      )}


      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="download-form"
        onSubmit={submit}
      >

        {/* =================================================
            LANGUAGE
        ================================================= */}

        <div className="download-category-box">

          <label>
            Language
          </label>

          <select
            value={activeLanguage}
            onChange={(event) =>
              setActiveLanguage(
                event.target.value
              )
            }
            disabled={
              courseLoading ||
              loading
            }
          >

            <option value="">
              Select Language
            </option>

            {languages.map(
              (language) => (
                <option
                  key={language}
                  value={language}
                >
                  {language}
                </option>
              )
            )}

          </select>

        </div>


        {/* =================================================
            COURSE CHECKBOXES
        ================================================= */}

        <div className="download-course-box">

          <div className="download-course-header">

            <div>
              <h3>
                Courses
              </h3>

              <p>
                Select one or more courses
              </p>
            </div>

            {filteredCourses.length >
              0 && (
              <button
                type="button"
                className="select-all-course"
                onClick={
                  handleSelectAll
                }
              >
                {allCurrentSelected
                  ? "Unselect All"
                  : "Select All"}
              </button>
            )}

          </div>


          {courseLoading ? (
            <div className="course-loading">
              Loading courses...
            </div>
          ) : filteredCourses.length ===
            0 ? (
            <div className="course-empty">
              এই language-এর কোনো course
              পাওয়া যায়নি।
            </div>
          ) : (
            <div className="download-course-list">

              {filteredCourses.map(
                (course) => {

                  const courseId =
                    String(
                      course.id
                    );

                  const checked =
                    selectedCourses.includes(
                      courseId
                    );

                  return (
                    <label
                      key={course.id}
                      className={
                        checked
                          ? "course-check-item checked"
                          : "course-check-item"
                      }
                    >

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleCourseCheck(
                            course.id
                          )
                        }
                      />

                      <span className="course-check-mark">
                        {checked
                          ? "✓"
                          : ""}
                      </span>

                      <span className="course-check-name">
                        {course.course_name ||
                          "Course"}
                      </span>

                    </label>
                  );
                }
              )}

            </div>
          )}

          <div className="selected-course-count">
            Selected courses:{" "}
            <strong>
              {selectedCourses.length}
            </strong>
          </div>

        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <label>
          Title

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter download title"
            required
            disabled={loading}
          />

        </label>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <label>
          Description

          <textarea
            name="description"
            value={
              form.description
            }
            onChange={handleChange}
            placeholder="Enter download description"
            rows="5"
            disabled={loading}
          />

        </label>


        {/* =================================================
            FILE
        ================================================= */}

        <label>
          File

          <input
            type="file"
            onChange={
              handleFileChange
            }
            required={!editId}
            disabled={loading}
          />

          {editId && (
            <small>
              Leave empty if you do not
              want to replace the existing
              file.
            </small>
          )}

          {file && (
            <small>
              Selected file:{" "}
              <strong>
                {file.name}
              </strong>
            </small>
          )}

        </label>


        {/* =================================================
            SUBMIT
        ================================================= */}

        <button
          type="submit"
          disabled={
            loading ||
            courseLoading ||
            selectedCourses.length === 0
          }
        >
          {loading
            ? "Saving..."
            : editId
            ? "Update Download"
            : "Save Download"}
        </button>

      </form>

    </div>
  );
}