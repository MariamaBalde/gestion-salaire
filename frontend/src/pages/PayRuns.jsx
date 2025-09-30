import Badge from '../components/Badge';
import Button from '../components/Button';

const mockPayRuns = [
  { id: 1, name: 'Cycle Mensuel - Octobre 2023', status: 'approved', employees: 25 },
  { id: 2, name: 'Cycle Mensuel - Novembre 2023', status: 'draft', employees: 26 },
];

export default function PayRuns() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cycles de Paie</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Liste des cycles</h2>
          <Button>Créer un cycle de paie</Button>
        </div>
        <div className="space-y-4">
          {mockPayRuns.map((payRun) => (
            <div key={payRun.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{payRun.name}</h3>
                  <p className="text-sm text-gray-500">
                    Employés: {payRun.employees} | Statut: <Badge variant={payRun.status}>
                      {payRun.status === 'approved' ? 'Approuvé' : 'Brouillon'}
                    </Badge>
                  </p>
                </div>
                <Button variant="secondary">Voir détails</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}