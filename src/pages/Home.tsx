import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import "./Home.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");

  const navigate = useNavigate();
  const { setUser, logout, setGuest } = useUserStore();

  //  Register
  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("username", username);
        setUser(username, data.token || "");
        setMessage("Account created successfully!");
        setMessageType("success");
        navigate("/channels");
      } else {
        setMessage(data.error || "Registration failed.");
        setMessageType("error");
      }
    } catch {
      setMessage("Server connection failed during registration.");
      setMessageType("error");
    }
  };

  //  Login
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("username", username);
        setUser(username, data.token || "");
        setMessage("Logged in successfully!");
        setMessageType("success");
        navigate("/channels");
      } else {
        setMessage(data.error || "Incorrect username or password.");
        setMessageType("error");
      }
    } catch {
      setMessage("Server connection failed during login.");
      setMessageType("error");
    }
  };

  //  Guest
  const handleGuest = () => {
    logout();
    setGuest(true);
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setMessage("Continuing as guest...");
    setMessageType("success");
    navigate("/channels");
  };

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h2 className="home-title">Welcome to Chappy</h2>

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

        <button className="home-guest" onClick={handleGuest}>
          Continue as a guest
        </button>

        {message && <p className={`home-message ${messageType}`}>{message}</p>}
      </div>
    </div>
  );
}
