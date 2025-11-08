import Element from "./../element.js"
import ActionDefault from "./../element_actions/action_default.js";
import {addImgToSquare} from "../../view/render.js";

export default class ElementDefault extends Element {
	constructor(image, elementAction =  new ActionDefault(), resource, resourceNumber = 1) {
		super(image, elementAction);
		this.setLootable(resource, resourceNumber)
	}

	performSetElementToSquare(square) {
		addImgToSquare(square, this.getImage());
		//updateToolBarQuantity(this, -1);
	}
}

// Special tool element that performs side-effects on click without placing an image
export class ElementTool extends Element {
	constructor(image, displayName, onClick) {
		super(image, new ActionDefault());
		this.setDisplayName(displayName);
		this.onClick = onClick; // (square) => void
	}

	setHtmlDisplayCategory(htmlDisplayCategory) {
		super.setHtmlDisplayCategory(htmlDisplayCategory);
		return this;
	}

	setElementToSquare(square) {
		// Tools bypass the maximum element check and work directly
		this.performSetElementToSquare(square);
	}

	performSetElementToSquare(square) {
		// Tools don't place an image; they perform custom logic
		if (typeof this.onClick === 'function') this.onClick(square);
		// Do not decrease quantity since tools are infinite and not resources
	}
}