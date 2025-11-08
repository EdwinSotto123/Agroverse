  import Element from "./../element.js";
import ActionDefault from "./../element_actions/action_default.js";
import Map from "../../game/map.js";
import {addImgToSquare, removeElementImg} from "../../view/render.js";

// Generic multi-tile Animal Corral (4x5) with inner 2x3 animals
export default class ElementAnimalCorral extends Element {
  /**
   * @param {string} animalName - e.g., 'sheep'
   * @param {HTMLImageElement} animalImg - representative animal image
   * @param {{0:HTMLImageElement,2:HTMLImageElement,3:HTMLImageElement,4:HTMLImageElement}} fenceImgs
   * @param {string} groundId - element id for ground to apply in area (e.g., 'ground_farm' or 'ground_plain')
   * @param {number[][]} [pattern] - default 4x5 layout as in pig corral
   */
  constructor(animalName, animalImg, fenceImgs, groundId, pattern = [[3,2,2,2,4],[0,1,1,1,0],[0,1,1,1,0],[3,2,2,2,4]]) {
    super(animalImg, new ActionDefault());
    this.animalName = animalName;
    this.animalImg = animalImg;
    this.fenceImgs = fenceImgs;
    this.groundId = groundId;
    this.pattern = pattern;
    this.innerOffset = { r: 1, c: 1 }; // animals area top-left inside pattern
  }

  async performSetElementToSquare(topLeftInnerSquare) {
    // Ask user via generic animal dialog
    try {
      const { promptAnimalInfo } = await import('../../view/animal_dialog.js');
      const info = await promptAnimalInfo({ defaultCount: 6, title: `Configurar corral de ${this.animalName}`, animalLabel: this.animalName });
      if (!info) return false;
      this._lastInfo = info;
      
      // ✅ GUARDAR EN BASE DE DATOS
      try {
        const { saveAnimalToDatabase } = await import('../../services/animal_service.js');
        
        // Crear entidad temporal con coordenadas para el servicio
        const tempEntity = {
          squares: [Array.from(document.querySelectorAll('.square')).indexOf(topLeftInnerSquare)]
        };
        
        const dbResult = await saveAnimalToDatabase(info, tempEntity, this.animalName);
        
        if (dbResult.success) {
          console.log(`[ANIMAL CORRAL] ✅ ${this.animalName} guardado en BD:`, dbResult.animal_id);
          this.animalId = dbResult.animal_id; // Guardar ID para futuras actualizaciones
        } else {
          console.warn(`[ANIMAL CORRAL] ⚠️ No se pudo guardar en BD:`, dbResult.error);
        }
      } catch (dbError) {
        console.error(`[ANIMAL CORRAL] ❌ Error al guardar en BD:`, dbError);
        // No cancelamos la colocación del corral, solo logueamos el error
      }
      
    } catch (e) {
      console.warn('[ANIMAL DIALOG] error:', e);
      this._lastInfo = null;
    }

    const squares = document.querySelectorAll('.square');
    const map = Map.mapInstance;
    const cols = map.squaresPerRow;
    const rows = map.numRows;

    const baseIndex = Array.from(squares).indexOf(topLeftInnerSquare);
    if (baseIndex < 0) return false;
    const baseRow = Math.floor(baseIndex / cols);
    const baseCol = baseIndex % cols;
    const anchorRow = baseRow - this.innerOffset.r;
    const anchorCol = baseCol - this.innerOffset.c;

    const placements = [];
    for (let r = 0; r < this.pattern.length; r++) {
      for (let c = 0; c < this.pattern[0].length; c++) {
        const targetRow = anchorRow + r;
        const targetCol = anchorCol + c;
        if (targetRow < 0 || targetCol < 0 || targetRow >= rows || targetCol >= cols) {
          import('../../view/render.js').then(m => m.displayMessageToAlertBox('No hay espacio suficiente para el corral'));
          return false;
        }
        const idx = targetRow * cols + targetCol;
        const sq = squares[idx];
        if (!this.#canPlace(sq)) {
          import('../../view/render.js').then(m => m.displayMessageToAlertBox('Zona ocupada: libera espacio'));
          return false;
        }
        placements.push({ idx, sq, r, c, code: this.pattern[r][c] });
      }
    }

    const placedIndices = [];
    for (const p of placements) {
      await this.#ensureGround(p.sq);
      if (p.code === 1) {
        // Animal sprite centered bottom
        const img = new Image();
        img.src = this.animalImg.src;
        img.setAttribute('id', this.getElementId());
        img.setAttribute('draggable', 'false');
        img.classList.add('animal-static');
        img.style.left = '50%';
        img.style.transform = 'translateX(-50%)';
        img.style.bottom = '0px';
        img.style.zIndex = '6';
        addImgToSquare(p.sq, img);
      } else {
        const fence = this.fenceImgs[p.code];
        if (fence) {
          const f = fence.cloneNode(true);
          f.id = this.getElementId();
          f.style.zIndex = '8';
          addImgToSquare(p.sq, f);
        }
      }
      p.sq.classList.add('has-large-element');
      placedIndices.push(p.idx);
    }

    // Save entity and optional nameplate with breed
    const anchorIdx = anchorRow * cols + anchorCol;
    const anchorSq = squares[anchorIdx];
    if (anchorSq) {
      anchorSq.dataset.animalcorral = placedIndices.join(',');
      try {
        const { default: EntityStore } = await import('../../game/entity_store.js');
        const e = EntityStore.create({
          type: 'animal-corral',
          elementId: this.getElementId(),
          animal: this.animalName,
          w: this.pattern[0].length,
          h: this.pattern.length,
          squares: placedIndices,
          form: this._lastInfo || null
        });
        anchorSq.dataset.entityId = e.id;
      } catch (e) { console.warn('[ENTITY] error:', e); }

      if (this._lastInfo && (this._lastInfo.breed || '').trim()) {
        try {
          const { createCropNameplate } = await import('../../view/crop_nameplate.js');
          const plate = createCropNameplate(this._lastInfo.breed.trim());
          if (plate) {
            plate.style.left = '-74px';
            plate.style.top = '50%';
            plate.style.transform = 'translateY(-50%)';
            anchorSq.style.position = 'relative';
            anchorSq.style.overflow = 'visible';
            anchorSq.dataset.nameplate = 'true';
            anchorSq.appendChild(plate);
          }
        } catch (e) { console.warn('[NAMEPLATE] error:', e); }
      }
    }
    return true;
  }

