// Animal info panel and dashboard for inspection tool

export function showAnimalInfoPanel(entity) {
  // Remove existing panel if present
  const existing = document.getElementById('animal-info-panel');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'animal-info-panel';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const panel = document.createElement('div');
  panel.style.background = '#1e3a2a';
  panel.style.color = '#fff';
  panel.style.border = '4px solid #2f6b3f';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  panel.style.padding = '20px 24px';
  panel.style.width = 'min(90vw, 520px)';
  panel.style.maxHeight = '80vh';
  panel.style.overflow = 'auto';
  panel.style.fontFamily = 'Arial, sans-serif';

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Información del Corral de Animales';
  title.style.margin = '0 0 16px 0';
  title.style.fontSize = '18px';
  title.style.fontWeight = '700';
  title.style.color = '#a5d6a7';
  panel.appendChild(title);

  // Info grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = '1fr 2fr';
  grid.style.gap = '8px 12px';
  grid.style.marginBottom = '20px';

  const geo = entity.geo || {};
  const addr = geo.address || {};
  const form = entity.form || {};
  const fields = [
    ['Tipo:', entity.type || 'N/A'],
    ['Animal:', entity.animal || entity.elementId || 'N/A'],
    ['Tamaño (celdas):', `${entity.w || 0}×${entity.h || 0}`],
    form.count && ['Cantidad declarada:', String(form.count)],
    form.usage && ['Uso:', form.usage],
    form.breed && ['Raza/Especie:', form.breed],
    form.feeding && ['Alimentación:', form.feeding],
    geo.lat && ['Coordenadas:', `${Number(geo.lat).toFixed(6)}, ${Number(geo.lon).toFixed(6)}`],
    (addr.city || addr.town) && ['Ciudad:', addr.city || addr.town],
    (addr.state || addr.region) && ['Región:', addr.state || addr.region],
  ].filter(Boolean);

  fields.forEach(([label, value]) => {
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.fontWeight = '600';
    labelEl.style.color = '#c8e6c9';

    const valueEl = document.createElement('div');
    valueEl.style.color = '#fff';
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
  dashboardBtn.textContent = 'Dashboard de animales';
  dashboardBtn.style.background = '#43a047';
  dashboardBtn.style.border = 'none';
  dashboardBtn.style.color = '#fff';
  dashboardBtn.style.padding = '10px 16px';
  dashboardBtn.style.borderRadius = '6px';
  dashboardBtn.style.cursor = 'pointer';
  dashboardBtn.style.fontWeight = '600';
  dashboardBtn.addEventListener('click', () => {
    overlay.remove();
    openAnimalDashboard(entity);
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

export function openAnimalDashboard(entity) {
  // Hide the game scenario
  const mapElement = document.getElementById('map');
  const toolbarElement = document.getElementById('toolbar');
  if (mapElement) mapElement.style.display = 'none';
  if (toolbarElement) toolbarElement.style.display = 'none';

  injectAnimalDashboardStyles();

  const dashboard = document.createElement('div');
  dashboard.id = 'animal-dashboard';
  dashboard.style.position = 'fixed';
  dashboard.style.inset = '0';
  dashboard.style.background = 'linear-gradient(135deg, #fff9f9 0%, #f7fff7 50%, #f4fbff 100%)';
  dashboard.style.zIndex = '10000';
  dashboard.style.overflow = 'hidden';
  dashboard.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  dashboard.style.display = 'flex';
  dashboard.style.flexDirection = 'column';

  // Header
  const header = document.createElement('div');
  header.style.background = 'rgba(255,255,255,0.9)';
  header.style.backdropFilter = 'blur(10px)';
  header.style.borderBottom = '1px solid rgba(67,160,71,0.15)';
  header.style.color = '#1b5e20';
  header.style.padding = '16px 24px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.boxShadow = '0 6px 24px rgba(31, 38, 135, 0.15)';

  const headerLeft = document.createElement('div');
  headerLeft.style.display = 'flex';
  headerLeft.style.alignItems = 'center';
  headerLeft.style.gap = '12px';

  const icon = document.createElement('div');
  icon.textContent = '🐮';
  icon.style.fontSize = '28px';
  icon.style.background = 'linear-gradient(135deg, #43a047, #66bb6a)';
  icon.style.borderRadius = '10px';
  icon.style.padding = '6px';
  icon.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.35)';

  const headerTitle = document.createElement('div');
  const titleMain = document.createElement('h1');
  titleMain.textContent = 'Bienestar Animal';
  titleMain.style.margin = '0';
  titleMain.style.fontSize = '22px';
  titleMain.style.fontWeight = '800';
  titleMain.style.color = '#1b5e20';

  const titleSub = document.createElement('div');
  titleSub.textContent = `${entity.animal || 'Animales'} · Salud y Clima`;
  titleSub.style.fontSize = '12px';
  titleSub.style.color = 'rgba(0,0,0,0.5)';
  titleSub.style.marginTop = '2px';

  headerTitle.appendChild(titleMain);
  headerTitle.appendChild(titleSub);
  headerLeft.appendChild(icon);
  headerLeft.appendChild(headerTitle);

  const backBtn = document.createElement('button');
  backBtn.className = 'ad-btn-primary';
  backBtn.innerHTML = '← <span style="margin-left: 8px;">Volver</span>';
  backBtn.addEventListener('click', () => {
    dashboard.remove();
    if (mapElement) mapElement.style.display = '';
    if (toolbarElement) toolbarElement.style.display = '';
  });

  header.appendChild(headerLeft);
  header.appendChild(backBtn);
  dashboard.appendChild(header);

  // Tabs for animal-focused metrics
  const tabs = document.createElement('div');
  tabs.className = 'ad-tabs';
  const tabDefs = [
    { key: 'overview', label: 'Resumen', icon: '📋' },
    { key: 'env', label: 'Temperatura', icon: '🌡️' },
    { key: 'alerts', label: 'Alertas', icon: '⚠️' },
    { key: 'frost', label: 'Heladas', icon: '❄️' },
  ];
  let activeKey = 'overview';

  tabDefs.forEach(def => {
    const t = document.createElement('button');
    t.className = 'ad-tab';
    t.innerHTML = `<span class="ad-tab-icon">${def.icon}</span><span>${def.label}</span>`;
    t.setAttribute('data-key', def.key);
    if (def.key === activeKey) t.classList.add('active');
    t.addEventListener('click', () => {
      if (activeKey === def.key) return;
      document.querySelectorAll('.ad-tab').forEach(el => el.classList.remove('active'));
      t.classList.add('active');
      activeKey = def.key;
      renderActiveTab();
    });
    tabs.appendChild(t);
  });
  dashboard.appendChild(tabs);

  const content = document.createElement('div');
  content.id = 'ad-content';
  content.className = 'fade-in';
  dashboard.appendChild(content);

  function renderActiveTab() {
    content.innerHTML = '';
    content.classList.remove('fade-in');
    void content.offsetWidth; // reflow to restart animation
    content.classList.add('fade-in');

    switch (activeKey) {
      case 'overview':
        renderOverview(content, entity);
        break;
      case 'env':
        renderEnvironment(content, entity);
        break;
      case 'alerts':
        renderAlerts(content, entity);
        break;
      case 'frost':
        renderFrost(content, entity);
        break;
    }
  }

  document.body.appendChild(dashboard);
  renderActiveTab();
}

function injectAnimalDashboardStyles() {
  if (document.getElementById('ad-dashboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'ad-dashboard-styles';
  style.textContent = `
    .ad-tabs { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }
    .ad-tab { appearance: none; border: 0; background: rgba(0,0,0,0.04); color: #1b5e20; padding: 10px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .2s ease; }
    .ad-tab:hover { background: rgba(67,160,71,0.12); transform: translateY(-1px); }
    .ad-tab.active { background: linear-gradient(135deg,#2e7d32,#26a69a); color: #fff; box-shadow: 0 6px 14px rgba(46,125,50,.25); }
    .ad-tab-icon { font-size: 18px; }
    #ad-content { padding: 20px 24px 28px; overflow: auto; flex: 1; min-height: 0; }
    .fade-in { animation: adfade .25s ease; }
    @keyframes adfade { from { opacity: .3; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
    .ad-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 16px; }
    .ad-card { background: rgba(255,255,255,0.65); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,.06); transition: transform .2s ease, box-shadow .2s ease; }
    .ad-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(0,0,0,.08); }
    .ad-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .ad-chip.ok { background: rgba(67,160,71,.12); color: #1b5e20; }
    .ad-chip.warn { background: rgba(255,193,7,.14); color: #e65100; }
    .ad-chip.danger { background: rgba(244,67,54,.14); color: #b71c1c; }
  `;
  document.head.appendChild(style);
}

function renderOverview(root, entity) {
  const grid = document.createElement('div');
  grid.className = 'ad-grid';

  const herd = document.createElement('div');
  herd.className = 'ad-card';
  herd.innerHTML = `
    <h3 style="margin:0 0 8px 0; color:#1b5e20;">Rebaño</h3>
    <div style="display:flex; gap:12px; align-items:center;">
      <div class="ad-chip ok">🐾 Salud general: <strong>Buena</strong></div>
      <div class="ad-chip warn">📌 Vacunas: <strong>Próximas</strong></div>
    </div>
    <div style="margin-top:10px; color:rgba(0,0,0,.7); font-size:13px;">
      Especie: <strong>${entity.animal || 'Animal'}</strong> · Declarado: <strong>${(entity.form?.count) ?? 'N/D'}</strong>
    </div>
  `;

  const env = document.createElement('div');
  env.className = 'ad-card';
  env.innerHTML = `
    <h3 style="margin:0 0 8px 0; color:#1b5e20;">Ambiente</h3>
    <div style="display:flex; gap:16px;">
      <div>🌡️ Temp actual: <strong>24°C</strong></div>
      <div>💧 Humedad: <strong>68%</strong></div>
      <div>💨 Viento: <strong>12 km/h</strong></div>
    </div>
  `;

  const frost = document.createElement('div');
  frost.className = 'ad-card';
  frost.innerHTML = `
    <h3 style="margin:0 0 8px 0; color:#1b5e20;">Riesgo de Heladas</h3>
    <div>
      ❄️ Próximas 72h: <strong>Bajo</strong><br/>
      ⚠️ Umbral de alerta: <strong>2°C</strong>
    </div>
  `;

  grid.appendChild(herd);
  grid.appendChild(env);
  grid.appendChild(frost);
  root.appendChild(grid);
}

function renderEnvironment(root, entity) {
  const card = document.createElement('div');
  card.className = 'ad-card';
  card.innerHTML = `
    <h3 style="margin:0 0 8px 0; color:#1b5e20;">Temperatura y Confort</h3>
    <p style="color:rgba(0,0,0,.7);">Rango recomendado para ${entity.animal || 'animales'}: <strong>10–26°C</strong>.</p>
    <ul style="margin:0 0 0 18px; color:rgba(0,0,0,.8);">
      <li>Evitar golpes de calor por encima de 30°C.</li>
      <li>Proveer sombra y agua fresca continuamente.</li>
      <li>Refugio adecuado ante lluvias y vientos.</li>
    </ul>
  `;
  root.appendChild(card);
}

function renderAlerts(root, entity) {
  const card = document.createElement('div');
  card.className = 'ad-card';

  const alerts = [
    { icon: '🥵', text: 'Ola de calor posible en 48h. Ajustar hidratación.' , level: 'warn' },
    { icon: '🦠', text: 'Brotes de enfermedades regionales. Revisar vacunación.' , level: 'warn' },
    { icon: '🌩️', text: 'Tormentas con vientos fuertes esta noche. Asegurar corrales.' , level: 'danger' },
  ];

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '8px';

  alerts.forEach(a => {
    const row = document.createElement('div');
    row.className = `ad-chip ${a.level}`;
    row.textContent = `${a.icon} ${a.text}`;
    list.appendChild(row);
  });

  card.innerHTML = `<h3 style="margin:0 0 8px 0; color:#1b5e20;">Alertas</h3>`;
  card.appendChild(list);
  root.appendChild(card);
}

function renderFrost(root, entity) {
  const card = document.createElement('div');
  card.className = 'ad-card';
  card.innerHTML = `
    <h3 style="margin:0 0 8px 0; color:#1b5e20;">Próximas Heladas</h3>
    <p style="color:rgba(0,0,0,.75);">No se detectan heladas en los próximos 7 días para esta ubicación.</p>
    <p style="color:rgba(0,0,0,.7);">Consejo: monitoree temperaturas mínimas nocturnas y prepare mantas térmicas si descienden bajo 4°C.</p>
  `;
  root.appendChild(card);
}
