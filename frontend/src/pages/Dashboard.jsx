import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building, TrendingUp, DollarSign, Users, Activity, Clock } from 'lucide-react';
import Table from "../components/Table";
import Badge from "../components/Badge";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import CashierDashboard from "./CashierDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entrepriseId = searchParams.get("entrepriseId");
  const [loading, setLoading] = useState(true);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterprise, setEnterprise] = useState(null);
  const [stats, setStats] = useState({
    masseSalariale: 0,
    montantPaye: 0,
    montantRestant: 0, 
    employesActifs: 0,
  });
  const [payrollEvolution, setPayrollEvolution] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!entrepriseId && !user?.entrepriseId) return;
      
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (entrepriseId) {
          queryParams.append('entrepriseId', entrepriseId);
        }

        const [dashboardResponse, enterpriseResponse] = await Promise.all([
          api.get(`/dashboard/data?${queryParams.toString()}`),
          entrepriseId
            ? api.get(`/entreprises/${entrepriseId}`)
            : user?.entrepriseId
              ? api.get(`/entreprises/${user.entrepriseId}`)
              : Promise.resolve({ data: null })
        ]);

        const { kpis, evolution, upcomingPayments: payments } = dashboardResponse.data;
        
        setStats(kpis);
        setPayrollEvolution(evolution);
        setUpcomingPayments(payments);

        if (enterpriseResponse.data) {
          setEnterprise(enterpriseResponse.data);
          setEnterpriseName(enterpriseResponse.data.nom);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [entrepriseId, user]);

  // Redirections conditionnelles après les hooks
  if (user?.role === 'SUPER_ADMIN' && !entrepriseId) {
    return <SuperAdminDashboard />;
  }

  if (user?.role === 'CAISSIER') {
    return <CashierDashboard />;
  }

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (!enterprise) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Aucune donnée d'entreprise disponible</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6">
        {/* En-tête */}
        <div className="bg-white shadow-lg border-b border-gray-200 rounded-xl mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Building className="h-8 w-8 text-blue-600 mr-3" />
                  {user?.role === "SUPER_ADMIN" 
                    ? `Vue d'ensemble de ${enterpriseName}`
                    : `Bienvenue, Administrateur de ${enterpriseName}`
                  }
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === "SUPER_ADMIN" 
                    ? `Détails de l'entreprise`
                    : `Tableau de bord`
                  }
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Dernière mise à jour: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Masse Salariale */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Masse Salariale</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(stats.masseSalariale).toLocaleString()} FCFA
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% ce mois</span>
            </div>
          </div>

          {/* Montant Payé */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Payé</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(stats.montantPaye).toLocaleString()} FCFA
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% ce mois</span>
            </div>
          </div>

          {/* Montant Restant */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Restant</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(stats.montantRestant).toLocaleString()} FCFA
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center">
              <Activity className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm text-orange-600">En attente</span>
            </div>
          </div>

          {/* Employés Actifs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employés Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.employesActifs}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5% ce mois</span>
            </div>
          </div>
        </div>

        {/* Graphiques et tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Évolution de la masse salariale */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              Évolution de la Masse Salariale
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280" 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${(value / 1000000).toFixed(1)}M FCFA`, 'Masse Salariale']}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="masseSalariale"
                    stroke="#4263EB"
                    strokeWidth={3}
                    dot={{ fill: '#4263EB', strokeWidth: 2, r: 6 }}
                    name="Masse Salariale"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prochains paiements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 text-orange-600 mr-2" />
              Prochains Paiements
            </h3>
            {upcomingPayments.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Échéance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.employeeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.montant.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.dateEcheance).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={payment.status === 'ATTENTE' ? 'warning' : 'success'}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun paiement en attente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const icons = {
    money: "💰",
    check: "✅",
    clock: "⏰",
    users: "👥",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          <span className="text-2xl">{icons[icon]}</span>
        </div>
        <span className={`text-sm text-${color}-500`}>{trend}</span>
      </div>
      <p className="text-[#575D6E] text-sm mb-2">{title}</p>
      <p className="text-2xl font-bold text-[#242F57]">{value}</p>
    </div>
  );
}
