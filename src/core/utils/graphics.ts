import { SCALE_MODES, Texture } from "PIXI";
import { PointLike } from "core/utils/math";

export const sketchTexture = (
  size: PointLike,
  fn: (ctx: CanvasRenderingContext2D) => void,
  antialias = false
) => {
  const canvas = document.createElement("canvas");
  canvas.width = size.x;
  canvas.height = size.y;
  fn(canvas.getContext("2d")!);

  const texture = Texture.from(canvas);
  texture.baseTexture.scaleMode = antialias
    ? SCALE_MODES.LINEAR
    : SCALE_MODES.NEAREST;

  return texture;
};
