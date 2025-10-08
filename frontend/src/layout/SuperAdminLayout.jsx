import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import ToastContainer from '../components/Toast';

export default function SuperAdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex">
      <SuperAdminSidebar />
      <div className="flex-1">
        {/* Topbar */}
        <div className="bg-white border-b pl-64 pr-6 py-4 flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
              <input
                type="text"
                placeholder="Rechercher entreprise/utilisateur..."
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#E5E7EB',
                  '--tw-ring-color': '#3B82F6'
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2" style={{ color: '#6B7280' }}>
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
                <span className="text-white text-sm font-medium">
                  {user?.nom?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{user?.nom}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pl-64">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}