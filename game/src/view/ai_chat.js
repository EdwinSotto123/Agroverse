// AI Chat Widget for Game
let aiChatInitialized = false;

export function initAiChat() {
  if (aiChatInitialized) return;
  aiChatInitialized = true;
  
  // Inject styles
  injectAiChatStyles();
  
  // Create chat elements
  createAiChatWidget();
}

function injectAiChatStyles() {
  if (document.getElementById('gf-ai-chat-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'gf-ai-chat-styles';
  style.textContent = `
    /* AI Chat Widget - Game Scenario */
    .gf-ai-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #26a69a, #43a047);
      color: #fff;
      box-shadow: 0 10px 24px rgba(38,166,154,.35);
      cursor: pointer;
      z-index: 100000;
      transition: transform .2s ease, box-shadow .2s ease;
      border: 3px solid rgba(255,255,255,0.9);
    }
    
    .gf-ai-bubble:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 14px 28px rgba(38,166,154,.45);
    }
    
    .gf-ai-bubble .ai-icon {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ff5722;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      font-size: 12px;
      border: 2px solid white;
    }
    
    .gf-ai-panel {
      position: fixed;
      bottom: 88px;
      right: 20px;
      width: 340px;
      max-height: 65vh;
      background: rgba(255,255,255,0.96);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(8px) scale(.98);
      opacity: 0;
      pointer-events: none;
      transition: transform .2s ease, opacity .2s ease;
      z-index: 100000;
    }
    
    .gf-ai-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    
    .gf-ai-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, #26a69a, #43a047);
      color: white;
      border-bottom: 1px solid rgba(0,0,0,.06);
    }
    
    .gf-ai-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 14px;
    }
    
    .gf-ai-close {
      appearance: none;
      background: rgba(255,255,255,0.2);
      border: 0;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 14px;
      color: white;
      cursor: pointer;
      transition: background .2s ease;
    }
    
    .gf-ai-close:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .gf-ai-messages {
      padding: 12px;
      overflow: auto;
      flex: 1;
      background: linear-gradient(180deg, rgba(38,166,154,.06), transparent);
      min-height: 200px;
      max-height: 300px;
    }
    
    .gf-ai-shortcuts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 12px;
      border-top: 1px dashed rgba(0,0,0,.06);
      background: rgba(248,250,252,0.8);
    }
    
    .gf-ai-shortcut {
      padding: 6px 10px;
      background: #fff;
      border: 1px solid rgba(0,0,0,.08);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      color: #1565c0;
      cursor: pointer;
      transition: all .2s ease;
    }
    
    .gf-ai-shortcut:hover {
      background: #e3f2fd;
      border-color: #1565c0;
      transform: translateY(-1px);
    }
    
    .gf-ai-input-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid rgba(0,0,0,.06);
      background: #fff;
    }
    
    .gf-ai-input {
      flex: 1;
      border: 1px solid rgba(0,0,0,.1);
      border-radius: 12px;
      padding: 10px 12px;
      outline: none;
      font-size: 14px;
      font-family: inherit;
    }
    
    .gf-ai-input:focus {
      border-color: #26a69a;
      box-shadow: 0 0 0 2px rgba(38,166,154,.1);
    }
    
    .gf-ai-send {
      background: linear-gradient(135deg, #26a69a, #43a047);
      color: #fff;
      border: 0;
      padding: 10px 16px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(38,166,154,.3);
      transition: all .2s ease;
    }
    
    .gf-ai-send:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(38,166,154,.4);
    }
    
    .gf-ai-msg {
      display: flex;
      margin: 8px 0;
      animation: fadeInMsg .3s ease;
    }
    
    .gf-ai-msg .bubble {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 80%;
      box-shadow: 0 4px 12px rgba(0,0,0,.08);
      font-size: 13px;
      line-height: 1.4;
    }
    
    .gf-ai-msg.user {
      justify-content: flex-end;
    }
    
    .gf-ai-msg.user .bubble {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      color: #1b5e20;
    }
    
    .gf-ai-msg.ai .bubble {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      color: #0d47a1;
    }
    
    @keyframes fadeInMsg {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Hide bubble when dashboard is open */
    #crop-dashboard ~ .gf-ai-bubble {
      display: none;
    }
  `;
  
  document.head.appendChild(style);
}

function createAiChatWidget() {
  // Check if already exists
  if (document.getElementById('gf-ai-bubble')) return;
  
  // Create bubble
  const bubble = document.createElement('div');
  bubble.id = 'gf-ai-bubble';
  bubble.className = 'gf-ai-bubble';
  bubble.title = 'Asistente IA Agrícola - Haz clic para consultar';
  bubble.innerHTML = `
    <span style="font-size: 22px;">💬</span>
    <div class="ai-icon">🤖</div>
  `;
  
  // Create panel
  const panel = document.createElement('div');
  panel.id = 'gf-ai-panel';
  panel.className = 'gf-ai-panel';
  
  // Header
  const header = document.createElement('div');
  header.className = 'gf-ai-header';
  
  const title = document.createElement('div');
  title.className = 'gf-ai-title';
  title.innerHTML = '🤖 Asistente Agrícola IA';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'gf-ai-close';
  closeBtn.innerHTML = '✕';
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Messages area
  const messages = document.createElement('div');
  messages.className = 'gf-ai-messages';
  
  // Welcome message
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'gf-ai-msg ai';
  welcomeMsg.innerHTML = `
    <div class="bubble">
      ¡Hola! 👋 Soy tu asistente agrícola inteligente. Puedo ayudarte con información sobre clima, cultivos, sensores y más. ¿En qué te puedo ayudar hoy?
    </div>
  `;
  messages.appendChild(welcomeMsg);
  
  // Shortcuts
  const shortcuts = document.createElement('div');
  shortcuts.className = 'gf-ai-shortcuts';
  
  const shortcutButtons = [
    '🌡️ ¿Hay heladas próximas?',
    '🌱 Nivel de nutrientes del suelo',
    '💧 Próximo riego recomendado',
    '🛰️ Imagen satelital actual',
    '🐛 Detección de plagas'
  ];
  
  shortcutButtons.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'gf-ai-shortcut';
    btn.textContent = text;
    btn.addEventListener('click', () => handleUserMessage(text));
    shortcuts.appendChild(btn);
  });
  
  // Input row
  const inputRow = document.createElement('div');
  inputRow.className = 'gf-ai-input-row';
  
  const input = document.createElement('input');
  input.className = 'gf-ai-input';
  input.type = 'text';
  input.placeholder = 'Escribe tu consulta aquí...';
  
  const sendBtn = document.createElement('button');
  sendBtn.className = 'gf-ai-send';
  sendBtn.textContent = 'Enviar';
  
  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);
  
  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(shortcuts);
  panel.appendChild(inputRow);
  
  // Add to page
  document.body.appendChild(bubble);
  document.body.appendChild(panel);
  
  // Event handlers
  let isOpen = false;
  
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      input.focus();
      // Block WASD/arrow keys from propagating to the game while chat is open
      document.addEventListener('keydown', blockKeys, true);
    } else {
      panel.classList.remove('open');
    }
  }
  
  bubble.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
    // Remove key blocker when closing
    document.removeEventListener('keydown', blockKeys, true);
  });
  
  // Send message handlers
  async function handleUserMessage(text) {
    const message = text || input.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Show typing indicator and generate local response
    setTimeout(async () => {
      addMessage('ai', 'Analizando datos...', true);

      // ✅ Usar solo respuestas hardcodeadas locales (Gemini no disponible en Hong Kong)
      try {
        const response = await generateAiResponse(message);
        
        // Remove typing indicator
        const typingMsg = messages.querySelector('.gf-ai-msg:last-child');
        if (typingMsg) typingMsg.remove();

        addMessage('ai', response);
      } catch (err) {
        // On error, remove typing indicator and show fallback
        const typingMsg = messages.querySelector('.gf-ai-msg:last-child');
        if (typingMsg) typingMsg.remove();
        console.error('AI response generation failed:', err);
        addMessage('ai', '⚠️ Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo.');
      }
    }, 300);
  }
  
  sendBtn.addEventListener('click', () => handleUserMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });

  // Block movement keys when typing in the chat (capture phase)
  function blockKeys(e) {
    const movementCodes = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
    if (!movementCodes.includes(e.code)) return;
    const ae = document.activeElement;
    // If focus is inside the chat input or any input/textarea/select, stop propagation to prevent game movement
    if (ae && (ae === input || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      // don't prevent default to allow cursor movement in text fields if needed
    }
  }
  
  function addMessage(sender, text, isTyping = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `gf-ai-msg ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    if (isTyping) {
      bubble.style.fontStyle = 'italic';
      bubble.style.opacity = '0.7';
    }
    
    msgDiv.appendChild(bubble);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }
  
  async function generateAiResponse(query) {
    const q = query.toLowerCase();
    
    // Importar servicios integrados
    let geminiService, satelliteService, predictionsService;
    try {
      geminiService = await import('../services/gemini_service.js');
      satelliteService = await import('../services/satellite_service.js');
      predictionsService = await import('../services/predictions_client_service.js');
    } catch (error) {
      console.log('Servicios cargándose...');
    }
    
    // Get user profile for personalized responses
    let userProfile = null;
    let userData = {};
    try {
      const { getUserProfile } = await import('./user_profile.js');
      userProfile = getUserProfile();
      
      if (userProfile) {
        userData = {
          crops: userProfile.agriculture?.crops_grown || [],
          location: userProfile.personal?.location || '',
          experience: `${userProfile.agriculture?.years_experience || 0} años`,
          farm_size: userProfile.personal?.farm_size_hectares || 0,
          methods: userProfile.agriculture?.farming_methods || []
        };
      }
    } catch (error) {
      console.log('Perfil de usuario no disponible');
    }
    
    // Saludos - Usar Gemini Service
    if (q.includes('hola') || q.includes('ayuda') || q.includes('buenos días') || q.includes('buenas tardes')) {
      if (geminiService) {
        try {
          const response = await geminiService.chatWithAssistant(query, userData);
          if (response.success) {
            return formatAiResponse(response.response, response.sources);
          }
        } catch (error) {
          console.log('Usando respuesta local');
        }
      }
      
      if (userProfile && userProfile.personal.name) {
        const greeting = getPersonalizedGreeting(userProfile);
        return `👋 ${greeting}`;
      }
      return '👋 ¡Hola! Soy tu asistente agronómico de AgroVerse con IA de Google. ¿En qué puedo ayudarte hoy?';
    }
    
    // Predicción de heladas - Usar Predictions Service
    if (q.includes('helada') || q.includes('temperatura baja') || q.includes('frío')) {
      if (predictionsService && geminiService) {
        try {
          // Datos meteorológicos actuales simulados realistas
          const weatherData = {
            temp_min: 6 + (Math.random() * 8 - 4),
            temp_max: 18 + (Math.random() * 6),
            humidity: 55 + (Math.random() * 20),
            wind_speed: 3 + (Math.random() * 5),
            cloud_cover: 20 + (Math.random() * 40),
            latitude: userProfile?.personal?.latitude || -13.1631,
            longitude: userProfile?.personal?.longitude || -74.2236
          };
          
          const prediction = await predictionsService.predictFrost(weatherData);
          
          if (prediction.success) {
            let response = `🌡️ ANÁLISIS DE RIESGO DE HELADAS\n\n`;
            response += `📊 Probabilidad: ${(prediction.prediction.probability * 100).toFixed(0)}%\n`;
            response += `⚠️ Nivel de Riesgo: ${prediction.prediction.risk_level.toUpperCase()}\n\n`;
            
            if (prediction.prediction.factors && prediction.prediction.factors.length > 0) {
              response += `🔍 Factores detectados:\n`;
              prediction.prediction.factors.forEach(factor => {
                response += `  ${factor}\n`;
              });
              response += `\n`;
            }
            
            if (prediction.prediction.recommendations) {
              response += `💡 Recomendaciones:\n`;
              prediction.prediction.recommendations.forEach(rec => {
                response += `${rec}\n`;
              });
            }
            
            return response;
          }
        } catch (error) {
          console.log('Error en predicción, consultando asistente...');
        }
      }
      
      // Fallback a Gemini
      if (geminiService) {
        const response = await geminiService.chatWithAssistant(query, userData);
        if (response.success) {
          return formatAiResponse(response.response, response.sources);
        }
      }
      
      return '🌡️ Analizando condiciones meteorológicas para predicción de heladas...';
    }
    
    if (q.includes('nutrient') || q.includes('suelo') || q.includes('fertiliz')) {
      let response = '🌱 El análisis del suelo muestra niveles óptimos de nutrientes. NPK en rango ideal.';
      if (userProfile && userProfile.agriculture.farming_methods) {
        const methods = userProfile.agriculture.farming_methods;
        if (methods.includes('Orgánica')) {
          response += ' Como practicas agricultura orgánica, te sugiero compost de lombriz para mantener los niveles.';
        } else if (methods.includes('Convencional')) {
          response += ' Para agricultura convencional, puedes usar fertilizantes NPK 20-10-10.';
        } else if (methods.includes('Hidropónica')) {
          response += ' En tu sistema hidropónico, ajusta la solución nutritiva según el pH.';
        }
      }
      response += ' Próxima evaluación recomendada en 15 días.';
      return response;
    }
    
    if (q.includes('riego') || q.includes('agua') || q.includes('humedad')) {
      let response = '💧 Basándome en la humedad del suelo (68%) y el pronóstico, el próximo riego se recomienda en 48 horas.';
      if (userProfile) {
        const farmSize = userProfile.personal.farm_size_hectares;
        if (farmSize) {
          const waterNeeded = Math.round(farmSize * 150); // 150L per hectare estimate
          response += ` Para tu finca de ${farmSize} hectáreas, necesitarás aproximadamente ${waterNeeded}L.`;
        } else {
          response += ' Cantidad sugerida: 15-20L por m².';
        }
        
        if (userProfile.agriculture.farming_methods?.includes('Hidropónica')) {
          response += ' En hidropónica, verifica también el pH del agua (6.0-6.5).';
        }
      } else {
        response += ' Cantidad sugerida: 15-20L por m².';
      }
      return response;
    }
    
    // Datos satelitales - Usar Satellite Service
    if (q.includes('satelit') || q.includes('imagen') || q.includes('ndvi') || q.includes('salud') && q.includes('cultivo')) {
      if (satelliteService) {
        try {
          const lat = userProfile?.personal?.latitude || -13.1631;
          const lon = userProfile?.personal?.longitude || -74.2236;
          
          const satelliteData = await satelliteService.getSentinel2Data(lat, lon);
          
          if (satelliteData.success && satelliteData.composite_values) {
            const ndvi = satelliteData.composite_values.NDVI || 0;
            const evi = satelliteData.composite_values.EVI || 0;
            const ndwi = satelliteData.composite_values.NDWI || 0;
            
            const ndviInterpretation = satelliteService.interpretNDVI(ndvi);
            
            let response = `🛰️ ANÁLISIS SATELITAL (Sentinel-2)\n\n`;
            response += `📊 Índices Espectrales:\n`;
            response += `  • NDVI: ${ndvi.toFixed(3)} - ${ndviInterpretation.description}\n`;
            response += `  • EVI: ${evi.toFixed(3)} - Biomasa vegetal\n`;
            response += `  • NDWI: ${ndwi.toFixed(3)} - Contenido de agua\n\n`;
            
            response += `🎯 Estado: ${ndviInterpretation.level.toUpperCase()}\n`;
            response += `💡 Acción recomendada: ${ndviInterpretation.action}\n\n`;
            
            if (satelliteData.time_series && satelliteData.time_series.length > 1) {
              const recent = satelliteData.time_series[satelliteData.time_series.length - 1];
              const previous = satelliteData.time_series[satelliteData.time_series.length - 2];
              const trend = recent.NDVI - previous.NDVI;
              
              response += `📈 Tendencia: `;
              if (trend > 0.05) {
                response += `Mejorando (+${(trend * 100).toFixed(1)}%)\n`;
              } else if (trend < -0.05) {
                response += `⚠️ Decreciendo (${(trend * 100).toFixed(1)}%) - Requiere atención\n`;
              } else {
                response += `Estable\n`;
              }
            }
            
            response += `\nℹ️ Fuente: Google Earth Engine vía Sentinel-2`;
            return response;
          }
        } catch (error) {
          console.log('Error en datos satelitales, usando asistente...');
        }
      }
      
      // Fallback a Gemini
      if (geminiService) {
        const response = await geminiService.chatWithAssistant(query, userData);
        if (response.success) {
          return formatAiResponse(response.response, response.sources);
        }
      }
      
      return '🛰️ Analizando imágenes satelitales de tu cultivo...';
    }
    
    // Predicción de plagas - Usar Predictions Service
    if (q.includes('plaga') || q.includes('insecto') || q.includes('enfermedad') || q.includes('gusano')) {
      if (predictionsService) {
        try {
          const pestData = {
            temperature: 22 + (Math.random() * 8 - 4),
            humidity: 65 + (Math.random() * 20 - 10),
            ndvi: 0.55 + (Math.random() * 0.2),
            crop_type: userData.crops && userData.crops.length > 0 ? userData.crops[0] : 'unknown'
          };
          
          const prediction = await predictionsService.predictPest(pestData);
          
          if (prediction.success) {
            let response = `🐛 ANÁLISIS DE RIESGO DE PLAGAS\n\n`;
            response += `📊 Probabilidad: ${(prediction.prediction.probability * 100).toFixed(0)}%\n`;
            response += `⚠️ Nivel de Riesgo: ${prediction.prediction.risk_level.toUpperCase()}\n\n`;
            
            if (prediction.prediction.factors && prediction.prediction.factors.length > 0) {
              response += `🔍 Factores de riesgo:\n`;
              prediction.prediction.factors.forEach(factor => {
                response += `  ${factor}\n`;
              });
              response += `\n`;
            }
            
            if (prediction.prediction.preventive_actions) {
              response += `🛡️ Acciones preventivas:\n`;
              prediction.prediction.preventive_actions.forEach(action => {
                response += `${action}\n`;
              });
            }
            
            return response;
          }
        } catch (error) {
          console.log('Error en predicción de plagas, consultando asistente...');
        }
      }
      
      // Fallback a Gemini
      if (geminiService) {
        const response = await geminiService.chatWithAssistant(query, userData);
        if (response.success) {
          return formatAiResponse(response.response, response.sources);
        }
      }
      
      return '🐛 Analizando riesgo de plagas para tu cultivo...';
    }
    
    if (q.includes('clima') || q.includes('lluvia') || q.includes('viento')) {
      let response = '🌤️ Pronóstico: cielo despejado próximas 48h, probabilidad de lluvia 15%. Viento suave del NE a 8 km/h.';
      if (userProfile && userProfile.personal.location) {
        response += ` En tu zona de ${userProfile.personal.location}, las condiciones son ideales para el crecimiento.`;
      } else {
        response += ' Condiciones ideales para el crecimiento.';
      }
      return response;
    }
    
    if (q.includes('cosecha') || q.includes('rendimiento')) {
      let response = '🌾 Predicción de cosecha: 92% probabilidad de éxito.';
      if (userProfile) {
        const experience = userProfile.agriculture.years_experience || 0;
        if (experience >= 10) {
          response += ' Con tu experiencia de más de 10 años, puedes optimizar el rendimiento hasta 950 kg/ha.';
        } else if (experience >= 5) {
          response += ' Con tu experiencia intermedia, el rendimiento esperado es 850 kg/ha.';
        } else {
          response += ' Como principiante, enfócate en técnicas básicas para 750 kg/ha.';
        }
      } else {
        response += ' Rendimiento esperado 850 kg/ha.';
      }
      response += ' Fecha estimada en 15-18 días según crecimiento actual.';
      return response;
    }
    
    if (q.includes('perfil') || q.includes('configuración') || q.includes('datos personales')) {
      return '👤 Para actualizar tu perfil y recibir consejos más personalizados, haz clic en la casa con la herramienta de inspección. Allí podrás configurar tus datos agrícolas, experiencia y preferencias.';
    }
    
    // Cultivos específicos
    if (q.includes('maíz') || q.includes('maiz')) {
      return '🌽 El maíz requiere suelo bien drenado y pH 5.8-7.0. Siembra en primavera cuando el suelo alcance 15°C. Necesita riego constante (500-800mm) y fertilización NPK 200-100-100 kg/ha. Cosecha en 90-120 días cuando los granos estén firmes.';
    }
    
    if (q.includes('papa') || q.includes('patata')) {
      return '🥔 Las papas prefieren clima fresco (15-20°C) y suelo suelto pH 5.0-6.5. Siembra tubérculos con brotes, riega moderadamente para evitar pudrición. Fertiliza con compost orgánico. Cosecha en 90-120 días cuando las hojas amarilleen.';
    }
    
    if (q.includes('tomate')) {
      return '🍅 Los tomates necesitan sol pleno (6-8h), suelo pH 6.0-6.8 y riego constante pero sin encharcar. Trasplanta plántulas con 15cm, tutora cuando crezcan. Fertiliza cada 15 días con NPK 15-15-15. Cosecha en 60-85 días cuando estén rojos.';
    }
    
    if (q.includes('zanahoria')) {
      return '🥕 Las zanahorias requieren suelo profundo, suelto y sin piedras, pH 6.0-6.8. Siembra directa, ralea a 5cm de distancia. Riego ligero y constante. No fertilices con nitrógeno excesivo (deforma raíces). Cosecha en 70-80 días.';
    }
    
    if (q.includes('lechuga')) {
      return '🥬 La lechuga crece bien en clima fresco (15-20°C), suelo rico en materia orgánica pH 6.0-7.0. Trasplanta plántulas cada 25cm, riega frecuentemente sin mojar hojas. Cosecha en 45-60 días antes de que florezca.';
    }
    
    // Tecnología y sensores
    if (q.includes('sensor') || q.includes('iot') || q.includes('monitoreo')) {
      return '📊 Los sensores IoT pueden medir humedad del suelo (0-100%), temperatura (-40 a 80°C), pH (4-9), luz (0-200k lux) y conductividad eléctrica. Instalación: entierralos 15-20cm, calibra cada mes, revisa baterías cada 6 meses.';
    }
    
    if (q.includes('dron') || q.includes('drone')) {
      return '🚁 Los drones agrícolas permiten: mapeo de cultivos (RGB/multiespectral), fumigación precisa (5-10L/ha), detección temprana de plagas/enfermedades, análisis NDVI, y medición de altura de plantas. Regulación: verifica normas locales de vuelo.';
    }
    
    if (q.includes('ia') || q.includes('inteligencia artificial') || q.includes('machine learning')) {
      return '🤖 La IA en agricultura ayuda con: predicción de cosecha (±5% precisión), detección de plagas por visión (90-95% exactitud), optimización de riego (ahorro 30%), pronósticos climáticos hiperlocales, y recomendaciones de fertilización variable.';
    }
    
    // Problemas comunes
    if (q.includes('amarill') || q.includes('clorosis')) {
      return '🍂 Hojas amarillas pueden indicar: falta de nitrógeno (hojas inferiores), exceso de agua (raíces débiles), deficiencia de hierro (hojas nuevas), o plagas. Solución: analiza suelo, ajusta riego, aplica fertilizante foliar según deficiencia.';
    }
    
    if (q.includes('marchit') || q.includes('seca')) {
      return '💀 Marchitamiento puede ser por: falta de agua (suelo seco >2cm), exceso de sol (sombrea), hongos vasculares (elimina plantas), o plagas de raíz. Revisa humedad, drena si hay encharcamiento, aplica fungicida si es necesario.';
    }
    
    if (q.includes('mancha') || q.includes('hongo') || q.includes('moho')) {
      return '🍄 Manchas foliares generalmente son hongos: mildiú (manchas marrones), oídio (polvo blanco), roya (pústulas naranjas). Tratamiento: elimina hojas afectadas, mejora ventilación, aplica fungicida orgánico (bicarbonato 1%, cobre), evita riego foliar.';
    }
    
    // Técnicas avanzadas
    if (q.includes('hidropon') || q.includes('hidroponic')) {
      return '💦 Hidroponía: cultivo sin suelo en solución nutritiva. Ventajas: 90% menos agua, crecimiento 30% más rápido, sin malezas. Sistemas: NFT (flujo continuo), DWC (raíz flotante), Wick (mecha). pH ideal: 5.5-6.5, EC: 1.2-2.5 mS/cm.';
    }
    
    if (q.includes('vertical') || q.includes('indoor')) {
      return '🏢 Agricultura vertical: cultivo en capas con luz LED. Produce 10-20x más por m², sin pesticidas, cosecha todo el año. Requiere: LEDs full-spectrum (400-700nm), clima controlado (18-24°C), sistema de riego automatizado, inversión inicial alta.';
    }
    
    if (q.includes('permacultura')) {
      return '🌿 Permacultura diseña sistemas agrícolas sostenibles imitando la naturaleza. Principios: observa y adapta, captura energía, diseña con zonas (0-5), usa especies nativas, integra animales, maximiza bordes, recicla nutrientes. Reduce costos 60% a largo plazo.';
    }
    
    // Mercado y economía
    if (q.includes('precio') || q.includes('vender') || q.includes('mercado')) {
      return '💰 Para maximizar ganancias: investiga precios locales antes de sembrar, diversifica cultivos, vende directo (elimina intermediarios), certifica orgánico (+30% precio), usa plataformas digitales, forma cooperativas. Almacena en temporada baja.';
    }
    
    if (q.includes('costo') || q.includes('inversión') || q.includes('capital')) {
      return '💵 Costos típicos/ha: semillas $50-200, fertilizantes $100-300, riego $200-800, mano de obra $300-1000, equipos $500-2000. ROI agricultura tradicional: 15-30%, orgánica: 25-40%, hidropónica: 40-60%. Considera subsidios gubernamentales.';
    }
    
    // FALLBACK GENERAL - Usar Gemini Service con RAG
    if (geminiService) {
      try {
        const response = await geminiService.chatWithAssistant(query, userData);
        if (response.success) {
          return formatAiResponse(response.response, response.sources);
        }
      } catch (error) {
        console.log('Error en asistente general, usando respuesta local');
      }
    }
    
    // Default personalized response
    if (userProfile && userProfile.personal.name) {
      return `🤖 ${userProfile.personal.name}, he analizado tu consulta sobre "${query}". Como ${userProfile.agriculture.farming_methods?.[0] || 'agricultor'}, puedo ayudarte con: predicciones climáticas, análisis satelital, riego, manejo de plagas o nutrientes. ¿Sobre qué tema específico te gustaría profundizar?`;
    }
    
    return '🤖 Soy tu asistente agronómico de AgroVerse impulsado por Gemini AI y datos satelitales de Google Earth Engine. Puedo ayudarte con: predicción de heladas, análisis NDVI/EVI, manejo de riego, control de plagas, fertilización, y recomendaciones personalizadas. ¿Qué necesitas saber?';
  }
  
  function getPersonalizedGreeting(userProfile) {
    const name = userProfile.personal.name || 'Agricultor';
    const farmSize = userProfile.personal.farm_size_hectares;
    const experience = userProfile.agriculture.years_experience;
    const methods = userProfile.agriculture.farming_methods || [];
    
    let greeting = `¡Hola ${name}!`;
    
    if (farmSize) {
      greeting += ` Veo que manejas ${farmSize} hectáreas.`;
    }
    
    if (experience >= 10) {
      greeting += ' Con tu amplia experiencia agrícola, ¿en qué puedo asistirte hoy?';
    } else if (experience >= 5) {
      greeting += ' Con tu experiencia intermedia, estoy aquí para optimizar tus cultivos.';
    } else if (experience > 0) {
      greeting += ' Como agricultor en desarrollo, te ayudo a mejorar tus técnicas.';
    } else {
      greeting += ' Perfecto para comenzar juntos este camino agrícola.';
    }
    
    if (methods.length > 0) {
      greeting += ` Especializado en agricultura ${methods[0].toLowerCase()}.`;
    }
    
    return greeting;
  }
  
  /**
   * Formatea respuesta de Gemini con fuentes citadas
   * @param {string} response - Respuesta del asistente
   * @param {Array} sources - Array de fuentes
   * @returns {string} - Respuesta formateada
   */
  function formatAiResponse(response, sources = []) {
    let formatted = response;
    
    if (sources && sources.length > 0) {
      formatted += '\n\n📚 Fuentes:\n';
      sources.forEach((source, index) => {
        formatted += `  ${index + 1}. ${source}\n`;
      });
    }
    
    return formatted;
  }
}

// -------- Gemini API integration helper --------
// NOTE: The user provided an API key; embedding it in client-side code is insecure.
const GEMINI_API_KEY = '';
const GEMINI_MODEL = 'gemini-2.5-pro';

async function callGeminiModel(userMessage) {
  if (!GEMINI_API_KEY) throw new Error('No API key configured for DeepSeek');

  // ═══════════════════════════════════════════════════════════════════
  // EXTRACCIÓN DE CONTEXTO REAL DE LA BASE DE DATOS
  // ═══════════════════════════════════════════════════════════════════
  let realContextData = '';
  try {
    console.log('[AI CHAT] 🔄 Extrayendo datos reales de la base de datos...');
    
    // Importar el servicio de extracción de datos
    const { extractAllDataToText } = await import('../services/data_extractor_service.js');
    
    // Obtener user_id actual
    const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
    
    // Extraer todos los datos del usuario
    realContextData = await extractAllDataToText(userId);
    
    console.log('[AI CHAT] ✅ Contexto extraído:', realContextData.length, 'caracteres');
  } catch (error) {
    console.warn('[AI CHAT] ⚠️ No se pudo extraer contexto real, usando datos de ejemplo:', error);
    // Si falla, continuará con el prompt hardcodeado de respaldo
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONSTRUIR SYSTEM PROMPT CON DATOS REALES O DE RESPALDO
  // ═══════════════════════════════════════════════════════════════════
  let systemPrompt = '';
  
  if (realContextData && realContextData.length > 0) {
    // ✅ USAR DATOS REALES DE LA BASE DE DATOS
    systemPrompt = `Eres un asistente agrícola inteligente especializado en brindar recomendaciones prácticas, contextualizadas y accionables a agricultores.

═══════════════════════════════════════════════════════════════════
CONTEXTO REAL DE LA FINCA DEL USUARIO
═══════════════════════════════════════════════════════════════════

A continuación tienes TODA la información actualizada de la finca del usuario, extraída directamente de la base de datos:

${realContextData}

═══════════════════════════════════════════════════════════════════
INSTRUCCIONES PARA LA RESPUESTA
═══════════════════════════════════════════════════════════════════

1. **USA SIEMPRE LA INFORMACIÓN REAL** proporcionada arriba para responder.
2. Si el usuario pregunta sobre sus cultivos, usa los datos de la sección "CULTIVOS".
3. Si pregunta sobre clima/meteorología, usa los datos de "DATOS METEOROLÓGICOS".
4. Si pregunta sobre animales, usa la sección "ANIMALES".
5. Si pregunta sobre su perfil/datos personales, usa "PERFIL DEL AGRICULTOR".
6. Si pregunta sobre fuentes de agua, almacenes o biblioteca, usa esas secciones.

7. **Sé específico y preciso**: Menciona nombres de cultivos reales, fechas exactas, coordenadas, cantidades.
8. **Prioriza la información reciente**: Los datos meteorológicos más recientes son más relevantes.
9. **Ofrece recomendaciones accionables**: Pasos concretos, cantidades, tiempos, señales de monitoreo.
10. **Adapta tu tono**: Cálido, claro y técnico, evitando respuestas muy académicas.

11. **Si NO hay datos disponibles** en alguna sección (ej: "No hay cultivos registrados"), menciona esto al usuario y sugiere que registre esa información.

12. **Formato de respuesta**:
    - Usa emojis relevantes (🌾 🌡️ 💧 🐄 etc.)
    - Organiza en secciones claras cuando sea necesario
    - Usa listas numeradas para pasos secuenciales
    - Incluye unidades y rangos (kg/ha, °C, %, etc.)

13. **Cuando el usuario salude** ("hola", "buenos días"), responde de manera amable y personalizada usando su nombre si está disponible en el perfil.

14. **Prioriza la seguridad**: Si detectas riesgos (heladas cercanas, plagas, sequía), alerta al usuario de forma clara.

Ahora responde la siguiente pregunta del usuario usando ÚNICAMENTE la información real proporcionada arriba:`;
    
  } else {
    // ❌ RESPALDO: Usar datos hardcodeados de ejemplo
    console.warn('[AI CHAT] USANDO DATA DESACTUALIZADA. DATOS REALES PERO GUARDADOS EN EL CACHE');
    systemPrompt = `Eres un asistente agrícola inteligente especializado en brindar recomendaciones prácticas, contextualizadas y accionables a agricultores.  
Recibirás un perfil detallado de un agricultor y deberás generar planes de manejo, recomendaciones técnicas y estrategias de mejora productiva.  

=== PERFIL DEL AGRICULTOR (datos hardcodeados) ===
- Ubicación: Ayacucho, Perú (provincia de Huamanga, altitud 2,750 msnm)  
- Tamaño de la explotación: 2 hectáreas  
- Parcelas: 1 ha destinada a maíz, 0.7 ha a pimiento, 0.3 ha a papa nativa y alfalfa rotativa  
- Cultivos principales: Pimiento (Capsicum annuum), Maíz (Zea mays)  
- Cultivos secundarios: Papa nativa (Solanum tuberosum), Alfalfa forrajera  
- Animales en la granja: 12 gallinas criollas, 4 cuyes, 2 vacas lecheras, 1 burro  
- Temperatura promedio anual: 12-18 °C  
- Humedad relativa promedio: 65% (con variaciones estacionales 40% – 80%)  
- Precipitación media anual: 700 mm, concentrada entre noviembre y marzo  
- Fuente de agua: Río Cachi, riego por canales y acequias (disponibilidad moderada, depende de lluvias)  
- Tipo de suelo: textura franco-arenosa, pH estimado 6.2, contenido de materia orgánica 2.5%, ligera erosión en laderas, capacidad de retención hídrica media-baja  
- Nivel de fertilidad: bajo en nitrógeno, medio en fósforo, medio en potasio  
- Prácticas del agricultor: agricultura mayormente orgánica, rotación básica de cultivos, manejo integrado de plagas muy básico, uso limitado de fertilizantes químicos  
- Abonos usados: compost casero (≈2 ton/ha/año), estiércol de vaca fresco, biofertilizantes líquidos tipo “biol” preparados en la chacra  
- Tecnologías usadas: teléfono móvil con WhatsApp, radio local, sin maquinaria avanzada (usa herramientas manuales y yunta de bueyes)  
- Experiencia del agricultor: 6 años en agricultura familiar y comercial  
- Conocimientos: nivel intermedio en manejo de plagas, elaboración de biofertilizantes, escasa capacitación en manejo de suelos y cosecha de agua  
- Objetivo principal: mejorar la productividad, reducir pérdidas por sequías y heladas, asegurar la comercialización local en ferias y mercados  

=== DATOS CLIMÁTICOS Y DE CONTEXTO (simulados con SENAMHI y reportes locales) ===
- Pronóstico a 7 días: **helada ligera** (-2 °C a -4 °C en la madrugada) dentro de 7 días, riesgo alto para pimiento y maíz.  
- Pronóstico a 3 meses: **sequía moderada** con lluvias 30% por debajo de lo normal, riesgo de estrés hídrico en maíz y alfalfa.  
- Horas de sol promedio: 6 h/día (época seca), 4 h/día (época lluviosa)  
- Vientos predominantes: moderados (10-20 km/h), con rachas más fuertes en julio-agosto.  
- Estacionalidad: época de siembra de maíz en inicio, pimiento en fase vegetativa temprana, papa nativa en cosecha.  
- Riesgos actuales reportados: presencia incipiente de gusano cogollero en maíz (Spodoptera frugiperda), ácaros en pimiento y riesgo de rancha en papa si aumentan lluvias.  
- Mercado local: sobreoferta de papa en la zona (precio bajo), buena demanda de pimiento fresco en Huamanga, maíz con demanda estable para consumo animal.  
- Infraestructura: no tiene riego tecnificado, depende de turnos de canal, no cuenta con reservorios ni cobertizos para animales.  
- Acceso a financiamiento: limitado, participa en programas sociales, sin créditos bancarios.  
- Mano de obra: principalmente familiar (esposa e hijos mayores apoyan en cosecha y cuidado de animales).  

=== INSTRUCCIONES PARA LA RESPUESTA ===  
1. Prioriza las características del perfil y el contexto climático al dar recomendaciones.  
2. Ofrece **planes de manejo concretos** con pasos secuenciales, indicando **qué hacer, cuánto, cuándo, con qué frecuencia**.  
3. Usa **unidades y rangos** (ej: kg/ha, litros/día, ppm, número de animales, etc.).  
4. Incluye **señales de monitoreo** para verificar si la acción funciona (ej: color de hojas, humedad del suelo, síntomas en animales, presencia de plagas).  
5. Considera **eventos climáticos previstos** (helada en 7 días, sequía en 3 meses) en todas tus recomendaciones.  
6. Cuando la información adicional pueda cambiar radicalmente la recomendación (ejemplo: pH real, estado fenológico exacto, historial de plagas, acceso a tecnologías de riego), **solicita esos datos de forma breve** y explica por qué son relevantes.  
7. Adapta las recomendaciones a la **realidad local del agricultor** (limitado acceso a maquinaria, clima andino, producción en pequeña escala, pocos recursos).  
8. Organiza tu respuesta en secciones claras:  
   - Plan de fertilización  
   - Manejo del agua  
   - Control de plagas y enfermedades  
   - Prevención frente a heladas y sequía  
   - Manejo de animales y forrajes  
   - Estrategias de comercialización  
   - Capacitación y mejora de capacidades  

Tu salida debe ser clara, estructurada, con lenguaje sencillo pero técnico, como una guía práctica que el agricultor pueda aplicar.  

=== INSTRUCCIONES DE COMPORTAMIENTO ===
1. Cuando el usuario salude o haga comentarios generales (“hola”, “buenos días”, “qué tal”), responde de manera natural y amable, como un asistente humano (“Hola, ¿en qué puedo ayudarte hoy con tu granja?”).  
2. Cuando el usuario pida recomendaciones o haga preguntas relacionadas con agricultura, **usa siempre el contexto del perfil hardcodeado**.  
3. Las recomendaciones deben ser **prácticas, paso a paso, con unidades, tiempos y monitoreo**, adaptadas a la realidad del agricultor.  
4. Si falta información clave (pH real, estado fenológico exacto, historial de plagas, etc.), solicita esos datos de forma breve y explica por qué son importantes.  
5. Adapta siempre tu tono: cálido, claro y técnico, evitando respuestas demasiado académicas o muy cortas.  
6. Estructura tus respuestas técnicas en secciones (“Manejo del agua”, “Plan de fertilización”, “Prevención de heladas”, etc.).  

=== EJEMPLOS DE INTERACCIÓN ===
Usuario: "Holaaa"
IA: "¡Hola! Qué gusto saludarte 👋 ¿En qué te puedo ayudar hoy con tu granja en Ayacucho?"

Usuario: "¿Qué hago para la helada que viene?"
IA: "En tu zona se prevé una helada ligera en 7 días (–2 °C a –4 °C). Para proteger tu pimiento y maíz te recomiendo:  
1. Instalar cortinas de plástico o mallas alrededor de los cultivos sensibles.  
2. Aplicar riegos ligeros la tarde previa para mantener calor en el suelo (10–15 mm).  
3. Vigilar hojas tiernas: si observas manchas necróticas al día siguiente, cubre con paja o mantas agrícolas.  
¿Quieres que te arme un plan completo de prevención para toda tu parcela de 2 hectáreas?"`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENVIAR PETICIÓN A GEMINI API CON EL CONTEXTO
  // ═══════════════════════════════════════════════════════════════════
  // ✅ Para JavaScript en navegador: API key DEBE ir en query string, NO en header
  // El header X-goog-api-key solo funciona en curl/backend, causa errores CORS en browser
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const body = {
    contents: [
      {
        parts: [
          { text: systemPrompt + "\n\n" + userMessage }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 65536  // Reducido para evitar límites
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HARASSMENT", 
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ]
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // Aumentado a 30 segundos

  try {
    console.log('[AI CHAT] 🌐 Enviando petición a Deepseek API...');
    console.log('[AI CHAT] 📍 URL:', url);
    console.log('[AI CHAT] 📦 Tamaño del prompt:', (systemPrompt + "\n\n" + userMessage).length, 'caracteres');
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // ❌ NO usar 'X-goog-api-key' header en JavaScript browser - causa errores CORS
        // ✅ API key va en query string arriba
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('[AI CHAT] 📡 Respuesta recibida. Status:', res.status);

    if (!res.ok) {
      const txt = await res.text();
      console.error('[AI CHAT] ❌ Error de API:', txt);
      throw new Error(`DeepSeek API error: ${res.status} - ${txt.substring(0, 200)}`);
    }

    const data = await res.json();
    
    // Debugging más específico
    console.log('[AI CHAT] 📊 DeepSeek response candidates:', data?.candidates);
    
    // Verificar si fue bloqueado por seguridad
    if (data?.candidates?.[0]?.finishReason) {
      const reason = data.candidates[0].finishReason;
      console.log('[AI CHAT] 🏁 Finish reason:', reason);
      
      if (reason === 'SAFETY') {
        throw new Error('Respuesta bloqueada por filtros de seguridad. Intenta reformular la pregunta.');
      } else if (reason === 'MAX_TOKENS') {
        throw new Error('Respuesta muy larga. Sé más específico en tu consulta.');
      }
    }

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText && responseText.trim()) {
      console.log('[AI CHAT] ✅ Respuesta obtenida:', responseText.length, 'caracteres');
      return responseText.trim();
    }

    throw new Error(`Sin respuesta de texto. Razón: ${data?.candidates?.[0]?.finishReason || 'Desconocida'}`);
    
  } catch (err) {
    console.error('[AI CHAT] 💥 Error completo:', err);
    
    if (err.name === 'AbortError') {
      throw new Error('⏱️ Timeout: La petición a DeepSeek tardó más de 30 segundos');
    }
    
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('🌐 Error de red: No se pudo conectar con DeepSeek API.');
    }
    
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}