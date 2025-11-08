/**
 * User Profile Component
 * Creates a comprehensive user profile interface for agricultural management
 */

// User profile data storage
let userProfile = {
  avatar: 'assets/perfil/men_agricultor.jpg', // Default avatar
  personalInfo: {
    firstName: '',
    lastName: '',
    location: '',
    latitude: null,
    longitude: null,
    email: '',
    phone: '',
    dateOfBirth: '',
    farmName: ''
  },
  agricultureInfo: {
    farmerType: 'agricultor', // agricultor, mujer_agricultora, adulto_mayor_agricultor, joven_agricultor
    experience: '',
    farmSize: '',
    mainCrops: '',
    farmingMethod: 'traditional', // traditional, organic, sustainable, hydroponic
    yearsExperience: 0,
    specializations: [],
    certifications: ''
  },
  preferences: {
    language: 'es',
    units: 'metric', // metric, imperial
    notifications: true,
    aiAssistance: 'detailed' // basic, detailed, expert
  },
  farmingGoals: {
    primaryGoal: '', // increase_yield, reduce_costs, go_organic, etc.
    secondaryGoals: [],
    timeline: ''
  }
};

export async function openUserProfile() {
  // Cargar datos primero y esperar a que termine
  await loadUserProfileFromDB();
  
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #2d5a27 0%, #1a3d15 100%);
      border: 3px solid #4a8c3a;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      width: min(95vw, 800px);
      max-height: 90vh;
      overflow-y: auto;
      color: #ffffff;
      font-family: 'Arial', sans-serif;
      position: relative;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #4a8c3a 0%, #2d5a27 100%);
      padding: 20px 30px;
      border-radius: 17px 17px 0 0;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const title = document.createElement('h1');
    title.textContent = '👤 Perfil del Agricultor';
    title.style.cssText = `
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #ffffff;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.2s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 0, 0, 0.3)';
      closeBtn.style.transform = 'scale(1.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      closeBtn.style.transform = 'scale(1)';
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 30px;
      display: grid;
      gap: 25px;
    `;

    // Avatar Section
    const avatarSection = createAvatarSection();
    
    // Personal Info Section
    const personalSection = createPersonalInfoSection();
    
    // Agriculture Info Section
    const agricultureSection = createAgricultureSection();
    
    // Preferences Section
    const preferencesSection = createPreferencesSection();
    
    // Goals Section
    const goalsSection = createGoalsSection();

    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding: 20px 30px;
      border-top: 2px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 0 0 17px 17px;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Guardar Perfil';
    saveBtn.style.cssText = `
      background: linear-gradient(135deg, #4a8c3a 0%, #2d5a27 100%);
      border: 2px solid #4a8c3a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;

    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.transform = 'translateY(-2px)';
      saveBtn.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
    });

    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.transform = 'translateY(0)';
      saveBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    // Assemble content
    content.appendChild(avatarSection);
    content.appendChild(personalSection);
    content.appendChild(agricultureSection);
    content.appendChild(preferencesSection);
    content.appendChild(goalsSection);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Event handlers
    const close = () => {
      // Remove key blocker when closing
      try { document.removeEventListener('keydown', blockMovementKeys, true); } catch(e){}
      document.body.removeChild(overlay);
      resolve(null);
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    saveBtn.addEventListener('click', () => {
      saveUserProfile();
      close();
    });

    // Add capture-phase keydown blocker while profile dialog is open to prevent game movement
    function blockMovementKeys(e) {
      const movementCodes = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
      if (!movementCodes.includes(e.code)) return;
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        // don't preventDefault to allow cursor movement within inputs
      }
    }
    document.addEventListener('keydown', blockMovementKeys, true);
  });
}

function createAvatarSection() {
  const section = createSection('🖼️ Avatar y Foto de Perfil');
  
  const avatarContainer = document.createElement('div');
  avatarContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;

  const avatarImg = document.createElement('img');
  avatarImg.src = userProfile.avatar;
  avatarImg.alt = 'Avatar';
  avatarImg.style.cssText = `
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #4a8c3a;
    object-fit: cover;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  `;

  const avatarInfo = document.createElement('div');
  avatarInfo.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
  `;

  const avatarTitle = document.createElement('h3');
  avatarTitle.textContent = 'Foto de Perfil';
  avatarTitle.style.cssText = `
    margin: 0;
    font-size: 18px;
    color: #87CEEB;
  `;

  const avatarOptions = document.createElement('div');
  avatarOptions.style.cssText = `
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  `;

  const avatarChoices = [
    { name: 'Agricultor', src: 'assets/perfil/men_agricultor.jpg' },
    { name: 'Mujer Agricultora', src: 'assets/perfil/women_agricultor.jpg' },
    { name: 'Agricultor Senior', src: 'assets/perfil/agricultor_senior.jpg' },
    { name: 'Joven Agricultor', src: 'assets/perfil/young_agricultor.jpg' }
  ];

  avatarChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 100px;
    `;

    // Crear miniatura de la imagen
    const miniImg = document.createElement('img');
    miniImg.src = choice.src;
    miniImg.alt = choice.name;
    miniImg.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.3);
    `;

    // Crear label
    const label = document.createElement('span');
    label.textContent = choice.name;
    label.style.cssText = `
      font-size: 11px;
      text-align: center;
      line-height: 1.2;
    `;

    btn.appendChild(miniImg);
    btn.appendChild(label);

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(74, 140, 58, 0.3)';
      btn.style.borderColor = '#4a8c3a';
      btn.style.transform = 'translateY(-2px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255, 255, 255, 0.1)';
      btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      btn.style.transform = 'translateY(0)';
    });

    btn.addEventListener('click', () => {
      userProfile.avatar = choice.src;
      avatarImg.src = choice.src;
      
      // Visual feedback - highlight selected button
      avatarOptions.querySelectorAll('button').forEach(b => {
        b.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        b.style.background = 'rgba(255, 255, 255, 0.1)';
      });
      btn.style.borderColor = '#4a8c3a';
      btn.style.background = 'rgba(74, 140, 58, 0.3)';
    });

    avatarOptions.appendChild(btn);
  });

  avatarInfo.appendChild(avatarTitle);
  avatarInfo.appendChild(avatarOptions);
  avatarContainer.appendChild(avatarImg);
  avatarContainer.appendChild(avatarInfo);
  section.appendChild(avatarContainer);

  return section;
}

