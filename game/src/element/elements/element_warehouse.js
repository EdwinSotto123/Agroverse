import Element from "../element.js";
import ActionDefault from "../element_actions/action_default.js";
import Map from "../../game/map.js";
import { addImgToSquare, displayMessageToAlertBox } from "../../view/render.js";
import EntityStore from "../../game/entity_store.js";
import { infiniteResources } from "../../game_manager/game_settings.js";
import Player from "../../game/player.js";

export default class ElementWarehouse extends Element {
  /**
   * @param {HTMLImageElement} image
   * @param {('alimentos'|'materiales')} kind
   */
  constructor(image, kind) {
    super(image, new ActionDefault());
    this.kind = kind;
    this._lastInfo = null;
  }

  async setElementToSquare(square) {
    // Prompt BEFORE consuming quantity
    const { promptWarehouseInfo } = await import('../../view/warehouse_dialog.js');
    const title = this.kind === 'alimentos' ? 'Configurar Almacén de Alimentos' : 'Configurar Almacén de Materiales';
    const info = await promptWarehouseInfo({ title, kind: this.kind });
    if (!info) return; // cancel
    this._lastInfo = info;

    if (Map.mapInstance.isSquareContainMaxElement(square)) {
      return displayMessageToAlertBox('La celda está llena');
    }

    // Place element image
    addImgToSquare(square, this.getImage());

    // Consume quantity only after successful place
    if (!infiniteResources) {
      Player.player.decreaseHandElementQuantity();
      if (Player.player.getHandElementQuantity() <= 0)
        Player.player.removeHandElement();
    }

    // Persist entity metadata
    try {
      const entity = EntityStore.create({
        type: 'warehouse',
        elementId: this.getElementId(),
        kind: this.kind,
        form: this._lastInfo || null,
        w: 1, h: 1
      });
      const squares = Array.from(document.querySelectorAll('.square'));
      const idx = squares.indexOf(square);
      entity.squares = idx >= 0 ? [idx] : [];
      square.dataset.entityId = entity.id;
      
      // ✅ GUARDAR EN BASE DE DATOS
      try {
        const { saveWarehouseToDatabase } = await import('../../services/warehouse_service.js');
        
        const dbResult = await saveWarehouseToDatabase(info, entity, this.kind);
        
        if (dbResult.success) {
          console.log(`[WAREHOUSE] ✅ Almacén guardado en BD:`, dbResult.warehouse_id);
          entity.warehouseId = dbResult.warehouse_id; // Guardar ID para futuras actualizaciones
        } else {
          console.warn(`[WAREHOUSE] ⚠️ No se pudo guardar en BD:`, dbResult.error);
        }
      } catch (dbError) {
        console.error(`[WAREHOUSE] ❌ Error al guardar en BD:`, dbError);
        // No cancelamos la colocación del almacén, solo logueamos el error
      }
      
    } catch (e) {
      console.warn('[WAREHOUSE] error saving entity:', e);
    }
  }
}
