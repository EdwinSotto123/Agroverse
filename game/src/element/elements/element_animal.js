import Element from "./../element.js"
import {addImgToSquare} from "../../view/render.js";
import {TOOLBAR_CATEGORY} from "../../view/bar.js";

export default class ElementAnimal extends Element {
	constructor(animalSprites, displayName) {
		// Use the first frame of down animation as default image
		super(animalSprites.down[0]);
		this.sprites = animalSprites;
		
		this.setDisplayName(displayName);
		this.setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);
		
		// Animals should be placed on a single square (no area wizard)
		this.areaPlaceable = false;
	}

	performSetElementToSquare(square) {
		// Check if square has valid ground (any ground type is acceptable for animals)
		const hasGround = square.querySelector('img[id*="ground"]');
		if (!hasGround) {
			console.log('[ANIMAL] Cannot place animal: no valid ground found');
			return false;
		}
		
		// Create 4 static pigs randomly within a 6x6 micro-grid inside the cell
		this.createStaticPigs(square);
		this.updateQuantity(-1);
		return true;
	}

	createStaticPigs(square) {
		// Clear any existing pigs in this square
		this.clearExistingPigs(square);

		// Elevate this square so animals aren't hidden by adjacent ground tiles
		square.classList.add('has-large-element');

		// Determine cell size from style (fallback to 28px)
		const cellSize = parseInt(square.style.width || '28', 10) || 28;
		const margin = 1; // small margin from borders
		const usable = cellSize - 2 * margin;

		// We create a 6x6 virtual grid and pick one random cell in each quadrant
		const grid = 6;
		const cellStep = usable / grid; // size per micro cell

		// Define quadrants: TL, TR, BL, BR as ranges in the 6x6 grid
		const quadrants = [
			{ cx: [0, 2], cy: [0, 2] }, // top-left (3x3 area)
			{ cx: [3, 5], cy: [0, 2] }, // top-right
			{ cx: [0, 2], cy: [3, 5] }, // bottom-left
			{ cx: [3, 5], cy: [3, 5] }  // bottom-right
		];

		const maxLeft = Math.max(0, cellSize - 32);
		const maxBottom = Math.max(0, cellSize - 32);

		quadrants.forEach((q, index) => {
			// Pick random micro-cell within quadrant
			const gx = Math.floor(Math.random() * (q.cx[1] - q.cx[0] + 1)) + q.cx[0];
			const gy = Math.floor(Math.random() * (q.cy[1] - q.cy[0] + 1)) + q.cy[0];

			// Random offset inside the micro cell to avoid perfect grid look
			const jitter = Math.max(0, Math.floor(cellStep * 0.25));
			const offsetX = Math.floor(Math.random() * jitter);
			const offsetY = Math.floor(Math.random() * jitter);

			let x = Math.floor(margin + gx * cellStep + offsetX);
			let y = Math.floor(margin + gy * cellStep + offsetY);
			// Clamp so the 32x32 sprite stays fully within the cell bounds
			x = Math.max(0, Math.min(x, maxLeft));
			y = Math.max(0, Math.min(y, maxBottom));

			// Create new image instance
			const pigImg = new Image();
			pigImg.src = this.sprites.down[0].src; // Use first frame of down animation
			pigImg.setAttribute('id', `${this.getElementId()}_${index}`);
			pigImg.setAttribute('draggable', "false");
			pigImg.style.position = 'absolute';
			pigImg.style.left = `${x}px`;
			// Use bottom anchoring so sprites appear seated on the ground line
			pigImg.style.bottom = `${y}px`;
			pigImg.style.width = '32px';   // Exact sprite size
			pigImg.style.height = '32px';  // Exact sprite size
			pigImg.style.zIndex = '6';
			pigImg.classList.add('animal-pig-static');

			pigImg.onload = () => addImgToSquare(square, pigImg);
		});
	}

	clearExistingPigs(square) {
		const existingPigs = square.querySelectorAll('.animal-pig-static');
		existingPigs.forEach(pig => pig.remove());
		// If no pigs remain, remove elevated class
		if (square.querySelectorAll('.animal-pig-static').length === 0) {
			square.classList.remove('has-large-element');
		}
	}
}