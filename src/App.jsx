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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5', paper: '#fff' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const isAuth = localStorage.getItem('vmp_admin_token');

  return (
    <ThemeProvider theme={theme}>
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