import {SOUND} from "./game_assets.js";

export const globalSize = 32;
export let mapHeight;
export let mapWidth;
export let timeToGrow;
export let naturalGeneration;
export let infiniteResources;
export let panMode = true; // Always enabled for map navigation

// Fixed map size - panoramic layout
export const useTileMode = true;
export const tileRows = 50;  // 50 vertical
export const tileCols = 100; // 100 horizontal (panoramic)

// Camera view configuration (in tiles) around the farmer
// The viewport will try to show: left + 1(center) + right tiles horizontally
// and top + 1 + bottom tiles vertically
export const cameraView = {
    tilesTop: 5,
    tilesBottom: 5,
    tilesLeft: 5,
    tilesRight: 5,
};

export default function defineGameSettings() {
    const get = (id) => document.getElementById(id);
    mapHeight = get("inputMapHeight")?.value ?? 75;
    mapWidth = get("inputMapWidth")?.value ?? 95;
    timeToGrow = get("inputTimeToGrow")?.value ?? 10;
    naturalGeneration = get("inputNaturalGen")?.value ?? 5;
    infiniteResources = get("inputInfiniteRes")?.checked ?? true;

    console.log(`Game Settings: PANORAMIC MAP 50x100 with ALWAYS-ON PAN MODE for navigation`);

    const enableSounds = get("inputEnableSounds")?.checked ?? false;
    if (!enableSounds) return;

    try {
        SOUND.DEFAULT_SOUND.volume = 0.2;
        SOUND.DEFAULT_SOUND.loop = true;
        SOUND.DEFAULT_SOUND.play();
    } catch (err) {
        console.warn('Audio playback was blocked by the browser:', err);
    }
}