function createPersonalInfoSection() {
  const section = createSection('👤 Información Personal');
  
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;

  const fields = [
    { label: 'Nombre', key: 'firstName', type: 'text', placeholder: 'Tu nombre' },
    { label: 'Apellido', key: 'lastName', type: 'text', placeholder: 'Tu apellido' },
    { label: 'Nombre de la Finca', key: 'farmName', type: 'text', placeholder: 'Ej: Finca San José', span: 2 },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'tu@email.com' },
    { label: 'Teléfono', key: 'phone', type: 'tel', placeholder: '+1 234 567 8900' },
    { label: 'Fecha de Nacimiento', key: 'dateOfBirth', type: 'date' }
  ];

  fields.forEach(field => {
    const fieldContainer = document.createElement('div');
    if (field.span === 2) {
      fieldContainer.style.gridColumn = 'span 2';
    }

    const label = document.createElement('label');
    label.textContent = field.label;
    label.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #87CEEB;
      font-size: 14px;
    `;

    const input = document.createElement('input');
    input.type = field.type;
    input.placeholder = field.placeholder || '';
    input.value = userProfile.personalInfo[field.key] || '';
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    `;

    input.addEventListener('focus', () => {
      input.style.borderColor = '#4a8c3a';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    input.addEventListener('input', () => {
      userProfile.personalInfo[field.key] = input.value;
    });

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    grid.appendChild(fieldContainer);
  });

  // Add location field with map picker
  const locationContainer = createLocationFieldWithMap();
  locationContainer.style.gridColumn = 'span 2';
  grid.appendChild(locationContainer);

  section.appendChild(grid);
  return section;
}

function createAgricultureSection() {
  const section = createSection('🌱 Experiencia Agrícola');
  
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: grid;
    gap: 20px;
  `;

  // Farmer Type Selection
  const farmerTypeLabel = document.createElement('label');
  farmerTypeLabel.textContent = 'Tipo de Agricultor';
  farmerTypeLabel.style.cssText = `
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const farmerTypeOptions = document.createElement('div');
  farmerTypeOptions.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  `;

  const farmerTypes = [
    { value: 'agricultor', label: '👨‍🌾 Agricultor' },
    { value: 'mujer_agricultora', label: '👩‍🌾 Mujer Agricultora' },
    { value: 'adulto_mayor_agricultor', label: '🧓 Adulto Mayor' },
    { value: 'joven_agricultor', label: '🧑 Joven Agricultor' }
  ];

  farmerTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = type.label;
    btn.style.cssText = `
      padding: 10px 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: ${userProfile.agricultureInfo.farmerType === type.value ? '#4a8c3a' : 'rgba(0, 0, 0, 0.3)'};
      color: #ffffff;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    `;

    btn.addEventListener('click', () => {
      userProfile.agricultureInfo.farmerType = type.value;
      farmerTypes.forEach((_, index) => {
        const btnElement = farmerTypeOptions.children[index];
        btnElement.style.background = 'rgba(0, 0, 0, 0.3)';
      });
      btn.style.background = '#4a8c3a';
    });

    farmerTypeOptions.appendChild(btn);
  });

  // Experience textarea
  const expLabel = document.createElement('label');
  expLabel.textContent = 'Experiencia en Agricultura';
  expLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const expTextarea = document.createElement('textarea');
  expTextarea.placeholder = 'Describe tu experiencia en agricultura, tipos de cultivos que manejas, técnicas que conoces, etc.';
  expTextarea.value = userProfile.agricultureInfo.experience || '';
  expTextarea.rows = 4;
  expTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.2s ease;
  `;

  expTextarea.addEventListener('focus', () => {
    expTextarea.style.borderColor = '#4a8c3a';
  });

  expTextarea.addEventListener('blur', () => {
    expTextarea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });

  expTextarea.addEventListener('input', () => {
    userProfile.agricultureInfo.experience = expTextarea.value;
  });

  // Grid for other fields
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  `;

  const agricultureFields = [
    { label: 'Tamaño de la Finca', key: 'farmSize', type: 'text', placeholder: 'Ej: 5 hectáreas' },
    { label: 'Años de Experiencia', key: 'yearsExperience', type: 'number', placeholder: '0' },
    { label: 'Cultivos Principales', key: 'mainCrops', type: 'text', placeholder: 'Ej: Maíz, Tomate, Frijoles', span: 2 },
    { label: 'Certificaciones', key: 'certifications', type: 'text', placeholder: 'Ej: Orgánico, BPA, etc.', span: 2 }
  ];

  agricultureFields.forEach(field => {
    const fieldContainer = document.createElement('div');
    if (field.span === 2) {
      fieldContainer.style.gridColumn = 'span 2';
    }

    const label = document.createElement('label');
    label.textContent = field.label;
    label.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #87CEEB;
      font-size: 14px;
    `;

    const input = document.createElement('input');
    input.type = field.type;
    input.placeholder = field.placeholder || '';
    input.value = userProfile.agricultureInfo[field.key] || '';
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    `;

    input.addEventListener('focus', () => {
      input.style.borderColor = '#4a8c3a';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    input.addEventListener('input', () => {
      userProfile.agricultureInfo[field.key] = input.value;
    });

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    grid.appendChild(fieldContainer);
  });

  // Farming method selection
  const methodContainer = document.createElement('div');
  methodContainer.style.gridColumn = 'span 2';

  const methodLabel = document.createElement('label');
  methodLabel.textContent = 'Método de Agricultura';
  methodLabel.style.cssText = `
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const methodOptions = document.createElement('div');
  methodOptions.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `;

  const methods = [
    { value: 'traditional', label: '🌾 Tradicional' },
    { value: 'organic', label: '🌿 Orgánico' },
    { value: 'sustainable', label: '♻️ Sostenible' },
    { value: 'hydroponic', label: '💧 Hidropónico' }
  ];

  methods.forEach(method => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = method.label;
    btn.style.cssText = `
      padding: 10px 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: ${userProfile.agricultureInfo.farmingMethod === method.value ? '#4a8c3a' : 'rgba(0, 0, 0, 0.3)'};
      color: #ffffff;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    `;

    btn.addEventListener('click', () => {
      userProfile.agricultureInfo.farmingMethod = method.value;
      methods.forEach((_, index) => {
        const btnElement = methodOptions.children[index];
        btnElement.style.background = 'rgba(0, 0, 0, 0.3)';
      });
      btn.style.background = '#4a8c3a';
    });

    methodOptions.appendChild(btn);
  });

  methodContainer.appendChild(methodLabel);
  methodContainer.appendChild(methodOptions);
  grid.appendChild(methodContainer);

  container.appendChild(farmerTypeLabel);
  container.appendChild(farmerTypeOptions);
  container.appendChild(expLabel);
  container.appendChild(expTextarea);
  container.appendChild(grid);
  section.appendChild(container);

  return section;
}

