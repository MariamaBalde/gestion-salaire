import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, Edit, Trash2, Briefcase, DollarSign, Building } from 'lucide-react';

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
  const [enterpriseName, setEnterpriseName] = useState('');
  const [filters, setFilters] = useState({
    actif: '',
    poste: '',
    typeContrat: ''
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (entrepriseId) params.append('entrepriseId', entrepriseId);
      if (filters.actif) params.append('actif', filters.actif === 'true');
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
  }, [entrepriseId, filters.actif, filters.poste, filters.typeContrat]);

  const fetchEnterprise = useCallback(async () => {
    try {
      const response = await api.get(`/entreprises/${entrepriseId}`);
      setEnterpriseName(response.data.nom);
    } catch (error) {
      console.error('Error fetching enterprise:', error);
    }
  }, [entrepriseId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (entrepriseId) {
      fetchEnterprise();
    }
  }, [entrepriseId, fetchEnterprise]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            {isSuperAdminView ? `Employés de ${enterpriseName}` : user?.role === 'SUPER_ADMIN' ? 'Tous les Employés' : 'Gestion des Employés'}
          </h1>
          <p className="mt-2" style={{ color: '#6B7280' }}>
            Gérez les employés {isSuperAdminView ? `de ${enterpriseName}` : 'de votre plateforme'}
          </p>
        </div>
        {!isSuperAdminView && (
          <Button
            onClick={handleAdd}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Ajouter un employé
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Employés</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>{employees.length}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <UserPlus className="h-6 w-6" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Employés Actifs</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {employees.filter(emp => emp.actif).length}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Eye className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Contrats Fixes</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {employees.filter(emp => emp.typeContrat === 'FIXE').length}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <Briefcase className="h-6 w-6" style={{ color: '#EF4444' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Salaire Moyen</p>
              <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                {employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.tauxSalaire, 0) / employees.length) : 0}€
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
              <DollarSign className="h-6 w-6" style={{ color: '#3B82F6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Statut</label>
            <select
              value={filters.actif}
              onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors"
              style={{ borderColor: '#E5E7EB', '--tw-ring-color': '#3B82F6' }}
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Poste</label>
            <input
              type="text"
              value={filters.poste}
              onChange={(e) => setFilters({ ...filters, poste: e.target.value })}
              placeholder="Rechercher par poste..."
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors"
              style={{ borderColor: '#E5E7EB', '--tw-ring-color': '#3B82F6' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Type de contrat</label>
            <select
              value={filters.typeContrat}
              onChange={(e) => setFilters({ ...filters, typeContrat: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors"
              style={{ borderColor: '#E5E7EB', '--tw-ring-color': '#3B82F6' }}
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
              className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#6B7280' }}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Employees Cards Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#3B82F6' }}></div>
          <p style={{ color: '#6B7280' }}>Chargement des employés...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
              style={{ borderColor: '#E5E7EB' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#F3F4F6' }}>
                      <span className="text-lg font-semibold" style={{ color: '#8B5CF6' }}>
                        {employee.nomComplet.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: '#111827' }}>{employee.nomComplet}</h3>
                      <p className="text-sm" style={{ color: '#6B7280' }}>{employee.poste}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    employee.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.actif ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Contrat:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee.typeContrat === 'FIXE' ? 'bg-blue-100 text-blue-700' :
                      employee.typeContrat === 'JOURNALIER' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {employee.typeContrat}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Salaire:</span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{
                      backgroundColor: '#F3F4F6',
                      color: '#111827'
                    }}>
                      {employee.tauxSalaire}€
                    </span>
                  </div>

                  {showEntrepriseColumn && employee.entreprise && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Entreprise:</span>
                      <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{
                        backgroundColor: '#F3F4F6',
                        color: '#111827'
                      }}>
                        {employee.entreprise.nom}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(employee)}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                      style={{ color: '#3B82F6' }}
                      title="Voir les détails"
                    >
                      <Eye size={18} />
                    </button>
                    {!isSuperAdminView && (
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: '#F59E0B' }}
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(employee)}
                      className={`p-2 rounded-lg transition-colors ${
                        employee.actif ? 'hover:bg-green-100' : 'hover:bg-red-100'
                      }`}
                      style={{ color: employee.actif ? '#10B981' : '#EF4444' }}
                      title={employee.actif ? 'Désactiver' : 'Activer'}
                    >
                      <div className={`w-2 h-2 rounded-full ${employee.actif ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </button>
                    {!isSuperAdminView && (
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-100"
                        style={{ color: '#EF4444' }}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
            <UserPlus className="h-12 w-12" style={{ color: '#8B5CF6' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Aucun employé</h3>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            {isSuperAdminView ? `Aucun employé dans ${enterpriseName}` : 'Commencez par créer votre premier employé'}
          </p>
          {!isSuperAdminView && (
            <Button
              onClick={handleAdd}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Créer un employé
            </Button>
          )}
        </div>
      )}

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
          onChange={(e) => setFormData({ ...formData, tauxSalaire: parseFloat(e.target.value) || 0 })}
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