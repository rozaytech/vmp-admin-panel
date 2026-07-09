import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/licenses', label: 'Licenças', icon: '🔑' },
  { path: '/licenses/create', label: 'Criar Licença', icon: '➕' },
  { path: '/subscriptions', label: 'Subscrições', icon: '📋' },
  { path: '/requests', label: 'Pedidos', icon: '📥' },
  { path: '/billing', label: 'Faturação', icon: '💰' },
  { path: '/emails', label: 'Emails', icon: '✉️' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('vmp_admin_token');
    localStorage.removeItem('vmp_role');
    // CORRIGIDO: window.location força reload
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#1a237e',
        color: '#fff',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>VMP SaaS</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>Painel de Admin</p>
        </div>

        <nav style={{ padding: '16px 0' }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: 14,
                  borderLeft: active ? '4px solid #4fc3f7' : '4px solid transparent',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 260,
        background: '#f5f5f5',
        minHeight: '100vh',
      }}>
        <div style={{ padding: 32 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}