function createPreferencesSection() {
  const section = createSection('⚙️ Preferencias del Sistema');
  
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  `;

  // AI Assistance Level
  const aiContainer = document.createElement('div');
  aiContainer.style.gridColumn = 'span 2';

  const aiLabel = document.createElement('label');
  aiLabel.textContent = 'Nivel de Asistencia IA';
  aiLabel.style.cssText = `
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const aiOptions = document.createElement('div');
  aiOptions.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `;

  const aiLevels = [
    { value: 'basic', label: '📝 Básico', desc: 'Respuestas simples y directas' },
    { value: 'detailed', label: '📊 Detallado', desc: 'Explicaciones completas y contextuales' },
    { value: 'expert', label: '🎓 Experto', desc: 'Análisis avanzado y recomendaciones técnicas' }
  ];

  aiLevels.forEach(level => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${level.label}</div>
      <div style="font-size: 12px; opacity: 0.8;">${level.desc}</div>
    `;
    btn.style.cssText = `
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: ${userProfile.preferences.aiAssistance === level.value ? '#4a8c3a' : 'rgba(0, 0, 0, 0.3)'};
      color: #ffffff;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      text-align: center;
      flex: 1;
      min-width: 200px;
    `;

    btn.addEventListener('click', () => {
      userProfile.preferences.aiAssistance = level.value;
      aiLevels.forEach((_, index) => {
        const btnElement = aiOptions.children[index];
        btnElement.style.background = 'rgba(0, 0, 0, 0.3)';
      });
      btn.style.background = '#4a8c3a';
    });

    aiOptions.appendChild(btn);
  });

  aiContainer.appendChild(aiLabel);
  aiContainer.appendChild(aiOptions);
  container.appendChild(aiContainer);

  section.appendChild(container);
  return section;
}

