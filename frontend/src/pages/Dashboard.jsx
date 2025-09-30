import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Table from "../components/Table";
import Badge from "../components/Badge";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entrepriseId = searchParams.get("entrepriseId");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterprise, setEnterprise] = useState(null);
  const [stats, setStats] = useState({
    totalSalaire: 0,
    montantPaye: 0,
    montantRestant: 0,
    employesActifs: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Auth token:", token);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let enterpriseData;
        let employeesData;

        console.log("Loading dashboard data...");
        console.log("entrepriseId:", entrepriseId);
        console.log("user:", user);

        if (entrepriseId) {
          console.log("Fetching data for specific enterprise...");
          const [enterpriseResponse, employeesResponse] = await Promise.all([
            api.get(`/entreprises/${entrepriseId}`),
            api.get(`/employees?entrepriseId=${entrepriseId}`),
          ]);
          console.log("Enterprise response:", enterpriseResponse.data);
          console.log("Employees response:", employeesResponse.data);
          enterpriseData = enterpriseResponse.data;
          employeesData = employeesResponse.data;
        } else if (user?.entrepriseId) {
          console.log("Fetching data for user enterprise...");
          const [enterpriseResponse, employeesResponse] = await Promise.all([
            api.get(`/entreprises/${user.entrepriseId}`),
            api.get("/employees"),
          ]);
          console.log("Enterprise response:", enterpriseResponse.data);
          console.log("Employees response:", employeesResponse.data);
          enterpriseData = enterpriseResponse.data;
          employeesData = employeesResponse.data;
        }

        if (enterpriseData) {
          console.log("Setting enterprise data:", enterpriseData);
          setEnterprise(enterpriseData);
          setEnterpriseName(enterpriseData.nom);
        }

        if (employeesData) {
          console.log("Setting employees data:", employeesData);
          setEmployees(employeesData); 

          const activeEmployees = employeesData.filter((emp) => emp.actif);
          const totalSalaire = employeesData.reduce(
            (sum, emp) => sum + parseFloat(emp.tauxSalaire || 0),
            0
          );

          const montantPaye = totalSalaire * 0.75;
          const montantRestant = totalSalaire - montantPaye;

          const newStats = {
            totalSalaire,
            montantPaye,
            montantRestant,
            employesActifs: activeEmployees.length,
          };
          console.log("Setting stats:", newStats);
          setStats(newStats);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        console.error("Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (entrepriseId || user?.entrepriseId) {
      loadData();
    }
  }, [entrepriseId, user]);

  if (!enterprise && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Aucune donnée d'entreprise disponible</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  const welcomeMessage =
    user?.role === "SUPER_ADMIN"
      ? `Vue d'ensemble de ${enterpriseName}`
      : `Bienvenue, Administrateur de ${enterpriseName}`;

  const subtitle =
    user?.role === "SUPER_ADMIN"
      ? `Détails de l'entreprise`
      : `Tableau de bord`;

  return (
    <div className="p-6 bg-[#F8F9FF]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#242F57]">
            {welcomeMessage}
          </h1>
          <p className="text-[#575D6E]">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4263EB]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="relative">
            <button className="p-2 bg-white rounded-full shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {enterprise && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-medium text-[#242F57] mb-4">
              Informations de l'entreprise
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#575D6E]">Nom:</p>
                <p className="font-medium">{enterprise.nom}</p>
              </div>
              <div>
                <p className="text-sm text-[#575D6E]">Adresse:</p>
                <p className="font-medium">{enterprise.adresse}</p>
              </div>
              <div>
                <p className="text-sm text-[#575D6E]">Devise:</p>
                <p className="font-medium">{enterprise.devise}</p>
              </div>
              <div>
                <p className="text-sm text-[#575D6E]">Type de période:</p>
                <p className="font-medium">{enterprise.typePeriode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards avec les vraies valeurs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Masse salariale totale"
          value={`${stats.totalSalaire.toLocaleString()} FCFA`}
          icon="money"
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Montant payé"
          value={`${stats.montantPaye.toLocaleString()} FCFA`}
          icon="check"
          trend="+8%"
          color="green"
        />
        <StatCard
          title="Montant restant"
          value={`${stats.montantRestant.toLocaleString()} FCFA`}
          icon="clock"
          trend="En attente"
          color="orange"
        />
        <StatCard
          title="Employés actifs"
          value={stats.employesActifs}
          icon="users"
          trend="Actifs"
          color="purple"
        />
      </div>

      {/* Table des employés */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#242F57] mb-4">
          Liste des employés
        </h2>
        {employees.length > 0 ? (
          <Table
            headers={[
              "Nom complet",
              "Poste",
              "Contrat",
              "Salaire",
              "Statut",
              "Entreprise", // Toujours inclure la colonne entreprise
            ]}
            data={employees}
            renderRow={(employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.nomComplet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.poste}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.typeContrat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {parseInt(employee.tauxSalaire).toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={employee.actif ? "active" : "inactive"}>
                    {employee.actif ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.entreprise?.nom || "-"}
                </td>
              </tr>
            )}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun employé trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const icons = {
    money: "💰",
    check: "✅",
    clock: "⏰",
    users: "👥",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          <span className="text-2xl">{icons[icon]}</span>
        </div>
        <span className={`text-sm text-${color}-500`}>{trend}</span>
      </div>
      <p className="text-[#575D6E] text-sm mb-2">{title}</p>
      <p className="text-2xl font-bold text-[#242F57]">{value}</p>
    </div>
  );
}
