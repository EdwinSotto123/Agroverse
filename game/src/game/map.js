import Element from "../element/element.js";
import {getPercent} from "../utils.js"
import {addImgToSquare} from "../view/render.js";
import {globalSize, mapHeight, mapWidth, naturalGeneration, useTileMode, tileRows, tileCols, panMode, cameraView} from "../game_manager/game_settings.js";

export default class Map {
    static map;
    static mapInstance;

    constructor() {
        Map.mapInstance = this;
        this.followActive = false; // when true, skip default centering
        this.zoom = 1;
        this.lastFollowX = null;
        this.lastFollowY = null;

    // Create a scrollable viewport that contains the map
    const viewport = document.createElement("div");
    viewport.setAttribute("id", "map-viewport");
    // Allow programmatic scrolling; scrollbars remain hidden via CSS
    viewport.style.overflow = "auto";
    viewport.style.cursor = "grab";
    document.body.prepend(viewport);
    this.viewport = viewport;

    // Create a zoom layer so we can scale without breaking map transforms
    this.zoomLayer = document.createElement('div');
    this.zoomLayer.id = 'map-zoom-layer';
    this.zoomLayer.style.transformOrigin = '0 0';
    this.zoomLayer.style.position = 'relative';
    this.zoomLayer.style.width = 'max-content';
    this.zoomLayer.style.height = 'max-content';
    viewport.appendChild(this.zoomLayer);

    Map.map = document.createElement("div");
    Map.map.setAttribute("id", "map");
    // Remove CSS margins that offset coordinate system and break centering
    Map.map.style.margin = '0px';
    this.zoomLayer.appendChild(Map.map);

        // Calculate cell size to make map larger than viewport for exploration
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 120; // Account for toolbar
        
        // Make cells bigger so total map extends beyond viewport
        const baseSize = 28; // Even larger base size for better exploration
        const optimalCellSize = Math.max(baseSize, 20); // Minimum 20px cells
        
        const totalMapWidth = tileCols * optimalCellSize;
        const totalMapHeight = tileRows * optimalCellSize;
        
        console.log(`Creating EXPLORABLE PANORAMIC 50x100 map:`);
        console.log(`- Viewport: ${viewportWidth}x${viewportHeight}`);
        console.log(`- Map: ${totalMapWidth}x${totalMapHeight} (${optimalCellSize}px cells)`);
        console.log(`- Scrollable area: ${totalMapWidth - viewportWidth}x${totalMapHeight - viewportHeight}`);
        
        Map.map.style.width = totalMapWidth + "px";
        Map.map.style.height = totalMapHeight + "px";
        this.squaresPerRow = tileCols;
        this.numRows = tileRows;
        this.cellSize = optimalCellSize; // Store for square creation
        
        console.log(`Map dimensions: ${Map.map.style.width} x ${Map.map.style.height} (fits viewport: ${viewportWidth}x${viewportHeight})`);

    this.#attachPanControls();
    this.#mapGenerator();
        return this;
    }

