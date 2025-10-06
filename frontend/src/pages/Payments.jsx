import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function Payments() {
  const [payRuns, setPayRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('ESPECES');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedPayRunId, setSelectedPayRunId] = useState('');

  useEffect(() => {
    fetchPayRuns();
    fetchChartData();
  }, []);

  const fetchPayRuns = async () => {
    try {
      const response = await api.get('/payruns');
      setPayRuns(response.data);
    } catch (error) {
      console.error('Error fetching payruns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await api.get('/payments');
      const payments = response.data;

      // Compter les modes de paiement
      const modeCounts = payments.reduce((acc, payment) => {
        acc[payment.modePaiement] = (acc[payment.modePaiement] || 0) + 1;
        return acc;
      }, {});

      const data = Object.entries(modeCounts).map(([mode, count]) => ({
        name: formatPaymentMode(mode),
        value: count
      }));

      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const formatPaymentMode = (mode) => {
    const modes = {
      ESPECES: 'Espèces',
      VIREMENT_BANCAIRE: 'Virement bancaire',
      ORANGE_MONEY: 'Orange Money',
      WAVE: 'Wave'
    };
    return modes[mode] || mode;
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', {
        payslipId: selectedPayslip.id,
        montant: parseFloat(amount),
        modePaiement: paymentMode,
        reference: reference || undefined
      });

      setShowModal(false);
      setSelectedPayslip(null);
      setAmount('');
      setPaymentMode('ESPECES');
      setReference('');
      fetchPayRuns();
      fetchChartData();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const getTotalPaid = (payslip) => {
    return payslip.payments?.reduce((sum, payment) => sum + payment.montant, 0) || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAYE': return 'success';
      case 'PARTIEL': return 'warning';
      case 'ATTENTE': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAYE': return 'Payé';
      case 'PARTIEL': return 'Partiel';
      case 'ATTENTE': return 'En attente';
      default: return status;
    }
  };

  const headers = ['Employé', 'Période', 'Salaire Net', 'Total Payé', 'Restant', 'Statut', 'Actions'];

  const renderRow = (payslip) => {
    const totalPaid = getTotalPaid(payslip);
    const remaining = payslip.net - totalPaid;

    return (
      <tr key={payslip.id}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {payslip.employee?.nomComplet || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {payslip.payRun ? `${new Date(payslip.payRun.dateDebut).toLocaleDateString()} - ${new Date(payslip.payRun.dateFin).toLocaleDateString()}` : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {payslip.net} {payslip.payRun?.entreprise?.devise || 'XOF'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {totalPaid} {payslip.payRun?.entreprise?.devise || 'XOF'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {remaining} {payslip.payRun?.entreprise?.devise || 'XOF'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Badge variant={getStatusColor(payslip.status)}>
            {getStatusText(payslip.status)}
          </Badge>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            {payslip.status !== 'PAYE' && (
              <Button onClick={() => openPaymentModal(payslip)} size="sm">
                Enregistrer un paiement
              </Button>
            )}
            {payslip.payments && payslip.payments.length > 0 && (
              <Button
                onClick={() => downloadReceipt(payslip.payments[payslip.payments.length - 1].id)}
                size="sm"
                variant="secondary"
              >
                Télécharger reçu
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paiements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Liste des bulletins de paie</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPayRunId}
                onChange={(e) => setSelectedPayRunId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tous les cycles de paie</option>
                {payRuns.map((payRun) => (
                  <option key={payRun.id} value={payRun.id}>
                    {payRun.type.toLowerCase()} - {new Date(payRun.dateDebut).toLocaleDateString()} à {new Date(payRun.dateFin).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {(selectedPayRunId ? payRuns.filter(pr => pr.id === parseInt(selectedPayRunId)) : payRuns).map((payRun) => (
              <div key={payRun.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Cycle {payRun.type.toLowerCase()} - {new Date(payRun.dateDebut).toLocaleDateString()} à {new Date(payRun.dateFin).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Statut: <span className={`px-2 py-1 rounded text-xs ${
                        payRun.status === 'BROUILLON' ? 'bg-yellow-100 text-yellow-800' :
                        payRun.status === 'APPROUVE' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {payRun.status === 'BROUILLON' ? 'Brouillon' :
                         payRun.status === 'APPROUVE' ? 'Approuvé' : 'Clôturé'}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {payRun.payslips?.length || 0} employé(s)
                  </div>
                </div>

                {payRun.payslips && payRun.payslips.length > 0 ? (
                  <Table headers={headers} data={payRun.payslips} renderRow={renderRow} />
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun bulletin pour ce cycle</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Répartition des modes de paiement</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Aucun paiement enregistré</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enregistrer un paiement"
      >
        {selectedPayslip && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">{selectedPayslip.employee?.nomComplet}</h3>
            <p className="text-sm text-gray-600">
              Période: {new Date(selectedPayslip.payRun?.dateDebut).toLocaleDateString()} - {new Date(selectedPayslip.payRun?.dateFin).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Salaire net: {selectedPayslip.net} {selectedPayslip.payRun?.entreprise?.devise}
            </p>
            <p className="text-sm text-gray-600">
              Total payé: {getTotalPaid(selectedPayslip)} {selectedPayslip.payRun?.entreprise?.devise}
            </p>
            <p className="text-sm text-gray-600">
              Restant: {selectedPayslip.net - getTotalPaid(selectedPayslip)} {selectedPayslip.payRun?.entreprise?.devise}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitPayment}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Montant à payer"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ESPECES">Espèces</option>
              <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="WAVE">Wave</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence (optionnel)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Référence transaction"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}