import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Game() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa
    const userId = localStorage.getItem('agroverse_user_id');
    const token = localStorage.getItem('agroverse_token');

    if (!userId || !token) {
      // No hay sesión, redirigir a login
      navigate('/login');
      return;
    }

    // Cargar el juego (main.html en iframe)
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      // Pasar user_id al juego mediante postMessage
      iframe.onload = () => {
        // Enviar datos de sesión al juego
        iframe.contentWindow?.postMessage(
          {
            type: 'AGROVERSE_SESSION',
            user_id: parseInt(userId),
            usuario: localStorage.getItem('agroverse_usuario'),
            token: token,
            mode: localStorage.getItem('agroverse_mode') || 'offline',
          },
          '*'
        );
        
        // Ocultar loader después de 2 segundos (tiempo para que el juego cargue)
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      };
    }
  }, [navigate]);

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem('agroverse_user_id');
    localStorage.removeItem('agroverse_usuario');
    localStorage.removeItem('agroverse_token');
    localStorage.removeItem('agroverse_login_time');
    localStorage.removeItem('agroverse_mode');
    
    // Redirigir a login
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Top Bar with Logout */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-green-900 to-emerald-900 flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TP</span>
          </div>
          <div className="text-white">
            <p className="text-sm font-semibold">
              {localStorage.getItem('agroverse_usuario') || 'Usuario'}
            </p>
            <p className="text-xs text-green-300">
              ID: {localStorage.getItem('agroverse_user_id')}
            </p>
          </div>
          {localStorage.getItem('agroverse_mode') === 'offline' && (
            <div className="ml-2 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-xs text-blue-200 font-medium">
              🔵 Modo Offline
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Game Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/80 z-50">
          <div className="bg-green-900/90 px-8 py-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
            <p className="text-white font-semibold text-lg">Cargando AgroVerse...</p>
            <p className="text-green-300 text-sm">Preparando tu finca digital</p>
          </div>
        </div>
      )}

      {/* Game iFrame */}
      <iframe
        id="game-iframe"
        src="/game/main.html"
        className="w-full h-full border-0 mt-12"
        title="AgroVerse Game"
        allow="geolocation; microphone; camera"
      />
    </div>
  );
}
