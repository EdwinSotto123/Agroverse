import Map from "../game/map.js";
import Player from "../game/player.js";
import Element from "../element/element.js";
import {displayMessageToAlertBox, setCustomCursor} from "../view/render.js";
import Menu from "../view/menu.js";
import {infiniteResources, panMode} from "./game_settings.js";

export function mouseDownToolBar(event) {
	const target = event.target.closest('div');
	const element = Element.getElementFromId(target.getElementsByTagName("img")[0].id);
	if (element === null)
		return;
	if (!infiniteResources) {
		const quantity = target.getElementsByClassName("txtNumber")[0].textContent;
		if (quantity <= 0)
			return displayMessageToAlertBox(ENG_LANG.NO_ENOUGH_RESOURCE);
		Player.player.setHandElementQuantity(quantity)
	}
	Player.player.setHandElement(element)
	setCustomCursor(Player.player.getHandElement().getElementImageSrc());
}

export function mouseDown(event) {
	if (Menu.haveMenuActive())
			return;

	// Left click: SIEMPRE manejar acciones de juego primero con detección mejorada
	if (event.button === 0) {
		// Usar detección mejorada pasando el evento
		const square = Map.mapInstance.tryToGetSquareFromGround(event.target, event);
		
		if (square !== null && Player.player.getHandElement() != null) {
			// Prevenir interferencias y mantener la herramienta seleccionada
			event.stopPropagation();
			event.preventDefault();
			
			// Ejecutar la acción de la herramienta
			Player.player.getHandElement().setElementToSquare(square);
			
			// IMPORTANTE: NO remover la herramienta para mantenerla seleccionada
			// Player.player.removeHandElement(); // <- COMENTADO para mantener selección
			
			console.log('Herramienta usada en celda:', square, 'Herramienta:', Player.player.getHandElement());
			return;
		}
	}

	// Right click: handle panning when pan mode is enabled - completely ignore it
	if (event.button === 2 && panMode) {
		// Don't handle right-click at all in pan mode - let Map handle everything
		return;
	}

	// Para cualquier otra interacción, intentar obtener la celda con detección mejorada
	const square = Map.mapInstance.tryToGetSquareFromGround(event.target, event);
	if (square === null)
		return;

	// Right click: traditional mode (not used currently)
	if (event.button === 2 && !panMode) {
		event.preventDefault();
		Player.player.removeHandElement();
		const element = Map.mapInstance.getElementFromSquare(square);
		if (element.getElementAction() === undefined)
			return;
		element.getElementAction().executor(square);
	}
}

export function mouseMove(event) {
	Player.player.setMouseXY(event.clientX, event.clientY);
	
	// Agregar feedback visual cuando se pasa el mouse sobre celdas con herramienta seleccionada
	if (Player.player.getHandElement() != null) {
		const square = Map.mapInstance.tryToGetSquareFromGround(event.target, event);
		if (square) {
			// Limpiar feedback anterior de manera más eficiente
			const previousHighlighted = document.querySelector('.square.highlighted');
			if (previousHighlighted && previousHighlighted !== square) {
				previousHighlighted.style.boxShadow = '';
				previousHighlighted.classList.remove('highlighted');
			}
			
			// Agregar clase CSS para feedback visual - resistente al zoom
			square.style.boxShadow = '0 0 10px rgba(74, 140, 58, 0.7), inset 0 0 5px rgba(74, 140, 58, 0.3)';
			square.classList.add('highlighted');
		} else {
			// Si no hay celda bajo el cursor, limpiar todo el feedback
			const highlighted = document.querySelector('.square.highlighted');
			if (highlighted) {
				highlighted.style.boxShadow = '';
				highlighted.classList.remove('highlighted');
			}
		}
	}
}

export function mouseLeave(event) {
	// Limpiar feedback visual cuando el mouse sale del área del mapa
	const highlighted = document.querySelector('.square.highlighted');
	if (highlighted) {
		highlighted.style.boxShadow = '';
		highlighted.classList.remove('highlighted');
	}
}

export function keyDown(event) {
	// Manejar teclas especiales
	if (event.key === 'Escape') {
		// Limpiar selección de herramienta con Escape
		Player.player.removeHandElement();
		// Limpiar feedback visual
		const allSquares = document.querySelectorAll('.square');
		allSquares.forEach(sq => {
			sq.style.boxShadow = '';
		});
		// Restaurar cursor normal
		document.body.style.cursor = 'auto';
		console.log('Herramienta deseleccionada con Escape');
	}
}