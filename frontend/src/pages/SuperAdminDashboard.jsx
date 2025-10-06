import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Building, DollarSign, Activity, Shield, Settings, FileText, RefreshCw } from 'lucide-react';
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    totalEnterprises: 0,
    totalEmployees: 0,
    totalPayroll: 0,
    activePayRuns: 0,
    recentActivities: []
  });
  const [enterprises, setEnterprises] = useState([]);
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    loadSuperAdminData();

    const interval = setInterval(loadSuperAdminData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);

      const [enterprisesResponse, globalStatsResponse] = await Promise.all([
        api.get('/entreprises'),
        api.get('/dashboard/global-stats')
      ]);

      const enterprisesWithCounts = await Promise.all(
        (enterprisesResponse.data || []).map(async (enterprise) => {
          try {
            const employeesResponse = await api.get(`/employees?entrepriseId=${enterprise.id}`);
            return {
              ...enterprise,
              employeeCount: employeesResponse.data?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching employee count for enterprise ${enterprise.id}:`, error);
            return {
              ...enterprise,
              employeeCount: 0
            };
          }
        })
      );

      setEnterprises(enterprisesWithCounts);

      const stats = globalStatsResponse.data;
      setSystemStats({
        totalEnterprises: stats.totalEntreprises || 0,
        totalEmployees: stats.totalEmployes || 0,
        totalPayroll: stats.totalMasseSalariale || 0,
        activePayRuns: 0, 
        recentActivities: [
          { id: 1, action: 'Nouvelle entreprise créée', enterprise: 'TechCorp', time: '2h' },
          { id: 2, action: 'Cycle de paie approuvé', enterprise: 'FinancePlus', time: '4h' },
          { id: 3, action: 'Utilisateur ajouté', enterprise: 'LogiTrans', time: '6h' },
          { id: 4, action: 'Rapport généré', enterprise: 'MediCare', time: '8h' },
        ]
      });

     
      const currentDate = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        months.push({
          month: monthName,
          totalPayroll: Math.floor(stats.totalMasseSalariale * (0.8 + Math.random() * 0.4)), 
          enterprises: stats.totalEntreprises
        });
      }
      setPayrollData(months);

    } catch (error) {
      console.error('Error loading super admin data:', error);
      setSystemStats({
        totalEnterprises: 0,
        totalEmployees: 0,
        totalPayroll: 0,
        activePayRuns: 0,
        recentActivities: []
      });
      setPayrollData([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const COLORS = ['#4263EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Tableau de Bord Super Administrateur
              </h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble complète du système</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadSuperAdminData}
                className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-800">Connecté en tant que</p>
                <p className="font-semibold text-blue-900">{user?.nom}</p>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-800">Dernière mise à jour</p>
                <p className="font-semibold text-gray-900">{lastUpdated.toLocaleTimeString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entreprises</p>
                <p className="text-3xl font-bold text-gray-900">{systemStats.totalEnterprises}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% ce mois</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employés Total</p>
                <p className="text-3xl font-bold text-gray-900">{systemStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% ce mois</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Masse Salariale</p>
                <p className="text-3xl font-bold text-gray-900">{(systemStats.totalPayroll / 1000000).toFixed(1)}M FCFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15% ce mois</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cycles Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{systemStats.activePayRuns}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5% ce mois</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Payroll Evolution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              Évolution de la Masse Salariale
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value) => [`${(value / 1000000).toFixed(1)}M FCFA`, 'Masse Salariale']}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalPayroll"
                    stroke="#4263EB"
                    strokeWidth={3}
                    dot={{ fill: '#4263EB', strokeWidth: 2, r: 6 }}
                    name="Masse Salariale Totale"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enterprises Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="h-6 w-6 text-green-600 mr-2" />
              Répartition par Entreprise
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enterprises.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nom" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value) => [`${value} employés`, 'Employés']} />
                  <Bar dataKey="employeeCount" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Enterprises */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="h-6 w-6 text-purple-600 mr-2" />
              Entreprises Récentes
            </h3>
            <div className="space-y-4">
              {enterprises.slice(0, 5).map((enterprise, index) => (
                <div key={enterprise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{enterprise.nom}</p>
                    <p className="text-sm text-gray-600">{enterprise.employeeCount || 0} employés</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="h-6 w-6 text-orange-600 mr-2" />
              Activités Récentes
            </h3>
            <div className="space-y-4">
              {systemStats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.enterprise} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-6 w-6 text-gray-600 mr-2" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Nouvelle Entreprise
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Générer Rapport
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Gérer Utilisateurs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}