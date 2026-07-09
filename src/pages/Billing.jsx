import { useEffect, useState } from "react";
import API from "../api/client";

export default function Billing() {
  const [stats, setStats] = useState(null);
  const [subs, setSubs] = useState([]);

  const [form, setForm] = useState({
    client: "",
    email: "",
    plan: "basic"
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const s = await API.get("/billing/stats");
    const r = await API.get("/billing/subscriptions");

    setStats(s.data.data);
    setSubs(r.data.data);
  }

  async function create() {
    await API.post("/billing/subscription/create", form);
    load();
  }

  async function simulatePay(id) {
    await API.post("/billing/payment/simulate", {
      subscriptionId: id,
      amount: 1000,
      provider: "manual"
    });

    load();
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Billing Dashboard</h2>

      {stats && (
        <div style={{ marginBottom: 20 }}>
          <p>Total Subscriptions: {stats.total}</p>
          <p>Active: {stats.active}</p>
          <p>Paid: {stats.paid}</p>
          <p>Revenue: {stats.revenue} MZN</p>
        </div>
      )}

      <h3>Create Subscription</h3>

      <input
        placeholder="Client"
        onChange={(e) => setForm({ ...form, client: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <select
        onChange={(e) => setForm({ ...form, plan: e.target.value })}
      >
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>

      <button onClick={create}>Create</button>

      <h3 style={{ marginTop: 30 }}>Subscriptions</h3>

      {subs.map((s) => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <b>{s.client}</b> | {s.plan} | {s.status} | {s.payment_status}

          <button onClick={() => simulatePay(s.id)}>
            Simulate Payment
          </button>
        </div>
      ))}
    </div>
  );
}