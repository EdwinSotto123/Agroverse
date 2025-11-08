import {newImage} from "../utils.js";

export const SOUND = {
	DEFAULT_SOUND: new Audio('assets/sound/default_sound.mp3')
}

export const IMG = {
	GRASS: newImage("assets/image/ground/grass2.png", "ground", 0, "ground"),
	//side and corner are not marked as "ground" class even though they "are" ground, because they are not interactive
	GRASS_SIDE: newImage("assets/image/ground/grass_side.png", "ground_side", 0),
	GRASS_CORNER: newImage("assets/image/ground/grass_corner.png", "ground_corner", 0),
	GRASS_FARM: newImage("assets/image/ground/grass_farm.png", "ground_farm", 0, "ground"),
	
	// Ground variants for visual diversity using the new grass2.png
	GRASS_VARIANT1: newImage("assets/image/ground/grass2.png", "ground_v1", 0, "ground"),
	GRASS_VARIANT2: newImage("assets/image/ground/grass2.png", "ground_v2", 0, "ground"), 
	GRASS_VARIANT3: newImage("assets/image/ground/grass2.png", "ground_v3", 0, "ground"),
	
	// Paths and roads for editing mode
	PATH_DIRT: newImage("assets/image/ground/grass_farm.png", "path_dirt", 0, "ground"),
	PATH_STONE: newImage("assets/image/ground/roca.jpg", "path_stone", 0, "ground"),
	
	TREE0: newImage("assets/image/static/tree0.png", "tree0", 2),
	TREE1: newImage("assets/image/static/tree1.png", "tree1", 2),
	PLANT0: newImage("assets/image/static/plant0.png", "plant0", 1),
	ROCK0: newImage("assets/image/static/rock0.png", "rock0", 1),
	FLOWER0: newImage("assets/image/static/flower0.png", "flower0", 1),
	FLOWER1: newImage("assets/image/static/flower1.png", "flower1", 1),
	FLOWER2: newImage("assets/image/static/flower2.png", "flower2", 1),
	TRUNK0: newImage("assets/image/static/trunk0.png", "trunk0", 1),
	// BOSQUE variants (same sprites, unique IDs for structure logic)
	BOSQUE_TREE: newImage("assets/image/static/tree0.png", "bosque_tree", 2),
	BOSQUE_ROCK: newImage("assets/image/static/rock0.png", "bosque_rock", 1),
	BOSQUE_FLOWER: newImage("assets/image/static/flower0.png", "bosque_flower", 1),
	DOOR_WOOD_CLOSE: newImage("assets/image/fence/door_wood_close.png", "door_wood_close", 1),
	FENCE_WOOD_1: newImage("assets/image/fence/fence_wood_1.png", "fence_wood_1", 1),
	FENCE_WOOD_2: newImage("assets/image/fence/fence_wood_2.png", "fence_wood_2", 1),
	FENCE_WOOD_3: newImage("assets/image/fence/fence_wood_3.png", "fence_wood_3", 1),
	FENCE_WOOD_4: newImage("assets/image/fence/fence_wood_4.png", "fence_wood_4", 1),
	FENCE_WOOD_5: newImage("assets/image/fence/fence_wood_5.png", "fence_wood_5", 1),
	FENCE_WOOD_6: newImage("assets/image/fence/fence_wood_6.png", "fence_wood_6", 1),
	FENCE_WOOD_7: newImage("assets/image/fence/fence_wood_7.png", "fence_wood_7", 1),
	FENCE_WOOD_8: newImage("assets/image/fence/fence_wood_8.png", "fence_wood_8", 1),

	// Houses
	HOUSE: newImage("assets/image/house/House.png", "house", 2),

	// Existing crops
	MELON: newImage("assets/image/crops/melon6.png", "melon", 1),
	WHEAT: newImage("assets/image/crops/wheat6.png", "wheat", 1),
	SUGARCANE: newImage("assets/image/crops/sugarcane6.png", "sugarcane", 1),
	EGGPLANT: newImage("assets/image/crops/eggplant6.png", "eggplant", 1),
	CHILI: newImage("assets/image/crops/chili6.png", "chili", 1),

	// New vegetable crops - using final growth stage images
	BEET: newImage("assets/image/vegetagles/growing_plants/beet/beet_13.png", "beet", 1),
	CABBAGE: newImage("assets/image/vegetagles/growing_plants/cabbage/cabbage_20.png", "cabbage", 1),
	CARROT: newImage("assets/image/vegetagles/growing_plants/carrot/carrot_16.png", "carrot", 1),
	CORN: newImage("assets/image/vegetagles/growing_plants/corn/corn_20.png", "corn", 1),
	CUCUMBER: newImage("assets/image/vegetagles/growing_plants/cucumber/cucumber_20.png", "cucumber", 1),
	ONION: newImage("assets/image/vegetagles/growing_plants/onion/onion_6.png", "onion", 1),
	PEAS: newImage("assets/image/vegetagles/growing_plants/peas/peas_8.png", "peas", 1),
	PEPPER: newImage("assets/image/vegetagles/growing_plants/pepper/pepper_12.png", "pepper", 1),
	POTATO: newImage("assets/image/vegetagles/growing_plants/potato/potato_7.png", "potato", 1),
	PUMPKIN: newImage("assets/image/vegetagles/growing_plants/pumpkin/pumpkin_20.png", "pumpkin", 1),
	RADISH: newImage("assets/image/vegetagles/growing_plants/radish/radish_8.png", "radish", 1),
	SALAD: newImage("assets/image/vegetagles/growing_plants/salad/salad_7.png", "salad", 1),
	SPINACH: newImage("assets/image/vegetagles/growing_plants/spinach/spinach_5.png", "spinach", 1),
	TOMAT: newImage("assets/image/vegetagles/growing_plants/tomat/tomat_20.png", "tomat", 1),
	WATERMELON: newImage("assets/image/vegetagles/growing_plants/watermelon/watermelon_19.png", "watermelon", 1),
	WHEAT_NEW: newImage("assets/image/vegetagles/growing_plants/wheat/wheat_7.png", "wheat_new", 1)
}