function createGoalsSection() {
  const section = createSection('🎯 Objetivos Agrícolas');
  
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: grid;
    gap: 20px;
  `;

  // Primary goal
  const goalLabel = document.createElement('label');
  goalLabel.textContent = 'Objetivo Principal';
  goalLabel.style.cssText = `
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const goalSelect = document.createElement('select');
  goalSelect.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
  `;

  const goals = [
    { value: '', label: 'Selecciona tu objetivo principal' },
    { value: 'increase_yield', label: '📈 Aumentar el rendimiento de cultivos' },
    { value: 'reduce_costs', label: '💰 Reducir costos de producción' },
    { value: 'go_organic', label: '🌿 Transición a agricultura orgánica' },
    { value: 'water_efficiency', label: '💧 Mejorar eficiencia del agua' },
    { value: 'pest_control', label: '🐛 Mejor control de plagas' },
    { value: 'soil_health', label: '🌱 Mejorar salud del suelo' },
    { value: 'expand_farm', label: '🚜 Expandir operaciones agrícolas' }
  ];

  goals.forEach(goal => {
    const option = document.createElement('option');
    option.value = goal.value;
    option.textContent = goal.label;
    option.selected = userProfile.farmingGoals.primaryGoal === goal.value;
    goalSelect.appendChild(option);
  });

  goalSelect.addEventListener('change', () => {
    userProfile.farmingGoals.primaryGoal = goalSelect.value;
  });

  // Timeline
  const timelineLabel = document.createElement('label');
  timelineLabel.textContent = 'Plazo para alcanzar objetivos';
  timelineLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const timelineInput = document.createElement('input');
  timelineInput.type = 'text';
  timelineInput.placeholder = 'Ej: 6 meses, 1 año, 2 temporadas...';
  timelineInput.value = userProfile.farmingGoals.timeline || '';
  timelineInput.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
  `;

  timelineInput.addEventListener('input', () => {
    userProfile.farmingGoals.timeline = timelineInput.value;
  });

  container.appendChild(goalLabel);
  container.appendChild(goalSelect);
  container.appendChild(timelineLabel);
  container.appendChild(timelineInput);
  section.appendChild(container);

  return section;
}

function createSection(title) {
  const section = document.createElement('div');
  section.style.cssText = `
    display: grid;
    gap: 15px;
  `;

  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = title;
  sectionTitle.style.cssText = `
    margin: 0;
    font-size: 20px;
    font-weight: bold;
    color: #87CEEB;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(135, 206, 235, 0.3);
  `;

  section.appendChild(sectionTitle);
  return section;
}

