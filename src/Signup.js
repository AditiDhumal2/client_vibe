import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/home"))
      .catch((error) => alert(error.message));
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>🎶 Create Your Vibe 🎶</h2>
        <form onSubmit={handleSignup}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
        <p onClick={() => navigate("/")} className="switch-auth">Already have an account? Login</p>
      </div>
      <div className="animated-bg"></div>
    </div>
  );
}

export default Signup;
