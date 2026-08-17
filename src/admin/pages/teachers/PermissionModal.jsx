import { useEffect, useState } from "react";
import "./PermissionModal.css";

const API_BASE_URL = "http://localhost/sunshine-api/api";

const PERMISSIONS = [
  {
    key: "teacher",
    label: "Teacher",
  },
  {
    key: "student",
    label: "Student",
  },
  {
    key: "course",
    label: "Course",
  },
  {
    key: "branch",
    label: "Branch",
  },
  {
    key: "income",
    label: "Income",
  },
  {
    key: "expense",
    label: "Expense",
  },
  {
    key: "report",
    label: "Reports",
  },
];

const DEFAULT_PERMISSION = {
  can_view: false,
  can_add: false,
  can_edit: false,
  can_delete: false,
};

export default function PermissionModal({
  teacher,
  onClose,
}) {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD PERMISSIONS
  // =====================================================

  useEffect(() => {
    if (!teacher?.teacher_id) return;

    loadPermissions();
  }, [teacher]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/user_permissions.php?teacher_id=${encodeURIComponent(
          teacher.teacher_id
        )}`
      );

      const data = await response.json();

      const permissionData = {};

      PERMISSIONS.forEach((item) => {
        permissionData[item.key] = {
          ...DEFAULT_PERMISSION,
        };
      });

      if (data.success && Array.isArray(data.permissions)) {
        data.permissions.forEach((item) => {
          if (permissionData[item.permission]) {
            permissionData[item.permission] = {
              can_view: Number(item.can_view) === 1,
              can_add: Number(item.can_add) === 1,
              can_edit: Number(item.can_edit) === 1,
              can_delete: Number(item.can_delete) === 1,
            };
          }
        });
      }

      setPermissions(permissionData);
    } catch (error) {
      console.error("Permission Load Error:", error);
      setMessage("Permission load করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE PERMISSION
  // =====================================================

  const handlePermissionChange = (
    permission,
    action
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [action]: !prev[permission]?.[action],
      },
    }));
  };

  // =====================================================
  // SELECT ALL FOR ONE ROW
  // =====================================================

  const handleSelectAll = (permission) => {
    const current = permissions[permission];

    const allSelected =
      current?.can_view &&
      current?.can_add &&
      current?.can_edit &&
      current?.can_delete;

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

  // =====================================================
  // SELECT ALL
  // =====================================================

  const handleSelectAllPermissions = () => {
    const allSelected = PERMISSIONS.every((item) => {
      const permission = permissions[item.key];

      return (
        permission?.can_view &&
        permission?.can_add &&
        permission?.can_edit &&
        permission?.can_delete
      );
    });

    const newValue = !allSelected;

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

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    if (!teacher?.teacher_id) {
      setMessage("Teacher পাওয়া যায়নি।");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const permissionList = PERMISSIONS.map(
        (item) => ({
          permission: item.key,
          can_view: permissions[item.key]?.can_view
            ? 1
            : 0,
          can_add: permissions[item.key]?.can_add
            ? 1
            : 0,
          can_edit: permissions[item.key]?.can_edit
            ? 1
            : 0,
          can_delete: permissions[item.key]?.can_delete
            ? 1
            : 0,
        })
      );

      const response = await fetch(
        `${API_BASE_URL}/user_permissions_save.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id: teacher.teacher_id,
            permissions: permissionList,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Permissions successfully saved."
        );

        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setMessage(
          data.message ||
            "Permission save করা যায়নি।"
        );
      }
    } catch (error) {
      console.error(
        "Permission Save Error:",
        error
      );

      setMessage(
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // MODAL
  // =====================================================

  return (
    <div
      className="permission-modal-overlay"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="permission-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="permission-modal-header">
          <div>
            <h2>Manage Permissions</h2>

            <p>
              {teacher?.name_en ||
                teacher?.name_bn}
            </p>

            <span>
              ID: {teacher?.teacher_id}
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
              {/* SELECT ALL */}

              <div className="permission-toolbar">
                <button
                  type="button"
                  onClick={
                    handleSelectAllPermissions
                  }
                  className="permission-select-all"
                >
                  Select / Unselect All
                </button>
              </div>

              {/* TABLE */}

              <div className="permission-table-wrapper">
                <table className="permission-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>View</th>
                      <th>Add</th>
                      <th>Edit</th>
                      <th>Delete</th>
                      <th>All</th>
                    </tr>
                  </thead>

                  <tbody>
                    {PERMISSIONS.map(
                      (item) => {
                        const current =
                          permissions[
                            item.key
                          ] ||
                          DEFAULT_PERMISSION;

                        const allSelected =
                          current.can_view &&
                          current.can_add &&
                          current.can_edit &&
                          current.can_delete;

                        return (
                          <tr
                            key={item.key}
                          >
                            <td className="permission-module">
                              {item.label}
                            </td>

                            {/* VIEW */}

                            <td>
                              <label className="permission-checkbox">
                                <input
                                  type="checkbox"
                                  checked={
                                    current.can_view
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      item.key,
                                      "can_view"
                                    )
                                  }
                                />
                                <span />
                              </label>
                            </td>

                            {/* ADD */}

                            <td>
                              <label className="permission-checkbox">
                                <input
                                  type="checkbox"
                                  checked={
                                    current.can_add
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      item.key,
                                      "can_add"
                                    )
                                  }
                                />
                                <span />
                              </label>
                            </td>

                            {/* EDIT */}

                            <td>
                              <label className="permission-checkbox">
                                <input
                                  type="checkbox"
                                  checked={
                                    current.can_edit
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      item.key,
                                      "can_edit"
                                    )
                                  }
                                />
                                <span />
                              </label>
                            </td>

                            {/* DELETE */}

                            <td>
                              <label className="permission-checkbox">
                                <input
                                  type="checkbox"
                                  checked={
                                    current.can_delete
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      item.key,
                                      "can_delete"
                                    )
                                  }
                                />
                                <span />
                              </label>
                            </td>

                            {/* ALL */}

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

          {/* MESSAGE */}

          {message && (
            <div
              className={`permission-message ${
                message.includes(
                  "successfully"
                )
                  ? "success"
                  : "error"
              }`}
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
            disabled={loading || saving}
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