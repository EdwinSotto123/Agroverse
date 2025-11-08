import {preLoadGame} from "./src/game_manager/game_loader.js";
import loadGame from "./src/game_manager/game_loader.js";

// Scenario 1 (Start Screen) wiring
const startScreen = document.getElementById('start-screen');

// Expose global handlers for invisible hotspots
window.startScenario2 = async function() {
    await preLoadGame();
    if (startScreen) startScreen.remove();
    loadGame();
}
window.openOptions = function() {
    // Placeholder: could open settings overlay in the future
}
window.exitScenario = function() {
    // Placeholder: typical window.close is blocked; do nothing for now
}