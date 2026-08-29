import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import Navbar from './Navbar';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/licenses', label: 'Licenças', icon: '🔑' },
  { path: '/licenses/create', label: 'Criar Licença', icon: '➕' },
  { path: '/subscriptions', label: 'Subscrições', icon: '📋' },
  { path: '/requests', label: 'Pedidos', icon: '📥' },
  { path: '/billing', label: 'Faturação', icon: '💰' },
  { path: '/emails', label: 'Emails', icon: '✉️' },
  { path: '/profile', label: 'Perfil', icon: '👤' },
];

export default function Layout() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#0d1117' }}>
      {/* Sidebar (Desktop: sempre visível / Mobile: abre e fecha) */}
      <aside style={{
        width: 260,
        background: '#1a237e',
        color: '#fff',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>VMP SaaS</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>Painel de Administração</p>
        </div>

        <nav style={{ padding: '16px 0' }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
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
      </aside>

      {/* Overlay para mobile quando sidebar aberto */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 260,
        background: '#0d1117',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : 'auto',
      }}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}