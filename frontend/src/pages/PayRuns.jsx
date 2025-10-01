import { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function PayRuns() {
  const { user } = useAuth();
  const [payRuns, setPayRuns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayRuns();
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

  const handleCreate = async (payRunData) => {
    try {
      await api.post('/payruns', payRunData);
      setIsModalOpen(false);
      fetchPayRuns(); // Refresh list
    } catch (error) {
      console.error('Error creating payrun:', error);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'BROUILLON': return 'Brouillon';
      case 'APPROUVE': return 'Approuvé';
      case 'CLOTURE': return 'Clôturé';
      default: return status;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'BROUILLON': return 'default';
      case 'APPROUVE': return 'success';
      case 'CLOTURE': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cycles de Paie</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des cycles</h2>
          <Button onClick={() => setIsModalOpen(true)}>Créer un cycle de paie</Button>
        </div>
        <div className="space-y-4">
          {payRuns.map((payRun) => (
            <div key={payRun.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    Cycle {payRun.type.toLowerCase()} - {new Date(payRun.dateDebut).toLocaleDateString()} à {new Date(payRun.dateFin).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Employés: {payRun.payslips?.length || 0} | Statut: <Badge variant={getStatusVariant(payRun.status)}>
                      {getStatusLabel(payRun.status)}
                    </Badge>
                  </p>
                </div>
                <Button variant="secondary">Voir détails</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer un cycle de paie"
      >
        <PayRunForm
          onSave={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          currentUser={user}
        />
      </Modal>
    </div>
  );
}

function PayRunForm({ onSave, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    entrepriseId: currentUser?.role === 'ADMIN' ? currentUser.entrepriseId : '',
    type: 'MENSUELLE',
    dateDebut: '',
    dateFin: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'entrepriseId' ? parseInt(value) : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {currentUser?.role === 'SUPER_ADMIN' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Entreprise ID</label>
          <input
            type="number"
            name="entrepriseId"
            value={formData.entrepriseId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Type de période</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        >
          <option value="MENSUELLE">Mensuelle</option>
          <option value="HEBDOMADAIRE">Hebdomadaire</option>
          <option value="JOURNALIERE">Journalière</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date de début</label>
        <input
          type="date"
          name="dateDebut"
          value={formData.dateDebut}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date de fin</label>
        <input
          type="date"
          name="dateFin"
          value={formData.dateFin}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Créer</Button>
      </div>
    </form>
  );
}