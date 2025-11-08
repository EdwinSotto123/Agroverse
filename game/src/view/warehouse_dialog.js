// --- Helpers: Leaflet Map Picker ---
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
    if (document.getElementById(jsId) || window.L) return resolve();
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

export function promptWarehouseInfo({ title = 'Configurar Almacén', kind = 'alimentos', initial = null } = {}) {
  return new Promise((resolve) => {
    // Remove existing
    const existing = document.getElementById('warehouse-dialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'warehouse-dialog';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    overlay.style.zIndex = '10000';

    const box = document.createElement('div');
    box.style.width = 'min(92vw, 560px)';
    box.style.maxHeight = '80vh';
    box.style.overflow = 'auto';
    box.style.background = '#1e3a2a';
    box.style.border = '4px solid #2f6b3f';
    box.style.borderRadius = '12px';
    box.style.color = '#fff';
    box.style.fontFamily = 'Arial, sans-serif';
    box.style.padding = '16px 18px';

    const h1 = document.createElement('h2');
    h1.textContent = title;
    h1.style.margin = '0 0 12px 0';
    h1.style.color = '#a5d6a7';
    box.appendChild(h1);

    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr';
    form.style.gap = '10px';

    // Disable game movement while dialog is open (WASD/Arrow keys) when typing in inputs
    const blockGameKeydown = (e) => {
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    };
    const disableGameControls = () => {
      document.body.classList.add('dialog-open');
      document.addEventListener('keydown', blockGameKeydown, true);
    };
    const enableGameControls = () => {
      document.body.classList.remove('dialog-open');
      document.removeEventListener('keydown', blockGameKeydown, true);
    };
    let escHandler = null;
    const finish = (result) => {
      enableGameControls();
      if (escHandler) document.removeEventListener('keydown', escHandler);
      try { resolve(result); } catch {}
      try { overlay.remove(); } catch {}
    };

    const makeLabel = (text) => {
      const l = document.createElement('label');
      l.textContent = text;
      l.style.fontWeight = '600';
      l.style.color = '#c8e6c9';
      return l;
    };
    const makeInput = (ph = '') => {
      const i = document.createElement('input');
      i.type = 'text';
      i.placeholder = ph;
      i.style.padding = '8px';
      i.style.borderRadius = '8px';
      i.style.border = '1px solid rgba(255,255,255,0.2)';
      return i;
    };
    const makeTextarea = (ph = '', rows = 3) => {
      const t = document.createElement('textarea');
      t.placeholder = ph;
      t.rows = rows;
      t.style.padding = '8px';
      t.style.borderRadius = '8px';
      t.style.border = '1px solid rgba(255,255,255,0.2)';
      return t;
    };
    const makeYesNo = () => {
      const s = document.createElement('select');
      s.style.padding = '8px';
      s.style.borderRadius = '8px';
      s.style.border = '1px solid rgba(255,255,255,0.2)';
      const opt0 = document.createElement('option'); opt0.value = ''; opt0.textContent = '—';
      const opt1 = document.createElement('option'); opt1.value = 'si'; opt1.textContent = 'Sí';
      const opt2 = document.createElement('option'); opt2.value = 'no'; opt2.textContent = 'No';
      s.append(opt0,opt1,opt2);
      return s;
    };

    // Build form per kind
    let firstFocusable = null;
  if (kind === 'materiales') {
      // Helper to create a yes/no checklist section
      const createChecklist = (question, options = [], otherPh = 'Otros (especifica)') => {
        const wrap = document.createElement('div');
        wrap.style.background = 'rgba(0,0,0,0.15)';
        wrap.style.border = '1px solid rgba(255,255,255,0.12)';
        wrap.style.borderRadius = '8px';
        wrap.style.padding = '10px';
        wrap.style.marginTop = '4px';
        const qLabel = makeLabel(question);
        const yesNo = makeYesNo();
        yesNo.style.marginTop = '6px';
        const group = document.createElement('div');
        group.style.display = 'none';
        group.style.marginTop = '8px';
        group.style.paddingLeft = '4px';
        const list = document.createElement('div');
        list.style.display = 'grid';
        list.style.gridTemplateColumns = '1fr 1fr';
        list.style.gap = '6px 12px';
        const checks = options.map((opt) => {
          const row = document.createElement('label');
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.gap = '8px';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = opt;
          const span = document.createElement('span');
          span.textContent = opt;
          row.append(cb, span);
          list.appendChild(row);
          return cb;
        });
        const otherInput = makeInput(otherPh);
        otherInput.style.marginTop = '6px';
        group.append(list, otherInput);
        yesNo.addEventListener('change', () => {
          group.style.display = yesNo.value === 'si' ? 'block' : 'none';
        });
        wrap.append(qLabel, yesNo, group);
        form.appendChild(wrap);
        return { yesNo, checks, otherInput };
      };
      // 1. Ubicación (mapa)
      const locLabel = makeLabel('Ubicación del almacén');
      const locInfo = document.createElement('div');
      locInfo.style.fontSize = '12px';
      locInfo.style.opacity = '0.9';
      locInfo.style.marginBottom = '6px';
      locInfo.textContent = 'Haz clic en el mapa para seleccionar la ubicación del almacén';
      const addressBox = document.createElement('div');
      addressBox.style.fontSize = '12px';
      addressBox.style.background = 'rgba(0,0,0,0.2)';
      addressBox.style.border = '1px solid rgba(255,255,255,0.15)';
      addressBox.style.borderRadius = '6px';
      addressBox.style.padding = '8px';
      addressBox.style.marginBottom = '8px';
      addressBox.textContent = '📍 Sin ubicación seleccionada';
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
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '260px';
      mapDiv.style.borderRadius = '8px';
      mapDiv.style.overflow = 'hidden';
      mapDiv.style.border = '2px solid rgba(255,255,255,0.15)';
      form.append(locLabel, locInfo, addressBox, locateBtn, mapDiv);
      let selectedGeo = initial?.geo || null;
      if (selectedGeo && (initial?.location || selectedGeo.display_name)) {
        addressBox.textContent = `📍 ${initial.location || selectedGeo.display_name}`;
      }
      if (!firstFocusable) firstFocusable = locateBtn;

      // 2. ¿Qué herramientas usas para arar?
      const tillLabel = makeLabel('¿Qué herramientas usas para arar?');
      const tillInput = makeTextarea('Ej: Arado de discos, rastra, sembradora');
  form.append(tillLabel, tillInput);
  if (initial?.toolsTillage) tillInput.value = initial.toolsTillage;

      // 3. ¿Tienes algún vehículo de transporte?
      const transLabel = makeLabel('¿Tienes algún vehículo de transporte?');
      const transYesNo = makeYesNo();
      const transDetail = makeInput('¿Cuál? Ej: Camioneta 4x4, camión, tractor con carro');
      transDetail.style.display = 'none';
      transYesNo.addEventListener('change', () => {
        transDetail.style.display = transYesNo.value === 'si' ? 'block' : 'none';
      });
      form.append(transLabel, transYesNo, transDetail);
      if (initial?.hasTransportVehicle) {
        transYesNo.value = initial.hasTransportVehicle;
        transDetail.style.display = transYesNo.value === 'si' ? 'block' : 'none';
      }
      if (initial?.transportVehicle) transDetail.value = initial.transportVehicle;

      // 4. ¿Tienes vehículos de cultivo?
      const cultLabel = makeLabel('¿Tienes vehículos de cultivo?');
      const cultYesNo = makeYesNo();
      const cultDetail = makeInput('¿Cuáles? Ej: Tractor, cosechadora, fumigadora');
      cultDetail.style.display = 'none';
      cultYesNo.addEventListener('change', () => {
        cultDetail.style.display = cultYesNo.value === 'si' ? 'block' : 'none';
      });
      form.append(cultLabel, cultYesNo, cultDetail);
      if (initial?.hasCultivationVehicles) {
        cultYesNo.value = initial.hasCultivationVehicles;
        cultDetail.style.display = cultYesNo.value === 'si' ? 'block' : 'none';
      }
      if (initial?.cultivationVehicles) cultDetail.value = initial.cultivationVehicles;

      // 5. ¿Qué materiales almacenas?
      const matsLabel = makeLabel('¿Qué materiales almacenas?');
      const matsInput = makeTextarea('Ej: Fertilizantes, herramientas, repuestos, madera, cemento');
  form.append(matsLabel, matsInput);
  if (initial?.materials) matsInput.value = initial.materials;

      // 6. Capacidad
      const capLabel = makeLabel('Capacidad (m², estanterías, palets)');
      const capInput = makeInput('Ej: 120 m², 10 estanterías, 20 palets');
  form.append(capLabel, capInput);
  if (initial?.capacity) capInput.value = initial.capacity;

      // 7. Almacenas fertilizantes
      const fertSection = createChecklist(
        '¿Almacenas algún fertilizante?',
        ['Urea', 'NPK', 'Fosfato diamónico (DAP)', 'Sulfato de amonio', 'Cal agrícola']
      );
      if (initial?.fertilizers) {
        fertSection.yesNo.value = initial.fertilizers.has || '';
        fertSection.otherInput.value = initial.fertilizers.other || '';
        if (Array.isArray(initial.fertilizers.items)) {
          fertSection.checks.forEach(cb => { if (initial.fertilizers.items.includes(cb.value)) cb.checked = true; });
        }
        // ensure visibility matches
        const show = fertSection.yesNo.value === 'si';
        fertSection.yesNo.dispatchEvent(new Event('change'));
      }

      // 8. Almacenas pesticidas
      const pestSection = createChecklist(
        '¿Almacenas pesticidas?',
        ['Herbicidas', 'Insecticidas', 'Fungicidas', 'Acaricidas', 'Rodenticidas']
      );
      if (initial?.pesticides) {
        pestSection.yesNo.value = initial.pesticides.has || '';
        pestSection.otherInput.value = initial.pesticides.other || '';
        if (Array.isArray(initial.pesticides.items)) {
          pestSection.checks.forEach(cb => { if (initial.pesticides.items.includes(cb.value)) cb.checked = true; });
        }
        pestSection.yesNo.dispatchEvent(new Event('change'));
      }

      // 9. Almacenas semillas
      const seedSection = createChecklist(
        '¿Almacenas semillas?',
        ['Maíz', 'Trigo', 'Arroz', 'Papa', 'Tomate', 'Frijol', 'Hortalizas mixtas', 'Pasto/Forraje']
      );
      if (initial?.seeds) {
        seedSection.yesNo.value = initial.seeds.has || '';
        seedSection.otherInput.value = initial.seeds.other || '';
        if (Array.isArray(initial.seeds.items)) {
          seedSection.checks.forEach(cb => { if (initial.seeds.items.includes(cb.value)) cb.checked = true; });
        }
        seedSection.yesNo.dispatchEvent(new Event('change'));
      }

      // 10. Principales problemas
      const issuesLabel = makeLabel('Principales problemas');
      const issuesInput = makeTextarea('Ej: Humedad, seguridad, acceso, polvo');
  form.append(issuesLabel, issuesInput);
  if (initial?.issues) issuesInput.value = initial.issues;

      box.appendChild(form);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '10px';
      actions.style.justifyContent = 'flex-end';
      actions.style.marginTop = '12px';

      const btnOk = document.createElement('button');
      btnOk.textContent = 'Aceptar';
      btnOk.style.background = '#43a047'; btnOk.style.color = '#fff'; btnOk.style.border = '0'; btnOk.style.padding = '10px 16px'; btnOk.style.borderRadius = '6px'; btnOk.style.cursor = 'pointer'; btnOk.style.fontWeight = '700';
      btnOk.addEventListener('click', () => {
        const getSelected = (section) => section.checks.filter(c => c.checked).map(c => c.value);
        finish({
          location: selectedGeo?.display_name || '',
          geo: selectedGeo || null,
          toolsTillage: tillInput.value.trim(),
          hasTransportVehicle: transYesNo.value,
          transportVehicle: transDetail.value.trim(),
          hasCultivationVehicles: cultYesNo.value,
          cultivationVehicles: cultDetail.value.trim(),
          materials: matsInput.value.trim(),
          capacity: capInput.value.trim(),
          fertilizers: {
            has: fertSection.yesNo.value,
            items: getSelected(fertSection),
            other: fertSection.otherInput.value.trim()
          },
          pesticides: {
            has: pestSection.yesNo.value,
            items: getSelected(pestSection),
            other: pestSection.otherInput.value.trim()
          },
          seeds: {
            has: seedSection.yesNo.value,
            items: getSelected(seedSection),
            other: seedSection.otherInput.value.trim()
          },
          issues: issuesInput.value.trim(),
          kind
        });
      });

      const btnCancel = document.createElement('button');
      btnCancel.textContent = 'Cancelar';
      btnCancel.style.background = '#757575'; btnCancel.style.color = '#fff'; btnCancel.style.border = '0'; btnCancel.style.padding = '10px 16px'; btnCancel.style.borderRadius = '6px'; btnCancel.style.cursor = 'pointer'; btnCancel.style.fontWeight = '700';
  btnCancel.addEventListener('click', () => { finish(null); });

      actions.appendChild(btnOk);
      actions.appendChild(btnCancel);
      box.appendChild(actions);

    overlay.appendChild(box);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) { finish(null); } });
    escHandler = function onKey(e){ if (e.key === 'Escape') { finish(null); } };
    document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
    disableGameControls();

      // Initialize map after in DOM
      (async () => {
        await ensureLeaflet();
        const map = L.map(mapDiv, { zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        function setDefaultView() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              map.setView([pos.coords.latitude, pos.coords.longitude], 13);
            }, () => map.setView([0, 0], 2), { enableHighAccuracy: true, timeout: 3000 });
          } else map.setView([0, 0], 2);
        }
        let marker = null;
        if (selectedGeo && typeof selectedGeo.lat === 'number' && typeof selectedGeo.lon === 'number') {
          map.setView([selectedGeo.lat, selectedGeo.lon], 14);
          marker = L.marker([selectedGeo.lat, selectedGeo.lon]).addTo(map);
        } else {
          setDefaultView();
        }
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          if (marker) marker.remove();
          marker = L.marker([lat, lng]).addTo(map);
          const geo = await reverseGeocode(lat, lng);
          selectedGeo = geo;
          addressBox.textContent = `📍 ${geo.display_name || 'Ubicación seleccionada'}`;
        });
        locateBtn.addEventListener('click', () => {
          if (!navigator.geolocation) return alert('Geolocalización no disponible');
          locateBtn.disabled = true; locateBtn.textContent = '📍 Obteniendo...';
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            map.setView([lat, lng], 14);
            if (marker) marker.remove();
            marker = L.marker([lat, lng]).addTo(map);
            const geo = await reverseGeocode(lat, lng);
            selectedGeo = geo;
            addressBox.textContent = `📍 ${geo.display_name || 'Mi ubicación'}`;
            locateBtn.disabled = false; locateBtn.textContent = '📍 Mi ubicación';
          }, () => {
            alert('No se pudo obtener la ubicación');
            locateBtn.disabled = false; locateBtn.textContent = '📍 Mi ubicación';
          });
        });
      })();

      (firstFocusable || locateBtn).focus();
      return; // early exit for materiales
    }

    // Default form (alimentos)
    // 1. Capacidad (texto libre)
    const capLabel = makeLabel('Capacidad (pisos, hectáreas o kg)');
    const capInput = makeInput('Ej: 2 pisos, 5 ha, 12.000 kg');
    form.append(capLabel, capInput);
    if (!firstFocusable) firstFocusable = capInput;

  // 2. Ubicación (mapa)
  const locLabel = makeLabel('Ubicación del almacén');
  const locInfo = document.createElement('div');
  locInfo.style.fontSize = '12px';
  locInfo.style.opacity = '0.9';
  locInfo.style.marginBottom = '6px';
  locInfo.textContent = 'Haz clic en el mapa para seleccionar la ubicación del almacén';
  const addressBox = document.createElement('div');
  addressBox.style.fontSize = '12px';
  addressBox.style.background = 'rgba(0,0,0,0.2)';
  addressBox.style.border = '1px solid rgba(255,255,255,0.15)';
  addressBox.style.borderRadius = '6px';
  addressBox.style.padding = '8px';
  addressBox.style.marginBottom = '8px';
  addressBox.textContent = '📍 Sin ubicación seleccionada';
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
  const mapDiv = document.createElement('div');
  mapDiv.style.width = '100%';
  mapDiv.style.height = '260px';
  mapDiv.style.borderRadius = '8px';
  mapDiv.style.overflow = 'hidden';
  mapDiv.style.border = '2px solid rgba(255,255,255,0.15)';
    form.append(locLabel, locInfo, addressBox, locateBtn, mapDiv);
    let selectedGeo = initial?.geo || null;
    if (selectedGeo && (initial?.location || selectedGeo.display_name)) {
      addressBox.textContent = `📍 ${initial.location || selectedGeo.display_name}`;
    }

    // 3. Cultivos que almacena (textarea)
    const cropsLabel = makeLabel('Cultivos que almacena');
  const cropsInput = makeTextarea('Ej: Maíz, Trigo, Papa');
    form.append(cropsLabel, cropsInput);
  if (initial?.crops) cropsInput.value = initial.crops;

    // 4. Principales problemas (textarea)
    const issuesLabel = makeLabel('Principales problemas');
  const issuesInput = makeTextarea('Ej: Humedad alta, plagas, seguridad');
    form.append(issuesLabel, issuesInput);
  if (initial?.issues) issuesInput.value = initial.issues;

    box.appendChild(form);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    actions.style.justifyContent = 'flex-end';
    actions.style.marginTop = '12px';

    const btnOk = document.createElement('button');
    btnOk.textContent = 'Aceptar';
    btnOk.style.background = '#43a047'; btnOk.style.color = '#fff'; btnOk.style.border = '0'; btnOk.style.padding = '10px 16px'; btnOk.style.borderRadius = '6px'; btnOk.style.cursor = 'pointer'; btnOk.style.fontWeight = '700';
    btnOk.addEventListener('click', () => {
      finish({
        capacity: capInput.value.trim(),
        location: selectedGeo?.display_name || '',
        geo: selectedGeo || null,
        crops: cropsInput.value.trim(),
        issues: issuesInput.value.trim(),
        kind
      });
    });

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancelar';
    btnCancel.style.background = '#757575'; btnCancel.style.color = '#fff'; btnCancel.style.border = '0'; btnCancel.style.padding = '10px 16px'; btnCancel.style.borderRadius = '6px'; btnCancel.style.cursor = 'pointer'; btnCancel.style.fontWeight = '700';
  btnCancel.addEventListener('click', () => { finish(null); });

    actions.appendChild(btnOk);
    actions.appendChild(btnCancel);
    box.appendChild(actions);

    overlay.appendChild(box);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) { finish(null); } });
    escHandler = function onKey(e){ if (e.key === 'Escape') { finish(null); } };
    document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
    disableGameControls();

    // Initialize map after in DOM
    (async () => {
      await ensureLeaflet();
      const map = L.map(mapDiv, { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      function setDefaultView() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 13);
          }, () => map.setView([0, 0], 2), { enableHighAccuracy: true, timeout: 3000 });
        } else map.setView([0, 0], 2);
      }
      let marker = null;
      if (selectedGeo && typeof selectedGeo.lat === 'number' && typeof selectedGeo.lon === 'number') {
        map.setView([selectedGeo.lat, selectedGeo.lon], 14);
        marker = L.marker([selectedGeo.lat, selectedGeo.lon]).addTo(map);
      } else {
        setDefaultView();
      }
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        if (marker) marker.remove();
        marker = L.marker([lat, lng]).addTo(map);
        const geo = await reverseGeocode(lat, lng);
        selectedGeo = geo;
        addressBox.textContent = `📍 ${geo.display_name || 'Ubicación seleccionada'}`;
      });
      locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) return alert('Geolocalización no disponible');
        locateBtn.disabled = true; locateBtn.textContent = '📍 Obteniendo...';
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          map.setView([lat, lng], 14);
          if (marker) marker.remove();
          marker = L.marker([lat, lng]).addTo(map);
          const geo = await reverseGeocode(lat, lng);
          selectedGeo = geo;
          addressBox.textContent = `📍 ${geo.display_name || 'Mi ubicación'}`;
          locateBtn.disabled = false; locateBtn.textContent = '📍 Mi ubicación';
        }, () => {
          alert('No se pudo obtener la ubicación');
          locateBtn.disabled = false; locateBtn.textContent = '📍 Mi ubicación';
        });
      });
    })();

    // focus first input
    (firstFocusable || capInput).focus();
  });
}
