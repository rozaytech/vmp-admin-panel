import { useState, useEffect } from "react";
import API from "../api/client";

const ROLES = [
  { value: 'viewer', label: 'Visualizador (somente leitura)' },
  { value: 'technician', label: 'Técnico' },
  { value: 'admin', label: 'Administrador' },
  { value: 'superadmin', label: 'Super Admin' },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: '', username: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', username: '', password: '', role: 'viewer' });

  const currentRole = localStorage.getItem('vmp_role') || 'admin';

  useEffect(() => {
    loadProfile();
    if (currentRole === 'superadmin') {
      loadUsers();
    }
  }, [currentRole]);

  async function loadProfile() {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      setProfileForm({ name: res.data.name || '', username: res.data.username || '' });
    } catch (e) {
      console.error(e);
      // Fallback se API não existir
      setUser({
        name: localStorage.getItem('vmp_user_name') || 'Admin',
        username: localStorage.getItem('vmp_username') || 'admin',
        role: currentRole
      });
      setProfileForm({ name: user.name || 'Admin', username: user.username || 'admin' });
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users || []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await API.put('/auth/profile', profileForm);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setUser(res.data);
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
      await API.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password alterada com sucesso!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao alterar password.' });
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await API.post('/users/create', newUserForm);
      setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      setNewUserForm({ name: '', email: '', username: '', password: '', role: 'viewer' });
      loadUsers();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Erro ao criar usuário.' });
    }
  }

  function handleDeleteUser(id) {
    if (!confirm('Deseja realmente remover este usuário?')) return;
    API.delete(`/users/${id}`).then(() => {
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

  if (loading) return <p style={{ color: '#b0b3b8' }}>A carregar...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 600, color: '#f0f6fc' }}>
        Perfil do Utilizador
      </h1>

      {message && <div style={messageStyle}>{message.text}</div>}

      {/* Informações do Perfil */}
      <div style={{
        background: '#151b2e',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#f0f6fc' }}>Informações Pessoais</h3>
        <form onSubmit={handleUpdateProfile}>
          <label style={labelStyle}>Nome</label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            style={inputStyle}
            required
          />
          <label style={labelStyle}>Nome de Utilizador</label>
          <input
            type="text"
            value={profileForm.username}
            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            style={inputStyle}
            required
          />
          <button type="submit" style={{
            padding: '10px 24px',
            background: '#1a237e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}>
            Guardar Alterações
          </button>
        </form>
      </div>

      {/* Alterar Password */}
      <div style={{
        background: '#151b2e',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#f0f6fc' }}>Alterar Password</h3>
        <form onSubmit={handleChangePassword}>
          <label style={labelStyle}>Password Atual</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            style={inputStyle}
            required
          />
          <label style={labelStyle}>Nova Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            style={inputStyle}
            required
          />
          <label style={labelStyle}>Confirmar Nova Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            style={inputStyle}
            required
          />
          <button type="submit" style={{
            padding: '10px 24px',
            background: '#1a237e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}>
            Alterar Password
          </button>
        </form>
      </div>

      {/* Gestão de Utilizadores (Apenas Super Admin) */}
      {currentRole === 'superadmin' && (
        <div style={{
          background: '#151b2e',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#f0f6fc' }}>Adicionar Novo Utilizador</h3>
          <form onSubmit={handleCreateUser}>
            <label style={labelStyle}>Nome</label>
            <input
              type="text"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              style={inputStyle}
            />
            <label style={labelStyle}>Nome de Utilizador</label>
            <input
              type="text"
              value={newUserForm.username}
              onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle}>Função</label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              style={inputStyle}
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <button type="submit" style={{
              padding: '10px 24px',
              background: '#1a237e',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}>
              Criar Utilizador
            </button>
          </form>

          <div style={{ marginTop: 32 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 16, color: '#f0f6fc' }}>Utilizadores Existentes</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#f0f6fc' }}>
                <thead>
                  <tr style={{ background: '#0d1117', borderBottom: '1px solid #21262d' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0b3b8' }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0b3b8' }}>Username</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0b3b8' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0b3b8' }}>Função</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0b3b8' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '12px 16px' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px' }}>{u.username}</td>
                      <td style={{ padding: '12px 16px' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: u.role === 'superadmin' ? 'rgba(21, 101, 192, 0.2)' : u.role === 'admin' ? 'rgba(123, 31, 162, 0.2)' : u.role === 'technician' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(230, 81, 0, 0.2)',
                          color: u.role === 'superadmin' ? '#64b5f6' : u.role === 'admin' ? '#ce93d8' : u.role === 'technician' ? '#81c784' : '#ffb74d',
                          textTransform: 'uppercase',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{
                            padding: '4px 10px',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}