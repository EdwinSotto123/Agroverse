import Element from "./../element.js";
import ActionDefault from "./../element_actions/action_default.js";
import Map from "../../game/map.js";
import {addImgToSquare, removeElementImg, displayMessageToAlertBox} from "../../view/render.js";

// Multi-tile Pig Corral: 4x5 pattern with 2x3 pigs inside
// Pattern indices (rows x cols):
// 3 2 2 2 4
// 0 1 1 1 0
// 0 1 1 1 0
// 3 2 2 2 4
// Legend: 1=pig, 2=fence_1, 3=fence_2, 4=fence_3, 0=fence_4
export default class ElementPigCorral extends Element {
  constructor(pigImg, fence1, fence2, fence3, fence4) {
    // Use pig image as the representative icon in toolbar
    super(pigImg, new ActionDefault());
    this.pigImg = pigImg;
    this.fenceImgs = { 0: fence4, 2: fence1, 3: fence2, 4: fence3 };
    this.pattern = [
      [3, 2, 2, 2, 4],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [3, 2, 2, 2, 4]
    ];
    // Internal pigs area starts at (row=1, col=1) size 2x3 relative to pattern
    this.innerOffset = { r: 1, c: 1 };
  }

  async performSetElementToSquare(topLeftInnerSquare) {
    // Ask user for generic animal info
    try {
      const { promptAnimalInfo } = await import('../../view/animal_dialog.js');
      const info = await promptAnimalInfo({ defaultCount: 6, title: 'Configurar corral de cerdos', animalLabel: 'cerdos' });
      if (!info) return false; // cancelled
      this._lastInfo = info;
      
      // ✅ GUARDAR EN BASE DE DATOS
      try {
        const { saveAnimalToDatabase } = await import('../../services/animal_service.js');
        
        // Crear entidad temporal con coordenadas para el servicio
        const tempEntity = {
          squares: [Array.from(document.querySelectorAll('.square')).indexOf(topLeftInnerSquare)]
        };
        
        const dbResult = await saveAnimalToDatabase(info, tempEntity, 'pig');
        
        if (dbResult.success) {
          console.log('[PIG CORRAL] ✅ Cerdos guardados en BD:', dbResult.animal_id);
          this.animalId = dbResult.animal_id; // Guardar ID para futuras actualizaciones
        } else {
          console.warn('[PIG CORRAL] ⚠️ No se pudo guardar en BD:', dbResult.error);
        }
      } catch (dbError) {
        console.error('[PIG CORRAL] ❌ Error al guardar en BD:', dbError);
        // No cancelamos la colocación del corral, solo logueamos el error
      }
      
    } catch (e) {
      // If dialog fails for any reason, continue without metadata
      console.warn('[ANIMAL DIALOG] Error or unavailable, continuing without metadata:', e);
      this._lastInfo = null;
    }
    // Anchor: clicked square = top-left of the inner (pigs) 2x3 area
    const squares = document.querySelectorAll('.square');
    const map = Map.mapInstance;
    const cols = map.squaresPerRow;
    const rows = map.numRows;

    const baseIndex = Array.from(squares).indexOf(topLeftInnerSquare);
    if (baseIndex < 0) return false;
    const baseRow = Math.floor(baseIndex / cols);
    const baseCol = baseIndex % cols;

    // Compute full pattern anchor (one cell up and one left from inner area)
    const anchorRow = baseRow - this.innerOffset.r;
    const anchorCol = baseCol - this.innerOffset.c;

  // Pre-validate bounds and occupancy for all cells in the 4x5 area
    const placements = [];
    for (let r = 0; r < this.pattern.length; r++) {
      for (let c = 0; c < this.pattern[0].length; c++) {
        const targetRow = anchorRow + r;
        const targetCol = anchorCol + c;
        if (targetRow < 0 || targetCol < 0 || targetRow >= rows || targetCol >= cols) {
          displayMessageToAlertBox('No hay espacio suficiente para el corral (fuera del mapa)');
          return false;
        }
        const idx = targetRow * cols + targetCol;
        const sq = squares[idx];
        if (!this.#canPlace(sq)) {
          displayMessageToAlertBox('Zona ocupada: libera espacio para colocar el corral');
          return false;
        }
        placements.push({ idx, sq, r, c, code: this.pattern[r][c] });
      }
    }

    // Place all elements
    const placedIndices = [];
    for (const p of placements) {
      // Ensure corral area uses farm ground
      this.#ensureFarmGround(p.sq);

      if (p.code === 1) {
        // Pig
        const pig = new Image();
        pig.src = this.pigImg.src;
        pig.setAttribute('id', this.getElementId()); // mark as part of this element
        pig.setAttribute('draggable', 'false');
        pig.classList.add('animal-pig-static');
        // Center-bottom alignment within the cell; under fences, above ground
        pig.style.left = '50%';
        pig.style.transform = 'translateX(-50%)';
        pig.style.bottom = '0px';
        pig.style.zIndex = '6'; // ground<6<pig<fences default
        addImgToSquare(p.sq, pig);
      } else {
        // Fence pieces (0,2,3,4)
        const fenceImg = this.fenceImgs[p.code];
        if (fenceImg) {
          const img = fenceImg.cloneNode(true);
          img.id = this.getElementId(); // mark as part of this element
          img.style.zIndex = '8'; // fences above pigs
          addImgToSquare(p.sq, img);
        }
      }
      // Elevate each square to avoid being covered by neighbors
      p.sq.classList.add('has-large-element');
      placedIndices.push(p.idx);
    }

    // Save indices on the anchor (top-left of pattern) to support batch removal
    const anchorIdx = anchorRow * cols + anchorCol;
    const anchorSq = squares[anchorIdx];
    if (anchorSq) {
      anchorSq.dataset.pigcorral = placedIndices.join(',');
      // Create entity record with metadata
      try {
        const { default: EntityStore } = await import('../../game/entity_store.js');
        const entity = EntityStore.create({
          type: 'animal-corral',
          elementId: this.getElementId(),
          w: this.pattern[0].length,
          h: this.pattern.length,
          squares: placedIndices,
          animal: 'pig',
          form: this._lastInfo || null
        });
        anchorSq.dataset.entityId = entity.id;
        // Add nameplate using the breed/species if provided
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
          } catch (e) {
            console.warn('[NAMEPLATE] No se pudo crear el cartel para animales:', e);
          }
        }
      } catch (e) {
        console.warn('[ENTITY] No se pudo crear entidad para el corral:', e);
      }
    }
    return true;
  }

  getElementAction() {
    // Optional: right-click to remove the whole corral (only if right-click flow is used)
    return {
      executor: (square) => {
        let center = square;
        let indicesStr = center.dataset?.pigcorral;
        if (!indicesStr) {
          // Try to locate the anchor in nearby squares
          const squares = document.querySelectorAll('.square');
          for (const sq of squares) {
            if (sq.dataset?.pigcorral) { center = sq; indicesStr = sq.dataset.pigcorral; break; }
          }
        }
        if (!indicesStr) return;
        const indices = indicesStr.split(',').map(n => parseInt(n, 10));
        const allSquares = document.querySelectorAll('.square');
        for (const idx of indices) {
          const sq = allSquares[idx];
          if (sq && sq.querySelectorAll('img').length > 1) {
            removeElementImg(sq);
            // Clean elevation flag if nothing else remains
            if (sq.querySelectorAll('img').length <= 1) sq.classList.remove('has-large-element');
          }
        }
        delete center.dataset.pigcorral;
      }
    }
  }

  #canPlace(square) {
    const img = square.querySelector('img');
    if (!img || img.id === 'ground_side' || img.id === 'ground_corner') return false;
    // Allow placement only if no top element is present (just ground)
    return square.querySelectorAll('img').length === 1;
  }

  #ensureFarmGround(square) {
    // Replace ground with grass_farm if the base is regular grass/variant
    const base = square.querySelector('img');
    if (!base) return;
    const id = base.id || base.getAttribute('id');
    if (id && id !== 'ground_farm' && id !== 'ground_side' && id !== 'ground_corner') {
      import('../../element/element.js').then(({ default: Element }) => {
        const farm = Element.getElementFromId('ground_farm');
        if (farm) {
          // replace ground image helper is in render.js
          import('../../view/render.js').then(m => {
            m.replaceGroundImg(square, farm.getImage());
          });
        }
      });
    }
  }
}
