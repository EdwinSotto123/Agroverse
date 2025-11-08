import Element from "./../element.js"
import ActionHarvest from "../element_actions/action_harvest.js";
import {newImages, getImageNumber} from "../../utils.js";
import {addImgToSquare, replaceElementImg} from "../../view/render.js";
import {timeToGrow} from "../../game_manager/game_settings.js";
import {TOOLBAR_CATEGORY, updateToolBarQuantity} from "../../view/bar.js";
import Player from "../../game/player.js";

export default class ElementCrop extends Element {
	constructor(image, displayName, timeToGrow, resource, resourceNumber = 1) {
		super(image, new ActionHarvest());
		this.timeToGrowth = timeToGrow;
		this.setLootable(resource, resourceNumber)
		this.stageImages = this.setImagesStage();
		this.setDisplayName(displayName)
		this.setHtmlDisplayCategory(TOOLBAR_CATEGORY.CROP)
		// Enable area placement dialog for crops
		this.areaPlaceable = true;
	}

	performSetElementToSquare(square) {
		if (!square.querySelector('img#ground_farm'))
			return;
		addImgToSquare(square, this.stageImages[0]);
		for (let i= 1; i <= this.stageImages.length - 1; i++) {
			setTimeout(() => {
				replaceElementImg(square, this.stageImages[i]);
			}, this.#cropGrowthCalculation(i));
		}
		this.updateQuantity(-1)
	}

	#cropGrowthCalculation(stage) {
		return (this.timeToGrowth * stage + (Math.random() * this.timeToGrowth)) * timeToGrow;
	}

	isGrown(number) {
		return number === this.stageImages.length - 1;
	}

	setImagesStage() {
		const imageSrc = this.getElementImageSrc();
		
		// Check if this is a new vegetable crop with numbered stages
		if (imageSrc.includes('vegetagles/growing_plants/')) {
			return this.setNewVegetableStages(imageSrc);
		}
		
		// Original system for old crops
		const number = getImageNumber(imageSrc);
		const path = imageSrc.replace(/[0-9]/, "");
		let stageImageTmp = newImages(path, this.getElementId(), number);
		stageImageTmp.push(this.image);
		return stageImageTmp;
	}

	setNewVegetableStages(imageSrc) {
		// Extract plant name and total stages
		// Example: "assets/image/vegetagles/growing_plants/beet/beet_13.png"
		const pathParts = imageSrc.split('/');
		const plantName = pathParts[pathParts.length - 2]; // "beet"
		const fileName = pathParts[pathParts.length - 1]; // "beet_13.png"
		const totalStages = parseInt(fileName.split('_')[1].split('.')[0]); // 13
		
		const basePath = imageSrc.substring(0, imageSrc.lastIndexOf('/') + 1);
		const stageImages = [];
		
		// Create images for all stages from 1 to totalStages
		for (let i = 1; i <= totalStages; i++) {
			const img = new Image();
			img.src = `${basePath}${plantName}_${i}.png`;
			img.setAttribute('id', this.getElementId());
			img.setAttribute('draggable', "false");
			img.style.zIndex = this.image.style.zIndex;
			stageImages.push(img);
		}
		
		return stageImages;
	}
}