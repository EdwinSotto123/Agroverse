import Element from "./../element.js";
import ActionDefault from "./../element_actions/action_default.js";
import {addImgToSquare, removeElementImg} from "../../view/render.js";
import Map from "../../game/map.js";

// Estructura fija 5x5: combina árboles, rocas y flores.
// Plantado con 1 click y eliminación con 1 click (acción por estructura).
export default class ElementBosque extends Element {
  constructor(treeImg, rockImg, flowerImg) {
    super(treeImg, new ActionDefault());
    this.treeImg = treeImg;
    this.rockImg = rockImg;
    this.flowerImg = flowerImg;
    // patrón 5x5 (0 = vacío, T = árbol, R = roca, F = flor)
    // centrado respecto al tile clicado (posición [2,2])
    this.pattern = [
      [0, 'T', 0, 'F', 0],
      ['R', 'T', 'F', 'T', 'R'],
      [0, 'F', 'T', 'F', 0],
      ['R', 'T', 'F', 'T', 'R'],
      [0, 'F', 0, 'T', 0]
    ];
  }

  performSetElementToSquare(centerSquare) {
    const squares = document.querySelectorAll('.square');
    const map = Map.mapInstance;
    const cols = map.squaresPerRow;
    const rows = map.numRows;

    const centerIndex = Array.from(squares).indexOf(centerSquare);
    const centerRow = Math.floor(centerIndex / cols);
    const centerCol = centerIndex % cols;

    // Guardar las casillas donde colocamos algo para permitir borrado en 1 click
    const placedIndices = [];

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const targetRow = centerRow + r;
        const targetCol = centerCol + c;
        if (targetRow < 0 || targetCol < 0 || targetRow >= rows || targetCol >= cols) continue;
        const idx = targetRow * cols + targetCol;
        const sq = squares[idx];
        const cell = this.pattern[r + 2][c + 2];
        if (!cell) continue;
        if (!this.#canPlace(sq)) continue;

        switch (cell) {
          case 'T': {
            const img = this.treeImg.cloneNode(true);
            img.id = this.getElementId(); // asegurar que el click derecho resuelva a ElementBosque
            addImgToSquare(sq, img);
            placedIndices.push(idx);
            break;
          }
          case 'R': {
            const img = this.rockImg.cloneNode(true);
            img.id = this.getElementId();
            addImgToSquare(sq, img);
            placedIndices.push(idx);
            break;
          }
          case 'F': {
            const img = this.flowerImg.cloneNode(true);
            img.id = this.getElementId();
            addImgToSquare(sq, img);
            placedIndices.push(idx);
            break;
          }
        }
      }
    }

    // Asignar dataset a la casilla central para permitir eliminación del bloque
    centerSquare.dataset.bosque = placedIndices.join(',');
  }

  // Al hacer click derecho sobre cualquiera de los elementos del bosque, borrar todo
  getElementAction() {
    // acción inline para borrar estructura 5x5
    return {
      executor: (square) => {
        const center = square; // intentar desde square y si no es centro, buscar el centro con dataset
        let indicesStr = center.dataset?.bosque;
        if (!indicesStr) {
          // Si no se hizo click sobre el centro, intentar encontrar el centro más cercano con dataset
          const squares = document.querySelectorAll('.square');
          for (const sq of squares) {
            if (sq.dataset?.bosque) { indicesStr = sq.dataset.bosque; break; }
          }
        }
        if (!indicesStr) return;
        const indices = indicesStr.split(',').map(n => parseInt(n, 10));
        const squares = document.querySelectorAll('.square');
        for (const idx of indices) {
          const sq = squares[idx];
          // eliminar el elemento superior si existe
          if (sq.querySelectorAll('img').length > 1) {
            removeElementImg(sq);
          }
        }
        delete center.dataset.bosque;
      }
    }
  }

  #canPlace(square) {
    const img = square.querySelector('img');
    if (!img || img.id === 'ground_side' || img.id === 'ground_corner') return false;
    // sin elemento encima
    return square.querySelectorAll('img').length === 1;
  }
}
