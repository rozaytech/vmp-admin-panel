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

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28 }}>Subscrições</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        {['all', 'active', 'trial', 'inactive'].map((status) => (
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
            {status === 'all' ? 'Todas' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : subscriptions.length === 0 ? (
        <p>Sem subscrições.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Plano</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Pagamento</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Validade</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Machine ID</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>{sub.client}</td>
                  <td style={{ padding: '12px 16px' }}>{sub.plan}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: sub.status === 'active' ? '#e8f5e9' : sub.status === 'trial' ? '#fff3e0' : '#ffebee',
                      color: sub.status === 'active' ? '#2e7d32' : sub.status === 'trial' ? '#e65100' : '#c62828',
                    }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      background: sub.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0',
                      color: sub.payment_status === 'paid' ? '#2e7d32' : '#e65100',
                    }}>
                      {sub.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>
                    {new Date(sub.expiry_date).toLocaleDateString('pt-PT')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                    {sub.machine_id ? sub.machine_id.substring(0, 16) + '...' : '—'}
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