    #addSquare(square) {
        Map.map.appendChild(square);
    }

    #mapGenerator() {
        const start = performance.now();
        const naturalSpawnableElement = Element.elements.filter((elem) => elem.naturalSpawnChance);
        
        // Create rows for better organization
        const totalSquares = this.numRows * this.squaresPerRow;
        console.log(`Generating ${totalSquares} squares in ${this.numRows} rows of ${this.squaresPerRow} columns...`);
        
        // Generate row by row for better organization
        for (let row = 0; row < this.numRows; row++) {
            // Create a row container for each row
            const rowDiv = document.createElement('div');
            rowDiv.className = 'map-row';
            rowDiv.style.width = '100%';
            rowDiv.style.height = this.cellSize + 'px';
            rowDiv.style.lineHeight = '0';
            rowDiv.style.fontSize = '0';
            
            // Add all squares for this row
            for (let col = 0; col < this.squaresPerRow; col++) {
                const square = this.#createOptimizedSquare(row, col, naturalSpawnableElement);
                rowDiv.appendChild(square);
            }
            
            Map.map.appendChild(rowDiv);
        }
        
        console.log(`Time to load the map: ${performance.now() - start} ms`);
        console.log(`Generated ${totalSquares} squares (${this.numRows} rows x ${this.squaresPerRow} cols)`);
        
        // Apply camera zoom after map generation and then center on the farmer when available
        setTimeout(() => {
            this.applyCameraZoom();
            const start = performance.now();
            const tryCenterOnFarmer = () => {
                if (this.lastFollowX !== null && this.lastFollowY !== null) {
                    console.log('[MAP] Centering on farmer via lastFollow at startup');
                    this.followCamera(this.lastFollowX, this.lastFollowY);
                    return;
                }
                if (performance.now() - start < 1000) {
                    // Retry next frame until farmer reports its position
                    requestAnimationFrame(tryCenterOnFarmer);
                } else {
                    console.log('[MAP] Farmer not reported in time, using default center');
                    this.#centerViewport();
                }
            };
            tryCenterOnFarmer();
        }, 100);
    }
    
    #createOptimizedSquare(x, y, naturalSpawnableElement) {
        const square = document.createElement('div');
        square.className = 'square'; // faster than classList.add
        
        // Set dynamic size based on calculated cell size
        square.style.width = this.cellSize + 'px';
        square.style.height = this.cellSize + 'px';
        
        // Pre-calculate ground type
        let groundId;
        if (this.#isCorner(x, y)) {
            groundId = "ground_corner";
        } else if (this.#isBorderOfMap(x, y)) {
            groundId = "ground_side";
        } else {
            // Improved variation logic with seeded randomness for natural patterns
            const seed = (x * 73 + y * 37 + x * y * 13) % 1000; // More natural pseudo-random
            if (seed < 600) groundId = "ground";           // 60% base grass
            else if (seed < 780) groundId = "ground_v1";   // 18% variant 1
            else if (seed < 920) groundId = "ground_v2";   // 14% variant 2
            else groundId = "ground_v3";                   // 8% variant 3
        }
        
        const groundElement = Element.getElementFromId(groundId);
        addImgToSquare(square, groundElement.getImage());
        
        // Ultra-reduced natural element generation for better performance  
        if (Math.random() * 100 <= naturalGeneration * 0.3) { // Even less natural generation
            this.#generateElement(square, [...naturalSpawnableElement]);
        }
        
        const img = square.querySelector('img');
        img.style.transform = this.#rotateCalculation(x, y);
        
        // Drastically reduced visual effects for performance
        if ((x + y) % 50 === 0) { // Only 2% of squares get special effects
            this.#addOptimizedVisualEffects(square, x, y);
        }
        
        return square;
    }

    #addVisualEffects(square, x, y) {
        // Add subtle color variations and brightness
        const variation = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0.05;
        const brightness = 1 + variation;
        
        // Pseudo-isometric depth based on position
        const depthOffset = (x * 0.1 + y * 0.05) % 3;
        square.style.zIndex = Math.floor(depthOffset);
        
        // Apply subtle filter variations with depth shadows
        if (Math.random() < 0.1) {
            square.style.filter = `brightness(${brightness}) hue-rotate(${Math.random() * 10 - 5}deg)`;
        }
        
        // Add occasional shadow effects for depth (more pronounced for isometric feel)
        if (Math.random() < 0.08) {
            const shadowIntensity = 0.1 + (depthOffset * 0.05);
            square.style.boxShadow = `inset 1px 1px 3px rgba(0,0,0,${shadowIntensity}), 0 2px 4px rgba(0,0,0,0.1)`;
        }
        
        // Add row-based perspective shifts for enhanced 3D feel
        const rowShift = Math.floor(x / 10) * 0.5;
        const colShift = Math.floor(y / 10) * 0.3;
        if (rowShift > 0 || colShift > 0) {
            square.style.transform = `translateZ(${rowShift + colShift}px)`;
        }
    }

    #addOptimizedVisualEffects(square, x, y) {
        // Much more subtle effects to prevent texture distortion
        const depthOffset = (x + y) % 2; // Simpler calculation
        square.style.zIndex = depthOffset;
        
        // Very minimal brightness variations
        if ((x * 7 + y * 3) % 100 === 0) {
            const brightness = 1 + ((x + y) % 5) * 0.005; // Much more subtle
            square.style.filter = `brightness(${brightness})`;
        }
        
        // Remove 3D transforms that cause texture distortion
        // Keep only subtle 2D effects
        if ((x + y) % 50 === 0) {
            square.style.boxShadow = 'inset 0px 0px 1px rgba(0,0,0,0.05)';
        }
    }

    #centerViewport() {
        if (!this.viewport) return;
        // Position viewport to show only part of the map initially (for exploration)
        const mapW = Map.map.scrollWidth;
        const mapH = Map.map.scrollHeight;
        const vpW = this.viewport.clientWidth;
        const vpH = this.viewport.clientHeight;
        
    // Center on the map by default (we'll pan via right-click or keys)
    this.viewport.scrollLeft = Math.max(0, (mapW - vpW) / 2);
    this.viewport.scrollTop = Math.max(0, (mapH - vpH) / 2);
        
        console.log(`Viewport positioned for exploration - Map: ${mapW}x${mapH}, Viewport: ${vpW}x${vpH}`);
    }

    // Public: set zoom to show approximately tilesX x tilesY tiles on screen
    setZoomToTiles(tilesX = 10, tilesY = 10) {
        if (!this.viewport || !this.zoomLayer) return;
        const vpW = this.viewport.clientWidth;
        const vpH = this.viewport.clientHeight;
        const targetW = tilesX * this.cellSize;
        const targetH = tilesY * this.cellSize;
        const scaleX = vpW / targetW;
        const scaleY = vpH / targetH;
        const scale = Math.min(scaleX, scaleY);
        this.zoom = scale;
        this.zoomLayer.style.transform = `scale(${scale})`;
        console.log(`Zoom set to show ~${tilesX}x${tilesY} tiles (scale=${scale.toFixed(2)})`);
    }

    // Compute zoom based on cameraView settings
    applyCameraZoom() {
        const tilesX = cameraView.tilesLeft + 1 + cameraView.tilesRight;
        const tilesY = cameraView.tilesTop + 1 + cameraView.tilesBottom;
        this.setZoomToTiles(tilesX, tilesY);
        // After changing zoom, re-apply follow so scroll doesn't jump to (0,0)
        requestAnimationFrame(() => {
            if (this.followActive && this.lastFollowX !== null && this.lastFollowY !== null) {
                this.followCamera(this.lastFollowX, this.lastFollowY);
            }
        });
    }

    // Follow a given pixel position (x,y) so that it's centered inside viewport considering cameraView margins
    followCamera(x, y) {
        if (!this.viewport) {
            console.warn('[CAMERA] No viewport available for followCamera');
            return;
        }
        
        const vp = this.viewport;
        const vpW = vp.clientWidth;
        const vpH = vp.clientHeight;
        const scale = this.zoom || 1; // zoomLayer scale
        
        console.log(`[CAMERA] Following target at (${x}, ${y}) with viewport ${vpW}x${vpH} and scale ${scale}`);
        
        // Convert target position to viewport coordinates considering zoom
        const worldVpW = vpW / scale;
        const worldVpH = vpH / scale;
        
        // Calculate exact center position - target should be in the middle of viewport
        const targetLeft = Math.floor(x - worldVpW / 2);
        const targetTop = Math.floor(y - worldVpH / 2);
        
    // Clamp to map bounds in scroll (CSS pixel) space
    // ScrollLeft/Top operate in CSS pixels (post-scale). Content width/height must be converted accordingly
    const contentW = Map.map.scrollWidth * scale;
    const contentH = Map.map.scrollHeight * scale;
    const maxLeft = Math.max(0, Math.floor(contentW - vpW));
    const maxTop = Math.max(0, Math.floor(contentH - vpH));
        
        // Apply scroll position to center the farmer
    const finalLeft = Math.max(0, Math.min(Math.floor(targetLeft * scale), maxLeft));
    const finalTop = Math.max(0, Math.min(Math.floor(targetTop * scale), maxTop));
        
        vp.scrollLeft = finalLeft;
        vp.scrollTop = finalTop;
        
        console.log(`[CAMERA] Scroll set to (${finalLeft}, ${finalTop}) - target was (${targetLeft}, ${targetTop})`);
        
        // Remember the last follow target
        this.lastFollowX = x;
        this.lastFollowY = y;
    }    #attachPanControls() {
        if (!this.viewport) return;

        this._isPanning = false;
        this._panStartX = 0;
        this._panStartY = 0;
        this._panScrollLeft = 0;
        this._panScrollTop = 0;
        this._isSpacePressed = false;
        this._currentZoom = window.devicePixelRatio || 1;

        // Detectar cambios de zoom del navegador
        const detectZoomChange = () => {
            const newZoom = window.devicePixelRatio || 1;
            if (Math.abs(newZoom - this._currentZoom) > 0.1) {
                console.log('Zoom changed from', this._currentZoom, 'to', newZoom);
                this._currentZoom = newZoom;
                // Recalibrar si es necesario
                this.#recalibrateForZoom();
            }
        };

    // Escuchar eventos de cambio de zoom
    window.addEventListener('resize', detectZoomChange);
        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                // Zoom con Ctrl+Wheel
                setTimeout(detectZoomChange, 100);
            }
        }, { passive: true });

        // Track Space key for Space+LeftDrag panning (don't steal focus from inputs)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this._isSpacePressed = true;
                // prevent page scroll by space
                e.preventDefault();
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this._isSpacePressed = false;
        });

        // Keyboard panning with arrows or WASD - DISABLED when camera is following
        const keyPan = (dx, dy, e) => {
            // Don't allow manual panning when camera is following farmer
            if (this.followActive) {
                e.preventDefault();
                return;
            }
            const active = document.activeElement;
            const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (typing) return;
            const step = Math.max(32, Math.floor(Math.min(this.viewport.clientWidth, this.viewport.clientHeight) * 0.1));
            this.viewport.scrollLeft += dx * step;
            this.viewport.scrollTop += dy * step;
            e.preventDefault();
        };
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    return keyPan(-1, 0, e);
                case 'ArrowRight':
                case 'KeyD':
                    return keyPan(1, 0, e);
                case 'ArrowUp':
                case 'KeyW':
                    return keyPan(0, -1, e);
                case 'ArrowDown':
                case 'KeyS':
                    return keyPan(0, 1, e);
            }
        });

        // Disable native context menu on the viewport/map to allow right-drag
        this.viewport.addEventListener('contextmenu', (e) => e.preventDefault());
        Map.map.addEventListener('contextmenu', (e) => e.preventDefault());

        // Prevent mouse wheel from scrolling the viewport; allow Ctrl+Wheel for browser zoom detection
        this.viewport.addEventListener('wheel', (e) => {
            if (!e.ctrlKey) {
                e.preventDefault();
            }
        }, { passive: false });

        // Mouse events for panning - DISABLED when camera is following farmer
        Map.map.addEventListener('mousedown', (e) => {
            // Don't allow right-click panning when camera is following farmer
            if (this.followActive) {
                e.preventDefault();
                return;
            }
            
            const isRight = e.button === 2 && panMode; // right button only if pan mode enabled
            
            if (!isRight) return; // Don't interfere with left clicks or other buttons

            // Only prevent default and stop propagation for RIGHT CLICKS
            e.stopPropagation();
            e.preventDefault();

            this._isPanning = true;
            this._panStartX = e.clientX;
            this._panStartY = e.clientY;
            this._panScrollLeft = this.viewport.scrollLeft;
            this._panScrollTop = this.viewport.scrollTop;
            this.viewport.style.cursor = 'grabbing';
            
            console.log('Pan started on map:', { x: e.clientX, y: e.clientY, scrollLeft: this._panScrollLeft, scrollTop: this._panScrollTop });
        });

        // Remove middle-click and Space+Left panning to keep only right-click

        document.addEventListener('mousemove', (e) => {
            if (!this._isPanning) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const dx = e.clientX - this._panStartX;
            const dy = e.clientY - this._panStartY;
            
            // Direct scroll calculation without bounds checking first
            this.viewport.scrollLeft = this._panScrollLeft - dx;
            this.viewport.scrollTop = this._panScrollTop - dy;
        });

        const endPan = (e) => {
            if (!this._isPanning) return;
            
            this._isPanning = false;
            this.viewport.style.cursor = 'grab'; // Show grab cursor when not panning
            
            console.log('Pan ended');
            
            // Prevent any other handlers from interfering
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        document.addEventListener('mouseup', endPan);
        document.addEventListener('mouseleave', endPan);
        
        // Also set initial cursor
        this.viewport.style.cursor = 'grab';
    }

    #generateElement(square, naturalSpawnableElement) {
        /*let randValue = Math.floor(Math.random() * 100);
        while (naturalSpawnableElement.length > 0) {
            const selector = Math.floor(Math.random() * naturalSpawnableElement.length);
            let block = naturalSpawnableElement[selector]
            if (randValue <= block.naturalSpawnChance) {
                block.setBlockToSquare(square)
                break;
            }
            naturalSpawnableElement.splice(selector, 1);
        }*/

        while (true) {
            let element = naturalSpawnableElement[Math.floor(Math.random() * naturalSpawnableElement.length)];
            let randValue = Math.floor(Math.random() * 100);
            if (randValue <= element.naturalSpawnChance) {
                element.setElementToSquare(square);
                break;
            }
        }
    }

    #isCorner(x, y) {
        return x === 0 && y === 0 || x === 0 && y === (this.squaresPerRow - 1) ||
            y === 0 && x === (this.numRows - 1) || x === (this.numRows - 1) && y === (this.squaresPerRow - 1);
    }

    #isBorderOfMap(x, y) {
        return x <= 0 || y <= 0 || x >= (this.numRows - 1) || y >= (this.squaresPerRow - 1);
    }

    #rotateCalculation(x, y) {
        if (x === 0 && y > 0)
            return "rotate(90deg)";
        else if (y === (this.squaresPerRow - 1))
            return "rotate(180deg)";
        else if (x === (this.numRows - 1))
            return "rotate(270deg)";
        return "rotate(0deg)";
    }

    getElementFromSquare(square) {
        const nodes = square.querySelectorAll('img');
        return Element.getElementFromId(nodes[nodes.length - 1].getAttribute('id'));
    }

    /**
     * Checks if the square contains the maximum number of element allowed.
     *
     * A square can contain only 2 Elements, so if the length returned by the
     * selectorAll is more than 1, it means the maximum Elements is reached in this square.
     *
     * @returns {boolean} True if the square is max, otherwise false.
     */
    isSquareContainMaxElement(square) {
        return square.querySelectorAll('img').length > 1;
    }

    tryToGetSquareFromGround(target, event = null) {
        // Método mejorado para detectar celdas de manera consistente - RESISTENTE AL ZOOM
        
        // 1. Si es una imagen de suelo, devolver su contenedor square
        if (target.classList.contains("ground")) {
            return target.parentElement;
        }
        
        // 2. Si es directamente una celda, devolverla
        if (target.classList.contains("square")) {
            return target;
        }
        
        // 3. Si es cualquier imagen dentro de una celda, encontrar la celda padre
        if (target.tagName === 'IMG') {
            let current = target.parentElement;
            while (current && current !== Map.map) {
                if (current.classList.contains("square")) {
                    return current;
                }
                current = current.parentElement;
            }
        }
        
        // 4. MÉTODO ALTERNATIVO: Usar elementFromPoint - más resistente al zoom
        if (event) {
            // Usar elementFromPoint que maneja automáticamente el zoom
            const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
            
            if (elementAtPoint) {
                // Buscar hacia arriba desde el elemento exacto bajo el cursor
                let current = elementAtPoint;
                let attempts = 0;
                while (current && current !== document && attempts < 15) {
                    if (current.classList && current.classList.contains("square")) {
                        console.log('Found square using elementFromPoint:', current);
                        return current;
                    }
                    current = current.parentElement;
                    attempts++;
                }
                
                // Si elementFromPoint nos dio un elemento pero no encontramos square,
                // intentar con cálculo manual como fallback
                if (target === Map.map || target.classList.contains("map-row")) {
                    return this.#findSquareByCalculation(event);
                }
            }
        }
        
        // 5. Búsqueda hacia arriba en el DOM como último recurso
        let element = target;
        let attempts = 0;
        while (element && element !== document && attempts < 10) {
            if (element.classList && element.classList.contains("square")) {
                return element;
            }
            element = element.parentElement;
            attempts++;
        }
        
        return null;
    }
    
    #recalibrateForZoom() {
        // Recalibrar el sistema después de un cambio de zoom
        console.log('Recalibrating for zoom level:', this._currentZoom);
        
        // Actualizar el cursor si hay una herramienta seleccionada
        if (typeof Player !== 'undefined' && Player.player && Player.player.getHandElement()) {
            const handElement = Player.player.getHandElement();
            if (handElement && handElement.getElementImageSrc) {
                const cursorUrl = handElement.getElementImageSrc();
                document.body.style.cursor = `url(${cursorUrl}), auto`;
            }
        }
        
        // Limpiar cualquier feedback visual que pueda estar desalineado
        const allSquares = document.querySelectorAll('.square');
        allSquares.forEach(sq => {
            sq.style.boxShadow = '';
        });
    }
    
    #findSquareByCalculation(event) {
        // Método de cálculo manual como fallback
        const mapRect = Map.map.getBoundingClientRect();
        
        // Calcular posición relativa usando getBoundingClientRect (maneja zoom automáticamente)
        const mouseX = event.clientX - mapRect.left;
        const mouseY = event.clientY - mapRect.top;
        
        // Obtener el tamaño real de las celdas considerando el zoom y transformaciones CSS
        const actualCellSize = mapRect.width / this.squaresPerRow;
        
        // Calcular índices de celda
        const col = Math.floor(mouseX / actualCellSize);
        const row = Math.floor(mouseY / actualCellSize);
        
        console.log('Fallback calculation:', {
            mouseX, mouseY,
            actualCellSize,
            row, col,
            mapSize: { width: mapRect.width, height: mapRect.height },
            gridSize: { rows: this.numRows, cols: this.squaresPerRow }
        });
        
        // Verificar que estamos dentro de los límites
        if (row >= 0 && row < this.numRows && col >= 0 && col < this.squaresPerRow) {
            // Buscar la celda específica en la estructura DOM
            const rowElement = Map.map.children[row];
            if (rowElement && rowElement.children[col]) {
                console.log('Found square by calculation at row:', row, 'col:', col);
                return rowElement.children[col];
            }
        }
        
        return null;
    }
}