function saveUserProfile() {
  // Save to localStorage (backup local)
  localStorage.setItem('farmGameUserProfile', JSON.stringify(userProfile));
  
  // Obtener user_id de la sesión
  const userId = window.getAgroVerseUserId();
  
  if (!userId) {
    showMessage('⚠️ No hay sesión activa. Datos guardados solo localmente.', 'warning');
    console.warn('[USER PROFILE] No user_id found. Skipping database save.');
    return;
  }
  
  // Preparar datos para la API (mapear estructura del perfil a tabla usuarios)
  const userData = {
    // NO incluir user_id aquí para POST, se maneja en la ruta
    avatar: userProfile.avatar || null,
    nombre: userProfile.personalInfo.firstName || null,
    apellido: userProfile.personalInfo.lastName || null,
    nombre_finca: userProfile.personalInfo.farmName || null,
    email: userProfile.personalInfo.email || null,
    telefono: userProfile.personalInfo.phone || null,
    fecha_nacimiento: userProfile.personalInfo.dateOfBirth || null,
    ubicacion_texto: userProfile.personalInfo.location || null,
    latitud: userProfile.personalInfo.latitude || null,
    longitud: userProfile.personalInfo.longitude || null,
    tipo_agricultor: userProfile.agricultureInfo.farmerType || 'agricultor',
    experiencia_agricola: userProfile.agricultureInfo.experience || null,
    tamano_finca: userProfile.agricultureInfo.farmSize || null,
    cultivos_principales: userProfile.agricultureInfo.mainCrops || null,
    metodo_agricola: userProfile.agricultureInfo.farmingMethod || 'traditional',
    anos_experiencia: parseInt(userProfile.agricultureInfo.yearsExperience) || 0,
    especializaciones: JSON.stringify(userProfile.agricultureInfo.specializations || []),
    certificaciones: userProfile.agricultureInfo.certifications || null,
    idioma: userProfile.preferences.language || 'es',
    unidades: userProfile.preferences.units || 'metric',
    notificaciones: userProfile.preferences.notifications ? 'true' : 'false',
    nivel_asistencia_ia: userProfile.preferences.aiAssistance || 'detailed',
    objetivo_principal: userProfile.farmingGoals.primaryGoal || null,
    objetivos_secundarios: JSON.stringify(userProfile.farmingGoals.secondaryGoals || []),
    plazo_objetivo: userProfile.farmingGoals.timeline || null
  };
  
  // Mostrar loader
  showMessage('💾 Guardando en base de datos...', 'info');
  
  // Obtener la URL de la API
  const API_URL = window.location.hostname === 'localhost' 
    ? '/api' 
    : (import.meta?.env?.VITE_API_URL || '/api');
  
  // Primero verificar si el usuario existe
  fetch(`${API_URL}/usuarios/${userId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
      'ngrok-skip-browser-warning': 'true'
    }
  })
  .then(response => response.json())
  .then(checkData => {
    // Decidir si hacer POST (crear) o PUT (actualizar)
    const method = checkData.success && checkData.data ? 'PUT' : 'POST';
    const endpoint = method === 'PUT' ? `${API_URL}/usuarios/${userId}` : `${API_URL}/usuarios`;
    
    // Si es POST, agregar user_id al body
    const bodyData = method === 'POST' 
      ? { user_id: userId, ...userData }
      : userData;
    
    console.log(`[USER PROFILE] ${method === 'POST' ? 'Creando' : 'Actualizando'} usuario en base de datos...`);
    console.log(`[USER PROFILE] user_id:`, userId);
    
    // Enviar a la API
    return fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(bodyData)
    });
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showMessage('✅ Perfil guardado exitosamente en la base de datos', 'success');
      console.log('[USER PROFILE] Saved to database:', data);
    } else {
      showMessage('⚠️ Error al guardar: ' + (data.error || 'Error desconocido'), 'error');
      console.error('[USER PROFILE] Save error:', data);
    }
  })
  .catch(error => {
    showMessage('⚠️ Error de conexión. Datos guardados localmente.', 'warning');
    console.error('[USER PROFILE] Network error:', error);
  });
  
  console.log('[USER PROFILE] Saved locally:', userProfile);
}

function loadUserProfileSync() {
  // Solo cargar desde localStorage como fallback inmediato
  try {
    const saved = localStorage.getItem('farmGameUserProfile');
    if (saved) {
      const parsed = JSON.parse(saved);
      userProfile = { ...userProfile, ...parsed };
      console.log('[USER PROFILE] Loaded from localStorage');
    }
  } catch (error) {
    console.warn('[USER PROFILE] Error loading from localStorage:', error);
  }
}

async function loadUserProfileFromDB() {
  // Primero cargar localStorage como fallback
  loadUserProfileSync();
  
  // Luego cargar desde la base de datos
  const userId = window.getAgroVerseUserId();
  
  if (!userId) {
    console.log('[USER PROFILE] No user_id found, using only localStorage data');
    return;
  }
  
  const API_URL = window.location.hostname === 'localhost' 
    ? '/api' 
    : (import.meta?.env?.VITE_API_URL || '/api');
  
  try {
    // Cargar datos del usuario desde la API
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('agroverse_token') || ''}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      const dbUser = data.data;
      
      // Mapear datos de la BD al objeto userProfile
      userProfile.avatar = dbUser.avatar || userProfile.avatar;
      userProfile.personalInfo.firstName = dbUser.nombre || '';
      userProfile.personalInfo.lastName = dbUser.apellido || '';
      userProfile.personalInfo.farmName = dbUser.nombre_finca || '';
      userProfile.personalInfo.location = dbUser.ubicacion_texto || '';
      userProfile.personalInfo.latitude = dbUser.latitud;
      userProfile.personalInfo.longitude = dbUser.longitud;
      userProfile.personalInfo.email = dbUser.email || '';
      userProfile.personalInfo.phone = dbUser.telefono || '';
      userProfile.personalInfo.dateOfBirth = dbUser.fecha_nacimiento || '';
      
      userProfile.agricultureInfo.farmerType = dbUser.tipo_agricultor || 'agricultor';
      userProfile.agricultureInfo.experience = dbUser.experiencia_agricola || '';
      userProfile.agricultureInfo.farmSize = dbUser.tamano_finca || '';
      userProfile.agricultureInfo.mainCrops = dbUser.cultivos_principales || '';
      userProfile.agricultureInfo.farmingMethod = dbUser.metodo_agricola || 'traditional';
      userProfile.agricultureInfo.yearsExperience = dbUser.anos_experiencia || 0;
      userProfile.agricultureInfo.specializations = typeof dbUser.especializaciones === 'string' 
        ? JSON.parse(dbUser.especializaciones || '[]') 
        : (dbUser.especializaciones || []);
      userProfile.agricultureInfo.certifications = dbUser.certificaciones || '';
      
      userProfile.preferences.language = dbUser.idioma || 'es';
      userProfile.preferences.units = dbUser.unidades || 'metric';
      userProfile.preferences.notifications = dbUser.notificaciones === 'true';
      userProfile.preferences.aiAssistance = dbUser.nivel_asistencia_ia || 'detailed';
      
      userProfile.farmingGoals.primaryGoal = dbUser.objetivo_principal || '';
      userProfile.farmingGoals.secondaryGoals = typeof dbUser.objetivos_secundarios === 'string'
        ? JSON.parse(dbUser.objetivos_secundarios || '[]')
        : (dbUser.objetivos_secundarios || []);
      userProfile.farmingGoals.timeline = dbUser.plazo_objetivo || '';
      
      // Guardar en localStorage como backup
      localStorage.setItem('farmGameUserProfile', JSON.stringify(userProfile));
      
      console.log('[USER PROFILE] ✅ Loaded from database:', dbUser);
    } else {
      console.log('[USER PROFILE] No data in database, using localStorage');
    }
  } catch (error) {
    console.warn('[USER PROFILE] Error loading from database:', error);
    console.log('[USER PROFILE] Using localStorage data as fallback');
  }
}

function showMessage(message, type = 'info') {
  const colors = {
    success: { bg: '#4a8c3a', border: '#6fb36a' },
    error: { bg: '#c93a3a', border: '#ff6b6b' },
    warning: { bg: '#d4a017', border: '#ffcc00' },
    info: { bg: '#2d5a27', border: '#4a8c3a' }
  };
  
  const colorScheme = colors[type] || colors.info;
  
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colorScheme.bg};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: bold;
    border: 2px solid ${colorScheme.border};
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      messageDiv.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(messageDiv)) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }
  }, 3000);
}

// Export user profile for AI context
export async function getUserProfile() {
  await loadUserProfileFromDB();
  return userProfile;
}

// Export function to update AI chat context
export function getAIContext() {
  const profile = getUserProfile();
  
  return {
    userInfo: {
      name: `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.trim() || 'Usuario',
      farmName: profile.personalInfo.farmName || 'Su finca',
      location: profile.personalInfo.location || 'Ubicación no especificada',
      experience: profile.agricultureInfo.yearsExperience || 0,
      farmSize: profile.agricultureInfo.farmSize || 'No especificado',
      mainCrops: profile.agricultureInfo.mainCrops || 'Cultivos variados',
      farmingMethod: profile.agricultureInfo.farmingMethod || 'traditional',
      primaryGoal: profile.farmingGoals.primaryGoal || 'general_improvement',
      aiAssistanceLevel: profile.preferences.aiAssistance || 'detailed'
    },
    personalizedGreeting: generatePersonalizedGreeting(profile)
  };
}

