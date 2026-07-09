import { useEffect, useState } from "react";
import API from "../api/client";

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    API.get("/licenses").then((res) => {
      setLicenses(res.data.data);
    });
  }, []);

  function revoke(id) {
    API.post(`/revoke/${id}`).then(() => {
      alert("Revoked");
      window.location.reload();
    });
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Licenças</h2>

      {licenses.map((l) => (
        <div key={l.id} style={{ marginBottom: 10 }}>
          <b>{l.client}</b> - {l.plan} - {l.status}

          <button onClick={() => revoke(l.id)}>
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}