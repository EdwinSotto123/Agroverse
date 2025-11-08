import {addChildToResourceBar, updateResourceBarNumber} from "../view/bar.js";


export default class Resource {
	static resources = new Map();

	constructor(displayName, image) {
		this.displayName = displayName;
		this.image = image;
		this.quantity = 0;

	// Resource bar removed: skip DOM creation/append

		Resource.resources.set(this.getResourceId(), this);
	}


	setPrice(sellPrice, buyPrice) {
		this.sellPrice = sellPrice;
		this.buyPrice = buyPrice;
		return this;
	}

	getSellPrice() {
		return this.sellPrice;
	}

	getBuyPrice() {
		return this.buyPrice;
	}

	haveEconomy() {
		return this.getBuyPrice() || this.getSellPrice();
	}

	getQuantity() {
		return this.quantity;
	}

	updateQuantity(quantityValue) {
		this.quantity += quantityValue;
	// Resource bar removed: no UI update
	}

	getResourceFromId(id) {}

	getResourceId() {
		return this.image.id;
	}

	getImage() {
		return this.image;
	}

	static getResource(resourceId) {
		return Resource.resources.get(resourceId);
	}
}