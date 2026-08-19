import { useEffect, useState } from "react";
import "./PermissionModal.css";

const API_BASE_URL = "http://localhost/sunshine-api/api";

const PERMISSIONS = [
  { key: "teacher", label: "Teacher" },
  { key: "student", label: "Student" },
  { key: "course", label: "Course" },
  { key: "branch", label: "Branch" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
  { key: "report", label: "Reports" },
];

const createDefaultPermission = () => ({
  can_view: false,
  can_add: false,
  can_edit: false,
  can_delete: false,
});

export default function PermissionModal({ teacher, onClose }) {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  /* =====================================================
     ADMIN ID
     
     admins.id
  ===================================================== */

  const getAdminId = () => {
    const id =
      teacher?.admin_id ??
      teacher?.user_id ??
      null;

    return id !== null && id !== undefined
      ? String(id).trim()
      : "";
  };

  /* =====================================================
     TEACHER ID

     admins.teacher_id
  ===================================================== */

  const getTeacherId = () => {
    const id =
      teacher?.teacher_id ??
      teacher?.teacherId ??
      "";

    return String(id).trim();
  };

  /* =====================================================
     EMPTY PERMISSIONS
  ===================================================== */

  const createEmptyPermissions = () => {
    const result = {};

    PERMISSIONS.forEach((item) => {
      result[item.key] = createDefaultPermission();
    });

    return result;
  };

  /* =====================================================
     LOAD PERMISSIONS
  ===================================================== */

  useEffect(() => {
    loadPermissions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  const loadPermissions = async () => {
    const adminId = getAdminId();
    const teacherId = getTeacherId();

    console.log("Permission Teacher:", teacher);
    console.log("Permission Admin ID:", adminId);
    console.log("Permission Teacher ID:", teacherId);

    /*
      Permission-এর জন্য Admin ID সবচেয়ে গুরুত্বপূর্ণ।
      তবে PHP compatibility-এর জন্য teacher_id-ও পাঠানো হচ্ছে।
    */

    if (!adminId && !teacherId) {
      setLoading(false);

      setPermissions(createEmptyPermissions());

      setMessage(
        "Admin ID এবং Teacher ID পাওয়া যায়নি।"
      );

      setMessageType("error");

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams();

      if (adminId) {
        params.append("admin_id", adminId);
      }

      if (teacherId) {
        params.append("teacher_id", teacherId);
      }

      const url =
        `${API_BASE_URL}/permission_get.php?${params.toString()}`;

      console.log("Permission GET URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log(
        "Permission GET Response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server থেকে সঠিক JSON response পাওয়া যায়নি।"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Permission load করা যাচ্ছে না।"
        );
      }

      const permissionData =
        createEmptyPermissions();

      if (Array.isArray(data.permissions)) {
        data.permissions.forEach((item) => {
          const key = String(
            item.permission || ""
          )
            .trim()
            .toLowerCase();

          if (permissionData[key]) {
            permissionData[key] = {
              can_view:
                Number(item.can_view) === 1,

              can_add:
                Number(item.can_add) === 1,

              can_edit:
                Number(item.can_edit) === 1,

              can_delete:
                Number(item.can_delete) === 1,
            };
          }
        });
      }

      setPermissions(permissionData);
    } catch (error) {
      console.error(
        "Permission Load Error:",
        error
      );

      setPermissions(
        createEmptyPermissions()
      );

      setMessage(
        error.message ||
          "Permission load করা যাচ্ছে না।"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CHANGE PERMISSION
  ===================================================== */

  const handlePermissionChange = (
    permission,
    action
  ) => {
    setPermissions((prev) => ({
      ...prev,

      [permission]: {
        ...(prev[permission] ||
          createDefaultPermission()),

        [action]:
          !prev[permission]?.[action],
      },
    }));
  };

  /* =====================================================
     ROW ALL
  ===================================================== */

  const isRowAllSelected = (permission) => {
    const current =
      permissions[permission];

    if (!current) {
      return false;
    }

    return (
      current.can_view &&
      current.can_add &&
      current.can_edit &&
      current.can_delete
    );
  };

  const handleSelectAll = (permission) => {
    const allSelected =
      isRowAllSelected(permission);

    setPermissions((prev) => ({
      ...prev,

      [permission]: {
        can_view: !allSelected,
        can_add: !allSelected,
        can_edit: !allSelected,
        can_delete: !allSelected,
      },
    }));
  };

  /* =====================================================
     GLOBAL ALL
  ===================================================== */

  const isAllSelected = () => {
    return PERMISSIONS.every((item) =>
      isRowAllSelected(item.key)
    );
  };

  const handleSelectAllPermissions = () => {
    const newValue = !isAllSelected();

    const newPermissions = {};

    PERMISSIONS.forEach((item) => {
      newPermissions[item.key] = {
        can_view: newValue,
        can_add: newValue,
        can_edit: newValue,
        can_delete: newValue,
      };
    });

    setPermissions(newPermissions);
  };

  /* =====================================================
     SAVE PERMISSIONS
  ===================================================== */

  const handleSave = async () => {
    const adminId = getAdminId();
    const teacherId = getTeacherId();

    if (!adminId && !teacherId) {
      setMessage(
        "Admin ID এবং Teacher ID পাওয়া যায়নি।"
      );

      setMessageType("error");

      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const permissionList =
        PERMISSIONS.map((item) => {
          const current =
            permissions[item.key] ||
            createDefaultPermission();

          return {
            permission: item.key,

            can_view:
              current.can_view ? 1 : 0,

            can_add:
              current.can_add ? 1 : 0,

            can_edit:
              current.can_edit ? 1 : 0,

            can_delete:
              current.can_delete ? 1 : 0,
          };
        });

      /*
        Admin ID + Teacher ID দুটোই পাঠানো হচ্ছে।
      */

      const requestData = {
        admin_id: adminId || null,
        teacher_id: teacherId || null,
        permissions: permissionList,
      };

      console.log(
        "Permission Save Request:",
        requestData
      );

      const response = await fetch(
        `${API_BASE_URL}/permission_save.php`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            requestData
          ),
        }
      );

      const text =
        await response.text();

      console.log(
        "Permission Save Response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server থেকে সঠিক JSON response পাওয়া যায়নি।"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Permission save করা যায়নি।"
        );
      }

      setMessage(
        "Permissions successfully saved."
      );

      setMessageType("success");

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        "Permission Save Error:",
        error
      );

      setMessage(
        error.message ||
          "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     MODAL
  ===================================================== */

  return (
    <div
      className="permission-modal-overlay"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        className="permission-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="permission-modal-header">
          <div>
            <h2>
              Manage Permissions
            </h2>

            <p>
              {teacher?.name_en ||
                teacher?.name_bn ||
                teacher?.username ||
                "User"}
            </p>

            <span>
              Admin ID:{" "}
              {getAdminId() ||
                "Not Found"}
            </span>

            <br />

            <span>
              Teacher ID:{" "}
              {getTeacherId() ||
                "Not Found"}
            </span>
          </div>

          <button
            type="button"
            className="permission-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <div className="permission-modal-body">

          {loading ? (
            <div className="permission-loading">
              Loading permissions...
            </div>
          ) : (
            <>
              <div className="permission-toolbar">
                <button
                  type="button"
                  className="permission-select-all"
                  onClick={
                    handleSelectAllPermissions
                  }
                  disabled={saving}
                >
                  {isAllSelected()
                    ? "Unselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="permission-table-wrapper">

                <table className="permission-table">

                  <thead>
                    <tr>
                      <th>
                        Module
                      </th>

                      <th>
                        View
                      </th>

                      <th>
                        Add
                      </th>

                      <th>
                        Edit
                      </th>

                      <th>
                        Delete
                      </th>

                      <th>
                        All
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {PERMISSIONS.map(
                      (item) => {
                        const current =
                          permissions[
                            item.key
                          ] ||
                          createDefaultPermission();

                        const allSelected =
                          isRowAllSelected(
                            item.key
                          );

                        return (
                          <tr
                            key={
                              item.key
                            }
                          >

                            <td className="permission-module">
                              {item.label}
                            </td>

                            {[
                              "can_view",
                              "can_add",
                              "can_edit",
                              "can_delete",
                            ].map(
                              (
                                action
                              ) => (
                                <td
                                  key={
                                    action
                                  }
                                >
                                  <label className="permission-checkbox">

                                    <input
                                      type="checkbox"
                                      checked={
                                        current[
                                          action
                                        ]
                                      }
                                      onChange={() =>
                                        handlePermissionChange(
                                          item.key,
                                          action
                                        )
                                      }
                                      disabled={
                                        saving
                                      }
                                    />

                                    <span />

                                  </label>
                                </td>
                              )
                            )}

                            <td>
                              <label className="permission-checkbox">

                                <input
                                  type="checkbox"
                                  checked={
                                    allSelected
                                  }
                                  onChange={() =>
                                    handleSelectAll(
                                      item.key
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                />

                                <span />

                              </label>
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

          {message && (
            <div
              className={`permission-message ${messageType}`}
            >
              {message}
            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="permission-modal-footer">

          <button
            type="button"
            className="permission-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="permission-save-btn"
            onClick={handleSave}
            disabled={
              loading ||
              saving ||
              (!getAdminId() &&
                !getTeacherId())
            }
          >
            {saving
              ? "Saving..."
              : "Save Permissions"}
          </button>

        </div>

      </div>
    </div>
  );
}