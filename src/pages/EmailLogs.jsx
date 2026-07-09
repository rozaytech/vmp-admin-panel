import { useState, useEffect } from 'react';
import API from '../api/client';

export default function EmailLogs() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await API.get('/admin/email-logs');
      setEmails(res.data.emails || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 28 }}>Logs de Email</h1>

      {loading ? (
        <p>A carregar...</p>
      ) : emails.length === 0 ? (
        <p>Sem emails enviados.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Para</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Assunto</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>{email.recipient}</td>
                  <td style={{ padding: '12px 16px' }}>{email.subject}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      background: email.status === 'sent' ? '#e8f5e9' : '#fff3e0',
                      color: email.status === 'sent' ? '#2e7d32' : '#e65100',
                    }}>
                      {email.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>
                    {new Date(email.created_at).toLocaleString('pt-PT')}
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