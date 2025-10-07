import { Edit, Trash2, Eye } from 'lucide-react';
import Table from './Table';
import Button from './Button';

export default function EmployeeTable({ employees, onEdit, onDelete, onView }) {
  const headers = [
    'Nom Complet',
    'Poste',
    'Type de Contrat',
    'Salaire',
    'Statut',
    'Actions'
  ];

  const renderRow = (employee) => (
    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {employee.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {employee.nomComplet}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        {employee.poste}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          employee.typeContrat === 'FIXE'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {employee.typeContrat}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
        {employee.tauxSalaire.toLocaleString()} FCFA
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          employee.actif
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {employee.actif ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {onView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onView(employee)}
              className="p-1"
              title="Voir détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(employee)}
              className="p-1"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(employee)}
              className="p-1"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Liste des Employés ({employees.length})
        </h3>
      </div>
      <Table
        headers={headers}
        data={employees}
        renderRow={renderRow}
      />
      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun employé trouvé</p>
        </div>
      )}
    </div>
  );
}