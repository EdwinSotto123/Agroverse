import {FARMER} from "../game_manager/game_assets.js";
import Map from "./map.js";

export default class PlayerCharacter {
    constructor(options = {}) {
        this.speed = options.speed || 3; // pixels per frame
        this.frameDuration = options.frameDuration || 90; // ms per frame
        this.size = options.size || Map.mapInstance?.cellSize || 32; // scale to cell

        // Create DOM elements
        this.el = document.createElement('div');
        this.el.id = 'farmer';
        this.el.style.position = 'absolute';
        this.el.style.width = `${this.size}px`;
        this.el.style.height = `${this.size}px`;
        this.el.style.pointerEvents = 'none'; // don't block clicks
        this.el.style.zIndex = '1000'; // ensure above tiles
        this.el.style.opacity = '1'; // EXPLICITLY SET OPACITY
        this.el.style.visibility = 'visible'; // EXPLICITLY VISIBLE
        
        this.img = document.createElement('img');
        this.img.alt = 'farmer';
        this.img.draggable = false;
        this.img.style.width = '100%';
        this.img.style.height = '100%';
        this.img.style.display = 'block'; // ENSURE DISPLAY BLOCK
        this.img.style.opacity = '1'; // EXPLICITLY SET OPACITY
        
        // Error handler: show placeholder if sprite fails to load
        this.img.addEventListener('error', (e) => {
            console.error('[FARMER] Failed to load sprite:', e.target.src);
            this.img.style.display = 'none';
            this.el.classList.add('placeholder');
            this.el.style.background = 'radial-gradient(circle at 50% 40%, #ffd54f 35%, #f57f17 36%, #f57f17 60%, transparent 61%)';
            this.el.style.border = '2px solid #2e7d32';
            this.el.style.borderRadius = '50%';
            this.el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.15)';
        });
        
        // Success handler: log when sprite loads correctly
        this.img.addEventListener('load', () => {
            console.log('[FARMER] ✅ Sprite loaded:', this.img.src);
        });
        
        this.el.appendChild(this.img);

        Map.map.appendChild(this.el);
        
        console.log('[FARMER] Character element created and appended to map');

    // Initial state
        this.dir = 'down'; // up|down|left|right
        this.mirror = false; // for left (mirror right)
        this.frames = FARMER.down;
        this.frameIndex = 0;
        this.lastFrameAt = performance.now();
    // Start exactly at map center using scroll sizes (real content size)
    const mapW = Map.map.scrollWidth;
    const mapH = Map.map.scrollHeight;
    this.x = Math.max(0, Math.floor(mapW / 2 - this.size / 2));
    this.y = Math.max(0, Math.floor(mapH / 2 - this.size / 2));
    this.#render();

        // Input state
        this.keys = new Set();
        this._onKeyDown = (e) => this.#onKeyDown(e);
        this._onKeyUp = (e) => this.#onKeyUp(e);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);

        // CENTER CAMERA ON FARMER USING HIS ACTUAL POSITION
        if (Map.mapInstance) {
            Map.mapInstance.applyCameraZoom?.();
            Map.mapInstance.followActive = true;
            
            // Use the ACTUAL farmer position (center of the sprite)
            const farmerCenterX = this.x + this.size / 2;
            const farmerCenterY = this.y + this.size / 2;
            
            // FORCE camera to center on the farmer's actual position
            Map.mapInstance.followCamera?.(farmerCenterX, farmerCenterY);
            
            console.log(`[FARMER] Farmer positioned at (${this.x}, ${this.y}), centering camera at farmer center (${farmerCenterX}, ${farmerCenterY})`);
            console.log(`[FARMER] Map size: ${mapW}x${mapH}`);
        }

        // Animation loop
        this._tick = () => this.#tick();
        requestAnimationFrame(this._tick);
    }

    destroy() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        this.el.remove();
    }

    #onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (["arrowup","w","arrowdown","s","arrowleft","a","arrowright","d"].includes(k)) {
            this.keys.add(k);
            // prevent page scroll with arrows/space
            if (["arrowup","arrowdown","arrowleft","arrowright"].includes(k)) e.preventDefault();
        }
    }

    #onKeyUp(e) {
        this.keys.delete(e.key.toLowerCase());
    }

    #chooseDirection() {
        const up = this.keys.has('arrowup') || this.keys.has('w');
        const down = this.keys.has('arrowdown') || this.keys.has('s');
        const left = this.keys.has('arrowleft') || this.keys.has('a');
        const right = this.keys.has('arrowright') || this.keys.has('d');

        let dx = 0, dy = 0;
        if (up) dy -= 1;
        if (down) dy += 1;
        if (left) dx -= 1;
        if (right) dx += 1;

        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
            const inv = 1 / Math.sqrt(2);
            dx *= inv; dy *= inv;
        }

        // Direction and frames
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) { this.dir = 'right'; this.mirror = false; this.frames = FARMER.right; }
            else if (dx < 0) { this.dir = 'left'; this.mirror = true; this.frames = FARMER.right; }
        } else if (Math.abs(dy) > 0) {
            if (dy > 0) { this.dir = 'down'; this.mirror = false; this.frames = FARMER.down; }
            else if (dy < 0) { this.dir = 'up'; this.mirror = false; this.frames = FARMER.up; }
        }

        return {dx, dy};
    }

    #tick() {
        const {dx, dy} = this.#chooseDirection();
        const moving = dx !== 0 || dy !== 0;

        // Store previous position to calculate camera movement
        const prevX = this.x;
        const prevY = this.y;

        // Move
        if (moving) {
            this.x += dx * this.speed;
            this.y += dy * this.speed;
            // Clamp to map bounds
            const maxX = Map.map.scrollWidth - this.size;
            const maxY = Map.map.scrollHeight - this.size;
            this.x = Math.max(0, Math.min(maxX, this.x));
            this.y = Math.max(0, Math.min(maxY, this.y));
        }

        // Animate
        const now = performance.now();
        if (moving) {
            if (now - this.lastFrameAt > this.frameDuration) {
                this.lastFrameAt = now;
                this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            }
        } else {
            this.frameIndex = 0; // idle pose is first frame
        }

        this.#render();
        
        // ALWAYS follow camera to keep farmer centered - even when not moving
        // This ensures camera stays locked to farmer position
        if (Map.mapInstance && Map.mapInstance.followActive) {
            const cx = this.x + this.size / 2;
            const cy = this.y + this.size / 2;
            Map.mapInstance.followCamera?.(cx, cy);
        }
        
        requestAnimationFrame(this._tick);
    }

    #render() {
        // Position with left/top inside #map (more robust with transforms)
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
        
        // Ensure visibility
        this.el.style.opacity = '1';
        this.el.style.visibility = 'visible';
        
        // Image frame and mirroring
        const newSrc = this.frames[this.frameIndex];
        if (this.img.src !== newSrc) {
            this.img.src = newSrc;
        }
        this.img.style.transform = this.mirror ? 'scaleX(-1)' : 'none';
        this.img.style.imageRendering = 'pixelated';
        this.img.style.opacity = '1';
        this.img.style.display = 'block';
    }
}
