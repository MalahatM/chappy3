import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import "./Home.css";

export default function Home() {
	 // Local States
  const [username, setUsername] = useState("");// stores input username
  const [password, setPassword] = useState("");// stores input password
  const [message, setMessage] = useState("");// feedback message text
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">(""); // feedback message type for styling

    // Router navigation
  const navigate = useNavigate();

  const { setUser, logout } = useUserStore();
 // Register new user
  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
	 // Save user info to Zustand and localStorage
      if (res.ok) {
        setUser(username, data.token || "");
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("username", username);
		  // Set feedback message
        setMessage("Account created successfully!");
        setMessageType("success");
		 // Redirect user to channels page
        navigate("/channels");
      } else {
		// Handle registration failure
        setMessage(data.error || "Registration failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error during registration.");
      setMessageType("error");
    }
  };
  // Login existing user

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
	   // Save user info and token
      if (res.ok) {
        setUser(username, data.token || "");
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("username", username);
        setMessage("Logged in successfully!");
        setMessageType("success");
		 // Redirect after login
        navigate("/channels");
      } else {
		// Handle login failure
        setMessage(data.error || "Login failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error during login.");
      setMessageType("error");
    }
  };
 // Delete user account
  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
	 // If no token → not logged in
    if (!token) {
      setMessage("You must be logged in to delete your account.");
      setMessageType("warning");
      return;
    }

    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
		 // Clear user info and logout
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        logout();
        setMessage("Account deleted successfully!");
        setMessageType("success");
      } else {
		// Handle deletion failure
        setMessage("Failed to delete account.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error during deletion.");
      setMessageType("error");
    }
  };
// Continue as guest user
  const handleGuest = () => {
	// Clear any existing user info
    logout();
	   // Display guest feedback
    setMessage("Continue as guest");
    setMessageType("success");
	   // Redirect to channels
    navigate("/channels");
  };
//JSX Layout
  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h2 className="home-title">Welcome to Chapy</h2>

        <input
          type="text"
          placeholder="username"
          className="home-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          className="home-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="home-btn-row">
          <button className="btn btn-login" onClick={handleLogin}>
            Log in
          </button>
          <button className="btn btn-register" onClick={handleRegister}>
            Register
          </button>
        </div>

        <button className="btn btn-delete" onClick={handleDelete}>
          Delete account
        </button>

        <button className="home-guest" onClick={handleGuest}>
          Continue as a guest
        </button>

 
        {message && <p className={`home-message ${messageType}`}>{message}</p>}
      </div>
    </div>
  );
}
