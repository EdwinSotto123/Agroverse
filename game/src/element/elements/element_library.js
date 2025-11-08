import Element from "../element.js";
import ActionDefault from "../element_actions/action_default.js";
import Map from "../../game/map.js";
import { addImgToSquare, displayMessageToAlertBox } from "../../view/render.js";
import EntityStore from "../../game/entity_store.js";
import { infiniteResources } from "../../game_manager/game_settings.js";
import Player from "../../game/player.js";

export default class ElementLibrary extends Element {
  constructor(image) {
    super(image, new ActionDefault());
  }

  async setElementToSquare(square) {
    const { promptLibraryInfo } = await import('../../view/library_dialog.js');
    const info = await promptLibraryInfo({ title: 'Configurar Biblioteca', initial: null });
    if (!info) return;

    if (Map.mapInstance.isSquareContainMaxElement(square)) {
      return displayMessageToAlertBox('La celda está llena');
    }

    addImgToSquare(square, this.getImage());

    if (!infiniteResources) {
      Player.player.decreaseHandElementQuantity();
      if (Player.player.getHandElementQuantity() <= 0)
        Player.player.removeHandElement();
    }

    try {
      const entity = EntityStore.create({
        type: 'library',
        elementId: this.getElementId(),
        kind: 'biblioteca',
        form: info,
        w: 1, h: 1
      });
      const squares = Array.from(document.querySelectorAll('.square'));
      const idx = squares.indexOf(square);
      entity.squares = idx >= 0 ? [idx] : [];
      square.dataset.entityId = entity.id;
      
      // ✅ GUARDAR EN BASE DE DATOS
      try {
        const { saveLibraryToDatabase } = await import('../../services/library_service.js');
        
        const dbResult = await saveLibraryToDatabase(info, entity);
        
        if (dbResult.success) {
          console.log('[LIBRARY] ✅ Biblioteca guardada en BD:', dbResult.library_id);
          entity.libraryId = dbResult.library_id; // Guardar ID para futuras actualizaciones
        } else {
          console.warn('[LIBRARY] ⚠️ No se pudo guardar en BD:', dbResult.error);
        }
      } catch (dbError) {
        console.error('[LIBRARY] ❌ Error al guardar en BD:', dbError);
        // No cancelamos la colocación de la biblioteca, solo logueamos el error
      }
      
    } catch (e) { console.warn('[LIBRARY] error saving entity:', e); }
  }
}
