import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting with:', { email, password });

    setErrors({});

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);

      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Email ou mot de passe incorrect' });
      } else if (error.response?.status === 404) {
        setErrors({ general: 'Compte utilisateur non trouvé' });
      } else if (error.response?.status === 422) {
        setErrors({ general: 'Données de connexion invalides' });
      } else {
        setErrors({ general: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
      <div className="p-8 bg-white rounded-3xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#4263EB] rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#242F57] mb-2">PayrollPro</h1>
          <h2 className="text-2xl font-bold text-[#242F57]">Bon retour !</h2>
          <p className="text-[#575D6E] mt-2">Connectez-vous à votre compte</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#242F57]">Email</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`pl-10 w-full px-3 py-2.5 border rounded-xl focus:ring-[#4263EB] focus:border-[#4263EB] text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  onBlur={() => {
                    // Clear any previous email errors when user focuses out
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 pl-10">{errors.email}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#242F57]">Mot de passe</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={`pl-10 w-full px-3 py-2.5 border rounded-xl focus:ring-[#4263EB] focus:border-[#4263EB] text-sm ${
                    errors.motDePasse ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="********"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.motDePasse) {
                      setErrors({ ...errors, motDePasse: '' });
                    }
                  }}
                  onBlur={() => {
                    // Clear any previous password errors when user focuses out
                    if (errors.motDePasse) {
                      setErrors({ ...errors, motDePasse: '' });
                    }
                  }}
                />
                {errors.motDePasse && <p className="mt-1 text-sm text-red-600 pl-10">{errors.motDePasse}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#4263EB] focus:ring-[#4263EB] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#575D6E]">
                Se souvenir de moi
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-[#4263EB] hover:text-[#2a4bdb]">
                Mot de passe oublié ?
              </a>
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
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#4263EB] hover:bg-[#2a4bdb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4263EB] disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          {/* <div className="text-center text-sm">
            <span className="text-[#575D6E]">Pas encore de compte ? </span>
            <Link to="/register" className="font-medium text-[#4263EB] hover:text-[#2a4bdb]">
              Inscrivez-vous
            </Link>
          </div> */}
        </form>
      </div>
    </div>
  );
}