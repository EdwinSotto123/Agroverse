import Element from "./../element.js"
import ActionDefault from "./../element_actions/action_default.js";
import {addImgToSquare} from "../../view/render.js";
import Map from "../../game/map.js";

export default class ElementForest extends Element {
    constructor(image, forestSize = 5, forestType = "mixed", radius = 2) {
        super(image, new ActionDefault());
        this.forestSize = forestSize;
        this.forestType = forestType;
        this.radius = radius; // distancia máxima (en casillas) desde el centro
    }

    performSetElementToSquare(square) {
        console.log("🌳 Iniciando plantado de bosque BOSQUE/BOSUQE...");
        // Plantar árboles alrededor (no en el centro), radio <= this.radius
        this.#plantAround(square);
    }

    #plantAround(centerSquare) {
        const allSquares = document.querySelectorAll('.square');
        const centerIndex = Array.from(allSquares).indexOf(centerSquare);
        const mapInstance = Map.mapInstance;
        const cols = mapInstance.squaresPerRow;
        const rows = mapInstance.numRows;

        const centerRow = Math.floor(centerIndex / cols);
        const centerCol = centerIndex % cols;

        // Generar todas las posiciones dentro del radio (excluyendo el centro)
        const candidates = [];
        for (let dy = -this.radius; dy <= this.radius; dy++) {
            for (let dx = -this.radius; dx <= this.radius; dx++) {
                if (dx === 0 && dy === 0) continue; // no centro
                const r = centerRow + dy;
                const c = centerCol + dx;
                if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
                const idx = r * cols + c;
                candidates.push(idx);
            }
        }

        // Barajar aleatoriamente
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        let planted = 0;
        for (const idx of candidates) {
            if (planted >= this.forestSize) break;
            const sq = allSquares[idx];
            if (this.#canPlantAt(sq)) {
                addImgToSquare(sq, this.getImage());
                planted++;
            }
        }
        console.log(`✅ BOSUQE plantado: ${planted}/${this.forestSize} árboles dentro de radio ${this.radius}`);
    }
    
    #canPlantAt(square) {
        const images = square.querySelectorAll('img');
        const groundImg = square.querySelector('img');
        
        // Solo debe tener la imagen del suelo
        return images.length === 1 && 
               groundImg && 
               groundImg.id !== 'ground_side' && 
               groundImg.id !== 'ground_corner';
    }
}
