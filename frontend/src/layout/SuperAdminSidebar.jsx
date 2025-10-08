import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Building,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const superAdminMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/enterprises", label: "Entreprises", icon: Building },
  { path: "/users", label: "Utilisateurs", icon: UserCheck },
  { path: "/employees", label: "Employés", icon: Users },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

export default function SuperAdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full w-64 fixed left-0 top-0 z-50" style={{ backgroundColor: '#111827' }}>
      <div className="p-6">
        <h1 className="text-white text-xl font-bold">PayrollPro</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {superAdminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-blue-500 border-r-2 border-blue-500'
                      : 'text-white/80 hover:bg-gray-800 hover:text-white'
                  }`}
                  style={isActive ? { '--tw-border-color': '#8B5CF6' } : {}}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-left text-white/80 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </nav>
    </div>
  );
}