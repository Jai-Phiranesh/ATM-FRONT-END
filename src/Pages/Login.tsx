import React, { useState } from "react";
import "../Styles/Login.css";
import { loginUser } from "../service/api";

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

type Props = {
  onLogin: (user: User) => void;
  onAdminLogin?: (admin: any) => void;
};

const Login: React.FC<Props> = ({ onLogin, onAdminLogin }) => {
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const validateMobile = (num: string) => {
    // Validates Indian mobile numbers: starts with 6-9, 10 digits
    return /^[6-9]\d{9}$/.test(num);
  };

  const validatePin = (pin: string) => {
    return /^\d{6}$/.test(pin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMobile(mobile)) {
      setMessage("Enter a valid Indian mobile number (starts with 6-9, 10 digits)");
      return;
    }
    if (!validatePin(pin)) {
      setMessage("Enter a valid 6-digit PIN");
      return;
    }
    try {
      const result = await loginUser(mobile, pin);
      // Debug: Show result in message for troubleshooting
      setMessage("Login result: " + JSON.stringify(result));
      setTimeout(() => setMessage(""), 2000);
      // Check for admin by presence of admin-specific property (e.g., admin id or type)
      if (result && (result.role === "admin" || result.hasOwnProperty("adminName") || result.hasOwnProperty("isAdmin")) && typeof onAdminLogin === "function") {
        onAdminLogin(result);
      } else {
        onLogin(result);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Server error");
      }
    }
  };

  return (
    <div className="login-container">
      <h1>ATM</h1>
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            maxLength={10}
            required
          />
          <input
            type="password"
            placeholder="6-digit PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
