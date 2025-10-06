import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Wallet, Receipt, Calendar, RefreshCw } from 'lucide-react';
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CashierDashboard() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cashierStats, setCashierStats] = useState({
    todayPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalAmount: 0,
    cashBalance: 0
  });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    loadCashierData();

    // Auto-refresh every 2 minutes for cashier (more frequent updates needed)
    const interval = setInterval(loadCashierData, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadCashierData = async () => {
    try {
      setLoading(true);

      // Load payments for the cashier's enterprise
      const [paymentsResponse, allPaymentsResponse] = await Promise.all([
        api.get(`/payments?entrepriseId=${user?.entrepriseId}`),
        api.get('/payments') // For statistics
      ]);

      const payments = paymentsResponse.data || [];
      const allPayments = allPaymentsResponse.data || [];

      // Filter pending payments (those with status 'ATTENTE' or partial payments)
      const pending = payments.filter(p => p.status === 'ATTENTE' || p.status === 'PARTIEL');
      setPendingPayments(pending);

      // Calculate statistics from real data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayPayments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= today;
      });

      const completedPayments = payments.filter(p => p.status === 'PAYE').length;
      const totalAmount = todayPayments.reduce((sum, p) => sum + p.montant, 0);

      setCashierStats({
        todayPayments: todayPayments.length,
        pendingPayments: pending.length,
        completedPayments,
        totalAmount,
        cashBalance: 2500000 // This would come from a cash register endpoint
      });

      // Use real transaction data
      const recentTransactionsData = payments.slice(-4).map(payment => ({
        id: payment.id,
        employee: payment.payslip?.employee?.nomComplet || 'Employé inconnu',
        amount: payment.montant,
        method: payment.methodePaiement || 'Non spécifié',
        time: new Date(payment.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: payment.status === 'PAYE' ? 'completed' : 'pending'
      }));

      setRecentTransactions(recentTransactionsData);

      // Calculate payment methods distribution from real data
      const methodStats = {};
      allPayments.forEach(payment => {
        const method = payment.methodePaiement || 'Non spécifié';
        methodStats[method] = (methodStats[method] || 0) + 1;
      });

      const totalPayments = allPayments.length;
      const paymentMethodsData = Object.entries(methodStats).map(([name, count]) => ({
        name,
        value: Math.round((count / totalPayments) * 100),
        color: getMethodColor(name)
      }));

      setPaymentMethods(paymentMethodsData);

    } catch (error) {
      console.error('Error loading cashier data:', error);
      // Fallback to mock data
      setPendingPayments([]);
      setCashierStats({
        todayPayments: 0,
        pendingPayments: 0,
        completedPayments: 0,
        totalAmount: 0,
        cashBalance: 0
      });
      setRecentTransactions([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      'Espèces': '#10B981',
      'Virement': '#4263EB',
      'Chèque': '#F59E0B',
      'Carte': '#EF4444',
      'Non spécifié': '#6B7280'
    };
    return colors[method] || '#6B7280';
  };

  const handleProcessPayment = async (paymentId) => {
    try {
      await api.patch(`/payments/${paymentId}/process`);
      // Refresh data
      loadCashierData();
    } catch (error) {
      console.error('Error processing payment:', error);
      showError('Erreur lors du traitement du paiement. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord caissier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Wallet className="h-8 w-8 text-green-600 mr-3" />
                Tableau de Bord Caissier
              </h1>
              <p className="text-gray-600 mt-1">Gestion des paiements et transactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadCashierData}
                className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-green-800">Connecté en tant que</p>
                <p className="font-semibold text-green-900">{user?.nom}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-800">Solde caisse</p>
                <p className="font-semibold text-blue-900">{(cashierStats.cashBalance / 1000).toFixed(0)}k FCFA</p>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements Aujourd'hui</p>
                <p className="text-3xl font-bold text-gray-900">{cashierStats.todayPayments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">En cours</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements en Attente</p>
                <p className="text-3xl font-bold text-gray-900">{cashierStats.pendingPayments}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-orange-600">À traiter</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-3xl font-bold text-gray-900">{(cashierStats.totalAmount / 1000).toFixed(0)}k FCFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-blue-600">Aujourd'hui</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements Terminés</p>
                <p className="text-3xl font-bold text-gray-900">{cashierStats.completedPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-purple-600">Ce mois</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pending Payments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 text-orange-600 mr-2" />
              Paiements en Attente
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingPayments.length > 0 ? pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.employeeName}</p>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{(payment.amount / 1000).toFixed(0)}k FCFA</p>
                      <p className="text-sm text-gray-600">{payment.dueDate}</p>
                    </div>
                    <button
                      onClick={() => handleProcessPayment(payment.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Traiter
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun paiement en attente</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
              Méthodes de Paiement
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: method.color }}></div>
                    <span className="text-sm text-gray-600">{method.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{method.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Receipt className="h-6 w-6 text-purple-600 mr-2" />
            Transactions Récentes
          </h3>
          <div className="overflow-x-auto">
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
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(transaction.amount / 1000).toFixed(0)}k FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl font-semibold transition-colors flex items-center justify-center">
            <DollarSign className="h-6 w-6 mr-3" />
            Nouveau Paiement
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl font-semibold transition-colors flex items-center justify-center">
            <Receipt className="h-6 w-6 mr-3" />
            Générer Reçu
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl font-semibold transition-colors flex items-center justify-center">
            <Calendar className="h-6 w-6 mr-3" />
            Rapport Journalier
          </button>
        </div>
      </div>
    </div>
  );
}