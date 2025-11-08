// Simple in-memory entity registry for planted areas (and future entities)
// Each entity: { id, type, elementId, w, h, geo, squares: number[], createdAt }

const EntityStore = {
  _seq: 1,
  _map: new Map(),

  create(meta) {
    const id = 'e' + (this._seq++);
    const rec = { id, createdAt: Date.now(), ...meta };
    this._map.set(id, rec);
    return rec;
  },

  get(id) { return this._map.get(id); },

  fromSquare(square) {
    if (!square) return null;
    const id = square.dataset?.entityId;
    if (id) return this.get(id);
    // Fallback: find entity that covers this square index
    const squares = Array.from(document.querySelectorAll('.square'));
    const idx = squares.indexOf(square);
    if (idx === -1) return null;
    for (const [, rec] of this._map) {
      if (Array.isArray(rec.squares) && rec.squares.includes(idx)) return rec;
    }
    return null;
  }
};

export default EntityStore;
