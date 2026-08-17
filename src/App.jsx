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
    // CORREÇÃO DA OPACIDADE: Força o fundo escuro nos cartões das outras telas
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
            <Route path="licenses/create" element={<CreateLicense />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="requests" element={<ActivationRequests />} />
            <Route path="billing" element={<Billing />} />
            <Route path="emails" element={<EmailLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;