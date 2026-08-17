import { useState, useEffect } from 'react';
import API from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#b0b3b8' }}>A carregar...</p>
      </div>
    );
  }

  if (!stats) return <p style={{ color: '#ef5350' }}>Erro ao carregar dados</p>;

  const statCards = [
    { label: 'Total Licenças', value: stats.stats.totalLicenses, icon: '🔑', color: '#1976d2' },
    { label: 'Licenças Ativas', value: stats.stats.activeLicenses, icon: '✅', color: '#4caf50' },
    { label: 'Subscrições', value: stats.stats.totalSubscriptions, icon: '📋', color: '#9c27b0' },
    { label: 'Trial Ativos', value: stats.stats.trialSubscriptions, icon: '⏱️', color: '#ff9800' },
    { label: 'Pedidos Pendentes', value: stats.stats.pendingRequests, icon: '📥', color: '#f44336' },
    { label: 'Receita (MZN)', value: `${stats.stats.totalRevenue.toFixed(2)} MZN`, icon: '💰', color: '#009688' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600, color: '#f0f6fc' }}>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#151b2e',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 24, marginRight: 12 }}>{card.icon}</span>
              <span style={{ color: '#b0b3b8', fontSize: 14 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#151b2e', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#f0f6fc' }}>Pedidos Recentes</h3>
          {stats.recentRequests.length === 0 ? (
            <p style={{ color: '#b0b3b8' }}>Sem pedidos recentes</p>
          ) : (
            stats.recentRequests.map((r) => (
              <div key={r.id} style={{ padding: 12, marginBottom: 8, background: '#0d1117', borderRadius: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#f0f6fc' }}>{r.client_email}</div>
                <div style={{ fontSize: 12, color: '#b0b3b8' }}>
                  {r.plan} • {new Date(r.created_at).toLocaleDateString('pt-PT')}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#151b2e', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#f0f6fc' }}>Subscrições Recentes</h3>
          {stats.recentSubscriptions.length === 0 ? (
            <p style={{ color: '#b0b3b8' }}>Sem subscrições recentes</p>
          ) : (
            stats.recentSubscriptions.map((s) => (
              <div key={s.id} style={{ padding: 12, marginBottom: 8, background: '#0d1117', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500, color: '#f0f6fc' }}>{s.client}</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    background: s.status === 'active' ? 'rgba(46, 125, 50, 0.2)' : s.status === 'trial' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(198, 40, 40, 0.2)',
                    color: s.status === 'active' ? '#81c784' : s.status === 'trial' ? '#ffb74d' : '#ef5350',
                  }}>
                    {s.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#b0b3b8', marginTop: 4 }}>
                  {s.plan} • {new Date(s.expiry_date).toLocaleDateString('pt-PT')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}