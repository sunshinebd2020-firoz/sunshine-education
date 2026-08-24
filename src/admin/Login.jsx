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
        "/admin/dashboard",
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

    </div>
  );
}
