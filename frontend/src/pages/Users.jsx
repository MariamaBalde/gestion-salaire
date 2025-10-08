import { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit, Trash2, Mail, Shield, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    if (user?.role === 'SUPER_ADMIN') {
      fetchCompanies();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/entreprises');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };


  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userData);
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
      } else {
        const response = await api.post('/users/inscription', userData);
        setUsers([...users, response.data.utilisateur]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Gestion des Utilisateurs</h1>
          <p className="mt-2" style={{ color: '#6B7280' }}>Gérez tous les utilisateurs de votre plateforme</p>
        </div>
        <Button
          onClick={handleAdd}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Utilisateurs</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>{users.length}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <UsersIcon className="h-6 w-6" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Administrateurs</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Shield className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Caissiers</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {users.filter(u => u.role === 'CAISSIER').length}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <UsersIcon className="h-6 w-6" style={{ color: '#EF4444' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Utilisateurs Actifs</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {users.filter(u => u.actif).length}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Shield className="h-6 w-6" style={{ color: '#3B82F6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((userData) => (
          <div
            key={userData.id}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-6">
              {/* Header with Avatar and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#F3F4F6' }}>
                    <span className="text-lg font-semibold" style={{ color: '#8B5CF6' }}>
                      {userData.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#111827' }}>{userData.nom}</h3>
                    <div className="flex items-center text-sm" style={{ color: '#6B7280' }}>
                      <Mail className="h-4 w-4 mr-1" />
                      {userData.email}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  userData.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {userData.actif ? 'Actif' : 'Inactif'}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Rôle:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    userData.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                    userData.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {userData.role}
                  </span>
                </div>

                {userData.entreprise && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Entreprise:</span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{
                      backgroundColor: '#F3F4F6',
                      color: '#111827'
                    }}>
                      {userData.entreprise.nom}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(userData)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#F59E0B' }}
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(userData.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-100"
                  style={{ color: '#EF4444' }}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
            <UsersIcon className="h-12 w-12" style={{ color: '#8B5CF6' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Aucun utilisateur</h3>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Commencez par créer votre premier utilisateur</p>
          <Button
            onClick={handleAdd}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Créer un utilisateur
          </Button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Éditer utilisateur' : 'Ajouter utilisateur'}
      >
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          currentUser={user}
          companies={companies}
        />
      </Modal>
    </div>
  );
}

function UserForm({ user, onSave, onCancel, currentUser, companies }) {
  const [formData, setFormData] = useState(user || {
    nom: '',
    email: '',
    motDePasse: '',
    role: 'CAISSIER',
    entrepriseId: currentUser?.role === 'ADMIN' ? currentUser.entrepriseId : ''
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
      {!user && (
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
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Rôle</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        >
          {currentUser?.role === 'SUPER_ADMIN' && (
            <option value="ADMIN">Administrateur</option>
          )}
          <option value="CAISSIER">Caissier</option>
        </select>
      </div>
      {currentUser?.role === 'SUPER_ADMIN' && (formData.role === 'ADMIN' || formData.role === 'CAISSIER') && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Entreprise</label>
          <select
            name="entrepriseId"
            value={formData.entrepriseId}
            onChange={(e) => setFormData({ ...formData, entrepriseId: parseInt(e.target.value) })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          >
            <option value="">Sélectionner une entreprise</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.nom}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Sauvegarder</Button>
      </div>
    </form>
  );
}