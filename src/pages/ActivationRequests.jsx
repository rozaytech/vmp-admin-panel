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
      setLoading(true);
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
      await API.post(`/admin/activation-requests/${id}/reject`);
      load();
    } catch (e) {
      alert('Erro ao rejeitar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    pending: { bg: 'rgba(230, 81, 0, 0.2)', color: '#ffb74d', label: 'Pendente' },
    approved: { bg: 'rgba(46, 125, 50, 0.2)', color: '#81c784', label: 'Aprovado' },
    rejected: { bg: 'rgba(198, 40, 40, 0.2)', color: '#ef5350', label: 'Rejeitado' },
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600, color: '#f0f6fc' }}>Pedidos de Ativação</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
              background: filter === btn.key ? '#1a237e' : '#21262d',
              color: filter === btn.key ? '#fff' : '#b0b3b8',
              cursor: 'pointer',
              fontWeight: filter === btn.key ? 'bold' : 'normal',
              fontSize: 14
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#b0b3b8' }}>A carregar...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: '#b0b3b8' }}>Sem pedidos.</p>
      ) : (
        <div style={{
          background: '#151b2e',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#f0f6fc' }}>
              <thead>
                <tr style={{ background: '#0d1117', borderBottom: '1px solid #21262d' }}>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Machine ID</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Plano</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusStyle = statusColors[req.status] || statusColors.pending;
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '12px 16px' }}>{req.client_email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#b0b3b8', fontFamily: 'monospace' }}>
                        {req.machine_id.substring(0, 16)}...
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: req.plan === 'enterprise' ? 'rgba(123, 31, 162, 0.2)' :
                                     req.plan === 'pro' ? 'rgba(239, 108, 0, 0.2)' : 'rgba(21, 101, 192, 0.2)',
                          color: req.plan === 'enterprise' ? '#ce93d8' :
                                 req.plan === 'pro' ? '#ffa726' : '#64b5f6',
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
                      <td style={{ padding: '12px 16px', color: '#b0b3b8', fontSize: 13 }}>
                        {new Date(req.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                            <span style={{ fontSize: 12, color: '#81c784' }}>✓ Aprovado</span>
                            {req.license_id && (
                              <div style={{ fontSize: 11, color: '#b0b3b8', marginTop: 4, fontFamily: 'monospace' }}>
                                Licença: {req.license_id.substring(0, 12)}...
                              </div>
                            )}
                          </div>
                        )}
                        {req.status === 'rejected' && (
                          <span style={{ fontSize: 12, color: '#ef5350' }}>✗ Rejeitado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}