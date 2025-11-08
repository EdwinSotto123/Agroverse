import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sprout, Lock, User, AlertCircle } from 'lucide-react';

// URL del backend desde variables de entorno
// En desarrollo usa /api (proxy de Vite)
// En producción usa la URL completa del backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginResponse {
  success: boolean;
  user_id?: number;
  usuario?: string;
  token?: string;
  message?: string;
  error?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  // Cuentas de prueba
  const testAccounts = [
    { usuario: 'farmer_john', contrasena: 'greenfield123', desc: 'Agricultor principiante' },
    { usuario: 'harvest_mary', contrasena: 'sunnyfarm', desc: 'Experta en cosechas' },
    { usuario: 'cropmaster_tom', contrasena: 'corn2025', desc: 'Maestro de cultivos' },
    { usuario: 'soilkeeper_anna', contrasena: 'earthlove', desc: 'Especialista en suelos' },
    { usuario: 'rancher_mike', contrasena: 'cowboy77', desc: 'Ganadero experimentado' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Validación local sin backend - cualquier cuenta de prueba es válida
      const validAccount = testAccounts.find(
        acc => acc.usuario === usuario && acc.contrasena === contrasena
      );

      if (validAccount) {
        // Generar datos simulados de sesión
        const simulatedUserId = Math.floor(Math.random() * 1000) + 1;
        const simulatedToken = 'sim_' + Math.random().toString(36).substring(2, 15);

        // Guardar sesión en localStorage
        localStorage.setItem('agroverse_user_id', simulatedUserId.toString());
        localStorage.setItem('agroverse_usuario', usuario);
        localStorage.setItem('agroverse_token', simulatedToken);
        localStorage.setItem('agroverse_login_time', new Date().toISOString());
        localStorage.setItem('agroverse_mode', 'offline'); // Indicador de modo offline

        // Redirigir al juego
        setTimeout(() => {
          navigate('/game');
        }, 500);
      } else {
        setError('Usuario o contraseña incorrectos. Usa una de las cuentas de prueba.');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = (testUser: typeof testAccounts[0]) => {
    setUsuario(testUser.usuario);
    setContrasena(testUser.contrasena);
    setShowTestAccounts(false);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            AgroVerse
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Inicia sesión para acceder a tu finca digital
          </CardDescription>
          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              🔵 Modo Offline: Datos climáticos y agrícolas simulados
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Usuario */}
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-medium text-gray-700">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="usuario"
                  type="text"
                  placeholder="farmer_john"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Test Accounts */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
                className="text-sm text-green-700 hover:text-green-800 font-medium underline w-full text-center"
              >
                {showTestAccounts ? 'Ocultar' : 'Ver'} cuentas de prueba
              </button>

              {showTestAccounts && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {testAccounts.map((account, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTestLogin(account)}
                      className="w-full p-3 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-900 group-hover:text-green-700">
                            {account.usuario}
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">{account.desc}</p>
                        </div>
                        <div className="text-xs text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Usar →
                        </div>
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-gray-500 text-center mt-3 italic">
                    Haz clic en cualquier cuenta para usarla
                  </p>
                </div>
              )}
            </div>

            {/* Back to Home */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToHome}
              className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ← Volver al inicio
            </Button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🌾 AgroVerse · Inteligencia Agrícola de Precisión
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Intelligent Planet Hackathon 2025 - Google Cloud Platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
