import Map from "./../game/map.js";
import {addChildToToolBar, updateToolBarQuantity, TOOLBAR_CATEGORY} from "../view/bar.js";
import {displayMessageToAlertBox, replaceGroundImg} from "../view/render.js";
import EntityStore from "../game/entity_store.js";
import {infiniteResources} from "../game_manager/game_settings.js";
import Player from "../game/player.js";


export default class Element {
    static elements = [];

    constructor(image, elementAction) {
        if (this.constructor === Element)
            throw new Error("Abstract classes can't be instantiated.");
        this.image = image;
        this.elementAction = elementAction;
        this.quantity = 0;
        Element.elements.push(this);
    }

    setNaturalSpawnChance(naturalSpawnChance) {
        this.naturalSpawnChance = naturalSpawnChance;
        return this;
    }

    setLootable(resource, resourceNumber = 1) {
        this.resource = resource;
        this.resourceNumber = resourceNumber;
        return this;
    }

    setDisplayName(displayName) {
        this.displayName = displayName;
        return this;
    }

    async setElementToSquare(square) {
        // If this element supports area placement, ask user for size first
        if (this.areaPlaceable) {
            const { promptAreaSize } = await import('../view/area_dialog.js');
            const res = await promptAreaSize({ title: 'Plantar área', labelW: 'Ancho (celdas)', labelH: 'Alto (celdas)' });
            if (!res) return; // cancelled
            // res.geo may contain { lat, lon, address, display_name }
            if (res.geo) {
                console.log('[AREA] Geo seleccionado:', res.geo);
            }

            const startIndex = Array.from(document.querySelectorAll('.square')).indexOf(square);
            const cols = Map.mapInstance.squaresPerRow;
            const totalSquares = document.querySelectorAll('.square');
            let placed = 0;
            const coveredIndices = [];

            for (let dy = 0; dy < res.h; dy++) {
                for (let dx = 0; dx < res.w; dx++) {
                    const idx = startIndex + dy * cols + dx;
                    const target = totalSquares[idx];
                    if (!target) continue; // out of bounds
                    if (Map.mapInstance.isSquareContainMaxElement(target)) continue;

                    // Auto-plow: convert ground to 'ground_farm' before planting (skip borders/corners)
                    const groundImg = target.querySelector('img');
                    if (groundImg) {
                        const gid = groundImg.id || groundImg.getAttribute('id');
                        if (gid !== 'ground_farm' && gid !== 'ground_side' && gid !== 'ground_corner') {
                            const farmImg = Element.getElementFromId('ground_farm')?.getImage();
                            if (farmImg) {
                                replaceGroundImg(target, farmImg);
                            }
                        }
                    }
                    // Place using performSetElementToSquare to keep element-specific rules
                    this.performSetElementToSquare(target);
                    placed++;
                    coveredIndices.push(idx);
                }
            }

            if (!infiniteResources) {
                // Decrease quantity by placed count if it is a consumable element
                for (let i = 0; i < placed; i++) Player.player.decreaseHandElementQuantity();
                if (Player.player.getHandElementQuantity() <= 0) Player.player.removeHandElement();
            }

            // Create an entity representing this planted area (attach to top-left square)
            if (coveredIndices.length > 0) {
                const entity = EntityStore.create({
                    type: 'crop-area',
                    elementId: this.getElementId(),
                    w: res.w,
                    h: res.h,
                    cropName: res.cropName || null, // Add crop name to entity
                    geo: res.geo || null,
                    areaMeasure: res.areaMeasure || null,
                    plantedAt: res.plantedAt || null,
                    harvestAt: res.harvestAt || null,
                    variety: res.variety || null,
                    irrigation: res.irrigation || null,
                    fertilization: res.fertilization || null,
                    pests: res.pests || null,
                    cropType: res.cropType || null,
                    seedOrigin: res.seedOrigin || null,
                    soilType: res.soilType || null,
                    soilPreparation: res.soilPreparation || null,
                    density: res.density || null,
                    expectedYield: res.expectedYield || null,
                    previousCrop: res.previousCrop || null,
                    companionPlants: res.companionPlants || null,
                    mulching: res.mulching || null,
                    organicPractices: res.organicPractices || null,
                    challenges: res.challenges || null,
                    notes: res.notes || null,
                    squares: coveredIndices
                });

                // 🔹 GUARDAR EN BASE DE DATOS + GENERAR DATOS METEOROLÓGICOS
                console.log('[ELEMENT] 💾 Guardando cultivo en base de datos...');
                import('../services/crop_service.js').then(async ({ saveCropToDatabase, showCropNotification }) => {
                    try {
                        const dbResult = await saveCropToDatabase(res, entity);
                        
                        if (dbResult.success) {
                            // Vincular IDs de la BD con la entidad del juego
                            entity.cultivoId = dbResult.cultivo_id; // Para el dashboard
                            entity.cultivo_id = dbResult.cultivo_id; // Compatibilidad
                            entity.weatherId = dbResult.weather_id; // Para el dashboard
                            entity.weather_id = dbResult.weather_id; // Compatibilidad
                            
                            console.log('[ELEMENT] ✅ Cultivo guardado en BD. ID:', dbResult.cultivo_id);
                            showCropNotification('✅ Cultivo guardado exitosamente', 'success');
                        } else {
                            console.warn('[ELEMENT] ⚠️ No se pudo guardar en BD:', dbResult.error);
                            showCropNotification('⚠️ Cultivo creado localmente (sin conexión a BD)', 'warning');
                        }
                    } catch (err) {
                        console.error('[ELEMENT] ❌ Error al guardar cultivo:', err);
                        showCropNotification('❌ Error al guardar cultivo en BD', 'error');
                    }
                }).catch(err => {
                    console.error('[ELEMENT] ❌ Error al cargar crop_service:', err);
                });

                const firstSquare = totalSquares[coveredIndices[0]];
                if (firstSquare) {
                    firstSquare.dataset.entityId = entity.id;
                    
                    // Add crop nameplate if name is provided
                    if (res.cropName && res.cropName.trim()) {
                        this.addCropNameplate(firstSquare, res.cropName.trim());
                    }
                }
                console.log('[ENTITY] creado:', entity);
            }
            return;
        }

        // Single placement default flow
        if (Map.mapInstance.isSquareContainMaxElement(square))
            return displayMessageToAlertBox(ENG_LANG.SQUARE_FULL);
        if (!infiniteResources) {
            Player.player.decreaseHandElementQuantity();
            if (Player.player.getHandElementQuantity() <= 0)
                Player.player.removeHandElement();
        }
        this.performSetElementToSquare(square);
    }

