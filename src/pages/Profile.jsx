import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem("vmp_token");

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Todos os campos sao obrigatorios" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "A nova password nao coincide com a confirmacao" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova password deve ter pelo menos 6 caracteres" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://vmp-server.onrender.com/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar password");
      }

      setMessage({ type: "success", text: "Password alterada com sucesso! Faca login novamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        localStorage.removeItem("vmp_token");
        localStorage.removeItem("vmp_admin_role");
        navigate("/");
      }, 2000);

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Perfil do Administrador</h2>
      <p style={{ color: "#666" }}>Alterar a senha de acesso ao painel</p>

      {message && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 6,
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Password Atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
            placeholder="Digite a password atual"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Nova Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
            placeholder="Minimo 6 caracteres"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Confirmar Nova Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
            placeholder="Repita a nova password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            backgroundColor: loading ? "#666" : "#1565C0",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {loading ? "A alterar..." : "Alterar Password"}
        </button>
      </form>
    </div>
  );
}