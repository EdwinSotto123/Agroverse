/**
 * Crop Nameplate Component
 * Creates a visual nameplate/sign to display crop names using physical cartel image
 */

export function createCropNameplate(cropName) {
  if (!cropName || typeof cropName !== 'string' || cropName.trim() === '') {
    return null;
  }

  const nameplate = document.createElement('div');
  nameplate.className = 'crop-nameplate';
  
  // Container styles - positioned to hold the cartel image
  nameplate.style.cssText = `
    position: absolute;
    width: 64px;
    height: 74px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    z-index: 20;
    font-family: 'Arial', sans-serif;
    cursor: pointer;
    transition: transform 0.2s ease;
    pointer-events: auto;
    transform-origin: center center;
  `;

  // Cartel image as background
  const cartelImg = document.createElement('img');
  cartelImg.src = 'assets/image/cartel/cartel.png';
  cartelImg.alt = 'Cartel';
  cartelImg.style.cssText = `
    width: 64px;
    height: 74px;
    display: block;
    position: relative;
    z-index: 1;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  `;

  // Text container positioned over the cartel
  const textContainer = document.createElement('div');
  textContainer.style.cssText = `
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 2;
    pointer-events: none;
  `;

  // Text element
  const textElement = document.createElement('span');
  textElement.textContent = cropName.trim();
  textElement.style.cssText = `
    font-size: 9px;
    font-weight: bold;
    color: #2c1810;
    text-shadow: 
      1px 1px 1px rgba(255,255,255,0.8),
      -1px -1px 1px rgba(255,255,255,0.5);
    line-height: 1.1;
    word-wrap: break-word;
    hyphens: auto;
    max-height: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    text-align: center;
  `;

  // Adjust font size based on text length
  const textLength = cropName.length;
  if (textLength > 20) {
    textElement.style.fontSize = '7px';
    textElement.style.lineHeight = '1.0';
  } else if (textLength > 12) {
    textElement.style.fontSize = '8px';
    textElement.style.lineHeight = '1.05';
  }

  textContainer.appendChild(textElement);
  nameplate.appendChild(cartelImg);
  nameplate.appendChild(textContainer);

  // Hover effects - preserve the centering transform
  nameplate.addEventListener('mouseenter', () => {
    nameplate.style.transform = 'translateY(-50%) scale(1.05) translateX(-2px)';
  });

  nameplate.addEventListener('mouseleave', () => {
    nameplate.style.transform = 'translateY(-50%) scale(1) translateX(0)';
  });

  return nameplate;
}

/**
 * Position nameplate relative to a crop element
 * @param {HTMLElement} nameplate - The nameplate element
 * @param {HTMLElement} cropElement - The crop element to position relative to
 * @param {number} offsetX - Additional X offset (default: -70)
 * @param {number} offsetY - Additional Y offset (default: 0)
 */
export function positionNameplate(nameplate, cropElement, offsetX = -70, offsetY = 0) {
  if (!nameplate || !cropElement) return;

  const cropRect = cropElement.getBoundingClientRect();
  const containerRect = cropElement.parentElement.getBoundingClientRect();

  nameplate.style.left = (cropRect.left - containerRect.left + offsetX) + 'px';
  nameplate.style.top = (cropRect.top - containerRect.top + offsetY) + 'px';
}

/**
 * Add nameplate to crop square
 * @param {HTMLElement} square - The square element containing the crop
 * @param {string} cropName - The name to display on the nameplate
 * @returns {HTMLElement|null} The created nameplate element
 */
export function addNameplateToSquare(square, cropName) {
  if (!square || !cropName) return null;

  // Remove existing nameplate if any
  const existingNameplate = square.querySelector('.crop-nameplate');
  if (existingNameplate) {
    existingNameplate.remove();
  }

  const nameplate = createCropNameplate(cropName);
  if (!nameplate) return null;

  // Position nameplate to the left of the square
  nameplate.style.left = '-70px';
  nameplate.style.top = '0px';

  square.style.position = 'relative';
  square.appendChild(nameplate);

  return nameplate;
}