import { useEffect, useState } from "react";
import "./PermissionModal.css";

const API_BASE_URL = "http://localhost/sunshine-api/api";

const PERMISSION_LIST = [
  "Dashboard",
  "Students",
  "Teachers",
  "Courses",
  "Branch",
  "Income",
  "Expense",
  "Income & Expense Report",
  "User Management",
];

const EMPTY_PERMISSION = {
  can_view: false,
  can_add: false,
  can_edit: false,
  can_delete: false,
};

export default function PermissionModal({
  teacher,
  onClose,
  onSaved,
}) {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!teacher?.user_id) {
      setLoading(false);
      return;
    }

    fetch(
      `${API_BASE_URL}/permission_get.php?admin_id=${teacher.user_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const permissionObject = {};

          PERMISSION_LIST.forEach((name) => {
            permissionObject[name] = {
              ...EMPTY_PERMISSION,
            };
          });

          (data.permissions || []).forEach((item) => {
            permissionObject[item.permission] = {
              can_view: !!item.can_view,
              can_add: !!item.can_add,
              can_edit: !!item.can_edit,
              can_delete: !!item.can_delete,
            };
          });

          setPermissions(permissionObject);
        } else {
          setMessage(
            data.message || "Permission load failed."
          );
        }
      })
      .catch((error) => {
        console.error("Permission Load Error:", error);
        setMessage("Server connection failed.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teacher]);

  const handleChange = (
    permissionName,
    action
  ) => {
    setPermissions((prev) => ({
      ...prev,

      [permissionName]: {
        ...(prev[permissionName] || EMPTY_PERMISSION),

        [action]:
          !(
            prev[permissionName]?.[action] || false
          ),
      },
    }));
  };

  const handleSave = async () => {
    if (!teacher?.user_id) {
      setMessage(
        "This Teacher does not have a User account."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const permissionData =
      PERMISSION_LIST.map((name) => ({
        permission: name,

        can_view:
          !!permissions[name]?.can_view,

        can_add:
          !!permissions[name]?.can_add,

        can_edit:
          !!permissions[name]?.can_edit,

        can_delete:
          !!permissions[name]?.can_delete,
      }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/permission_save.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            admin_id: teacher.user_id,
            permissions: permissionData,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Permissions saved successfully."
        );

        if (onSaved) {
          onSaved();
        }

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setMessage(
          data.message ||
            "Failed to save permissions."
        );
      }
    } catch (error) {
      console.error(
        "Permission Save Error:",
        error
      );

      setMessage(
        "Server connection failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!teacher) {
    return null;
  }

  return (
    <div
      className="permission-overlay"
      onClick={onClose}
    >
      <div
        className="permission-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="permission-header">
          <div>
            <h2>User Permission</h2>

            <p>
              {teacher.name_en ||
                teacher.name_bn ||
                "Teacher"}
            </p>
          </div>

          <button
            className="permission-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* User Information */}
        <div className="permission-user-info">
          <div>
            <span>Teacher ID</span>
            <strong>
              {teacher.teacher_id || "N/A"}
            </strong>
          </div>

          <div>
            <span>Username</span>
            <strong>
              {teacher.username || "N/A"}
            </strong>
          </div>

          <div>
            <span>Role</span>
            <strong>
              {teacher.role || "Teacher"}
            </strong>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="permission-loading">
            Loading permissions...
          </div>
        ) : (
          <>
            <div className="permission-table-wrapper">
              <table className="permission-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>View</th>
                    <th>Add</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {PERMISSION_LIST.map(
                    (name) => (
                      <tr key={name}>
                        <td className="module-name">
                          {name}
                        </td>

                        {[
                          "can_view",
                          "can_add",
                          "can_edit",
                          "can_delete",
                        ].map((action) => (
                          <td key={action}>
                            <label className="permission-checkbox">
                              <input
                                type="checkbox"
                                checked={
                                  !!permissions[
                                    name
                                  ]?.[action]
                                }
                                onChange={() =>
                                  handleChange(
                                    name,
                                    action
                                  )
                                }
                              />

                              <span></span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Message */}
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

            {/* Footer */}
            <div className="permission-footer">
              <button
                type="button"
                className="permission-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="permission-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Permission"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}