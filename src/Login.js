import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/home"))
      .catch((error) => alert(error.message));
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then(() => navigate("/home"))
      .catch((error) => alert(error.message));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🎵 Vibe In 🎵</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        <p>or</p>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="google-icon" /> Sign in with Google
        </button>
        <p onClick={() => navigate("/signup")} className="switch-auth">Don't have an account? Sign Up</p>
      </div>
      <div className="animated-bg"></div>
    </div>
  );
}

export default Login;


