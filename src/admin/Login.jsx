import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!username.trim() || !password) {
      setMessage("Username and password are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("password", password);

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/sunshine-api/api/login.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {

        // ==========================================
        // USER INFORMATION SAVE
        // ==========================================

        localStorage.setItem(
          "sunshine_user",
          JSON.stringify(data.user)
        );

        // Login status
        localStorage.setItem(
          "sunshine_logged_in",
          "true"
        );

        // ==========================================
        // Dashboard
        // ==========================================

        navigate("/admin/dashboard");

      } else {

        setMessage(
          data.message || "Login failed."
        );

      }

    } catch (error) {

      console.error("Login Error:", error);

      setMessage(
        "Server connection failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Admin Login</h1>

        <p>
          Sunshine Education Admin Panel
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoComplete="username"
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}