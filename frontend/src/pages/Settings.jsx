export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Informations de l'entreprise</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Devise</label>
            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
              <option>EUR (€)</option>
              <option>USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de période</label>
            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
              <option>Mensuel</option>
              <option>Hebdomadaire</option>
              <option>Journalier</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light">
            Sauvegarder
          </button>
        </form>
      </div>
    </div>
  );
}