    performSetElementToSquare(square) {
        throw new Error("This function need to be implemented");
    }

    setHtmlDisplayCategory(htmlDisplayCategory) {
        const div = document.createElement('div');
		div.appendChild(this.image);

		let spanName = `<span class="txt">${this.displayName}</span>`;
        let spanNumber = `<span class="txtNumber">0</span>`;
		div.insertAdjacentHTML('beforeend', spanName);
        if (!infiniteResources)
            div.insertAdjacentHTML('beforeend', spanNumber);
        addChildToToolBar(htmlDisplayCategory, div);
        this.elementHtmlDiv = div;
        return this;
    }

    setBlockChild(blockChild) {
        this.blockChild = blockChild;
        return this;
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
        updateToolBarQuantity(this, this.quantity)
    }

    getResource() {
        return this.resource;
    }

    getResourceNumber() {
        return this.resourceNumber;
    }

    getBlockChild() {
        return this.blockChild;
    }

    getImage() {
        return this.image;
    }

    getElementAction() {
        return this.elementAction;
    }

    getElementId() {
        return this.image.getAttribute("id");
    }

    /**
     * Add crop nameplate to a square
     * @param {HTMLElement} square - The square element to add nameplate to
     * @param {string} cropName - The name to display on the nameplate
     */
    addCropNameplate(square, cropName) {
        if (!square || !cropName) return;

        // Import nameplate module dynamically
        import('../view/crop_nameplate.js').then(module => {
            const nameplate = module.createCropNameplate(cropName);
            if (nameplate) {
                // Position nameplate to the left side of the square
                nameplate.style.left = '-74px'; // To the left of the square
                nameplate.style.top = '50%'; // Vertically centered with the square
                nameplate.style.transform = 'translateY(-50%)'; // Center vertically
                
                // Ensure square container supports the nameplate
                square.style.position = 'relative';
                square.style.overflow = 'visible';
                square.style.zIndex = '10';
                
                // Mark square as having nameplate
                square.dataset.nameplate = 'true';
                
                square.appendChild(nameplate);
                
                console.log('[NAMEPLATE] Added nameplate for:', cropName);
            }
        }).catch(err => {
            console.error('[NAMEPLATE] Error loading nameplate module:', err);
        });
    }

    getElementImageSrc() {
        return this.image.getAttribute("src");
    }

    static getElementFromId(id) {
       return Element.elements.find(element => element.getElementId().toUpperCase() === id.toUpperCase());
    }
}