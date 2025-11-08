import ElementGround from "../element/elements/element_ground.js";
import ActionPlowe from "../element/element_actions/action_plowe.js";
import ActionUnplowe from "../element/element_actions/action_unplowe.js";
import ElementDefault, {ElementTool} from "../element/elements/element_default.js";
import ElementForest from "../element/elements/element_forest.js";
import ElementBosque from "../element/elements/element_bosque.js";
import ElementAnimal from "../element/elements/element_animal.js";
import ElementPigCorral from "../element/elements/element_pig_corral.js";
import ElementWater from "../element/elements/element_water.js";
import ElementLibrary from "../element/elements/element_library.js";
import ElementAnimalCorral from "../element/elements/element_animal_corral.js";
import ElementWarehouse from "../element/elements/element_warehouse.js";
import Resource from "../game/resource.js";
import Element from "../element/element.js";
import ElementCrop from "../element/elements/element_crop.js";
import Button from "../view/button.js";
import ButtonApply from "../view/buttons/button_apply.js";
import ButtonBuy from "../view/buttons/button_buy.js";
import ButtonSell from "../view/buttons/button_sell.js";
import ButtonClose from "../view/buttons/button_close.js";
import ButtonMore from "../view/buttons/button_more.js";
import Menu from "../view/menu.js";
import * as Listeners from "./listeners.js";
import {IMG, IMG_ICON, IMG_TOOL, PIG_SPRITES, IMG_EXTRA} from "./game_assets.js";
import MenuShop from "../view/menus/menu_shop.js";
import MenuShopMore from "../view/menus/menu_shop_more.js";
import Player from "../game/player.js";
import {TOOLBAR_CATEGORY} from "../view/bar.js";
import defineGameSettings from "./game_settings.js";
import Map from "../game/map.js";
import PlayerCharacter from "../game/player_character.js";
import {TOOLBAR_CATEGORY as TOOLBAR_CAT} from "../view/bar.js";
import {replaceGroundImg} from "../view/render.js";
import EntityStore from "../game/entity_store.js";
import {showCropInfoPanel} from "../view/crop_info_panel.js";
import {initAiChat} from "../view/ai_chat.js";
import {createClimateAlertsWidget, updateGameClimateData} from "../view/climate_alerts.js";

export default function loadGame() {
    loadListeners();
    new Map();
    // Create farmer character once map exists
    const farmer = new PlayerCharacter({ speed: 3 });

    // Auto-plant a house at the nearest available square to the farmer
    // and open the user profile form on the very first start.
    if (!window.__houseAutoPlanted) {
        window.__houseAutoPlanted = true;
        // small delay to ensure map/squares/DOM are ready
        setTimeout(() => {
            try {
                const mapInst = Map.mapInstance;
                if (!mapInst || !Map.map) return;

                const cellSize = mapInst.cellSize || 32;
                const farmerCenterX = (farmer.x || 0) + (farmer.size || cellSize) / 2;
                const farmerCenterY = (farmer.y || 0) + (farmer.size || cellSize) / 2;

                const col = Math.floor(farmerCenterX / cellSize);
                const row = Math.floor(farmerCenterY / cellSize);

                const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
                const startRow = clamp(row, 0, mapInst.numRows - 1);
                const startCol = clamp(col, 0, mapInst.squaresPerRow - 1);

                // Spiral search for the nearest non-full square
                let targetSquare = null;
                const maxRadius = Math.max(mapInst.numRows, mapInst.squaresPerRow);
                for (let radius = 0; radius <= maxRadius && !targetSquare; radius++) {
                    for (let dy = -radius; dy <= radius && !targetSquare; dy++) {
                        for (let dx = -radius; dx <= radius && !targetSquare; dx++) {
                            const r = startRow + dy;
                            const c = startCol + dx;
                            if (r < 0 || r >= mapInst.numRows || c < 0 || c >= mapInst.squaresPerRow) continue;
                            const rowEl = Map.map.children[r];
                            if (!rowEl) continue;
                            const sq = rowEl.children[c];
                            if (!sq) continue;
                            if (!mapInst.isSquareContainMaxElement(sq)) {
                                targetSquare = sq;
                                break;
                            }
                        }
                    }
                }

                if (targetSquare) {
                    const house = Element.getElementFromId('house');
                    if (house) {
                        house.setElementToSquare(targetSquare);
                        console.log('[AUTO-HOUSE] House auto-planted at nearest square', targetSquare);
                    }
                } else {
                    console.warn('[AUTO-HOUSE] No available square found to plant house');
                }

                // Open the user profile form so player can fill it
                import('../view/user_profile.js').then(m => m.openUserProfile()).catch(err => console.error('[AUTO-HOUSE] openUserProfile failed', err));
            } catch (err) {
                console.error('[AUTO-HOUSE] Error during auto-plant', err);
            }
        }, 200);
    }
    
    // Initialize AI Chat in game scenario
    initAiChat();
    
    // Initialize Climate Alerts Widget
    setTimeout(() => {
        createClimateAlertsWidget();
        // Initial climate data update
        updateGameClimateData();
    }, 1000); // Delay to ensure everything is loaded
    
    // Load saved crops from database - wait for map to be fully ready
    waitForMapReady().then(() => {
        console.log('[GAME LOADER] 🗺️ Mapa listo, cargando cultivos guardados...');
        import('./crop_loader.js').then(m => {
            m.loadAndRenderCrops().catch(err => {
                console.error('[GAME LOADER] ❌ Error loading crops:', err);
            });
        }).catch(err => {
            console.error('[GAME LOADER] ❌ Error importing crop_loader:', err);
        });
    });
}

