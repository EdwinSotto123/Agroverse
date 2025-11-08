// Crop info panel for inspection tool
export function showCropInfoPanel(entity) {
  // Remove any existing panel
  const existing = document.getElementById('crop-info-panel');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'crop-info-panel';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const panel = document.createElement('div');
  panel.style.background = '#2d5a27';
  panel.style.color = '#fff';
  panel.style.border = '4px solid #4a8c3a';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  panel.style.padding = '20px 24px';
  panel.style.width = 'min(90vw, 480px)';
  panel.style.maxHeight = '80vh';
  panel.style.overflow = 'auto';
  panel.style.fontFamily = 'Arial, sans-serif';

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Información del Cultivo';
  title.style.margin = '0 0 16px 0';
  title.style.fontSize = '18px';
  title.style.fontWeight = '700';
  title.style.color = '#8bc34a';
  panel.appendChild(title);

  // Info grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = '1fr 2fr';
  grid.style.gap = '8px 12px';
  grid.style.marginBottom = '20px';

  const geo = entity.geo || {};
  const addr = geo.address || {};
  const measure = entity.areaMeasure;
  const planted = entity.plantedAt;
  const harvest = entity.harvestAt;

  const fields = [
    ['Tipo:', entity.type || 'N/A'],
    ['Elemento:', entity.elementId || 'N/A'],
    ['Tamaño (celdas):', `${entity.w || 0}×${entity.h || 0}`],
    measure && ['Medida:', `${measure.value} ${measure.unit}`],
    entity.variety && ['Variedad:', entity.variety],
    planted && ['Plantado:', planted],
    harvest && ['Cosecha esperada:', harvest],
    geo.lat && ['Coordenadas:', `${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)}`],
    (addr.city || addr.town) && ['Ciudad:', addr.city || addr.town],
    (addr.state || addr.region) && ['Región:', addr.state || addr.region],
    (addr.county || addr.municipality) && ['Distrito:', addr.county || addr.municipality],
    entity.irrigation && ['Sistema de Riego:', entity.irrigation],
    entity.fertilization && ['Sistema de Fertilización:', entity.fertilization],
    entity.pests && ['Plagas/Enfermedades:', entity.pests]
  ].filter(Boolean);

  fields.forEach(([label, value]) => {
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.fontWeight = '600';
    labelEl.style.color = '#c8e6c9';
    
    const valueEl = document.createElement('div');
    valueEl.style.color = '#fff';
    
    // Special formatting for long text fields
    if (label.includes('Riego') || label.includes('Fertilización') || label.includes('Plagas')) {
      valueEl.style.fontSize = '13px';
      valueEl.style.lineHeight = '1.4';
      valueEl.style.maxHeight = '60px';
      valueEl.style.overflow = 'auto';
      valueEl.style.background = 'rgba(0,0,0,0.1)';
      valueEl.style.padding = '4px 6px';
      valueEl.style.borderRadius = '4px';
      valueEl.style.border = '1px solid rgba(255,255,255,0.1)';
      
      // Make the grid span full width for these fields
      labelEl.style.gridColumn = '1 / span 2';
      labelEl.style.marginTop = '8px';
      valueEl.style.gridColumn = '1 / span 2';
      valueEl.style.marginBottom = '4px';
    }
    
    valueEl.textContent = value;
    
    grid.appendChild(labelEl);
    grid.appendChild(valueEl);
  });

  panel.appendChild(grid);

  // Buttons
  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '12px';
  buttons.style.justifyContent = 'flex-end';
  buttons.style.marginTop = '16px';

  const dashboardBtn = document.createElement('button');
  dashboardBtn.textContent = 'Dashboard de cultivo';
  dashboardBtn.style.background = '#4caf50';
  dashboardBtn.style.border = 'none';
  dashboardBtn.style.color = '#fff';
  dashboardBtn.style.padding = '10px 16px';
  dashboardBtn.style.borderRadius = '6px';
  dashboardBtn.style.cursor = 'pointer';
  dashboardBtn.style.fontWeight = '600';
  dashboardBtn.addEventListener('click', () => {
    overlay.remove();
    openCropDashboard(entity);
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.style.background = '#757575';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#fff';
  closeBtn.style.padding = '10px 16px';
  closeBtn.style.borderRadius = '6px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.addEventListener('click', () => overlay.remove());

  buttons.appendChild(dashboardBtn);
  buttons.appendChild(closeBtn);
  panel.appendChild(buttons);

  overlay.appendChild(panel);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function openCropDashboard(entity) {
  // Hide the game scenario
  const mapElement = document.getElementById('map');
  const toolbarElement = document.getElementById('toolbar');
  if (mapElement) mapElement.style.display = 'none';
  if (toolbarElement) toolbarElement.style.display = 'none';

  // Inject minimal CSS once
  injectDashboardStyles();

  // Create dashboard overlay
  const dashboard = document.createElement('div');
  dashboard.id = 'crop-dashboard';
  dashboard.style.position = 'fixed';
  dashboard.style.inset = '0';
  dashboard.style.background = 'linear-gradient(135deg, #f9fffb 0%, #eefbf1 50%, #f3fbff 100%)';
  dashboard.style.zIndex = '10000';
  dashboard.style.overflow = 'hidden';
  dashboard.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  dashboard.style.display = 'flex';
  dashboard.style.flexDirection = 'column';

  // Header minimalista
  const header = document.createElement('div');
  header.style.background = 'rgba(255,255,255,0.9)';
  header.style.backdropFilter = 'blur(10px)';
  header.style.borderBottom = '1px solid rgba(76,175,80,0.12)';
  header.style.color = '#2e7d32';
  header.style.padding = '16px 24px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.boxShadow = '0 6px 24px rgba(31, 38, 135, 0.15)';

  const headerLeft = document.createElement('div');
  headerLeft.style.display = 'flex';
  headerLeft.style.alignItems = 'center';
  headerLeft.style.gap = '12px';

  const dashboardIcon = document.createElement('div');
  dashboardIcon.textContent = '🌿';
  dashboardIcon.style.fontSize = '28px';
  dashboardIcon.style.background = 'linear-gradient(135deg, #43a047, #81c784)';
  dashboardIcon.style.borderRadius = '10px';
  dashboardIcon.style.padding = '6px';
  dashboardIcon.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.35)';

  const headerTitle = document.createElement('div');
  const titleMain = document.createElement('h1');
  titleMain.textContent = 'Agricultura Inteligente';
  titleMain.style.margin = '0';
  titleMain.style.fontSize = '22px';
  titleMain.style.fontWeight = '800';
  titleMain.style.color = '#1b5e20';

  const titleSub = document.createElement('div');
  titleSub.textContent = `${entity.elementId || 'Cultivo'} · Resumen y Monitoreo`;
  titleSub.style.fontSize = '12px';
  titleSub.style.color = 'rgba(0,0,0,0.45)';
  titleSub.style.marginTop = '2px';

  headerTitle.appendChild(titleMain);
  headerTitle.appendChild(titleSub);
  headerLeft.appendChild(dashboardIcon);
  headerLeft.appendChild(headerTitle);

  const backBtn = document.createElement('button');
  backBtn.className = 'gf-btn-primary';
  backBtn.innerHTML = '← <span style="margin-left: 8px;">Volver</span>';
  backBtn.addEventListener('click', () => {
    dashboard.remove();
    if (mapElement) mapElement.style.display = '';
    if (toolbarElement) toolbarElement.style.display = '';
  });

  // Quick action: Add Sensors button in header
  const addSensorsHeaderBtn = document.createElement('button');
  addSensorsHeaderBtn.className = 'gf-btn-primary';
  addSensorsHeaderBtn.style.marginLeft = '12px';
  addSensorsHeaderBtn.innerHTML = '📡 <span style="margin-left: 8px;">Agregar Sensores</span>';
  addSensorsHeaderBtn.addEventListener('click', async () => {
    const { promptSensorInfo } = await import('./sensor_dialog.js');
    const data = await promptSensorInfo({ title: 'Agregar Sensor IoT' });
    if (!data) return;
    if (!Array.isArray(entity.sensors)) entity.sensors = [];

    const newSensor = {
      id: `s-${Date.now()}`,
      name: data.name || `Sensor ${entity.sensors.length + 1}`,
      type: Array.isArray(data.module) ? data.module.join(',') : (data.module || 'generic'),
      icon: '📡',
      status: 'offline',
      battery: 0,
      signal: 0,
      clientId: data.clientId,
      username: data.username,
      password: data.password,
      hostname: data.hostname,
      topic: data.topic,
      module: data.module,
      description: data.description,
      readings: {},
      lastUpdated: null,
      createdAt: Date.now()
    };
    entity.sensors.push(newSensor);
    if (activeKey === 'iot') renderActiveTab();

    // Simulate device connecting after 10s and updating metrics per module
    setTimeout(() => {
      newSensor.status = 'active';
      newSensor.battery = 90 + Math.floor(Math.random() * 10);
      newSensor.signal = 70 + Math.floor(Math.random() * 30);
      const mods = Array.isArray(newSensor.module) ? newSensor.module : [newSensor.module];
      newSensor.readings = {};
      mods.forEach((m) => {
        switch (m) {
          case 'temperatura':
          case 'temperature':
            newSensor.readings[m] = `${18 + Math.floor(Math.random()*8)}°C`;
            break;
          case 'humedad':
            newSensor.readings[m] = `${40 + Math.floor(Math.random()*40)}%`;
            break;
          case 'ph':
            newSensor.readings[m] = `${(6 + Math.random()*1.5).toFixed(2)} pH`;
            break;
          case 'luminosidad':
            newSensor.readings[m] = `${200 + Math.floor(Math.random()*800)} lx`;
            break;
          case 'conductividad':
            newSensor.readings[m] = `${(0.5 + Math.random()*2).toFixed(2)} mS/cm`;
            break;
          default:
            newSensor.readings[m] = 'OK';
        }
      });
      newSensor.lastUpdated = Date.now();
      if (activeKey === 'iot') renderActiveTab();
    }, 10000);
  });

  header.appendChild(headerLeft);
  const headerRight = document.createElement('div');
  headerRight.style.display = 'flex';
  headerRight.style.gap = '8px';
  headerRight.appendChild(addSensorsHeaderBtn);
  // Quick jump to Climate tab for debugging / convenience
  const climateJumpBtn = document.createElement('button');
  climateJumpBtn.className = 'gf-btn-primary';
  climateJumpBtn.style.marginLeft = '6px';
  climateJumpBtn.innerHTML = '🛰️ <span style="margin-left:8px;">Ir a Clima</span>';
  climateJumpBtn.addEventListener('click', () => {
    // Switch active tab to 'climate' and re-render
    document.querySelectorAll('.gf-tab').forEach(el => el.classList.remove('active'));
    const el = document.querySelector('.gf-tab[data-key="climate"]');
    if (el) el.classList.add('active');
    activeKey = 'climate';
    renderActiveTab();
  });
  headerRight.appendChild(climateJumpBtn);
  headerRight.appendChild(backBtn);
  header.appendChild(headerRight);
  dashboard.appendChild(header);

  // Tabs navigation
  const tabs = document.createElement('div');
  tabs.className = 'gf-tabs';
  const tabDefs = [
    { key: 'overview', label: 'Visión General', icon: '🧭' },
    { key: 'crop', label: 'Datos de Cultivo', icon: '🧪' },
    { key: 'iot', label: 'Sensores IoT', icon: '📡' },
    { key: 'climate', label: 'Clima y Satélite', icon: '🛰️' },
    { key: 'harvest', label: 'Cosecha', icon: '🌾' },
    { key: 'ai', label: 'Recomendaciones', icon: '🤖' },
  ];
  let activeKey = 'overview';

  tabDefs.forEach(def => {
    const t = document.createElement('button');
    t.className = 'gf-tab';
    t.innerHTML = `<span class="gf-tab-icon">${def.icon}</span><span>${def.label}</span>`;
    t.setAttribute('data-key', def.key);
    if (def.key === activeKey) t.classList.add('active');
    t.addEventListener('click', () => {
      if (activeKey === def.key) return;
      document.querySelectorAll('.gf-tab').forEach(el => el.classList.remove('active'));
      t.classList.add('active');
      activeKey = def.key;
      renderActiveTab();
    });
    tabs.appendChild(t);
  });
  dashboard.appendChild(tabs);

  // Dynamic content area
  const content = document.createElement('div');
  content.id = 'gf-content';
  content.className = 'fade-in';
  dashboard.appendChild(content);

  function renderActiveTab() {
    content.innerHTML = '';
    content.classList.remove('fade-in');
    // trigger reflow for animation restart
    void content.offsetWidth;
    content.classList.add('fade-in');
    switch (activeKey) {
      case 'overview':
        renderOverviewSection(content, entity);
        break;
      case 'crop':
        renderCropDataSection(content, entity);
        break;
      case 'iot':
        renderIoTSensorsSection(content, entity);
        break;
      case 'climate':
        renderClimateSatelliteSection(content, entity);
        break;
      case 'harvest':
        renderHarvestSection(content, entity);
        break;
      case 'ai':
        renderAIRecommendationsSection(content, entity);
        break;
    }
  }

  document.body.appendChild(dashboard);
  // initial render
  renderActiveTab();
}

// ---------- Helpers & Sections ----------
function injectDashboardStyles() {
  if (document.getElementById('gf-dashboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'gf-dashboard-styles';
  style.textContent = `
    .gf-tabs { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }
    .gf-tab { appearance: none; border: 0; background: rgba(0,0,0,0.04); color: #2e7d32; padding: 10px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .2s ease; }
    .gf-tab:hover { background: rgba(76,175,80,0.12); transform: translateY(-1px); }
    .gf-tab.active { background: linear-gradient(135deg,#43a047,#26a69a); color: #fff; box-shadow: 0 6px 14px rgba(67,160,71,.25); }
    .gf-tab-icon { font-size: 18px; }
  #gf-content { padding: 20px 24px 28px; overflow: auto; flex: 1; min-height: 0; }
    .fade-in { animation: gffade .25s ease; }
    @keyframes gffade { from { opacity: .3; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
    .gf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 16px; }
    .gf-card { background: rgba(255,255,255,0.65); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,.06); transition: transform .2s ease, box-shadow .2s ease; }
    .gf-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(0,0,0,.08); }
    .gf-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .gf-chip.ok { background: rgba(76,175,80,.12); color: #2e7d32; }
    .gf-chip.warn { background: rgba(255,152,0,.14); color: #e65100; }
    .gf-chip.danger { background: rgba(244,67,54,.14); color: #b71c1c; }
    .gf-btn-primary { background: linear-gradient(135deg,#26a69a,#43a047); color: #fff; border: 0; padding: 10px 16px; border-radius: 999px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 16px rgba(38,166,154,.35); transition: transform .2s ease, box-shadow .2s ease; }
    .gf-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(38,166,154,.45); }
    .gf-collapsible { position: relative; overflow: hidden; }
    .gf-col-header { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
    .gf-col-title { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #1b5e20; }
    .gf-col-chevron { transition: transform .2s ease; color: rgba(0,0,0,.55); }
    .gf-col-body { max-height: 0; transition: max-height .25s ease; }
    .gf-col-summary { color: rgba(0,0,0,.65); }
    .gf-col.expanded .gf-col-chevron { transform: rotate(180deg); }
    .gf-progress { width: 96px; height: 96px; border-radius: 50%; background: conic-gradient(#43a047 var(--p), rgba(0,0,0,0.08) 0); display: grid; place-items: center; }
    .gf-progress-inner { width: 70px; height: 70px; border-radius: 50%; background: #fff; display: grid; place-items: center; color: #1b5e20; font-weight: 800; }
    .gf-mini-map { background: linear-gradient(135deg,#e3f2fd,#e8f5e9); border: 1px solid rgba(0,0,0,0.06); height: 160px; border-radius: 12px; position: relative; display: grid; place-items: center; color: #0d47a1; font-weight: 700; }
    .gf-layer-toggles { display:flex; gap:8px; margin-top:12px; }
    .gf-toggle { padding:6px 10px; border:1px solid rgba(0,0,0,.08); border-radius: 999px; background:#fff; cursor:pointer; font-size:12px; font-weight:700; color:#1565c0; }
    .gf-toggle.active { background: linear-gradient(135deg,#1565c0,#26a69a); color:#fff; border-color: transparent; }
  `;
  document.head.appendChild(style);
}

function createCollapsibleCard({ title, icon, summaryNode, detailNode }) {
  const card = document.createElement('div');
  card.className = 'gf-card gf-collapsible';
  const header = document.createElement('div');
  header.className = 'gf-col-header';
  const titleBox = document.createElement('div');
  titleBox.className = 'gf-col-title';
  const iconEl = document.createElement('span');
  iconEl.textContent = icon || '📦';
  const titleEl = document.createElement('span');
  titleEl.textContent = title;
  titleBox.appendChild(iconEl);
  titleBox.appendChild(titleEl);
  const chevron = document.createElement('span');
  chevron.className = 'gf-col-chevron';
  chevron.textContent = '▾';
  header.appendChild(titleBox);
  header.appendChild(chevron);

  const summary = document.createElement('div');
  summary.className = 'gf-col-summary';
  if (summaryNode) summary.appendChild(summaryNode);
  summary.style.marginTop = '12px';

  const body = document.createElement('div');
  body.className = 'gf-col-body';
  body.style.marginTop = '8px';
  if (detailNode) body.appendChild(detailNode);

  let expanded = false;
  header.addEventListener('click', () => {
    expanded = !expanded;
    if (expanded) {
      card.classList.add('gf-col', 'expanded');
      // set height for transition
      body.style.maxHeight = body.scrollHeight + 'px';
    } else {
      card.classList.remove('expanded');
      body.style.maxHeight = '0px';
    }
  });

  card.appendChild(header);
  card.appendChild(summary);
  card.appendChild(body);
  return card;
}

function createProgress(percent) {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.placeItems = 'center';
  const ring = document.createElement('div');
  ring.className = 'gf-progress';
  ring.style.setProperty('--p', Math.max(0, Math.min(100, percent)) + '%');
  const inner = document.createElement('div');
  inner.className = 'gf-progress-inner';
  inner.textContent = `${percent}%`;
  ring.appendChild(inner);
  wrap.appendChild(ring);
  return wrap;
}

function createMiniMapWithLayers() {
  const box = document.createElement('div');
  const map = document.createElement('div');
  map.className = 'gf-mini-map';
  map.textContent = 'Vista Satelital';
  const toggles = document.createElement('div');
  toggles.className = 'gf-layer-toggles';
  const layers = [
    { key: 'ndvi', label: 'NDVI' },
    { key: 'hum', label: 'Humedad' },
    { key: 'lst', label: 'Temp. Superficie' },
  ];
  let active = 'ndvi';
  function updateLayer() {
    // Fake visual change via gradient colors
    if (active === 'ndvi') map.style.background = 'linear-gradient(135deg,#e8f5e9,#c8e6c9)';
    if (active === 'hum') map.style.background = 'linear-gradient(135deg,#e3f2fd,#bbdefb)';
    if (active === 'lst') map.style.background = 'linear-gradient(135deg,#fff3e0,#ffe0b2)';
    [...toggles.children].forEach(c => c.classList.remove('active'));
    const btn = toggles.querySelector(`[data-k="${active}"]`);
    if (btn) btn.classList.add('active');
  }
  layers.forEach(l => {
    const b = document.createElement('button');
    b.className = 'gf-toggle';
    b.textContent = l.label;
    b.setAttribute('data-k', l.key);
    b.addEventListener('click', () => { active = l.key; updateLayer(); });
    toggles.appendChild(b);
  });
  updateLayer();
  box.appendChild(map);
  box.appendChild(toggles);
  return box;
}

// ========== UTILIDADES PARA AGRICULTURA DE PRECISIÓN ==========

/**
 * Genera datos satelitales simulados realistas para los últimos N días
 */
function generateSatelliteData(entity, days = 14) {
  // Si ya tenemos datos satelitales y son recientes, usarlos
  if (entity.satelliteData && entity.satelliteData.length > 0) {
    const lastDate = new Date(entity.satelliteData[entity.satelliteData.length - 1].date);
    const daysSinceUpdate = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    if (daysSinceUpdate < 1) return entity.satelliteData;
  }

  // Calcular días desde siembra para tendencia de crecimiento
  const plantedDate = entity.plantedAt ? new Date(entity.plantedAt) : new Date(Date.now() - 45 * 86400000);
  const daysSincePlanting = Math.floor((Date.now() - plantedDate.getTime()) / 86400000);
  
  // NDVI base según etapa de crecimiento
  let baseNDVI = 0.3;
  if (daysSincePlanting < 10) baseNDVI = 0.2; // Germinación
  else if (daysSincePlanting < 30) baseNDVI = 0.45; // Crecimiento temprano
  else if (daysSincePlanting < 60) baseNDVI = 0.65; // Crecimiento vegetativo
  else if (daysSincePlanting < 90) baseNDVI = 0.75; // Floración/fructificación
  else baseNDVI = 0.65; // Maduración (baja un poco)

  const data = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - i - 1;
    const date = new Date(Date.now() - daysAgo * 86400000);
    
    // Variación diaria realista ±5%
    const dailyNoise = (Math.random() - 0.5) * 0.08;
    
    // Tendencia de crecimiento (aumenta con el tiempo)
    const growthTrend = Math.min(0.15, i * 0.012);
    
    const ndvi = Math.min(0.92, Math.max(0.15, baseNDVI + growthTrend + dailyNoise));
    const evi = ndvi * (0.65 + Math.random() * 0.15); // EVI típicamente 65-80% del NDVI
    const ndmi = 0.15 + (Math.random() * 0.35) + (ndvi * 0.2); // Correlación positiva con NDVI
    const lai = 1 + (ndvi * 5.5); // LAI correlacionado con NDVI
    const lst = 20 + (Math.random() * 12) + (daysAgo % 2 === 0 ? 2 : -2); // Temperatura superficial con patrón
    
    data.push({
      date: date.toISOString().split('T')[0],
      ndvi: Math.round(ndvi * 100) / 100,
      evi: Math.round(evi * 100) / 100,
      ndmi: Math.round(ndmi * 100) / 100,
      lai: Math.round(lai * 10) / 10,
      lst: Math.round(lst * 10) / 10
    });
  }
  
  // Guardar en entity para reutilizar
  entity.satelliteData = data;
  return data;
}

/**
 * Calcula Growing Degree Days acumulados desde siembra
 */
function calculateGDD(entity, weatherData = null) {
  const plantedDate = entity.plantedAt ? new Date(entity.plantedAt) : new Date(Date.now() - 45 * 86400000);
  const daysSincePlanting = Math.floor((Date.now() - plantedDate.getTime()) / 86400000);
  
  // Si tenemos datos de clima reales, usarlos
  if (weatherData && weatherData.daily_forecast) {
    let gdd = 0;
    const baseTemp = 10; // °C - temperatura base típica
    
    weatherData.daily_forecast.slice(0, Math.min(daysSincePlanting, 14)).forEach(day => {
      const tmax = day.temperature_2m_max || 25;
      const tmin = day.temperature_2m_min || 15;
      const tmean = (tmax + tmin) / 2;
      const dailyGDD = Math.max(0, tmean - baseTemp);
      gdd += dailyGDD;
    });
    
    // Extrapolar si no tenemos todos los días
    if (daysSincePlanting > 14) {
      const avgDailyGDD = gdd / Math.min(daysSincePlanting, 14);
      gdd += avgDailyGDD * (daysSincePlanting - 14);
    }
    
    return Math.round(gdd);
  }
  
  // Simulación sin datos reales (aproximado)
  const avgDailyGDD = 12; // GDD promedio por día en clima templado
  return Math.round(avgDailyGDD * daysSincePlanting);
}

/**
 * Determina la etapa fenológica actual basada en GDD y días
 */
function getPhenologyStage(entity, gdd) {
  const daysSincePlanting = entity.plantedAt 
    ? Math.floor((Date.now() - new Date(entity.plantedAt).getTime()) / 86400000)
    : 45;
  
  // Umbrales típicos (varían por cultivo, estos son genéricos)
  if (gdd < 100 || daysSincePlanting < 7) return { key: 'germination', label: 'Germinación', progress: 5, icon: '🌱' };
  if (gdd < 300 || daysSincePlanting < 25) return { key: 'seedling', label: 'Plántula', progress: 15, icon: '🌿' };
  if (gdd < 600 || daysSincePlanting < 45) return { key: 'vegetative', label: 'Crecimiento Vegetativo', progress: 35, icon: '🍃' };
  if (gdd < 900 || daysSincePlanting < 65) return { key: 'flowering', label: 'Floración', progress: 60, icon: '🌸' };
  if (gdd < 1200 || daysSincePlanting < 85) return { key: 'fruiting', label: 'Fructificación', progress: 80, icon: '🍅' };
  return { key: 'maturation', label: 'Maduración', progress: 95, icon: '🌾' };
}

/**
 * Calcula el score de salud del cultivo (0-100)
 */
function calculateHealthScore(entity, satelliteData, weatherData = null) {
  let score = 70; // Base
  
  // Factor 1: NDVI promedio (40 puntos máx)
  if (satelliteData && satelliteData.length > 0) {
    const recentNDVI = satelliteData.slice(-7); // Últimos 7 días
    const avgNDVI = recentNDVI.reduce((sum, d) => sum + d.ndvi, 0) / recentNDVI.length;
    
    if (avgNDVI > 0.7) score += 30;
    else if (avgNDVI > 0.5) score += 20;
    else if (avgNDVI > 0.3) score += 10;
    else score -= 10;
  }
  
  // Factor 2: Humedad del suelo (20 puntos máx)
  if (weatherData && weatherData.hourly_forecast) {
    const recentSoil = weatherData.hourly_forecast.slice(-24);
    const avgMoisture = recentSoil.reduce((sum, h) => sum + (h.soil_moisture_0_to_1cm || 25), 0) / recentSoil.length;
    
    if (avgMoisture >= 20 && avgMoisture <= 35) score += 20; // Óptimo
    else if (avgMoisture >= 15 && avgMoisture <= 45) score += 10; // Aceptable
    else score -= 15; // Crítico
  }
  
  // Factor 3: Condiciones climáticas recientes (10 puntos máx)
  if (weatherData && weatherData.daily_forecast) {
    const last3Days = weatherData.daily_forecast.slice(-3);
    const extremeTemp = last3Days.some(d => d.temperature_2m_max > 35 || d.temperature_2m_min < 5);
    const heavyRain = last3Days.some(d => d.rain_sum > 50);
    
    if (!extremeTemp && !heavyRain) score += 10;
    else if (extremeTemp || heavyRain) score -= 10;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Genera alertas prioritarias basadas en condiciones
 */
function generateAlerts(entity, satelliteData, weatherData = null) {
  const alerts = [];
  
  // Alerta de helada próxima
  if (weatherData && weatherData.daily_forecast) {
    const next3Days = weatherData.daily_forecast.slice(0, 3);
    const frostRisk = next3Days.some(d => d.temperature_2m_min < 5);
    if (frostRisk) {
      alerts.push({
        level: 'critical',
        icon: '❄️',
        title: 'Riesgo de Helada',
        message: 'Temperatura mínima < 5°C en próximos 3 días. Proteger cultivo.',
        action: 'Aplicar riego por aspersión o cubrir cultivo'
      });
    }
  }
  
  // Alerta de riego urgente
  if (weatherData && weatherData.hourly_forecast) {
    const avgMoisture = weatherData.hourly_forecast.slice(-24).reduce((sum, h) => 
      sum + (h.soil_moisture_0_to_1cm || 25), 0) / 24;
    if (avgMoisture < 15) {
      alerts.push({
        level: 'critical',
        icon: '💧',
        title: 'Riego Urgente',
        message: `Humedad del suelo crítica (${avgMoisture.toFixed(1)}%). Riego inmediato.`,
        action: 'Aplicar riego profundo en las próximas 12 horas'
      });
    } else if (avgMoisture < 20) {
      alerts.push({
        level: 'warning',
        icon: '💧',
        title: 'Riego Necesario',
        message: `Humedad del suelo baja (${avgMoisture.toFixed(1)}%). Programar riego.`,
        action: 'Regar en las próximas 24-48 horas'
      });
    }
  }
  
  // Alerta de enfermedad por condiciones húmedas
  if (weatherData && weatherData.current_conditions && weatherData.daily_forecast) {
    const humidity = weatherData.current_conditions.relative_humidity_2m || 50;
    const temp = weatherData.current_conditions.temperature_2m || 20;
    const recentRain = weatherData.daily_forecast.slice(0, 3).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    
    if (humidity > 80 && temp >= 18 && temp <= 28 && recentRain > 10) {
      alerts.push({
        level: 'warning',
        icon: '🦠',
        title: 'Riesgo de Enfermedad Fúngica',
        message: 'Condiciones favorables para hongos (alta humedad + lluvia reciente).',
        action: 'Monitorear síntomas y considerar fungicida preventivo'
      });
    }
  }
  
  // Alerta de estrés por NDVI bajo
  if (satelliteData && satelliteData.length > 7) {
    const recent = satelliteData.slice(-7);
    const avgNDVI = recent.reduce((sum, d) => sum + d.ndvi, 0) / recent.length;
    const trend = recent[recent.length - 1].ndvi - recent[0].ndvi;
    
    if (avgNDVI < 0.4 && trend < 0) {
      alerts.push({
        level: 'warning',
        icon: '📉',
        title: 'Estrés del Cultivo Detectado',
        message: `NDVI bajo (${avgNDVI.toFixed(2)}) con tendencia decreciente.`,
        action: 'Revisar riego, nutrición y presencia de plagas'
      });
    }
  }
  
  // Ordenar por prioridad
  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.level] - order[b.level];
  });
}

/**
 * Crea un gráfico sparkline SVG
 */
function createSparklineSVG(dataArray, color = '#43a047', width = 120, height = 40) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.display = 'block';
  
  if (!dataArray || dataArray.length < 2) return svg;
  
  const max = Math.max(...dataArray);
  const min = Math.min(...dataArray);
  const range = max - min || 1;
  
  const points = dataArray.map((val, i) => {
    const x = (i / (dataArray.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', color);
  polyline.setAttribute('stroke-width', '2');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  
  svg.appendChild(polyline);
  return svg;
}

/**
 * Crea un gauge circular (medidor de progreso)
 */
function createGaugeChart(value, max = 100, size = 120) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = size + 'px';
  wrapper.style.height = size + 'px';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.style.transform = 'rotate(-90deg)';
  
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Círculo de fondo
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', size / 2);
  bgCircle.setAttribute('cy', size / 2);
  bgCircle.setAttribute('r', radius);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', 'rgba(0,0,0,0.08)');
  bgCircle.setAttribute('stroke-width', strokeWidth);
  
  // Círculo de progreso
  const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progressCircle.setAttribute('cx', size / 2);
  progressCircle.setAttribute('cy', size / 2);
  progressCircle.setAttribute('r', radius);
  progressCircle.setAttribute('fill', 'none');
  
  // Color según valor
  let strokeColor = '#4caf50';
  if (percentage < 40) strokeColor = '#f44336';
  else if (percentage < 70) strokeColor = '#ff9800';
  
  progressCircle.setAttribute('stroke', strokeColor);
  progressCircle.setAttribute('stroke-width', strokeWidth);
  progressCircle.setAttribute('stroke-dasharray', circumference);
  progressCircle.setAttribute('stroke-dashoffset', offset);
  progressCircle.setAttribute('stroke-linecap', 'round');
  
  svg.appendChild(bgCircle);
  svg.appendChild(progressCircle);
  
  // Texto en el centro
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.top = '50%';
  label.style.left = '50%';
  label.style.transform = 'translate(-50%, -50%)';
  label.style.fontSize = '24px';
  label.style.fontWeight = '800';
  label.style.color = strokeColor;
  label.textContent = Math.round(value);
  
  wrapper.appendChild(svg);
  wrapper.appendChild(label);
  
  return wrapper;
}

/**
 * Predice el rendimiento esperado
 */
function predictYield(entity, satelliteData, weatherData = null, gdd = 800) {
  // Rendimiento base según tipo de cultivo (kg/ha)
  const baseYields = {
    'tomate': 60000,
    'tomato': 60000,
    'maiz': 8000,
    'corn': 8000,
    'trigo': 4000,
    'wheat': 4000,
    'soja': 3000,
    'soybean': 3000,
    'default': 5000
  };
  
  const cropType = (entity.elementId || entity.type || 'default').toLowerCase();
  let yieldPotential = baseYields[cropType] || baseYields.default;
  
  // Factor 1: NDVI promedio (0.7 - 1.2)
  let ndviFactor = 1.0;
  if (satelliteData && satelliteData.length > 7) {
    const avgNDVI = satelliteData.slice(-7).reduce((sum, d) => sum + d.ndvi, 0) / 7;
    ndviFactor = 0.7 + (avgNDVI * 0.5); // 0.7 si NDVI=0, 1.2 si NDVI=1
  }
  
  // Factor 2: GDD (0.8 - 1.1)
  let gddFactor = 1.0;
  const optimalGDD = 1000; // Varía por cultivo
  if (gdd < optimalGDD * 0.5) gddFactor = 0.8;
  else if (gdd > optimalGDD * 1.2) gddFactor = 0.9;
  else gddFactor = 1.05;
  
  // Factor 3: Estrés hídrico (0.7 - 1.0)
  let waterFactor = 1.0;
  if (weatherData && weatherData.daily_forecast) {
    const totalRain = weatherData.daily_forecast.slice(-14).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    if (totalRain < 20) waterFactor = 0.75; // Sequía
    else if (totalRain > 200) waterFactor = 0.85; // Exceso
  }
  
  const expectedYield = yieldPotential * ndviFactor * gddFactor * waterFactor;
  
  return {
    expected: Math.round(expectedYield),
    min: Math.round(expectedYield * 0.85),
    max: Math.round(expectedYield * 1.15),
    factors: { ndvi: ndviFactor, gdd: gddFactor, water: waterFactor }
  };
}

// Sections
async function renderOverviewSection(container, entity) {
  container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(0,0,0,0.5);">⏳ Cargando datos de visión general...</div>';
  
  // Obtener datos satelitales y meteorológicos
  const satelliteData = generateSatelliteData(entity, 14);
  let weatherData = null;
  
  // Intentar obtener datos de clima reales
  try {
    const cultivoId = entity.cultivoId || entity.cultivo_id || entity.id;
    const userId = localStorage.getItem('agroverse_user_id') || '1';
    const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://localhost:5001/api'
      : '/api';
    
    const response = await fetch(`${API_URL}/weather_data?cultivo_id=${cultivoId}&user_id=${userId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        weatherData = result.data[0].data;
      }
    }
  } catch (error) {
    console.log('[OVERVIEW] No weather data available, using satellite only');
  }
  
  // Calcular métricas
  const gdd = calculateGDD(entity, weatherData);
  const phenology = getPhenologyStage(entity, gdd);
  const healthScore = calculateHealthScore(entity, satelliteData, weatherData);
  const alerts = generateAlerts(entity, satelliteData, weatherData);
  
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  
  // ============ TARJETA 1: SCORE DE SALUD ============
  const healthCard = document.createElement('div');
  healthCard.className = 'gf-card';
  healthCard.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; font-size:16px;">🌱 Salud del Cultivo</div>
      <div class="gf-chip ${healthScore >= 80 ? 'ok' : healthScore >= 60 ? 'warn' : 'danger'}">
        ${healthScore >= 80 ? '✔ Excelente' : healthScore >= 60 ? '⚠ Bueno' : '✘ Atención'}
      </div>
    </div>
  `;
  
  const healthRow = document.createElement('div');
  healthRow.style.display = 'flex';
  healthRow.style.alignItems = 'center';
  healthRow.style.gap = '20px';
  
  const gauge = createGaugeChart(healthScore, 100, 100);
  healthRow.appendChild(gauge);
  
  const healthDetails = document.createElement('div');
  healthDetails.style.flex = '1';
  healthDetails.innerHTML = `
    <div style="margin-bottom:8px;">
      <div style="font-size:12px; color:rgba(0,0,0,0.6);">Índice de Vegetación (NDVI)</div>
      <div style="font-size:18px; font-weight:700; color:#43a047;">${satelliteData[satelliteData.length - 1].ndvi.toFixed(2)}</div>
    </div>
    <div style="margin-bottom:8px;">
      <div style="font-size:12px; color:rgba(0,0,0,0.6);">Etapa Fenológica</div>
      <div style="font-size:16px; font-weight:700; color:#1b5e20;">${phenology.icon} ${phenology.label}</div>
    </div>
    <div>
      <div style="font-size:12px; color:rgba(0,0,0,0.6);">Progreso del Ciclo</div>
      <div style="font-size:16px; font-weight:700; color:#1565c0;">${phenology.progress}%</div>
    </div>
  `;
  healthRow.appendChild(healthDetails);
  healthCard.appendChild(healthRow);
  
  // ============ TARJETA 2: ÍNDICES SATELITALES ============
  const satelliteCard = document.createElement('div');
  satelliteCard.className = 'gf-card';
  satelliteCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      🛰️ Análisis Satelital (14 días)
    </div>
  `;
  
  const indicesGrid = document.createElement('div');
  indicesGrid.style.display = 'grid';
  indicesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
  indicesGrid.style.gap = '12px';
  
  const latestData = satelliteData[satelliteData.length - 1];
  const indices = [
    { 
      label: 'NDVI', 
      value: latestData.ndvi.toFixed(2), 
      color: '#43a047',
      desc: latestData.ndvi > 0.6 ? 'Vegetación densa' : latestData.ndvi > 0.4 ? 'Vegetación moderada' : 'Vegetación escasa'
    },
    { 
      label: 'EVI', 
      value: latestData.evi.toFixed(2), 
      color: '#66bb6a',
      desc: 'Índice mejorado'
    },
    { 
      label: 'NDMI', 
      value: latestData.ndmi.toFixed(2), 
      color: '#42a5f5',
      desc: latestData.ndmi > 0.3 ? 'Buena humedad' : latestData.ndmi > 0.15 ? 'Humedad moderada' : 'Estrés hídrico'
    },
    { 
      label: 'LAI', 
      value: latestData.lai.toFixed(1), 
      color: '#7cb342',
      desc: 'Área foliar'
    }
  ];
  
  indices.forEach(idx => {
    const indexCard = document.createElement('div');
    indexCard.style.background = 'rgba(255,255,255,0.5)';
    indexCard.style.border = '1px solid rgba(0,0,0,0.08)';
    indexCard.style.borderRadius = '12px';
    indexCard.style.padding = '12px';
    indexCard.innerHTML = `
      <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-bottom:4px;">${idx.label}</div>
      <div style="font-size:24px; font-weight:800; color:${idx.color}; margin-bottom:6px;">${idx.value}</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.6);">${idx.desc}</div>
    `;
    
    // Añadir sparkline con últimos 7 días
    const recentData = satelliteData.slice(-7).map(d => {
      if (idx.label === 'NDVI') return d.ndvi;
      if (idx.label === 'EVI') return d.evi;
      if (idx.label === 'NDMI') return d.ndmi;
      return d.lai;
    });
    const spark = createSparklineSVG(recentData, idx.color, 120, 30);
    spark.style.marginTop = '8px';
    indexCard.appendChild(spark);
    
    indicesGrid.appendChild(indexCard);
  });
  
  satelliteCard.appendChild(indicesGrid);
  
  // ============ TARJETA 3: TEMPERATURA SUPERFICIAL ============
  const lstCard = document.createElement('div');
  lstCard.className = 'gf-card';
  lstCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:12px;">
      🌡️ Temperatura Superficial del Cultivo (LST)
    </div>
  `;
  
  const currentLST = latestData.lst;
  const avgLST = satelliteData.slice(-7).reduce((sum, d) => sum + d.lst, 0) / 7;
  const ambientTemp = weatherData?.current_conditions?.temperature_2m || currentLST - 5;
  const lstDiff = currentLST - ambientTemp;
  
  const lstGrid = document.createElement('div');
  lstGrid.style.display = 'grid';
  lstGrid.style.gridTemplateColumns = '1fr 1fr';
  lstGrid.style.gap = '12px';
  
  lstGrid.innerHTML = `
    <div style="background:rgba(255,255,255,0.5); padding:14px; border-radius:12px; border:1px solid rgba(0,0,0,0.06);">
      <div style="font-size:11px; color:rgba(0,0,0,0.5);">LST Actual</div>
      <div style="font-size:28px; font-weight:800; color:#ff6f00;">${currentLST.toFixed(1)}°C</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.6); margin-top:4px;">
        ${currentLST > 32 ? '⚠️ Estrés térmico' : currentLST > 28 ? '🟡 Temperatura alta' : '✅ Normal'}
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.5); padding:14px; border-radius:12px; border:1px solid rgba(0,0,0,0.06);">
      <div style="font-size:11px; color:rgba(0,0,0,0.5);">Promedio 7 días</div>
      <div style="font-size:28px; font-weight:800; color:#ff9800;">${avgLST.toFixed(1)}°C</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.6); margin-top:4px;">
        Δ ${lstDiff > 0 ? '+' : ''}${lstDiff.toFixed(1)}°C vs ambiente
      </div>
    </div>
  `;
  
  lstCard.appendChild(lstGrid);
  
  // Gráfico de tendencia LST
  const lstTrend = document.createElement('div');
  lstTrend.style.marginTop = '12px';
  lstTrend.innerHTML = '<div style="font-size:12px; font-weight:600; color:rgba(0,0,0,0.7); margin-bottom:6px;">Tendencia (14 días)</div>';
  const lstSparkline = createSparklineSVG(satelliteData.map(d => d.lst), '#ff6f00', 280, 50);
  lstTrend.appendChild(lstSparkline);
  lstCard.appendChild(lstTrend);
  
  // ============ TARJETA 4: ALERTAS PRIORITARIAS ============
  const alertsCard = document.createElement('div');
  alertsCard.className = 'gf-card';
  alertsCard.style.gridColumn = '1 / -1'; // Full width
  alertsCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:12px;">
      🚨 Alertas y Notificaciones (${alerts.length})
    </div>
  `;
  
  if (alerts.length === 0) {
    alertsCard.innerHTML += `
      <div style="text-align:center; padding:20px; color:rgba(0,0,0,0.4);">
        ✅ No hay alertas activas. El cultivo está en condiciones normales.
      </div>
    `;
  } else {
    const alertsList = document.createElement('div');
    alertsList.style.display = 'flex';
    alertsList.style.flexDirection = 'column';
    alertsList.style.gap = '10px';
    
    alerts.forEach(alert => {
      const alertBox = document.createElement('div');
      alertBox.className = 'gf-card';
      alertBox.style.borderLeft = `4px solid ${alert.level === 'critical' ? '#f44336' : '#ff9800'}`;
      alertBox.style.background = alert.level === 'critical' 
        ? 'rgba(244,67,54,0.08)' 
        : 'rgba(255,152,0,0.08)';
      alertBox.innerHTML = `
        <div style="display:flex; align-items:start; gap:12px;">
          <div style="font-size:28px;">${alert.icon}</div>
          <div style="flex:1;">
            <div style="font-weight:700; color:#1b5e20; margin-bottom:4px;">${alert.title}</div>
            <div style="font-size:13px; color:rgba(0,0,0,0.7); margin-bottom:6px;">${alert.message}</div>
            <div style="font-size:12px; color:rgba(0,0,0,0.6); background:rgba(255,255,255,0.6); padding:8px; border-radius:6px;">
              <strong>Acción:</strong> ${alert.action}
            </div>
          </div>
        </div>
      `;
      alertsList.appendChild(alertBox);
    });
    
    alertsCard.appendChild(alertsList);
  }
  
  // ============ TARJETA 5: TIMELINE DE FENOLOGÍA ============
  const phenologyCard = document.createElement('div');
  phenologyCard.className = 'gf-card';
  phenologyCard.style.gridColumn = '1 / -1'; // Full width
  phenologyCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      📅 Timeline de Desarrollo del Cultivo
    </div>
  `;
  
  const stages = [
    { key: 'germination', label: 'Germinación', icon: '🌱', progress: 5 },
    { key: 'seedling', label: 'Plántula', icon: '🌿', progress: 15 },
    { key: 'vegetative', label: 'Crecimiento', icon: '🍃', progress: 35 },
    { key: 'flowering', label: 'Floración', icon: '🌸', progress: 60 },
    { key: 'fruiting', label: 'Fructificación', icon: '🍅', progress: 80 },
    { key: 'maturation', label: 'Maduración', icon: '🌾', progress: 95 }
  ];
  
  const timeline = document.createElement('div');
  timeline.style.display = 'flex';
  timeline.style.alignItems = 'center';
  timeline.style.justifyContent = 'space-between';
  timeline.style.position = 'relative';
  timeline.style.padding = '20px 0';
  
  // Línea de fondo
  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.top = '50%';
  line.style.left = '0';
  line.style.right = '0';
  line.style.height = '4px';
  line.style.background = 'rgba(0,0,0,0.1)';
  line.style.borderRadius = '2px';
  timeline.appendChild(line);
  
  // Línea de progreso
  const progressLine = document.createElement('div');
  progressLine.style.position = 'absolute';
  progressLine.style.top = '50%';
  progressLine.style.left = '0';
  progressLine.style.width = phenology.progress + '%';
  progressLine.style.height = '4px';
  progressLine.style.background = 'linear-gradient(90deg, #43a047, #7cb342)';
  progressLine.style.borderRadius = '2px';
  progressLine.style.transition = 'width 0.5s ease';
  timeline.appendChild(progressLine);
  
  stages.forEach(stage => {
    const node = document.createElement('div');
    node.style.position = 'relative';
    node.style.zIndex = '2';
    node.style.display = 'flex';
    node.style.flexDirection = 'column';
    node.style.alignItems = 'center';
    node.style.gap = '8px';
    
    const circle = document.createElement('div');
    circle.style.width = '50px';
    circle.style.height = '50px';
    circle.style.borderRadius = '50%';
    circle.style.display = 'grid';
    circle.style.placeItems = 'center';
    circle.style.fontSize = '24px';
    circle.style.transition = 'all 0.3s ease';
    
    const isCompleted = phenology.progress >= stage.progress;
    const isCurrent = phenology.key === stage.key;
    
    if (isCompleted) {
      circle.style.background = 'linear-gradient(135deg, #43a047, #66bb6a)';
      circle.style.boxShadow = '0 4px 12px rgba(67,160,71,0.4)';
    } else {
      circle.style.background = 'rgba(0,0,0,0.08)';
    }
    
    if (isCurrent) {
      circle.style.animation = 'pulse 2s infinite';
      circle.style.boxShadow = '0 0 20px rgba(67,160,71,0.6)';
    }
    
    circle.textContent = stage.icon;
    
    const label = document.createElement('div');
    label.style.fontSize = '11px';
    label.style.fontWeight = isCurrent ? '800' : '600';
    label.style.color = isCompleted ? '#1b5e20' : 'rgba(0,0,0,0.5)';
    label.style.textAlign = 'center';
    label.textContent = stage.label;
    
    node.appendChild(circle);
    node.appendChild(label);
    timeline.appendChild(node);
  });
  
  phenologyCard.appendChild(timeline);
  
  // Info adicional
  const phenoInfo = document.createElement('div');
  phenoInfo.style.marginTop = '16px';
  phenoInfo.style.padding = '12px';
  phenoInfo.style.background = 'rgba(67,160,71,0.08)';
  phenoInfo.style.borderRadius = '8px';
  phenoInfo.style.fontSize = '13px';
  phenoInfo.style.color = 'rgba(0,0,0,0.7)';
  phenoInfo.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
      <div><strong>GDD Acumulados:</strong> ${gdd}°C</div>
      <div><strong>Días desde siembra:</strong> ${entity.plantedAt ? Math.floor((Date.now() - new Date(entity.plantedAt)) / 86400000) : 'N/A'}</div>
      <div><strong>Próxima etapa:</strong> ${stages.find(s => s.progress > phenology.progress)?.label || 'Cosecha'}</div>
    </div>
  `;
  phenologyCard.appendChild(phenoInfo);
  
  // Agregar CSS de animación si no existe
  if (!document.getElementById('phenology-animations')) {
    const style = document.createElement('style');
    style.id = 'phenology-animations';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Añadir todas las tarjetas al grid
  grid.appendChild(healthCard);
  grid.appendChild(satelliteCard);
  grid.appendChild(lstCard);
  grid.appendChild(alertsCard);
  grid.appendChild(phenologyCard);
  
  container.appendChild(grid);
}

async function renderCropDataSection(container, entity) {
  container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(0,0,0,0.5);">⏳ Cargando análisis agronómico...</div>';
  
  // Obtener datos
  const satelliteData = generateSatelliteData(entity, 14);
  let weatherData = null;
  
  try {
    const cultivoId = entity.cultivoId || entity.cultivo_id || entity.id;
    const userId = localStorage.getItem('agroverse_user_id') || '1';
    const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://localhost:5001/api'
      : '/api';
    
    const response = await fetch(`${API_URL}/weather_data?cultivo_id=${cultivoId}&user_id=${userId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        weatherData = result.data[0].data;
      }
    }
  } catch (error) {
    console.log('[CROP DATA] Using simulated data');
  }
  
  const gdd = calculateGDD(entity, weatherData);
  const phenology = getPhenologyStage(entity, gdd);
  
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  
  // ============ TARJETA 1: GDD Y FENOLOGÍA ============
  const gddCard = document.createElement('div');
  gddCard.className = 'gf-card';
  gddCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      📊 Growing Degree Days (GDD) y Desarrollo
    </div>
  `;
  
  const gddGrid = document.createElement('div');
  gddGrid.style.display = 'grid';
  gddGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  gddGrid.style.gap = '12px';
  
  const daysSincePlanting = entity.plantedAt 
    ? Math.floor((Date.now() - new Date(entity.plantedAt)) / 86400000)
    : 45;
  
  gddGrid.innerHTML = `
    <div style="background:linear-gradient(135deg, rgba(255,112,67,0.1), rgba(255,112,67,0.05)); padding:16px; border-radius:12px; border:1px solid rgba(255,112,67,0.2);">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:6px;">GDD Acumulados</div>
      <div style="font-size:32px; font-weight:800; color:#ff5722;">${gdd}°C</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">Base 10°C</div>
    </div>
    <div style="background:linear-gradient(135deg, rgba(67,160,71,0.1), rgba(67,160,71,0.05)); padding:16px; border-radius:12px; border:1px solid rgba(67,160,71,0.2);">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:6px;">Días desde Siembra</div>
      <div style="font-size:32px; font-weight:800; color:#43a047;">${daysSincePlanting}</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">Días calendario</div>
    </div>
    <div style="background:linear-gradient(135deg, rgba(156,39,176,0.1), rgba(156,39,176,0.05)); padding:16px; border-radius:12px; border:1px solid rgba(156,39,176,0.2);">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:6px;">Etapa Actual</div>
      <div style="font-size:28px; font-weight:800; color:#9c27b0;">${phenology.icon}</div>
      <div style="font-size:12px; font-weight:600; color:#9c27b0; margin-top:4px;">${phenology.label}</div>
    </div>
  `;
  
  gddCard.appendChild(gddGrid);
  
  // Info adicional sobre GDD
  const gddInfo = document.createElement('div');
  gddInfo.style.marginTop = '12px';
  gddInfo.style.padding = '12px';
  gddInfo.style.background = 'rgba(0,0,0,0.03)';
  gddInfo.style.borderRadius = '8px';
  gddInfo.style.fontSize = '12px';
  gddInfo.style.color = 'rgba(0,0,0,0.7)';
  
  const avgGDDperDay = daysSincePlanting > 0 ? (gdd / daysSincePlanting).toFixed(1) : 0;
  const optimalGDD = 1200; // Varía por cultivo
  const progressToMaturity = Math.min(100, (gdd / optimalGDD) * 100).toFixed(0);
  
  gddInfo.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
      <div><strong>GDD promedio/día:</strong> ${avgGDDperDay}°C</div>
      <div><strong>Progreso a madurez:</strong> ${progressToMaturity}%</div>
      <div><strong>GDD para cosecha:</strong> ~${optimalGDD}°C</div>
    </div>
  `;
  gddCard.appendChild(gddInfo);
  
  // ============ TARJETA 2: BALANCE HÍDRICO ============
  const waterCard = document.createElement('div');
  waterCard.className = 'gf-card';
  waterCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      💧 Balance Hídrico y Necesidades de Riego
    </div>
  `;
  
  let totalRain7d = 0, totalRain14d = 0, totalRain30d = 0;
  let avgETo = 4.5; // mm/día por defecto
  
  if (weatherData && weatherData.daily_forecast) {
    totalRain7d = weatherData.daily_forecast.slice(0, 7).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    totalRain14d = weatherData.daily_forecast.slice(0, 14).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    
    // Calcular ETo estimado (Hargreaves simplificado)
    const avgTempRange = weatherData.daily_forecast.slice(0, 7).reduce((sum, d) => {
      return sum + ((d.temperature_2m_max || 25) - (d.temperature_2m_min || 15));
    }, 0) / 7;
    avgETo = 0.0023 * avgTempRange * 17.8;
  } else {
    // Simulado sin datos reales
    totalRain7d = 15 + Math.random() * 30;
    totalRain14d = totalRain7d * 1.8;
  }
  
  // Coeficiente de cultivo según etapa
  let Kc = 0.7;
  if (phenology.key === 'germination' || phenology.key === 'seedling') Kc = 0.4;
  else if (phenology.key === 'vegetative') Kc = 0.7;
  else if (phenology.key === 'flowering' || phenology.key === 'fruiting') Kc = 1.15;
  else if (phenology.key === 'maturation') Kc = 0.8;
  
  const ETc = avgETo * Kc; // Evapotranspiración del cultivo
  const waterNeeded7d = ETc * 7;
  const waterBalance = totalRain7d - waterNeeded7d;
  
  const balanceGrid = document.createElement('div');
  balanceGrid.style.display = 'grid';
  balanceGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
  balanceGrid.style.gap = '12px';
  
  balanceGrid.innerHTML = `
    <div style="background:rgba(33,150,243,0.08); padding:14px; border-radius:10px; border:1px solid rgba(33,150,243,0.2);">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">Lluvia 7 días</div>
      <div style="font-size:26px; font-weight:800; color:#2196f3;">${totalRain7d.toFixed(1)} mm</div>
    </div>
    <div style="background:rgba(255,152,0,0.08); padding:14px; border-radius:10px; border:1px solid rgba(255,152,0,0.2);">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">ETc 7 días</div>
      <div style="font-size:26px; font-weight:800; color:#ff9800;">${waterNeeded7d.toFixed(1)} mm</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.5);">Kc: ${Kc}</div>
    </div>
    <div style="background:${waterBalance >= 0 ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)'}; padding:14px; border-radius:10px; border:1px solid ${waterBalance >= 0 ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'};">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">Balance</div>
      <div style="font-size:26px; font-weight:800; color:${waterBalance >= 0 ? '#4caf50' : '#f44336'};">
        ${waterBalance > 0 ? '+' : ''}${waterBalance.toFixed(1)} mm
      </div>
      <div style="font-size:10px; color:rgba(0,0,0,0.6);">
        ${waterBalance >= 0 ? '✅ Superávit' : '⚠️ Déficit'}
      </div>
    </div>
  `;
  
  waterCard.appendChild(balanceGrid);
  
  // Recomendación de riego
  const irrigationAdvice = document.createElement('div');
  irrigationAdvice.style.marginTop = '14px';
  irrigationAdvice.style.padding = '12px';
  irrigationAdvice.style.borderRadius = '8px';
  irrigationAdvice.style.fontSize = '13px';
  
  if (waterBalance < -15) {
    irrigationAdvice.style.background = 'rgba(244,67,54,0.12)';
    irrigationAdvice.style.border = '1px solid rgba(244,67,54,0.3)';
    irrigationAdvice.innerHTML = `
      <div style="font-weight:700; color:#d32f2f; margin-bottom:6px;">🚨 Riego Urgente Necesario</div>
      <div style="color:rgba(0,0,0,0.7);">
        Déficit hídrico severo. Aplicar <strong>${Math.abs(waterBalance).toFixed(0)} mm</strong> de riego 
        en las próximas 24 horas. Priorizar riego profundo.
      </div>
    `;
  } else if (waterBalance < 0) {
    irrigationAdvice.style.background = 'rgba(255,152,0,0.12)';
    irrigationAdvice.style.border = '1px solid rgba(255,152,0,0.3)';
    irrigationAdvice.innerHTML = `
      <div style="font-weight:700; color:#f57c00; margin-bottom:6px;">💧 Programar Riego</div>
      <div style="color:rgba(0,0,0,0.7);">
        Déficit moderado. Aplicar <strong>${Math.abs(waterBalance).toFixed(0)} mm</strong> en los 
        próximos 2-3 días. Riego ligero suficiente.
      </div>
    `;
  } else {
    irrigationAdvice.style.background = 'rgba(76,175,80,0.12)';
    irrigationAdvice.style.border = '1px solid rgba(76,175,80,0.3)';
    irrigationAdvice.innerHTML = `
      <div style="font-weight:700; color:#388e3c; margin-bottom:6px;">✅ Humedad Adecuada</div>
      <div style="color:rgba(0,0,0,0.7);">
        No se requiere riego inmediato. Monitorear humedad del suelo. 
        Excedente de <strong>${waterBalance.toFixed(0)} mm</strong>.
      </div>
    `;
  }
  
  waterCard.appendChild(irrigationAdvice);
  
  // ============ TARJETA 3: DATOS AMBIENTALES ============
  const envCard = document.createElement('div');
  envCard.className = 'gf-card';
  envCard.style.gridColumn = '1 / -1';
  envCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      🌡️ Condiciones Ambientales y del Suelo
    </div>
  `;
  
  const envGrid = document.createElement('div');
  envGrid.style.display = 'grid';
  envGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  envGrid.style.gap = '12px';
  
  // Obtener datos de clima
  let currentTemp = weatherData?.current_conditions?.temperature_2m || (20 + Math.random() * 10);
  let currentHumidity = weatherData?.current_conditions?.relative_humidity_2m || (50 + Math.random() * 30);
  let soilMoisture = 25;
  
  if (weatherData?.hourly_forecast) {
    const last24h = weatherData.hourly_forecast.slice(-24);
    soilMoisture = last24h.reduce((sum, h) => sum + (h.soil_moisture_0_to_1cm || 25), 0) / 24;
  }
  
  // pH simulado (6.0 - 7.5 con variación lógica)
  const basePH = 6.5 + (Math.random() * 0.8);
  
  // Nutrientes simulados
  const nLevel = 60 + Math.random() * 35; // % de disponibilidad
  
  envGrid.innerHTML = `
    <div class="gf-card" style="padding:16px; background:linear-gradient(135deg, rgba(255,112,67,0.08), rgba(255,112,67,0.03));">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7);">🌡️ Temperatura</div>
        <div class="gf-chip ${currentTemp >= 15 && currentTemp <= 30 ? 'ok' : 'warn'}">
          ${currentTemp >= 15 && currentTemp <= 30 ? 'Óptima' : 'Subóptima'}
        </div>
      </div>
      <div style="font-size:36px; font-weight:800; color:#ff5722; margin-bottom:8px;">
        ${currentTemp.toFixed(1)}°C
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">
        Rango óptimo: 15-30°C
      </div>
    </div>
    
    <div class="gf-card" style="padding:16px; background:linear-gradient(135deg, rgba(33,150,243,0.08), rgba(33,150,243,0.03));">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7);">💧 Humedad Relativa</div>
        <div class="gf-chip ${currentHumidity >= 40 && currentHumidity <= 70 ? 'ok' : 'warn'}">
          ${currentHumidity >= 40 && currentHumidity <= 70 ? 'Óptima' : 'Revisar'}
        </div>
      </div>
      <div style="font-size:36px; font-weight:800; color:#2196f3; margin-bottom:8px;">
        ${currentHumidity.toFixed(0)}%
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">
        Rango óptimo: 40-70%
      </div>
    </div>
    
    <div class="gf-card" style="padding:16px; background:linear-gradient(135deg, rgba(121,85,72,0.08), rgba(121,85,72,0.03));">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7);">🌱 Humedad Suelo</div>
        <div class="gf-chip ${soilMoisture >= 20 && soilMoisture <= 35 ? 'ok' : soilMoisture >= 15 ? 'warn' : 'danger'}">
          ${soilMoisture >= 20 && soilMoisture <= 35 ? 'Óptima' : soilMoisture >= 15 ? 'Baja' : 'Crítica'}
        </div>
      </div>
      <div style="font-size:36px; font-weight:800; color:#795548; margin-bottom:8px;">
        ${soilMoisture.toFixed(1)}%
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">
        Rango óptimo: 20-35%
      </div>
    </div>
    
    <div class="gf-card" style="padding:16px; background:linear-gradient(135deg, rgba(156,39,176,0.08), rgba(156,39,176,0.03));">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7);">🧪 pH del Suelo</div>
        <div class="gf-chip ${basePH >= 6.0 && basePH <= 7.0 ? 'ok' : 'warn'}">
          ${basePH >= 6.0 && basePH <= 7.0 ? 'Óptimo' : 'Ajustar'}
        </div>
      </div>
      <div style="font-size:36px; font-weight:800; color:#9c27b0; margin-bottom:8px;">
        ${basePH.toFixed(2)}
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">
        Rango óptimo: 6.0-7.0
      </div>
    </div>
    
    <div class="gf-card" style="padding:16px; background:linear-gradient(135deg, rgba(76,175,80,0.08), rgba(76,175,80,0.03));">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7);">🧬 Nutrientes (NPK)</div>
        <div class="gf-chip ${nLevel >= 70 ? 'ok' : nLevel >= 50 ? 'warn' : 'danger'}">
          ${nLevel >= 70 ? 'Alto' : nLevel >= 50 ? 'Medio' : 'Bajo'}
        </div>
      </div>
      <div style="font-size:36px; font-weight:800; color:#4caf50; margin-bottom:8px;">
        ${nLevel.toFixed(0)}%
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">
        Disponibilidad estimada
      </div>
    </div>
  `;
  
  envCard.appendChild(envGrid);
  
  // Añadir tarjetas al grid
  grid.appendChild(gddCard);
  grid.appendChild(waterCard);
  grid.appendChild(envCard);
  
  container.appendChild(grid);
}

function renderIoTSensorsSection(container, entity) {
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  // Use persisted sensors if available; otherwise empty list
  const sensors = Array.isArray(entity.sensors) ? entity.sensors : [];
  sensors.forEach(s => {
    const summary = document.createElement('div');
    const isActive = s.status === 'active' || s.status === 'activo' || s.status === 'activo';
    const stCls = isActive ? 'ok' : 'danger';
    const statusText = isActive ? 'ACTIVO' : (s.status || 'OFFLINE').toString().toUpperCase();
    summary.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="gf-chip ${stCls}">● ${statusText}</div>
        <div style="font-weight:800;color:#1b5e20">${s.icon} ${s.name}</div>
      </div>
    `;
    const detail = document.createElement('div');
    detail.style.display = 'grid';
    detail.style.gap = '8px';
    const credGrid = document.createElement('div');
    credGrid.style.display = 'flex';
    credGrid.style.flexWrap = 'wrap';
    credGrid.style.gap = '8px';
    credGrid.innerHTML = `
      <div class="gf-card" style="padding:12px;min-width:200px;">🔗 Host: <strong>${s.hostname || '-'}</strong></div>
      <div class="gf-card" style="padding:12px;min-width:200px;">🆔 Client ID: <strong>${s.clientId || '-'}</strong></div>
      <div class="gf-card" style="padding:12px;min-width:180px;">👤 Username: <strong>${s.username || '-'}</strong></div>
      <div class="gf-card" style="padding:12px;min-width:180px;">🔑 Password: <strong>${s.password ? '••••••••' : '-'}</strong></div>
      <div class="gf-card" style="padding:12px;min-width:220px;">#️⃣ Topic: <strong>${s.topic || '-'}</strong></div>
    `;
    detail.appendChild(credGrid);

    // Module & description
    const meta = document.createElement('div');
    meta.style.display = 'flex';
    meta.style.flexDirection = 'column';
    meta.style.gap = '6px';
    meta.innerHTML = `
      <div class="gf-card" style="padding:12px;">📦 Módulos: <strong>${Array.isArray(s.module) ? s.module.join(', ') : (s.module || '-')}</strong></div>
      <div class="gf-card" style="padding:12px;">📝 Descripción: <div style="margin-top:6px;color:rgba(0,0,0,0.75)">${s.description || '-'}</div></div>
    `;
    detail.appendChild(meta);

  // Telemetry per module
    const telemetry = document.createElement('div');
    telemetry.style.display = 'grid';
    telemetry.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px,1fr))';
    telemetry.style.gap = '8px';
    const modules = Array.isArray(s.module) ? s.module : [s.module];
    modules.forEach(mod => {
      const card = document.createElement('div');
      card.className = 'gf-card';
      let value = 'N/A';
      switch(mod) {
        case 'temperatura':
        case 'temperature':
          value = s.lastValue || `${18 + Math.floor(Math.random()*8)}°C`;
          card.innerHTML = `<strong>🌡️ Temperatura</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${value}</div>`;
          break;
        case 'humedad':
          value = s.lastValue || `${40 + Math.floor(Math.random()*40)}%`;
          card.innerHTML = `<strong>💧 Humedad</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${value}</div>`;
          break;
        case 'ph':
          value = s.lastValue || `${(6 + Math.random()*1.5).toFixed(2)} pH`;
          card.innerHTML = `<strong>🧪 pH</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${value}</div>`;
          break;
        case 'luminosidad':
          value = s.lastValue || `${200 + Math.floor(Math.random()*800)} lx`;
          card.innerHTML = `<strong>💡 Luminosidad</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${value}</div>`;
          break;
        case 'conductividad':
          value = s.lastValue || `${(0.5 + Math.random()*2).toFixed(2)} mS/cm`;
          card.innerHTML = `<strong>⚡ Conductividad</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${value}</div>`;
          break;
        default:
          card.innerHTML = `<strong>🔧 ${mod}</strong><div style="margin-top:8px;font-weight:800;color:#1b5e20">${s.lastValue || 'OK'}</div>`;
      }
      telemetry.appendChild(card);
    });
    detail.appendChild(telemetry);
    // Last update info
    const updateInfo = document.createElement('div');
    updateInfo.style.marginTop = '8px';
    updateInfo.style.fontSize = '12px';
    updateInfo.style.color = 'rgba(0,0,0,0.6)';
    if (s.lastUpdated) {
      const d = new Date(s.lastUpdated);
      updateInfo.textContent = `Hora de actualización: ${d.toLocaleString()}`;
    } else {
      updateInfo.textContent = 'Hora de actualización: -';
    }
    detail.appendChild(updateInfo);
    grid.appendChild(createCollapsibleCard({ title: `${s.icon} ${s.name}`, icon: s.icon, summaryNode: summary, detailNode: detail }));
  });
  container.appendChild(grid);
}

async function renderClimateSatelliteSection(container, entity) {
  console.log('[DEBUG] renderClimateSatelliteSection called for', entity && entity.elementId);
  
  // Loading state
  container.innerHTML = '<div style="text-align:center; padding:40px; color:#1b5e20;">⏳ Cargando datos meteorológicos...</div>';
  
  try {
    // Obtener cultivo_id del entity
    const cultivoId = entity.cultivoId || entity.id;
    const userId = localStorage.getItem('agroverse_user_id') || '1';
    
    if (!cultivoId) {
      console.warn('[WEATHER] No cultivoId found in entity:', entity);
      renderClimateError(container, 'No se encontró ID de cultivo');
      return;
    }
    
    console.log(`[WEATHER] Fetching weather data for cultivo_id=${cultivoId}, user_id=${userId}`);
    
    // Llamar al endpoint /weather_data del puerto 5001
    const API_URL = window.location.hostname === 'localhost' ? '/api' : '/api';
    const response = await fetch(`${API_URL}/weather_data?cultivo_id=${cultivoId}&user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.warn('[WEATHER] No weather data found:', result);
      renderClimateError(container, 'No hay datos meteorológicos disponibles para este cultivo');
      return;
    }
    
    // Obtener el registro más reciente
    const weatherRecord = result.data[0];
    const weatherData = weatherRecord.data; // JSONB column
    
    console.log('[WEATHER] Data loaded successfully:', weatherData);
    
    // Renderizar datos reales
    renderWeatherDashboard(container, weatherData, weatherRecord);
    
  } catch (error) {
    console.error('[WEATHER] Error loading weather data:', error);
    renderClimateError(container, `Error al cargar datos: ${error.message}`);
  }
}

function renderClimateError(container, message) {
  container.innerHTML = `
    <div class="gf-card" style="text-align:center; padding:40px;">
      <div style="font-size:48px; margin-bottom:16px;">🌦️</div>
      <div style="font-weight:800; color:#e65100; margin-bottom:8px;">Sin Datos Meteorológicos</div>
      <div style="color:rgba(0,0,0,0.6); margin-bottom:20px;">${message}</div>
      <div style="font-size:13px; color:rgba(0,0,0,0.5);">
        Los datos meteorológicos se generan automáticamente al plantar un cultivo con coordenadas GPS.
      </div>
    </div>
  `;
}

function renderWeatherDashboard(container, weatherData, weatherRecord) {
  container.innerHTML = '';
  
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  
  // 1. CLIMA ACTUAL
  const currentCard = createCurrentWeatherCard(weatherData.current_conditions, weatherData.metadata);
  
  // 2. INDICADORES AGRÍCOLAS
  const agriCard = createAgriculturalIndicatorsCard(weatherData.agricultural_indicators);
  
  // 3. PRONÓSTICO 7 DÍAS
  const forecastCard = createDailyForecastCard(weatherData.daily_forecast);
  
  // 4. GRÁFICO DE TEMPERATURA
  const tempChartCard = createTemperatureChartCard(weatherData.daily_forecast);
  
  // 5. GRÁFICO DE PRECIPITACIÓN
  const rainChartCard = createPrecipitationChartCard(weatherData.daily_forecast);
  
  // 6. HUMEDAD DEL SUELO
  const soilCard = createSoilMoistureCard(weatherData.hourly_forecast);
  
  // 7. RESUMEN SEMANAL
  const summaryCard = createWeeklySummaryCard(weatherData.daily_forecast, weatherData.agricultural_indicators);
  
  grid.appendChild(currentCard);
  grid.appendChild(agriCard);
  grid.appendChild(forecastCard);
  grid.appendChild(tempChartCard);
  grid.appendChild(rainChartCard);
  grid.appendChild(soilCard);
  grid.appendChild(summaryCard);
  
  container.appendChild(grid);
  
  // Info footer
  const footer = document.createElement('div');
  footer.style.marginTop = '20px';
  footer.style.padding = '16px';
  footer.style.background = 'rgba(255,255,255,0.5)';
  footer.style.borderRadius = '12px';
  footer.style.fontSize = '12px';
  footer.style.color = 'rgba(0,0,0,0.6)';
  footer.style.textAlign = 'center';
  footer.innerHTML = `
    📡 Datos actualizados el ${new Date(weatherRecord.created_at).toLocaleString('es-ES')} 
    | 🌍 Fuente: Open-Meteo 
    | 📍 ${weatherData.metadata.latitude.toFixed(4)}, ${weatherData.metadata.longitude.toFixed(4)}
  `;
  container.appendChild(footer);
}

function createCurrentWeatherCard(current, metadata) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  
  const weatherIcon = getWeatherIcon(current.weather_code);
  const weatherDesc = getWeatherDescription(current.weather_code);
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        🌡️ Clima Actual
      </div>
      <div class="gf-chip ok">En Vivo</div>
    </div>
    
    <div style="display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:center;">
      <div style="font-size:72px; text-align:center;">${weatherIcon}</div>
      <div>
        <div style="font-size:42px; font-weight:800; color:#1b5e20;">${current.temperature_2m}°C</div>
        <div style="font-size:16px; color:rgba(0,0,0,0.7); margin-top:4px;">${weatherDesc}</div>
        <div style="font-size:13px; color:rgba(0,0,0,0.5); margin-top:8px;">
          💧 Humedad: ${current.relative_humidity_2m}% | 
          🌬️ Viento: ${current.wind_speed_10m} km/h
        </div>
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:16px; padding-top:16px; border-top:1px solid rgba(0,0,0,0.06);">
      <div style="text-align:center;">
        <div style="font-size:11px; color:rgba(0,0,0,0.5);">Presión</div>
        <div style="font-weight:800; color:#1b5e20;">${current.pressure_msl} hPa</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px; color:rgba(0,0,0,0.5);">Nubosidad</div>
        <div style="font-weight:800; color:#1b5e20;">${current.cloud_cover}%</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px; color:rgba(0,0,0,0.5);">Precipitación</div>
        <div style="font-weight:800; color:#1b5e20;">${current.precipitation} mm</div>
      </div>
    </div>
  `;
  
  return card;
}

function createAgriculturalIndicatorsCard(indicators) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  
  const frostChip = indicators.frost_risk === 'bajo' ? 'ok' : (indicators.frost_risk === 'medio' ? 'warn' : 'danger');
  const diseaseChip = indicators.disease_risk === 'bajo' ? 'ok' : (indicators.disease_risk === 'medio' ? 'warn' : 'danger');
  const irrigationChip = indicators.irrigation_need === 'baja' ? 'ok' : (indicators.irrigation_need === 'media' ? 'warn' : 'danger');
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        🌾 Indicadores Agrícolas
      </div>
      <div class="gf-chip ok">IA</div>
    </div>
    
    <div style="display:grid; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <div>
          <div style="font-weight:700; color:#1b5e20;">❄️ Riesgo de Heladas</div>
          <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-top:4px;">
            ${indicators.frost_risk === 'bajo' ? 'Temperatura mínima segura' : 'Monitorear temperaturas nocturnas'}
          </div>
        </div>
        <div class="gf-chip ${frostChip}">${indicators.frost_risk.toUpperCase()}</div>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <div>
          <div style="font-weight:700; color:#1b5e20;">🦠 Riesgo de Enfermedades</div>
          <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-top:4px;">
            ${indicators.disease_risk === 'bajo' ? 'Condiciones desfavorables para hongos' : 'Alta humedad favorece patógenos'}
          </div>
        </div>
        <div class="gf-chip ${diseaseChip}">${indicators.disease_risk.toUpperCase()}</div>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <div>
          <div style="font-weight:700; color:#1b5e20;">💧 Necesidad de Riego</div>
          <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-top:4px;">
            ${indicators.irrigation_need === 'baja' ? 'Humedad del suelo adecuada' : indicators.irrigation_need === 'media' ? 'Considerar riego en 24-48h' : 'Riego urgente requerido'}
          </div>
        </div>
        <div class="gf-chip ${irrigationChip}">${indicators.irrigation_need.toUpperCase()}</div>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <div>
          <div style="font-weight:700; color:#1b5e20;">📊 Déficit de Presión de Vapor</div>
          <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-top:4px;">
            ${indicators.vpd_status === 0 ? 'Condiciones óptimas de transpiración' : 'Posible estrés hídrico en plantas'}
          </div>
        </div>
        <div class="gf-chip ${indicators.vpd_status === 0 ? 'ok' : 'warn'}">${indicators.vpd_status === 0 ? 'ÓPTIMO' : 'ALERTA'}</div>
      </div>
    </div>
    
    <div style="margin-top:16px; padding:12px; background:linear-gradient(135deg, rgba(67,160,71,0.1), rgba(129,199,132,0.1)); border-radius:8px; border-left:4px solid #43a047;">
      <div style="font-weight:700; color:#1b5e20; margin-bottom:6px;">💡 Recomendación Principal</div>
      <div style="font-size:13px; color:rgba(0,0,0,0.7);">
        ${getMainRecommendation(indicators)}
      </div>
    </div>
  `;
  
  return card;
}

function createDailyForecastCard(dailyForecast) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  card.style.gridColumn = '1 / -1'; // Full width
  
  // Tomar los próximos 7 días
  const next7Days = dailyForecast.slice(dailyForecast.length - 7);
  
  const forecastHtml = next7Days.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNum = date.getDate();
    const icon = getWeatherIconFromRain(day.rain_sum, day.cloud_cover);
    
    return `
      <div style="background:rgba(255,255,255,0.5); border-radius:12px; padding:16px; text-align:center;">
        <div style="font-weight:700; color:#1b5e20; text-transform:capitalize;">${dayName}</div>
        <div style="font-size:12px; color:rgba(0,0,0,0.5); margin-bottom:8px;">${dayNum}</div>
        <div style="font-size:36px; margin:8px 0;">${icon}</div>
        <div style="font-size:20px; font-weight:800; color:#1b5e20;">${day.temperature_2m_max}°</div>
        <div style="font-size:14px; color:rgba(0,0,0,0.6);">${day.temperature_2m_min}°</div>
        <div style="font-size:12px; color:#039be5; margin-top:8px;">💧 ${day.rain_sum} mm</div>
      </div>
    `;
  }).join('');
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        📅 Pronóstico 7 Días
      </div>
      <div class="gf-chip ok">Predicción</div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
      ${forecastHtml}
    </div>
  `;
  
  return card;
}

function createTemperatureChartCard(dailyForecast) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  
  const next7Days = dailyForecast.slice(dailyForecast.length - 7);
  const temps = next7Days.map(d => d.temperature_2m_max);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  
  const barsHtml = next7Days.map((day, i) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const height = ((day.temperature_2m_max - minTemp) / (maxTemp - minTemp)) * 100;
    
    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <div style="font-weight:700; font-size:12px; color:#1b5e20;">${day.temperature_2m_max}°</div>
        <div style="width:100%; background:linear-gradient(180deg, #ff6f00, #ffb74d); border-radius:8px 8px 0 0; height:${height}px; min-height:30px; position:relative;">
        </div>
        <div style="font-size:11px; color:rgba(0,0,0,0.6); text-transform:capitalize;">${dayName}</div>
      </div>
    `;
  }).join('');
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        🌡️ Temperaturas Máximas
      </div>
      <div style="font-size:12px; color:rgba(0,0,0,0.5);">${minTemp}° - ${maxTemp}°C</div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px; align-items:flex-end; min-height:150px;">
      ${barsHtml}
    </div>
  `;
  
  return card;
}

function createPrecipitationChartCard(dailyForecast) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  
  const next7Days = dailyForecast.slice(dailyForecast.length - 7);
  const maxRain = Math.max(...next7Days.map(d => d.rain_sum), 1);
  
  const barsHtml = next7Days.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const height = (day.rain_sum / maxRain) * 100;
    
    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <div style="font-weight:700; font-size:12px; color:#039be5;">${day.rain_sum} mm</div>
        <div style="width:100%; background:linear-gradient(180deg, #039be5, #4fc3f7); border-radius:8px 8px 0 0; height:${height}px; min-height:20px;">
        </div>
        <div style="font-size:11px; color:rgba(0,0,0,0.6); text-transform:capitalize;">${dayName}</div>
      </div>
    `;
  }).join('');
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        💧 Precipitación Esperada
      </div>
      <div style="font-size:12px; color:rgba(0,0,0,0.5);">Total: ${next7Days.reduce((sum, d) => sum + d.rain_sum, 0).toFixed(1)} mm</div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px; align-items:flex-end; min-height:150px;">
      ${barsHtml}
    </div>
  `;
  
  return card;
}

function createSoilMoistureCard(hourlyForecast) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  
  // Tomar últimas 24 horas
  const last24h = hourlyForecast.slice(-24);
  const avgMoisture0 = (last24h.reduce((sum, h) => sum + h.soil_moisture_0_to_1cm, 0) / last24h.length * 100).toFixed(1);
  const avgMoisture6 = (last24h.reduce((sum, h) => sum + h.soil_moisture_3_to_9cm, 0) / last24h.length * 100).toFixed(1);
  const avgMoisture27 = (last24h.reduce((sum, h) => sum + h.soil_moisture_9_to_27cm, 0) / last24h.length * 100).toFixed(1);
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        🌱 Humedad del Suelo (Promedio 24h)
      </div>
      <div class="gf-chip ok">Sensor</div>
    </div>
    
    <div style="display:grid; gap:12px;">
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:13px; color:rgba(0,0,0,0.7);">0-1 cm (Superficie)</span>
          <span style="font-weight:800; color:#1b5e20;">${avgMoisture0}%</span>
        </div>
        <div style="height:12px; background:rgba(0,0,0,0.06); border-radius:6px; overflow:hidden;">
          <div style="height:100%; background:linear-gradient(90deg, #039be5, #4fc3f7); width:${avgMoisture0}%; transition:width 0.3s;"></div>
        </div>
      </div>
      
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:13px; color:rgba(0,0,0,0.7);">3-9 cm (Raíces superficiales)</span>
          <span style="font-weight:800; color:#1b5e20;">${avgMoisture6}%</span>
        </div>
        <div style="height:12px; background:rgba(0,0,0,0.06); border-radius:6px; overflow:hidden;">
          <div style="height:100%; background:linear-gradient(90deg, #00897b, #26a69a); width:${avgMoisture6}%; transition:width 0.3s;"></div>
        </div>
      </div>
      
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:13px; color:rgba(0,0,0,0.7);">9-27 cm (Raíces profundas)</span>
          <span style="font-weight:800; color:#1b5e20;">${avgMoisture27}%</span>
        </div>
        <div style="height:12px; background:rgba(0,0,0,0.06); border-radius:6px; overflow:hidden;">
          <div style="height:100%; background:linear-gradient(90deg, #43a047, #81c784); width:${avgMoisture27}%; transition:width 0.3s;"></div>
        </div>
      </div>
    </div>
    
    <div style="margin-top:12px; padding:10px; background:rgba(3,155,229,0.08); border-radius:8px; font-size:12px; color:rgba(0,0,0,0.7);">
      💡 <strong>Interpretación:</strong> Valores entre 20-30% indican humedad óptima. 
      Por debajo de 15% requiere riego. Por encima de 35% puede indicar exceso de agua.
    </div>
  `;
  
  return card;
}

