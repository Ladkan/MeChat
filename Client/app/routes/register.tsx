import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { signUp } from "../lib/auth-client";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });
    if (error) setError(error.message ?? "Registration failed");
    else navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}