/**
 * Espera a que el mapa esté completamente generado
 */
async function waitForMapReady() {
    return new Promise((resolve) => {
        const checkMap = () => {
            const Map = window.Map;
            if (!Map || !Map.map) {
                setTimeout(checkMap, 100);
                return;
            }
            
            const squares = Map.map.querySelectorAll('.square');
            const expectedSquares = (Map.mapInstance?.squaresPerRow || 100) * (Map.mapInstance?.numRows || 50);
            
            if (squares.length >= expectedSquares) {
                console.log(`[GAME LOADER] ✓ Mapa completamente generado: ${squares.length} casillas`);
                // Esperar un poco más para asegurar que todo está renderizado
                setTimeout(resolve, 500);
            } else {
                console.log(`[GAME LOADER] ⏳ Esperando mapa... ${squares.length}/${expectedSquares} casillas`);
                setTimeout(checkMap, 100);
            }
        };
        
        checkMap();
    });
}

export async function preLoadGame() {
    defineGameSettings();
    new Player();
    loadResources();
    loadElements();
    loadButtons();
    await loadMenus();
    document.getElementById("menus").addEventListener("click", function(event) {
        const button = Button.tryToGetButtonFromTarget(event.target);
        if (!button)
            return;
        button.executor(event.target);
    });
    document.getElementById("menus").addEventListener("input", function(event) {
        const value = event.target.value;
        const output = event.target.parentElement.querySelector("output");
        output.value = output.alt * value;
    })
}

