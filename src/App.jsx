import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Licenses from './pages/Licenses';
import CreateLicense from './pages/CreateLicense';
import Subscriptions from './pages/Subscriptions';
import ActivationRequests from './pages/ActivationRequests';
import Billing from './pages/Billing';
import EmailLogs from './pages/EmailLogs';
import Profile from './pages/Profile';

// TEMA DARK NAVY
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1a237e' },
    secondary: { main: '#4fc3f7' },
    background: { 
      default: '#0d1117',
      paper: '#151b2e' 
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#b0b3b8',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#151b2e',
          color: '#f0f6fc',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#151b2e',
          color: '#f0f6fc',
          backgroundImage: 'none',
        },
      },
    },
  },
});

// ADIÇÃO: Verifica a role e redireciona viewers para Dashboard
function RequireAdminRole({ children }) {
  const role = (localStorage.getItem('vmp_role') || '').toLowerCase().replace(/[\s_-]/g, '');
  const isAdmin = role === 'admin' || role === 'superadmin';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const isAuth = localStorage.getItem('vmp_admin_token');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={isAuth ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="licenses" element={<Licenses />} />
            {/* ADIÇÃO: Protege a rota de criação para apenas admins */}
            <Route path="licenses/create" element={<RequireAdminRole><CreateLicense /></RequireAdminRole>} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="requests" element={<ActivationRequests />} />
            {/* ADIÇÃO: Protege a rota de faturação para apenas admins */}
            <Route path="billing" element={<RequireAdminRole><Billing /></RequireAdminRole>} />
            <Route path="emails" element={<EmailLogs />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;