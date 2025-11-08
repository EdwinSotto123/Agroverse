import { toggleClimateWidget } from './climate_alerts.js';

/**
 * Prompt user for generic animal placement information.
 * Returns a Promise resolving to an object with fields or null if cancelled.
 * @param {Object} options
 * @param {number} [options.defaultCount=6]
 * @param {string} [options.title='Configurar animales']
 * @param {string} [options.animalLabel='Animales']
 */
export function promptAnimalInfo({ defaultCount = 6, title = 'Configurar animales', animalLabel = 'Animales' } = {}) {
  return new Promise((resolve) => {
    // Hide climate widget while dialog is open
    toggleClimateWidget(false);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.55)';
    overlay.style.zIndex = 9999;
    // Capture keyboard events inside overlay so WASD no afecte al mapa
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', (e) => {
      // Permitir escribir en inputs y evitar que otros listeners globales capten WASD
      e.stopPropagation();
    });

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
    dialog.style.width = 'min(90vw, 700px)';
    dialog.style.maxHeight = '90vh';
    dialog.style.overflow = 'hidden';
    dialog.style.fontFamily = 'Arial, sans-serif';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.margin = '0 0 12px 0';
    titleEl.style.fontSize = '18px';
    titleEl.style.color = '#cdeaa9';
    titleEl.style.flexShrink = '0';
    dialog.appendChild(titleEl);

    const scrollContainer = document.createElement('div');
    scrollContainer.style.flex = '1';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.overflowX = 'hidden';
    scrollContainer.style.paddingRight = '8px';
    scrollContainer.style.marginBottom = '12px';
    scrollContainer.style.scrollbarWidth = 'thin';
    scrollContainer.style.scrollbarColor = '#6fb36a #1f3f1b';

    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 1fr';
    form.style.gap = '12px 16px';
    scrollContainer.appendChild(form);

    const mkField = (label, input) => {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '6px';
      const l = document.createElement('label');
      l.textContent = label;
      l.style.fontSize = '12px';
      l.style.opacity = '0.9';
      wrap.appendChild(l);
      wrap.appendChild(input);
      return wrap;
    };

    // 1) Cantidad de animales
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '0';
    countInput.step = '1';
    countInput.value = String(defaultCount);
    countInput.style.padding = '8px';
    countInput.style.borderRadius = '8px';
    countInput.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField(`¿Cuántos ${animalLabel.toLowerCase()} tienes?`, countInput));

    // 2) Ubicación de la granja (texto) + botón de geolocalización opcional
  const locationWrap = document.createElement('div');
  locationWrap.style.gridColumn = 'span 2';
    locationWrap.style.display = 'flex';
  locationWrap.style.flexDirection = 'column';
  locationWrap.style.gap = '6px';
    const locLabel = document.createElement('label');
    locLabel.textContent = 'Ubicación de la granja';
    locLabel.style.fontSize = '12px';
    locLabel.style.opacity = '0.9';
    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.placeholder = 'Ciudad, región, etc.';
    locationInput.style.padding = '8px';
    locationInput.style.borderRadius = '8px';
    locationInput.style.border = '1px solid rgba(255,255,255,0.2)';
  const geoRow = document.createElement('div');
  geoRow.style.display = 'flex';
  geoRow.style.gap = '8px';
  const geoBtn = document.createElement('button');
  geoBtn.type = 'button';
  geoBtn.textContent = 'Usar ubicación actual';
  geoBtn.style.padding = '8px 10px';
  geoBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  geoBtn.style.borderRadius = '8px';
  geoBtn.style.background = 'rgba(255,255,255,0.1)';
  geoBtn.style.color = '#fff';
  const mapBtn = document.createElement('button');
  mapBtn.type = 'button';
  mapBtn.textContent = 'Seleccionar en mapa';
  mapBtn.style.padding = '8px 10px';
  mapBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  mapBtn.style.borderRadius = '8px';
  mapBtn.style.background = 'rgba(255,255,255,0.1)';
  mapBtn.style.color = '#fff';
    let geoData = null;
    geoBtn.onclick = async () => {
      if (!navigator.geolocation) return alert('Geolocalización no disponible');
      geoBtn.disabled = true; geoBtn.textContent = 'Detectando…';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1`;
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
          const data = await res.json();
          locationInput.value = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          geoData = { lat: latitude, lon: longitude, address: data.address || {}, display_name: data.display_name };
        } catch (e) {
          locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          geoData = { lat: latitude, lon: longitude };
        } finally {
          geoBtn.disabled = false; geoBtn.textContent = 'Usar ubicación actual';
        }
      }, () => { geoBtn.disabled = false; geoBtn.textContent = 'Usar ubicación actual'; alert('No fue posible obtener la ubicación.'); });
    };
    mapBtn.onclick = async () => {
      const pick = await openMapPicker();
      if (pick) {
        locationInput.value = pick.display_name || `${pick.lat.toFixed(4)}, ${pick.lon.toFixed(4)}`;
        geoData = pick;
      }
    };
    geoRow.appendChild(geoBtn);
    geoRow.appendChild(mapBtn);
    locationWrap.appendChild(locLabel);
    locationWrap.appendChild(locationInput);
    locationWrap.appendChild(geoRow);
    form.appendChild(locationWrap);

    // 3) Uso (consumo, venta, otro)
    const usageSelect = document.createElement('select');
    ['consumo', 'venta', 'reproducción', 'mixto', 'otro'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v.charAt(0).toUpperCase() + v.slice(1);
      usageSelect.appendChild(opt);
    });
    usageSelect.style.padding = '8px';
    usageSelect.style.borderRadius = '8px';
    usageSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('¿Qué uso le das a los animales?', usageSelect));

    // 4) Raza/Especie (adicional 1)
    const breedInput = document.createElement('input');
    breedInput.type = 'text';
    breedInput.placeholder = 'Raza/Especie (opcional)';
    breedInput.style.padding = '8px';
    breedInput.style.borderRadius = '8px';
    breedInput.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Raza/Especie', breedInput));

    // 5) Tipo de alimentación (adicional 2)
    const feedingSelect = document.createElement('select');
    ['balanceado', 'pastoreo', 'mixto', 'otro'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v.charAt(0).toUpperCase() + v.slice(1);
      feedingSelect.appendChild(opt);
    });
    feedingSelect.style.padding = '8px';
    feedingSelect.style.borderRadius = '8px';
    feedingSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Tipo de alimentación', feedingSelect));

    // 6) Edad promedio (NUEVO)
    const ageInput = document.createElement('input');
    ageInput.type = 'text';
    ageInput.placeholder = 'Ej: 2 años, 6 meses';
    ageInput.style.padding = '8px';
    ageInput.style.borderRadius = '8px';
    ageInput.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Edad promedio', ageInput));

    // 7) Estado de salud (NUEVO)
    const healthSelect = document.createElement('select');
    ['Excelente', 'Bueno', 'Regular', 'Necesita atención', 'Enfermo'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      healthSelect.appendChild(opt);
    });
    healthSelect.value = 'Bueno';
    healthSelect.style.padding = '8px';
    healthSelect.style.borderRadius = '8px';
    healthSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Estado de salud general', healthSelect));

    // 8) Sistema de alojamiento (NUEVO)
    const housingSelect = document.createElement('select');
    ['Establo cerrado', 'Semi-abierto', 'Pastoreo libre', 'Rotacional', 'Mixto', 'Otro'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      housingSelect.appendChild(opt);
    });
    housingSelect.style.padding = '8px';
    housingSelect.style.borderRadius = '8px';
    housingSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Sistema de alojamiento', housingSelect));

    // 9) Vacunación (NUEVO)
    const vaccinationSelect = document.createElement('select');
    ['Al día', 'Parcial', 'No vacunados', 'No sé'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      vaccinationSelect.appendChild(opt);
    });
    vaccinationSelect.style.padding = '8px';
    vaccinationSelect.style.borderRadius = '8px';
    vaccinationSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Estado de vacunación', vaccinationSelect));

    // 10) Producción esperada (NUEVO) - span 2 columns
    const productionWrap = document.createElement('div');
    productionWrap.style.gridColumn = 'span 2';
    const productionInput = document.createElement('input');
    productionInput.type = 'text';
    productionInput.placeholder = 'Ej: 20 litros/día, 100 huevos/semana, 50 kg carne/año';
    productionInput.style.padding = '8px';
    productionInput.style.borderRadius = '8px';
    productionInput.style.border = '1px solid rgba(255,255,255,0.2)';
    productionInput.style.width = '100%';
    productionWrap.appendChild(mkField('Producción esperada', productionInput));
    form.appendChild(productionWrap);

    // 11) Alimentación detallada (NUEVO) - span 2 columns
    const feedDetailsWrap = document.createElement('div');
    feedDetailsWrap.style.gridColumn = 'span 2';
    const feedDetailsArea = document.createElement('textarea');
    feedDetailsArea.placeholder = 'Describe la dieta: tipos de pasto, granos, concentrados, suplementos, frecuencia...';
    feedDetailsArea.rows = 3;
    feedDetailsArea.style.padding = '8px';
    feedDetailsArea.style.borderRadius = '8px';
    feedDetailsArea.style.border = '1px solid rgba(255,255,255,0.2)';
    feedDetailsArea.style.width = '100%';
    feedDetailsArea.style.resize = 'vertical';
    feedDetailsArea.style.fontFamily = 'inherit';
    feedDetailsWrap.appendChild(mkField('Detalles de alimentación', feedDetailsArea));
    form.appendChild(feedDetailsWrap);

    // 12) Fuente de agua (NUEVO) - span 2 columns
    const waterWrap = document.createElement('div');
    waterWrap.style.gridColumn = 'span 2';
    waterWrap.style.display = 'flex';
    waterWrap.style.flexDirection = 'column';
    waterWrap.style.gap = '6px';
    const waterLabel = document.createElement('label');
    waterLabel.textContent = 'Fuente de agua';
    waterLabel.style.fontSize = '12px';
    waterLabel.style.opacity = '0.9';
    const waterCheckboxes = document.createElement('div');
    waterCheckboxes.style.display = 'grid';
    waterCheckboxes.style.gridTemplateColumns = '1fr 1fr';
    waterCheckboxes.style.gap = '6px';
    const waterSources = ['Pozo', 'Río/arroyo', 'Agua potable', 'Reservorio', 'Otro'];
    const waterChecks = [];
    waterSources.forEach(src => {
      const lbl = document.createElement('label');
      lbl.style.display = 'flex';
      lbl.style.alignItems = 'center';
      lbl.style.gap = '6px';
      lbl.style.fontSize = '13px';
      lbl.style.cursor = 'pointer';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = src;
      cb.style.cursor = 'pointer';
      cb.style.accentColor = '#6fb36a';
      waterChecks.push(cb);
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(src));
      waterCheckboxes.appendChild(lbl);
    });
    waterWrap.appendChild(waterLabel);
    waterWrap.appendChild(waterCheckboxes);
    form.appendChild(waterWrap);

    // 13) Enfermedades comunes (NUEVO) - span 2 columns
    const diseasesWrap = document.createElement('div');
    diseasesWrap.style.gridColumn = 'span 2';
    const diseasesArea = document.createElement('textarea');
    diseasesArea.placeholder = 'Enumera enfermedades o problemas de salud que hayas enfrentado...';
    diseasesArea.rows = 2;
    diseasesArea.style.padding = '8px';
    diseasesArea.style.borderRadius = '8px';
    diseasesArea.style.border = '1px solid rgba(255,255,255,0.2)';
    diseasesArea.style.width = '100%';
    diseasesArea.style.resize = 'vertical';
    diseasesArea.style.fontFamily = 'inherit';
    diseasesWrap.appendChild(mkField('Enfermedades/problemas comunes', diseasesArea));
    form.appendChild(diseasesWrap);

    // 14) Reproducción (NUEVO)
    const reproductionSelect = document.createElement('select');
    ['Natural', 'Inseminación artificial', 'Mixto', 'No aplica'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      reproductionSelect.appendChild(opt);
    });
    reproductionSelect.style.padding = '8px';
    reproductionSelect.style.borderRadius = '8px';
    reproductionSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Método de reproducción', reproductionSelect));

    // 15) Manejo veterinario (NUEVO)
    const vetSelect = document.createElement('select');
    ['Veterinario regular', 'Ocasional', 'Autogestión', 'Sin acceso', 'Otro'].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      vetSelect.appendChild(opt);
    });
    vetSelect.style.padding = '8px';
    vetSelect.style.borderRadius = '8px';
    vetSelect.style.border = '1px solid rgba(255,255,255,0.2)';
    form.appendChild(mkField('Manejo veterinario', vetSelect));

    // 16) Certificaciones (NUEVO) - span 2 columns
    const certWrap = document.createElement('div');
    certWrap.style.gridColumn = 'span 2';
    certWrap.style.display = 'flex';
    certWrap.style.flexDirection = 'column';
    certWrap.style.gap = '6px';
    const certLabel = document.createElement('label');
    certLabel.textContent = 'Certificaciones o prácticas especiales';
    certLabel.style.fontSize = '12px';
    certLabel.style.opacity = '0.9';
    const certCheckboxes = document.createElement('div');
    certCheckboxes.style.display = 'grid';
    certCheckboxes.style.gridTemplateColumns = '1fr 1fr';
    certCheckboxes.style.gap = '6px';
    const certOptions = ['Orgánico certificado', 'Libre de antibióticos', 'Bienestar animal', 'Comercio justo', 'Ninguno'];
    const certChecks = [];
    certOptions.forEach(opt => {
      const lbl = document.createElement('label');
      lbl.style.display = 'flex';
      lbl.style.alignItems = 'center';
      lbl.style.gap = '6px';
      lbl.style.fontSize = '13px';
      lbl.style.cursor = 'pointer';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = opt;
      cb.style.cursor = 'pointer';
      cb.style.accentColor = '#6fb36a';
      certChecks.push(cb);
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(opt));
      certCheckboxes.appendChild(lbl);
    });
    certWrap.appendChild(certLabel);
    certWrap.appendChild(certCheckboxes);
    form.appendChild(certWrap);

    // 17) Desafíos principales (NUEVO) - span 2 columns
    const challengesWrap = document.createElement('div');
    challengesWrap.style.gridColumn = 'span 2';
    const challengesArea = document.createElement('textarea');
    challengesArea.placeholder = 'Describe los principales desafíos: costos, enfermedades, clima, mercado, recursos...';
    challengesArea.rows = 2;
    challengesArea.style.padding = '8px';
    challengesArea.style.borderRadius = '8px';
    challengesArea.style.border = '1px solid rgba(255,255,255,0.2)';
    challengesArea.style.width = '100%';
    challengesArea.style.resize = 'vertical';
    challengesArea.style.fontFamily = 'inherit';
    challengesWrap.appendChild(mkField('Desafíos principales', challengesArea));
    form.appendChild(challengesWrap);

    // 18) Notas adicionales (NUEVO) - span 2 columns
    const notesWrap = document.createElement('div');
    notesWrap.style.gridColumn = 'span 2';
    const notesArea = document.createElement('textarea');
    notesArea.placeholder = 'Cualquier información adicional relevante sobre tu manejo ganadero...';
    notesArea.rows = 3;
    notesArea.style.padding = '8px';
    notesArea.style.borderRadius = '8px';
    notesArea.style.border = '1px solid rgba(255,255,255,0.2)';
    notesArea.style.width = '100%';
    notesArea.style.resize = 'vertical';
    notesArea.style.fontFamily = 'inherit';
    notesWrap.appendChild(mkField('Notas adicionales', notesArea));
    form.appendChild(notesWrap);

    dialog.appendChild(scrollContainer);

    // Buttons (fixed at bottom)
    const actions = document.createElement('div');
    actions.style.marginTop = '12px';
    actions.style.paddingTop = '12px';
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '10px';
    actions.style.borderTop = '1px solid rgba(255,255,255,0.15)';
    actions.style.flexShrink = '0';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.padding = '8px 14px';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.border = '1px solid rgba(255,255,255,0.3)';
    cancelBtn.style.background = 'rgba(255,255,255,0.1)';
    cancelBtn.style.color = '#fff';
    cancelBtn.onclick = () => { cleanup(); resolve(null); };

    const okBtn = document.createElement('button');
    okBtn.textContent = 'Aceptar';
    okBtn.style.padding = '8px 14px';
    okBtn.style.borderRadius = '8px';
    okBtn.style.border = '1px solid #3b7b2e';
    okBtn.style.background = '#4a8c3a';
    okBtn.style.color = '#fff';
    okBtn.style.fontWeight = '600';
    okBtn.onclick = () => {
      const count = Math.max(0, parseInt(countInput.value || '0', 10) || 0);
      const payload = {
        count,
        location: locationInput.value.trim(),
        usage: usageSelect.value,
        breed: breedInput.value.trim(),
        feeding: feedingSelect.value,
        geo: geoData,
        // New comprehensive fields
        age: ageInput.value.trim() || null,
        health: healthSelect.value,
        housing: housingSelect.value,
        vaccination: vaccinationSelect.value,
        production: productionInput.value.trim() || null,
        feedDetails: feedDetailsArea.value.trim() || null,
        waterSources: waterChecks.filter(cb => cb.checked).map(cb => cb.value),
        diseases: diseasesArea.value.trim() || null,
        reproduction: reproductionSelect.value,
        veterinaryCare: vetSelect.value,
        certifications: certChecks.filter(cb => cb.checked).map(cb => cb.value),
        challenges: challengesArea.value.trim() || null,
        notes: notesArea.value.trim() || null
      };
      cleanup();
      resolve(payload);
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    // Focus first field to asegurar escritura de WASD
    setTimeout(() => { countInput.focus(); }, 0);

    function cleanup() {
      overlay.remove();
      toggleClimateWidget(true);
    }
  });
}

// --- Helpers: Leaflet Map Picker ---
async function ensureLeaflet() {
  if (window.L) return true;
  // CSS
  const cssId = 'leaflet-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  // JS
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

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    return { lat, lon, address: data.address || {}, display_name: data.display_name };
  } catch {
    return { lat, lon };
  }
}

async function openMapPicker() {
  await ensureLeaflet();
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.55)';
    overlay.style.zIndex = 10000;
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', (e) => e.stopPropagation());

    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = '#2d5a27';
    box.style.color = '#fff';
    box.style.border = '4px solid #4a8c3a';
    box.style.borderRadius = '12px';
    box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
    box.style.padding = '12px';
    box.style.width = 'min(90vw, 720px)';
    box.style.height = 'min(80vh, 520px)';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';

    const header = document.createElement('div');
    header.textContent = 'Selecciona ubicación en el mapa';
    header.style.marginBottom = '8px';
    header.style.fontWeight = '600';
    box.appendChild(header);

    const mapDiv = document.createElement('div');
    mapDiv.id = 'animal-map-picker';
    mapDiv.style.flex = '1';
    mapDiv.style.minHeight = '400px';
    mapDiv.style.borderRadius = '8px';
    box.appendChild(mapDiv);

    const actions = document.createElement('div');
    actions.style.marginTop = '8px';
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '10px';

    const cancel = document.createElement('button');
    cancel.textContent = 'Cancelar';
    cancel.onclick = () => { overlay.remove(); resolve(null); };
    const ok = document.createElement('button');
    ok.textContent = 'Aceptar';
    ok.disabled = true;
    actions.appendChild(cancel);
    actions.appendChild(ok);
    box.appendChild(actions);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const map = L.map(mapDiv).setView([0,0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = null; let picked = null;
    const pickAt = async (latlng) => {
      if (marker) marker.remove();
      marker = L.marker(latlng).addTo(map);
      picked = await reverseGeocode(latlng.lat, latlng.lng);
      ok.disabled = false;
    };
    map.on('click', (e) => pickAt(e.latlng));

    ok.onclick = () => { overlay.remove(); resolve(picked); };
  });
}
