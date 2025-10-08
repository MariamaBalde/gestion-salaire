import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Building, DollarSign, Activity, BarChart3 } from 'lucide-react';

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [payrollEvolution, setPayrollEvolution] = useState([]);
  const [topEnterprises, setTopEnterprises] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // Mock data for now - in real app, fetch from API
      const currentDate = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        months.push({
          month: monthName,
          totalPayroll: Math.floor(100000000 + Math.random() * 50000000),
        });
      }
      setPayrollEvolution(months);

      // Top 5 enterprises
      setTopEnterprises([
        { name: 'EasyTech', payroll: 25000000 },
        { name: 'GTP Monde', payroll: 22000000 },
        { name: 'MediCare', payroll: 18000000 },
        { name: 'LogiTrans', payroll: 15000000 },
        { name: 'FinancePlus', payroll: 12000000 },
      ]);

      // Contract types
      setContractTypes([
        { name: 'FIXE', value: 60, color: '#3B82F6' },
        { name: 'JOURNALIER', value: 30, color: '#10B981' },
        { name: 'HONORAIRE', value: 10, color: '#F59E0B' },
      ]);

      // User roles
      setUserRoles([
        { name: 'ADMIN', value: 45, color: '#3B82F6' },
        { name: 'CAISSIER', value: 35, color: '#10B981' },
        { name: 'SUPER_ADMIN', value: 20, color: '#F59E0B' },
      ]);

    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
          Statistiques Globales
        </h1>
        <p className="text-gray-600 mt-1">Analyse complète des données du système</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution de la masse salariale mensuelle */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            Évolution de la Masse Salariale Mensuelle
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value) => [`${(value / 1000000).toFixed(1)}M FCFA`, 'Masse Salariale']}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalPayroll"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  name="Masse Salariale Totale"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 entreprises par masse salariale */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-6 w-6 text-green-600 mr-2" />
            Top 5 Entreprises par Masse Salariale
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEnterprises} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                <Tooltip formatter={(value) => [`${(value / 1000000).toFixed(1)}M FCFA`, 'Masse Salariale']} />
                <Bar dataKey="payroll" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Types de contrats (%) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="h-6 w-6 text-purple-600 mr-2" />
            Répartition des Types de Contrats
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des rôles utilisateurs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 text-orange-600 mr-2" />
            Répartition des Rôles Utilisateurs
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}