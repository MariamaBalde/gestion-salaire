import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('ESPECES');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchPayRuns();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayRuns = async () => {
    try {
      const response = await api.get('/payruns');
      setPayRuns(response.data);
    } catch (error) {
      console.error('Error fetching payruns:', error);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', {
        payslipId: parseInt(selectedPayslip),
        montant: parseFloat(amount),
        modePaiement: paymentMode
      });
      setShowModal(false);
      setSelectedPayslip('');
      setAmount('');
      setPaymentMode('ESPECES');
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const headers = ['Employé', 'Période', 'Montant', 'Mode de paiement', 'Statut', 'Actions'];

  const renderRow = (payment) => (
    <tr key={payment.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {payment.payslip?.employee?.nomComplet || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {payment.payslip?.payRun ? `${payment.payslip.payRun.dateDebut} - ${payment.payslip.payRun.dateFin}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {payment.montant} {payment.payslip?.payRun?.entreprise?.devise || 'XOF'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {payment.modePaiement}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={payment.payslip?.status === 'PAYE' ? 'success' : payment.payslip?.status === 'PARTIEL' ? 'warning' : 'default'}>
          {payment.payslip?.status === 'PAYE' ? 'Payé' : payment.payslip?.status === 'PARTIEL' ? 'Partiel' : 'En attente'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={() => downloadReceipt(payment.id)} className="text-blue-600 hover:text-blue-800 mr-2">Reçu</button>
        <button className="text-primary hover:text-primary-light mr-2">Modifier</button>
        <button className="text-red-600 hover:text-red-800">Supprimer</button>
      </td>
    </tr>
  );

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paiements</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des paiements</h2>
          <Button onClick={() => setShowModal(true)}>Enregistrer un paiement</Button>
        </div>
        <Table headers={headers} data={payments} renderRow={renderRow} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enregistrer un paiement"
      >
        <form onSubmit={handleSubmitPayment}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un bulletin
            </label>
            <select
              value={selectedPayslip}
              onChange={(e) => setSelectedPayslip(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Choisir un bulletin...</option>
              {payRuns.map((payRun) =>
                payRun.payslips?.map((payslip) => (
                  <option key={payslip.id} value={payslip.id}>
                    {payslip.employee.nomComplet} - {payRun.dateDebut} à {payRun.dateFin} ({payslip.net} {payRun.entreprise.devise})
                  </option>
                ))
              )}
            </select>
          </div>

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