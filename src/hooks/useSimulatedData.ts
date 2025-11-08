import { useState, useEffect } from 'react';
import {
  getAllSimulatedData,
  generateWeatherData,
  generateWeatherForecast,
  generateSoilData,
  generateCropData,
  generateClimateAlerts,
  generateAnimalData,
  generateMarketData,
  type WeatherData,
  type SoilData,
  type CropData,
  type ClimateAlert,
  type AnimalData,
  type MarketData
} from '@/lib/simulatedData';

// Hook para datos climáticos en tiempo real
export function useWeatherData(refreshInterval: number = 60000) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateWeather = () => {
      setWeather(generateWeatherData());
      setLoading(false);
    };

    updateWeather();
    const interval = setInterval(updateWeather, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { weather, loading };
}

// Hook para pronóstico del tiempo
export function useWeatherForecast(days: number = 7) {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setForecast(generateWeatherForecast(days));
    setLoading(false);
  }, [days]);

  return { forecast, loading };
}

// Hook para datos del suelo
export function useSoilData(refreshInterval: number = 300000) {
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateSoil = () => {
      setSoil(generateSoilData());
      setLoading(false);
    };

    updateSoil();
    const interval = setInterval(updateSoil, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { soil, loading };
}

// Hook para datos de cultivos
export function useCropData() {
  const [crops, setCrops] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCrops(generateCropData());
    setLoading(false);
  }, []);

  return { crops, loading };
}

// Hook para alertas climáticas
export function useClimateAlerts() {
  const [alerts, setAlerts] = useState<ClimateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAlerts(generateClimateAlerts());
    setLoading(false);
  }, []);

  return { alerts, loading };
}

// Hook para datos de animales
export function useAnimalData() {
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAnimals(generateAnimalData());
    setLoading(false);
  }, []);

  return { animals, loading };
}

// Hook para datos de mercado
export function useMarketData() {
  const [market, setMarket] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMarket(generateMarketData());
    setLoading(false);
  }, []);

  return { market, loading };
}

// Hook para todos los datos simulados
export function useAllSimulatedData(refreshInterval: number = 60000) {
  const [data, setData] = useState<ReturnType<typeof getAllSimulatedData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateData = () => {
      setData(getAllSimulatedData());
      setLoading(false);
    };

    updateData();
    const interval = setInterval(updateData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading };
}

// Verificar si estamos en modo offline
export function isOfflineMode(): boolean {
  return localStorage.getItem('agroverse_mode') === 'offline';
}
