import { useState } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function login() {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (!res.data?.token) {
        setError("Resposta inválida do servidor");
        return;
      }

      localStorage.setItem("vmp_token", res.data.token);
      localStorage.setItem("vmp_role", res.data.role || "admin");

      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      if (err.response?.status === 401) {
        setError("Credenciais inválidas");
      } else {
        setError("Erro de conexão com servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Login</h2>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "A entrar..." : "Login"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}