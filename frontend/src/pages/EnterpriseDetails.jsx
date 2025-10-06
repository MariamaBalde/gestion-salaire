import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function EnterpriseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState(null);
  const [stats, setStats] = useState({
    employesActifs: 0,
    masseSalariale: 0,
    montantPaye: 0,
    montantRestant: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchEnterpriseDetails();
  }, [id, user, navigate]);

  const fetchEnterpriseDetails = async () => {
    try {
      const [enterpriseResponse, statsResponse] = await Promise.all([
        api.get(`/entreprises/${id}`),
        api.get(`/dashboard/kpis?entrepriseId=${id}`)
      ]);
      
      setEnterprise(enterpriseResponse.data);
      setStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching enterprise details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!enterprise) {
    return <div className="p-6">Entreprise non trouvée</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Détails de l'entreprise</h1>
        <Button variant="secondary" onClick={() => navigate('/enterprises')}>
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Informations générales</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900">{enterprise.nom}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Adresse</dt>
              <dd className="mt-1 text-sm text-gray-900">{enterprise.adresse}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Devise</dt>
              <dd className="mt-1 text-sm text-gray-900">{enterprise.devise}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type de période</dt>
              <dd className="mt-1 text-sm text-gray-900">{enterprise.typePeriode}</dd>
            </div>
          </dl>
        </div>

        {/* Statistiques */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Statistiques</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Employés actifs</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.employesActifs}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Masse salariale</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.masseSalariale.toLocaleString()} {enterprise.devise}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Montant payé</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600">
                {stats.montantPaye.toLocaleString()} {enterprise.devise}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Montant restant</dt>
              <dd className="mt-1 text-2xl font-semibold text-red-600">
                {stats.montantRestant.toLocaleString()} {enterprise.devise}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <Button onClick={() => navigate(`/employees?entrepriseId=${enterprise.id}`)}>
          Voir les employés
        </Button>
        <Button onClick={() => navigate(`/dashboard?entrepriseId=${enterprise.id}`)}>
          Voir le tableau de bord
        </Button>
      </div>
    </div>
  );
}