function generatePersonalizedGreeting(profile) {
  const name = profile.personalInfo.firstName || 'Agricultor';
  const farmName = profile.personalInfo.farmName;
  const experience = profile.agricultureInfo.yearsExperience;
  
  let greeting = `¡Hola ${name}!`;
  
  if (farmName) {
    greeting += ` Es un placer ayudarte con ${farmName}.`;
  }
  
  if (experience > 0) {
    if (experience < 2) {
      greeting += ` Veo que estás comenzando en la agricultura, estaré aquí para guiarte.`;
    } else if (experience < 10) {
      greeting += ` Con ${experience} años de experiencia, seguro tienes buenas bases. Estoy aquí para ayudarte a mejorar.`;
    } else {
      greeting += ` Con ${experience} años de experiencia, eres todo un experto. Será genial intercambiar conocimientos contigo.`;
    }
  }
  
  return greeting;
}

// ============================================================
// LOCATION FIELD WITH MAP PICKER
// ============================================================

/**
 * Creates location field with map picker button
 */
function createLocationFieldWithMap() {
  const fieldContainer = document.createElement('div');
  fieldContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 6px;
  `;

  const label = document.createElement('label');
  label.textContent = '📍 Ubicación de la Finca';
  label.style.cssText = `
    display: block;
    font-weight: 600;
    color: #87CEEB;
    font-size: 14px;
  `;

  const inputRow = document.createElement('div');
  inputRow.style.cssText = `
    display: flex;
    gap: 10px;
  `;

  const locationInput = document.createElement('input');
  locationInput.type = 'text';
  locationInput.placeholder = 'Ciudad, región, país';
  locationInput.value = userProfile.personalInfo.location || '';
  locationInput.style.cssText = `
    flex: 1;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
  `;

  locationInput.addEventListener('focus', () => {
    locationInput.style.borderColor = '#4a8c3a';
  });

  locationInput.addEventListener('blur', () => {
    locationInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });

  locationInput.addEventListener('input', () => {
    userProfile.personalInfo.location = locationInput.value;
  });

  const mapBtn = document.createElement('button');
  mapBtn.innerHTML = '🗺️ Seleccionar en Mapa';
  mapBtn.type = 'button';
  mapBtn.style.cssText = `
    padding: 12px 20px;
    background: linear-gradient(135deg, #4a8c3a 0%, #2d5a27 100%);
    border: 2px solid #4a8c3a;
    color: #ffffff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
  `;

  mapBtn.addEventListener('mouseenter', () => {
    mapBtn.style.transform = 'translateY(-2px)';
    mapBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  });

  mapBtn.addEventListener('mouseleave', () => {
    mapBtn.style.transform = 'translateY(0)';
    mapBtn.style.boxShadow = 'none';
  });

  mapBtn.addEventListener('click', async () => {
    try {
      const result = await openMapPicker();
      if (result) {
        // Update location with address from geocoding
        const displayLocation = result.display_name || `${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`;
        locationInput.value = displayLocation;
        userProfile.personalInfo.location = displayLocation;
        
        // Store coordinates separately
        userProfile.personalInfo.latitude = result.lat;
        userProfile.personalInfo.longitude = result.lon;
        
        // Show success message
        showMessage('📍 Ubicación seleccionada correctamente', 'success');
      }
    } catch (error) {
      console.error('[MAP PICKER] Error:', error);
      showMessage('❌ Error al abrir el mapa', 'error');
    }
  });

  inputRow.appendChild(locationInput);
  inputRow.appendChild(mapBtn);

  fieldContainer.appendChild(label);
  fieldContainer.appendChild(inputRow);

  // Show coordinates if available (verificar que sean números válidos)
  if (userProfile.personalInfo.latitude != null && 
      userProfile.personalInfo.longitude != null &&
      !isNaN(userProfile.personalInfo.latitude) &&
      !isNaN(userProfile.personalInfo.longitude)) {
    const coordsInfo = document.createElement('div');
    coordsInfo.style.cssText = `
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 4px;
    `;
    const lat = Number(userProfile.personalInfo.latitude).toFixed(4);
    const lon = Number(userProfile.personalInfo.longitude).toFixed(4);
    coordsInfo.textContent = `Coordenadas: ${lat}, ${lon}`;
    fieldContainer.appendChild(coordsInfo);
  }

  return fieldContainer;
}

/**
 * Ensures Leaflet library is loaded
 */
async function ensureLeaflet() {
  if (window.L) return true;
  
  // Load CSS
  const cssId = 'leaflet-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  
  // Load JS
  await new Promise((resolve) => {
    const jsId = 'leaflet-js';
    if (document.getElementById(jsId)) return resolve();
    const script = document.createElement('script');
    script.id = jsId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    document.body.appendChild(script);
  });
  
  return true;
}

/**
 * Reverse geocode coordinates to get address
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    return { 
      lat, 
      lon, 
      address: data.address || {}, 
      display_name: data.display_name 
    };
  } catch (error) {
    console.warn('[GEOCODING] Error:', error);
    return { lat, lon };
  }
}

/**
 * Opens interactive map picker dialog
 */
async function openMapPicker() {
  await ensureLeaflet();
  
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    // Prevent keyboard events from propagating
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });

    const box = document.createElement('div');
    box.style.cssText = `
      background: linear-gradient(135deg, #2d5a27 0%, #1a3d15 100%);
      color: #fff;
      border: 4px solid #4a8c3a;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      padding: 20px;
      width: min(90vw, 800px);
      height: min(80vh, 600px);
      display: flex;
      flex-direction: column;
      gap: 15px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = '🗺️ Selecciona la ubicación de tu finca';
    title.style.cssText = `
      margin: 0;
      font-size: 20px;
      color: #cdeaa9;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #ffffff;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.2s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 0, 0, 0.3)';
      closeBtn.style.transform = 'scale(1.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      closeBtn.style.transform = 'scale(1)';
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const instructions = document.createElement('div');
    instructions.textContent = 'Haz clic en el mapa para seleccionar la ubicación de tu finca';
    instructions.style.cssText = `
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border-left: 4px solid #4a8c3a;
    `;

    const mapDiv = document.createElement('div');
    mapDiv.id = 'user-profile-map-picker-' + Date.now();
    mapDiv.style.cssText = `
      flex: 1;
      min-height: 400px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;

    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
    `;

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = '✓ Aceptar Ubicación';
    acceptBtn.disabled = true;
    acceptBtn.style.cssText = `
      background: linear-gradient(135deg, #4a8c3a 0%, #2d5a27 100%);
      border: 2px solid #4a8c3a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      opacity: 0.5;
    `;

    actions.appendChild(cancelBtn);
    actions.appendChild(acceptBtn);

    box.appendChild(header);
    box.appendChild(instructions);
    box.appendChild(mapDiv);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Initialize Leaflet map
    setTimeout(() => {
      // Default center - try to use user's current location or Peru center
      let defaultCenter = [-9.19, -75.0152]; // Peru center
      let defaultZoom = 5;

      // Try to use existing coordinates if available (verificar que sean números válidos)
      const hasValidCoordsForMap = userProfile.personalInfo.latitude != null && 
                                   userProfile.personalInfo.longitude != null &&
                                   !isNaN(userProfile.personalInfo.latitude) &&
                                   !isNaN(userProfile.personalInfo.longitude);
      
      if (hasValidCoordsForMap) {
        defaultCenter = [
          Number(userProfile.personalInfo.latitude), 
          Number(userProfile.personalInfo.longitude)
        ];
        defaultZoom = 13;
      }

      const map = L.map(mapDiv).setView(defaultCenter, defaultZoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      let marker = null;
      let selectedLocation = null;

      // Add existing marker if coordinates available (verificar que sean números válidos)
      const hasValidCoordsForMarker = userProfile.personalInfo.latitude != null && 
                                      userProfile.personalInfo.longitude != null &&
                                      !isNaN(userProfile.personalInfo.latitude) &&
                                      !isNaN(userProfile.personalInfo.longitude);
      
      if (hasValidCoordsForMarker) {
        marker = L.marker(defaultCenter).addTo(map);
        selectedLocation = {
          lat: Number(userProfile.personalInfo.latitude),
          lon: Number(userProfile.personalInfo.longitude),
          display_name: userProfile.personalInfo.location
        };
        acceptBtn.disabled = false;
        acceptBtn.style.opacity = '1';
      }

      const pickLocation = async (latlng) => {
        // Remove previous marker
        if (marker) {
          marker.remove();
        }

        // Add new marker
        marker = L.marker(latlng).addTo(map);

        // Get address from coordinates
        selectedLocation = await reverseGeocode(latlng.lat, latlng.lng);

        // Enable accept button
        acceptBtn.disabled = false;
        acceptBtn.style.opacity = '1';

        // Update instructions
        if (selectedLocation.display_name) {
          instructions.innerHTML = `<strong>📍 Ubicación seleccionada:</strong> ${selectedLocation.display_name}`;
        } else {
          instructions.innerHTML = `<strong>📍 Coordenadas:</strong> ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        }
      };

      // Click event to select location
      map.on('click', (e) => {
        pickLocation(e.latlng);
      });

      // Try to get user's current location
      if (navigator.geolocation && !hasValidCoordsForMarker) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 13);
            
            // Add temporary marker
            const tempMarker = L.marker(userLocation).addTo(map);
            tempMarker.bindPopup('📍 Tu ubicación actual (haz clic en el mapa para confirmar o cambiar)').openPopup();
          },
          (error) => {
            console.warn('[GEOLOCATION] Error getting user location:', error);
          }
        );
      }

      // Event handlers
      const close = () => {
        overlay.remove();
        resolve(null);
      };

      closeBtn.addEventListener('click', close);
      cancelBtn.addEventListener('click', close);

      acceptBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(selectedLocation);
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
    }, 100); // Small delay to ensure DOM is ready
  });
}