import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Eye, 
  UserPlus, 
  Edit, 
  Trash2 
} from 'lucide-react';

export default function Enterprises() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchEnterprises();
  }, [user, navigate]);

  const fetchEnterprises = async () => {
    try {
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
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      <div className="flex items-center space-x-3">
        {enterprise.logo ? (
          <img 
            src={`http://localhost:3000/${enterprise.logo}`} 
            alt={`Logo ${enterprise.nom}`} 
            className="h-8 w-8 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center';
              fallback.innerHTML = `<span class="text-gray-500 text-sm">${enterprise.nom.charAt(0)}</span>`;
              e.target.parentNode.insertBefore(fallback, e.target);
            }}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">{enterprise.nom.charAt(0)}</span>
          </div>
        )}
        <span>{enterprise.nom}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.adresse}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.devise}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enterprise.typePeriode}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button
        onClick={() => handleViewEmployees(enterprise)}
        className="text-blue-600 hover:text-blue-900 mr-4"
        title="Voir les détails"
      >
        <Eye size={20} />
      </button>
      <button
        onClick={() => handleCreateAdmin(enterprise)}
        className="text-primary hover:text-primary-light mr-4"
        title="Créer un administrateur"
      >
        <UserPlus size={20} />
      </button>
      <button
        onClick={() => handleEdit(enterprise)}
        className="text-yellow-600 hover:text-yellow-900 mr-4"
        title="Modifier l'entreprise"
      >
        <Edit size={20} />
      </button>
      <button
        onClick={() => handleDelete(enterprise.id)}
        className="text-red-600 hover:text-red-900"
        title="Supprimer l'entreprise"
      >
        <Trash2 size={20} />
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



  const handleViewEmployees = (enterprise) => {
      // navigate(`/dashboard?entrepriseId=${enterprise.id}&view=admin`);

    navigate(`/enterprises/${enterprise.id}`);
  };

  const handleCreateAdmin = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setIsAdminModalOpen(true);
  };

  const handleSave = async (enterpriseData) => {
    try {
      const formData = new FormData();
      
      // Handle all fields except logo
      Object.keys(enterpriseData).forEach(key => {
        if (key === 'logo') {
          if (enterpriseData[key] && enterpriseData[key] instanceof File) {
            formData.append('logo', enterpriseData[key]);
          }
        } else {
          formData.append(key, enterpriseData[key]);
        }
      });

      if (!editingEnterprise) {
        // For new enterprise
        const response = await api.post('/entreprises', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEnterprises([...enterprises, response.data]);
      } else {
        // For updating enterprise
        const response = await api.put(`/entreprises/${editingEnterprise.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEnterprises(enterprises.map(ent =>
          ent.id === editingEnterprise.id ? response.data : ent
        ));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving enterprise:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      if (!selectedEnterprise) {
        showError('Aucune entreprise sélectionnée');
        return;
      }

      const payload = {
        nom: adminData.nom,
        email: adminData.email,
        motDePasse: adminData.motDePasse,
        role: 'ADMIN',
        entrepriseId: selectedEnterprise.id,
        actif: true
      };
      
      console.log('Creating admin with payload:', payload);
      const response = await api.post('/users/inscription', payload);
      
      if (response.data) {
        setIsAdminModalOpen(false);
        showSuccess('Administrateur créé avec succès');
        // Optionally refresh data
        fetchEnterprises();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      showError(error.response?.data?.message || 'Erreur lors de la création de l\'administrateur');
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
    typePeriode: 'MENSUELLE',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(enterprise?.logo ? `http://localhost:3000/${enterprise.logo}` : null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      // Créer une URL pour prévisualiser l'image
      const previewURL = URL.createObjectURL(file);
      setLogoPreview(previewURL);
    }
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Logo</label>
        <div className="mt-1 flex items-center space-x-4">
          {logoPreview && (
            <div className="w-20 h-20 relative">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoPreview(null);
                  setFormData({ ...formData, logo: null });
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              name="logo"
              onChange={handleLogoChange}
              accept="image/*"
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Choisir un logo
            </label>
          </div>
        </div>
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
    role: 'ADMIN',
    actif: true  // Add this field
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