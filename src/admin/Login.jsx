import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE_URL =
  "http://localhost/sunshine-api/api";

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

      setError(
        "Username দিন।"
      );

      return;
    }


    if (!password) {

      setError(
        "Password দিন।"
      );

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

            body:
              JSON.stringify({
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

      } catch {

        console.error(
          "Login raw response:",
          text
        );

        throw new Error(
          "Server থেকে সঠিক JSON response পাওয়া যায়নি।"
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
      ADMIN FULL ACCESS
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
        role === "superadmin";


      /*
      =================================================
      NORMALIZE PERMISSIONS
      =================================================
      */

      let permissions =
        Array.isArray(
          user.permissions
        )
          ? user.permissions
          : [];


      /*
      ADMIN = FULL ACCESS
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
      SAVE USER
      =================================================
      */

      const loggedInUser = {

        id:
          user.id,

        admin_id:
          user.id,

        user_id:
          user.id,

        username:
          user.username || "",

        full_name:
          user.full_name || "",

        teacher_id:
          user.teacher_id || null,

        role:
          user.role || "",

        status:
          user.status,

        photo:
          user.photo || null,

        permissions:
          permissions

      };


      /*
      =================================================
      LOCAL STORAGE
      =================================================
      */

      localStorage.setItem(
        "sunshine_user",
        JSON.stringify(
          loggedInUser
        )
      );


      /*
      =================================================
      BACKWARD COMPATIBILITY
      =================================================
      */

      localStorage.setItem(
        "admin",
        JSON.stringify(
          loggedInUser
        )
      );


      localStorage.setItem(
        "user",
        JSON.stringify(
          loggedInUser
        )
      );


      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
          loggedInUser
        )
      );


      localStorage.setItem(
        "admin_id",
        String(
          user.id
        )
      );


      localStorage.setItem(
        "user_id",
        String(
          user.id
        )
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

              value={
                username
              }

              onChange={
                e =>
                  setUsername(
                    e.target.value
                  )
              }

              autoComplete="username"

              disabled={
                loading
              }

              placeholder="Enter username"
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"

              value={
                password
              }

              onChange={
                e =>
                  setPassword(
                    e.target.value
                  )
              }

              autoComplete="current-password"

              disabled={
                loading
              }

              placeholder="Enter password"
            />

          </div>


          <button
            type="submit"

            disabled={
              loading
            }

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