  getElementAction() {
    return {
      executor: (square) => {
        let center = square;
        let indicesStr = center.dataset?.animalcorral;
        if (!indicesStr) {
          const squares = document.querySelectorAll('.square');
          for (const sq of squares) { if (sq.dataset?.animalcorral) { center = sq; indicesStr = sq.dataset.animalcorral; break; } }
        }
        if (!indicesStr) return;
        const indices = indicesStr.split(',').map(n => parseInt(n, 10));
        const allSquares = document.querySelectorAll('.square');
        for (const idx of indices) {
          const sq = allSquares[idx];
          if (sq && sq.querySelectorAll('img').length > 1) {
            removeElementImg(sq);
            if (sq.querySelectorAll('img').length <= 1) sq.classList.remove('has-large-element');
          }
        }
        delete center.dataset.animalcorral;
      }
    }
  }

  #canPlace(square) {
    const img = square.querySelector('img');
    if (!img || img.id === 'ground_side' || img.id === 'ground_corner') return false;
    return square.querySelectorAll('img').length === 1;
  }

  async #ensureGround(square) {
    const base = square.querySelector('img');
    if (!base) return;
    const id = base.id || base.getAttribute('id');
    if (id && id !== this.groundId && id !== 'ground_side' && id !== 'ground_corner') {
      const [{ default: Element }, render] = await Promise.all([
        import('../../element/element.js'),
        import('../../view/render.js')
      ]);
      const groundElem = Element.getElementFromId(this.groundId);
      if (groundElem) render.replaceGroundImg(square, groundElem.getImage());
    }
  }
}
