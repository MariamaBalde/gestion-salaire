import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './layout/Layout';
import SuperAdminLayout from './layout/SuperAdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Employees from './pages/Employees';
import Enterprises from './pages/Enterprises';
import Users from './pages/Users';
import PayRuns from './pages/PayRuns';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import EnterpriseDetails from './pages/EnterpriseDetails';

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {isAuthenticated ? (
        <>
          {user?.role === 'SUPER_ADMIN' ? (
            <Route path="/" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="enterprises" element={<Enterprises />} />
              <Route path="enterprises/:id" element={<EnterpriseDetails />} />
              <Route path="users" element={<Users />} />
              <Route path="employees" element={<Employees />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="enterprises" element={<Enterprises />} />
              <Route path="users" element={<Users />} />
              <Route path="payruns" element={<PayRuns />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
              <Route path="/enterprises/:id" element={<EnterpriseDetails />} />
            </Route>
          )}
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