export const IMG_ICON = {
	FRUIT: newImage("assets/image/icon/fruit_icon.png", "fruit", 0),
	SEED: newImage("assets/image/icon/seed_icon.png", "seed0", 0),
	WOOD: newImage("assets/image/icon/wood_icon.png", "wood", 0),
	ROCK: newImage("assets/image/icon/rock_icon.png", "rock", 0),
	LEAF: newImage("assets/image/icon/leaf_icon.png", "leaf", 0)
}

// Custom storage and water assets
export const IMG_EXTRA = {
	ALMACEN_ALIMENTOS: newImage("assets/image/almacen/almacen_alimentos.png", "almacen_alimentos", 1),
	ALMACEN_MATERIALES: newImage("assets/image/almacen/almacen_materiales.png", "almacen_materiales", 1),
	WATER_LAKE: newImage("assets/image/water/lago.png", "water_lake", 1),
	WATER_WELL: newImage("assets/image/water/pozo.png", "water_well", 1),
	WATER_RIVER: newImage("assets/image/water/river.png", "water_river", 1),
	BIBLIOTECA: newImage("assets/image/biblioteca/biblioteca.png", "biblioteca", 1)
}

// Tool placeholders (reuse existing icons for simplicity)
export const IMG_TOOL = {
	SHOVEL: newImage("assets/image/icon/crop_selector.png", "tool_shovel", 0),
	PICKAXE: newImage("assets/image/icon/rock_icon.png", "tool_pickaxe", 0),
	PRUNING_SHEARS: newImage("assets/image/icon/leaf_icon.png", "tool_pruning_shears", 0),
	PATH_DIRT: newImage("assets/image/icon/wood_icon.png", "tool_path_dirt", 0),
	PATH_STONE: newImage("assets/image/icon/rock_icon.png", "tool_path_stone", 0),
	// Normal inspect/info tool icon
	NORMAL: newImage("assets/image/icon/settings_icon.png", "tool_normal", 0)
}

// Farmer character sprite sheets (32x32). We'll keep frames as relative paths.
export const FARMER = {
	down: [
		"assets/image/farmer/down00.png",
		"assets/image/farmer/down01.png",
		"assets/image/farmer/down02.png",
		"assets/image/farmer/down03.png",
		"assets/image/farmer/down04.png",
		"assets/image/farmer/down05.png",
	],
	up: [
		"assets/image/farmer/up00.png",
		"assets/image/farmer/up01.png",
		"assets/image/farmer/up02.png",
		"assets/image/farmer/up03.png",
		"assets/image/farmer/up04.png",
		"assets/image/farmer/up05.png",
	],
	right: [
		"assets/image/farmer/right00.png",
		"assets/image/farmer/right01.png",
		"assets/image/farmer/right02.png",
		"assets/image/farmer/right03.png",
		"assets/image/farmer/right04.png",
		"assets/image/farmer/right05.png",
	],
	// For left, we'll mirror the right frames using CSS transform: scaleX(-1)
};

// Animal sprite sheets for pigs with all animation frames
export const PIG_SPRITES = {
	down: [
		newImage("assets/image/animals/pig/down000.png", "pig_down_0", 1),
		newImage("assets/image/animals/pig/down001.png", "pig_down_1", 1),
		newImage("assets/image/animals/pig/down002.png", "pig_down_2", 1),
		newImage("assets/image/animals/pig/down003.png", "pig_down_3", 1),
		newImage("assets/image/animals/pig/down004.png", "pig_down_4", 1),
		newImage("assets/image/animals/pig/down005.png", "pig_down_5", 1),
	],
	up: [
		newImage("assets/image/animals/pig/up006.png", "pig_up_0", 1),
		newImage("assets/image/animals/pig/up007.png", "pig_up_1", 1),
		newImage("assets/image/animals/pig/up008.png", "pig_up_2", 1),
		newImage("assets/image/animals/pig/up009.png", "pig_up_3", 1),
		newImage("assets/image/animals/pig/up010.png", "pig_up_4", 1),
		newImage("assets/image/animals/pig/up011.png", "pig_up_5", 1),
	],
	left: [
		newImage("assets/image/animals/pig/left012.png", "pig_left_0", 1),
		newImage("assets/image/animals/pig/left013.png", "pig_left_1", 1),
		newImage("assets/image/animals/pig/left014.png", "pig_left_2", 1),
		newImage("assets/image/animals/pig/left015.png", "pig_left_3", 1),
		newImage("assets/image/animals/pig/left016.png", "pig_left_4", 1),
		newImage("assets/image/animals/pig/left017.png", "pig_left_5", 1),
	],
	righ: [
		newImage("assets/image/animals/pig/righ018.png", "pig_right_0", 1),
		newImage("assets/image/animals/pig/righ019.png", "pig_right_1", 1),
		newImage("assets/image/animals/pig/righ020.png", "pig_right_2", 1),
		newImage("assets/image/animals/pig/righ021.png", "pig_right_3", 1),
		newImage("assets/image/animals/pig/righ022.png", "pig_right_4", 1),
		newImage("assets/image/animals/pig/righ023.png", "pig_right_5", 1),
	]
};