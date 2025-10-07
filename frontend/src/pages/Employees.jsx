import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Employees() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entrepriseId = searchParams.get('entrepriseId');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const isSuperAdminView = user?.role === 'SUPER_ADMIN' && entrepriseId;
  const showEntrepriseColumn = user?.role === 'SUPER_ADMIN' && !entrepriseId;
  const showActionsColumn = !showEntrepriseColumn;
  const [enterpriseName, setEnterpriseName] = useState('');
  const [filters, setFilters] = useState({
    actif: '',
    poste: '',
    typeContrat: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (entrepriseId) {
      fetchEnterprise();
    }
  }, [entrepriseId]);

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (entrepriseId) params.append('entrepriseId', entrepriseId);
      if (filters.actif) params.append('actif', filters.actif);
      if (filters.poste) params.append('poste', filters.poste);
      if (filters.typeContrat) params.append('typeContrat', filters.typeContrat);

      const queryString = params.toString();
      const response = await api.get(`/employees${queryString ? `?${queryString}` : ''}`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnterprise = async () => {
    try {
      const response = await api.get(`/entreprises/${entrepriseId}`);
      setEnterpriseName(response.data.nom);
    } catch (error) {
      console.error('Error fetching enterprise:', error);
    }
  };

  const headers = ['Nom complet', 'Poste', 'Contrat', 'Salaire', 'Statut'];
  if (showEntrepriseColumn) headers.push('Entreprise');
  if (showActionsColumn) headers.push('Actions');

  const renderRow = (employee) => (
    <tr key={employee.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.nomComplet}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.poste}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.typeContrat}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{employee.tauxSalaire}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => handleToggleActive(employee)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            employee.actif
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          title={employee.actif ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
        >
          {employee.actif ? 'Actif' : 'Inactif'}
        </button>
      </td>
      {showEntrepriseColumn && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.entreprise?.nom}</td>
      )}
      {showActionsColumn && (
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => handleView(employee)}
            className="text-blue-600 hover:text-blue-900 mr-2"
          >
            Détails
          </button>
          <button
            onClick={() => handleEdit(employee)}
            className="text-primary hover:text-primary-light mr-2"
          >
            Éditer
          </button>
          <button
            onClick={() => handleDelete(employee.id)}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </td>
      )}
    </tr>
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleToggleActive = async (employee) => {
    try {
      await api.patch(`/employees/${employee.id}/toggle-active`);
      setEmployees(employees.map(emp =>
        emp.id === employee.id ? { ...emp, actif: !emp.actif } : emp
      ));
    } catch (error) {
      console.error('Error toggling employee status:', error);
    }
  };

  const handleSave = async (employeeData) => {
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, employeeData);
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp));
      } else {
        const response = await api.post('/employees', employeeData);
        setEmployees([...employees, response.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isSuperAdminView ? `Employés de l'entreprise ${enterpriseName}` : user?.role === 'SUPER_ADMIN' ? 'Tous les Employés' : 'Gestion des Employés'}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des employés</h2>
          {!isSuperAdminView && <Button onClick={handleAdd}>Ajouter un employé</Button>}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.actif}
              onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
            <input
              type="text"
              value={filters.poste}
              onChange={(e) => setFilters({ ...filters, poste: e.target.value })}
              placeholder="Rechercher par poste..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
            <select
              value={filters.typeContrat}
              onChange={(e) => setFilters({ ...filters, typeContrat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous</option>
              <option value="JOURNALIER">Journalier</option>
              <option value="FIXE">Fixe</option>
              <option value="HONORAIRE">Honoraire</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ actif: '', poste: '', typeContrat: '' })}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table headers={headers} data={employees} renderRow={renderRow} />
        )}
      </div>

      {!isSuperAdminView && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEmployee ? 'Éditer employé' : 'Ajouter employé'}
        >
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            user={user}
          />
        </Modal>
      )}

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Détails de l'employé"
      >
        {viewingEmployee && <EmployeeDetails employee={viewingEmployee} />}
      </Modal>
    </div>
  );
}

function EmployeeForm({ employee, onSave, onCancel, user }) {
  const [formData, setFormData] = useState(employee || {
    nomComplet: '',
    poste: '',
    typeContrat: '',
    tauxSalaire: '',
    coordonneesBancaires: '',
    actif: true,
    entrepriseId: user?.entrepriseId || 1
  });


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
          value={formData.nomComplet}
          onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Poste</label>
        <input
          type="text"
          value={formData.poste}
          onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Type de contrat</label>
        <select
          value={formData.typeContrat}
          onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        >
          <option value="">Sélectionner</option>
          <option value="JOURNALIER">Journalier</option>
          <option value="FIXE">Fixe</option>
          <option value="HONORAIRE">Honoraire</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Taux salaire</label>
        <input
          type="number"
          step="0.01"
          value={formData.tauxSalaire}
          onChange={(e) => setFormData({ ...formData, tauxSalaire: parseFloat(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Coordonnées bancaires</label>
        <input
          type="text"
          value={formData.coordonneesBancaires}
          onChange={(e) => setFormData({ ...formData, coordonneesBancaires: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Sauvegarder</Button>
      </div>
    </form>
  );
}

function EmployeeDetails({ employee }) {
  return (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
        <dd className="mt-1 text-sm text-gray-900">{employee.nomComplet}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Poste</dt>
        <dd className="mt-1 text-sm text-gray-900">{employee.poste}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Type de contrat</dt>
        <dd className="mt-1 text-sm text-gray-900">{employee.typeContrat}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Taux salaire</dt>
        <dd className="mt-1 text-sm text-gray-900">€{employee.tauxSalaire}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Coordonnées bancaires</dt>
        <dd className="mt-1 text-sm text-gray-900">{employee.coordonneesBancaires || 'N/A'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Statut</dt>
        <dd className="mt-1 text-sm text-gray-900">{employee.actif ? 'Actif' : 'Inactif'}</dd>
      </div>
      {employee.entreprise && (
        <div>
          <dt className="text-sm font-medium text-gray-500">Entreprise</dt>
          <dd className="mt-1 text-sm text-gray-900">{employee.entreprise.nom}</dd>
        </div>
      )}
    </dl>
  );
}