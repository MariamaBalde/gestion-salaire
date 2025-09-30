import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  Building,
  Calendar,
  CreditCard,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/employees", label: "Employés", icon: Users },
  { path: "/payruns", label: "Cycles de paie", icon: Calendar },
  { path: "/payments", label: "Paiements", icon: CreditCard },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

const superAdminMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/enterprises", label: "Entreprises", icon: Building },
  { path: "/users", label: "Utilisateurs", icon: UserCheck },
  { path: "/employees", label: "Employés", icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems =
    user?.role === "SUPER_ADMIN" ? [...superAdminMenuItems] : baseMenuItems;

  return (
    <div className="bg-white shadow-lg h-full w-64">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">GesSalaire</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
