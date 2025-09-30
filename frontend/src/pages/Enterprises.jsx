import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Enterprises() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);

  useEffect(() => {
    // Vérification du rôle super admin
    if (user?.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchEnterprises();
  }, [user, navigate]);

  const fetchEnterprises = async () => {
    try {
      // Ajouter l'ID du super admin dans la requête
      const response = await api.get('/entreprises', {
        params: { createdById: user?.id }
      });
      setEnterprises(response.data);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
    }
  };

  const headers = ['Nom', 'Adresse', 'Devise', 'Type de période', 'Actions'];

  const renderRow = (enterprise) => (
    <tr key={enterprise.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enterprise.nom}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.adresse}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.devise}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.typePeriode}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => handleViewEmployees(enterprise)}
          className="text-blue-600 hover:text-blue-900 mr-2"
        >
          Voir Employés
        </button>
        <button
          onClick={() => handleViewDashboard(enterprise)}
          className="text-green-600 hover:text-green-900 mr-2"
        >
          Voir Dashboard
        </button>
        <button
          onClick={() => handleCreateAdmin(enterprise)}
          className="text-primary hover:text-primary-light mr-2"
        >
          Créer Admin
        </button>
        <button
          onClick={() => handleEdit(enterprise)}
          className="text-blue-600 hover:text-blue-900 mr-2"
        >
          Éditer
        </button>
        <button
          onClick={() => handleDelete(enterprise.id)}
          className="text-red-600 hover:text-red-900"
        >
          Supprimer
        </button>
      </td>
    </tr>
  );

  const handleAdd = () => {
    setEditingEnterprise(null);
    setIsModalOpen(true);
  };

  const handleEdit = (enterprise) => {
    setEditingEnterprise(enterprise);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/entreprises/${id}`);
      setEnterprises(enterprises.filter(ent => ent.id !== id));
    } catch (error) {
      console.error('Error deleting enterprise:', error);
    }
  };

  const handleViewDashboard = (enterprise) => {
    navigate(`/dashboard?entrepriseId=${enterprise.id}`);
  };

  const handleViewEmployees = (enterprise) => {
    navigate(`/employees?entrepriseId=${enterprise.id}`);
  };

  const handleCreateAdmin = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setIsAdminModalOpen(true);
  };

  const handleSave = async (enterpriseData) => {
    try {
      console.log('Sending enterprise data:', enterpriseData);
      if (editingEnterprise) {
        await api.put(`/entreprises/${editingEnterprise.id}`, {
          ...enterpriseData,
          createdById: user.id
        });
        setEnterprises(enterprises.map(ent => 
          ent.id === editingEnterprise.id ? { ...ent, ...enterpriseData } : ent
        ));
      } else {
        const response = await api.post('/entreprises', {
          ...enterpriseData,
          createdById: user.id
        });
        setEnterprises([...enterprises, response.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving enterprise:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      const dataWithCompany = { ...adminData, entrepriseId: selectedEnterprise.id };
      await api.post('/users/inscription', dataWithCompany);
      setIsAdminModalOpen(false);
      alert('Administrateur créé avec succès');
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Entreprises</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des entreprises</h2>
          <Button onClick={handleAdd}>Ajouter une entreprise</Button>
        </div>
        <Table headers={headers} data={enterprises} renderRow={renderRow} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEnterprise ? 'Éditer entreprise' : 'Ajouter entreprise'}
      >
        <EnterpriseForm
          enterprise={editingEnterprise}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title={`Créer administrateur pour ${selectedEnterprise?.nom}`}
      >
        <AdminForm
          onSave={handleSaveAdmin}
          onCancel={() => setIsAdminModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function EnterpriseForm({ enterprise, onSave, onCancel }) {
  const [formData, setFormData] = useState(enterprise || {
    nom: '',
    adresse: '',
    devise: 'XOF',
    typePeriode: 'MENSUELLE'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse</label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Devise</label>
        <select
          name="devise"
          value={formData.devise}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        >
          <option value="XOF">XOF (Franc CFA)</option>
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Type de période</label>
        <select
          name="typePeriode"
          value={formData.typePeriode}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        >
          <option value="MENSUELLE">Mensuelle</option>
          <option value="HEBDOMADAIRE">Hebdomadaire</option>
          <option value="JOURNALIERE">Journalière</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Sauvegarder</Button>
      </div>
    </form>
  );
}

function AdminForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    role: 'ADMIN'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          type="password"
          name="motDePasse"
          value={formData.motDePasse}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Créer Administrateur</Button>
      </div>
    </form>
  );
}