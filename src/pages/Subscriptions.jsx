import { useState, useEffect } from 'react';
import API from '../api/client';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    try {
      setLoading(true);
      const res = await API.get(`/admin/subscriptions?status=${filter}`);
      setSubscriptions(res.data.subscriptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Mapeamento para tradução PT-PT
  const statusLabels = {
    active: 'Ativa',
    trial: 'Trial',
    inactive: 'Inativa'
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, color: '#f0f6fc' }}>Subscrições</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {['all', 'active', 'trial', 'inactive'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: filter === status ? '#1a237e' : '#21262d',
              color: filter === status ? '#fff' : '#b0b3b8',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: 14
            }}
          >
            {status === 'all' ? 'Todas' : statusLabels[status] || status}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#b0b3b8' }}>A carregar...</p>
      ) : subscriptions.length === 0 ? (
        <p style={{ color: '#b0b3b8' }}>Sem subscrições.</p>
      ) : (
        <div style={{ background: '#151b2e', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#f0f6fc' }}>
              <thead>
                <tr style={{ background: '#0d1117', borderBottom: '1px solid #21262d' }}>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Cliente</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Plano</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Pagamento</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Validade</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: '#b0b3b8' }}>Machine ID</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '12px 16px' }}>{sub.client}</td>
                    <td style={{ padding: '12px 16px' }}>{sub.plan}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: sub.status === 'active' ? 'rgba(46, 125, 50, 0.2)' : sub.status === 'trial' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(198, 40, 40, 0.2)',
                        color: sub.status === 'active' ? '#81c784' : sub.status === 'trial' ? '#ffb74d' : '#ef5350',
                      }}>
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        background: sub.payment_status === 'paid' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(230, 81, 0, 0.2)',
                        color: sub.payment_status === 'paid' ? '#81c784' : '#ffb74d',
                      }}>
                        {sub.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#b0b3b8', fontSize: 13 }}>
                      {new Date(sub.expiry_date).toLocaleDateString('pt-PT')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#b0b3b8', fontFamily: 'monospace' }}>
                      {sub.machine_id ? sub.machine_id.substring(0, 16) + '...' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}