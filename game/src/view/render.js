/**
 * Display text and image at the defined position on right-click event.
 *
 * Create a new div with the provided text and image,
 * positioned at the specified x and y coordinates.
 *
 * The ID of the created is formed by the calculation x + y of the coordinates.
 *
 * @param {string} text - The text to display.
 * @param {HTMLImageElement} image - The image to display.
 * @param {int} x - The position x of the elements
 * @param {int} y - The position y of the elements
 */
export function displayRightClick(text, image, x, y) {
    const div = document.createElement("div")
    div.setAttribute("id", (x + y).toString());
    div.appendChild(image.cloneNode(true));
    let spanHTML = `<span class="txtHarvest"> ${text}</span>`;

    div.insertAdjacentHTML('beforeend', spanHTML);
    div.style.position = "absolute";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.display = "block";

    document.body.appendChild(div);

    div.classList.add("resourceCollectedAnimation");
}

export function displayMessageToAlertBox(messageToDisplay) {
    const htmlElement = document.getElementById("alertbox");
    htmlElement.textContent = messageToDisplay;
    htmlElement.style.display = "block";
    //todo
    setTimeout( () => {
        if (htmlElement.style.display === "block")
            htmlElement.style.display = "none";
    }, 3000);
}

export function addImgToSquare(square, elementImg) {
    const clonedImg = elementImg.cloneNode(true);
    
    // Special handling for large elements (houses, trees, buildings)
    const imgSrc = elementImg.getAttribute('src') || '';
    const isLargeElement = imgSrc.includes('house') || 
                          imgSrc.includes('House') || 
                          imgSrc.includes('tree') || 
                          imgSrc.includes('Tree') ||
                          imgSrc.includes('almacen') ||
                          imgSrc.includes('water') ||
                          imgSrc.includes('biblioteca');
    
    if (isLargeElement) {
        // For large elements, ensure better positioning
        clonedImg.style.position = 'absolute';
        clonedImg.style.bottom = '6px'; // Sufficient offset to prevent cutting
        clonedImg.style.left = '50%';
        clonedImg.style.transform = 'translateX(-50%)';
        clonedImg.style.zIndex = '8'; // Higher z-index for large elements
        clonedImg.style.maxWidth = 'none';
        clonedImg.style.maxHeight = 'none';
        
        // Ensure parent square can contain it
        square.style.overflow = 'visible';
        square.style.position = 'relative';
        square.classList.add('has-large-element');
    }
    
    square.appendChild(clonedImg);
}

export function replaceGroundImg(square, newGroundImg) {
    square.removeChild(square.querySelector('.ground'));
    square.appendChild(newGroundImg.cloneNode(true));
}

export function replaceElementImg(square, newElementImg) {
    const images = square.querySelectorAll('img');
    const elementImg = images[1]; // Segunda imagen (la del elemento, no el ground)
    
    if (elementImg && elementImg.parentNode === square) {
        square.removeChild(elementImg);
        square.appendChild(newElementImg.cloneNode(true));
    } else {
        // Si no hay segunda imagen o no es hijo directo, solo agregar
        console.warn('[RENDER] replaceElementImg: No se encontró imagen de elemento, agregando nueva');
        square.appendChild(newElementImg.cloneNode(true));
    }
}

export function removeElementImg(square) {
    const images = square.querySelectorAll('img');
    const elementImg = images[1]; // Segunda imagen
    
    if (elementImg && elementImg.parentNode === square) {
        square.removeChild(elementImg);
    } else {
        console.warn('[RENDER] removeElementImg: No se encontró imagen de elemento para remover');
    }
}

export function setCustomCursor(imageSrc) {
    document.getElementById("map").style.cursor = "url(" + imageSrc + ") 16 16, auto";
}

export function resetCursor() {
    document.getElementById("map").style.cursor = "auto";
}