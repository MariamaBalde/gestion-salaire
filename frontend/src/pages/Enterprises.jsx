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
      console.log('Fetching enterprises...');
      const response = await api.get('/entreprises', {
        params: { createdById: user?.id }
      });
      console.log('Enterprises response:', response.data);
      setEnterprises(response.data);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Gestion des Entreprises</h1>
          <p className="mt-2" style={{ color: '#6B7280' }}>Gérez toutes les entreprises de votre plateforme</p>
        </div>
        <Button
          onClick={handleAdd}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Ajouter une entreprise
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Entreprises</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>{enterprises.length}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <UserPlus className="h-6 w-6" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Entreprises Actives</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>{enterprises.length}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Eye className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Employés</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {enterprises.reduce((total, ent) => total + (ent.employes?.length || 0), 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Eye className="h-6 w-6" style={{ color: '#EF4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Enterprises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enterprises.map((enterprise) => (
          <div
            key={enterprise.id}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-6">
              {/* Header with Logo and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {enterprise.logo ? (
                    <img
                      src={`http://localhost:3000/${enterprise.logo}`}
                      alt={`Logo ${enterprise.nom}`}
                      className="h-12 w-12 rounded-xl object-cover shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallback = e.target.parentNode.querySelector('.fallback-avatar');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm fallback-avatar ${
                    enterprise.logo ? 'hidden' : 'flex'
                  }`} style={{ backgroundColor: '#F3F4F6' }}>
                    <span className="text-lg font-semibold" style={{ color: '#8B5CF6' }}>
                      {enterprise.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#111827' }}>{enterprise.nom}</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{enterprise.adresse}</p>
                  </div>
                </div>
              </div>

              {/* Enterprise Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Devise:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{
                    backgroundColor: '#F3F4F6',
                    color: '#111827'
                  }}>
                    {enterprise.devise}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Période:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    enterprise.typePeriode === 'MENSUELLE' ? 'bg-green-100 text-green-700' :
                    enterprise.typePeriode === 'HEBDOMADAIRE' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {enterprise.typePeriode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Employés:</span>
                  <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {enterprise.employes?.length || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewEmployees(enterprise)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#3B82F6' }}
                    title="Voir les employés"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleCreateAdmin(enterprise)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#8B5CF6' }}
                    title="Créer administrateur"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(enterprise)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#F59E0B' }}
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(enterprise.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-100"
                    style={{ color: '#EF4444' }}
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {enterprises.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
            <UserPlus className="h-12 w-12" style={{ color: '#8B5CF6' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Aucune entreprise</h3>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Commencez par créer votre première entreprise</p>
          <Button
            onClick={handleAdd}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Créer une entreprise
          </Button>
        </div>
      )}

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