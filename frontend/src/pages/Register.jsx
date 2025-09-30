import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    nomEntreprise: '',
    adresseEntreprise: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte Super Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gestion des Salaires Multi-Entreprises
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="nomEntreprise" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
              <input
                id="nomEntreprise"
                name="nomEntreprise"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Nom de votre entreprise"
                value={formData.nomEntreprise}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="adresseEntreprise" className="block text-sm font-medium text-gray-700">Adresse de l'entreprise</label>
              <input
                id="adresseEntreprise"
                name="adresseEntreprise"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Adresse de l'entreprise"
                value={formData.adresseEntreprise}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Mot de passe"
                value={formData.motDePasse}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-primary hover:text-primary-light">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}