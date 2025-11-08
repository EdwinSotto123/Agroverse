async function ensureLeaflet() {
  if (window.L) return true;
  // Inject CSS
  const cssId = 'leaflet-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  // Inject JS
  await new Promise((resolve) => {
    const jsId = 'leaflet-js';
    if (document.getElementById(jsId)) return resolve();
    const s = document.createElement('script');
    s.id = jsId;
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = resolve;
    document.body.appendChild(s);
  });
  return true;
}

// Import climate alerts functionality
import {toggleClimateWidget} from "./climate_alerts.js";

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return {
      lat, lon,
      display_name: data.display_name,
      address: data.address || {}
    };
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
    return { lat, lon, address: {} };
  }
}

export function promptAreaSize({
  defaultW = 4,
  defaultH = 6,
  minW = 1,
  minH = 1,
  maxW = 100,
  maxH = 100,
  title = 'Configurar cultivo',
  labelW = 'Ancho (celdas)',
  labelH = 'Alto (celdas)'
} = {}) {
  return new Promise(async (resolve) => {
    await ensureLeaflet();

    // Hide the climate widget during the dialog
    toggleClimateWidget(false);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.55)';
    overlay.style.zIndex = 9999;

    const dialog = document.createElement('div');
    dialog.style.position = 'absolute';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = '#2d5a27';
    dialog.style.color = '#fff';
    dialog.style.border = '4px solid #4a8c3a';
    dialog.style.borderRadius = '12px';
    dialog.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
    dialog.style.padding = '20px 24px';
    dialog.style.width = 'min(95vw, 1000px)';
    dialog.style.maxHeight = '90vh';
    dialog.style.overflow = 'hidden';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    dialog.style.overflow = 'hidden';
    dialog.style.fontFamily = 'Arial, sans-serif';

    // Form data storage
    const formData = {
      w: defaultW,
      h: defaultH,
      cropName: '', // Nombre personalizado del cultivo
      areaMeasure: null,
      variety: null,
      geo: null,
      plantedAt: null,
      harvestAt: null,
      irrigation: null,
      fertilization: null,
      pests: null,
      // Nuevos campos mejorados
      cropType: null, // Tipo de cultivo (hortalizas, cereales, etc.)
      seedOrigin: null, // Origen de semillas
      soilType: null, // Tipo de suelo
      soilPreparation: null, // Preparación del suelo
      density: null, // Densidad de siembra
      expectedYield: null, // Rendimiento esperado
      previousCrop: null, // Cultivo anterior (rotación)
      companionPlants: null, // Cultivos asociados
      mulching: null, // Uso de cobertura
      organicPractices: [], // Prácticas orgánicas
      challenges: null, // Desafíos específicos
      notes: null // Notas adicionales
    };

    let currentStep = 1;
    let selected = null; // geo location

    // Header with progress
    const header = document.createElement('div');
    header.style.marginBottom = '20px';

    const h1 = document.createElement('div');
    h1.textContent = title;
    h1.style.fontSize = '18px';
    h1.style.fontWeight = '700';
    h1.style.marginBottom = '12px';

    // Climate summary panel
    const climateSummary = document.createElement('div');
    climateSummary.style.display = 'flex';
    climateSummary.style.justifyContent = 'space-between';
    climateSummary.style.alignItems = 'center';
    climateSummary.style.background = 'linear-gradient(135deg, rgba(0,150,255,0.15), rgba(0,100,200,0.1))';
    climateSummary.style.border = '1px solid rgba(100,200,255,0.3)';
    climateSummary.style.borderRadius = '8px';
    climateSummary.style.padding = '12px 16px';
    climateSummary.style.marginBottom = '12px';
    climateSummary.style.fontSize = '13px';

    // Climate data section
    const climateData = document.createElement('div');
    climateData.style.display = 'flex';
    climateData.style.gap = '20px';
    climateData.style.alignItems = 'center';

    const tempData = document.createElement('div');
    tempData.style.display = 'flex';
    tempData.style.alignItems = 'center';
    tempData.style.gap = '6px';
    tempData.innerHTML = `
      <span style="font-size: 16px;">🌡️</span>
      <div>
        <div style="font-weight: 600; color: #87CEEB;">24°C</div>
        <div style="opacity: 0.8; font-size: 11px;">Actual</div>
      </div>
    `;

    const humidityData = document.createElement('div');
    humidityData.style.display = 'flex';
    humidityData.style.alignItems = 'center';
    humidityData.style.gap = '6px';
    humidityData.innerHTML = `
      <span style="font-size: 16px;">💧</span>
      <div>
        <div style="font-weight: 600; color: #87CEEB;">68%</div>
        <div style="opacity: 0.8; font-size: 11px;">Humedad</div>
      </div>
    `;

    const windData = document.createElement('div');
    windData.style.display = 'flex';
    windData.style.alignItems = 'center';
    windData.style.gap = '6px';
    windData.innerHTML = `
      <span style="font-size: 16px;">💨</span>
      <div>
        <div style="font-weight: 600; color: #87CEEB;">12 km/h</div>
        <div style="opacity: 0.8; font-size: 11px;">Viento</div>
      </div>
    `;

    const rainData = document.createElement('div');
    rainData.style.display = 'flex';
    rainData.style.alignItems = 'center';
    rainData.style.gap = '6px';
    rainData.innerHTML = `
      <span style="font-size: 16px;">🌧️</span>
      <div>
        <div style="font-weight: 600; color: #87CEEB;">2mm</div>
        <div style="opacity: 0.8; font-size: 11px;">Lluvia hoy</div>
      </div>
    `;

    climateData.appendChild(tempData);
    climateData.appendChild(humidityData);
    climateData.appendChild(windData);
    climateData.appendChild(rainData);

    // Alerts toggle button
    const alertsToggle = document.createElement('button');
    alertsToggle.type = 'button';
    alertsToggle.style.background = 'rgba(255,193,7,0.2)';
    alertsToggle.style.border = '1px solid rgba(255,193,7,0.5)';
    alertsToggle.style.borderRadius = '6px';
    alertsToggle.style.padding = '8px 12px';
    alertsToggle.style.color = '#FFC107';
    alertsToggle.style.fontSize = '12px';
    alertsToggle.style.cursor = 'pointer';
    alertsToggle.style.display = 'flex';
    alertsToggle.style.alignItems = 'center';
    alertsToggle.style.gap = '6px';
    alertsToggle.style.fontWeight = '600';
    alertsToggle.innerHTML = `
      <span style="font-size: 14px;">⚠️</span>
      <span>3 Alertas</span>
      <span style="font-size: 10px; transform: rotate(0deg); transition: transform 0.3s;">▼</span>
    `;

    climateSummary.appendChild(climateData);
    climateSummary.appendChild(alertsToggle);

    // Alerts panel (hidden by default)
    const alertsPanel = document.createElement('div');
    alertsPanel.style.display = 'none';
    alertsPanel.style.background = 'rgba(255,193,7,0.1)';
    alertsPanel.style.border = '1px solid rgba(255,193,7,0.3)';
    alertsPanel.style.borderRadius = '8px';
    alertsPanel.style.padding = '12px';
    alertsPanel.style.marginBottom = '12px';
    alertsPanel.style.fontSize = '13px';

    // Sample alerts
    const alerts = [
      {
        icon: '🌵',
        type: 'Sequía',
        severity: 'alta',
        message: 'Riesgo de sequía en los próximos 7 días. Considera aumentar la frecuencia de riego.',
        time: '2 horas'
      },
      {
        icon: '🦗',
        type: 'Plagas',
        severity: 'media',
        message: 'Actividad de insectos detectada en cultivos cercanos. Monitorear áreas vulnerables.',
        time: '6 horas'
      },
      {
        icon: '🌨️',
        type: 'Granizo',
        severity: 'baja',
        message: 'Posibilidad de granizo ligero mañana por la tarde. Proteger cultivos sensibles.',
        time: '1 día'
      }
    ];

    const alertsList = document.createElement('div');
    alertsList.style.display = 'flex';
    alertsList.style.flexDirection = 'column';
    alertsList.style.gap = '8px';

    alerts.forEach(alert => {
      const alertItem = document.createElement('div');
      alertItem.style.display = 'flex';
      alertItem.style.alignItems = 'flex-start';
      alertItem.style.gap = '10px';
      alertItem.style.padding = '8px';
      alertItem.style.background = 'rgba(255,255,255,0.05)';
      alertItem.style.borderRadius = '6px';
      alertItem.style.borderLeft = `3px solid ${
        alert.severity === 'alta' ? '#FF4444' :
        alert.severity === 'media' ? '#FFA500' : '#4CAF50'
      }`;

      const severityColor = 
        alert.severity === 'alta' ? '#FF6B6B' :
        alert.severity === 'media' ? '#FFB74D' : '#81C784';

      alertItem.innerHTML = `
        <span style="font-size: 16px;">${alert.icon}</span>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-weight: 600; color: ${severityColor};">${alert.type}</span>
            <span style="background: ${severityColor}; color: #000; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; text-transform: uppercase;">
              ${alert.severity}
            </span>
            <span style="color: rgba(255,255,255,0.6); font-size: 11px; margin-left: auto;">hace ${alert.time}</span>
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 12px; line-height: 1.4;">
            ${alert.message}
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
      
      const arrow = alertsToggle.querySelector('span:last-child');
      arrow.style.transform = alertsVisible ? 'rotate(180deg)' : 'rotate(0deg)';
      
      // Update button style when expanded
      alertsToggle.style.background = alertsVisible ? 'rgba(255,193,7,0.3)' : 'rgba(255,193,7,0.2)';
    });

    const progressBar = document.createElement('div');
    progressBar.style.display = 'flex';
    progressBar.style.gap = '8px';
    progressBar.style.marginBottom = '8px';

    const stepInfo = document.createElement('div');
    stepInfo.style.fontSize = '13px';
    stepInfo.style.opacity = '0.8';

    header.appendChild(h1);
    header.appendChild(climateSummary);
    header.appendChild(alertsPanel);
    header.appendChild(progressBar);
    header.appendChild(stepInfo);

    // Create progress indicators
    for (let i = 1; i <= 3; i++) {
      const step = document.createElement('div');
      step.style.flex = '1';
      step.style.height = '4px';
      step.style.background = i === 1 ? '#4a8c3a' : 'rgba(255,255,255,0.2)';
      step.style.borderRadius = '2px';
      step.dataset.step = i;
      progressBar.appendChild(step);
    }

    // Content container with scroll
    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.overflowY = 'auto';
    content.style.overflowX = 'hidden';
    content.style.maxHeight = 'calc(90vh - 280px)'; // Space for header + nav
    content.style.paddingRight = '8px';
    // Custom scrollbar styling
    content.style.scrollbarWidth = 'thin';
    content.style.scrollbarColor = '#6fb36a #1f3f1b';

    // Navigation buttons (fixed at bottom)
    const nav = document.createElement('div');
    nav.style.display = 'flex';
    nav.style.justifyContent = 'space-between';
    nav.style.marginTop = '16px';
    nav.style.paddingTop = '16px';
    nav.style.borderTop = '1px solid rgba(255,255,255,0.15)';
    nav.style.flexShrink = '0'; // Don't shrink

    const btnBack = document.createElement('button');
    btnBack.type = 'button';
    btnBack.textContent = '← Anterior';
    btnBack.style.background = '#3a3a3a';
    btnBack.style.border = 'none';
    btnBack.style.color = '#fff';
    btnBack.style.padding = '10px 16px';
    btnBack.style.borderRadius = '6px';
    btnBack.style.cursor = 'pointer';
    btnBack.style.display = 'none';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.textContent = 'Cancelar';
    btnCancel.style.background = '#666';
    btnCancel.style.border = 'none';
    btnCancel.style.color = '#fff';
    btnCancel.style.padding = '10px 16px';
    btnCancel.style.borderRadius = '6px';
    btnCancel.style.cursor = 'pointer';

    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.textContent = 'Siguiente →';
    btnNext.style.background = '#4a8c3a';
    btnNext.style.border = 'none';
    btnNext.style.color = '#fff';
    btnNext.style.padding = '10px 16px';
    btnNext.style.borderRadius = '6px';
    btnNext.style.cursor = 'pointer';

    nav.appendChild(btnBack);
    nav.appendChild(btnCancel);
    nav.appendChild(btnNext);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(nav);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Disable game controls while dialog is open
    const disableGameControls = () => {
      document.body.classList.add('dialog-open');
      // Block keydown events for game movement (WASD)
      document.addEventListener('keydown', blockGameKeydown, true);
    };

    const enableGameControls = () => {
      document.body.classList.remove('dialog-open');
      document.removeEventListener('keydown', blockGameKeydown, true);
    };

    const blockGameKeydown = (e) => {
      // Block WASD and arrow keys when typing in form inputs
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Activate controls blocking
    disableGameControls();

    // Function to update climate data based on location
    function updateClimateData(geo = null) {
      // Simulate real climate data based on location
      const baseTemp = geo ? (20 + Math.random() * 15) : 24;
      const baseHumidity = geo ? (50 + Math.random() * 30) : 68;
      const baseWind = geo ? (5 + Math.random() * 20) : 12;
      const baseRain = geo ? (Math.random() * 10) : 2;

      tempData.querySelector('div div').textContent = `${Math.round(baseTemp)}°C`;
      humidityData.querySelector('div div').textContent = `${Math.round(baseHumidity)}%`;
      windData.querySelector('div div').textContent = `${Math.round(baseWind)} km/h`;
      rainData.querySelector('div div').textContent = `${Math.round(baseRain)}mm`;

      // Update alerts based on conditions
      const alertCount = Math.floor(Math.random() * 5) + 1;
      alertsToggle.querySelector('span:nth-child(2)').textContent = `${alertCount} Alertas`;
      
      // Update alert severity color based on conditions
      const severityColor = baseTemp > 30 || baseHumidity < 40 ? '#FF4444' : 
                           baseRain > 15 || baseWind > 25 ? '#FFA500' : '#4CAF50';
      alertsToggle.style.borderColor = severityColor.replace('#', 'rgba(') + ', 0.5)';
    }

    const close = (result) => {
      enableGameControls(); // Re-enable game controls
      document.body.removeChild(overlay);
      // Show the climate widget again when dialog closes
      toggleClimateWidget(true);
      resolve(result);
    };

    btnCancel.addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });

    function updateProgress() {
      // Update progress bar
      progressBar.children[0].style.background = currentStep >= 1 ? '#4a8c3a' : 'rgba(255,255,255,0.2)';
      progressBar.children[1].style.background = currentStep >= 2 ? '#4a8c3a' : 'rgba(255,255,255,0.2)';
      progressBar.children[2].style.background = currentStep >= 3 ? '#4a8c3a' : 'rgba(255,255,255,0.2)';

      // Update step info
      const stepTitles = [
        'Paso 1: Tamaño, variedad y ubicación',
        'Paso 2: Fechas de plantado y cosecha',
        'Paso 3: Prácticas agrícolas'
      ];
      stepInfo.textContent = stepTitles[currentStep - 1] || '';

      // Update buttons
      btnBack.style.display = currentStep > 1 ? 'block' : 'none';
      btnNext.textContent = currentStep === 3 ? 'Plantar' : 'Siguiente →';
    }

    function renderStep1() {
      content.innerHTML = '';
      
      const layout = document.createElement('div');
      layout.style.display = 'grid';
      layout.style.gridTemplateColumns = '340px 1fr';
      layout.style.gap = '20px';
      layout.style.height = '400px';

      // Left: form
      const form = document.createElement('div');
      form.style.display = 'flex';
      form.style.flexDirection = 'column';
      form.style.gap = '16px';
      form.style.alignContent = 'start';

      // Crop name section
      const nameGroup = document.createElement('div');
      const labelName = document.createElement('label');
      labelName.textContent = 'Nombre de tu cultivo';
      labelName.style.display = 'block';
      labelName.style.fontWeight = '600';
      labelName.style.marginBottom = '4px';
      labelName.style.color = '#ffffff';
      
      const inputName = document.createElement('input');
      inputName.type = 'text';
      inputName.placeholder = 'Ej: Tomates del jardín, Huerta Norte...';
      inputName.value = formData.cropName;
      inputName.style.width = '100%';
      inputName.style.padding = '8px 12px';
      inputName.style.border = '1px solid rgba(255,255,255,0.3)';
      inputName.style.borderRadius = '4px';
      inputName.style.background = 'rgba(255,255,255,0.1)';
      inputName.style.color = '#ffffff';
      inputName.style.fontSize = '14px';
      inputName.style.boxSizing = 'border-box';
      
      nameGroup.appendChild(labelName);
      nameGroup.appendChild(inputName);
      form.appendChild(nameGroup);

      // Dimensions section
      const dimensionsSection = document.createElement('div');
      dimensionsSection.style.display = 'grid';
      dimensionsSection.style.gridTemplateColumns = '1fr 1fr';
      dimensionsSection.style.gap = '12px';

      const widthGroup = document.createElement('div');
      const labelWidth = document.createElement('label');
      labelWidth.textContent = labelW;
      labelWidth.style.display = 'block';
      labelWidth.style.fontWeight = '600';
      labelWidth.style.marginBottom = '4px';
      
      const inputW = document.createElement('input');
      inputW.type = 'number';
      inputW.min = String(minW);
      inputW.max = String(maxW);
      inputW.value = String(formData.w);
      inputW.style.padding = '8px 10px';
      inputW.style.borderRadius = '6px';
      inputW.style.border = '1px solid #6fb36a';
      inputW.style.background = '#1f3f1b';
      inputW.style.color = '#fff';
      inputW.style.width = '100%';

      widthGroup.appendChild(labelWidth);
      widthGroup.appendChild(inputW);

      const heightGroup = document.createElement('div');
      const labelHeight = document.createElement('label');
      labelHeight.textContent = labelH;
      labelHeight.style.display = 'block';
      labelHeight.style.fontWeight = '600';
      labelHeight.style.marginBottom = '4px';
      
      const inputH = document.createElement('input');
      inputH.type = 'number';
      inputH.min = String(minH);
      inputH.max = String(maxH);
      inputH.value = String(formData.h);
      inputH.style.padding = '8px 10px';
      inputH.style.borderRadius = '6px';
      inputH.style.border = '1px solid #6fb36a';
      inputH.style.background = '#1f3f1b';
      inputH.style.color = '#fff';
      inputH.style.width = '100%';

      heightGroup.appendChild(labelHeight);
      heightGroup.appendChild(inputH);

      dimensionsSection.appendChild(widthGroup);
      dimensionsSection.appendChild(heightGroup);

      // Real area section
      const areaSection = document.createElement('div');
      const labelMeasure = document.createElement('label');
      labelMeasure.textContent = 'Tamaño real del terreno:';
      labelMeasure.style.display = 'block';
      labelMeasure.style.fontWeight = '600';
      labelMeasure.style.marginBottom = '8px';
      
      const measureWrap = document.createElement('div');
      measureWrap.style.display = 'flex';
      measureWrap.style.gap = '8px';
      measureWrap.style.alignItems = 'stretch';
      measureWrap.style.background = 'rgba(255,0,0,0.1)'; // DEBUG: red background
      measureWrap.style.padding = '4px';
      measureWrap.style.borderRadius = '6px';
      
      const inputMeasureValue = document.createElement('input');
      inputMeasureValue.type = 'number';
      inputMeasureValue.min = '0';
      inputMeasureValue.step = '0.01';
      inputMeasureValue.placeholder = '20';
      inputMeasureValue.value = formData.areaMeasure?.value || '';
      inputMeasureValue.style.padding = '8px 10px';
      inputMeasureValue.style.borderRadius = '6px';
      inputMeasureValue.style.border = '2px solid #6fb36a';
      inputMeasureValue.style.background = '#1f3f1b';
      inputMeasureValue.style.color = '#fff';
      inputMeasureValue.style.flex = '1';
      inputMeasureValue.style.height = '40px';
      inputMeasureValue.style.fontSize = '14px';
      
      const selectMeasureUnit = document.createElement('select');
      selectMeasureUnit.style.padding = '8px 10px';
      selectMeasureUnit.style.borderRadius = '6px';
      selectMeasureUnit.style.border = '2px solid #6fb36a';
      selectMeasureUnit.style.background = '#1f3f1b';
      selectMeasureUnit.style.color = '#fff';
      selectMeasureUnit.style.fontSize = '14px';
      selectMeasureUnit.style.cursor = 'pointer';
      selectMeasureUnit.style.minWidth = '120px';
      selectMeasureUnit.style.height = '40px';
      
      // Create options with explicit styling
      const units = ['m²','hectáreas','acres','millas²'];
      units.forEach((u, index) => {
        const opt = document.createElement('option');
        opt.value = u; 
        opt.textContent = u;
        opt.style.background = '#1f3f1b';
        opt.style.color = '#fff';
        opt.style.fontSize = '14px';
        opt.style.padding = '8px';
        if (index === 0) opt.selected = true; // Default to first option
        selectMeasureUnit.appendChild(opt);
      });
      
      // Set default selection if none
      if (!formData.areaMeasure) {
        selectMeasureUnit.value = 'm²';
        formData.areaMeasure = { value: null, unit: 'm²' };
      } else {
        selectMeasureUnit.value = formData.areaMeasure.unit;
      }
      
      measureWrap.appendChild(inputMeasureValue);
      measureWrap.appendChild(selectMeasureUnit);
      
      // DEBUG: Log to verify elements are created
      console.log('MeasureWrap created:', measureWrap);
      console.log('Select element:', selectMeasureUnit);
      console.log('Select options count:', selectMeasureUnit.options.length);

      areaSection.appendChild(labelMeasure);
      areaSection.appendChild(measureWrap);

      // Variety section
      const varietySection = document.createElement('div');
      const labelVariety = document.createElement('label');
      labelVariety.textContent = 'Variedad específica:';
      labelVariety.style.display = 'block';
      labelVariety.style.fontWeight = '600';
      labelVariety.style.marginBottom = '8px';
      
      const inputVariety = document.createElement('input');
      inputVariety.type = 'text';
      inputVariety.placeholder = 'maíz amarillo duro, papa canchán...';
      inputVariety.value = formData.variety || '';
      inputVariety.style.padding = '8px 10px';
      inputVariety.style.borderRadius = '6px';
      inputVariety.style.border = '1px solid #6fb36a';
      inputVariety.style.background = '#1f3f1b';
      inputVariety.style.color = '#fff';
      inputVariety.style.width = '100%';

      varietySection.appendChild(labelVariety);
      varietySection.appendChild(inputVariety);

      // Crop Type section (NUEVO)
      const cropTypeSection = document.createElement('div');
      const labelCropType = document.createElement('label');
      labelCropType.textContent = 'Tipo de cultivo:';
      labelCropType.style.display = 'block';
      labelCropType.style.fontWeight = '600';
      labelCropType.style.marginBottom = '8px';
      
      const selectCropType = document.createElement('select');
      selectCropType.style.padding = '8px 10px';
      selectCropType.style.borderRadius = '6px';
      selectCropType.style.border = '1px solid #6fb36a';
      selectCropType.style.background = '#1f3f1b';
      selectCropType.style.color = '#fff';
      selectCropType.style.width = '100%';
      selectCropType.style.fontSize = '14px';
      
      const cropTypes = [
        'Selecciona...',
        'Hortalizas (tomate, lechuga, etc.)',
        'Cereales (maíz, arroz, trigo)',
        'Tubérculos (papa, camote, yuca)',
        'Leguminosas (frijol, habas, lenteja)',
        'Frutas',
        'Hierbas aromáticas',
        'Forrajes',
        'Otro'
      ];
      
      cropTypes.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        opt.style.background = '#1f3f1b';
        opt.style.color = '#fff';
        selectCropType.appendChild(opt);
      });
      
      if (formData.cropType) selectCropType.value = formData.cropType;
      
      cropTypeSection.appendChild(labelCropType);
      cropTypeSection.appendChild(selectCropType);

      // Seed Origin section (NUEVO)
      const seedSection = document.createElement('div');
      const labelSeed = document.createElement('label');
      labelSeed.textContent = 'Origen de las semillas:';
      labelSeed.style.display = 'block';
      labelSeed.style.fontWeight = '600';
      labelSeed.style.marginBottom = '8px';
      
      const selectSeed = document.createElement('select');
      selectSeed.style.padding = '8px 10px';
      selectSeed.style.borderRadius = '6px';
      selectSeed.style.border = '1px solid #6fb36a';
      selectSeed.style.background = '#1f3f1b';
      selectSeed.style.color = '#fff';
      selectSeed.style.width = '100%';
      selectSeed.style.fontSize = '14px';
      
      const seedOrigins = [
        'Selecciona...',
        'Semillas propias (guardadas)',
        'Semillas criollas/nativas',
        'Semillas certificadas',
        'Semillas comerciales',
        'Intercambio con otros agricultores',
        'Híbridos comerciales',
        'No sé/otro'
      ];
      
      seedOrigins.forEach(origin => {
        const opt = document.createElement('option');
        opt.value = origin;
        opt.textContent = origin;
        opt.style.background = '#1f3f1b';
        opt.style.color = '#fff';
        selectSeed.appendChild(opt);
      });
      
      if (formData.seedOrigin) selectSeed.value = formData.seedOrigin;
      
      seedSection.appendChild(labelSeed);
      seedSection.appendChild(selectSeed);

      // Location section
      const locationSection = document.createElement('div');
      const locationInfo = document.createElement('div');
      locationInfo.style.fontSize = '12px';
      locationInfo.style.opacity = '0.9';
      locationInfo.style.marginBottom = '8px';
      locationInfo.textContent = 'Haz clic en el mapa para seleccionar la ubicación del cultivo';

      const addressBox = document.createElement('div');
      addressBox.style.fontSize = '12px';
      addressBox.style.background = 'rgba(0,0,0,0.2)';
      addressBox.style.border = '1px solid rgba(255,255,255,0.15)';
      addressBox.style.borderRadius = '6px';
      addressBox.style.padding = '8px';
      addressBox.style.marginBottom = '8px';
      addressBox.textContent = selected ? 
        `📍 ${selected.display_name || 'Ubicación seleccionada'}` : 
        '📍 Sin ubicación seleccionada';

      const locateBtn = document.createElement('button');
      locateBtn.type = 'button';
      locateBtn.textContent = '📍 Mi ubicación';
      locateBtn.style.background = '#2e7d32';
      locateBtn.style.border = 'none';
      locateBtn.style.color = '#fff';
      locateBtn.style.padding = '8px 12px';
      locateBtn.style.borderRadius = '6px';
      locateBtn.style.cursor = 'pointer';
      locateBtn.style.width = '100%';

      locationSection.appendChild(locationInfo);
      locationSection.appendChild(addressBox);
      locationSection.appendChild(locateBtn);

      // Soil Type section (NUEVO)
      const soilSection = document.createElement('div');
      const labelSoil = document.createElement('label');
      labelSoil.textContent = 'Tipo de suelo:';
      labelSoil.style.display = 'block';
      labelSoil.style.fontWeight = '600';
      labelSoil.style.marginBottom = '8px';
      
      const selectSoil = document.createElement('select');
      selectSoil.style.padding = '8px 10px';
      selectSoil.style.borderRadius = '6px';
      selectSoil.style.border = '1px solid #6fb36a';
      selectSoil.style.background = '#1f3f1b';
      selectSoil.style.color = '#fff';
      selectSoil.style.width = '100%';
      selectSoil.style.fontSize = '14px';
      
      const soilTypes = [
        'Selecciona...',
        'Arcilloso (pesado, retiene agua)',
        'Arenoso (ligero, drena rápido)',
        'Limoso (fértil, textura media)',
        'Franco (equilibrado)',
        'Franco-arcilloso',
        'Franco-arenoso',
        'Pedregoso',
        'No sé/otro'
      ];
      
      soilTypes.forEach(soil => {
        const opt = document.createElement('option');
        opt.value = soil;
        opt.textContent = soil;
        opt.style.background = '#1f3f1b';
        opt.style.color = '#fff';
        selectSoil.appendChild(opt);
      });
      
      if (formData.soilType) selectSoil.value = formData.soilType;
      
      soilSection.appendChild(labelSoil);
      soilSection.appendChild(selectSoil);

      // Assemble form
      form.appendChild(dimensionsSection);
      form.appendChild(areaSection);
      form.appendChild(varietySection);
      form.appendChild(cropTypeSection);
      form.appendChild(seedSection);
      form.appendChild(soilSection);
      form.appendChild(locationSection);

      // Right: map
      const mapWrap = document.createElement('div');
      mapWrap.style.borderRadius = '8px';
      mapWrap.style.overflow = 'hidden';
      mapWrap.style.border = '2px solid rgba(255,255,255,0.15)';
      mapWrap.style.height = '100%';
      
      const mapId = 'leaflet-map-' + Date.now();
      const mapDiv = document.createElement('div');
      mapDiv.id = mapId;
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      mapWrap.appendChild(mapDiv);

      layout.appendChild(form);
      layout.appendChild(mapWrap);
      content.appendChild(layout);

      // Initialize map
      setTimeout(() => {
        const map = L.map(mapId, { zoomControl: true });
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        });
        tiles.addTo(map);

        function setViewToDefault() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              map.setView([pos.coords.latitude, pos.coords.longitude], 13);
            }, () => map.setView([0, 0], 2), { enableHighAccuracy: true, timeout: 3000 });
          } else {
            map.setView([0, 0], 2);
          }
        }
        setViewToDefault();

        let marker = null;
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          if (marker) marker.remove();
          marker = L.marker([lat, lng]).addTo(map);
          const geo = await reverseGeocode(lat, lng);
          selected = geo;
          formData.geo = geo;
          addressBox.textContent = `📍 ${geo.display_name || 'Ubicación seleccionada'}`;
          
          // Update climate data for new location
          updateClimateData(geo);
        });

        locateBtn.addEventListener('click', () => {
          if (!navigator.geolocation) return alert('Geolocalización no disponible');
          locateBtn.disabled = true;
          locateBtn.textContent = '📍 Obteniendo...';
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.setView([lat, lng], 14);
            if (marker) marker.remove();
            marker = L.marker([lat, lng]).addTo(map);
            const geo = await reverseGeocode(lat, lng);
            selected = geo;
            formData.geo = geo;
            addressBox.textContent = `📍 ${geo.display_name || 'Mi ubicación'}`;
            locateBtn.disabled = false;
            locateBtn.textContent = '📍 Mi ubicación';
            
            // Update climate data for current location
            updateClimateData(geo);
          }, () => {
            alert('No se pudo obtener la ubicación');
            locateBtn.disabled = false;
            locateBtn.textContent = '📍 Mi ubicación';
          });
        });
      }, 100);

      // Save form data on input
      inputName.addEventListener('input', () => formData.cropName = inputName.value.trim());
      inputW.addEventListener('input', () => formData.w = parseInt(inputW.value) || defaultW);
      inputH.addEventListener('input', () => formData.h = parseInt(inputH.value) || defaultH);
      inputMeasureValue.addEventListener('input', () => {
        const val = parseFloat(inputMeasureValue.value);
        formData.areaMeasure = !isNaN(val) && val >= 0 ? 
          { value: val, unit: selectMeasureUnit.value } : null;
      });
      selectMeasureUnit.addEventListener('change', () => {
        const val = parseFloat(inputMeasureValue.value);
        formData.areaMeasure = !isNaN(val) && val >= 0 ? 
          { value: val, unit: selectMeasureUnit.value } : null;
      });
      inputVariety.addEventListener('input', () => formData.variety = inputVariety.value.trim() || null);
      selectCropType.addEventListener('change', () => {
        formData.cropType = selectCropType.value !== 'Selecciona...' ? selectCropType.value : null;
      });
      selectSeed.addEventListener('change', () => {
        formData.seedOrigin = selectSeed.value !== 'Selecciona...' ? selectSeed.value : null;
      });
      selectSoil.addEventListener('change', () => {
        formData.soilType = selectSoil.value !== 'Selecciona...' ? selectSoil.value : null;
      });
    }

    function renderStep2() {
      content.innerHTML = '';
      
      const form = document.createElement('div');
      form.style.display = 'grid';
      form.style.gridTemplateColumns = '1fr 1fr';
      form.style.gap = '20px';
      form.style.maxWidth = '600px';
      form.style.margin = '40px auto';
      form.style.padding = '20px';

      // Planted date
      const plantedGroup = document.createElement('div');
      const labelPlanted = document.createElement('label');
      labelPlanted.textContent = '¿Cuándo lo plantaste?';
      labelPlanted.style.display = 'block';
      labelPlanted.style.fontWeight = '600';
      labelPlanted.style.marginBottom = '8px';
      
      const inputPlanted = document.createElement('input');
      inputPlanted.type = 'date';
      inputPlanted.value = formData.plantedAt || '';
      inputPlanted.style.padding = '10px 12px';
      inputPlanted.style.borderRadius = '6px';
      inputPlanted.style.border = '1px solid #6fb36a';
      inputPlanted.style.background = '#1f3f1b';
      inputPlanted.style.color = '#fff';
      inputPlanted.style.width = '100%';
      
      // Default to today if empty
      if (!formData.plantedAt) {
        try { 
          inputPlanted.valueAsDate = new Date();
          formData.plantedAt = inputPlanted.value;
        } catch {}
      }

      const plantedHelp = document.createElement('div');
      plantedHelp.style.fontSize = '12px';
      plantedHelp.style.opacity = '0.7';
      plantedHelp.style.marginTop = '4px';
      plantedHelp.textContent = 'Fecha cuando plantaste o sembrar el cultivo';

      plantedGroup.appendChild(labelPlanted);
      plantedGroup.appendChild(inputPlanted);
      plantedGroup.appendChild(plantedHelp);

      // Harvest date
      const harvestGroup = document.createElement('div');
      const labelHarvest = document.createElement('label');
      labelHarvest.textContent = '¿Cuándo esperas cosechar?';
      labelHarvest.style.display = 'block';
      labelHarvest.style.fontWeight = '600';
      labelHarvest.style.marginBottom = '8px';
      
      const inputHarvest = document.createElement('input');
      inputHarvest.type = 'date';
      inputHarvest.value = formData.harvestAt || '';
      inputHarvest.style.padding = '10px 12px';
      inputHarvest.style.borderRadius = '6px';
      inputHarvest.style.border = '1px solid #6fb36a';
      inputHarvest.style.background = '#1f3f1b';
      inputHarvest.style.color = '#fff';
      inputHarvest.style.width = '100%';

      const harvestHelp = document.createElement('div');
      harvestHelp.style.fontSize = '12px';
      harvestHelp.style.opacity = '0.7';
      harvestHelp.style.marginTop = '4px';
      harvestHelp.textContent = 'Fecha estimada de cosecha';

      harvestGroup.appendChild(labelHarvest);
      harvestGroup.appendChild(inputHarvest);
      harvestGroup.appendChild(harvestHelp);

      // Density section (NUEVO)
      const densityGroup = document.createElement('div');
      const labelDensity = document.createElement('label');
      labelDensity.textContent = 'Densidad de siembra:';
      labelDensity.style.display = 'block';
      labelDensity.style.fontWeight = '600';
      labelDensity.style.marginBottom = '8px';
      
      const inputDensity = document.createElement('input');
      inputDensity.type = 'text';
      inputDensity.placeholder = 'Ej: 10 plantas/m², 50 kg/ha';
      inputDensity.value = formData.density || '';
      inputDensity.style.padding = '10px 12px';
      inputDensity.style.borderRadius = '6px';
      inputDensity.style.border = '1px solid #6fb36a';
      inputDensity.style.background = '#1f3f1b';
      inputDensity.style.color = '#fff';
      inputDensity.style.width = '100%';

      densityGroup.appendChild(labelDensity);
      densityGroup.appendChild(inputDensity);

      // Expected Yield section (NUEVO)
      const yieldGroup = document.createElement('div');
      const labelYield = document.createElement('label');
      labelYield.textContent = 'Rendimiento esperado:';
      labelYield.style.display = 'block';
      labelYield.style.fontWeight = '600';
      labelYield.style.marginBottom = '8px';
      
      const inputYield = document.createElement('input');
      inputYield.type = 'text';
      inputYield.placeholder = 'Ej: 500 kg, 20 quintales';
      inputYield.value = formData.expectedYield || '';
      inputYield.style.padding = '10px 12px';
      inputYield.style.borderRadius = '6px';
      inputYield.style.border = '1px solid #6fb36a';
      inputYield.style.background = '#1f3f1b';
      inputYield.style.color = '#fff';
      inputYield.style.width = '100%';

      yieldGroup.appendChild(labelYield);
      yieldGroup.appendChild(inputYield);

      // Previous Crop section (NUEVO) - full width
      const prevCropGroup = document.createElement('div');
      prevCropGroup.style.gridColumn = '1 / -1'; // span all columns
      
      const labelPrevCrop = document.createElement('label');
      labelPrevCrop.textContent = 'Cultivo anterior (rotación):';
      labelPrevCrop.style.display = 'block';
      labelPrevCrop.style.fontWeight = '600';
      labelPrevCrop.style.marginBottom = '8px';
      
      const inputPrevCrop = document.createElement('input');
      inputPrevCrop.type = 'text';
      inputPrevCrop.placeholder = '¿Qué cultivo había antes en este terreno?';
      inputPrevCrop.value = formData.previousCrop || '';
      inputPrevCrop.style.padding = '10px 12px';
      inputPrevCrop.style.borderRadius = '6px';
      inputPrevCrop.style.border = '1px solid #6fb36a';
      inputPrevCrop.style.background = '#1f3f1b';
      inputPrevCrop.style.color = '#fff';
      inputPrevCrop.style.width = '100%';

      prevCropGroup.appendChild(labelPrevCrop);
      prevCropGroup.appendChild(inputPrevCrop);

      // Companion Plants section (NUEVO) - full width
      const companionGroup = document.createElement('div');
      companionGroup.style.gridColumn = '1 / -1';
      
      const labelCompanion = document.createElement('label');
      labelCompanion.textContent = 'Cultivos asociados:';
      labelCompanion.style.display = 'block';
      labelCompanion.style.fontWeight = '600';
      labelCompanion.style.marginBottom = '8px';
      
      const inputCompanion = document.createElement('input');
      inputCompanion.type = 'text';
      inputCompanion.placeholder = '¿Plantas otros cultivos juntos? (ej: maíz con frijol)';
      inputCompanion.value = formData.companionPlants || '';
      inputCompanion.style.padding = '10px 12px';
      inputCompanion.style.borderRadius = '6px';
      inputCompanion.style.border = '1px solid #6fb36a';
      inputCompanion.style.background = '#1f3f1b';
      inputCompanion.style.color = '#fff';
      inputCompanion.style.width = '100%';

      companionGroup.appendChild(labelCompanion);
      companionGroup.appendChild(inputCompanion);

      form.appendChild(plantedGroup);
      form.appendChild(harvestGroup);
      form.appendChild(densityGroup);
      form.appendChild(yieldGroup);
      form.appendChild(prevCropGroup);
      form.appendChild(companionGroup);
      content.appendChild(form);

      // Save form data
      inputPlanted.addEventListener('input', () => formData.plantedAt = inputPlanted.value || null);
      inputHarvest.addEventListener('input', () => formData.harvestAt = inputHarvest.value || null);
      inputDensity.addEventListener('input', () => formData.density = inputDensity.value.trim() || null);
      inputYield.addEventListener('input', () => formData.expectedYield = inputYield.value.trim() || null);
      inputPrevCrop.addEventListener('input', () => formData.previousCrop = inputPrevCrop.value.trim() || null);
      inputCompanion.addEventListener('input', () => formData.companionPlants = inputCompanion.value.trim() || null);
    }

    function renderStep3() {
      content.innerHTML = '';
      
      const form = document.createElement('div');
      form.style.display = 'grid';
      form.style.gap = '20px';
      form.style.maxWidth = '700px';
      form.style.margin = '20px auto';
      form.style.padding = '20px';

      // Irrigation
      const irrigationGroup = document.createElement('div');
      const labelIrrigation = document.createElement('label');
      labelIrrigation.textContent = '¿Cómo riegas tus cultivos?';
      labelIrrigation.style.display = 'block';
      labelIrrigation.style.fontWeight = '600';
      labelIrrigation.style.marginBottom = '8px';
      
      const textareaIrrigation = document.createElement('textarea');
      textareaIrrigation.placeholder = 'Describe tu sistema de riego: fuente de agua (pozo, río, lluvia), método (goteo, aspersión, gravedad), frecuencia, etc.';
      textareaIrrigation.value = formData.irrigation || '';
      textareaIrrigation.rows = 3;
      textareaIrrigation.style.padding = '10px 12px';
      textareaIrrigation.style.borderRadius = '6px';
      textareaIrrigation.style.border = '1px solid #6fb36a';
      textareaIrrigation.style.background = '#1f3f1b';
      textareaIrrigation.style.color = '#fff';
      textareaIrrigation.style.resize = 'vertical';
      textareaIrrigation.style.fontFamily = 'inherit';
      textareaIrrigation.style.width = '100%';

      irrigationGroup.appendChild(labelIrrigation);
      irrigationGroup.appendChild(textareaIrrigation);

      // Fertilization
      const fertilizationGroup = document.createElement('div');
      const labelFertilization = document.createElement('label');
      labelFertilization.textContent = '¿Cómo abonas tus cultivos?';
      labelFertilization.style.display = 'block';
      labelFertilization.style.fontWeight = '600';
      labelFertilization.style.marginBottom = '8px';
      
      const textareaFertilization = document.createElement('textarea');
      textareaFertilization.placeholder = 'Describe cómo fertilizas: tipo de abono (orgánico, químico, compost), frecuencia, métodos de aplicación, etc.';
      textareaFertilization.value = formData.fertilization || '';
      textareaFertilization.rows = 3;
      textareaFertilization.style.padding = '10px 12px';
      textareaFertilization.style.borderRadius = '6px';
      textareaFertilization.style.border = '1px solid #6fb36a';
      textareaFertilization.style.background = '#1f3f1b';
      textareaFertilization.style.color = '#fff';
      textareaFertilization.style.resize = 'vertical';
      textareaFertilization.style.fontFamily = 'inherit';
      textareaFertilization.style.width = '100%';

      fertilizationGroup.appendChild(labelFertilization);
      fertilizationGroup.appendChild(textareaFertilization);

      // Pests
      const pestsGroup = document.createElement('div');
      const labelPests = document.createElement('label');
      labelPests.textContent = 'Principales plagas o enfermedades observadas:';
      labelPests.style.display = 'block';
      labelPests.style.fontWeight = '600';
      labelPests.style.marginBottom = '8px';
      
      const textareaPests = document.createElement('textarea');
      textareaPests.placeholder = 'Describe las principales plagas o enfermedades que has observado en tus cultivos y problemas previos que hayas tenido.';
      textareaPests.value = formData.pests || '';
      textareaPests.rows = 3;
      textareaPests.style.padding = '10px 12px';
      textareaPests.style.borderRadius = '6px';
      textareaPests.style.border = '1px solid #6fb36a';
      textareaPests.style.background = '#1f3f1b';
      textareaPests.style.color = '#fff';
      textareaPests.style.resize = 'vertical';
      textareaPests.style.fontFamily = 'inherit';
      textareaPests.style.width = '100%';

      pestsGroup.appendChild(labelPests);
      pestsGroup.appendChild(textareaPests);

      // Soil Preparation section (NUEVO)
      const soilPrepGroup = document.createElement('div');
      const labelSoilPrep = document.createElement('label');
      labelSoilPrep.textContent = 'Preparación del suelo:';
      labelSoilPrep.style.display = 'block';
      labelSoilPrep.style.fontWeight = '600';
      labelSoilPrep.style.marginBottom = '8px';
      
      const textareaSoilPrep = document.createElement('textarea');
      textareaSoilPrep.placeholder = 'Describe cómo preparas el suelo: arado, rastreo, análisis previo, enmiendas, etc.';
      textareaSoilPrep.value = formData.soilPreparation || '';
      textareaSoilPrep.rows = 2;
      textareaSoilPrep.style.padding = '10px 12px';
      textareaSoilPrep.style.borderRadius = '6px';
      textareaSoilPrep.style.border = '1px solid #6fb36a';
      textareaSoilPrep.style.background = '#1f3f1b';
      textareaSoilPrep.style.color = '#fff';
      textareaSoilPrep.style.resize = 'vertical';
      textareaSoilPrep.style.fontFamily = 'inherit';
      textareaSoilPrep.style.width = '100%';

      soilPrepGroup.appendChild(labelSoilPrep);
      soilPrepGroup.appendChild(textareaSoilPrep);

      // Mulching section (NUEVO)
      const mulchGroup = document.createElement('div');
      const labelMulch = document.createElement('label');
      labelMulch.textContent = 'Cobertura del suelo (mulching):';
      labelMulch.style.display = 'block';
      labelMulch.style.fontWeight = '600';
      labelMulch.style.marginBottom = '8px';
      
      const textareaMulch = document.createElement('textarea');
      textareaMulch.placeholder = '¿Usas cobertura? (paja, hojas, plástico, etc.) Describe tipo y método.';
      textareaMulch.value = formData.mulching || '';
      textareaMulch.rows = 2;
      textareaMulch.style.padding = '10px 12px';
      textareaMulch.style.borderRadius = '6px';
      textareaMulch.style.border = '1px solid #6fb36a';
      textareaMulch.style.background = '#1f3f1b';
      textareaMulch.style.color = '#fff';
      textareaMulch.style.resize = 'vertical';
      textareaMulch.style.fontFamily = 'inherit';
      textareaMulch.style.width = '100%';

      mulchGroup.appendChild(labelMulch);
      mulchGroup.appendChild(textareaMulch);

      // Organic Practices section (NUEVO)
      const organicGroup = document.createElement('div');
      const labelOrganic = document.createElement('label');
      labelOrganic.textContent = 'Prácticas orgánicas/sostenibles:';
      labelOrganic.style.display = 'block';
      labelOrganic.style.fontWeight = '600';
      labelOrganic.style.marginBottom = '12px';
      
      const organicOptions = [
        'Compostaje',
        'Abonos verdes',
        'Rotación de cultivos',
        'Control biológico de plagas',
        'Uso de insectos benéficos',
        'Agricultura orgánica certificada',
        'Policultivos/biodiversidad',
        'Conservación de agua'
      ];
      
      const checkboxContainer = document.createElement('div');
      checkboxContainer.style.display = 'grid';
      checkboxContainer.style.gridTemplateColumns = '1fr 1fr';
      checkboxContainer.style.gap = '8px';
      
      const organicCheckboxes = [];
      organicOptions.forEach(option => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '8px';
        label.style.cursor = 'pointer';
        label.style.fontSize = '14px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;
        checkbox.style.cursor = 'pointer';
        checkbox.style.accentColor = '#6fb36a';
        
        if (formData.organicPractices && formData.organicPractices.includes(option)) {
          checkbox.checked = true;
        }
        
        organicCheckboxes.push(checkbox);
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(option));
        checkboxContainer.appendChild(label);
      });
      
      organicGroup.appendChild(labelOrganic);
      organicGroup.appendChild(checkboxContainer);

      // Challenges section (NUEVO)
      const challengesGroup = document.createElement('div');
      const labelChallenges = document.createElement('label');
      labelChallenges.textContent = 'Desafíos específicos:';
      labelChallenges.style.display = 'block';
      labelChallenges.style.fontWeight = '600';
      labelChallenges.style.marginBottom = '8px';
      
      const textareaChallenges = document.createElement('textarea');
      textareaChallenges.placeholder = '¿Qué dificultades enfrentas? (clima, plagas, recursos, mercado, etc.)';
      textareaChallenges.value = formData.challenges || '';
      textareaChallenges.rows = 2;
      textareaChallenges.style.padding = '10px 12px';
      textareaChallenges.style.borderRadius = '6px';
      textareaChallenges.style.border = '1px solid #6fb36a';
      textareaChallenges.style.background = '#1f3f1b';
      textareaChallenges.style.color = '#fff';
      textareaChallenges.style.resize = 'vertical';
      textareaChallenges.style.fontFamily = 'inherit';
      textareaChallenges.style.width = '100%';

      challengesGroup.appendChild(labelChallenges);
      challengesGroup.appendChild(textareaChallenges);

      // Notes section (NUEVO)
      const notesGroup = document.createElement('div');
      const labelNotes = document.createElement('label');
      labelNotes.textContent = 'Notas adicionales:';
      labelNotes.style.display = 'block';
      labelNotes.style.fontWeight = '600';
      labelNotes.style.marginBottom = '8px';
      
      const textareaNotes = document.createElement('textarea');
      textareaNotes.placeholder = 'Cualquier información adicional relevante sobre este cultivo...';
      textareaNotes.value = formData.notes || '';
      textareaNotes.rows = 3;
      textareaNotes.style.padding = '10px 12px';
      textareaNotes.style.borderRadius = '6px';
      textareaNotes.style.border = '1px solid #6fb36a';
      textareaNotes.style.background = '#1f3f1b';
      textareaNotes.style.color = '#fff';
      textareaNotes.style.resize = 'vertical';
      textareaNotes.style.fontFamily = 'inherit';
      textareaNotes.style.width = '100%';

      notesGroup.appendChild(labelNotes);
      notesGroup.appendChild(textareaNotes);

      form.appendChild(irrigationGroup);
      form.appendChild(fertilizationGroup);
      form.appendChild(pestsGroup);
      form.appendChild(soilPrepGroup);
      form.appendChild(mulchGroup);
      form.appendChild(organicGroup);
      form.appendChild(challengesGroup);
      form.appendChild(notesGroup);
      content.appendChild(form);

      // Save form data
      textareaIrrigation.addEventListener('input', () => formData.irrigation = textareaIrrigation.value.trim() || null);
      textareaFertilization.addEventListener('input', () => formData.fertilization = textareaFertilization.value.trim() || null);
      textareaPests.addEventListener('input', () => formData.pests = textareaPests.value.trim() || null);
      textareaSoilPrep.addEventListener('input', () => formData.soilPreparation = textareaSoilPrep.value.trim() || null);
      textareaMulch.addEventListener('input', () => formData.mulching = textareaMulch.value.trim() || null);
      textareaChallenges.addEventListener('input', () => formData.challenges = textareaChallenges.value.trim() || null);
      textareaNotes.addEventListener('input', () => formData.notes = textareaNotes.value.trim() || null);
      
      // Update organicPractices array when checkboxes change
      organicCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          formData.organicPractices = organicCheckboxes
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        });
      });
    }

    function goToStep(step) {
      if (step < 1 || step > 3) return;
      currentStep = step;
      updateProgress();
      
      if (step === 1) renderStep1();
      else if (step === 2) renderStep2();
      else if (step === 3) renderStep3();
    }

    // Navigation handlers
    btnBack.addEventListener('click', () => goToStep(currentStep - 1));
    btnNext.addEventListener('click', () => {
      if (currentStep === 3) {
        // Final submit
        const result = {
          w: Math.max(minW, Math.min(maxW, formData.w)),
          h: Math.max(minH, Math.min(maxH, formData.h)),
          cropName: formData.cropName,
          geo: formData.geo,
          areaMeasure: formData.areaMeasure,
          plantedAt: formData.plantedAt,
          harvestAt: formData.harvestAt,
          variety: formData.variety,
          irrigation: formData.irrigation,
          fertilization: formData.fertilization,
          pests: formData.pests,
          // New comprehensive fields
          cropType: formData.cropType,
          seedOrigin: formData.seedOrigin,
          soilType: formData.soilType,
          soilPreparation: formData.soilPreparation,
          density: formData.density,
          expectedYield: formData.expectedYield,
          previousCrop: formData.previousCrop,
          companionPlants: formData.companionPlants,
          mulching: formData.mulching,
          organicPractices: formData.organicPractices,
          challenges: formData.challenges,
          notes: formData.notes
        };
        close(result);
      } else {
        goToStep(currentStep + 1);
      }
    });

    // Start with step 1
    goToStep(1);
    
    // Initialize climate data
    updateClimateData();
  });
}
