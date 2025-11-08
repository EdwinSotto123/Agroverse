// Climate Alerts Widget for Main Game
export function createClimateAlertsWidget() {
  // Remove existing widget if present
  const existing = document.getElementById('climate-alerts-widget');
  if (existing) existing.remove();

  const widget = document.createElement('div');
  widget.id = 'climate-alerts-widget';
  widget.style.position = 'fixed';
  widget.style.top = '20px';
  widget.style.left = '50%';
  widget.style.transform = 'translateX(-50%)';
  widget.style.zIndex = '1000';
  widget.style.maxWidth = 'min(90vw, 800px)';
  widget.style.fontFamily = 'Arial, sans-serif';
  widget.style.fontSize = '13px';

  // Climate summary panel
  const climateSummary = document.createElement('div');
  climateSummary.style.display = 'flex';
  climateSummary.style.justifyContent = 'space-between';
  climateSummary.style.alignItems = 'center';
  climateSummary.style.background = 'linear-gradient(135deg, rgba(0,150,255,0.85), rgba(0,100,200,0.8))';
  climateSummary.style.backdropFilter = 'blur(10px)';
  climateSummary.style.border = '1px solid rgba(100,200,255,0.6)';
  climateSummary.style.borderRadius = '12px';
  climateSummary.style.padding = '10px 16px';
  climateSummary.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
  climateSummary.style.color = '#fff';
  climateSummary.style.transition = 'all 0.3s ease';

  // Climate data section
  const climateData = document.createElement('div');
  climateData.style.display = 'flex';
  climateData.style.gap = '16px';
  climateData.style.alignItems = 'center';

  const tempData = document.createElement('div');
  tempData.style.display = 'flex';
  tempData.style.alignItems = 'center';
  tempData.style.gap = '5px';
  tempData.innerHTML = `
    <span style="font-size: 14px;">🌡️</span>
    <div>
      <div style="font-weight: 600; color: #E3F2FD;" id="temp-value">24°C</div>
      <div style="opacity: 0.8; font-size: 10px;">Actual</div>
    </div>
  `;

  const humidityData = document.createElement('div');
  humidityData.style.display = 'flex';
  humidityData.style.alignItems = 'center';
  humidityData.style.gap = '5px';
  humidityData.innerHTML = `
    <span style="font-size: 14px;">💧</span>
    <div>
      <div style="font-weight: 600; color: #E3F2FD;" id="humidity-value">68%</div>
      <div style="opacity: 0.8; font-size: 10px;">Humedad</div>
    </div>
  `;

  const windData = document.createElement('div');
  windData.style.display = 'flex';
  windData.style.alignItems = 'center';
  windData.style.gap = '5px';
  windData.innerHTML = `
    <span style="font-size: 14px;">💨</span>
    <div>
      <div style="font-weight: 600; color: #E3F2FD;" id="wind-value">12 km/h</div>
      <div style="opacity: 0.8; font-size: 10px;">Viento</div>
    </div>
  `;

  const rainData = document.createElement('div');
  rainData.style.display = 'flex';
  rainData.style.alignItems = 'center';
  rainData.style.gap = '5px';
  rainData.innerHTML = `
    <span style="font-size: 14px;">🌧️</span>
    <div>
      <div style="font-weight: 600; color: #E3F2FD;" id="rain-value">2mm</div>
      <div style="opacity: 0.8; font-size: 10px;">Lluvia hoy</div>
    </div>
  `;

  climateData.appendChild(tempData);
  climateData.appendChild(humidityData);
  climateData.appendChild(windData);
  climateData.appendChild(rainData);

  // Alerts toggle button
  const alertsToggle = document.createElement('button');
  alertsToggle.type = 'button';
  alertsToggle.style.background = 'rgba(255,193,7,0.9)';
  alertsToggle.style.border = '1px solid rgba(255,193,7,0.8)';
  alertsToggle.style.borderRadius = '8px';
  alertsToggle.style.padding = '6px 10px';
  alertsToggle.style.color = '#fff';
  alertsToggle.style.fontSize = '11px';
  alertsToggle.style.cursor = 'pointer';
  alertsToggle.style.display = 'flex';
  alertsToggle.style.alignItems = 'center';
  alertsToggle.style.gap = '5px';
  alertsToggle.style.fontWeight = '600';
  alertsToggle.style.transition = 'all 0.3s ease';
  alertsToggle.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
  alertsToggle.innerHTML = `
    <span style="font-size: 12px;">⚠️</span>
    <span id="alerts-count">3 Alertas</span>
    <span style="font-size: 8px; transform: rotate(0deg); transition: transform 0.3s;" id="alerts-arrow">▼</span>
  `;

  // Hover effects
  alertsToggle.addEventListener('mouseenter', () => {
    alertsToggle.style.background = 'rgba(255,193,7,1)';
    alertsToggle.style.transform = 'translateY(-1px)';
    alertsToggle.style.boxShadow = '0 2px 8px rgba(255,193,7,0.4)';
  });

  alertsToggle.addEventListener('mouseleave', () => {
    alertsToggle.style.background = 'rgba(255,193,7,0.9)';
    alertsToggle.style.transform = 'translateY(0)';
    alertsToggle.style.boxShadow = 'none';
  });

  climateSummary.appendChild(climateData);
  climateSummary.appendChild(alertsToggle);

  // Alerts panel (hidden by default)
  const alertsPanel = document.createElement('div');
  alertsPanel.style.display = 'none';
  alertsPanel.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.95), rgba(255,152,0,0.9))';
  alertsPanel.style.backdropFilter = 'blur(10px)';
  alertsPanel.style.border = '1px solid rgba(255,193,7,0.8)';
  alertsPanel.style.borderRadius = '12px';
  alertsPanel.style.padding = '12px';
  alertsPanel.style.marginTop = '8px';
  alertsPanel.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
  alertsPanel.style.color = '#fff';
  alertsPanel.style.maxHeight = '300px';
  alertsPanel.style.overflowY = 'auto';

  // Sample alerts with more variety
  const gameAlerts = [
    {
      icon: '🌵',
      type: 'Sequía Inminente',
      severity: 'alta',
      message: 'Temperaturas superiores a 35°C esperadas. Riego intensivo recomendado para cultivos sensibles.',
      time: '1 hora',
      action: 'Revisar sistema de riego'
    },
    {
      icon: '🦗',
      type: 'Actividad de Plagas',
      severity: 'media',
      message: 'Incremento de insectos herbívoros detectado. Inspeccionar cultivos de maíz y trigo.',
      time: '3 horas',
      action: 'Aplicar control biológico'
    },
    {
      icon: '🌩️',
      type: 'Tormenta Eléctrica',
      severity: 'alta',
      message: 'Posibles vientos fuertes (>60km/h) y granizo esta noche. Proteger cultivos vulnerables.',
      time: '6 horas',
      action: 'Instalar protecciones'
    },
    {
      icon: '🌡️',
      type: 'Helada Matutina',
      severity: 'media',
      message: 'Temperatura mínima de -2°C prevista para mañana. Cultivos tropicales en riesgo.',
      time: '12 horas',
      action: 'Implementar calefacción'
    }
  ];

  const alertsList = document.createElement('div');
  alertsList.style.display = 'flex';
  alertsList.style.flexDirection = 'column';
  alertsList.style.gap = '8px';

  gameAlerts.forEach(alert => {
    const alertItem = document.createElement('div');
    alertItem.style.display = 'flex';
    alertItem.style.alignItems = 'flex-start';
    alertItem.style.gap = '10px';
    alertItem.style.padding = '10px';
    alertItem.style.background = 'rgba(255,255,255,0.15)';
    alertItem.style.borderRadius = '8px';
    alertItem.style.borderLeft = `4px solid ${
      alert.severity === 'alta' ? '#FF4444' :
      alert.severity === 'media' ? '#FFA500' : '#4CAF50'
    }`;
    alertItem.style.transition = 'all 0.3s ease';
    alertItem.style.cursor = 'pointer';

    // Hover effect for alert items
    alertItem.addEventListener('mouseenter', () => {
      alertItem.style.background = 'rgba(255,255,255,0.25)';
      alertItem.style.transform = 'translateX(4px)';
    });

    alertItem.addEventListener('mouseleave', () => {
      alertItem.style.background = 'rgba(255,255,255,0.15)';
      alertItem.style.transform = 'translateX(0)';
    });

    const severityColor = 
      alert.severity === 'alta' ? '#FF6B6B' :
      alert.severity === 'media' ? '#FFB74D' : '#81C784';

    alertItem.innerHTML = `
      <span style="font-size: 16px; flex-shrink: 0;">${alert.icon}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
          <span style="font-weight: 600; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${alert.type}</span>
          <span style="background: ${severityColor}; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            ${alert.severity}
          </span>
          <span style="color: rgba(255,255,255,0.8); font-size: 10px; margin-left: auto;">hace ${alert.time}</span>
        </div>
        <div style="color: rgba(255,255,255,0.95); font-size: 11px; line-height: 1.4; margin-bottom: 6px;">
          ${alert.message}
        </div>
        <div style="color: #E8F5E8; font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 3px 6px; border-radius: 4px; display: inline-block;">
          💡 ${alert.action}
        </div>
      </div>
    `;
    
    alertsList.appendChild(alertItem);
  });

  alertsPanel.appendChild(alertsList);

  // Toggle functionality
  let alertsVisible = false;
  alertsToggle.addEventListener('click', () => {
    alertsVisible = !alertsVisible;
    alertsPanel.style.display = alertsVisible ? 'block' : 'none';
    
    const arrow = document.getElementById('alerts-arrow');
    arrow.style.transform = alertsVisible ? 'rotate(180deg)' : 'rotate(0deg)';
    
    // Update button style when expanded
    alertsToggle.style.background = alertsVisible ? 'rgba(255,193,7,1)' : 'rgba(255,193,7,0.9)';
  });

  widget.appendChild(climateSummary);
  widget.appendChild(alertsPanel);
  document.body.appendChild(widget);

  // Auto-update climate data every 30 seconds
  const updateInterval = setInterval(() => {
    updateGameClimateData();
  }, 30000);

  // Store interval ID for cleanup
  widget.updateInterval = updateInterval;

  return widget;
}

