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
      // CORRECAO: endpoint correto do servidor
      const res = await API.get(`/admin/activation-requests?status=${filter}`);
      setRequests(res.data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // CORRECAO: usar endpoint correto de aprovacao
  async function approve(id) {
    try {
      setLoading(true);
      // CORRECAO: endpoint correto do servidor
      const res = await API.post(`/admin/activation-requests/${id}/approve`);
      alert(res.data.message || 'Licença aprovada com sucesso!');
      load();
    } catch (e) {
      alert('Erro ao aprovar: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  }

  async function reject(id) {
    if (!window.confirm('Tem a certeza que quer rejeitar este pedido?')) return;
    try {
      setLoading(true);
      // CORRECAO: endpoint correto do servidor
      await API.post(`/admin/activation-requests/${id}/reject`);
      load();
    } catch (e) {
      alert('Erro ao rejeitar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    pending: { bg: '#fff3e0', color: '#e65100', label: 'Pendente' },
    approved: { bg: '#e8f5e9', color: '#2e7d32', label: 'Aprovado' },
    rejected: { bg: '#ffebee', color: '#c62828', label: 'Rejeitado' },
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600 }}>Pedidos de Ativação</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'approved', label: 'Aprovados' },
          { key: 'rejected', label: 'Rejeitados' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === btn.key ? '#1976d2' : '#e0e0e0',
              color: filter === btn.key ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: filter === btn.key ? 'bold' : 'normal',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : requests.length === 0 ? (
        <p>Sem pedidos.</p>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
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
              {requests.map((req) => {
                const statusStyle = statusColors[req.status] || statusColors.pending;
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px' }}>{req.client_email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                      {req.machine_id.substring(0, 16)}...
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: req.plan === 'enterprise' ? '#f3e5f5' :
                                   req.plan === 'pro' ? '#fff3e0' : '#e3f2fd',
                        color: req.plan === 'enterprise' ? '#7b1fa2' :
                               req.plan === 'pro' ? '#ef6c00' : '#1565c0',
                        textTransform: 'uppercase',
                      }}>
                        {req.plan}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        {statusStyle.label}
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
                            disabled={loading}
                            style={{
                              padding: '6px 14px',
                              background: '#4caf50',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                          >
                            ✅ Aprovar
                          </button>
                          <button
                            onClick={() => reject(req.id)}
                            disabled={loading}
                            style={{
                              padding: '6px 14px',
                              background: '#f44336',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                          >
                            ❌ Rejeitar
                          </button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <div>
                          <span style={{ fontSize: 12, color: '#4caf50' }}>✓ Aprovado</span>
                          {req.license_id && (
                            <div style={{ fontSize: 11, color: '#666', marginTop: 4, fontFamily: 'monospace' }}>
                              Licença: {req.license_id.substring(0, 12)}...
                            </div>
                          )}
                        </div>
                      )}
                      {req.status === 'rejected' && (
                        <span style={{ fontSize: 12, color: '#f44336' }}>✗ Rejeitado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}