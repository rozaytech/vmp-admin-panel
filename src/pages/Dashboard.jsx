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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#666' }}>A carregar...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) return <p>Erro ao carregar dados</p>;

  const statCards = [
    { label: 'Total Licenças', value: stats.stats.totalLicenses, icon: '🔑', color: '#1976d2' },
    { label: 'Licenças Ativas', value: stats.stats.activeLicenses, icon: '✅', color: '#4caf50' },
    { label: 'Subscrições', value: stats.stats.totalSubscriptions, icon: '📋', color: '#9c27b0' },
    { label: 'Trial Ativos', value: stats.stats.trialSubscriptions, icon: '⏱️', color: '#ff9800' },
    { label: 'Pedidos Pendentes', value: stats.stats.pendingRequests, icon: '📥', color: '#f44336' },
    { label: 'Receita Total', value: `${stats.stats.totalRevenue.toFixed(2)}€`, icon: '💰', color: '#009688' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600, color: '#333' }}>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${card.color}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 24, marginRight: 12 }}>{card.icon}</span>
              <span style={{ color: '#666', fontSize: 14 }}>{card.label}</span>
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: card.color,
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#333' }}>Pedidos Recentes</h3>
          {stats.recentRequests.length === 0 ? (
            <p style={{ color: '#888' }}>Sem pedidos recentes</p>
          ) : (
            <div>
              {stats.recentRequests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    background: '#f8f9fa',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{r.client_email}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {r.plan} • {new Date(r.created_at).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    background: r.status === 'pending' ? '#fff3e0' : r.status === 'approved' ? '#e8f5e9' : '#ffebee',
                    color: r.status === 'pending' ? '#e65100' : r.status === 'approved' ? '#2e7d32' : '#c62828',
                  }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#333' }}>Subscrições Recentes</h3>
          {stats.recentSubscriptions.length === 0 ? (
            <p style={{ color: '#888' }}>Sem subscrições recentes</p>
          ) : (
            <div>
              {stats.recentSubscriptions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    background: '#f8f9fa',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{s.client}</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      background: s.status === 'active' ? '#e8f5e9' : s.status === 'trial' ? '#fff3e0' : '#ffebee',
                      color: s.status === 'active' ? '#2e7d32' : s.status === 'trial' ? '#e65100' : '#c62828',
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    {s.plan} • {new Date(s.expiry_date).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}