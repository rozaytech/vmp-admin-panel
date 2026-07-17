import { useEffect, useState } from "react";
import API from "../api/client";

// Planos definidos localmente (sincronizar com vmp_license_server/billing/plans.js)
const PLANS = {
  basic: {
    code: "basic",
    name: "Basic",
    price: 3500,
    days: 30,
    maxUsers: 2,
    maxProducts: 500,
    features: ["pos", "inventory", "cash_register", "basic_reports", "z_report"],
    description: "Ideal para pequenos negocios e bancas",
  },
  pro: {
    code: "pro",
    name: "Pro",
    price: 7000,
    days: 30,
    maxUsers: 5,
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
    price: 150000,
    days: 365,
    maxUsers: 999,
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

export default function Billing() {
  const [stats, setStats] = useState(null);
  const [subs, setSubs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const [form, setForm] = useState({
    client: "",
    email: "",
    plan: "basic",
    days: 30,
  });

  useEffect(() => {
    load();
  }, [period]);

  async function load() {
    setLoading(true);
    try {
      const [statsRes, subsRes, paymentsRes] = await Promise.all([
        API.get("/billing/stats"),
        API.get("/billing/subscriptions"),
        API.get("/billing/payments"),
      ]);

      setStats(statsRes.data.data);
      setSubs(subsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.client || !form.plan) {
      alert("Cliente e plano sao obrigatorios");
      return;
    }

    try {
      await API.post("/billing/create", {
        client: form.client,
        email: form.email,
        plan: form.plan,
        days: form.days,
      });
      alert("Subscricao criada com sucesso!");
      setForm({ client: "", email: "", plan: "basic", days: 30 });
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  async function simulatePay(id) {
    const plan = subs.find((s) => s.id === id)?.plan;
    const amount = PLANS[plan]?.price || 3500;

    try {
      await API.post("/billing/pay", {
        subscriptionId: id,
        amount,
        provider: "manual",
      });
      alert("Pagamento simulado com sucesso!");
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  // Calcular receita do periodo
  const filteredPayments = payments.filter((p) => {
    if (period === "all") return true;
    const pDate = new Date(p.created_at);
    const now = new Date();
    if (period === "today") {
      return pDate.toDateString() === now.toDateString();
    }
    if (period === "week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return pDate >= weekAgo;
    }
    if (period === "month") {
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const periodRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const planColors = {
    basic: "#4caf50",
    pro: "#9c27b0",
    enterprise: "#1976d2",
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 600 }}>
        Faturacao
      </h1>

      {/* KPIs */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            {
              label: "Total Subscricoes",
              value: stats.total,
              color: "#1976d2",
            },
            {
              label: "Ativas",
              value: stats.active,
              color: "#4caf50",
            },
            {
              label: "Pagas",
              value: stats.paid,
              color: "#009688",
            },
            {
              label: "Receita Total",
              value: `${(stats.revenue || 0).toFixed(2)} MZN`,
              color: "#ff9800",
            },
            {
              label: "Receita (periodo)",
              value: `${periodRevenue.toFixed(2)} MZN`,
              color: "#e91e63",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${card.color}`,
              }}
            >
              <div style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>
                {card.label}
              </div>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: card.color }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtro de periodo */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 500, marginRight: 12 }}>
          Periodo:
        </span>
        {[
          { key: "all", label: "Todo" },
          { key: "today", label: "Hoje" },
          { key: "week", label: "Esta semana" },
          { key: "month", label: "Este mes" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "8px 16px",
              marginRight: 8,
              borderRadius: 6,
              border: "none",
              background: period === p.key ? "#16213e" : "#e0e0e0",
              color: period === p.key ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Criar subscricao */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>
          Criar Nova Subscricao
        </h3>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Cliente *"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              minWidth: 200,
            }}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              minWidth: 200,
            }}
          />
          <select
            value={form.plan}
            onChange={(e) => {
              const plan = e.target.value;
              setForm({
                ...form,
                plan,
                days: PLANS[plan]?.days || 30,
              });
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          >
            <option value="basic">Basic (3,500 MZN/mês)</option>
            <option value="pro">Pro (7,000 MZN/mês)</option>
            <option value="enterprise">Enterprise (150,000 MZN/ano)</option>
          </select>
          <input
            type="number"
            placeholder="Dias"
            value={form.days}
            onChange={(e) =>
              setForm({ ...form, days: parseInt(e.target.value) || 30 })
            }
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              width: 100,
            }}
          />
          <button
            onClick={create}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Criar Subscricao
          </button>
        </div>
      </div>

      {/* Lista de subscricoes */}
      <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Subscricoes</h3>

      {loading ? (
        <p>A carregar...</p>
      ) : subs.length === 0 ? (
        <p style={{ color: "#888" }}>Nenhuma subscricao encontrada.</p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #e0e0e0",
                }}
              >
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Cliente
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Plano
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Estado
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Pagamento
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Validade
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Dias Rest.
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const daysLeft = Math.ceil(
                  (new Date(s.expiry_date) - new Date()) /
                    (1000 * 60 * 60 * 24)
                );
                const isExpired = daysLeft <= 0;

                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {s.client}
                      {s.email && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                            fontWeight: 400,
                          }}
                        >
                          {s.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          background: `${planColors[s.plan] || "#666"}15`,
                          color: planColors[s.plan] || "#666",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.plan}
                      </span>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                        {PLANS[s.plan]?.price?.toLocaleString("pt-PT")} MZN
                        {s.plan === "enterprise" ? "/ano" : "/mês"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          background:
                            s.status === "active" && !isExpired
                              ? "#e8f5e9"
                              : "#ffebee",
                          color:
                            s.status === "active" && !isExpired
                              ? "#2e7d32"
                              : "#c62828",
                        }}
                      >
                        {isExpired ? "Expirada" : s.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          background:
                            s.payment_status === "paid"
                              ? "#e8f5e9"
                              : "#fff3e0",
                          color:
                            s.payment_status === "paid"
                              ? "#2e7d32"
                              : "#e65100",
                        }}
                      >
                        {s.payment_status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#666",
                        fontSize: 13,
                      }}
                    >
                      {new Date(s.expiry_date).toLocaleDateString("pt-PT")}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: isExpired ? "#c62828" : daysLeft <= 7 ? "#ff9800" : "#666",
                        fontWeight: isExpired || daysLeft <= 7 ? 600 : 400,
                      }}
                    >
                      {isExpired ? "0" : daysLeft}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {s.payment_status !== "paid" && !isExpired && (
                        <button
                          onClick={() => simulatePay(s.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "none",
                            background: "#4caf50",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Simular Pagamento ({PLANS[s.plan]?.price?.toLocaleString("pt-PT")} MZN)
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagamentos recentes */}
      <h3 style={{ margin: "32px 0 16px", fontSize: 18 }}>
        Pagamentos Recentes
      </h3>

      {payments.length === 0 ? (
        <p style={{ color: "#888" }}>Nenhum pagamento registado.</p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #e0e0e0",
                }}
              >
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Data
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Cliente
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Valor
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Metodo
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Estado
                </th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>
                  Ref.
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#666",
                      fontSize: 13,
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString("pt-PT")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{p.client}</td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#2e7d32",
                    }}
                  >
                    {p.amount?.toFixed(2)} MZN
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    {p.provider}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        background:
                          p.status === "success" ? "#e8f5e9" : "#ffebee",
                        color:
                          p.status === "success" ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#888",
                      fontFamily: "monospace",
                    }}
                  >
                    {p.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}