import Element from "../element.js";
import ActionDefault from "../element_actions/action_default.js";
import Map from "../../game/map.js";
import { addImgToSquare, displayMessageToAlertBox } from "../../view/render.js";
import EntityStore from "../../game/entity_store.js";
import { infiniteResources } from "../../game_manager/game_settings.js";
import Player from "../../game/player.js";

export default class ElementWater extends Element {
  /**
   * @param {HTMLImageElement} image
   * @param {('lago'|'pozo'|'rio')} kind
   */
  constructor(image, kind) {
    super(image, new ActionDefault());
    this.kind = kind;
  }

  async setElementToSquare(square) {
    const { promptWaterInfo } = await import('../../view/water_dialog.js');
    const titleMap = { lago: 'Configurar Lago', pozo: 'Configurar Pozo', rio: 'Configurar Río' };
    const info = await promptWaterInfo({ title: titleMap[this.kind] || 'Configurar agua', kind: this.kind });
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
        type: 'water',
        elementId: this.getElementId(),
        kind: this.kind,
        form: info,
        w: 1, h: 1,
        geo: info.geo || null
      });
      const squares = Array.from(document.querySelectorAll('.square'));
      const idx = squares.indexOf(square);
      entity.squares = idx >= 0 ? [idx] : [];
      square.dataset.entityId = entity.id;
      
      // ✅ GUARDAR EN BASE DE DATOS
      try {
        const { saveWaterSourceToDatabase } = await import('../../services/water_service.js');
        
        const dbResult = await saveWaterSourceToDatabase(info, entity, this.kind);
        
        if (dbResult.success) {
          console.log(`[WATER] ✅ Fuente de agua (${this.kind}) guardada en BD:`, dbResult.water_id);
          entity.waterId = dbResult.water_id; // Guardar ID para futuras actualizaciones
        } else {
          console.warn(`[WATER] ⚠️ No se pudo guardar en BD:`, dbResult.error);
        }
      } catch (dbError) {
        console.error(`[WATER] ❌ Error al guardar en BD:`, dbError);
        // No cancelamos la colocación de la fuente de agua, solo logueamos el error
      }
      
    } catch (e) { console.warn('[WATER] error saving entity:', e); }
  }
}
