import {infiniteResources} from "../game_manager/game_settings.js";

const ressourcebarRoot = document.getElementById('ressourcebar');
const resourceBarElement = ressourcebarRoot ? ressourcebarRoot.getElementsByTagName('ul')[0] : null;

export const TOOLBAR_CATEGORY = {
    CROP: document.getElementById('dropup-crop'),
    ANIMAL: document.getElementById('dropup-animal'),
    FENCE: document.getElementById('dropup-fence'),
    WATER: document.getElementById('dropup-water'),
    TOOL: document.getElementById('dropup-tools')
}

export function addChildToResourceBar(element) {
    if (!resourceBarElement) {
        console.warn('[BAR] resource bar not found; skipping addChildToResourceBar');
        return;
    }
    resourceBarElement.appendChild(element);
}

/**
 * Add a certain number to a resource in the displayed resource navbar.
 *
 * This function is used to update the quantity of a resource displayed
 * in the navigation bar of the user interface
 *
 * @param {Resource} resource - The resource to add
 * @param {int} number - The amount of resource to add
 */
export function updateResourceBarNumber(resource, number) {
    if (!resourceBarElement) return;
    const img = resourceBarElement.querySelector(`li img[id="${resource.getResourceId()}"]`);
    if (!img) return;
    const span = img.parentElement.querySelector('span');
    if (span) span.textContent = number.toString()
}

export function addChildToToolBar(toolbarCategory, element) {
    toolbarCategory.appendChild(element);
}

export function updateToolBarQuantity(element, quantity) {
    if (infiniteResources)
        return;
    element.elementHtmlDiv.querySelector(".txtNumber").textContent = quantity.toString();
}