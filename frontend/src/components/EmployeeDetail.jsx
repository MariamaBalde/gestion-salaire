import { X, Mail, Phone, MapPin, Calendar, DollarSign, FileText, Edit } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export default function EmployeeDetail({ employee, onClose, onEdit }) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Détails de l'Employé
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header with Avatar */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xl font-medium text-blue-800 dark:text-blue-200">
                      {employee.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {employee.nomComplet}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{employee.poste}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    employee.actif
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {employee.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Salaire</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {employee.tauxSalaire.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type de Contrat</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {employee.typeContrat}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date d'embauche</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(employee.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Coordonnées Bancaires</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                        {employee.coordonneesBancaires}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Informations Supplémentaires
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">ID Employé:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-mono">#{employee.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Dernière mise à jour:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(employee.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {onEdit && (
              <Button
                onClick={() => onEdit(employee)}
                className="w-full sm:w-auto sm:ml-3"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto sm:mt-0 mt-3"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}