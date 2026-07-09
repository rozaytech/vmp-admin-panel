import { useEffect, useState } from "react";
import API from "../api/client";

export default function Finance() {
  const [data, setData] = useState(null);
  const [churn, setChurn] = useState(null);

  useEffect(() => {
    API.get("/control/overview").then((res) => {
      setData(res.data.data);
    });

    API.get("/control/churn").then((res) => {
      setChurn(res.data.data);
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>💰 Finance Control Plane</h2>

      {data && (
        <div style={{ marginTop: 20 }}>
          <p>Total Subscriptions: {data.totalSubscriptions}</p>
          <p>Active: {data.activeSubscriptions}</p>
          <p>Revoked: {data.revokedSubscriptions}</p>
          <p>Expired: {data.expiredSubscriptions}</p>

          <h3>MRR (Monthly Revenue)</h3>
          <p>${data.mrr}</p>

          <h3>Últimas Subscriptions</h3>
          {data.lastSubscriptions.map((s) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <b>{s.client}</b> - {s.plan} - {s.status}
            </div>
          ))}
        </div>
      )}

      {churn && (
        <div style={{ marginTop: 30 }}>
          <h3>Churn Rate</h3>
          <p>{churn.churnRate}</p>
        </div>
      )}
    </div>
  );
}