function createWeeklySummaryCard(dailyForecast, indicators) {
  const card = document.createElement('div');
  card.className = 'gf-card';
  card.style.gridColumn = '1 / -1';
  
  const next7Days = dailyForecast.slice(dailyForecast.length - 7);
  
  const avgMaxTemp = (next7Days.reduce((sum, d) => sum + d.temperature_2m_max, 0) / 7).toFixed(1);
  const avgMinTemp = (next7Days.reduce((sum, d) => sum + d.temperature_2m_min, 0) / 7).toFixed(1);
  const totalRain = next7Days.reduce((sum, d) => sum + d.rain_sum, 0).toFixed(1);
  const avgSunshine = (next7Days.reduce((sum, d) => sum + d.sunshine_duration / 3600, 0) / 7).toFixed(1);
  const avgWindSpeed = (next7Days.reduce((sum, d) => sum + d.wind_speed_10m_max, 0) / 7).toFixed(1);
  
  const rainyDays = next7Days.filter(d => d.rain_sum > 1).length;
  
  card.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; display:flex; align-items:center; gap:8px;">
        📊 Resumen Semanal
      </div>
      <div class="gf-chip ok">7 Días</div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
      <div style="background:linear-gradient(135deg, rgba(255,111,0,0.1), rgba(255,183,77,0.1)); padding:16px; border-radius:12px; border-left:4px solid #ff6f00;">
        <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:4px;">🌡️ Temperatura Media</div>
        <div style="font-size:24px; font-weight:800; color:#e65100;">${avgMaxTemp}° / ${avgMinTemp}°C</div>
        <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">Máx/Mín promedio</div>
      </div>
      
      <div style="background:linear-gradient(135deg, rgba(3,155,229,0.1), rgba(79,195,247,0.1)); padding:16px; border-radius:12px; border-left:4px solid #039be5;">
        <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:4px;">💧 Precipitación Total</div>
        <div style="font-size:24px; font-weight:800; color:#01579b;">${totalRain} mm</div>
        <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">${rainyDays} días con lluvia</div>
      </div>
      
      <div style="background:linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,224,130,0.1)); padding:16px; border-radius:12px; border-left:4px solid #ffc107;">
        <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:4px;">☀️ Horas de Sol</div>
        <div style="font-size:24px; font-weight:800; color:#f57f17;">${avgSunshine} h/día</div>
        <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">Promedio diario</div>
      </div>
      
      <div style="background:linear-gradient(135deg, rgba(67,160,71,0.1), rgba(129,199,132,0.1)); padding:16px; border-radius:12px; border-left:4px solid #43a047;">
        <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:4px;">🌬️ Viento Promedio</div>
        <div style="font-size:24px; font-weight:800; color:#2e7d32;">${avgWindSpeed} km/h</div>
        <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">Velocidad máxima media</div>
      </div>
    </div>
    
    <div style="margin-top:20px; padding:16px; background:linear-gradient(135deg, rgba(67,160,71,0.08), rgba(129,199,132,0.08)); border-radius:12px; border:2px dashed #43a047;">
      <div style="font-weight:800; color:#1b5e20; margin-bottom:12px;">🎯 Recomendaciones Semanales</div>
      <ul style="margin:0; padding-left:20px; color:rgba(0,0,0,0.7); font-size:13px; line-height:1.6;">
        ${generateWeeklyRecommendations(next7Days, indicators).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  `;
  
  return card;
}

// HELPER FUNCTIONS

function getWeatherIcon(code) {
  const icons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '🌨️',
    80: '🌧️', 81: '⛈️', 82: '⛈️',
    85: '🌨️', 86: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  return icons[code] || '🌤️';
}

function getWeatherDescription(code) {
  const descs = {
    0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Niebla', 48: 'Niebla con escarcha',
    51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
    61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
    71: 'Nevada ligera', 73: 'Nevada moderada', 75: 'Nevada intensa',
    80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos intensos',
    85: 'Chubascos de nieve ligeros', 86: 'Chubascos de nieve intensos',
    95: 'Tormenta', 96: 'Tormenta con granizo ligero', 99: 'Tormenta con granizo intenso'
  };
  return descs[code] || 'Condiciones variables';
}

function getWeatherIconFromRain(rain, cloud) {
  if (rain > 10) return '🌧️';
  if (rain > 1) return '🌦️';
  if (cloud > 70) return '☁️';
  if (cloud > 40) return '⛅';
  return '☀️';
}

function getMainRecommendation(indicators) {
  const recommendations = [];
  
  if (indicators.frost_risk !== 'bajo') {
    recommendations.push('Proteger cultivos sensibles al frío durante la noche');
  }
  if (indicators.disease_risk !== 'bajo') {
    recommendations.push('Aplicar fungicidas preventivos y mejorar ventilación');
  }
  if (indicators.irrigation_need === 'alta') {
    recommendations.push('Programar riego inmediato para evitar estrés hídrico');
  } else if (indicators.irrigation_need === 'media') {
    recommendations.push('Monitorear humedad del suelo y preparar sistema de riego');
  }
  
  if (recommendations.length === 0) {
    return 'Condiciones óptimas. Continuar con el plan de manejo habitual y monitorear cambios diarios.';
  }
  
  return recommendations[0];
}

function generateWeeklyRecommendations(forecast, indicators) {
  const recs = [];
  
  const totalRain = forecast.reduce((sum, d) => sum + d.rain_sum, 0);
  const rainyDays = forecast.filter(d => d.rain_sum > 1).length;
  const avgTemp = forecast.reduce((sum, d) => sum + d.temperature_2m_max, 0) / 7;
  
  if (totalRain > 30) {
    recs.push('Alta precipitación esperada: Verificar drenaje y evitar fertilización hasta que cese la lluvia');
  } else if (totalRain < 5) {
    recs.push('Semana seca: Aumentar frecuencia de riego y considerar mulching para retener humedad');
  }
  
  if (avgTemp > 30) {
    recs.push('Temperaturas altas: Programar riegos temprano en la mañana o al atardecer');
  } else if (avgTemp < 15) {
    recs.push('Temperaturas bajas: Reducir riego y monitorear plagas de clima frío');
  }
  
  if (indicators.disease_risk !== 'bajo') {
    recs.push('Riesgo de enfermedades: Inspeccionar follaje diariamente y eliminar material vegetal infectado');
  }
  
  if (rainyDays >= 4) {
    recs.push('Múltiples días lluviosos: Posponer aplicaciones foliares hasta 48h después de la última lluvia');
  }
  
  recs.push('Continuar con monitoreo diario de indicadores de salud del cultivo');
  
  return recs.slice(0, 5);
}

async function renderHarvestSection(container, entity) {
  container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(0,0,0,0.5);">⏳ Calculando predicción de cosecha...</div>';
  
  // Obtener datos
  const satelliteData = generateSatelliteData(entity, 14);
  let weatherData = null;
  
  try {
    const cultivoId = entity.cultivoId || entity.cultivo_id || entity.id;
    const userId = localStorage.getItem('agroverse_user_id') || '1';
    const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://localhost:5001/api'
      : '/api';
    
    const response = await fetch(`${API_URL}/weather_data?cultivo_id=${cultivoId}&user_id=${userId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        weatherData = result.data[0].data;
      }
    }
  } catch (error) {
    console.log('[HARVEST] Using simulated data');
  }
  
  const gdd = calculateGDD(entity, weatherData);
  const phenology = getPhenologyStage(entity, gdd);
  const yieldPrediction = predictYield(entity, satelliteData, weatherData, gdd);
  
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  
  // ============ TARJETA 1: PREDICCIÓN DE RENDIMIENTO ============
  const yieldCard = document.createElement('div');
  yieldCard.className = 'gf-card';
  yieldCard.style.gridColumn = '1 / -1';
  yieldCard.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; font-size:18px;">🌾 Predicción de Rendimiento</div>
      <div class="gf-chip ok">Confianza: 85%</div>
    </div>
  `;
  
  const yieldGrid = document.createElement('div');
  yieldGrid.style.display = 'grid';
  yieldGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  yieldGrid.style.gap = '16px';
  
  yieldGrid.innerHTML = `
    <div style="background:linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05)); padding:20px; border-radius:16px; border:2px solid rgba(76,175,80,0.3); text-align:center;">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:8px;">Rendimiento Esperado</div>
      <div style="font-size:40px; font-weight:800; color:#4caf50; line-height:1;">
        ${(yieldPrediction.expected / 1000).toFixed(1)}
      </div>
      <div style="font-size:16px; font-weight:600; color:#4caf50; margin-top:4px;">ton/ha</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:8px;">
        Rango: ${(yieldPrediction.min / 1000).toFixed(1)} - ${(yieldPrediction.max / 1000).toFixed(1)} ton/ha
      </div>
    </div>
    
    <div style="background:rgba(255,255,255,0.5); padding:20px; border-radius:16px; border:1px solid rgba(0,0,0,0.08);">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:12px;">Factores de Ajuste</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:rgba(0,0,0,0.7);">NDVI (vegetación)</span>
          <span style="font-weight:700; color:${yieldPrediction.factors.ndvi >= 1 ? '#4caf50' : '#ff9800'};">
            ${(yieldPrediction.factors.ndvi * 100).toFixed(0)}%
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:rgba(0,0,0,0.7);">GDD (desarrollo)</span>
          <span style="font-weight:700; color:${yieldPrediction.factors.gdd >= 1 ? '#4caf50' : '#ff9800'};">
            ${(yieldPrediction.factors.gdd * 100).toFixed(0)}%
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:rgba(0,0,0,0.7);">Agua (estrés hídrico)</span>
          <span style="font-weight:700; color:${yieldPrediction.factors.water >= 1 ? '#4caf50' : '#ff9800'};">
            ${(yieldPrediction.factors.water * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg, rgba(33,150,243,0.1), rgba(33,150,243,0.05)); padding:20px; border-radius:16px; border:1px solid rgba(33,150,243,0.2); text-align:center;">
      <div style="font-size:12px; color:rgba(0,0,0,0.6); margin-bottom:8px;">Producción Total Estimada</div>
      <div style="font-size:32px; font-weight:800; color:#2196f3; line-height:1;">
        ${((yieldPrediction.expected / 1000) * (entity.areaMeasure?.value || 1)).toFixed(2)}
      </div>
      <div style="font-size:14px; font-weight:600; color:#2196f3; margin-top:4px;">toneladas</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:8px;">
        Área: ${entity.areaMeasure?.value || 1} ${entity.areaMeasure?.unit || 'ha'}
      </div>
    </div>
  `;
  
  yieldCard.appendChild(yieldGrid);
  
  // ============ TARJETA 2: VENTANA DE COSECHA ============
  const windowCard = document.createElement('div');
  windowCard.className = 'gf-card';
  windowCard.style.gridColumn = '1 / -1';
  windowCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      📅 Ventana Óptima de Cosecha
    </div>
  `;
  
  // Calcular fechas basadas en GDD y días
  const daysSincePlanting = entity.plantedAt 
    ? Math.floor((Date.now() - new Date(entity.plantedAt)) / 86400000)
    : 45;
  
  // GDD típico para cosecha: 1000-1400 según cultivo
  const gddForHarvest = 1200;
  const daysRemaining = Math.max(0, Math.ceil((gddForHarvest - gdd) / 12)); // Asumiendo 12 GDD/día
  
  const earliestDate = new Date(Date.now() + (daysRemaining - 7) * 86400000);
  const optimalDate = new Date(Date.now() + daysRemaining * 86400000);
  const latestDate = new Date(Date.now() + (daysRemaining + 14) * 86400000);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const dateGrid = document.createElement('div');
  dateGrid.style.display = 'grid';
  dateGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  dateGrid.style.gap = '12px';
  
  dateGrid.innerHTML = `
    <div style="background:rgba(255,152,0,0.08); padding:16px; border-radius:12px; border:1px solid rgba(255,152,0,0.2);">
      <div style="font-size:24px; margin-bottom:8px;">🔶</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6); margin-bottom:6px;">Fecha Más Temprana</div>
      <div style="font-size:18px; font-weight:800; color:#ff9800;">${formatDate(earliestDate)}</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.5); margin-top:6px;">Madurez mínima alcanzada</div>
    </div>
    
    <div style="background:linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05)); padding:16px; border-radius:12px; border:2px solid rgba(76,175,80,0.4);">
      <div style="font-size:24px; margin-bottom:8px;">✅</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6); margin-bottom:6px;">Fecha Óptima</div>
      <div style="font-size:20px; font-weight:800; color:#4caf50;">${formatDate(optimalDate)}</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.5); margin-top:6px;">Mejor calidad y rendimiento</div>
    </div>
    
    <div style="background:rgba(244,67,54,0.08); padding:16px; border-radius:12px; border:1px solid rgba(244,67,54,0.2);">
      <div style="font-size:24px; margin-bottom:8px;">⚠️</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6); margin-bottom:6px;">Fecha Límite</div>
      <div style="font-size:18px; font-weight:800; color:#f44336;">${formatDate(latestDate)}</div>
      <div style="font-size:10px; color:rgba(0,0,0,0.5); margin-top:6px;">Riesgo de sobremaduración</div>
    </div>
  `;
  
  windowCard.appendChild(dateGrid);
  
  // Info adicional
  const harvestInfo = document.createElement('div');
  harvestInfo.style.marginTop = '14px';
  harvestInfo.style.padding = '14px';
  harvestInfo.style.background = 'rgba(76,175,80,0.08)';
  harvestInfo.style.borderRadius = '10px';
  harvestInfo.style.fontSize = '13px';
  harvestInfo.style.color = 'rgba(0,0,0,0.7)';
  
  const progressToHarvest = Math.min(100, (gdd / gddForHarvest) * 100);
  
  harvestInfo.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
      <div><strong>GDD para cosecha:</strong> ${gddForHarvest}°C</div>
      <div><strong>GDD actual:</strong> ${gdd}°C (${progressToHarvest.toFixed(0)}%)</div>
      <div><strong>Días restantes:</strong> ~${daysRemaining} días</div>
      <div><strong>Etapa actual:</strong> ${phenology.label}</div>
    </div>
  `;
  windowCard.appendChild(harvestInfo);
  
  // ============ TARJETA 3: ANÁLISIS DE CALIDAD ============
  const qualityCard = document.createElement('div');
  qualityCard.className = 'gf-card';
  qualityCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      ⭐ Análisis de Calidad Esperada
    </div>
  `;
  
  // Calcular score de calidad (A, B, C, D)
  let qualityScore = 85;
  
  // Penalizar por estrés
  const avgNDVI = satelliteData.slice(-7).reduce((sum, d) => sum + d.ndvi, 0) / 7;
  if (avgNDVI < 0.5) qualityScore -= 15;
  else if (avgNDVI < 0.6) qualityScore -= 8;
  
  // Penalizar por déficit hídrico
  if (weatherData && weatherData.daily_forecast) {
    const totalRain = weatherData.daily_forecast.slice(0, 14).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    if (totalRain < 30) qualityScore -= 12;
  }
  
  let qualityGrade = 'A';
  let gradeColor = '#4caf50';
  if (qualityScore < 70) { qualityGrade = 'D'; gradeColor = '#f44336'; }
  else if (qualityScore < 80) { qualityGrade = 'C'; gradeColor = '#ff9800'; }
  else if (qualityScore < 90) { qualityGrade = 'B'; gradeColor = '#66bb6a'; }
  
  const qualityGrid = document.createElement('div');
  qualityGrid.style.display = 'grid';
  qualityGrid.style.gridTemplateColumns = '200px 1fr';
  qualityGrid.style.gap = '20px';
  qualityGrid.style.alignItems = 'center';
  
  qualityGrid.innerHTML = `
    <div style="text-align:center;">
      <div style="width:150px; height:150px; margin:0 auto; border-radius:50%; background:linear-gradient(135deg, ${gradeColor}, ${gradeColor}dd); display:grid; place-items:center; box-shadow:0 8px 24px ${gradeColor}40;">
        <div>
          <div style="font-size:72px; font-weight:800; color:#fff; line-height:1;">${qualityGrade}</div>
          <div style="font-size:14px; font-weight:600; color:#fff; opacity:0.9;">Calidad</div>
        </div>
      </div>
      <div style="margin-top:12px; font-size:12px; color:rgba(0,0,0,0.6);">Score: ${qualityScore}/100</div>
    </div>
    
    <div>
      <div style="margin-bottom:14px;">
        <div style="font-size:13px; font-weight:600; color:rgba(0,0,0,0.7); margin-bottom:8px;">Factores que Afectan Calidad:</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:8px; height:8px; border-radius:50%; background:${avgNDVI >= 0.6 ? '#4caf50' : '#ff9800'};"></div>
            <span style="font-size:12px; color:rgba(0,0,0,0.7);">Vigor vegetativo: ${avgNDVI >= 0.6 ? 'Excelente' : 'Moderado'}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:8px; height:8px; border-radius:50%; background:${weatherData ? '#4caf50' : '#ff9800'};"></div>
            <span style="font-size:12px; color:rgba(0,0,0,0.7);">Estrés hídrico: ${weatherData ? 'Bajo' : 'Desconocido'}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:8px; height:8px; border-radius:50%; background:#4caf50;"></div>
            <span style="font-size:12px; color:rgba(0,0,0,0.7);">Balance nutricional: Adecuado</span>
          </div>
        </div>
      </div>
      
      <div style="background:rgba(33,150,243,0.08); padding:12px; border-radius:8px; border:1px solid rgba(33,150,243,0.2);">
        <div style="font-size:12px; font-weight:600; color:rgba(0,0,0,0.7); margin-bottom:6px;">💰 Precio Estimado de Mercado</div>
        <div style="display:flex; align-items:baseline; gap:6px;">
          <span style="font-size:28px; font-weight:800; color:#2196f3;">$2.50</span>
          <span style="font-size:14px; color:rgba(0,0,0,0.6);">USD/kg</span>
        </div>
        <div style="font-size:11px; color:rgba(0,0,0,0.5); margin-top:4px;">
          Basado en calidad ${qualityGrade} y mercado regional
        </div>
      </div>
    </div>
  `;
  
  qualityCard.appendChild(qualityGrid);
  
  // ============ TARJETA 4: RECOMENDACIONES PRE-COSECHA ============
  const recsCard = document.createElement('div');
  recsCard.className = 'gf-card';
  recsCard.style.gridColumn = '1 / -1';
  recsCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:14px;">
      📋 Recomendaciones Pre-Cosecha
    </div>
  `;
  
  const timeline = document.createElement('div');
  timeline.style.display = 'flex';
  timeline.style.flexDirection = 'column';
  timeline.style.gap = '12px';
  
  const recommendations = [
    {
      when: `${Math.max(14, daysRemaining)} días antes`,
      icon: '💧',
      title: 'Reducir Riego',
      desc: 'Disminuir frecuencia de riego para concentrar azúcares y mejorar firmeza del fruto'
    },
    {
      when: `${Math.max(7, Math.floor(daysRemaining * 0.7))} días antes`,
      icon: '🧪',
      title: 'Análisis de Madurez',
      desc: 'Muestrear frutos para medir °Brix, firmeza y color. Ajustar fecha si es necesario'
    },
    {
      when: `${Math.max(3, Math.floor(daysRemaining * 0.3))} días antes`,
      icon: '🚜',
      title: 'Preparar Logística',
      desc: 'Coordinar maquinaria, personal de cosecha y transporte. Revisar equipamiento'
    },
    {
      when: '1 día antes',
      icon: '📦',
      title: 'Preparar Empaque',
      desc: 'Tener listas cajas, bins y materiales de empaque. Limpiar área de acopio'
    }
  ];
  
  recommendations.forEach((rec, idx) => {
    const recBox = document.createElement('div');
    recBox.style.display = 'flex';
    recBox.style.gap = '14px';
    recBox.style.alignItems = 'start';
    recBox.style.padding = '14px';
    recBox.style.background = idx === 0 ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.5)';
    recBox.style.borderRadius = '10px';
    recBox.style.border = '1px solid rgba(0,0,0,0.06)';
    
    recBox.innerHTML = `
      <div style="font-size:32px; line-height:1;">${rec.icon}</div>
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
          <div style="font-weight:700; color:#1b5e20; font-size:14px;">${rec.title}</div>
          <div style="font-size:11px; color:rgba(0,0,0,0.5); background:rgba(0,0,0,0.05); padding:4px 8px; border-radius:999px;">
            ${rec.when}
          </div>
        </div>
        <div style="font-size:13px; color:rgba(0,0,0,0.7);">${rec.desc}</div>
      </div>
    `;
    
    timeline.appendChild(recBox);
  });
  
  recsCard.appendChild(timeline);
  
  // Añadir todas las tarjetas
  grid.appendChild(yieldCard);
  grid.appendChild(windowCard);
  grid.appendChild(qualityCard);
  grid.appendChild(recsCard);
  
  container.appendChild(grid);
}

function createDashboardCard(title, items) {
  const card = document.createElement('div');
  card.style.background = 'rgba(255,255,255,0.1)';
  card.style.backdropFilter = 'blur(15px)';
  card.style.borderRadius = '20px';
  card.style.padding = '24px';
  card.style.border = '1px solid rgba(255,255,255,0.2)';
  card.style.transition = 'all 0.3s ease';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  // Hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
    card.style.background = 'rgba(255,255,255,0.15)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
    card.style.background = 'rgba(255,255,255,0.1)';
  });

  // Decorative gradient overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.height = '4px';
  overlay.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a, #66bb6a)';
  overlay.style.opacity = '0.8';
  card.appendChild(overlay);

  const cardTitle = document.createElement('h3');
  cardTitle.textContent = title;
  cardTitle.style.margin = '0 0 20px 0';
  cardTitle.style.color = '#fff';
  cardTitle.style.fontSize = '18px';
  cardTitle.style.fontWeight = '700';
  cardTitle.style.display = 'flex';
  cardTitle.style.alignItems = 'center';
  cardTitle.style.gap = '10px';
  
  // Add icon based on title
  const titleIcon = document.createElement('span');
  titleIcon.style.fontSize = '20px';
  if (title.includes('Meteorológicos')) titleIcon.textContent = '🌤️';
  else if (title.includes('Salud')) titleIcon.textContent = '🌱';
  else if (title.includes('Cosecha')) titleIcon.textContent = '🌾';
  else if (title.includes('Ubicación')) titleIcon.textContent = '📍';
  else titleIcon.textContent = '📊';
  
  cardTitle.insertBefore(titleIcon, cardTitle.firstChild);
  card.appendChild(cardTitle);

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '12px';

  items.forEach((item, index) => {
    const li = document.createElement('div');
    li.style.color = 'rgba(255,255,255,0.9)';
    li.style.padding = '12px 16px';
    li.style.background = 'rgba(255,255,255,0.05)';
    li.style.borderRadius = '10px';
    li.style.fontSize = '14px';
    li.style.border = '1px solid rgba(255,255,255,0.1)';
    li.style.transition = 'all 0.2s ease';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    
    li.addEventListener('mouseenter', () => {
      li.style.background = 'rgba(255,255,255,0.1)';
      li.style.transform = 'translateX(4px)';
    });
    li.addEventListener('mouseleave', () => {
      li.style.background = 'rgba(255,255,255,0.05)';
      li.style.transform = 'translateX(0)';
    });

    // Split item into label and value if it contains ":"
    if (item.includes(':')) {
      const [label, value] = item.split(':');
      const labelSpan = document.createElement('span');
      labelSpan.textContent = label + ':';
      labelSpan.style.fontWeight = '500';
      
      const valueSpan = document.createElement('span');
      valueSpan.textContent = value;
      valueSpan.style.fontWeight = '700';
      valueSpan.style.color = '#4caf50';
      
      li.appendChild(labelSpan);
      li.appendChild(valueSpan);
    } else {
      li.textContent = item;
    }
    
    list.appendChild(li);
  });

  card.appendChild(list);
  return card;
}

function createAlertsCard() {
  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(255,87,34,0.2) 0%, rgba(255,152,0,0.15) 100%)';
  card.style.backdropFilter = 'blur(15px)';
  card.style.borderRadius = '20px';
  card.style.padding = '24px';
  card.style.border = '2px solid rgba(255,87,34,0.3)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  card.style.transition = 'all 0.3s ease';

  // Animated pulse effect for alerts
  const pulseOverlay = document.createElement('div');
  pulseOverlay.style.position = 'absolute';
  pulseOverlay.style.top = '0';
  pulseOverlay.style.left = '0';
  pulseOverlay.style.right = '0';
  pulseOverlay.style.height = '4px';
  pulseOverlay.style.background = 'linear-gradient(90deg, #ff5722, #ff9800, #ff5722)';
  pulseOverlay.style.animation = 'pulse 2s ease-in-out infinite';
  card.appendChild(pulseOverlay);

  // Add CSS animation
  if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  const cardTitle = document.createElement('h3');
  cardTitle.innerHTML = '⚠️ <span style="margin-left: 8px;">Alertas Críticas</span>';
  cardTitle.style.margin = '0 0 20px 0';
  cardTitle.style.color = '#ffcc80';
  cardTitle.style.fontSize = '18px';
  cardTitle.style.fontWeight = '700';
  cardTitle.style.display = 'flex';
  cardTitle.style.alignItems = 'center';
  card.appendChild(cardTitle);

  const alerts = [
    { level: 'critical', text: 'Humedad del suelo crítica - Riego urgente', priority: 1 },
    { level: 'warning', text: 'Temperatura superior a la óptima', priority: 2 },
    { level: 'info', text: 'Próximo riego programado en 2 días', priority: 3 },
    { level: 'success', text: 'Crecimiento dentro de parámetros normales', priority: 4 }
  ];

  alerts.forEach((alert, index) => {
    const alertItem = document.createElement('div');
    alertItem.style.padding = '16px 20px';
    alertItem.style.margin = '10px 0';
    alertItem.style.borderRadius = '12px';
    alertItem.style.fontSize = '14px';
    alertItem.style.display = 'flex';
    alertItem.style.alignItems = 'center';
    alertItem.style.gap = '12px';
    alertItem.style.transition = 'all 0.3s ease';
    alertItem.style.cursor = 'pointer';
    alertItem.style.position = 'relative';
    
    // Priority indicator
    const priorityIndicator = document.createElement('div');
    priorityIndicator.style.width = '4px';
    priorityIndicator.style.height = '100%';
    priorityIndicator.style.position = 'absolute';
    priorityIndicator.style.left = '0';
    priorityIndicator.style.borderRadius = '0 4px 4px 0';
    
    const iconElement = document.createElement('span');
    iconElement.style.fontSize = '20px';
    iconElement.style.minWidth = '24px';
    
    const textElement = document.createElement('span');
    textElement.textContent = alert.text;
    textElement.style.flex = '1';
    
    switch(alert.level) {
      case 'critical':
        alertItem.style.background = 'linear-gradient(135deg, rgba(244,67,54,0.2), rgba(211,47,47,0.15))';
        alertItem.style.border = '1px solid rgba(244,67,54,0.4)';
        alertItem.style.color = '#ffcdd2';
        iconElement.textContent = '🚨';
        priorityIndicator.style.background = '#f44336';
        break;
      case 'warning':
        alertItem.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,152,0,0.15))';
        alertItem.style.border = '1px solid rgba(255,193,7,0.4)';
        alertItem.style.color = '#fff3cd';
        iconElement.textContent = '⚠️';
        priorityIndicator.style.background = '#ffc107';
        break;
      case 'info':
        alertItem.style.background = 'linear-gradient(135deg, rgba(33,150,243,0.2), rgba(30,136,229,0.15))';
        alertItem.style.border = '1px solid rgba(33,150,243,0.4)';
        alertItem.style.color = '#cce7ff';
        iconElement.textContent = 'ℹ️';
        priorityIndicator.style.background = '#2196f3';
        break;
      case 'success':
        alertItem.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(67,160,71,0.15))';
        alertItem.style.border = '1px solid rgba(76,175,80,0.4)';
        alertItem.style.color = '#c8e6c9';
        iconElement.textContent = '✅';
        priorityIndicator.style.background = '#4caf50';
        break;
    }
    
    alertItem.addEventListener('mouseenter', () => {
      alertItem.style.transform = 'translateX(8px) scale(1.02)';
      alertItem.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    alertItem.addEventListener('mouseleave', () => {
      alertItem.style.transform = 'translateX(0) scale(1)';
      alertItem.style.boxShadow = 'none';
    });
    
    alertItem.appendChild(priorityIndicator);
    alertItem.appendChild(iconElement);
    alertItem.appendChild(textElement);
    card.appendChild(alertItem);
  });

  return card;
}

function createSensorsManagementCard(entity) {
  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(103,58,183,0.2) 0%, rgba(156,39,176,0.15) 100%)';
  card.style.backdropFilter = 'blur(15px)';
  card.style.borderRadius = '20px';
  card.style.padding = '24px';
  card.style.border = '2px solid rgba(103,58,183,0.3)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  // Animated tech pattern overlay
  const techOverlay = document.createElement('div');
  techOverlay.style.position = 'absolute';
  techOverlay.style.top = '0';
  techOverlay.style.left = '0';
  techOverlay.style.right = '0';
  techOverlay.style.height = '4px';
  techOverlay.style.background = 'linear-gradient(90deg, #673ab7, #9c27b0, #673ab7)';
  techOverlay.style.opacity = '0.8';
  card.appendChild(techOverlay);

  const cardTitle = document.createElement('h3');
  cardTitle.innerHTML = '📡 <span style="margin-left: 8px;">Centro de Control IoT</span>';
  cardTitle.style.margin = '0 0 20px 0';
  cardTitle.style.color = '#e1bee7';
  cardTitle.style.fontSize = '18px';
  cardTitle.style.fontWeight = '700';
  cardTitle.style.display = 'flex';
  cardTitle.style.alignItems = 'center';
  card.appendChild(cardTitle);

  // Status overview
  const statusOverview = document.createElement('div');
  statusOverview.style.background = 'rgba(255,255,255,0.05)';
  statusOverview.style.borderRadius = '12px';
  statusOverview.style.padding = '16px';
  statusOverview.style.marginBottom = '20px';
  statusOverview.style.border = '1px solid rgba(255,255,255,0.1)';

  const statusTitle = document.createElement('div');
  statusTitle.innerHTML = '📊 <span style="margin-left: 8px;">Estado de la Red</span>';
  statusTitle.style.fontWeight = '600';
  statusTitle.style.color = '#fff';
  statusTitle.style.marginBottom = '12px';
  statusTitle.style.fontSize = '14px';
  statusTitle.style.display = 'flex';
  statusTitle.style.alignItems = 'center';
  statusOverview.appendChild(statusTitle);

  const networkStats = document.createElement('div');
  networkStats.style.display = 'grid';
  networkStats.style.gridTemplateColumns = '1fr 1fr';
  networkStats.style.gap = '12px';
  networkStats.innerHTML = `
    <div style="text-align: center;">
      <div style="color: #4caf50; font-size: 18px; font-weight: 700;">2/3</div>
      <div style="color: rgba(255,255,255,0.7); font-size: 12px;">Sensores Activos</div>
    </div>
    <div style="text-align: center;">
      <div style="color: #ff9800; font-size: 18px; font-weight: 700;">98%</div>
      <div style="color: rgba(255,255,255,0.7); font-size: 12px;">Conectividad</div>
    </div>
  `;
  statusOverview.appendChild(networkStats);
  card.appendChild(statusOverview);

  // Current sensors with enhanced status
  const currentSensors = document.createElement('div');
  currentSensors.style.marginBottom = '20px';
  
  const sensorsTitle = document.createElement('div');
  sensorsTitle.innerHTML = '🔗 <span style="margin-left: 8px;">Dispositivos Conectados</span>';
  sensorsTitle.style.fontWeight = '600';
  sensorsTitle.style.color = '#fff';
  sensorsTitle.style.marginBottom = '12px';
  sensorsTitle.style.fontSize = '14px';
  sensorsTitle.style.display = 'flex';
  sensorsTitle.style.alignItems = 'center';
  currentSensors.appendChild(sensorsTitle);

  const sensorsList = [
    { name: 'Sensor Temperatura', icon: '🌡️', status: 'active', signal: 95, battery: 78 },
    { name: 'Sensor Humedad', icon: '💧', status: 'active', signal: 87, battery: 92 },
    { name: 'Sensor pH del Suelo', icon: '🧪', status: 'offline', signal: 0, battery: 23 }
  ];

  sensorsList.forEach(sensor => {
    const sensorItem = document.createElement('div');
    sensorItem.style.background = 'rgba(255,255,255,0.05)';
    sensorItem.style.borderRadius = '12px';
    sensorItem.style.padding = '16px';
    sensorItem.style.margin = '8px 0';
    sensorItem.style.border = '1px solid rgba(255,255,255,0.1)';
    sensorItem.style.transition = 'all 0.3s ease';
    
    sensorItem.addEventListener('mouseenter', () => {
      sensorItem.style.background = 'rgba(255,255,255,0.1)';
      sensorItem.style.transform = 'translateX(4px)';
    });
    sensorItem.addEventListener('mouseleave', () => {
      sensorItem.style.background = 'rgba(255,255,255,0.05)';
      sensorItem.style.transform = 'translateX(0)';
    });

    const sensorHeader = document.createElement('div');
    sensorHeader.style.display = 'flex';
    sensorHeader.style.justifyContent = 'space-between';
    sensorHeader.style.alignItems = 'center';
    sensorHeader.style.marginBottom = '8px';

    const sensorInfo = document.createElement('div');
    sensorInfo.style.display = 'flex';
    sensorInfo.style.alignItems = 'center';
    sensorInfo.style.gap = '8px';
    sensorInfo.innerHTML = `
      <span style="font-size: 16px;">${sensor.icon}</span>
      <span style="color: #fff; font-weight: 500;">${sensor.name}</span>
    `;

    const statusBadge = document.createElement('div');
    statusBadge.style.padding = '4px 8px';
    statusBadge.style.borderRadius = '12px';
    statusBadge.style.fontSize = '11px';
    statusBadge.style.fontWeight = '600';
    statusBadge.style.textTransform = 'uppercase';
    
    if (sensor.status === 'active') {
      statusBadge.style.background = 'rgba(76,175,80,0.3)';
      statusBadge.style.color = '#4caf50';
      statusBadge.textContent = '● ACTIVO';
    } else {
      statusBadge.style.background = 'rgba(244,67,54,0.3)';
      statusBadge.style.color = '#f44336';
      statusBadge.textContent = '● OFFLINE';
    }

    sensorHeader.appendChild(sensorInfo);
    sensorHeader.appendChild(statusBadge);
    sensorItem.appendChild(sensorHeader);

    if (sensor.status === 'active') {
      const metrics = document.createElement('div');
      metrics.style.display = 'flex';
      metrics.style.gap = '16px';
      metrics.style.fontSize = '12px';
      metrics.style.color = 'rgba(255,255,255,0.7)';
      metrics.innerHTML = `
        <div>📶 Señal: <span style="color: #4caf50; font-weight: 600;">${sensor.signal}%</span></div>
        <div>🔋 Batería: <span style="color: ${sensor.battery > 50 ? '#4caf50' : '#ff9800'}; font-weight: 600;">${sensor.battery}%</span></div>
      `;
      sensorItem.appendChild(metrics);
    }

    currentSensors.appendChild(sensorItem);
  });

  card.appendChild(currentSensors);

  // Enhanced action buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.flexDirection = 'column';
  buttonsContainer.style.gap = '12px';

  const addSensorBtn = document.createElement('button');
  addSensorBtn.innerHTML = '➕ <span style="margin-left: 8px;">AGREGAR SENSORES</span>';
  addSensorBtn.style.background = 'linear-gradient(135deg, #673ab7, #9c27b0)';
  addSensorBtn.style.border = 'none';
  addSensorBtn.style.color = '#fff';
  addSensorBtn.style.padding = '14px 20px';
  addSensorBtn.style.borderRadius = '12px';
  addSensorBtn.style.cursor = 'pointer';
  addSensorBtn.style.fontWeight = '600';
  addSensorBtn.style.fontSize = '14px';
  addSensorBtn.style.transition = 'all 0.3s ease';
  addSensorBtn.style.boxShadow = '0 4px 15px rgba(103,58,183,0.3)';
  addSensorBtn.addEventListener('mouseenter', () => {
    addSensorBtn.style.transform = 'translateY(-2px)';
    addSensorBtn.style.boxShadow = '0 6px 20px rgba(103,58,183,0.4)';
  });
  addSensorBtn.addEventListener('mouseleave', () => {
    addSensorBtn.style.transform = 'translateY(0)';
    addSensorBtn.style.boxShadow = '0 4px 15px rgba(103,58,183,0.3)';
  });
  addSensorBtn.addEventListener('click', async () => {
    const { promptSensorInfo } = await import('./sensor_dialog.js');
    const data = await promptSensorInfo({ title: 'Agregar Sensor IoT' });
    if (!data) return;
    if (!Array.isArray(entity.sensors)) entity.sensors = [];

    const sensorObj = {
      id: `s-${Date.now()}`,
      name: data.name || `Sensor ${entity.sensors.length + 1}`,
      type: Array.isArray(data.module) ? data.module.join(',') : (data.module || 'generic'),
      icon: '📡',
      status: 'offline',
      battery: 0,
      signal: 0,
      clientId: data.clientId,
      username: data.username,
      password: data.password,
      hostname: data.hostname,
      topic: data.topic,
      module: data.module,
      description: data.description,
      readings: {},
      lastUpdated: null,
      createdAt: Date.now()
    };
    entity.sensors.push(sensorObj);
    const gfContent = document.getElementById('gf-content');
    if (gfContent) gfContent.scrollTop = 0;
    container.innerHTML = '';
    renderIoTSensorsSection(container, entity);

    // Activate after 10s with telemetry
    setTimeout(() => {
      sensorObj.status = 'active';
      sensorObj.battery = 80 + Math.floor(Math.random()*20);
      sensorObj.signal = 60 + Math.floor(Math.random()*40);
      const mods = Array.isArray(sensorObj.module) ? sensorObj.module : [sensorObj.module];
      sensorObj.readings = {};
      mods.forEach((m) => {
        switch(m) {
          case 'temperatura': case 'temperature':
            sensorObj.readings[m] = `${18 + Math.floor(Math.random()*8)}°C`;
            break;
          case 'humedad':
            sensorObj.readings[m] = `${40 + Math.floor(Math.random()*40)}%`;
            break;
          case 'ph':
            sensorObj.readings[m] = `${(6 + Math.random()*1.5).toFixed(2)} pH`;
            break;
          case 'luminosidad':
            sensorObj.readings[m] = `${200 + Math.floor(Math.random()*800)} lx`;
            break;
          case 'conductividad':
            sensorObj.readings[m] = `${(0.5 + Math.random()*2).toFixed(2)} mS/cm`;
            break;
          default:
            sensorObj.readings[m] = 'OK';
        }
      });
      sensorObj.lastUpdated = Date.now();
      container.innerHTML = '';
      renderIoTSensorsSection(container, entity);
    }, 10000);
  });

  const reviewSensorsBtn = document.createElement('button');
  reviewSensorsBtn.innerHTML = '🔍 <span style="margin-left: 8px;">DIAGNÓSTICO AVANZADO</span>';
  reviewSensorsBtn.style.background = 'linear-gradient(135deg, #3f51b5, #5c6bc0)';
  reviewSensorsBtn.style.border = 'none';
  reviewSensorsBtn.style.color = '#fff';
  reviewSensorsBtn.style.padding = '14px 20px';
  reviewSensorsBtn.style.borderRadius = '12px';
  reviewSensorsBtn.style.cursor = 'pointer';
  reviewSensorsBtn.style.fontWeight = '600';
  reviewSensorsBtn.style.fontSize = '14px';
  reviewSensorsBtn.style.transition = 'all 0.3s ease';
  reviewSensorsBtn.style.boxShadow = '0 4px 15px rgba(63,81,181,0.3)';
  reviewSensorsBtn.addEventListener('mouseenter', () => {
    reviewSensorsBtn.style.transform = 'translateY(-2px)';
    reviewSensorsBtn.style.boxShadow = '0 6px 20px rgba(63,81,181,0.4)';
  });
  reviewSensorsBtn.addEventListener('mouseleave', () => {
    reviewSensorsBtn.style.transform = 'translateY(0)';
    reviewSensorsBtn.style.boxShadow = '0 4px 15px rgba(63,81,181,0.3)';
  });
  reviewSensorsBtn.addEventListener('click', () => {
    alert('Panel de diagnóstico avanzado - Próximamente');
  });

  buttonsContainer.appendChild(addSensorBtn);
  buttonsContainer.appendChild(reviewSensorsBtn);
  card.appendChild(buttonsContainer);

  return card;
}

function createSensorDataCard() {
  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(0,188,212,0.2) 0%, rgba(0,172,193,0.15) 100%)';
  card.style.backdropFilter = 'blur(15px)';
  card.style.borderRadius = '20px';
  card.style.padding = '24px';
  card.style.border = '2px solid rgba(0,188,212,0.3)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  // Data stream animation
  const dataOverlay = document.createElement('div');
  dataOverlay.style.position = 'absolute';
  dataOverlay.style.top = '0';
  dataOverlay.style.left = '0';
  dataOverlay.style.right = '0';
  dataOverlay.style.height = '4px';
  dataOverlay.style.background = 'linear-gradient(90deg, #00bcd4, #00acc1, #00bcd4)';
  dataOverlay.style.opacity = '0.8';
  card.appendChild(dataOverlay);

  const cardTitle = document.createElement('h3');
  cardTitle.innerHTML = '📊 <span style="margin-left: 8px;">Telemetría en Tiempo Real</span>';
  cardTitle.style.margin = '0 0 20px 0';
  cardTitle.style.color = '#b2ebf2';
  cardTitle.style.fontSize = '18px';
  cardTitle.style.fontWeight = '700';
  cardTitle.style.display = 'flex';
  cardTitle.style.alignItems = 'center';
  card.appendChild(cardTitle);

  // Live status indicator
  const liveIndicator = document.createElement('div');
  liveIndicator.style.display = 'flex';
  liveIndicator.style.alignItems = 'center';
  liveIndicator.style.gap = '8px';
  liveIndicator.style.marginBottom = '20px';
  liveIndicator.style.padding = '8px 12px';
  liveIndicator.style.background = 'rgba(76,175,80,0.2)';
  liveIndicator.style.borderRadius = '20px';
  liveIndicator.style.border = '1px solid rgba(76,175,80,0.3)';
  liveIndicator.innerHTML = `
    <div style="width: 8px; height: 8px; background: #4caf50; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
    <span style="color: #4caf50; font-weight: 600; font-size: 12px;">EN VIVO - Actualización cada 30s</span>
  `;
  card.appendChild(liveIndicator);

  // Real-time data with enhanced visualization
  const dataItems = [
    { label: 'Temperatura del Suelo', value: '18.5°C', status: 'normal', trend: '+0.3°', unit: '°C', optimal: '15-22°C' },
    { label: 'Humedad del Suelo', value: '42%', status: 'warning', trend: '-8%', unit: '%', optimal: '60-80%' },
    { label: 'pH del Suelo', value: '6.8', status: 'normal', trend: '+0.1', unit: 'pH', optimal: '6.0-7.5' },
    { label: 'Conductividad', value: '1.2', status: 'normal', trend: '0.0', unit: 'mS/cm', optimal: '0.8-1.5' },
    { label: 'Nivel de Nitrógeno', value: 'Medio', status: 'info', trend: 'Estable', unit: '', optimal: 'Medio-Alto' },
    { label: 'Última Actualización', value: 'Hace 12s', status: 'success', trend: '', unit: '', optimal: '< 60s' }
  ];

  dataItems.forEach(item => {
    const dataRow = document.createElement('div');
    dataRow.style.background = 'rgba(255,255,255,0.05)';
    dataRow.style.borderRadius = '12px';
    dataRow.style.padding = '16px';
    dataRow.style.margin = '10px 0';
    dataRow.style.border = '1px solid rgba(255,255,255,0.1)';
    dataRow.style.transition = 'all 0.3s ease';
    dataRow.style.cursor = 'pointer';
    
    dataRow.addEventListener('mouseenter', () => {
      dataRow.style.background = 'rgba(255,255,255,0.1)';
      dataRow.style.transform = 'translateX(4px)';
    });
    dataRow.addEventListener('mouseleave', () => {
      dataRow.style.background = 'rgba(255,255,255,0.05)';
      dataRow.style.transform = 'translateX(0)';
    });

    const rowHeader = document.createElement('div');
    rowHeader.style.display = 'flex';
    rowHeader.style.justifyContent = 'space-between';
    rowHeader.style.alignItems = 'center';
    rowHeader.style.marginBottom = '8px';

    const label = document.createElement('span');
    label.textContent = item.label;
    label.style.color = 'rgba(255,255,255,0.9)';
    label.style.fontSize = '14px';
    label.style.fontWeight = '500';

    const valueContainer = document.createElement('div');
    valueContainer.style.display = 'flex';
    valueContainer.style.alignItems = 'center';
    valueContainer.style.gap = '8px';

    const value = document.createElement('span');
    value.textContent = item.value;
    value.style.color = '#fff';
    value.style.fontWeight = '700';
    value.style.fontSize = '16px';

    const statusIndicator = document.createElement('span');
    statusIndicator.style.fontSize = '16px';
    switch(item.status) {
      case 'normal':
        statusIndicator.textContent = '🟢';
        break;
      case 'warning':
        statusIndicator.textContent = '🟡';
        break;
      case 'info':
        statusIndicator.textContent = '🔵';
        break;
      case 'success':
        statusIndicator.textContent = '✅';
        break;
    }

    valueContainer.appendChild(value);
    valueContainer.appendChild(statusIndicator);
    rowHeader.appendChild(label);
    rowHeader.appendChild(valueContainer);
    dataRow.appendChild(rowHeader);

    // Additional info row
    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.justifyContent = 'space-between';
    infoRow.style.fontSize = '12px';
    infoRow.style.color = 'rgba(255,255,255,0.6)';

    const optimal = document.createElement('span');
    optimal.textContent = `Óptimo: ${item.optimal}`;

    const trend = document.createElement('span');
    if (item.trend) {
      trend.textContent = `Tendencia: ${item.trend}`;
      if (item.trend.includes('+')) {
        trend.style.color = '#4caf50';
      } else if (item.trend.includes('-')) {
        trend.style.color = '#ff5722';
      }
    }

    infoRow.appendChild(optimal);
    infoRow.appendChild(trend);
    dataRow.appendChild(infoRow);
    card.appendChild(dataRow);
  });

  // Quick actions for sensor data
  const actionsContainer = document.createElement('div');
  actionsContainer.style.marginTop = '20px';
  actionsContainer.style.display = 'flex';
  actionsContainer.style.gap = '10px';

  const exportBtn = document.createElement('button');
  exportBtn.innerHTML = '📊 Exportar Datos';
  exportBtn.style.background = 'rgba(255,255,255,0.1)';
  exportBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  exportBtn.style.color = '#fff';
  exportBtn.style.padding = '8px 12px';
  exportBtn.style.borderRadius = '8px';
  exportBtn.style.cursor = 'pointer';
  exportBtn.style.fontSize = '12px';
  exportBtn.style.transition = 'all 0.2s ease';
  exportBtn.addEventListener('mouseenter', () => {
    exportBtn.style.background = 'rgba(255,255,255,0.2)';
  });
  exportBtn.addEventListener('mouseleave', () => {
    exportBtn.style.background = 'rgba(255,255,255,0.1)';
  });

  const alertBtn = document.createElement('button');
  alertBtn.innerHTML = '🔔 Configurar Alertas';
  alertBtn.style.background = 'rgba(255,255,255,0.1)';
  alertBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  alertBtn.style.color = '#fff';
  alertBtn.style.padding = '8px 12px';
  alertBtn.style.borderRadius = '8px';
  alertBtn.style.cursor = 'pointer';
  alertBtn.style.fontSize = '12px';
  alertBtn.style.transition = 'all 0.2s ease';
  alertBtn.addEventListener('mouseenter', () => {
    alertBtn.style.background = 'rgba(255,255,255,0.2)';
  });
  alertBtn.addEventListener('mouseleave', () => {
    alertBtn.style.background = 'rgba(255,255,255,0.1)';
  });

  actionsContainer.appendChild(exportBtn);
  actionsContainer.appendChild(alertBtn);
  card.appendChild(actionsContainer);

  return card;
}

async function renderAIRecommendationsSection(container, entity) {
  container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(0,0,0,0.5);">⏳ Generando recomendaciones inteligentes...</div>';
  
  // Obtener todos los datos necesarios
  const satelliteData = generateSatelliteData(entity, 14);
  let weatherData = null;
  
  try {
    const cultivoId = entity.cultivoId || entity.cultivo_id || entity.id;
    const userId = localStorage.getItem('agroverse_user_id') || '1';
    const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://localhost:5001/api'
      : '/api';
    
    const response = await fetch(`${API_URL}/weather_data?cultivo_id=${cultivoId}&user_id=${userId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        weatherData = result.data[0].data;
      }
    }
  } catch (error) {
    console.log('[AI RECS] Using simulated data');
  }
  
  const gdd = calculateGDD(entity, weatherData);
  const phenology = getPhenologyStage(entity, gdd);
  const alerts = generateAlerts(entity, satelliteData, weatherData);
  
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gf-grid';
  
  // ============ MOTOR DE RECOMENDACIONES INTELIGENTE ============
  const recommendations = [];
  
  // REGLA 1: Riego basado en balance hídrico
  if (weatherData && weatherData.daily_forecast) {
    const totalRain7d = weatherData.daily_forecast.slice(0, 7).reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    const avgSoilMoisture = weatherData.hourly_forecast ? 
      weatherData.hourly_forecast.slice(-24).reduce((sum, h) => sum + (h.soil_moisture_0_to_1cm || 25), 0) / 24 : 25;
    
    if (avgSoilMoisture < 15) {
      recommendations.push({
        priority: 'critical',
        category: '💧 Riego',
        title: 'Riego Profundo Urgente',
        description: `Humedad del suelo crítica (${avgSoilMoisture.toFixed(1)}%). Aplicar riego inmediato.`,
        action: `Regar con ${30 - avgSoilMoisture.toFixed(0)} mm (3-4 horas de riego) en las próximas 12 horas`,
        timing: 'Inmediato (< 12 horas)'
      });
    } else if (avgSoilMoisture < 20 && totalRain7d < 10) {
      recommendations.push({
        priority: 'important',
        category: '💧 Riego',
        title: 'Programar Riego',
        description: `Humedad del suelo baja (${avgSoilMoisture.toFixed(1)}%) y sin lluvia prevista.`,
        action: `Aplicar 15-20 mm de riego en los próximos 2-3 días`,
        timing: '24-48 horas'
      });
    }
  }
  
  // REGLA 2: Fertilización según etapa fenológica
  if (phenology.key === 'vegetative') {
    recommendations.push({
      priority: 'important',
      category: '🧬 Nutrición',
      title: 'Fertilización Vegetativa',
      description: 'Etapa de crecimiento vegetativo. Alto requerimiento de Nitrógeno.',
      action: 'Aplicar fertilizante NPK 20-10-10 a dosis de 150 kg/ha. Fraccionar en 2 aplicaciones',
      timing: 'Esta semana y en 10 días'
    });
  } else if (phenology.key === 'flowering' || phenology.key === 'fruiting') {
    recommendations.push({
      priority: 'important',
      category: '🧬 Nutrición',
      title: 'Fertilización Reproductiva',
      description: 'Etapa de floración/fructificación. Mayor demanda de Fósforo y Potasio.',
      action: 'Aplicar fertilizante NPK 10-20-20 a dosis de 120 kg/ha + micronutrientes (B, Zn)',
      timing: 'En los próximos 7 días'
    });
  }
  
  // REGLA 3: Predicción de enfermedades
  if (weatherData && weatherData.current_conditions) {
    const humidity = weatherData.current_conditions.relative_humidity_2m || 50;
    const temp = weatherData.current_conditions.temperature_2m || 20;
    const recentRain = weatherData.daily_forecast ? 
      weatherData.daily_forecast.slice(0, 3).reduce((sum, d) => sum + (d.rain_sum || 0), 0) : 0;
    
    // Mildiu: Humedad > 85% + Temp 15-25°C + 3 días consecutivos
    if (humidity > 85 && temp >= 15 && temp <= 25 && recentRain > 15) {
      recommendations.push({
        priority: 'critical',
        category: '🦠 Sanidad',
        title: 'Alto Riesgo de Mildiu',
        description: `Condiciones ideales: Humedad ${humidity}%, Temp ${temp.toFixed(1)}°C, lluvia reciente.`,
        action: 'Aplicar fungicida preventivo (Mancozeb 2 kg/ha o Metalaxil 1.5 L/ha). Monitorear síntomas en hojas',
        timing: 'Urgente - próximas 24 horas'
      });
    }
    
    // Oídio: Humedad 70-80% + Temp 20-30°C
    else if (humidity >= 70 && humidity <= 85 && temp >= 20 && temp <= 30) {
      recommendations.push({
        priority: 'important',
        category: '🦠 Sanidad',
        title: 'Riesgo Moderado de Oídio',
        description: 'Condiciones favorables para desarrollo de oídio.',
        action: 'Monitorear presencia de polvo blanco en hojas. Considerar azufre mojable (3 kg/ha) preventivo',
        timing: 'Próximos 3-5 días'
      });
    }
    
    // Pulgones: Temp 20-25°C + Ausencia de lluvia
    if (temp >= 20 && temp <= 25 && recentRain < 5) {
      recommendations.push({
        priority: 'suggestion',
        category: '🐛 Plagas',
        title: 'Monitoreo de Pulgones',
        description: 'Temperatura óptima para reproducción de áfidos.',
        action: 'Instalar trampas cromáticas amarillas. Revisar envés de hojas. Si hay presencia, aplicar jabón potásico o imidacloprid',
        timing: 'Monitoreo diario por 5 días'
      });
    }
  }
  
  // REGLA 4: Optimización de riego según pronóstico
  if (weatherData && weatherData.daily_forecast) {
    const next3Days = weatherData.daily_forecast.slice(0, 3);
    const rainForecast = next3Days.reduce((sum, d) => sum + (d.rain_sum || 0), 0);
    
    if (rainForecast > 20) {
      recommendations.push({
        priority: 'suggestion',
        category: '💧 Riego',
        title: 'Posponer Riego',
        description: `Lluvia prevista en próximos 3 días: ${rainForecast.toFixed(1)} mm.`,
        action: 'Cancelar riego programado. Esperar hasta después de las lluvias para evaluar necesidad',
        timing: 'Acción: NO regar'
      });
    }
  }
  
  // REGLA 5: Aplicaciones foliares
  if (weatherData && weatherData.daily_forecast) {
    const next24h = weatherData.daily_forecast.slice(0, 1)[0];
    const rainNext24h = next24h?.rain_sum || 0;
    const windSpeed = weatherData.current_conditions?.wind_speed_10m || 5;
    
    if (rainNext24h < 1 && windSpeed < 15) {
      recommendations.push({
        priority: 'suggestion',
        category: '🌿 Manejo',
        title: 'Ventana para Aplicaciones Foliares',
        description: 'Condiciones ideales: Sin lluvia próxima y viento moderado.',
        action: 'Aprovechar para aplicar productos foliares (fertilizantes, bioestimulantes, pesticidas). Aplicar temprano en la mañana o al atardecer',
        timing: 'Próximas 24 horas'
      });
    }
  }
  
  // REGLA 6: Poda/Raleo según etapa
  if (phenology.key === 'fruiting' && gdd > 600) {
    recommendations.push({
      priority: 'suggestion',
      category: '✂️ Manejo',
      title: 'Raleo de Frutos',
      description: 'Etapa de fructificación avanzada. Raleo mejora tamaño y calidad.',
      action: 'Realizar raleo manual de frutos pequeños o deformados. Dejar 1-2 frutos por racimo',
      timing: 'Esta semana'
    });
  }
  
  // REGLA 7: Análisis de suelo periódico
  const daysSincePlanting = entity.plantedAt ? 
    Math.floor((Date.now() - new Date(entity.plantedAt)) / 86400000) : 45;
  
  if (daysSincePlanting > 30 && daysSincePlanting % 45 < 7) {
    recommendations.push({
      priority: 'suggestion',
      category: '🧪 Análisis',
      title: 'Análisis de Suelo',
      description: 'Análisis periódico para ajustar fertilización.',
      action: 'Tomar muestra de suelo (15-20 puntos, 0-30 cm) y enviar a laboratorio. Solicitar análisis completo (NPK, MO, pH, micronutrientes)',
      timing: 'En los próximos 10 días'
    });
  }
  
  // REGLA 8: Estrés por NDVI bajo
  const avgNDVI = satelliteData.slice(-7).reduce((sum, d) => sum + d.ndvi, 0) / 7;
  if (avgNDVI < 0.45) {
    recommendations.push({
      priority: 'important',
      category: '📉 Diagnóstico',
      title: 'Investigar Causa de Estrés',
      description: `NDVI bajo (${avgNDVI.toFixed(2)}). Posible estrés nutricional, hídrico o sanitario.`,
      action: 'Inspección de campo: revisar color de hojas, presencia de plagas/enfermedades, humedad de suelo. Considerar análisis foliar',
      timing: 'Urgente - próximos 2 días'
    });
  }
  
  // Ordenar por prioridad
  const priorityOrder = { critical: 0, important: 1, suggestion: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  // ============ TARJETA 1: RECOMENDACIONES PRIORIZADAS ============
  const recsCard = document.createElement('div');
  recsCard.className = 'gf-card';
  recsCard.style.gridColumn = '1 / -1';
  recsCard.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div style="font-weight:800; color:#1b5e20; font-size:18px;">🤖 Recomendaciones Inteligentes</div>
      <div style="font-size:12px; color:rgba(0,0,0,0.5);">${recommendations.length} recomendaciones generadas</div>
    </div>
    <div style="margin-bottom:16px; padding:12px; background:rgba(33,150,243,0.08); border-radius:8px; border:1px solid rgba(33,150,243,0.2);">
      <div style="font-size:12px; color:rgba(0,0,0,0.7);">
        💡 <strong>Motor de IA Agronómico:</strong> Análisis basado en datos satelitales (NDVI, NDMI, LST), 
        condiciones meteorológicas, etapa fenológica, balance hídrico y modelos predictivos de plagas/enfermedades.
      </div>
    </div>
  `;
  
  const recsContainer = document.createElement('div');
  recsContainer.style.display = 'flex';
  recsContainer.style.flexDirection = 'column';
  recsContainer.style.gap = '12px';
  
  recommendations.forEach((rec, idx) => {
    const recCard = document.createElement('div');
    recCard.className = 'gf-card';
    
    let borderColor = '#4caf50';
    let bgColor = 'rgba(76,175,80,0.08)';
    let badge = '💡 Sugerencia';
    let badgeColor = '#4caf50';
    
    if (rec.priority === 'critical') {
      borderColor = '#f44336';
      bgColor = 'rgba(244,67,54,0.08)';
      badge = '🔴 Crítico';
      badgeColor = '#f44336';
    } else if (rec.priority === 'important') {
      borderColor = '#ff9800';
      bgColor = 'rgba(255,152,0,0.08)';
      badge = '🟡 Importante';
      badgeColor = '#ff9800';
    }
    
    recCard.style.borderLeft = `4px solid ${borderColor}`;
    recCard.style.background = bgColor;
    
    recCard.innerHTML = `
      <div style="display:flex; align-items:start; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:12px; font-weight:700; color:rgba(0,0,0,0.5); background:rgba(0,0,0,0.05); padding:4px 10px; border-radius:999px;">
            ${rec.category}
          </div>
          <div style="font-size:11px; font-weight:700; color:${badgeColor}; background:rgba(255,255,255,0.7); padding:4px 10px; border-radius:999px;">
            ${badge}
          </div>
        </div>
        <div style="font-size:10px; color:rgba(0,0,0,0.5); background:rgba(255,255,255,0.6); padding:4px 8px; border-radius:999px;">
          ⏰ ${rec.timing}
        </div>
      </div>
      
      <div style="font-weight:700; color:#1b5e20; font-size:15px; margin-bottom:8px;">
        ${rec.title}
      </div>
      
      <div style="font-size:13px; color:rgba(0,0,0,0.7); margin-bottom:10px; line-height:1.5;">
        ${rec.description}
      </div>
      
      <div style="background:rgba(255,255,255,0.7); padding:12px; border-radius:8px; border:1px solid rgba(0,0,0,0.08);">
        <div style="font-size:11px; font-weight:700; color:rgba(0,0,0,0.6); margin-bottom:6px;">✅ ACCIÓN RECOMENDADA:</div>
        <div style="font-size:13px; color:rgba(0,0,0,0.8); line-height:1.4;">
          ${rec.action}
        </div>
      </div>
    `;
    
    recsContainer.appendChild(recCard);
  });
  
  recsCard.appendChild(recsContainer);
  
  // ============ TARJETA 2: PREDICCIÓN DE PLAGAS Y ENFERMEDADES ============
  const pestCard = document.createElement('div');
  pestCard.className = 'gf-card';
  pestCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      🦠 Predicción de Plagas y Enfermedades
    </div>
  `;
  
  const pestGrid = document.createElement('div');
  pestGrid.style.display = 'grid';
  pestGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  pestGrid.style.gap = '12px';
  
  // Calcular probabilidades
  const temp = weatherData?.current_conditions?.temperature_2m || 22;
  const humidity = weatherData?.current_conditions?.relative_humidity_2m || 60;
  const recentRain = weatherData?.daily_forecast ? 
    weatherData.daily_forecast.slice(0, 3).reduce((sum, d) => sum + (d.rain_sum || 0), 0) : 0;
  
  const diseases = [
    {
      name: 'Mildiu (Phytophthora)',
      icon: '🍄',
      probability: (humidity > 85 && temp >= 15 && temp <= 25 && recentRain > 15) ? 'Alta' : 
                   (humidity > 75 && temp >= 18 && temp <= 28) ? 'Media' : 'Baja',
      conditions: `Humedad: ${humidity}%, Temp: ${temp.toFixed(1)}°C, Lluvia: ${recentRain.toFixed(1)}mm`,
      treatment: 'Preventivo: Mancozeb 2 kg/ha. Curativo: Metalaxil + Mancozeb'
    },
    {
      name: 'Oídio (Oidium)',
      icon: '☁️',
      probability: (humidity >= 70 && humidity <= 85 && temp >= 20 && temp <= 30) ? 'Media' : 'Baja',
      conditions: `Temp óptima: 20-30°C, Humedad: 70-85%`,
      treatment: 'Azufre mojable 3 kg/ha o Trifloxystrobin 0.5 L/ha'
    },
    {
      name: 'Pulgones (Aphidoidea)',
      icon: '🐛',
      probability: (temp >= 20 && temp <= 25 && recentRain < 5) ? 'Media' : 'Baja',
      conditions: `Favorece: Temp 20-25°C, ausencia de lluvias`,
      treatment: 'Jabón potásico 2% o Imidacloprid 0.3 L/ha'
    },
    {
      name: 'Mosca Blanca (Bemisia)',
      icon: '🦟',
      probability: (temp > 25 && humidity < 60) ? 'Media' : 'Baja',
      conditions: `Favorece: Temp >25°C, baja humedad`,
      treatment: 'Aceite mineral 1% + Thiametoxam 0.25 L/ha'
    }
  ];
  
  diseases.forEach(disease => {
    const card = document.createElement('div');
    card.style.background = 'rgba(255,255,255,0.5)';
    card.style.padding = '14px';
    card.style.borderRadius = '12px';
    card.style.border = '1px solid rgba(0,0,0,0.08)';
    
    const probColor = disease.probability === 'Alta' ? '#f44336' : 
                      disease.probability === 'Media' ? '#ff9800' : '#4caf50';
    
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:24px;">${disease.icon}</span>
          <span style="font-weight:700; color:#1b5e20; font-size:14px;">${disease.name}</span>
        </div>
        <div class="gf-chip" style="background:${probColor}22; color:${probColor}; border:1px solid ${probColor}33;">
          ${disease.probability}
        </div>
      </div>
      <div style="font-size:11px; color:rgba(0,0,0,0.6); margin-bottom:8px;">
        ${disease.conditions}
      </div>
      <div style="font-size:11px; background:rgba(33,150,243,0.08); padding:8px; border-radius:6px; border:1px solid rgba(33,150,243,0.15);">
        <strong style="color:#1565c0;">Tratamiento:</strong> ${disease.treatment}
      </div>
    `;
    
    pestGrid.appendChild(card);
  });
  
  pestCard.appendChild(pestGrid);
  
  // ============ TARJETA 3: OPTIMIZADOR DE RIEGO ============
  const irrigationCard = document.createElement('div');
  irrigationCard.className = 'gf-card';
  irrigationCard.innerHTML = `
    <div style="font-weight:800; color:#1b5e20; font-size:16px; margin-bottom:16px;">
      💧 Optimizador de Riego Inteligente
    </div>
  `;
  
  // Calcular necesidad de riego
  let Kc = 0.7;
  if (phenology.key === 'germination' || phenology.key === 'seedling') Kc = 0.4;
  else if (phenology.key === 'vegetative') Kc = 0.7;
  else if (phenology.key === 'flowering' || phenology.key === 'fruiting') Kc = 1.15;
  else if (phenology.key === 'maturation') Kc = 0.8;
  
  const ETo = 4.5; // mm/día
  const ETc = ETo * Kc;
  const soilMoisture = weatherData?.hourly_forecast ? 
    weatherData.hourly_forecast.slice(-24).reduce((sum, h) => sum + (h.soil_moisture_0_to_1cm || 25), 0) / 24 : 25;
  
  const rainNext7d = weatherData?.daily_forecast ? 
    weatherData.daily_forecast.slice(0, 7).reduce((sum, d) => sum + (d.rain_sum || 0), 0) : 15;
  
  const waterNeeded = Math.max(0, (ETc * 7) - rainNext7d);
  
  const irrGrid = document.createElement('div');
  irrGrid.style.display = 'grid';
  irrGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  irrGrid.style.gap = '12px';
  
  irrGrid.innerHTML = `
    <div style="background:rgba(255,152,0,0.08); padding:14px; border-radius:10px; border:1px solid rgba(255,152,0,0.2);">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">ETc (Evapotranspiración)</div>
      <div style="font-size:28px; font-weight:800; color:#ff9800;">${ETc.toFixed(1)}</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5);">mm/día (Kc: ${Kc})</div>
    </div>
    
    <div style="background:rgba(33,150,243,0.08); padding:14px; border-radius:10px; border:1px solid rgba(33,150,243,0.2);">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">Lluvia Próximos 7d</div>
      <div style="font-size:28px; font-weight:800; color:#2196f3;">${rainNext7d.toFixed(1)}</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5);">mm acumulados</div>
    </div>
    
    <div style="background:${waterNeeded > 20 ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)'}; padding:14px; border-radius:10px; border:1px solid ${waterNeeded > 20 ? 'rgba(244,67,54,0.2)' : 'rgba(76,175,80,0.2)'};">
      <div style="font-size:11px; color:rgba(0,0,0,0.6);">Riego Necesario</div>
      <div style="font-size:28px; font-weight:800; color:${waterNeeded > 20 ? '#f44336' : '#4caf50'};">${waterNeeded.toFixed(1)}</div>
      <div style="font-size:11px; color:rgba(0,0,0,0.5);">mm en 7 días</div>
    </div>
  `;
  
  irrigationCard.appendChild(irrGrid);
  
  // Recomendación de riego
  const irrRec = document.createElement('div');
  irrRec.style.marginTop = '12px';
  irrRec.style.padding = '12px';
  irrRec.style.background = 'rgba(255,255,255,0.6)';
  irrRec.style.borderRadius = '8px';
  irrRec.style.border = '1px solid rgba(0,0,0,0.08)';
  irrRec.style.fontSize = '13px';
  
  if (waterNeeded > 25) {
    irrRec.innerHTML = `
      <div style="font-weight:700; color:#f44336; margin-bottom:6px;">🚨 Déficit Hídrico Significativo</div>
      <div style="color:rgba(0,0,0,0.7);">
        <strong>Recomendación:</strong> Aplicar ${waterNeeded.toFixed(0)} mm divididos en ${Math.ceil(waterNeeded / 15)} riegos. 
        Regar cada ${Math.floor(7 / Math.ceil(waterNeeded / 15))} días. 
        Priorizar riego temprano (6-8 AM) o tarde (6-8 PM) para reducir evaporación.
      </div>
    `;
  } else if (waterNeeded > 10) {
    irrRec.innerHTML = `
      <div style="font-weight:700; color:#ff9800; margin-bottom:6px;">⚠️ Riego Moderado Necesario</div>
      <div style="color:rgba(0,0,0,0.7);">
        <strong>Recomendación:</strong> Aplicar ${waterNeeded.toFixed(0)} mm en 1-2 riegos ligeros durante la semana.
        Método recomendado: goteo o aspersión baja intensidad.
      </div>
    `;
  } else {
    irrRec.innerHTML = `
      <div style="font-weight:700; color:#4caf50; margin-bottom:6px;">✅ Humedad Adecuada</div>
      <div style="color:rgba(0,0,0,0.7);">
        Las precipitaciones previstas cubrirán la demanda hídrica. 
        <strong>No se requiere riego suplementario</strong> esta semana. Monitorear humedad del suelo.
      </div>
    `;
  }
  
  irrigationCard.appendChild(irrRec);
  
  // Añadir todas las tarjetas
  grid.appendChild(recsCard);
  grid.appendChild(pestCard);
  grid.appendChild(irrigationCard);
  
  container.appendChild(grid);
}

