// Datos simulados para modo offline sin backend
// Este archivo proporciona datos climáticos, de sensores y agrícolas simulados

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  cloudCover: number;
  timestamp: string;
}

export interface SoilData {
  moisture: number;
  temperature: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
}

export interface CropData {
  name: string;
  stage: string;
  health: number;
  daysToHarvest: number;
  yieldPrediction: number;
}

// Generar datos climáticos simulados con variación realista
export function generateWeatherData(): WeatherData {
  const now = new Date();
  const hour = now.getHours();
  
  // Temperatura varía según hora del día (8-22°C en Ayacucho)
  const baseTemp = 15;
  const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 7;
  const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 2;
  
  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(55 + Math.random() * 20), // 55-75%
    precipitation: Math.random() < 0.15 ? Math.round(Math.random() * 5) : 0,
    windSpeed: Math.round(8 + Math.random() * 12), // 8-20 km/h
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    pressure: Math.round(1013 + (Math.random() - 0.5) * 20),
    uvIndex: Math.max(0, Math.round(6 + (Math.random() - 0.5) * 4)),
    cloudCover: Math.round(20 + Math.random() * 40),
    timestamp: now.toISOString()
  };
}

// Generar pronóstico de 7 días
export function generateWeatherForecast(days: number = 7): WeatherData[] {
  const forecast: WeatherData[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Simular helada en día 7 (como en el perfil del agricultor)
    const isFrostDay = i === 6;
    const baseTemp = isFrostDay ? -2 : 15;
    const tempVariation = isFrostDay ? 2 : 5;
    
    forecast.push({
      temperature: Math.round((baseTemp + (Math.random() - 0.5) * tempVariation) * 10) / 10,
      humidity: Math.round(50 + Math.random() * 30),
      precipitation: Math.random() < 0.2 ? Math.round(Math.random() * 10) : 0,
      windSpeed: Math.round(8 + Math.random() * 15),
      windDirection: ['N', 'NE', 'E', 'SE'][Math.floor(Math.random() * 4)],
      pressure: Math.round(1010 + Math.random() * 15),
      uvIndex: Math.round(5 + Math.random() * 5),
      cloudCover: Math.round(20 + Math.random() * 50),
      timestamp: date.toISOString()
    });
  }
  
  return forecast;
}

// Datos del suelo simulados
export function generateSoilData(): SoilData {
  return {
    moisture: Math.round(60 + Math.random() * 15), // 60-75%
    temperature: Math.round((14 + Math.random() * 4) * 10) / 10, // 14-18°C
    ph: Math.round((6.0 + Math.random() * 0.5) * 10) / 10, // 6.0-6.5
    nitrogen: Math.round(20 + Math.random() * 15), // Bajo-medio
    phosphorus: Math.round(35 + Math.random() * 20), // Medio
    potassium: Math.round(40 + Math.random() * 20), // Medio
    organicMatter: Math.round((2.0 + Math.random() * 1.0) * 10) / 10 // 2.0-3.0%
  };
}

// Datos de cultivos simulados con variación dinámica
export function generateCropData(): CropData[] {
  const crops = [
    { name: 'Maíz', baseStage: 'Vegetativo temprano', baseHealth: 85, baseDays: 95, baseYield: 850 },
    { name: 'Pimiento', baseStage: 'Floración', baseHealth: 78, baseDays: 45, baseYield: 1200 },
    { name: 'Papa nativa', baseStage: 'Cosecha', baseHealth: 92, baseDays: 5, baseYield: 950 },
    { name: 'Alfalfa', baseStage: 'Crecimiento', baseHealth: 88, baseDays: 30, baseYield: 700 }
  ];

  return crops.map(crop => ({
    name: crop.name,
    stage: crop.baseStage,
    health: Math.round(crop.baseHealth + (Math.random() - 0.5) * 10), // ±5%
    daysToHarvest: Math.max(0, crop.baseDays + Math.floor((Math.random() - 0.5) * 6)), // ±3 días
    yieldPrediction: Math.round(crop.baseYield + (Math.random() - 0.5) * crop.baseYield * 0.15) // ±15%
  }));
}

// Alertas climáticas simuladas
export interface ClimateAlert {
  type: 'frost' | 'drought' | 'pest' | 'disease' | 'wind';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  daysUntil: number;
  recommendations: string[];
}

