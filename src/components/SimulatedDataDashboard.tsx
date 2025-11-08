import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useWeatherData,
  useWeatherForecast,
  useSoilData,
  useCropData,
  useClimateAlerts,
  useAnimalData,
  useMarketData
} from '@/hooks/useSimulatedData';
import { Cloud, Droplets, Wind, Thermometer, AlertTriangle, Sprout, TrendingUp, TrendingDown } from 'lucide-react';

export default function SimulatedDataDashboard() {
  const { weather, loading: weatherLoading } = useWeatherData();
  const { forecast } = useWeatherForecast(7);
  const { soil } = useSoilData();
  const { crops } = useCropData();
  const { alerts } = useClimateAlerts();
  const { animals } = useAnimalData();
  const { market } = useMarketData();

  if (weatherLoading) {
    return <div className="p-4">Cargando datos simulados...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Agrícola</h1>
        <div className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-700 font-medium">
          🔵 Datos Simulados
        </div>
      </div>

      {/* Alertas Climáticas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertas Activas
          </h2>
          <div className="grid gap-3">
            {alerts.map((alert, idx) => (
              <Card key={idx} className={`border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  <CardDescription>{alert.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Recomendaciones:</p>
                  <ul className="text-sm space-y-1">
                    {alert.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Clima Actual */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weather?.temperature}°C</p>
            <p className="text-xs text-gray-500 mt-1">Ayacucho, Perú</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Humedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weather?.humidity}%</p>
            <p className="text-xs text-gray-500 mt-1">Relativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Viento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weather?.windSpeed} km/h</p>
            <p className="text-xs text-gray-500 mt-1">{weather?.windDirection}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Nubosidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weather?.cloudCover}%</p>
            <p className="text-xs text-gray-500 mt-1">Cobertura</p>
          </CardContent>
        </Card>
      </div>

      {/* Pronóstico 7 días */}
      <Card>
        <CardHeader>
          <CardTitle>Pronóstico 7 Días</CardTitle>
          <CardDescription>Previsión meteorológica extendida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((day, idx) => {
              const date = new Date(day.timestamp);
              const isFrostDay = day.temperature < 0;
              return (
                <div key={idx} className={`p-3 rounded-lg text-center ${
                  isFrostDay ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'
                }`}>
                  <p className="text-xs font-medium text-gray-600">
                    {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isFrostDay ? 'text-blue-600' : ''}`}>
                    {day.temperature}°
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{day.humidity}%</p>
                  {isFrostDay && <p className="text-xs text-blue-600 font-bold mt-1">❄️ Helada</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Datos del Suelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            Estado del Suelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Humedad</p>
              <p className="text-2xl font-bold">{soil?.moisture}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">pH</p>
              <p className="text-2xl font-bold">{soil?.ph}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Temperatura</p>
              <p className="text-2xl font-bold">{soil?.temperature}°C</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nitrógeno (N)</p>
              <p className="text-2xl font-bold">{soil?.nitrogen} ppm</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fósforo (P)</p>
              <p className="text-2xl font-bold">{soil?.phosphorus} ppm</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Potasio (K)</p>
              <p className="text-2xl font-bold">{soil?.potassium} ppm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cultivos */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Cultivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crops.map((crop, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{crop.name}</p>
                  <p className="text-sm text-gray-600">{crop.stage}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Salud: {crop.health}%</p>
                  <p className="text-xs text-gray-500">Cosecha en {crop.daysToHarvest} días</p>
                  <p className="text-xs text-green-600">{crop.yieldPrediction} kg/ha</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Animales */}
      <Card>
        <CardHeader>
          <CardTitle>Ganado y Animales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {animals.map((animal, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{animal.type} ({animal.count})</p>
                  <p className="text-sm text-gray-600">{animal.feedRequired}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Salud: {animal.health}%</p>
                  {animal.production && (
                    <p className="text-xs text-green-600">{animal.production}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mercado */}
      <Card>
        <CardHeader>
          <CardTitle>Precios de Mercado</CardTitle>
          <CardDescription>Mercado local de Huamanga</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {market.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.product}</p>
                  <p className="text-sm text-gray-600">{item.price} {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.demand === 'high' ? 'bg-green-100 text-green-700' :
                    item.demand === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.demand === 'high' ? 'Alta' : item.demand === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : item.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
