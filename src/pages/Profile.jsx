import { useState, useEffect } from "react";
import API from "../api/client";

const ROLES = [
  { value: 'viewer', label: 'Visualizador (somente leitura)' },
  { value: 'technician', label: 'Técnico' },
  { value: 'admin', label: 'Administrador' },
  { value: 'superadmin', label: 'Super Admin' },
];

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: 16,
  borderRadius: 8,
  border: '1px solid #30363d',
  background: '#0d1117',
  color: '#f0f6fc',
  fontSize: 14,
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
  color: '#f0f6fc',
  fontSize: 14,
};

const btnPrimary = {
  padding: '10px 24px',
  background: '#1a237e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

const btnSecondary = {
  padding: '10px 24px',
  background: 'transparent',
  color: '#f0f6fc',
  border: '1px solid #30363d',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  marginLeft: 10,
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [message, setMessage] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', username: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', username: '', password: '', role: 'viewer' });

  const [userRole, setUserRole] = useState(localStorage.getItem('vmp_role') || 'admin');
  const normalizedRole = (userRole || '').toLowerCase().replace(/[\s_-]/g, '');
  const canManageUsers = normalizedRole === 'admin' || normalizedRole === 'superadmin';

  useEffect(() => {
    loadProfile();
    if (canManageUsers) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageUsers]);

  async function loadProfile() {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      const rawRole = res.data.role || userRole;
      const cleanRole = rawRole.toLowerCase().replace(/[\s_-]/g, '');
      localStorage.setItem('vmp_role', cleanRole);
      setUserRole(cleanRole);
      
      setProfileForm({ 
        name: res.data.name || '', 
        username: res.data.username || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      });
    } catch (e) {
      console.error(e);
      setUser({ name: localStorage.getItem('vmp_user_name') || 'Admin', username: localStorage.getItem('vmp_username') || 'admin', email: localStorage.getItem('vmp_user_email') || '', phone: localStorage.getItem('vmp_user_phone') || '', role: userRole });
      setProfileForm({ name: user?.name || 'Admin', username: user?.username || 'admin', email: user?.email || '', phone: user?.phone || '' });
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      // CORREÇÃO: Adicionado '/admin' ao caminho da API
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao carregar utilizadores.' });
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await API.put('/auth/profile', profileForm);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setShowEditProfile(false);
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao atualizar perfil.' });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'A nova password não coincide com a confirmação.' });
      return;
    }
    try {
      await API.put('/auth/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setMessage({ type: 'success', text: 'Password alterada com sucesso!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao alterar password.' });
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setMessage(null);
    try {
      // CORREÇÃO: Adicionado '/admin' ao caminho da API
      await API.post('/admin/users/create', newUserForm);
      setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      setNewUserForm({ name: '', email: '', username: '', password: '', role: 'viewer' });
      setShowAddUserModal(false);
      loadUsers();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.details || e.response?.data?.message || 'Erro ao criar usuário.' });
    }
  }

  function handleDeleteUser(id) {
    if (!confirm('Deseja realmente remover este usuário?')) return;
    // CORREÇÃO: Adicionado '/admin' ao caminho da API
    API.delete(`/admin/users/${id}`).then(() => {
      setMessage({ type: 'success', text: 'Usuário removido com sucesso!' });
      loadUsers();
    }).catch(e => {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao remover usuário.' });
    });
  }

  const messageStyle = {
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
    backgroundColor: message?.type === 'success' ? '#d4edda' : '#f8d7da',
    color: message?.type === 'success' ? '#155724' : '#721c24',
    border: `1px solid ${message?.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
  };

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };

  const modalContentStyle = {
    background: '#151b2e', borderRadius: 12, padding: 32,
    width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
    color: '#f0f6fc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
  };

  if (loading) return <p style={{ color: '#b0b3b8' }}>A carregar...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600, color: '#f0f6fc' }}>Perfil do Utilizador</h1>

      {message && <div style={messageStyle}>{message.text}</div>}

      {/* Cartão Principal de Perfil */}
      <div style={{
        background: '#151b2e', borderRadius: 12, padding: 32, marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#1a237e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 'bold', color: '#fff'
        }}>
          {(user?.name || 'A')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, color: '#f0f6fc' }}>{user?.name || 'Admin'}</h2>
          <p style={{ margin: 0, fontSize: 15, color: '#b0b3b8' }}>
            <strong>Username:</strong> {user?.username}
          </p>
          <p style={{ margin: 4, fontSize: 15, color: '#b0b3b8' }}>
            <strong>Email:</strong> {user?.email || 'Não definido'}
          </p>
          <p style={{ margin: 4, fontSize: 15, color: '#b0b3b8' }}>
            <strong>Telefone:</strong> {user?.phone || 'Não definido'}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 12 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 12, fontSize: 12,
              background: 'rgba(21, 101, 192, 0.2)', color: '#64b5f6', textTransform: 'uppercase', fontWeight: 'bold'
            }}>
              {normalizedRole || 'admin'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setShowEditProfile(true)} style={btnPrimary}>✏️ Editar Perfil</button>
          <button onClick={() => setShowPasswordModal(true)} style={btnSecondary}>🔑 Alterar Senha</button>
        </div>
      </div>

      {/* Gestão de Utilizadores (Apenas Admin e Super Admin) */}
      {canManageUsers && (
        <div style={{
          background: '#151b2e', borderRadius: 12, padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f0f6fc' }}>Gestão de Utilizadores</h3>
            <button
              onClick={() => setShowUsersModal(true)}
              style={{
                padding: '8px 16px', background: '#1a237e', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500
              }}
            >
              Ver Lista
            </button>
          </div>
          <p style={{ color: '#b0b3b8', fontSize: 14, margin: 0 }}>
            Apenas administradores podem criar novos acessos ao painel. Clique em "Ver Lista" para adicionar novos utilizadores.
          </p>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {showEditProfile && (
        <div style={modalOverlayStyle} onClick={() => setShowEditProfile(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#f0f6fc' }}>Editar Informações</h3>
            <form onSubmit={handleUpdateProfile}>
              <label style={labelStyle}>Nome</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Nome de Utilizador</label>
              <input type="text" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Email</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={inputStyle} />
              
              <label style={labelStyle}>Telefone</label>
              <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={inputStyle} />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowEditProfile(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" style={{ ...btnPrimary, marginLeft: 10 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <div style={modalOverlayStyle} onClick={() => setShowPasswordModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#f0f6fc' }}>Alterar Password</h3>
            <form onSubmit={handleChangePassword}>
              <label style={labelStyle}>Password Atual</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Nova Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Confirmar Nova Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={inputStyle} required />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" style={{ ...btnPrimary, marginLeft: 10 }}>Alterar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lista de Utilizadores */}
      {showUsersModal && (
        <div style={modalOverlayStyle} onClick={() => setShowUsersModal(false)}>
          <div style={{ ...modalContentStyle, maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#f0f6fc' }}>Utilizadores Existentes</h3>
              <button
                onClick={() => { setShowAddUserModal(true); }}
                style={{
                  padding: '8px 16px', background: '#1a237e', color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 24, lineHeight: 1, fontWeight: 'bold'
                }}
                title="Adicionar Novo Utilizador"
              >
                +
              </button>
            </div>
            
            <div style={{ marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
              {users.length === 0 ? (
                <p style={{ color: '#b0b3b8' }}>Sem utilizadores.</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid #21262d' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#1a237e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff'
                    }}>
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, color: '#f0f6fc' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: '#b0b3b8' }}>{u.username} • {u.email || 'Sem email'}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: u.role === 'superadmin' ? 'rgba(21, 101, 192, 0.2)' : 'rgba(123, 31, 162, 0.2)',
                      color: u.role === 'superadmin' ? '#64b5f6' : '#ce93d8', textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{
                        padding: '4px 10px', background: '#f44336', color: '#fff',
                        border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowUsersModal(false)} style={btnSecondary}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Novo Utilizador */}
      {showAddUserModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddUserModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#f0f6fc' }}>Adicionar Novo Utilizador</h3>
            <form onSubmit={handleCreateUser}>
              <label style={labelStyle}>Nome</label>
              <input type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Email</label>
              <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} style={inputStyle} />
              
              <label style={labelStyle}>Nome de Utilizador</label>
              <input type="text" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Password</label>
              <input type="password" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} style={inputStyle} required />
              
              <label style={labelStyle}>Função</label>
              <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} style={inputStyle}>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" style={{ ...btnPrimary, marginLeft: 10 }}>Criar Utilizador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}