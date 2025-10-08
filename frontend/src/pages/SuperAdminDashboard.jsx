import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Building, DollarSign, Activity, FileText, Settings } from 'lucide-react';
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalEnterprises: 0,
    totalEmployees: 0,
    totalPayroll: 0,
    activePayRuns: 0,
    recentActivities: []
  });
  const [enterprises, setEnterprises] = useState([]);
  const [payrollData, setPayrollData] = useState([]);

  const loadSuperAdminData = useCallback(async () => {
    try {
      setLoading(true);

      const [enterprisesResponse, globalStatsResponse, activitiesResponse] = await Promise.all([
        api.get('/entreprises'),
        api.get('/dashboard/global-stats'),
        api.get('/activities/recent?limit=10').catch(error => {
          console.error('Error fetching activities:', error);
          return { data: [] };
        })
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
      const activities = activitiesResponse.data || [];

      // Formater les activités pour l'affichage
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        enterprise: activity.entreprise?.nom || activity.entityName || 'Système',
        time: formatTimeAgo(activity.createdAt),
        user: activity.user?.nom || 'Système'
      }));

      setSystemStats({
        totalEnterprises: stats.totalEntreprises || 0,
        totalEmployees: stats.totalEmployes || 0,
        totalPayroll: stats.totalMasseSalariale || 0,
        activePayRuns: 0,
        recentActivities: formattedActivities
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
    }
  }, []);

  useEffect(() => {
    loadSuperAdminData();

    const interval = setInterval(loadSuperAdminData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadSuperAdminData]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'il y a moins d\'1h';
    if (diffInHours < 24) return `il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `il y a ${diffInDays}j`;

    return date.toLocaleDateString('fr-FR');
  };

  const COLORS = ['#4263EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Dashboard</h1>
            <p style={{ color: '#6B7280' }}>Vue d'ensemble de votre plateforme</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Entreprises</p>
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>{systemStats.totalEnterprises}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                  <Building className="h-6 w-6" style={{ color: '#8B5CF6' }} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% ce mois</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Employés</p>
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>{systemStats.totalEmployees}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                  <Users className="h-6 w-6" style={{ color: '#10B981' }} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% ce mois</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Masse Salariale</p>
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>{(systemStats.totalPayroll / 1000000).toFixed(1)}M FCFA</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                  <DollarSign className="h-6 w-6" style={{ color: '#EF4444' }} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15% ce mois</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Cycles Actifs</p>
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>{systemStats.activePayRuns}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                  <Activity className="h-6 w-6" style={{ color: '#3B82F6' }} />
                </div>
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
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: '#111827' }}>
                <TrendingUp className="h-6 w-6 mr-2" style={{ color: '#3B82F6' }} />
                Évolution de la Masse Salariale
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payrollData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      name="Masse Salariale Totale"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enterprises Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: '#111827' }}>
                <Building className="h-6 w-6 mr-2" style={{ color: '#10B981' }} />
                Répartition par Entreprise
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enterprises.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="nom" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value) => [`${value} employés`, 'Employés']} />
                    <Bar dataKey="employeeCount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Enterprises */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: '#111827' }}>
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#F3F4F6' }}>
                    <Building className="h-6 w-6" style={{ color: '#8B5CF6' }} />
                  </div>
                  Entreprises Récentes
                </h3>
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  {enterprises.length}
                </span>
              </div>
              <div className="space-y-3">
                {enterprises.slice(0, 5).map((enterprise, index) => (
                  <div key={enterprise.id} className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                          <Building className="h-5 w-5" style={{ color: '#8B5CF6' }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: '#111827' }}>{enterprise.nom}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{enterprise.employeeCount || 0} employés • {enterprise.devise}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enterprise.typePeriode === 'MENSUELLE' ? 'bg-green-100 text-green-700' :
                          enterprise.typePeriode === 'HEBDOMADAIRE' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {enterprise.typePeriode}
                        </span>
                        <button
                          onClick={() => navigate(`/enterprises/${enterprise.id}`)}
                          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                          title="Voir les détails de cette entreprise"
                        >
                          <svg className="w-4 h-4" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: index % 2 === 0 ? '#10B981' : '#3B82F6' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: '#111827' }}>
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#F3F4F6' }}>
                    <Activity className="h-6 w-6" style={{ color: '#EF4444' }} />
                  </div>
                  Activités Récentes
                </h3>
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  {systemStats.recentActivities.length}
                </span>
              </div>
              <div className="space-y-3">
                {systemStats.recentActivities.map((activity) => (
                  <div key={activity.id} className="group relative overflow-hidden bg-gradient-to-r from-white to-red-50 rounded-xl p-4 border border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ backgroundColor: '#FEE2E2' }}>
                        <Activity className="h-4 w-4" style={{ color: '#EF4444' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{activity.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs" style={{ color: '#6B7280' }}>{activity.enterprise}</p>
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center" style={{ color: '#111827' }}>
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#F3F4F6' }}>
                    <Settings className="h-6 w-6" style={{ color: '#6B7280' }} />
                  </div>
                  Actions Rapides
                </h3>
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  3
                </span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/enterprises')}
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 rounded-xl font-medium transition-all duration-300 flex items-center hover:shadow-lg hover:scale-105"
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #2563EB, #1D4ED8)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #3B82F6, #2563EB)';
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white/20 mr-3">
                        <Building className="h-5 w-5" />
                      </div>
                      <span>Nouvelle Entreprise</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </button>

                <button
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-4 rounded-xl font-medium transition-all duration-300 flex items-center hover:shadow-lg hover:scale-105"
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #10B981, #059669)';
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white/20 mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span>Générer Rapport</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/users')}
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-4 rounded-xl font-medium transition-all duration-300 flex items-center hover:shadow-lg hover:scale-105"
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #7C3AED, #6D28D9)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #8B5CF6, #7C3AED)';
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white/20 mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <span>Gérer Utilisateurs</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}