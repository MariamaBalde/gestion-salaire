import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center pl-64 pr-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin Panel' : (user?.entreprise?.nom || 'Entreprise ABC')}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <div className="text-sm text-gray-700">
              <div>{user?.nom || 'Utilisateur'}</div>
              <div className="text-xs text-gray-500">{user?.role || ''}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}