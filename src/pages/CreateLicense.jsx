import { useState } from "react";
import API from "../api/client";

// Planos definidos localmente (sincronizar com vmp_license_server/billing/plans.js)
const PLANS = {
  basic: {
    code: "basic",
    name: "Basic",
    price: 1350,
    days: 30,
    maxUsers: 10,      // Atualizado para 10
    maxProducts: 500,
    features: ["pos", "inventory", "cash_register", "basic_reports", "z_report"],
    description: "Ideal para pequenos negocios e bancas",
  },
  pro: {
    code: "pro",
    name: "Pro",
    price: 2700,
    days: 30,
    maxUsers: 30,      // Atualizado para 30
    maxProducts: 5000,
    features: [
      "pos",
      "inventory",
      "cash_register",
      "advanced_reports",
      "z_report",
      "promotions",
      "customers",
      "multi_warehouse",
      "analytics",
    ],
    description: "Para lojas em crescimento",
  },
  enterprise: {
    code: "enterprise",
    name: "Enterprise",
    price: 4900,
    days: 30,          // CORRIGIDO: De 365 para 30
    maxUsers: 999,     // Mantido em 999
    maxProducts: 99999,
    features: [
      "pos",
      "inventory",
      "cash_register",
      "advanced_reports",
      "z_report",
      "promotions",
      "customers",
      "multi_warehouse",
      "analytics",
      "accounting",
      "profit_margin",
      "remote_dashboard",
      "priority_support",
      "api_access",
    ],
    description: "Para cadeias e grandes estabelecimentos",
  },
};

export default function CreateLicense() {
  const [machineId, setMachineId] = useState("");
  const [client, setClient] = useState("");
  const [plan, setPlan] = useState("enterprise");
  const [days, setDays] = useState(30); // Atualizado para 30

  const [license, setLicense] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ADIÇÃO: Verificação de permissão para esconder o formulário de escrita
  const role = (localStorage.getItem('vmp_role') || '').toLowerCase().replace(/[\s_-]/g, '');
  const isAdmin = role === 'admin' || role === 'superadmin';

  async function generate() {
    try {
      setLoading(true);
      setError("");
      setLicense("");
      setSubscription(null);

      const res = await API.post("/license/generate", {
        machineId,
        client,
        plan,
        days,
      });

      setLicense(res.data.license);
      if (res.data.subscription) {
        setSubscription(res.data.subscription);
      }
    } catch (e) {
      setError("Erro ao gerar licença");
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = PLANS[plan];

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 28, color: "#f0f6fc" }}>Criar Licença</h2>

      {/* ADIÇÃO: Formulário apenas para administradores */}
      {isAdmin ? (
        <>
      <input
        placeholder="Machine ID"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        style={{
          display: "block",
          marginBottom: 16,
          padding: "12px 14px",
          width: "100%",
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          border: "1px solid #30363d",
          borderRadius: 8,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      />

      <input
        placeholder="Cliente / Email"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        style={{
          display: "block",
          marginBottom: 16,
          padding: "12px 14px",
          width: "100%",
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          border: "1px solid #30363d",
          borderRadius: 8,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      />

      <select
        value={plan}
        onChange={(e) => {
          const p = e.target.value;
          setPlan(p);
          setDays(PLANS[p]?.days || 30);
        }}
        style={{
          display: "block",
          marginBottom: 16,
          padding: "12px 14px",
          width: "100%",
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          border: "1px solid #30363d",
          borderRadius: 8,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      >
        <option value="basic">Basic (1,350 MZN/mês)</option>
        <option value="pro">Pro (2,700 MZN/mês)</option>
        <option value="enterprise">Enterprise (4,900 MZN/mês)</option>
      </select>

      <input
        type="number"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        style={{
          display: "block",
          marginBottom: 16,
          padding: "12px 14px",
          width: "100%",
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          border: "1px solid #30363d",
          borderRadius: 8,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      />

      {selectedPlan && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: "#151b2e",
            color: "#f0f6fc",
            borderRadius: 8,
            fontSize: 14,
            border: "1px solid #21262d"
          }}
        >
          <strong style={{ textTransform: "uppercase", color: "#4fc3f7" }}>
            {selectedPlan.name}
          </strong> 
          {" — "}
          <span style={{ color: "#b0b3b8" }}>
            {selectedPlan.price.toLocaleString("pt-PT")} MZN
          </span>
          <br />
          <span style={{ color: "#b0b3b8" }}>{selectedPlan.description}</span>
          <br />
          <span style={{ color: "#b0b3b8", fontSize: 12 }}>
            Max {selectedPlan.maxUsers} utilizadores, {selectedPlan.maxProducts} produtos
          </span>
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        style={{
          padding: "10px 24px",
          backgroundColor: "#1a237e",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 500,
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? "A gerar..." : "Gerar Licença"}
      </button>

      {error && (
        <p style={{ color: "#ef5350", marginTop: 16 }}>
          {error}
        </p>
      )}

      {subscription && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "rgba(46, 125, 50, 0.2)",
            color: "#f0f6fc",
            borderRadius: 8,
            border: "1px solid #2e7d32"
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: 16, color: "#81c784" }}>
            ✅ Subscrição criada:
          </h4>
          <p style={{ margin: "4px 0" }}>
            <strong>ID:</strong> <span style={{ fontFamily: "monospace", color: "#b0b3b8" }}>{subscription.id}</span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Plano:</strong> <span style={{ textTransform: "uppercase", color: "#4fc3f7" }}>{subscription.plan}</span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Status:</strong> {subscription.status}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Validade:</strong> {new Date(subscription.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {license && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: "0 0 8px", color: "#f0f6fc" }}>Licença gerada:</h3>
          <textarea
            value={license}
            readOnly
            style={{
              width: "100%",
              height: 120,
              padding: 12,
              backgroundColor: "#0d1117",
              color: "#4fc3f7",
              border: "1px solid #30363d",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 14,
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
        </div>
      )}
        </>
      ) : (
        <div style={{ padding: 20, backgroundColor: "#1a2236", borderRadius: 8, color: "#b0b3b8" }}>
          Acesso negado. Apenas administradores podem criar novas licenças.
        </div>
      )}
    </div>
  );
}