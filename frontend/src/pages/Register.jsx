import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { registerSchema } from '../validation/validation';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    nomEntreprise: '',
    adresseEntreprise: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Register form submitted with:', formData);

    // Validate form data
    const result = registerSchema.safeParse(formData);
    console.log('Register validation result:', result);

    if (!result.success) {
      console.log('Register validation failed with result:', result);
      try {
        const errors = result.error.errors;
        console.log('Accessing register errors:', errors);
        if (errors && Array.isArray(errors)) {
          const newErrors = {};
          errors.forEach((error) => {
            console.log('Processing register error:', error);
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          console.error('Register errors is not an array:', errors);
          setErrors({ general: 'Erreur de validation' });
        }
      } catch (e) {
        console.error('Error accessing register result.error.errors:', e);
        // Try alternative access
        try {
          const altErrors = result.error.issues || result.error;
          console.log('Trying alternative register access:', altErrors);
          if (Array.isArray(altErrors)) {
            const newErrors = {};
            altErrors.forEach((error) => {
              newErrors[error.path[0]] = error.message;
            });
            setErrors(newErrors);
          } else {
            setErrors({ general: 'Erreur de validation' });
          }
        } catch (e2) {
          console.error('All register error access methods failed:', e2);
          setErrors({ general: 'Erreur de validation' });
        }
      }
      return;
    }

    console.log('Register validation passed');
    setErrors({});

    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle server errors if needed
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                id="nom"
                name="nom"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm ${
                  errors.nom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                onBlur={() => {
                  const result = registerSchema.shape.nom.safeParse(formData.nom);
                  console.log('Nom validation result:', result);
                  if (!result.success) {
                    try {
                      const errorMessage = result.error.errors[0].message;
                      setErrors({ ...errors, nom: errorMessage });
                    } catch {
                      try {
                        const altError = result.error.issues[0] || result.error[0];
                        setErrors({ ...errors, nom: altError.message });
                      } catch {
                        setErrors({ ...errors, nom: 'Le nom est requis' });
                      }
                    }
                  } else {
                    setErrors({ ...errors, nom: '' });
                  }
                }}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>
            <div>
              <label htmlFor="nomEntreprise" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
              <input
                id="nomEntreprise"
                name="nomEntreprise"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm ${
                  errors.nomEntreprise ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom de votre entreprise"
                value={formData.nomEntreprise}
                onChange={handleChange}
                onBlur={() => {
                  const result = registerSchema.shape.nomEntreprise.safeParse(formData.nomEntreprise);
                  console.log('NomEntreprise validation result:', result);
                  if (!result.success) {
                    try {
                      const errorMessage = result.error.errors[0].message;
                      setErrors({ ...errors, nomEntreprise: errorMessage });
                    } catch {
                      try {
                        const altError = result.error.issues[0] || result.error[0];
                        setErrors({ ...errors, nomEntreprise: altError.message });
                      } catch {
                        setErrors({ ...errors, nomEntreprise: 'Le nom de l\'entreprise est requis' });
                      }
                    }
                  } else {
                    setErrors({ ...errors, nomEntreprise: '' });
                  }
                }}
              />
              {errors.nomEntreprise && <p className="mt-1 text-sm text-red-600">{errors.nomEntreprise}</p>}
            </div>
            <div>
              <label htmlFor="adresseEntreprise" className="block text-sm font-medium text-gray-700">Adresse de l'entreprise</label>
              <input
                id="adresseEntreprise"
                name="adresseEntreprise"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm ${
                  errors.adresseEntreprise ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adresse de l'entreprise"
                value={formData.adresseEntreprise}
                onChange={handleChange}
                onBlur={() => {
                  const result = registerSchema.shape.adresseEntreprise.safeParse(formData.adresseEntreprise);
                  console.log('AdresseEntreprise validation result:', result);
                  if (!result.success) {
                    try {
                      const errorMessage = result.error.errors[0].message;
                      setErrors({ ...errors, adresseEntreprise: errorMessage });
                    } catch {
                      try {
                        const altError = result.error.issues[0] || result.error[0];
                        setErrors({ ...errors, adresseEntreprise: altError.message });
                      } catch {
                        setErrors({ ...errors, adresseEntreprise: 'L\'adresse de l\'entreprise est requise' });
                      }
                    }
                  } else {
                    setErrors({ ...errors, adresseEntreprise: '' });
                  }
                }}
              />
              {errors.adresseEntreprise && <p className="mt-1 text-sm text-red-600">{errors.adresseEntreprise}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => {
                  const result = registerSchema.shape.email.safeParse(formData.email);
                  console.log('Email validation result:', result);
                  if (!result.success) {
                    try {
                      const errorMessage = result.error.errors[0].message;
                      setErrors({ ...errors, email: errorMessage });
                    } catch {
                      try {
                        const altError = result.error.issues[0] || result.error[0];
                        setErrors({ ...errors, email: altError.message });
                      } catch {
                        setErrors({ ...errors, email: 'Veuillez entrer une adresse email valide' });
                      }
                    }
                  } else {
                    setErrors({ ...errors, email: '' });
                  }
                }}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm ${
                  errors.motDePasse ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mot de passe"
                value={formData.motDePasse}
                onChange={handleChange}
                onBlur={() => {
                  const result = registerSchema.shape.motDePasse.safeParse(formData.motDePasse);
                  console.log('MotDePasse validation result:', result);
                  if (!result.success) {
                    try {
                      const errorMessage = result.error.errors[0].message;
                      setErrors({ ...errors, motDePasse: errorMessage });
                    } catch {
                      try {
                        const altError = result.error.issues[0] || result.error[0];
                        setErrors({ ...errors, motDePasse: altError.message });
                      } catch {
                        setErrors({ ...errors, motDePasse: 'Le mot de passe doit contenir au moins 6 caractères' });
                      }
                    }
                  } else {
                    setErrors({ ...errors, motDePasse: '' });
                  }
                }}
              />
              {errors.motDePasse && <p className="mt-1 text-sm text-red-600">{errors.motDePasse}</p>}
            </div>
          </div>

          {errors.general && (
            <div className="text-red-600 text-sm text-center">
              {errors.general}
            </div>
          )}

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