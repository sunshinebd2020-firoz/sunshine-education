import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { isProtectedAdministrator } from "./protectedAdmins";
import API_BASE_URL from "../config/api";
import { clearAuthStorage } from "./authStorage";

export default function Login() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showForgotModal, setShowForgotModal] =
    useState(false);

  const [forgotUsername, setForgotUsername] =
    useState("");

  const [forgotTeacherId, setForgotTeacherId] =
    useState("");

  const [forgotNewPassword, setForgotNewPassword] =
    useState("");

  const [forgotConfirmPassword, setForgotConfirmPassword] =
    useState("");

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [forgotError, setForgotError] =
    useState("");

  const [forgotSuccess, setForgotSuccess] =
    useState("");

  const resetForgotForm = () => {
    setForgotUsername("");
    setForgotTeacherId("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError("");
  };

  const openForgotPassword = () => {
    setForgotError("");
    setForgotSuccess("");
    resetForgotForm();
    setShowForgotModal(true);
  };

  const closeForgotPassword = () => {
    if (forgotLoading) return;

    setShowForgotModal(false);
    setForgotError("");
    setForgotSuccess("");
    resetForgotForm();
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();

    if (!forgotUsername.trim()) {
      setForgotError("Username is required.");
      return;
    }

    if (!forgotTeacherId.trim()) {
      setForgotError("Teacher ID is required.");
      return;
    }

    if (!forgotNewPassword) {
      setForgotError("Please enter a new password.");
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotSuccess("");

      const response =
        await fetch(
          `${API_BASE_URL}/reset_user_password.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              mode: "forgot",
              username: forgotUsername.trim(),
              teacher_id: forgotTeacherId.trim(),
              new_password: forgotNewPassword,
              confirm_password: forgotConfirmPassword
            })
          }
        );

      const text = await response.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server response was invalid.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      setForgotSuccess("Password reset successfully. You can now log in with your new password.");
      resetForgotForm();

      window.setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess("");
      }, 1500);
    } catch (err) {
      setForgotError(err.message || "Password reset failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  /*
  =====================================================
  LOGIN
  =====================================================
  */

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Username দিন।");
      return;
    }

    if (!password) {
      setError("Password দিন।");
      return;
    }

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/login.php`,
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json"
            },

            body: JSON.stringify({
              username:
                username.trim(),

              password:
                password
            })
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

      } catch (jsonError) {

        console.error(
          "Login raw response:",
          text
        );

        throw new Error(
          "Server থেকে সঠিক JSON response পাওয়া যায়নি।",
          { cause: jsonError }
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Login failed."
        );
      }

      /*
      =================================================
      USER DATA
      =================================================
      */

      const user =
        data.user || {};

      /*
      =================================================
      ROLE
      =================================================
      */

      const role =
        String(
          user.role || ""
        )
          .trim()
          .toLowerCase();

      const isAdministrator =
        role === "admin" ||
        role === "administrator" ||
        role === "super admin" ||
        role === "superadmin" ||
        isProtectedAdministrator(user);

      const isTeacherAccount =
        role === "teacher" &&
        Boolean(String(user.teacher_id || "").trim());

      /*
      =================================================
      BRANCH
      =================================================
      */

      const branch =
        String(
          user.branch ||
          user.branch_name ||
          ""
        ).trim();

      /*
      =================================================
      TEACHER ID
      =================================================
      */

      const teacherId =
        user.teacher_id
          ? String(
              user.teacher_id
            ).trim()
          : "";

      /*
      =================================================
      PERMISSIONS
      =================================================
      */

      let permissions =
        Array.isArray(
          user.permissions
        )
          ? user.permissions
          : [];

      /*
      =================================================
      ADMIN FULL ACCESS
      =================================================
      */

      if (isAdministrator) {

        permissions = [
          {
            permission: "all",
            can_view: true,
            can_add: true,
            can_edit: true,
            can_delete: true
          }
        ];
      }

      /*
      =================================================
      LOGGED USER
      =================================================
      */

      const loggedInUser = {

        id:
          user.id,

        admin_id:
          user.admin_id ||
          user.id,

        user_id:
          user.user_id ||
          user.id,

        username:
          user.username || "",

        full_name:
          user.full_name || "",

        teacher_id:
          teacherId || null,

        branch:
          branch,

        branch_name:
          branch,

          branch_scope:
            user.branch_scope === "all"
              ? "all"
              : "own",

        role:
          isProtectedAdministrator(user)
            ? "Administrator"
            : user.role || "",

        status:
          user.status,

        photo:
          user.photo || null,

        is_admin:
          isAdministrator,

        permissions:
          permissions
      };

      /*
      =================================================
      LOCAL STORAGE
      =================================================
      */

      const authState = {
        sunshine_user: loggedInUser,
        admin: loggedInUser,
        user: loggedInUser,
        loggedInUser,
        admin_id: String(loggedInUser.admin_id || loggedInUser.user_id || ""),
        user_id: String(loggedInUser.user_id || loggedInUser.admin_id || ""),
      };

      Object.entries(authState).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          localStorage.removeItem(key);
          return;
        }

        localStorage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      });

      /*
      =================================================
      TEACHER BRANCH STORAGE
      =================================================
      */

      if (!isAdministrator && branch) {

        localStorage.setItem(
          "teacher_branch",
          branch
        );

      } else {

        localStorage.removeItem(
          "teacher_branch"
        );
      }

      localStorage.setItem(
        "sunshine_logged_in",
        "1"
      );

      /*
      =================================================
      ADMIN FLAG
      =================================================
      */

      localStorage.setItem(
        "is_admin",
        isAdministrator
          ? "1"
          : "0"
      );

      /*
      =================================================
      REDIRECT
      =================================================
      */

      navigate(
        isTeacherAccount
          ? "/admin/my-classroom"
          : "/admin/dashboard",
        {
          replace: true
        }
      );

    } catch (err) {

      clearAuthStorage();

      console.error(
        "Login Error:",
        err
      );

      setError(
        err.message ||
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
      );

    } finally {

      setLoading(false);
    }
  };

  /*
  =====================================================
  RETURN
  =====================================================
  */

  return (

    <div className="login-container">

      <div className="login-card">

        <div className="login-header">

          <h1>
            Admin Login
          </h1>

          <p>
            Sunshine Education
          </p>

        </div>

        {error && (

          <div className="login-error">
            {error}
          </div>

        )}

        <form
          onSubmit={
            handleLogin
          }
          className="login-form"
        >

          <div className="form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              autoComplete="username"
              disabled={loading}
              placeholder="Enter username"
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
              disabled={loading}
              placeholder="Enter password"
            />

          </div>

          <div className="login-options">
            <button
              type="button"
              className="login-forgot-link"
              onClick={openForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

      </div>

      {showForgotModal && (
        <div
          className="login-modal-overlay"
          onClick={() => closeForgotPassword()}
        >
          <div
            className="login-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="login-modal-header">
              <div>
                <h2>Reset Password</h2>
                <p>Use your username and teacher ID to confirm your account.</p>
              </div>

              <button
                type="button"
                className="login-modal-close"
                onClick={closeForgotPassword}
                disabled={forgotLoading}
              >
                ×
              </button>
            </div>

            {forgotError && (
              <div className="login-error">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="login-success">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(event) => setForgotUsername(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={forgotLoading}
                />
              </div>

              <div className="form-group">
                <label>Teacher ID</label>
                <input
                  type="text"
                  value={forgotTeacherId}
                  onChange={(event) => setForgotTeacherId(event.target.value)}
                  placeholder="Enter your teacher ID"
                  autoComplete="off"
                  disabled={forgotLoading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(event) => setForgotNewPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={forgotLoading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(event) => setForgotConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={forgotLoading}
                />
              </div>

              <div className="login-modal-actions">
                <button
                  type="button"
                  className="login-secondary-button"
                  onClick={closeForgotPassword}
                  disabled={forgotLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="login-button"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
