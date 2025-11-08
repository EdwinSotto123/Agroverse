/**
 * TEST SCRIPT - CROP DATABASE INTEGRATION
 * 
 * Este script permite probar manualmente la integración de cultivos
 * Ejecutar desde la consola del navegador cuando el juego esté cargado
 */

// ===== CONFIGURACIÓN =====
const TEST_CONFIG = {
  userId: 1,  // Cambiar según usuario de prueba
  cropName: 'Maíz de Prueba',
  coordinates: {
    lat: -34.6037,
    lon: -58.3816,
    display_name: 'Buenos Aires, Argentina'
  }
};

// ===== TEST 1: Verificar Sesión =====
function testSession() {
  console.log('🔍 TEST 1: Verificando sesión...');
  
  const userId = window.getAgroVerseUserId ? window.getAgroVerseUserId() : null;
  
  if (userId) {
    console.log('✅ Sesión activa. user_id:', userId);
    return true;
  } else {
    console.error('❌ Sin sesión activa');
    return false;
  }
}

// ===== TEST 2: Verificar EntityStore =====
function testEntityStore() {
  console.log('\n🔍 TEST 2: Verificando EntityStore...');
  
  if (typeof EntityStore === 'undefined') {
    console.error('❌ EntityStore no disponible');
    return false;
  }
  
  const entities = EntityStore.getAll();
  console.log('✅ EntityStore activo. Entidades:', entities.length);
  
  // Verificar si hay cultivos
  const crops = entities.filter(e => e.type === 'crop-area');
  console.log('   Cultivos en memoria:', crops.length);
  
  if (crops.length > 0) {
    const lastCrop = crops[crops.length - 1];
    console.log('   Último cultivo:', lastCrop);
    console.log('   - cultivo_id:', lastCrop.cultivo_id);
    console.log('   - weather_id:', lastCrop.weather_id);
  }
  
  return true;
}

// ===== TEST 3: Verificar crop_service =====
async function testCropService() {
  console.log('\n🔍 TEST 3: Verificando crop_service...');
  
  try {
    const module = await import('./src/services/crop_service.js');
    console.log('✅ crop_service cargado correctamente');
    console.log('   Funciones disponibles:', Object.keys(module));
    return module;
  } catch (error) {
    console.error('❌ Error al cargar crop_service:', error);
    return null;
  }
}

// ===== TEST 4: Simular guardado de cultivo =====
async function testSaveCrop(cropService) {
  console.log('\n🔍 TEST 4: Probando guardado de cultivo...');
  
  const mockCropData = {
    cropName: TEST_CONFIG.cropName,
    w: 3,
    h: 3,
    geo: {
      lat: TEST_CONFIG.coordinates.lat,
      lon: TEST_CONFIG.coordinates.lon,
      display_name: TEST_CONFIG.coordinates.display_name
    },
    areaMeasure: { value: 100, unit: 'm²' },
    variety: 'Variedad Test',
    plantedAt: new Date().toISOString().split('T')[0],
    harvestAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cropType: 'Cereal',
    seedOrigin: 'Local',
    soilType: 'Franco',
    irrigation: 'Por goteo',
    fertilization: 'Orgánico',
    organicPractices: ['Rotación de cultivos', 'Compostaje'],
    notes: 'Cultivo de prueba para testing'
  };
  
  const mockEntity = {
    squares: [0, 1, 2, 100, 101, 102, 200, 201, 202]
  };
  
  console.log('📤 Enviando datos:', mockCropData);
  
  const result = await cropService.saveCropToDatabase(mockCropData, mockEntity);
  
  if (result.success) {
    console.log('✅ Cultivo guardado exitosamente');
    console.log('   cultivo_id:', result.cultivo_id);
    console.log('   weather_id:', result.weather_id);
    console.log('   message:', result.message);
  } else {
    console.error('❌ Error al guardar cultivo:', result.error);
  }
  
  return result;
}

// ===== TEST 5: Verificar en Base de Datos =====
async function testDatabaseQuery(cultivoId) {
  console.log('\n🔍 TEST 5: Verificando en base de datos...');
  
  const API_URL = window.location.hostname === 'localhost' 
    ? '/api' 
    : (import.meta?.env?.VITE_API_URL || '/api');
  
  try {
    // Verificar cultivo
    const cropResponse = await fetch(`${API_URL}/cultivos/${cultivoId}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const cropData = await cropResponse.json();
    
    if (cropData.success) {
      console.log('✅ Cultivo encontrado en BD:', cropData.cultivo);
    } else {
      console.error('❌ Cultivo no encontrado');
    }
    
    return cropData;
  } catch (error) {
    console.error('❌ Error al consultar BD:', error);
    return null;
  }
}

// ===== EJECUTAR TODOS LOS TESTS =====
async function runAllTests() {
  console.log('🚀 INICIANDO TESTS DE INTEGRACIÓN DE CULTIVOS\n');
  console.log('='.repeat(50));
  
  // Test 1: Sesión
  if (!testSession()) {
    console.error('\n❌ TESTS ABORTADOS: Sin sesión activa');
    return;
  }
  
  // Test 2: EntityStore
  if (!testEntityStore()) {
    console.error('\n❌ TESTS ABORTADOS: EntityStore no disponible');
    return;
  }
  
  // Test 3: crop_service
  const cropService = await testCropService();
  if (!cropService) {
    console.error('\n❌ TESTS ABORTADOS: crop_service no disponible');
    return;
  }
  
  // Test 4: Guardado
  const saveResult = await testSaveCrop(cropService);
  if (!saveResult.success) {
    console.error('\n❌ TESTS FALLARON: Error al guardar cultivo');
    return;
  }
  
  // Test 5: Verificación BD
  if (saveResult.cultivo_id) {
    await testDatabaseQuery(saveResult.cultivo_id);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ TODOS LOS TESTS COMPLETADOS');
  console.log('\nResultado final:', saveResult);
}

// ===== INSTRUCCIONES DE USO =====
console.log(`
╔═══════════════════════════════════════════════════════════╗
║  TEST SCRIPT - CROP DATABASE INTEGRATION                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                             ║
║  Para ejecutar los tests, copia y pega en la consola:      ║
║                                                             ║
║  runAllTests()                                              ║
║                                                             ║
║  Tests individuales:                                        ║
║  - testSession()                                            ║
║  - testEntityStore()                                        ║
║  - await testCropService()                                  ║
║                                                             ║
╚═══════════════════════════════════════════════════════════╝
`);

// Exportar para uso en consola
window.CropTests = {
  runAllTests,
  testSession,
  testEntityStore,
  testCropService,
  testSaveCrop,
  testDatabaseQuery
};
