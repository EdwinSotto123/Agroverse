import {fetchHtmlPage} from "../utils.js";
import {toggleClimateWidget} from "./climate_alerts.js";

export default class Menu {
    static menus = new Map();
    static menuHtmlDiv = document.getElementById("menus");

    constructor(htmlFileName) {
        this.htmlFileName = htmlFileName;
        Menu.menus.set(htmlFileName, this);
    }

    static closeCurrentMenu() {
        Menu.menuHtmlDiv.firstChild.remove();
        // Show climate widget when menu is closed
        toggleClimateWidget(true);
    }

    openMenu() {
        Menu.menuHtmlDiv.appendChild(this.menuHtmlContent)
        // Hide climate widget when menu is open
        toggleClimateWidget(false);
    }

    displayMenu() {
        const firstChild = Menu.menuHtmlDiv.firstElementChild;
        if (firstChild)
            Menu.closeCurrentMenu();
        if (!firstChild || firstChild.id !== this.htmlFileName)
            this.openMenu();
    }

    async init() {
        const menuDiv = document.createElement("div");
        menuDiv.className = "menu";
        menuDiv.setAttribute("id", this.htmlFileName);
        await fetchHtmlPage(this.htmlFileName).then(html => {
            menuDiv.innerHTML = html;
            this.menuHtmlContent = menuDiv;
        })
    }

    build() {
        throw Error("This function need to be implemented");
    }

    static getMenu(menuId) {
        return Menu.menus.get(menuId);
    }

    static getCurrentMenu() {
        return Menu.menuHtmlDiv.firstElementChild;
    }

    static haveMenuActive() {
        return Menu.menuHtmlDiv.hasChildNodes();
    }
}