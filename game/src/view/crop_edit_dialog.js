/**
 * CROP EDIT DIALOG
 * Formulario bonito para editar cultivos existentes
 */

/**
 * Abre un formulario de edición para un cultivo existente
 * @param {Object} entity - Entidad del cultivo a editar
 * @returns {Promise<Object|null>} Datos actualizados o null si se cancela
 */
export async function openCropEditDialog(entity) {
  return new Promise((resolve) => {
    // Remover cualquier diálogo existente
    const existing = document.getElementById('crop-edit-dialog');
    if (existing) existing.remove();

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'crop-edit-dialog';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-y: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    // Crear panel principal
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: linear-gradient(135deg, #ffffff 0%, #f9fff9 100%);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: min(95vw, 900px);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    `;

    // === HEADER ===
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #43a047, #66bb6a);
      color: white;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
    `;

    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
    `;

    const icon = document.createElement('div');
    icon.textContent = '🌱';
    icon.style.cssText = `
      font-size: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 8px;
      backdrop-filter: blur(10px);
    `;

    const titleContainer = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Editar Cultivo';
    title.style.cssText = `
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = entity.cropName || 'Sin nombre';
    subtitle.style.cssText = `
      margin: 4px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    `;

    titleContainer.appendChild(title);
    titleContainer.appendChild(subtitle);
    headerLeft.appendChild(icon);
    headerLeft.appendChild(titleContainer);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    closeBtn.onclick = () => {
      overlay.remove();
      resolve(null);
    };

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    // === CONTENT CONTAINER ===
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 32px;
      overflow-y: auto;
      flex: 1;
    `;

    // === TABS ===
    const tabs = ['Básico', 'Ubicación', 'Cultivo', 'Fechas', 'Suelo', 'Siembra', 'Manejo', 'Notas'];
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    `;

    let activeTab = 0;
    const tabButtons = [];
    const tabContents = [];

    tabs.forEach((tabName, index) => {
      const tabBtn = document.createElement('button');
      tabBtn.textContent = tabName;
      tabBtn.style.cssText = `
        background: ${index === 0 ? 'linear-gradient(135deg, #43a047, #66bb6a)' : '#f5f5f5'};
        color: ${index === 0 ? 'white' : '#666'};
        border: none;
        padding: 10px 20px;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
        box-shadow: ${index === 0 ? '0 4px 8px rgba(67, 160, 71, 0.3)' : 'none'};
      `;

      tabBtn.onclick = () => {
        activeTab = index;
        tabButtons.forEach((btn, i) => {
          btn.style.background = i === index ? 'linear-gradient(135deg, #43a047, #66bb6a)' : '#f5f5f5';
          btn.style.color = i === index ? 'white' : '#666';
          btn.style.boxShadow = i === index ? '0 4px 8px rgba(67, 160, 71, 0.3)' : 'none';
        });
        tabContents.forEach((tc, i) => {
          tc.style.display = i === index ? 'block' : 'none';
        });
      };

      tabButtons.push(tabBtn);
      tabContainer.appendChild(tabBtn);
    });

    content.appendChild(tabContainer);

    // === FORM DATA ===
    const formData = {
      cropName: entity.cropName || '',
      w: entity.w || 1,
      h: entity.h || 1,
      areaMeasure: entity.areaMeasure || { value: '', unit: 'm²' },
      geo: entity.geo || null,
      variety: entity.variety || '',
      cropType: entity.cropType || '',
      seedOrigin: entity.seedOrigin || '',
      plantedAt: entity.plantedAt || '',
      harvestAt: entity.harvestAt || '',
      soilType: entity.soilType || '',
      soilPreparation: entity.soilPreparation || '',
      density: entity.density || '',
      expectedYield: entity.expectedYield || '',
      previousCrop: entity.previousCrop || '',
      companionPlants: entity.companionPlants || '',
      irrigation: entity.irrigation || '',
      fertilization: entity.fertilization || '',
      mulching: entity.mulching || '',
      organicPractices: entity.organicPractices || [],
      pests: entity.pests || '',
      challenges: entity.challenges || '',
      notes: entity.notes || ''
    };

    // === HELPER FUNCTIONS ===
    const createFormGroup = (label, input, helper = '') => {
      const group = document.createElement('div');
      group.style.cssText = `
        margin-bottom: 20px;
      `;

      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      labelEl.style.cssText = `
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2e7d32;
        font-size: 14px;
      `;

      const inputContainer = document.createElement('div');
      inputContainer.style.position = 'relative';
      inputContainer.appendChild(input);

      if (helper) {
        const helperText = document.createElement('div');
        helperText.textContent = helper;
        helperText.style.cssText = `
          font-size: 12px;
          color: #757575;
          margin-top: 4px;
          font-style: italic;
        `;
        inputContainer.appendChild(helperText);
      }

      group.appendChild(labelEl);
      group.appendChild(inputContainer);
      return group;
    };

    const createInput = (type, value, placeholder = '', dataKey = '') => {
      const input = document.createElement('input');
      input.type = type;
      input.value = value;
      input.placeholder = placeholder;
      input.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
        box-sizing: border-box;
        font-family: inherit;
      `;
      input.onfocus = () => {
        input.style.borderColor = '#43a047';
        input.style.boxShadow = '0 0 0 3px rgba(67, 160, 71, 0.1)';
      };
      input.onblur = () => {
        input.style.borderColor = '#e0e0e0';
        input.style.boxShadow = 'none';
      };
      if (dataKey) {
        input.oninput = () => {
          if (dataKey.includes('.')) {
            const [parent, child] = dataKey.split('.');
            formData[parent][child] = input.value;
          } else {
            formData[dataKey] = input.value;
          }
        };
      }
      return input;
    };

    const createTextarea = (value, placeholder = '', dataKey = '') => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.placeholder = placeholder;
      textarea.rows = 4;
      textarea.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
        box-sizing: border-box;
        font-family: inherit;
        resize: vertical;
      `;
      textarea.onfocus = () => {
        textarea.style.borderColor = '#43a047';
        textarea.style.boxShadow = '0 0 0 3px rgba(67, 160, 71, 0.1)';
      };
      textarea.onblur = () => {
        textarea.style.borderColor = '#e0e0e0';
        textarea.style.boxShadow = 'none';
      };
      if (dataKey) {
        textarea.oninput = () => {
          formData[dataKey] = textarea.value;
        };
      }
      return textarea;
    };

    const createSelect = (options, value, dataKey = '') => {
      const select = document.createElement('select');
      select.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
        box-sizing: border-box;
        font-family: inherit;
        background: white;
        cursor: pointer;
      `;
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === value) option.selected = true;
        select.appendChild(option);
      });
      select.onfocus = () => {
        select.style.borderColor = '#43a047';
        select.style.boxShadow = '0 0 0 3px rgba(67, 160, 71, 0.1)';
      };
      select.onblur = () => {
        select.style.borderColor = '#e0e0e0';
        select.style.boxShadow = 'none';
      };
      if (dataKey) {
        select.onchange = () => {
          formData[dataKey] = select.value;
        };
      }
      return select;
    };

    // === TAB 0: BÁSICO ===
    const tab0 = document.createElement('div');
    tab0.appendChild(createFormGroup(
      'Nombre del Cultivo',
      createInput('text', formData.cropName, 'Ej: Maíz Amarillo', 'cropName'),
      'Nombre identificativo del cultivo'
    ));

    const sizeRow = document.createElement('div');
    sizeRow.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;';
    
    const wInput = createInput('number', formData.w, '', 'w');
    const hInput = createInput('number', formData.h, '', 'h');
    const areaValueInput = createInput('number', formData.areaMeasure.value, '', 'areaMeasure.value');
    
    sizeRow.appendChild(createFormGroup('Ancho (casillas)', wInput));
    sizeRow.appendChild(createFormGroup('Alto (casillas)', hInput));
    sizeRow.appendChild(createFormGroup('Área Real', areaValueInput));
    tab0.appendChild(sizeRow);

    const unitSelect = createSelect(
      ['m²', 'hectáreas', 'acres', 'pies²'],
      formData.areaMeasure.unit,
      'areaMeasure.unit'
    );
    tab0.appendChild(createFormGroup('Unidad de Medida', unitSelect));

    tabContents.push(tab0);
    content.appendChild(tab0);

    // === TAB 1: UBICACIÓN ===
    const tab1 = document.createElement('div');
    tab1.style.display = 'none';

    const locationInfo = document.createElement('div');
    locationInfo.style.cssText = `
      background: #f0f4f0;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #43a047;
      margin-bottom: 16px;
    `;

    if (formData.geo) {
      locationInfo.innerHTML = `
        <strong style="color: #2e7d32;">📍 Ubicación Actual:</strong><br>
        <span style="font-size: 13px; color: #555;">
          ${formData.geo.display_name || 'Sin dirección'}<br>
          <strong>Coordenadas:</strong> ${formData.geo.lat?.toFixed(6)}, ${formData.geo.lon?.toFixed(6)}
        </span>
      `;
    } else {
      locationInfo.innerHTML = `
        <strong style="color: #757575;">⚠️ Sin ubicación GPS</strong><br>
        <span style="font-size: 13px; color: #757575;">Haz clic en el botón para seleccionar ubicación</span>
      `;
    }

    tab1.appendChild(locationInfo);

    const changeLocationBtn = document.createElement('button');
    changeLocationBtn.textContent = '📍 Cambiar Ubicación en Mapa';
    changeLocationBtn.style.cssText = `
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #2196f3, #42a5f5);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s;
    `;
    changeLocationBtn.onmouseover = () => changeLocationBtn.style.transform = 'translateY(-2px)';
    changeLocationBtn.onmouseout = () => changeLocationBtn.style.transform = 'translateY(0)';
    changeLocationBtn.onclick = async () => {
      // Aquí puedes abrir un mapa para seleccionar ubicación
      alert('Funcionalidad de selección de mapa próximamente');
      // TODO: Implementar selector de mapa
    };

    tab1.appendChild(changeLocationBtn);
    tabContents.push(tab1);
    content.appendChild(tab1);

    // === TAB 2: CULTIVO ===
    const tab2 = document.createElement('div');
    tab2.style.display = 'none';

    tab2.appendChild(createFormGroup(
      'Variedad',
      createInput('text', formData.variety, 'Ej: Híbrido DK390', 'variety'),
      'Variedad específica de la semilla'
    ));

    tab2.appendChild(createFormGroup(
      'Tipo de Cultivo',
      createSelect(
        ['', 'Cereal', 'Legumbre', 'Hortaliza', 'Fruta', 'Tubérculo', 'Oleaginosa', 'Forraje', 'Otro'],
        formData.cropType,
        'cropType'
      )
    ));

    tab2.appendChild(createFormGroup(
      'Origen de Semillas',
      createSelect(
        ['', 'Certificadas', 'Propias', 'Local', 'Importadas', 'Híbridas', 'Orgánicas'],
        formData.seedOrigin,
        'seedOrigin'
      )
    ));

    tabContents.push(tab2);
    content.appendChild(tab2);

    // === TAB 3: FECHAS ===
    const tab3 = document.createElement('div');
    tab3.style.display = 'none';

    tab3.appendChild(createFormGroup(
      'Fecha de Plantado',
      createInput('date', formData.plantedAt, '', 'plantedAt')
    ));

    tab3.appendChild(createFormGroup(
      'Fecha Esperada de Cosecha',
      createInput('date', formData.harvestAt, '', 'harvestAt')
    ));

    // Calcular días restantes
    if (formData.harvestAt) {
      const today = new Date();
      const harvestDate = new Date(formData.harvestAt);
      const daysLeft = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      
      const daysInfo = document.createElement('div');
      daysInfo.style.cssText = `
        background: ${daysLeft > 0 ? '#e8f5e9' : '#fff3e0'};
        padding: 12px;
        border-radius: 8px;
        border-left: 4px solid ${daysLeft > 0 ? '#43a047' : '#ff9800'};
        font-size: 14px;
        color: #555;
      `;
      daysInfo.innerHTML = `
        <strong>${daysLeft > 0 ? '🌱 Días restantes:' : '🌾 Cosecha:'}</strong> 
        ${daysLeft > 0 ? `${daysLeft} días` : 'Lista para cosechar'}
      `;
      tab3.appendChild(daysInfo);
    }

    tabContents.push(tab3);
    content.appendChild(tab3);

    // === TAB 4: SUELO ===
    const tab4 = document.createElement('div');
    tab4.style.display = 'none';

    tab4.appendChild(createFormGroup(
      'Tipo de Suelo',
      createSelect(
        ['', 'Arcilloso', 'Arenoso', 'Franco', 'Franco arcilloso', 'Franco arenoso', 'Limoso', 'Otro'],
        formData.soilType,
        'soilType'
      )
    ));

    tab4.appendChild(createFormGroup(
      'Preparación del Suelo',
      createTextarea(formData.soilPreparation, 'Describe cómo preparaste el suelo...', 'soilPreparation')
    ));

    tabContents.push(tab4);
    content.appendChild(tab4);

    // === TAB 5: SIEMBRA ===
    const tab5 = document.createElement('div');
    tab5.style.display = 'none';

    tab5.appendChild(createFormGroup(
      'Densidad de Siembra',
      createInput('text', formData.density, 'Ej: 70,000 plantas/ha', 'density')
    ));

    tab5.appendChild(createFormGroup(
      'Rendimiento Esperado',
      createInput('text', formData.expectedYield, 'Ej: 10 ton/ha', 'expectedYield')
    ));

    tab5.appendChild(createFormGroup(
      'Cultivo Anterior',
      createInput('text', formData.previousCrop, 'Ej: Soja', 'previousCrop'),
      'Para rotación de cultivos'
    ));

    tab5.appendChild(createFormGroup(
      'Cultivos Asociados',
      createInput('text', formData.companionPlants, 'Ej: Frijol, calabaza', 'companionPlants')
    ));

    tabContents.push(tab5);
    content.appendChild(tab5);

    // === TAB 6: MANEJO ===
    const tab6 = document.createElement('div');
    tab6.style.display = 'none';

    tab6.appendChild(createFormGroup(
      'Sistema de Riego',
      createTextarea(formData.irrigation, 'Describe el sistema de riego...', 'irrigation')
    ));

    tab6.appendChild(createFormGroup(
      'Fertilización',
      createTextarea(formData.fertilization, 'Describe el plan de fertilización...', 'fertilization')
    ));

    tab6.appendChild(createFormGroup(
      'Uso de Cobertura/Mulching',
      createInput('text', formData.mulching, 'Ej: Mulching con rastrojo', 'mulching')
    ));

    // Prácticas orgánicas (checkboxes)
    const practicesGroup = document.createElement('div');
    practicesGroup.style.marginBottom = '20px';
    
    const practicesLabel = document.createElement('label');
    practicesLabel.textContent = 'Prácticas Orgánicas';
    practicesLabel.style.cssText = `
      display: block;
      margin-bottom: 12px;
      font-weight: 600;
      color: #2e7d32;
      font-size: 14px;
    `;
    
    const practicesOptions = ['Rotación de cultivos', 'Compostaje', 'Control biológico de plagas', 'Abono verde'];
    const practicesContainer = document.createElement('div');
    practicesContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    `;
    
    practicesOptions.forEach(practice => {
      const checkLabel = document.createElement('label');
      checkLabel.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: background 0.2s;
      `;
      checkLabel.onmouseover = () => checkLabel.style.background = '#f0f4f0';
      checkLabel.onmouseout = () => checkLabel.style.background = 'transparent';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = formData.organicPractices.includes(practice);
      checkbox.onchange = () => {
        if (checkbox.checked) {
          formData.organicPractices.push(practice);
        } else {
          formData.organicPractices = formData.organicPractices.filter(p => p !== practice);
        }
      };
      
      const text = document.createElement('span');
      text.textContent = practice;
      text.style.fontSize = '14px';
      
      checkLabel.appendChild(checkbox);
      checkLabel.appendChild(text);
      practicesContainer.appendChild(checkLabel);
    });
    
    practicesGroup.appendChild(practicesLabel);
    practicesGroup.appendChild(practicesContainer);
    tab6.appendChild(practicesGroup);

    tabContents.push(tab6);
    content.appendChild(tab6);

    // === TAB 7: NOTAS ===
    const tab7 = document.createElement('div');
    tab7.style.display = 'none';

    tab7.appendChild(createFormGroup(
      'Plagas/Enfermedades',
      createTextarea(formData.pests, 'Describe problemas de plagas o enfermedades...', 'pests')
    ));

    tab7.appendChild(createFormGroup(
      'Desafíos Específicos',
      createTextarea(formData.challenges, 'Describe desafíos o problemas encontrados...', 'challenges')
    ));

    tab7.appendChild(createFormGroup(
      'Notas Adicionales',
      createTextarea(formData.notes, 'Cualquier información adicional...', 'notes')
    ));

    tabContents.push(tab7);
    content.appendChild(tab7);

    // === FOOTER (Botones) ===
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 20px 32px;
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    `;

    const dashboardBtn = document.createElement('button');
    dashboardBtn.textContent = '📊 Dashboard de cultivo';
    dashboardBtn.style.cssText = `
      padding: 12px 24px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s;
    `;
    dashboardBtn.onmouseover = () => {
      dashboardBtn.style.background = '#1976d2';
      dashboardBtn.style.transform = 'translateY(-2px)';
    };
    dashboardBtn.onmouseout = () => {
      dashboardBtn.style.background = '#2196f3';
      dashboardBtn.style.transform = 'translateY(0)';
    };
    dashboardBtn.onclick = () => {
      overlay.remove();
      // Llamar al dashboard (esto ya existe en crop_info_panel.js)
      import('./crop_info_panel.js').then(m => {
        m.showCropInfoPanel(entity);
        // Luego abrir el dashboard desde ahí
        const dashBtn = document.querySelector('button:contains("Dashboard")');
        if (dashBtn) dashBtn.click();
      });
    };

    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = 'display: flex; gap: 12px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      padding: 12px 24px;
      background: #e0e0e0;
      color: #333;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s;
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#bdbdbd';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#e0e0e0';
    cancelBtn.onclick = () => {
      overlay.remove();
      resolve(null);
    };

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓ Guardar Cambios';
    saveBtn.style.cssText = `
      padding: 12px 32px;
      background: linear-gradient(135deg, #43a047, #66bb6a);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
    `;
    saveBtn.onmouseover = () => {
      saveBtn.style.transform = 'translateY(-2px)';
      saveBtn.style.boxShadow = '0 6px 16px rgba(67, 160, 71, 0.4)';
    };
    saveBtn.onmouseout = () => {
      saveBtn.style.transform = 'translateY(0)';
      saveBtn.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.3)';
    };
    saveBtn.onclick = () => {
      overlay.remove();
      resolve(formData);
    };

    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(saveBtn);
    
    footer.appendChild(dashboardBtn);
    footer.appendChild(buttonGroup);

    // === ENSAMBLAJE ===
    panel.appendChild(header);
    panel.appendChild(content);
    panel.appendChild(footer);
    overlay.appendChild(panel);

    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        resolve(null);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Cerrar al hacer clic en overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(null);
      }
    });

    document.body.appendChild(overlay);
  });
}

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
