// Dialog to capture farmer knowledge for Biblioteca
export function promptLibraryInfo({ title = 'Biblioteca del Agricultor - Conocimiento y Habilidades', initial = null } = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('library-dialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'library-dialog';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: grid;
      place-items: center;
      z-index: 10000;
      padding: 20px;
      overflow-y: auto;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      width: min(95vw, 900px);
      max-height: 90vh;
      overflow-y: auto;
      background: linear-gradient(135deg, #2b2941 0%, #1a1625 100%);
      border: 4px solid #6a5acd;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      color: #fff;
      font-family: 'Arial', sans-serif;
      padding: 0;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #6a5acd 0%, #5243aa 100%);
      padding: 20px 30px;
      border-radius: 12px 12px 0 0;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const h1 = document.createElement('h2');
    h1.innerHTML = '📚 ' + title;
    h1.style.cssText = `
      margin: 0;
      font-size: 22px;
      font-weight: bold;
      color: #e8eaf6;
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

    header.appendChild(h1);
    header.appendChild(closeBtn);

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 30px;
      display: grid;
      gap: 25px;
    `;

    // Helper functions
    const createSection = (titleText) => {
      const section = document.createElement('div');
      section.style.cssText = `
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
      
      const title = document.createElement('h3');
      title.textContent = titleText;
      title.style.cssText = `
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #c5cae9;
        border-bottom: 2px solid rgba(106, 90, 205, 0.5);
        padding-bottom: 10px;
      `;
      
      section.appendChild(title);
      return section;
    };

    const makeLabel = (text) => {
      const label = document.createElement('label');
      label.textContent = text;
      label.style.cssText = `
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #e8eaf6;
        font-size: 14px;
      `;
      return label;
    };

    const makeInput = (placeholder = '', type = 'text') => {
      const input = document.createElement('input');
      input.type = type;
      input.placeholder = placeholder;
      input.style.cssText = `
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      `;
      input.addEventListener('focus', () => input.style.borderColor = '#6a5acd');
      input.addEventListener('blur', () => input.style.borderColor = 'rgba(255, 255, 255, 0.2)');
      return input;
    };

    const makeTextarea = (placeholder = '', rows = 4) => {
      const textarea = document.createElement('textarea');
      textarea.placeholder = placeholder;
      textarea.rows = rows;
      textarea.style.cssText = `
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        resize: vertical;
        font-family: inherit;
        transition: border-color 0.2s ease;
      `;
      textarea.addEventListener('focus', () => textarea.style.borderColor = '#6a5acd');
      textarea.addEventListener('blur', () => textarea.style.borderColor = 'rgba(255, 255, 255, 0.2)');
      return textarea;
    };

    const makeSelect = (options = []) => {
      const select = document.createElement('select');
      select.style.cssText = `
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        cursor: pointer;
        transition: border-color 0.2s ease;
      `;
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      select.addEventListener('focus', () => select.style.borderColor = '#6a5acd');
      select.addEventListener('blur', () => select.style.borderColor = 'rgba(255, 255, 255, 0.2)');
      return select;
    };

    // ========================================
    // SECCIÓN 1: INFORMACIÓN BÁSICA
    // ========================================
    const basicSection = createSection('👤 Información Básica del Conocimiento');
    
    const basicGrid = document.createElement('div');
    basicGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    `;

    // Nivel de experiencia
    const levelContainer = document.createElement('div');
    levelContainer.appendChild(makeLabel('Nivel de experiencia general'));
    const levelSelect = makeSelect(['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Maestro']);
    if (initial?.level) levelSelect.value = initial.level;
    levelContainer.appendChild(levelSelect);

    // Años de experiencia
    const yearsContainer = document.createElement('div');
    yearsContainer.appendChild(makeLabel('Años de experiencia en agricultura'));
    const yearsInput = makeInput('Ej: 10', 'number');
    yearsInput.min = '0';
    yearsInput.max = '100';
    if (initial?.yearsExperience) yearsInput.value = initial.yearsExperience;
    yearsContainer.appendChild(yearsInput);

    basicGrid.appendChild(levelContainer);
    basicGrid.appendChild(yearsContainer);

    // Tipo de formación
    const educationContainer = document.createElement('div');
    educationContainer.style.gridColumn = 'span 2';
    educationContainer.appendChild(makeLabel('Tipo de formación agrícola'));
    const educationSelect = makeSelect([
      'Autodidacta (aprendizaje propio)',
      'Familiar (transmitido por generaciones)',
      'Cursos y talleres',
      'Técnico agrícola',
      'Ingeniero agrónomo',
      'Postgrado en agricultura',
      'Otros'
    ]);
    if (initial?.education) educationSelect.value = initial.education;
    educationContainer.appendChild(educationSelect);
    basicGrid.appendChild(educationContainer);

    basicSection.appendChild(basicGrid);

    // ========================================
    // SECCIÓN 2: IDIOMAS Y COMUNICACIÓN
    // ========================================
    const languageSection = createSection('🌍 Idiomas y Comunicación');
    
    const languageGrid = document.createElement('div');
    languageGrid.style.cssText = `
      display: grid;
      gap: 15px;
    `;

    // Idioma nativo
    const nativeLangContainer = document.createElement('div');
    nativeLangContainer.appendChild(makeLabel('Idioma nativo / materno'));
    const nativeLangInput = makeInput('Ej: Español, Quechua, Aymara, etc.');
    if (initial?.nativeLanguage) nativeLangInput.value = initial.nativeLanguage;
    nativeLangContainer.appendChild(nativeLangInput);

    // Otros idiomas
    const otherLangsContainer = document.createElement('div');
    otherLangsContainer.appendChild(makeLabel('Otros idiomas que domina (separados por comas)'));
    const otherLangsInput = makeInput('Ej: Inglés, Portugués');
    if (initial?.otherLanguages) otherLangsInput.value = initial.otherLanguages;
    otherLangsContainer.appendChild(otherLangsInput);

    // Nivel de lectura/escritura
    const literacyContainer = document.createElement('div');
    literacyContainer.appendChild(makeLabel('Nivel de lectura y escritura'));
    const literacySelect = makeSelect([
      'Básico',
      'Intermedio',
      'Avanzado',
      'Nativo/Fluido'
    ]);
    if (initial?.literacy) literacySelect.value = initial.literacy;
    literacyContainer.appendChild(literacySelect);

    // Acceso a tecnología
    const techAccessContainer = document.createElement('div');
    techAccessContainer.appendChild(makeLabel('Acceso a tecnología'));
    const techAccessChecks = document.createElement('div');
    techAccessChecks.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 8px;
    `;

    const techOptions = ['Teléfono móvil', 'Smartphone', 'Computadora', 'Internet', 'Radio', 'Televisión'];
    const techAccessCheckboxes = [];
    techOptions.forEach(option => {
      const label = document.createElement('label');
      label.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      `;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      checkbox.style.cursor = 'pointer';
      if (initial?.techAccess && initial.techAccess.includes(option)) {
        checkbox.checked = true;
      }
      const span = document.createElement('span');
      span.textContent = option;
      span.style.fontSize = '13px';
      label.appendChild(checkbox);
      label.appendChild(span);
      techAccessChecks.appendChild(label);
      techAccessCheckboxes.push(checkbox);
    });

    techAccessContainer.appendChild(techAccessChecks);

    languageGrid.appendChild(nativeLangContainer);
    languageGrid.appendChild(otherLangsContainer);
    languageGrid.appendChild(literacyContainer);
    languageGrid.appendChild(techAccessContainer);
    languageSection.appendChild(languageGrid);

    // ========================================
    // SECCIÓN 3: TÉCNICAS Y PRÁCTICAS AGRÍCOLAS
    // ========================================
    const techniquesSection = createSection('🌱 Técnicas y Prácticas Agrícolas');

    const techLabel = document.createElement('div');
    techLabel.style.cssText = `
      font-weight: 600;
      color: #e8eaf6;
      font-size: 14px;
      margin-bottom: 12px;
    `;
    techLabel.textContent = 'Selecciona las técnicas que conoces y practicas:';

    const techGrid = document.createElement('div');
    techGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin-bottom: 15px;
    `;

    const techniques = [
      'Riego por goteo',
      'Riego por aspersión',
      'Riego tradicional por inundación',
      'Rotación de cultivos',
      'Cultivos asociados',
      'Cobertura vegetal (mulching)',
      'Labranza mínima',
      'Labranza cero',
      'Compostaje',
      'Fertirriego',
      'Agricultura orgánica',
      'Manejo integrado de plagas (MIP)',
      'Control biológico',
      'Siembra directa',
      'Terrazas agrícolas',
      'Agroforestería',
      'Hidroponía',
      'Agricultura de conservación'
    ];

    const techCheckboxes = [];
    techniques.forEach(tech => {
      const label = document.createElement('label');
      label.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s ease;
      `;
      label.addEventListener('mouseenter', () => {
        label.style.background = 'rgba(106, 90, 205, 0.2)';
      });
      label.addEventListener('mouseleave', () => {
        label.style.background = 'rgba(0, 0, 0, 0.2)';
      });

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tech;
      checkbox.style.cursor = 'pointer';
      if (initial?.techniques && initial.techniques.includes(tech)) {
        checkbox.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = tech;
      span.style.fontSize = '13px';

      label.appendChild(checkbox);
      label.appendChild(span);
      techGrid.appendChild(label);
      techCheckboxes.push(checkbox);
    });

    // Otras técnicas
    const otherTechContainer = document.createElement('div');
    otherTechContainer.appendChild(makeLabel('Otras técnicas no listadas (especifica)'));
    const otherTechInput = makeInput('Ej: Injertos, hidroponía casera, etc.');
    if (initial?.otherTechniques) otherTechInput.value = initial.otherTechniques;
    otherTechContainer.appendChild(otherTechInput);

    techniquesSection.appendChild(techLabel);
    techniquesSection.appendChild(techGrid);
    techniquesSection.appendChild(otherTechContainer);

    // ========================================
    // SECCIÓN 4: CONOCIMIENTOS ESPECÍFICOS
    // ========================================
    const knowledgeSection = createSection('🧠 Conocimientos Específicos');

    const knowledgeGrid = document.createElement('div');
    knowledgeGrid.style.cssText = `
      display: grid;
      gap: 20px;
    `;

    // Manejo de suelos
    const soilContainer = document.createElement('div');
    soilContainer.appendChild(makeLabel('Conocimiento sobre manejo de suelos'));
    const soilText = makeTextarea('Describe lo que sabes sobre: pH del suelo, fertilización, nutrientes, abonos, etc.', 3);
    if (initial?.soilKnowledge) soilText.value = initial.soilKnowledge;
    soilContainer.appendChild(soilText);

    // Manejo de plagas y enfermedades
    const pestContainer = document.createElement('div');
    pestContainer.appendChild(makeLabel('Conocimiento sobre plagas y enfermedades'));
    const pestText = makeTextarea('Describe lo que sabes sobre: identificación de plagas, métodos de control, prevención, etc.', 3);
    if (initial?.pestKnowledge) pestText.value = initial.pestKnowledge;
    pestContainer.appendChild(pestText);

    // Calendario agrícola y clima
    const climateContainer = document.createElement('div');
    climateContainer.appendChild(makeLabel('Conocimiento sobre calendario agrícola y clima'));
    const climateText = makeTextarea('Describe lo que sabes sobre: épocas de siembra, cosecha, señales climáticas, pronósticos, etc.', 3);
    if (initial?.climateKnowledge) climateText.value = initial.climateKnowledge;
    climateContainer.appendChild(climateText);

    // Variedades de cultivos
    const cropContainer = document.createElement('div');
    cropContainer.appendChild(makeLabel('Variedades de cultivos que conoces'));
    const cropText = makeTextarea('Lista las variedades de cultivos que has trabajado o conoces bien (separadas por comas)', 2);
    if (initial?.cropVarieties) cropText.value = initial.cropVarieties;
    cropContainer.appendChild(cropText);

    // Manejo post-cosecha
    const postHarvestContainer = document.createElement('div');
    postHarvestContainer.appendChild(makeLabel('Conocimiento sobre manejo post-cosecha'));
    const postHarvestText = makeTextarea('Describe lo que sabes sobre: almacenamiento, secado, conservación, procesamiento, etc.', 3);
    if (initial?.postHarvestKnowledge) postHarvestText.value = initial.postHarvestKnowledge;
    postHarvestContainer.appendChild(postHarvestText);

    knowledgeGrid.appendChild(soilContainer);
    knowledgeGrid.appendChild(pestContainer);
    knowledgeGrid.appendChild(climateContainer);
    knowledgeGrid.appendChild(cropContainer);
    knowledgeGrid.appendChild(postHarvestContainer);
    knowledgeSection.appendChild(knowledgeGrid);

    // ========================================
    // SECCIÓN 5: EXPERIENCIA Y ESPECIALIZACIÓN
    // ========================================
    const experienceSection = createSection('⭐ Experiencia y Especialización');

    const expGrid = document.createElement('div');
    expGrid.style.cssText = `
      display: grid;
      gap: 20px;
    `;

    // Cultivos principales
    const mainCropsContainer = document.createElement('div');
    mainCropsContainer.appendChild(makeLabel('Cultivos principales que maneja'));
    const mainCropsInput = makeInput('Ej: Maíz, papa, quinua, hortalizas, etc.');
    if (initial?.mainCrops) mainCropsInput.value = initial.mainCrops;
    mainCropsContainer.appendChild(mainCropsInput);

    // Crianza de animales
    const animalsContainer = document.createElement('div');
    animalsContainer.appendChild(makeLabel('Experiencia en crianza de animales'));
    const animalsText = makeTextarea('Describe tu experiencia con: gallinas, cuyes, vacas, ovejas, peces, etc.', 3);
    if (initial?.animalExperience) animalsText.value = initial.animalExperience;
    animalsContainer.appendChild(animalsText);

    // Herramientas y maquinaria
    const toolsContainer = document.createElement('div');
    toolsContainer.appendChild(makeLabel('Herramientas y maquinaria que sabe usar'));
    const toolsText = makeTextarea('Lista las herramientas, equipos o maquinaria que dominas (separadas por comas)', 2);
    if (initial?.toolsKnowledge) toolsText.value = initial.toolsKnowledge;
    toolsContainer.appendChild(toolsText);

    // Certificaciones
    const certsContainer = document.createElement('div');
    certsContainer.appendChild(makeLabel('Certificaciones o cursos completados'));
    const certsText = makeTextarea('Lista certificaciones, diplomas, cursos o capacitaciones recibidas', 3);
    if (initial?.certifications) certsText.value = initial.certifications;
    certsContainer.appendChild(certsText);

    // Logros destacados
    const achievementsContainer = document.createElement('div');
    achievementsContainer.appendChild(makeLabel('Logros destacados o proyectos exitosos'));
    const achievementsText = makeTextarea('Describe tus logros más importantes en agricultura', 3);
    if (initial?.achievements) achievementsText.value = initial.achievements;
    achievementsContainer.appendChild(achievementsText);

    expGrid.appendChild(mainCropsContainer);
    expGrid.appendChild(animalsContainer);
    expGrid.appendChild(toolsContainer);
    expGrid.appendChild(certsContainer);
    expGrid.appendChild(achievementsContainer);
    experienceSection.appendChild(expGrid);

    // ========================================
    // SECCIÓN 6: CONOCIMIENTOS TRADICIONALES
    // ========================================
    const traditionalSection = createSection('🌿 Conocimientos Tradicionales y Ancestrales');

    const tradGrid = document.createElement('div');
    tradGrid.style.cssText = `
      display: grid;
      gap: 20px;
    `;

    // Saberes ancestrales
    const ancestralContainer = document.createElement('div');
    ancestralContainer.appendChild(makeLabel('Saberes ancestrales o tradicionales'));
    const ancestralText = makeTextarea('Describe conocimientos tradicionales heredados: señas naturales, luna, rituales agrícolas, etc.', 4);
    if (initial?.ancestralKnowledge) ancestralText.value = initial.ancestralKnowledge;
    ancestralContainer.appendChild(ancestralText);

    // Plantas medicinales
    const medicinalContainer = document.createElement('div');
    medicinalContainer.appendChild(makeLabel('Conocimiento sobre plantas medicinales'));
    const medicinalText = makeTextarea('Lista plantas medicinales que conoces y sus usos', 3);
    if (initial?.medicinalPlants) medicinalText.value = initial.medicinalPlants;
    medicinalContainer.appendChild(medicinalText);

    // Semillas nativas
    const seedsContainer = document.createElement('div');
    seedsContainer.appendChild(makeLabel('Conocimiento sobre semillas nativas o criollas'));
    const seedsText = makeTextarea('Describe semillas nativas que conservas o conoces', 3);
    if (initial?.nativeSeeds) seedsText.value = initial.nativeSeeds;
    seedsContainer.appendChild(seedsText);

    tradGrid.appendChild(ancestralContainer);
    tradGrid.appendChild(medicinalContainer);
    tradGrid.appendChild(seedsContainer);
    traditionalSection.appendChild(tradGrid);

    // ========================================
    // SECCIÓN 7: RECURSOS Y REDES
    // ========================================
    const resourcesSection = createSection('🤝 Recursos y Redes de Apoyo');

    const resourcesGrid = document.createElement('div');
    resourcesGrid.style.cssText = `
      display: grid;
      gap: 20px;
    `;

    // Asociaciones
    const associationsContainer = document.createElement('div');
    associationsContainer.appendChild(makeLabel('Asociaciones, cooperativas o grupos a los que pertenece'));
    const associationsText = makeTextarea('Lista organizaciones agrícolas de las que eres parte', 2);
    if (initial?.associations) associationsText.value = initial.associations;
    associationsContainer.appendChild(associationsText);

    // Fuentes de información
    const infoSourcesContainer = document.createElement('div');
    infoSourcesContainer.appendChild(makeLabel('¿De dónde obtiene información agrícola?'));
    const infoSourcesChecks = document.createElement('div');
    infoSourcesChecks.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 8px;
    `;

    const infoSources = [
      'Otros agricultores',
      'Familia',
      'Radio',
      'Televisión',
      'Internet/Redes sociales',
      'Extensionistas agrícolas',
      'ONGs',
      'Universidad/Instituto',
      'Gobierno local',
      'Libros/Revistas',
      'Ferias agrícolas'
    ];

    const infoSourcesCheckboxes = [];
    infoSources.forEach(source => {
      const label = document.createElement('label');
      label.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      `;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = source;
      checkbox.style.cursor = 'pointer';
      if (initial?.infoSources && initial.infoSources.includes(source)) {
        checkbox.checked = true;
      }
      const span = document.createElement('span');
      span.textContent = source;
      span.style.fontSize = '13px';
      label.appendChild(checkbox);
      label.appendChild(span);
      infoSourcesChecks.appendChild(label);
      infoSourcesCheckboxes.push(checkbox);
    });

    infoSourcesContainer.appendChild(infoSourcesChecks);

    // Disposición a compartir conocimiento
    const sharingContainer = document.createElement('div');
    sharingContainer.appendChild(makeLabel('¿Está dispuesto a compartir sus conocimientos con otros agricultores?'));
    const sharingSelect = makeSelect(['Sí, totalmente', 'Sí, en algunos temas', 'Solo con mi comunidad', 'Prefiero no compartir']);
    if (initial?.willingToShare) sharingSelect.value = initial.willingToShare;
    sharingContainer.appendChild(sharingSelect);

    // Necesidades de aprendizaje
    const learningContainer = document.createElement('div');
    learningContainer.appendChild(makeLabel('¿Qué temas le gustaría aprender o mejorar?'));
    const learningText = makeTextarea('Describe áreas donde quieres mejorar tus conocimientos', 3);
    if (initial?.learningNeeds) learningText.value = initial.learningNeeds;
    learningContainer.appendChild(learningText);

    resourcesGrid.appendChild(associationsContainer);
    resourcesGrid.appendChild(infoSourcesContainer);
    resourcesGrid.appendChild(sharingContainer);
    resourcesGrid.appendChild(learningContainer);
    resourcesSection.appendChild(resourcesGrid);

    // Ensamblar todas las secciones
    content.appendChild(basicSection);
    content.appendChild(languageSection);
    content.appendChild(techniquesSection);
    content.appendChild(knowledgeSection);
    content.appendChild(experienceSection);
    content.appendChild(traditionalSection);
    content.appendChild(resourcesSection);

    // Actions (botones)
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding: 20px 30px;
      border-top: 2px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 0 0 12px 12px;
    `;

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancelar';
    btnCancel.style.cssText = `
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

    const btnOk = document.createElement('button');
    btnOk.innerHTML = '💾 Guardar Conocimiento';
    btnOk.style.cssText = `
      background: linear-gradient(135deg, #6a5acd 0%, #5243aa 100%);
      border: 2px solid #6a5acd;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;

    btnOk.addEventListener('mouseenter', () => {
      btnOk.style.transform = 'translateY(-2px)';
      btnOk.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
    });

    btnOk.addEventListener('mouseleave', () => {
      btnOk.style.transform = 'translateY(0)';
      btnOk.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });

    actions.appendChild(btnCancel);
    actions.appendChild(btnOk);

    // Ensamblar diálogo
    box.appendChild(header);
    box.appendChild(content);
    box.appendChild(actions);
    overlay.appendChild(box);

    // Movimiento bloqueado mientras está abierto
    const blockGameKeydown = (e) => {
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    };

    function finish(result) {
      document.removeEventListener('keydown', blockGameKeydown, true);
      try {
        resolve(result);
      } catch (e) {
        console.error('[LIBRARY] Error resolving:', e);
      }
      try {
        overlay.remove();
      } catch (e) {
        console.error('[LIBRARY] Error removing overlay:', e);
      }
    }

    // Event handlers
    btnOk.addEventListener('click', () => {
      // Recopilar todas las técnicas seleccionadas
      const selectedTechniques = techCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
      
      // Recopilar acceso a tecnología
      const selectedTechAccess = techAccessCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
      
      // Recopilar fuentes de información
      const selectedInfoSources = infoSourcesCheckboxes.filter(cb => cb.checked).map(cb => cb.value);

      // Construir objeto con todos los datos
      const payload = {
        // Información básica
        level: levelSelect.value,
        yearsExperience: parseInt(yearsInput.value) || 0,
        education: educationSelect.value,
        
        // Idiomas y comunicación
        nativeLanguage: nativeLangInput.value.trim(),
        otherLanguages: otherLangsInput.value.trim(),
        literacy: literacySelect.value,
        techAccess: selectedTechAccess,
        
        // Técnicas agrícolas
        techniques: selectedTechniques,
        otherTechniques: otherTechInput.value.trim(),
        
        // Conocimientos específicos
        soilKnowledge: soilText.value.trim(),
        pestKnowledge: pestText.value.trim(),
        climateKnowledge: climateText.value.trim(),
        cropVarieties: cropText.value.trim(),
        postHarvestKnowledge: postHarvestText.value.trim(),
        
        // Experiencia y especialización
        mainCrops: mainCropsInput.value.trim(),
        animalExperience: animalsText.value.trim(),
        toolsKnowledge: toolsText.value.trim(),
        certifications: certsText.value.trim(),
        achievements: achievementsText.value.trim(),
        
        // Conocimientos tradicionales
        ancestralKnowledge: ancestralText.value.trim(),
        medicinalPlants: medicinalText.value.trim(),
        nativeSeeds: seedsText.value.trim(),
        
        // Recursos y redes
        associations: associationsText.value.trim(),
        infoSources: selectedInfoSources,
        willingToShare: sharingSelect.value,
        learningNeeds: learningText.value.trim(),
        
        // Metadata
        savedAt: new Date().toISOString()
      };

      console.log('[LIBRARY] Guardando conocimiento:', payload);
      finish(payload);
    });

    btnCancel.addEventListener('click', () => finish(null));

    closeBtn.addEventListener('click', () => finish(null));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) finish(null);
    });

    document.body.appendChild(overlay);
    document.addEventListener('keydown', blockGameKeydown, true);
  });
}
