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

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [transferModal, setTransferModal] = useState(null);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const status = filter === "all" ? "" : filter;
      const res = await API.get("/licenses/list", {
        params: { status, client: search },
      });
      setLicenses(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function revoke(id) {
    if (!confirm("Tem certeza que deseja revogar esta licenca?")) return;

    API.post(`/licenses/revoke/${id}`, { reason: "manual_admin" }).then(() => {
      load();
    });
  }

  function openTransfer(license) {
    setTransferModal(license);
  }

  async function doTransfer() {
    if (!transferModal) return;
    const newMachineId = document.getElementById("newMachineId").value.trim();

    if (!newMachineId) {
      alert("Digite o novo Machine ID");
      return;
    }

    try {
      const res = await API.post("/licenses/transfer", {
        oldLicenseId: transferModal.id,
        newMachineId,
        reason: "computer_replaced",
      });

      alert(
        `Licenca transferida com sucesso!\nDias transferidos: ${res.data.daysTransferred}\nNova validade: ${new Date(res.data.newExpiry).toLocaleDateString("pt-PT")}`
      );
      setTransferModal(null);
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  const filtered = licenses.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        l.client?.toLowerCase().includes(q) ||
        l.machine_id?.toLowerCase().includes(q) ||
        l.plan?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusColors = {
    active: "#4caf50",
    revoked: "#f44336",
    expired: "#ff9800",
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 600 }}>
        Licencas
      </h1>

      {/* Filtros e busca */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por cliente, machine ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && load()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            minWidth: 280,
          }}
        />

        {["all", "active", "revoked", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: filter === s ? "#16213e" : "#e0e0e0",
              color: filter === s ? "#fff" : "#333",
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: 14,
            }}
          >
            {s === "all" ? "Todas" : s}
          </button>
        ))}

        <button
          onClick={load}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#888" }}>Nenhuma licenca encontrada.</p>
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
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Cliente</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Plano</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Estado</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Pagamento</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Validade</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Machine ID</th>
                <th style={{ textAlign: "left", padding: "14px 16px" }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const status = l.computed_status || l.status;
                const isExpired = status === "expired";
                const daysLeft = Math.ceil(
                  (new Date(l.expiry) - new Date()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      background: isExpired ? "#fff8e1" : undefined,
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {l.client}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          background:
                            l.plan === "enterprise"
                              ? "#e3f2fd"
                              : l.plan === "pro"
                              ? "#f3e5f5"
                              : "#e8f5e9",
                          color:
                            l.plan === "enterprise"
                              ? "#1565c0"
                              : l.plan === "pro"
                              ? "#7b1fa2"
                              : "#2e7d32",
                          textTransform: "uppercase",
                        }}
                      >
                        {l.plan}
                      </span>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                        {PLANS[l.plan]?.price?.toLocaleString("pt-PT")} MZN
                        {l.plan === "enterprise" ? "/ano" : "/mês"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          background: statusColors[status]
                            ? `${statusColors[status]}15`
                            : "#f5f5f5",
                          color: statusColors[status] || "#666",
                        }}
                      >
                        {status === "active" && !isExpired
                          ? "Ativa"
                          : status === "revoked"
                          ? "Revogada"
                          : "Expirada"}
                        {status === "active" && daysLeft <= 7 && (
                          <span style={{ marginLeft: 6, fontSize: 11 }}>
                            ({daysLeft}d)
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          background:
                            l.payment_status === "paid" ? "#e8f5e9" : "#fff3e0",
                          color:
                            l.payment_status === "paid" ? "#2e7d32" : "#e65100",
                        }}
                      >
                        {l.payment_status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666", fontSize: 13 }}>
                      {new Date(l.expiry).toLocaleDateString("pt-PT")}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#666",
                        fontFamily: "monospace",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={l.machine_id}
                    >
                      {l.machine_id?.substring(0, 20)}...
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => openTransfer(l)}
                          title="Transferir para outro computador"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "1px solid #1976d2",
                            background: "#fff",
                            color: "#1976d2",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Transferir
                        </button>
                        {status === "active" && (
                          <button
                            onClick={() => revoke(l.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #f44336",
                              background: "#fff",
                              color: "#f44336",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Revogar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Transferencia */}
      {transferModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              width: 420,
              maxWidth: "90%",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Transferir Licenca</h3>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
              Cliente: <strong>{transferModal.client}</strong>
              <br />
              Plano: <strong>{transferModal.plan}</strong>
              <br />
              Preco: <strong>
                {PLANS[transferModal.plan]?.price?.toLocaleString("pt-PT")} MZN
                {transferModal.plan === "enterprise" ? "/ano" : "/mês"}
              </strong>
              <br />
              Dias restantes:{" "}
              <strong>
                {Math.ceil(
                  (new Date(transferModal.expiry) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )}
              </strong>
            </p>

            <label style={{ fontSize: 14, fontWeight: 500 }}>
              Novo Machine ID:
            </label>
            <input
              id="newMachineId"
              type="text"
              placeholder="Ex: ABC123-DEF456"
              style={{
                width: "100%",
                padding: "10px 12px",
                marginTop: 8,
                marginBottom: 20,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                fontFamily: "monospace",
              }}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setTransferModal(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={doTransfer}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1976d2",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Confirmar Transferencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}