function loadElements() {
    new ElementGround(IMG.GRASS, new ActionPlowe());
    new ElementGround(IMG.GRASS_SIDE);
    new ElementGround(IMG.GRASS_CORNER);
    new ElementGround(IMG.GRASS_FARM, new ActionUnplowe());
    
    // Register ground variants for visual diversity
    new ElementGround(IMG.GRASS_VARIANT1, new ActionPlowe());
    new ElementGround(IMG.GRASS_VARIANT2, new ActionPlowe());
    new ElementGround(IMG.GRASS_VARIANT3, new ActionPlowe());

    // Paths and roads for editing mode
    new ElementGround(IMG.PATH_DIRT);
    new ElementGround(IMG.PATH_STONE);

    // ELEMENTOS NATURALES ULTRA REDUCIDOS PARA MEJOR RENDIMIENTO
    (new ElementDefault(IMG.PLANT0)).setNaturalSpawnChance(0.2).setLootable(Resource.getResource("leaf"));
    // ROCAS COMPLETAMENTE ELIMINADAS
    
    // FLORES ULTRA REDUCIDAS - Solo ocasionales
    (new ElementDefault(IMG.FLOWER0)).setNaturalSpawnChance(0.05).setLootable(Resource.getResource("seed0"));
    // Otras flores eliminadas para mapa más limpio y mejor rendimiento
    
    // BOSQUE 5x5 fijo (árboles, rocas, flores) - 1 click coloca todo, 1 click (der) lo elimina
        new ElementBosque(IMG.BOSQUE_TREE, IMG.BOSQUE_ROCK, IMG.BOSQUE_FLOWER)
            .setDisplayName("BOSQUE 5x5")
            .setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    
    // ÁRBOLES INDIVIDUALES PRODUCTIVOS (DESHABILITADOS - SOLO PARA SEMILLAS/CULTIVOS)
    // (new ElementDefault(IMG.TRUNK0)).setLootable(Resource.getResource("wood"), 2).setDisplayName("Tree Trunk").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    // (new ElementDefault(IMG.TREE0, new ActionPrune())).setLootable(Resource.getResource("wood"), 7).setBlockChild(Element.getElementFromId("trunk0")).setDisplayName("Oak Tree").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    // (new ElementDefault(IMG.TREE1, new ActionPrune())).setLootable(Resource.getResource("wood"), 7).setBlockChild(Element.getElementFromId("trunk0")).setDisplayName("Pine Tree").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    // Pruned fence items (keep only bosque/trees and house). Add warehouses under Fence with dialog.
    (new ElementWarehouse(IMG_EXTRA.ALMACEN_ALIMENTOS, 'alimentos')).setDisplayName("Almacén de Alimentos").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    (new ElementWarehouse(IMG_EXTRA.ALMACEN_MATERIALES, 'materiales')).setDisplayName("Almacén de Materiales").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);
    // Biblioteca (edificación)
    (new ElementLibrary(IMG_EXTRA.BIBLIOTECA)).setDisplayName("Biblioteca").setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);

    // Houses - Buildings for the farm
    (new ElementDefault(IMG.HOUSE)).setDisplayName("House").setPrice(50, 200).setHtmlDisplayCategory(TOOLBAR_CATEGORY.FENCE);

    // Existing crops
    (new ElementCrop(IMG.MELON, "Melon", 1000, Resource.getResource("fruit"))).setPrice(15, 500);
    (new ElementCrop(IMG.WHEAT, "Wheat", 1500, Resource.getResource("fruit"), 5)).setPrice(5, 5);
    (new ElementCrop(IMG.SUGARCANE, "Sugarcane", 1300, Resource.getResource("fruit"), 3)).setPrice(5, 5);
    (new ElementCrop(IMG.EGGPLANT, "Eggplant", 300, Resource.getResource("fruit"))).setPrice(5, 5);
    (new ElementCrop(IMG.CHILI, "Chili", 700, Resource.getResource("fruit"), 2)).setPrice(5, 5);

    // New vegetable crops with growth stages
    (new ElementCrop(IMG.BEET, "Beet", 1200, Resource.getResource("fruit"), 13)).setPrice(8, 25);
    (new ElementCrop(IMG.CABBAGE, "Cabbage", 1800, Resource.getResource("fruit"), 20)).setPrice(12, 40);
    (new ElementCrop(IMG.CARROT, "Carrot", 1400, Resource.getResource("fruit"), 16)).setPrice(6, 20);
    (new ElementCrop(IMG.CORN, "Corn", 2000, Resource.getResource("fruit"), 20)).setPrice(15, 60);
    (new ElementCrop(IMG.CUCUMBER, "Cucumber", 1600, Resource.getResource("fruit"), 20)).setPrice(10, 35);
    (new ElementCrop(IMG.ONION, "Onion", 800, Resource.getResource("fruit"), 6)).setPrice(4, 15);
    (new ElementCrop(IMG.PEAS, "Peas", 900, Resource.getResource("fruit"), 8)).setPrice(5, 18);
    (new ElementCrop(IMG.PEPPER, "Pepper", 1100, Resource.getResource("fruit"), 12)).setPrice(7, 30);
    (new ElementCrop(IMG.POTATO, "Potato", 1000, Resource.getResource("fruit"), 7)).setPrice(6, 22);
    (new ElementCrop(IMG.PUMPKIN, "Pumpkin", 2200, Resource.getResource("fruit"), 20)).setPrice(20, 80);
    (new ElementCrop(IMG.RADISH, "Radish", 600, Resource.getResource("fruit"), 8)).setPrice(3, 12);
    (new ElementCrop(IMG.SALAD, "Salad", 700, Resource.getResource("fruit"), 7)).setPrice(4, 15);
    (new ElementCrop(IMG.SPINACH, "Spinach", 500, Resource.getResource("fruit"), 5)).setPrice(3, 10);
    (new ElementCrop(IMG.TOMAT, "Tomato", 1300, Resource.getResource("fruit"), 20)).setPrice(8, 35);
    (new ElementCrop(IMG.WATERMELON, "Watermelon", 2500, Resource.getResource("fruit"), 19)).setPrice(25, 100);
    (new ElementCrop(IMG.WHEAT_NEW, "Wheat Premium", 1600, Resource.getResource("fruit"), 7)).setPrice(8, 30);

    // Animals - Pig Corral (multi-tile 4x5 with 2x3 animals inside)
    (new ElementPigCorral(
        PIG_SPRITES.down[1], // down001.png as representative pig
        IMG.FENCE_WOOD_1,
        IMG.FENCE_WOOD_2,
        IMG.FENCE_WOOD_3,
        IMG.FENCE_WOOD_4
    )).setDisplayName("Pig Corral").setPrice(20, 80).setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);

    // SHEEP corral (ground = grass.png)
    ;(function(){
        const sheepImg = new Image(); sheepImg.src = 'assets/image/animals/sheep/sheep_000.png'; sheepImg.id = 'sheep_icon';
        (new ElementAnimalCorral(
            'sheep', sheepImg,
            { 0: IMG.FENCE_WOOD_4, 2: IMG.FENCE_WOOD_1, 3: IMG.FENCE_WOOD_2, 4: IMG.FENCE_WOOD_3 },
            'ground' // grass.png id in IMG is 'ground'
        )).setDisplayName('Sheep Corral').setPrice(20, 80).setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);
    })();

    // WATER elements (lago, pozo, river) -> new Water toolbar
    ;(function(){
           (new ElementWater(IMG_EXTRA.WATER_LAKE, 'lago')).setDisplayName('Lago').setHtmlDisplayCategory(TOOLBAR_CATEGORY.WATER);
           (new ElementWater(IMG_EXTRA.WATER_WELL, 'pozo')).setDisplayName('Pozo').setHtmlDisplayCategory(TOOLBAR_CATEGORY.WATER);
           (new ElementWater(IMG_EXTRA.WATER_RIVER, 'rio')).setDisplayName('Río').setHtmlDisplayCategory(TOOLBAR_CATEGORY.WATER);
    })();

    // COW corral (default ground = grass_farm)
    ;(function(){
        const cowImg = new Image(); cowImg.src = 'assets/image/animals/cow/cow.png'; cowImg.id = 'cow_icon';
        (new ElementAnimalCorral(
            'cow', cowImg,
            { 0: IMG.FENCE_WOOD_4, 2: IMG.FENCE_WOOD_1, 3: IMG.FENCE_WOOD_2, 4: IMG.FENCE_WOOD_3 },
            'ground_farm'
        )).setDisplayName('Cow Corral').setPrice(25, 90).setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);
    })();

    // CARNERO corral (default ground = grass_farm)
    ;(function(){
        const carneroImg = new Image(); carneroImg.src = 'assets/image/animals/carnero/carnero.png'; carneroImg.id = 'carnero_icon';
        (new ElementAnimalCorral(
            'carnero', carneroImg,
            { 0: IMG.FENCE_WOOD_4, 2: IMG.FENCE_WOOD_1, 3: IMG.FENCE_WOOD_2, 4: IMG.FENCE_WOOD_3 },
            'ground_farm'
        )).setDisplayName('Carnero Corral').setPrice(22, 85).setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);
    })();

    // POLLO corral (default ground = grass_farm)
    ;(function(){
        const polloImg = new Image(); polloImg.src = 'assets/image/animals/pollo/pollo.png'; polloImg.id = 'pollo_icon';
        (new ElementAnimalCorral(
            'pollo', polloImg,
            { 0: IMG.FENCE_WOOD_4, 2: IMG.FENCE_WOOD_1, 3: IMG.FENCE_WOOD_2, 4: IMG.FENCE_WOOD_3 },
            'ground_farm'
        )).setDisplayName('Pollo Corral').setPrice(15, 70).setHtmlDisplayCategory(TOOLBAR_CATEGORY.ANIMAL);
    })();

    // Tools: remove Shovel, Pruning Shears, and Dirt Path per request. Keep Pickaxe, Stone Path, and Normal.
    new ElementTool(IMG_TOOL.PICKAXE, "Pickaxe (Remove any element)", (square) => {
        // Remove top element if present (rocks/trees/flowers/crops/fences)
        const imgs = square.querySelectorAll('img');
        if (imgs.length > 1) {
            imgs[1].remove();
        }
    }).setHtmlDisplayCategory(TOOLBAR_CAT.TOOL);
    // Path/Road Building Tools for editing mode (keep Stone Path only)
    new ElementTool(IMG_TOOL.PATH_STONE, "Stone Path (Durable road)", (square) => {
        // Replace ground with stone path
        replaceGroundImg(square, Element.getElementFromId("path_stone").getImage());
    }).setHtmlDisplayCategory(TOOLBAR_CAT.TOOL);

    // Normal tool: inspect entity/crop/animal area metadata on click
    new ElementTool(IMG_TOOL.NORMAL, "Normal (Inspect/Info)", (square) => {
        // Check if square contains a house element
        const houseImg = square.querySelector('img[src*="house"], img[src*="House"]');
        if (houseImg) {
            console.log('[HOUSE INSPECTION] Opening user profile...');
            // Open user profile for house inspection
            import('../view/user_profile.js').then(module => {
                console.log('[HOUSE INSPECTION] Module loaded, opening profile...');
                return module.openUserProfile();
            }).then(() => {
                console.log('[HOUSE INSPECTION] ✅ Profile opened successfully');
            }).catch(err => {
                console.error('[USER PROFILE] Error loading/opening profile:', err);
                alert('❌ Error al abrir perfil: ' + err.message);
            });
            return;
        }
        
        // Default behavior for other elements
        const entity = EntityStore.fromSquare(square);
        if (entity) {
            // Biblioteca: editar mismo formulario
            if (entity.type === 'library') {
                import('../view/library_dialog.js').then(m => {
                    return m.promptLibraryInfo({ title: 'Editar Biblioteca', initial: entity.form || null });
                }).then(info => {
                    if (info) { entity.form = info; }
                }).catch(err => console.error('[LIBRARY EDIT] Error:', err));
                return;
            }
                // Water: open same form for editing
                if (entity.type === 'water') {
                    import('../view/water_dialog.js').then(m => {
                        const title = entity.kind === 'lago' ? 'Editar Lago' : entity.kind === 'pozo' ? 'Editar Pozo' : 'Editar Río';
                        return m.promptWaterInfo({ title, kind: entity.kind || 'lago', initial: entity.form || null });
                    }).then(info => {
                        if (info) { entity.form = info; if (info.geo) entity.geo = info.geo; }
                    }).catch(err => console.error('[WATER EDIT] Error:', err));
                    return;
                }
            // Warehouses: open same form for editing instead of a dashboard
            if (entity.type === 'warehouse') {
                import('../view/warehouse_dialog.js').then(m => {
                    const title = entity.kind === 'materiales' ? 'Editar Almacén de Materiales' : 'Editar Almacén de Alimentos';
                    return m.promptWarehouseInfo({ title, kind: entity.kind || 'alimentos', initial: entity.form || null });
                }).then((info) => {
                    if (info) {
                        entity.form = info; // persist edited values
                        // also mirror top-level geo if needed for consistency
                        if (info.geo) entity.geo = info.geo;
                    }
                }).catch(err => console.error('[WAREHOUSE EDIT] Error:', err));
                return;
            }
            // If it's an animal corral, open the animal-focused panel/dashboard
            if (entity.type === 'animal-corral') {
                import('../view/animal_info_panel.js').then(m => m.showAnimalInfoPanel(entity)).catch(err => {
                    console.error('[ANIMAL PANEL] Error:', err);
                    // Fallback to crop panel if something fails
                    showCropInfoPanel(entity);
                });
            } else if (entity.type === 'crop-area') {
                // Para cultivos: abrir formulario de edición bonito
                import('../view/crop_edit_dialog.js').then(async (m) => {
                    const updatedData = await m.openCropEditDialog(entity);
                    if (updatedData) {
                        // Actualizar entidad con los nuevos datos
                        Object.assign(entity, updatedData);
                        console.log('[CROP EDIT] ✅ Cultivo actualizado:', entity);
                        
                        // Guardar en base de datos si tiene cultivo_id
                        if (entity.cultivo_id) {
                            import('../services/crop_service.js').then(async ({ updateCropInDatabase, showCropNotification }) => {
                                const result = await updateCropInDatabase(entity.cultivo_id, updatedData);
                                if (result.success) {
                                    showCropNotification('✅ Cambios guardados en BD', 'success');
                                } else {
                                    showCropNotification('⚠️ Cambios guardados localmente (sin conexión a BD)', 'warning');
                                }
                            }).catch(err => console.error('[CROP UPDATE] Error:', err));
                        }
                    }
                }).catch(err => {
                    console.error('[CROP EDIT] Error:', err);
                    alert('Error al abrir editor de cultivo');
                });
            } else {
                showCropInfoPanel(entity);
            }
        } else {
            alert('Sin datos de entidad en esta celda');
        }
    }).setHtmlDisplayCategory(TOOLBAR_CAT.TOOL);
}

