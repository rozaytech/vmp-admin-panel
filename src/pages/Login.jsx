import { useState } from 'react';
import API from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function login() {
    try {
      setLoading(true);
      setError('');

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      console.log('TENTANDO LOGIN:', trimmedEmail);

      // Mock login para testes
      if (trimmedEmail === 'admin@vmp.com' && trimmedPassword === 'admin123') {
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('vmp_admin_token', mockToken);
        console.log('LOGIN MOCK SUCCESS:', mockToken);
        navigate('/');
        return;
      }

      console.log('MOCK LOGIN FALHOU, tentando API...');

      // Login real via API
      const res = await API.post('/auth/login', {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('API RESPONSE:', res.data);

      if (!res.data?.token) {
        setError('Resposta inválida do servidor');
        return;
      }

      localStorage.setItem('vmp_admin_token', res.data.token);
      localStorage.setItem('vmp_role', res.data.role || 'admin');
      console.log('LOGIN API SUCCESS');
      navigate('/');
    } catch (err) {
      console.log('LOGIN ERROR:', err);
      if (err.response?.status === 401) {
        setError('Credenciais inválidas');
      } else {
        setError('Erro de conexão com servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        width: 400,
        padding: 40,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#333' }}>VMP SaaS</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Painel de Administração</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: '100%',
            padding: 14,
            background: loading ? '#ccc' : '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>

        {error && (
          <p style={{
            color: '#e74c3c',
            marginTop: 16,
            padding: 12,
            background: '#ffebee',
            borderRadius: 6,
            fontSize: 14,
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}

        <button
          onClick={() => {
            localStorage.clear();
            console.log('localStorage limpo');
            window.location.reload();
          }}
          style={{
            marginTop: 12,
            padding: 8,
            background: 'transparent',
            border: 'none',
            color: '#999',
            fontSize: 12,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          🧹 Limpar dados (debug)
        </button>
      </div>
    </div>
  );
}