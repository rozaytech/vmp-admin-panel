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

      // Mock login para testes — em produção usa API real
      if (email === 'admin@vmp.com' && password === 'admin123') {
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('vmp_admin_token', mockToken);
        console.log('LOGIN SUCCESS');
        navigate('/');
        return;
      }

      // Login real via API
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      if (!res.data?.token) {
        setError('Resposta inválida do servidor');
        return;
      }

      localStorage.setItem('vmp_admin_token', res.data.token);
      localStorage.setItem('vmp_role', res.data.role || 'admin');
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
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
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
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
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
            transition: 'all 0.2s',
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
      </div>
    </div>
  );
}