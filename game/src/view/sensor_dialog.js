// Dialog to add/edit IoT sensors for crops
export function promptSensorInfo({ title = 'Agregar Sensor IoT', initial = null } = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('sensor-dialog');
    if (existing) existing.remove();

    // Helpers
    const genHex = (len = 10) => Math.random().toString(16).slice(2, 2 + len);
    const genPassword = (len = 16) => Math.random().toString(36).slice(2, 2 + len);

    // Auto-generate credentials (system-provisioned para Google Cloud IoT Core)
    const clientId = `${genHex(10)}_root_${Date.now()}`;
    const username = `${clientId.split('_root_')[0]}_root`;
    const password = genPassword(18);
    // Google Cloud IoT Core endpoint: mqtt.googleapis.com (puerto 8883 para SSL)
    const hostname = `mqtt.googleapis.com`;
    const topic = `${username}/sensor#1/`;

    const overlay = document.createElement('div');
    overlay.id = 'sensor-dialog';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    overlay.style.zIndex = '20000';

    const box = document.createElement('div');
    box.style.width = 'min(92vw, 520px)';
    box.style.maxHeight = '80vh';
    box.style.overflow = 'auto';
    box.style.background = '#1d2b1f';
    box.style.border = '4px solid #3f7a3f';
    box.style.borderRadius = '12px';
    box.style.color = '#fff';
    box.style.fontFamily = 'Arial, sans-serif';
    box.style.padding = '16px 18px';

    const h1 = document.createElement('h2');
    h1.textContent = title;
    h1.style.margin = '0 0 12px 0';
    h1.style.color = '#b2dfdb';
    box.appendChild(h1);

    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr';
    form.style.gap = '10px';

    const makeLabel = (t) => { const l = document.createElement('label'); l.textContent = t; l.style.fontWeight = '600'; l.style.color = '#dcedc8'; return l; };
    const makeInput = (type = 'text') => { const i = document.createElement('input'); i.type = type; i.style.padding = '10px'; i.style.borderRadius = '8px'; i.style.border = '1px solid rgba(255,255,255,0.12)'; i.style.background = 'rgba(255,255,255,0.03)'; i.readOnly = true; i.autocomplete = 'off'; return i; };

    // Credential fields (read-only) with copy buttons
    function credentialRow(labelText, value) {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.gap = '8px';
      wrapper.style.alignItems = 'center';

      const label = makeLabel(labelText);
      label.style.minWidth = '120px';

      const input = makeInput('text');
      input.value = value;
      input.style.flex = '1';
      input.style.marginRight = '6px';

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copiar';
      copyBtn.style.padding = '8px 10px';
      copyBtn.style.borderRadius = '8px';
      copyBtn.style.border = 'none';
      copyBtn.style.background = 'linear-gradient(135deg,#26a69a,#43a047)';
      copyBtn.style.color = '#fff';
      copyBtn.style.cursor = 'pointer';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(input.value);
          copyBtn.textContent = 'Copiado';
          setTimeout(() => (copyBtn.textContent = 'Copiar'), 1200);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = input.value;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          copyBtn.textContent = 'Copiado';
          setTimeout(() => (copyBtn.textContent = 'Copiar'), 1200);
        }
      });

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      wrapper.appendChild(copyBtn);
      return wrapper;
    }

    const ciRow = credentialRow('Client ID', clientId);
    const unRow = credentialRow('Username', username);
    const pwRow = credentialRow('Password', password);
    const hostRow = credentialRow('Hostname', hostname);

    // Sensor friendly name (editable)
    const nameLabel = makeLabel('Nombre para mostrar');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Ej: Sensor Temperatura - Parcel 3';
    nameInput.style.padding = '10px';
    nameInput.style.borderRadius = '8px';
    nameInput.style.border = '1px solid rgba(255,255,255,0.12)';
    nameInput.style.background = '#fff';
    nameInput.style.color = '#000';
    if (initial?.name) nameInput.value = initial.name;

    // Modules checkboxes (allow multi-select)
    const moduleLabel = makeLabel('¿Qué sensores? Selecciona tus módulos (puedes elegir varios)');
    const modulesBox = document.createElement('div');
    modulesBox.style.display = 'flex';
    modulesBox.style.flexWrap = 'wrap';
    modulesBox.style.gap = '8px';
    const modules = ['temperatura', 'humedad', 'ph', 'luminosidad', 'conductividad', 'otro'];
    const moduleChecks = [];
    modules.forEach(m => {
      const wrap = document.createElement('label');
      wrap.style.display = 'inline-flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '6px';
      wrap.style.background = '#fff';
      wrap.style.color = '#000';
      wrap.style.padding = '6px 8px';
      wrap.style.borderRadius = '8px';
      wrap.style.border = '1px solid rgba(0,0,0,0.06)';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = m;
      moduleChecks.push(cb);
      const span = document.createElement('span');
      span.textContent = m.charAt(0).toUpperCase() + m.slice(1);
      wrap.appendChild(cb);
      wrap.appendChild(span);
      modulesBox.appendChild(wrap);
    });

    // Description textarea
    const descLabel = makeLabel('Describe qué haces con estos sensores');
    const descTA = document.createElement('textarea');
    descTA.placeholder = 'Ej: Monitoreo de humedad para riego automático en invernadero...';
    descTA.style.minHeight = '80px';
    descTA.style.padding = '10px';
    descTA.style.borderRadius = '8px';
    descTA.style.border = '1px solid rgba(255,255,255,0.12)';
    descTA.style.background = '#fff';
    descTA.style.color = '#000';

    form.appendChild(ciRow);
    form.appendChild(unRow);
    form.appendChild(pwRow);
    form.appendChild(hostRow);
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
  form.appendChild(moduleLabel);
  form.appendChild(modulesBox);
    form.appendChild(descLabel);
    form.appendChild(descTA);

    const actions = document.createElement('div');
    actions.style.display = 'flex'; actions.style.gap = '10px'; actions.style.justifyContent = 'flex-end'; actions.style.marginTop = '12px';
    const btnOk = document.createElement('button'); btnOk.textContent = 'Aceptar'; btnOk.style.background = '#43a047'; btnOk.style.color = '#fff'; btnOk.style.border='0'; btnOk.style.padding='10px 16px'; btnOk.style.borderRadius='6px'; btnOk.style.cursor='pointer'; btnOk.style.fontWeight='700';
    const btnCancel = document.createElement('button'); btnCancel.textContent = 'Cancelar'; btnCancel.style.background = '#757575'; btnCancel.style.color = '#fff'; btnCancel.style.border='0'; btnCancel.style.padding='10px 16px'; btnCancel.style.borderRadius='6px'; btnCancel.style.cursor='pointer'; btnCancel.style.fontWeight='700';
    actions.append(btnOk, btnCancel);

    // Movement blocking similar to other dialogs
    const blockKeys = (e) => {
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
      if (e.key === 'Enter' && document.activeElement !== descTA) {
        e.preventDefault();
        btnOk.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        btnCancel.click();
      }
    };

    function finish(result) {
      document.removeEventListener('keydown', blockKeys, true);
      try { resolve(result); } catch {}
      try { overlay.remove(); } catch {}
    }

    btnOk.addEventListener('click', () => {
      const selectedModules = moduleChecks.filter(c => c.checked).map(c => c.value);
      const payload = {
        clientId,
        username,
        password,
        hostname,
        topic,
        name: nameInput.value.trim() || null,
        module: selectedModules.length ? selectedModules : ['generic'],
        description: descTA.value.trim() || null
      };
      finish(payload);
    });
    btnCancel.addEventListener('click', () => finish(null));

    box.appendChild(form);
    box.appendChild(actions);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) finish(null); });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', blockKeys, true);
    nameInput.focus();
  });
}
