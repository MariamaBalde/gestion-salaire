import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';

const mockPayments = [
  { id: 1, employee: 'John Doe', period: 'Octobre 2023', amount: 3000, status: 'paid' },
  { id: 2, employee: 'Jane Smith', period: 'Octobre 2023', amount: 2500, status: 'partial' },
];

export default function Payments() {
  const headers = ['Employé', 'Période', 'Montant', 'Statut', 'Actions'];

  const renderRow = (payment, index) => (
    <tr key={payment.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.employee}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.period}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{payment.amount}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={payment.status}>
          {payment.status === 'paid' ? 'Payé' : payment.status === 'partial' ? 'Partiel' : 'En attente'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button className="text-primary hover:text-primary-light">Télécharger PDF</button>
      </td>
    </tr>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paiements</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des bulletins</h2>
          <Button>Enregistrer un paiement</Button>
        </div>
        <Table headers={headers} data={mockPayments} renderRow={renderRow} />
      </div>
    </div>
  );
}