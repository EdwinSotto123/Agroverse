// 🧪 TEST RÁPIDO - Selector de Mapa en Perfil de Usuario
// Ejecuta este código en la consola del navegador después de abrir el juego

console.log('🧪 Iniciando test del selector de mapa...');

// 1. Verificar que las funciones existen
console.log('✓ Verificando funciones...');
if (typeof openUserProfile === 'undefined') {
  console.error('❌ openUserProfile no encontrada. Asegúrate de estar en la página del juego.');
} else {
  console.log('  ✅ openUserProfile existe');
}

// 2. Abrir el perfil de usuario manualmente
console.log('✓ Abriendo perfil de usuario...');
import('../src/view/user_profile.js')
  .then(module => {
    console.log('  ✅ Módulo cargado correctamente');
    
    // Abrir el perfil
    module.openUserProfile().then(() => {
      console.log('  ✅ Perfil cerrado');
    });
    
    console.log('');
    console.log('📋 INSTRUCCIONES DE PRUEBA:');
    console.log('─────────────────────────────────────');
    console.log('1. Busca la sección "👤 Información Personal"');
    console.log('2. Scroll hasta el campo "📍 Ubicación de la Finca"');
    console.log('3. Haz clic en "🗺️ Seleccionar en Mapa"');
    console.log('4. Verifica que el mapa se abre correctamente');
    console.log('5. Haz clic en cualquier punto del mapa');
    console.log('6. Verifica que aparece un marcador');
    console.log('7. Verifica que el botón "Aceptar" se habilita');
    console.log('8. Haz clic en "✓ Aceptar Ubicación"');
    console.log('9. Verifica que el campo de ubicación se llena automáticamente');
    console.log('10. Verifica que aparecen las coordenadas debajo del campo');
    console.log('11. Haz clic en "💾 Guardar Perfil"');
    console.log('');
    console.log('✓ Para verificar los datos guardados, ejecuta:');
    console.log('  JSON.parse(localStorage.getItem("farmGameUserProfile"))');
    console.log('─────────────────────────────────────');
  })
  .catch(error => {
    console.error('❌ Error cargando módulo:', error);
    console.log('');
    console.log('💡 Prueba alternativa:');
    console.log('1. Coloca una CASA en el juego');
    console.log('2. El perfil se abrirá automáticamente');
    console.log('3. Busca el campo de ubicación con botón de mapa');
  });

// 3. Verificar datos guardados
console.log('');
console.log('✓ Verificando datos guardados en localStorage...');
const savedProfile = localStorage.getItem('farmGameUserProfile');
if (savedProfile) {
  try {
    const profile = JSON.parse(savedProfile);
    console.log('  ✅ Perfil encontrado en localStorage');
    console.log('  📊 Datos actuales:');
    console.log('     Ubicación:', profile.personalInfo?.location || 'No especificada');
    console.log('     Latitud:', profile.personalInfo?.latitude || 'No especificada');
    console.log('     Longitud:', profile.personalInfo?.longitude || 'No especificada');
  } catch (e) {
    console.error('  ❌ Error parseando perfil guardado:', e);
  }
} else {
  console.log('  ℹ️ No hay perfil guardado aún (normal en primera ejecución)');
}

console.log('');
console.log('🎯 Test completado. Sigue las instrucciones de arriba.');
