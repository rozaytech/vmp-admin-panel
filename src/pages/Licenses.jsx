import { useEffect, useState } from "react";
import API from "../api/client";

const PLANS = {
  basic: {
    code: "basic",
    name: "Basic",
    price: 3500,
    days: 30,
    maxUsers: 2,
    maxProducts: 500,
    features: ["pos", "inventory", "cash_register", "basic_reports", "z_report"],
    description: "Ideal para pequenos negócios e bancas",
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
  const [editModal, setEditModal] = useState(null);
  const [reactivateModal, setReactivateModal] = useState(null);

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
    if (!confirm("Tem a certeza que deseja revogar esta licença?")) return;
    API.post(`/licenses/revoke/${id}`, { reason: "manual_admin" }).then(() => {
      load();
    });
  }

  async function deleteLicense(id) {
    if (!confirm("Tem a certeza que deseja apagar permanentemente esta licença?")) return;
    try {
      await API.delete(`/licenses/${id}`);
      alert("Licença apagada com sucesso!");
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  async function markAsPaid(license) {
    if (!confirm(`Deseja marcar a licença de ${license.client} como PAGA e convertê-la numa subscrição?`)) return;
    try {
      await API.post("/licenses/pay", { licenseId: license.id });
      alert("Licença marcada como paga e convertida em subscrição com sucesso!");
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  // =========================================================
  // NOVA FUNÇÃO: Gerar Código de Renovação Offline (HMAC)
  // =========================================================
  async function generateOfflineCode(license) {
    if (!confirm(`Deseja gerar um código de renovação offline para ${license.client}?`)) return;
    try {
      const res = await API.post("/licenses/generate-offline-code", { machineId: license.machine_id, days: 30 });
      if (res.data.success) {
        const code = res.data.code;
        alert(`Código de renovação offline gerado com sucesso!\n\n${code}\n\nCopie este código e envie para o cliente via WhatsApp. Ele deve inserir o código na opção "Renovar Offline" no software VMP.`);
        load();
      } else {
        alert("Erro: " + (res.data?.message || "Falha ao gerar código."));
      }
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  function reactivate(license) {
    setReactivateModal(license);
  }

  async function doReactivate() {
    if (!reactivateModal) return;
    const days = document.getElementById("reactivateDays").value;
    const machineId = document.getElementById("reactivateMachineId").value.trim();
    try {
      const res = await API.post(`/licenses/reactivate/${reactivateModal.id}`, {
        days: days ? parseInt(days) : null,
        machineId: machineId || null,
      });
      alert(
        `Licença reativada com sucesso!\nNova validade: ${new Date(res.data.newExpiry).toLocaleDateString("pt-PT")}\nDias: ${res.data.days}`
      );
      setReactivateModal(null);
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
  }

  function openEdit(license) {
    setEditModal({ ...license });
  }

  async function doEdit() {
    if (!editModal) return;
    const payload = {};
    const plan = document.getElementById("editPlan").value;
    const status = document.getElementById("editStatus").value;
    const expiry = document.getElementById("editExpiry").value;
    const client = document.getElementById("editClient").value.trim();
    const machineId = document.getElementById("editMachineId").value.trim();
    if (plan !== editModal.plan) payload.plan = plan;
    if (status !== editModal.status) payload.status = status;
    if (expiry) payload.expiry = new Date(expiry).toISOString();
    if (client !== editModal.client) payload.client = client;
    if (machineId !== editModal.machine_id) payload.machineId = machineId;
    if (Object.keys(payload).length === 0) {
      alert("Nenhuma alteração feita");
      return;
    }
    try {
      await API.put(`/licenses/${editModal.id}`, payload);
      alert("Licença atualizada com sucesso");
      setEditModal(null);
      load();
    } catch (e) {
      alert("Erro: " + (e.response?.data?.details || e.message));
    }
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
        `Licença transferida com sucesso!\nDias transferidos: ${res.data.daysTransferred}\nNova validade: ${new Date(res.data.newExpiry).toLocaleDateString("pt-PT")}`
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

  const statusLabels = {
    active: "Ativa",
    revoked: "Revogada",
    expired: "Expirada",
    trial: "Trial",
  };

  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 600, color: "#f0f6fc" }}>
        Licenças
      </h1>

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
            border: "1px solid #30363d",
            backgroundColor: "#0d1117",
            color: "#f0f6fc",
            fontSize: 14,
            minWidth: 280,
            maxWidth: '100%',
            width: '100%',
          }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {["all", "active", "revoked", "expired"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: filter === s ? "#1a237e" : "#21262d",
                color: filter === s ? "#fff" : "#b0b3b8",
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
              background: "#1a237e",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#b0b3b8" }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#888" }}>Nenhuma licença encontrada.</p>
      ) : (
        <div
          style={{
            background: "#151b2e",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* CORREÇÃO MOBILE: Adicionado overflowX: auto para a tabela rolar lateralmente */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: "100%",
                minWidth: '800px', // Garante que os dados não fiquem esmagados no celular
                borderCollapse: "collapse",
                fontSize: 14,
                color: "#f0f6fc",
              }}
            >
              <thead>
                <tr style={{ background: "#0d1117", borderBottom: "1px solid #21262d" }}>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Cliente</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Plano</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Estado</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Pagamento</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Validade</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Machine ID</th>
                  <th style={{ textAlign: "left", padding: "14px 16px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const status = l.computed_status || l.status;
                  const isExpired = status === "expired";
                  const isRevoked = status === "revoked";
                  const daysLeft = Math.ceil(
                    (new Date(l.expiry) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const paymentStatus = l.payment_status || 'pending';

                  return (
                    <tr
                      key={l.id}
                      style={{
                        borderBottom: "1px solid #21262d",
                        background: isExpired ? "rgba(255, 152, 0, 0.1)" : "transparent",
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
                                ? "rgba(21, 101, 192, 0.2)"
                                : l.plan === "pro"
                                ? "rgba(123, 31, 162, 0.2)"
                                : "rgba(46, 125, 50, 0.2)",
                          color:
                            l.plan === "enterprise"
                              ? "#4fc3f7"
                              : l.plan === "pro"
                              ? "#ce93d8"
                              : "#81c784",
                            textTransform: "uppercase",
                          }}
                        >
                          {l.plan}
                        </span>
                        <div style={{ fontSize: 11, color: "#b0b3b8", marginTop: 4 }}>
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
                              ? `${statusColors[status]}25`
                              : "rgba(255,255,255,0.1)",
                            color: statusColors[status] || "#b0b3b8",
                          }}
                        >
                          {statusLabels[status] || status}
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
                              paymentStatus === "paid" ? "rgba(46, 125, 50, 0.2)" : "rgba(230, 81, 0, 0.2)",
                            color:
                              paymentStatus === "paid" ? "#81c784" : "#ffb74d",
                          }}
                        >
                          {paymentStatus === "paid" ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#b0b3b8", fontSize: 13 }}>
                        {new Date(l.expiry).toLocaleDateString("pt-PT")}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "#b0b3b8",
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
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={() => openEdit(l)}
                            title="Editar licença"
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #4fc3f7",
                              background: "transparent",
                              color: "#4fc3f7",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openTransfer(l)}
                            title="Transferir para outro computador"
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #4fc3f7",
                              background: "transparent",
                              color: "#4fc3f7",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Transferir
                          </button>
                          {status === "active" && (
                            <>
                              <button
                                onClick={() => markAsPaid(l)}
                                title="Marcar como paga e converter em subscrição"
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  border: "1px solid #009688",
                                  background: "transparent",
                                  color: "#4db6ac",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                Marcar como Pago
                              </button>
                              <button
                                onClick={() => revoke(l.id)}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  border: "1px solid #f44336",
                                  background: "transparent",
                                  color: "#ef5350",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                Revogar
                              </button>
                            </>
                          )}
                          {isRevoked && (
                            <button
                              onClick={() => reactivate(l)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #4caf50",
                                background: "transparent",
                                color: "#66bb6a",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              Reativar
                            </button>
                          )}
                          {/* NOVO BOTÃO: Gerar Código Offline */}
                          <button
                            onClick={() => generateOfflineCode(l)}
                            title="Gerar código para renovação offline"
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #ff9800",
                              background: "transparent",
                              color: "#ffa726",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Código Offline
                          </button>
                          <button
                            onClick={() => deleteLicense(l.id)}
                            title="Apagar permanentemente"
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #9e9e9e",
                              background: "transparent",
                              color: "#b0b3b8",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Apagar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais (Mantidos, mas com tema escuro) */}
      {transferModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#151b2e",
              borderRadius: 12,
              padding: 32,
              width: 420,
              maxWidth: "90%",
              color: "#f0f6fc",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Transferir Licença</h3>
            <p style={{ color: "#b0b3b8", fontSize: 14, marginBottom: 20 }}>
              Cliente: <strong>{transferModal.client}</strong>
              <br />
              Plano: <strong>{transferModal.plan}</strong>
              <br />
              Preço: <strong>
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
                border: "1px solid #30363d",
                background: "#0d1117",
                color: "#f0f6fc",
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
                  border: "1px solid #30363d",
                  background: "transparent",
                  color: "#f0f6fc",
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
                  background: "#1a237e",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {reactivateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#151b2e",
              borderRadius: 12,
              padding: 32,
              width: 420,
              maxWidth: "90%",
              color: "#f0f6fc",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Reativar Licença</h3>
            <p style={{ color: "#b0b3b8", fontSize: 14, marginBottom: 20 }}>
              Cliente: <strong>{reactivateModal.client}</strong>
              <br />
              Plano: <strong>{reactivateModal.plan}</strong>
              <br />
              Machine ID actual: <strong style={{ fontFamily: "monospace", fontSize: 12 }}>
                {reactivateModal.machine_id}
              </strong>
            </p>

            <label style={{ fontSize: 14, fontWeight: 500 }}>
              Novo Machine ID (deixe em branco para manter o actual):
            </label>
            <input
              id="reactivateMachineId"
              type="text"
              placeholder={reactivateModal.machine_id}
              style={{
                width: "100%",
                padding: "10px 12px",
                marginTop: 8,
                marginBottom: 16,
                borderRadius: 8,
                border: "1px solid #30363d",
                background: "#0d1117",
                color: "#f0f6fc",
                fontSize: 14,
                fontFamily: "monospace",
              }}
            />

            <label style={{ fontSize: 14, fontWeight: 500 }}>
              Dias de validade (deixe em branco para usar o padrão do plano):
            </label>
            <input
              id="reactivateDays"
              type="number"
              placeholder={PLANS[reactivateModal.plan]?.days || 30}
              style={{
                width: "100%",
                padding: "10px 12px",
                marginTop: 8,
                marginBottom: 20,
                borderRadius: 8,
                border: "1px solid #30363d",
                background: "#0d1117",
                color: "#f0f6fc",
                fontSize: 14,
              }}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setReactivateModal(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "transparent",
                  color: "#f0f6fc",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={doReactivate}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#4caf50",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Reativar Licença
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#151b2e",
              borderRadius: 12,
              padding: 32,
              width: 460,
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              color: "#f0f6fc",
            }}
          >
            <h3 style={{ margin: "0 0 20px" }}>Editar Licença</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Cliente / Email:
              </label>
              <input
                id="editClient"
                type="text"
                defaultValue={editModal.client}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "#0d1117",
                  color: "#f0f6fc",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Plano:
              </label>
              <select
                id="editPlan"
                defaultValue={editModal.plan}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "#0d1117",
                  color: "#f0f6fc",
                  fontSize: 14,
                }}
              >
                <option value="basic">Basic (3.500 MZN/mês)</option>
                <option value="pro">Pro (7.000 MZN/mês)</option>
                <option value="enterprise">Enterprise (150.000 MZN/ano)</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Estado:
              </label>
              <select
                id="editStatus"
                defaultValue={editModal.status}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "#0d1117",
                  color: "#f0f6fc",
                  fontSize: 14,
                }}
              >
                <option value="active">Ativa</option>
                <option value="revoked">Revogada</option>
                <option value="expired">Expirada</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Data de expiração:
              </label>
              <input
                id="editExpiry"
                type="datetime-local"
                defaultValue={editModal.expiry?.slice(0, 16)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "#0d1117",
                  color: "#f0f6fc",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Machine ID:
              </label>
              <input
                id="editMachineId"
                type="text"
                defaultValue={editModal.machine_id}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "#0d1117",
                  color: "#f0f6fc",
                  fontSize: 14,
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditModal(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #30363d",
                  background: "transparent",
                  color: "#f0f6fc",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={doEdit}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1a237e",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}