import { useCallback, useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import PermissionModal from "./teachers/PermissionModal";
import { isProtectedAdministrator } from "../protectedAdmins";
import "./AdminUsers.css";

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("sunshine_user") || "null");
  } catch {
    return null;
  }
};

const getUserId = (user) => String(user?.id || user?.admin_id || user?.user_id || "").trim();

const isAdministrator = (user) => ["admin", "administrator", "super admin", "superadmin"].includes(
  String(user?.role || user?.user_role || "").trim().toLowerCase(),
);

const canManageUsers = (user) => {
  if (isAdministrator(user)) return true;
  const settingPermission = (user?.permissions || []).find(
    (item) => String(item?.permission || item?.module || "").trim().toLowerCase() === "setting",
  );
  return Boolean(settingPermission?.can_add || settingPermission?.can_edit);
};

export default function AdminUsers() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserId = getUserId(currentUser);
  const hasAccess = canManageUsers(currentUser);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(hasAccess);

  const loadUsers = useCallback(async () => {
    if (!hasAccess) return;
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/teacher_list.php`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Users could not be loaded.");
      setUsers((data.teachers || []).filter((user) => user.user_created));
    } catch (error) {
      setUsers([]);
      setMessage(error.message || "Users could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [hasAccess]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  if (!hasAccess) return <div className="admin-users-page"><div className="admin-users-notice" role="alert">আপনার User Access Management করার অনুমতি নেই।</div></div>;

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div><h1>User Access Management</h1><p>Manage user permissions and branch access separately from the teacher list.</p></div>
        <button type="button" className="admin-users-refresh" onClick={loadUsers} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
      </div>
      {message && <p className="admin-users-error">{message}</p>}
      <div className="admin-users-table-wrap">
        <table className="admin-users-table">
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Branch</th><th>Access</th></tr></thead>
          <tbody>
            {users.map((user) => {
              const userId = String(user.admin_id || user.user_id || "");
              const isCurrentUser = userId && userId === currentUserId;
              const isProtectedAdmin = isProtectedAdministrator(user);
              return <tr key={userId || user.teacher_id}><td>{user.name_en || user.name_bn || "N/A"}</td><td>{user.username || "N/A"}</td><td>{isProtectedAdmin ? "Administrator" : user.role || user.user_role || "Teacher"}</td><td>{user.branch || "N/A"}</td><td>{isProtectedAdmin ? <span className="admin-users-protected">Protected administrator</span> : isCurrentUser ? <span className="admin-users-self">Current user</span> : <button type="button" onClick={() => setSelectedUser({ ...user, admin_id: userId, user_id: userId })} disabled={!userId}>Manage access</button>}</td></tr>;
            })}
          </tbody>
        </table>
        {!loading && !users.length && <p className="admin-users-empty">No user accounts found.</p>}
      </div>
      {selectedUser && <PermissionModal teacher={selectedUser} onClose={() => setSelectedUser(null)} onSaved={() => setSelectedUser(null)} />}
    </div>
  );
}
