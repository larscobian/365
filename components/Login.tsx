import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión. Verifica tu configuración de Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1c1f2e] border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Proyecto 365</h1>
        <p className="text-gray-400 mb-8">Inicia sesión para sincronizar y proteger tu progreso en la nube.</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm text-left">
                <AlertCircle size={16} className="shrink-0" />
                {error}
            </div>
        )}

        <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
                <>
                   <LogIn size={20} />
                   Continuar con Google
                </>
            )}
        </button>
        
        <p className="mt-6 text-xs text-gray-600">
            Asegúrate de configurar tu <code>FIREBASE_API_KEY</code> en el entorno.
        </p>
      </div>
    </div>
  );
};

export default Login;
