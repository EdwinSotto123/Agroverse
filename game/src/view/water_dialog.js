// Dialog to capture water source metadata (lake, well, river)
export function promptWaterInfo({ title = 'Configurar fuente de agua', kind = 'lago', initial = null } = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('water-dialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'water-dialog';
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
    box.style.background = '#0f3a4a';
    box.style.border = '4px solid #1e6a7f';
    box.style.borderRadius = '12px';
    box.style.color = '#fff';
    box.style.fontFamily = 'Arial, sans-serif';
    box.style.padding = '16px 18px';

    const h1 = document.createElement('h2');
    h1.textContent = title;
    h1.style.margin = '0 0 12px 0';
    h1.style.color = '#a5d6e4';
    box.appendChild(h1);

    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr';
    form.style.gap = '10px';

    // Movement blocking while dialog open
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

    const makeLabel = (t) => { const l = document.createElement('label'); l.textContent = t; l.style.fontWeight='600'; l.style.color='#cdeaf1'; return l; };
    const makeInput = (ph='') => { const i=document.createElement('input'); i.type='text'; i.placeholder=ph; i.style.padding='8px'; i.style.borderRadius='8px'; i.style.border='1px solid rgba(255,255,255,0.2)'; return i; };
    const makeTextarea = (ph='', rows=3) => { const t=document.createElement('textarea'); t.placeholder=ph; t.rows=rows; t.style.padding='8px'; t.style.borderRadius='8px'; t.style.border='1px solid rgba(255,255,255,0.2)'; return t; };

    // Name field varies per kind
    const nameLabelText = kind === 'lago' ? 'Nombre del lago (real)'
                          : kind === 'rio' ? 'Nombre del río (real)'
                          : 'Nombre o referencia del pozo';
    const nameLabel = makeLabel(nameLabelText);
    const nameInput = makeInput(kind === 'pozo' ? 'Ej: Pozo principal del sector norte' : 'Ej: Titicaca, Amazonas, etc.');
    if (initial?.name) nameInput.value = initial.name;
    form.append(nameLabel, nameInput);

    // Location map
    const locLabel = makeLabel('Ubicación aproximada');
    const locInfo = document.createElement('div'); locInfo.style.fontSize='12px'; locInfo.style.opacity='0.9'; locInfo.style.marginBottom='6px'; locInfo.textContent='Haz clic en el mapa para seleccionar la ubicación';
    const addressBox = document.createElement('div'); addressBox.style.fontSize='12px'; addressBox.style.background='rgba(0,0,0,0.2)'; addressBox.style.border='1px solid rgba(255,255,255,0.15)'; addressBox.style.borderRadius='6px'; addressBox.style.padding='8px'; addressBox.style.marginBottom='8px'; addressBox.textContent='📍 Sin ubicación seleccionada';
    const locateBtn = document.createElement('button'); locateBtn.type='button'; locateBtn.textContent='📍 Mi ubicación'; locateBtn.style.background='#126782'; locateBtn.style.border='none'; locateBtn.style.color='#fff'; locateBtn.style.padding='8px 12px'; locateBtn.style.borderRadius='6px'; locateBtn.style.cursor='pointer'; locateBtn.style.width='100%';
    const mapDiv = document.createElement('div'); mapDiv.style.width='100%'; mapDiv.style.height='260px'; mapDiv.style.borderRadius='8px'; mapDiv.style.overflow='hidden'; mapDiv.style.border='2px solid rgba(255,255,255,0.15)';
    form.append(locLabel, locInfo, addressBox, locateBtn, mapDiv);
    let selectedGeo = initial?.geo || null;
    if (selectedGeo && (initial?.location || selectedGeo.display_name)) addressBox.textContent = `📍 ${initial.location || selectedGeo.display_name}`;

    // Usage description
    const useLabel = makeLabel('¿Cómo lo usas?');
    const useTextarea = makeTextarea('Describe usos: riego, consumo animal, recreación, etc.', 3);
    if (initial?.usage) useTextarea.value = initial.usage;
    form.append(useLabel, useTextarea);

    // Extraction methods
    const methodsLabel = makeLabel('Métodos de extracción / uso del agua');
    const methodsWrap = document.createElement('div'); methodsWrap.style.display='grid'; methodsWrap.style.gridTemplateColumns='1fr 1fr'; methodsWrap.style.gap='6px 12px'; methodsWrap.style.marginTop='6px';
    const methods = ['Manguera', 'Bomba', 'Cubos/Balde', 'Gravedad/Canales', 'Aspersores', 'Goteo', 'Canalización'];
    const methodChecks = methods.map((opt) => { const row=document.createElement('label'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='8px'; const cb=document.createElement('input'); cb.type='checkbox'; cb.value=opt; const span=document.createElement('span'); span.textContent=opt; row.append(cb, span); methodsWrap.appendChild(row); return cb; });
    if (Array.isArray(initial?.methods)) { methodChecks.forEach(cb => { if (initial.methods.includes(cb.value)) cb.checked = true; }); }
    const methodsOther = makeInput('Otros (especifica)'); if (initial?.otherMethods) methodsOther.value = initial.otherMethods; methodsOther.style.marginTop='6px';
    form.append(methodsLabel, methodsWrap, methodsOther);

    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='10px'; actions.style.justifyContent='flex-end'; actions.style.marginTop='12px';
    const btnOk = document.createElement('button'); btnOk.textContent='Aceptar'; btnOk.style.background='#1c8db0'; btnOk.style.color='#fff'; btnOk.style.border='0'; btnOk.style.padding='10px 16px'; btnOk.style.borderRadius='6px'; btnOk.style.cursor='pointer'; btnOk.style.fontWeight='700';
    btnOk.addEventListener('click', () => {
      const selectedMethods = methodChecks.filter(c => c.checked).map(c => c.value);
      const payload = {
        name: nameInput.value.trim(),
        location: selectedGeo?.display_name || '',
        geo: selectedGeo || null,
        usage: useTextarea.value.trim(),
        methods: selectedMethods,
        otherMethods: methodsOther.value.trim(),
        kind
      };
      finish(payload);
    });
    const btnCancel = document.createElement('button'); btnCancel.textContent='Cancelar'; btnCancel.style.background='#757575'; btnCancel.style.color='#fff'; btnCancel.style.border='0'; btnCancel.style.padding='10px 16px'; btnCancel.style.borderRadius='6px'; btnCancel.style.cursor='pointer'; btnCancel.style.fontWeight='700'; btnCancel.addEventListener('click', () => { finish(null); });
    actions.append(btnOk, btnCancel);

  box.appendChild(form);
  // Actions (Aceptar/Cancelar)
  box.appendChild(actions);
    overlay.appendChild(box);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) finish(null); });
    escHandler = function onKey(e) { if (e.key === 'Escape') finish(null); };
    document.addEventListener('keydown', escHandler);
    document.body.appendChild(overlay);
    disableGameControls();

    // Leaflet helpers inline
    async function ensureLeaflet() {
      if (window.L) return true;
      const cssId = 'leaflet-css';
      if (!document.getElementById(cssId)) { const link = document.createElement('link'); link.id = cssId; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link); }
      await new Promise((resolve) => { const jsId = 'leaflet-js'; if (document.getElementById(jsId) || window.L) return resolve(); const s=document.createElement('script'); s.id=jsId; s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=resolve; document.body.appendChild(s); });
      return true;
    }
    async function reverseGeocode(lat, lon) {
      try { const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`; const res = await fetch(url, { headers: { 'Accept': 'application/json' } }); if (!res.ok) throw new Error('HTTP '+res.status); const data = await res.json(); return { lat, lon, display_name: data.display_name, address: data.address || {} }; }
      catch { return { lat, lon, address: {} }; }
    }

    // Initialize map
    (async () => {
      await ensureLeaflet();
      const map = L.map(mapDiv, { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
      function setDefaultView() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => { map.setView([pos.coords.latitude, pos.coords.longitude], 13); }, () => map.setView([0, 0], 2), { enableHighAccuracy: true, timeout: 3000 });
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
        }, () => { alert('No se pudo obtener la ubicación'); locateBtn.disabled = false; locateBtn.textContent = '📍 Mi ubicación'; });
      });
    })();

    nameInput.focus();
  });
}
