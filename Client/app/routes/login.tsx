import { useState } from "react";
import { useNavigate, Link, redirect } from "react-router";
import { authClient, signIn } from "../lib/auth-client";

export async function clientLoader() {
  const session = await authClient.getSession();
  if (session.data) throw redirect("/");
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn.email({ email, password });
    if (error) setError(error.message ?? "Login failed");
    else navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <p>No account? <Link to="/register">Register</Link></p>
    </form>
  );
}