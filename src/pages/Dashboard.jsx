import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  LinearProgress
} from '@mui/material';
import {
  Key, Receipt, Mail, TrendingUp, Timer, CheckCircle
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../api/client';

const COLORS = ['#4caf50', '#ff9800', '#f44336'];

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

  if (loading) return <LinearProgress />;
  if (!stats) return <Typography>Erro ao carregar dados</Typography>;

  const statCards = [
    { label: 'Total Licenças', value: stats.stats.totalLicenses, icon: <Key />, color: '#1976d2' },
    { label: 'Ativas', value: stats.stats.activeLicenses, icon: <CheckCircle />, color: '#4caf50' },
    { label: 'Subscrições', value: stats.stats.totalSubscriptions, icon: <Receipt />, color: '#9c27b0' },
    { label: 'Trial', value: stats.stats.trialSubscriptions, icon: <Timer />, color: '#ff9800' },
    { label: 'Pendentes', value: stats.stats.pendingRequests, icon: <Mail />, color: '#f44336' },
    { label: 'Receita (€)', value: stats.stats.totalRevenue.toFixed(2), icon: <TrendingUp />, color: '#009688' },
  ];

  const pieData = [
    { name: 'Ativas', value: stats.stats.activeLicenses },
    { name: 'Trial', value: stats.stats.trialSubscriptions },
    { name: 'Outras', value: stats.stats.totalLicenses - stats.stats.activeLicenses - stats.stats.trialSubscriptions },
  ].filter(d => d.value > 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Dashboard</Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Card sx={{ borderLeft: `4px solid ${card.color}`, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>{card.icon}</Box>
                  <Typography color="textSecondary" variant="body2">{card.label}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Distribuição de Licenças</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              {pieData.map((entry, index) => (
                <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: COLORS[index], borderRadius: '50%' }} />
                  <Typography variant="body2">{entry.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Pedidos Recentes</Typography>
            {stats.recentRequests.length === 0 ? (
              <Typography color="textSecondary">Sem pedidos recentes</Typography>
            ) : (
              stats.recentRequests.map((r) => (
                <Box key={r.id} sx={{ p: 2, mb: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{r.client_email}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {r.plan} • {new Date(r.created_at).toLocaleDateString('pt-PT')}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 12,
                      bgcolor: r.status === 'pending' ? '#fff3e0' : r.status === 'approved' ? '#e8f5e9' : '#ffebee',
                      color: r.status === 'pending' ? '#e65100' : r.status === 'approved' ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {r.status}
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}