// Function to update game climate data
export function updateGameClimateData() {
  // Simulate realistic climate variations
  const baseTemp = 20 + Math.random() * 20;
  const baseHumidity = 40 + Math.random() * 40;
  const baseWind = 5 + Math.random() * 25;
  const baseRain = Math.random() * 15;

  const tempElement = document.getElementById('temp-value');
  const humidityElement = document.getElementById('humidity-value');
  const windElement = document.getElementById('wind-value');
  const rainElement = document.getElementById('rain-value');

  if (tempElement) tempElement.textContent = `${Math.round(baseTemp)}°C`;
  if (humidityElement) humidityElement.textContent = `${Math.round(baseHumidity)}%`;
  if (windElement) windElement.textContent = `${Math.round(baseWind)} km/h`;
  if (rainElement) rainElement.textContent = `${Math.round(baseRain)}mm`;

  // Update alert count based on severe conditions
  const alertCount = Math.floor(Math.random() * 6) + 1;
  const alertsCountElement = document.getElementById('alerts-count');
  if (alertsCountElement) {
    alertsCountElement.textContent = `${alertCount} Alertas`;
  }

  // Update widget border color based on conditions
  const widget = document.getElementById('climate-alerts-widget');
  if (widget) {
    const climateSummary = widget.querySelector('div');
    if (baseTemp > 32 || baseHumidity < 30 || baseWind > 20) {
      climateSummary.style.border = '1px solid rgba(255,100,100,0.8)';
    } else if (baseTemp > 28 || baseRain > 10) {
      climateSummary.style.border = '1px solid rgba(255,193,7,0.8)';
    } else {
      climateSummary.style.border = '1px solid rgba(100,200,255,0.6)';
    }
  }

  console.log('Climate data updated:', {
    temp: Math.round(baseTemp),
    humidity: Math.round(baseHumidity),
    wind: Math.round(baseWind),
    rain: Math.round(baseRain)
  });
}

// Function to hide/show widget
export function toggleClimateWidget(visible = true) {
  const widget = document.getElementById('climate-alerts-widget');
  if (widget) {
    widget.style.display = visible ? 'block' : 'none';
  }
}

// Function to cleanup widget
export function removeClimateWidget() {
  const widget = document.getElementById('climate-alerts-widget');
  if (widget) {
    if (widget.updateInterval) {
      clearInterval(widget.updateInterval);
    }
    widget.remove();
  }
}