function loadButtons() {
    Button.buttons.push(new ButtonApply(), new ButtonBuy(), new ButtonSell(), new ButtonClose(), new ButtonMore())
}

async function loadMenus() {
    await new Menu("menu-settings.html").init();
    await new MenuShop("menu-shop.html").init();
    await new MenuShopMore("menu-shop-more.html").init();

}

function loadResources() {
    new Resource("Fruit", IMG_ICON.FRUIT).setPrice(5, 5);
    new Resource("Seed", IMG_ICON.SEED);
    new Resource("Rock", IMG_ICON.ROCK);
    new Resource("Wood", IMG_ICON.WOOD);
    new Resource("Leaf", IMG_ICON.LEAF);
}

function loadListeners() {
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    })

    document.addEventListener("animationend", (event) => {
        if (event.target.classList.contains('resourceCollectedAnimation'))
            return event.target.remove();
    });

    document.getElementsByClassName("left-item")[0].addEventListener("click", function() {
        Menu.getMenu("menu-settings.html").displayMenu();
    });

    document.getElementsByClassName("right-item")[0].addEventListener("click", function() {
        Menu.getMenu("menu-shop.html").build().displayMenu()
    });

    document.addEventListener('mousemove', Listeners.mouseMove);
    document.addEventListener("mousedown", Listeners.mouseDown);
    document.addEventListener('mouseleave', Listeners.mouseLeave);
    document.addEventListener('keydown', Listeners.keyDown);

    TOOLBAR_CATEGORY.CROP.addEventListener("mousedown", Listeners.mouseDownToolBar);
    TOOLBAR_CATEGORY.FENCE.addEventListener("mousedown", Listeners.mouseDownToolBar);
    TOOLBAR_CATEGORY.TOOL.addEventListener("mousedown", Listeners.mouseDownToolBar);
    // Enable Water toolbar selection if present
    if (TOOLBAR_CATEGORY.WATER) {
        TOOLBAR_CATEGORY.WATER.addEventListener("mousedown", Listeners.mouseDownToolBar);
    }
    // Enable selecting animals from toolbar
    if (TOOLBAR_CATEGORY.ANIMAL) {
        TOOLBAR_CATEGORY.ANIMAL.addEventListener("mousedown", Listeners.mouseDownToolBar);
    }
}