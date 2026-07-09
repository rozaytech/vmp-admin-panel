import { useState, useEffect } from 'react';
import API from '../api/client';

export default function ActivationRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    try {
      setLoading(true);
      const res = await API.get(`/admin/activation-requests?status=${filter}`);
      setRequests(res.data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      await API.post(`/admin/activation-requests/${id}/approve`);
      load();
    } catch (e) {
      alert('Erro ao aprovar: ' + e.message);
    }
  }

  async function reject(id) {
    if (!confirm('Tem a certeza que quer rejeitar este pedido?')) return;
    try {
      await API.post(`/admin/activation-requests/${id}/reject`);
      load();
    } catch (e) {
      alert('Erro ao rejeitar: ' + e.message);
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28 }}>Pedidos de Ativação</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === status ? '#16213e' : '#e0e0e0',
              color: filter === status ? '#fff' : '#333',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : requests.length === 0 ? (
        <p>Sem pedidos.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Machine ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Plano</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Data</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>{req.client_email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                    {req.machine_id.substring(0, 16)}...
                  </td>
                  <td style={{ padding: '12px 16px' }}>{req.plan}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffebee' : '#fff3e0',
                      color: req.status === 'approved' ? '#2e7d32' : req.status === 'rejected' ? '#c62828' : '#e65100',
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>
                    {new Date(req.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => approve(req.id)}
                          style={{
                            padding: '6px 14px',
                            background: '#2ecc71',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => reject(req.id)}
                          style={{
                            padding: '6px 14px',
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <span style={{ fontSize: 12, color: '#2ecc71' }}>✓ Aprovado</span>
                    )}
                    {req.status === 'rejected' && (
                      <span style={{ fontSize: 12, color: '#e74c3c' }}>✗ Rejeitado</span>
                    )}
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