import {
  Geometry,
  Mesh,
  MeshMaterial,
  Program,
  SCALE_MODES,
  Shader,
  Texture,
} from "pixi.js";
import { DisplayBase } from "core/systems/DisplayBase";
import { PointLike, xy } from "core/utils/math";

type TileId = number | string;

interface Tileset {
  tileSize: number;
  tiles: {
    id: TileId;
    trim: PointLike;
    anim?: PointLike[];
  }[];
}

class TilemapMesh extends Mesh {
  uSampler: Texture;
  tileset: Tileset;
  mapData: TileId[][];
  animationFrame: number;
  shader: MeshMaterial;
  constructor(uSampler: Texture, tileset: Tileset, mapData: TileId[][]) {
    const shader: MeshMaterial = new Shader(
      Program.from(
        `attribute vec2 aVertexPosition;
         attribute vec2 aUvs;
         uniform mat3 translationMatrix;
         uniform mat3 projectionMatrix;
         varying vec2 vUvs;
         void main(void) {
           vUvs = aUvs;
           gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
         }`,
        `varying vec2 vUvs;
         uniform sampler2D uSampler;
         void main(void) {
           gl_FragColor = texture2D(uSampler, vUvs);
         }`
      ),
      {
        uSampler,
      }
    ) as MeshMaterial;

    super(new Geometry(), shader);

    this.uSampler = uSampler;
    this.tileset = tileset;
    this.mapData = mapData;
    this.animationFrame = 0;
    this.shader = shader;
    this.refreshMesh();
  }
  updateAnimation() {
    this.animationFrame++;
    this.refreshMesh();
  }
  protected refreshMesh() {
    const { width, height } = this.uSampler.baseTexture;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    this.mapData.forEach((row, y) => {
      row.forEach((tileId, x) => {
        const tile = this.tileset.tiles.find((t) => t.id === tileId);
        if (tile) {
          const x1 = x * this.tileset.tileSize;
          const y1 = y * this.tileset.tileSize;
          const x2 = x1 + this.tileset.tileSize;
          const y2 = y1 + this.tileset.tileSize;

          vertices.push(x1, y1, x2, y1, x2, y2, x1, y2);

          const baseIndex = x * 4 + y * row.length * 4;
          indices.push(
            baseIndex,
            baseIndex + 1,
            baseIndex + 2,
            baseIndex,
            baseIndex + 2,
            baseIndex + 3
          );

          let trimToUse = xy.mul(
            tile.trim,
            xy(this.tileset.tileSize, this.tileset.tileSize)
          );
          if (tile.anim && tile.anim.length > 0) {
            const frameIndex = this.animationFrame % (tile.anim.length + 1);
            if (frameIndex > 0) {
              trimToUse = xy.mul(
                tile.anim[frameIndex - 1],
                xy(this.tileset.tileSize, this.tileset.tileSize)
              );
            }
          }

          const uvX1 = trimToUse.x / width;
          const uvY1 = trimToUse.y / height;
          const uvX2 = (trimToUse.x + this.tileset.tileSize) / width;
          const uvY2 = (trimToUse.y + this.tileset.tileSize) / height;
          uvs.push(uvX1, uvY1, uvX2, uvY1, uvX2, uvY2, uvX1, uvY2);
        }
      });
    });

    const geometry = new Geometry()
      .addAttribute("aVertexPosition", vertices)
      .addAttribute("aUvs", uvs)
      .addIndex(indices);

    this.geometry = geometry;
  }
}

export class Tilemap extends DisplayBase {
  content: TilemapMesh;
  constructor(
    tilesetData: { texture: string; tileset: Tileset },
    mapData: TileId[][]
  ) {
    super("tilemap");
    const { texture: texturePath, tileset } = tilesetData;
    const texture = Texture.from(texturePath);
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    this.content = new TilemapMesh(texture, tileset, mapData);
  }
}

// export class Tilemap extends DisplayBase {
//   content: TilemapMesh;
//   constructor(tilesetName: string, mapData: TileId[][]) {
//     super("tilemap");

//     this.content = new TilemapMesh(
//       {
//         texture: Texture.from(tileset),
//         tileSize: 16,
//         tiles: [
//           { id: "🟩", trim: { x: 0, y: 0 } },
//           { id: "🌱", trim: { x: 1, y: 0 } },
//           { id: "🪨", trim: { x: 2, y: 0 } },
//           { id: "🟦", trim: { x: 0, y: 1 } },
//           { id: "🌊", trim: { x: 1, y: 1 } },
//           { id: "🔵", trim: { x: 2, y: 1 } },
//           { id: "🟫", trim: { x: 0, y: 2 } },
//           { id: "🟤", trim: { x: 1, y: 2 } },
//           { id: "🧱", trim: { x: 2, y: 2 } },
//           { id: "📉", trim: { x: 3, y: 0 }, anim: [{ x: 3, y: 1 }] },
//           { id: "🌀", trim: { x: 3, y: 2 } },
//         ],
//       },
//       [
//         [..."🟦🟦🟦🟩🟫🟩🟩🟩🟩🟩🟩🟩🟩🟩🌱🟩🟦🟦🟦🟦"],
//         [..."🟦🟦🟦🟩🟫🟤🟤🟤🟩🟩🟩🟩🟩🟩🟩🟩🟩🟦🌊🟦"],
//         [..."🧱📉🧱🟫🟫🟤🧱🟤🟩🟩🟩🪨🟩🟩🟩🟩🟩🟩🟩🟦"],
//         [..."🧱📉🧱🟫🪨🟤🟤🟤🟩🟩🟩🟩🟩🟩🟩🌱🟩🪨🟩🟩"],
//         [..."🟦🌀🌊🟫🟩🌱🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"],
//         [..."🟦🟦🟦🟫🟩🟩🪨🌱🟩🟩🌱🟩🟩🟩🟩🟩🟩🟩🟩🟩"],
//         [..."🌊🟦🔵🟫🟫🟩🟩🟩🟩🟩🟩🟩🟩🪨🟩🟩🟩🟩🪨🟩"],
//         [..."🟦🟦🟦🟩🟫🟫🟫🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"],
//         [..."🟦🟦🟦🟩🟩🟫🟫🟫🟤🟤🟩🌱🟩🟩🟩🟩🟫🟫🟫🟩"],
//         [..."🟦🌊🟦🟩🟩🟩🟩🟩🟤🟤🟫🟩🟩🟤🟤🟤🟫🪨🟫🟩"],
//         [..."🟦🟦🟦🟦🟩🟩🟩🟩🟩🟩🟫🟫🟫🟤🌱🟤🟫🟫🟫🟫"],
//         [..."🟦🟦🟦🟦🌱🟩🟩🟩🟩🟩🟩🟩🟩🟤🟤🟤🟩🟩🟩🟫"],
//         [..."🔵🟦🟦🟦🟦🟩🟩🟩🟩🟩🟩🧱🟩🟩🟩🟩🟩🟩🟩🟫"],
//         [..."🟦🟦🟦🌊🟦🟦🔵🟦🟦🟩🧱📉🧱🟩🟩🟩🟩🟩🟩🟫"],
//         [..."🌊🟦🟦🟦🟦🟦🟦🟦🌊🟦🟦🌀🔵🟦🟩🟩🟩🟩🟩🌱"],
//       ]
//     );
//   }
// }
