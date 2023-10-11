import texture from "game/assets/tilesets/simple.png";

export default {
  texture,
  tileset: {
    tileSize: 16,
    tiles: [
      { id: "🟩", trim: { x: 0, y: 0 } },
      { id: "🌱", trim: { x: 1, y: 0 } },
      { id: "🪨", trim: { x: 2, y: 0 } },
      { id: "🟦", trim: { x: 0, y: 1 } },
      { id: "🌊", trim: { x: 1, y: 1 } },
      { id: "🔵", trim: { x: 2, y: 1 } },
      { id: "🟫", trim: { x: 0, y: 2 } },
      { id: "🟤", trim: { x: 1, y: 2 } },
      { id: "🧱", trim: { x: 2, y: 2 } },
      { id: "📉", trim: { x: 3, y: 0 }, anim: [{ x: 3, y: 1 }] },
      { id: "🌀", trim: { x: 3, y: 2 } },
    ],
  },
};