export function generateClimateAlerts(): ClimateAlert[] {
  const alerts: ClimateAlert[] = [];
  
  // 🌡️ Alerta de helada (probabilidad 70% - basada en servicios de predicción ML)
  if (Math.random() < 0.7) {
    const daysUntil = 5 + Math.floor(Math.random() * 4); // 5-8 días
    alerts.push({
      type: 'frost',
      severity: daysUntil <= 6 ? 'high' : 'medium',
      title: '🌡️ Alerta de Helada - Predicción ML',
      description: `Modelo predictivo indica helada ligera (-2°C a -4°C) en ${daysUntil} días. Probabilidad: ${Math.round(65 + Math.random() * 20)}%`,
      daysUntil,
      recommendations: [
        '🚨 Activar riego por aspersión 2-3h antes del amanecer',
        '🔥 Preparar biomasa para quema preventiva',
        '🛡️ Cubrir cultivos sensibles con mantas térmicas',
        '📊 Monitorear temperatura cada 3-4 horas'
      ]
    });
  }
  
  // 💧 Alerta de sequía (probabilidad 30% - basada en análisis satelital NDWI)
  if (Math.random() < 0.3) {
    alerts.push({
      type: 'drought',
      severity: 'medium',
      title: '💧 Riesgo de Sequía - Análisis Satelital',
      description: `NDWI indica disminución ${Math.round(15 + Math.random() * 10)}% del contenido de agua en cultivos (Sentinel-2)`,
      daysUntil: 10,
      recommendations: [
        '💦 Programar riego en próximas 48-72 horas',
        '🛰️ Revisar datos de NDWI y humedad del suelo',
        '📈 Calcular déficit hídrico acumulado (ET0 - precipitación)',
        '🌱 Aplicar mulching para reducir evaporación 30%'
      ]
    });
  }
  
  // 🐛 Alerta de plagas (probabilidad 25% - basada en condiciones ambientales)
  if (Math.random() < 0.25) {
    const temperature = Math.round(22 + Math.random() * 6);
    const humidity = Math.round(65 + Math.random() * 15);
    alerts.push({
      type: 'pest',
      severity: 'medium',
      title: '🐛 Riesgo de Plagas - Condiciones Favorables',
      description: `Temperatura (${temperature}°C) y humedad (${humidity}%) propicias para desarrollo de plagas. Riesgo: ${Math.round(40 + Math.random() * 30)}%`,
      daysUntil: 7,
      recommendations: [
        '🔬 Inspección visual 2-3 veces por semana',
        '🪤 Instalar trampas de feromonas para monitoreo',
        '🌿 Preparar control biológico (Bt, nematodos)',
        '⚠️ Si >5% plantas afectadas, considerar tratamiento'
      ]
    });
  }
  
  return alerts;
}

// Datos de animales simulados
export interface AnimalData {
  type: string;
  count: number;
  health: number;
  production?: string;
  feedRequired: string;
}

export function generateAnimalData(): AnimalData[] {
  const baseAnimals = [
    { type: 'Gallinas criollas', count: 12, baseHealth: 90, prod: '8-10 huevos/día', feed: '1.5 kg/día de maíz y alfalfa' },
    { type: 'Cuyes', count: 4, baseHealth: 85, prod: 'Reproducción activa', feed: '0.8 kg/día de alfalfa fresca' },
    { type: 'Vacas lecheras', count: 2, baseHealth: 88, prod: '12-15 L/día de leche', feed: '25 kg/día de alfalfa y concentrado' },
    { type: 'Burro', count: 1, baseHealth: 95, prod: undefined, feed: '8 kg/día de pasto y alfalfa' }
  ];

  return baseAnimals.map(animal => ({
    type: animal.type,
    count: animal.count + Math.floor((Math.random() - 0.5) * 2), // ±1 animal
    health: Math.round(animal.baseHealth + (Math.random() - 0.5) * 10), // ±5%
    production: animal.prod,
    feedRequired: animal.feed
  }));
}

// Datos de mercado simulados
export interface MarketData {
  product: string;
  price: number;
  unit: string;
  demand: 'low' | 'medium' | 'high';
  trend: 'down' | 'stable' | 'up';
}

export function generateMarketData(): MarketData[] {
  const products = [
    { product: 'Papa nativa', basePrice: 1.2, demand: 'low' as const, trend: 'down' as const, unit: 'S/ por kg' },
    { product: 'Pimiento fresco', basePrice: 3.5, demand: 'high' as const, trend: 'up' as const, unit: 'S/ por kg' },
    { product: 'Maíz', basePrice: 1.8, demand: 'medium' as const, trend: 'stable' as const, unit: 'S/ por kg' },
    { product: 'Alfalfa', basePrice: 0.8, demand: 'medium' as const, trend: 'stable' as const, unit: 'S/ por kg' },
    { product: 'Huevos criollos', basePrice: 0.5, demand: 'high' as const, trend: 'up' as const, unit: 'S/ por unidad' },
    { product: 'Leche fresca', basePrice: 1.5, demand: 'medium' as const, trend: 'stable' as const, unit: 'S/ por litro' }
  ];

  return products.map(item => ({
    product: item.product,
    price: parseFloat((item.basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2)), // ±10% variación
    unit: item.unit,
    demand: item.demand,
    trend: item.trend
  }));
}

// Función para obtener todos los datos simulados
export function getAllSimulatedData() {
  return {
    weather: generateWeatherData(),
    forecast: generateWeatherForecast(),
    soil: generateSoilData(),
    crops: generateCropData(),
    alerts: generateClimateAlerts(),
    animals: generateAnimalData(),
    market: generateMarketData(),
    lastUpdate: new Date().toISOString()
  };
}
