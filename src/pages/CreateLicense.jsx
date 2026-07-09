import { useState } from "react";
import API from "../api/client";

export default function CreateLicense() {
  const [machineId, setMachineId] = useState("");
  const [client, setClient] = useState("");
  const [plan, setPlan] = useState("enterprise");
  const [days, setDays] = useState(365);

  const [license, setLicense] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div style={{ padding: 40 }}>
      <h2>Criar Licença</h2>

      <input
        placeholder="Machine ID"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: '100%' }}
      />

      <input
        placeholder="Cliente / Email"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: '100%' }}
      />

      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        style={{ display: "block", marginBottom: 10, padding: 8, width: '100%' }}
      >
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>

      <input
        type="number"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        style={{ display: "block", marginBottom: 10, padding: 8, width: '100%' }}
      />

      <button 
        onClick={generate} 
        disabled={loading}
        style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? "A gerar..." : "Gerar Licença"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {subscription && (
        <div style={{ marginTop: 20, padding: 15, backgroundColor: "#e8f5e9", borderRadius: 8 }}>
          <h4>Subscrição criada:</h4>
          <p><strong>ID:</strong> {subscription.id}</p>
          <p><strong>Plano:</strong> {subscription.plan}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Validade:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
        </div>
      )}

      {license && (
        <div style={{ marginTop: 20 }}>
          <h3>Licença gerada:</h3>
          <textarea
            value={license}
            readOnly
            style={{ width: "100%", height: 120, padding: 8 }}
          />
        </div>
      )}
    </div>
  );
}