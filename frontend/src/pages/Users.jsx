import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';

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

  const headers = ['Nom', 'Email', 'Rôle', 'Statut', 'Actions'];

  const renderRow = (user) => (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nom}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={user.actif ? 'active' : 'inactive'}>{user.actif ? 'Actif' : 'Inactif'}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => handleEdit(user)}
          className="text-primary hover:text-primary-light mr-2"
        >
          Éditer
        </button>
        <button
          onClick={() => handleDelete(user.id)}
          className="text-red-600 hover:text-red-900"
        >
          Supprimer
        </button>
      </td>
    </tr>
  );

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Utilisateurs</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des utilisateurs</h2>
          <Button onClick={handleAdd}>Ajouter un utilisateur</Button>
        </div>
        <Table headers={headers} data={users} renderRow={renderRow} />
      </div>

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