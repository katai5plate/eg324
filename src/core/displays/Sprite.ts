import { Sprite as PSprite, Resource, Texture } from "PIXI";
import { DisplayBase } from "core/systems/DisplayBase";

export class Sprite extends DisplayBase {
  constructor(texture?: Texture<Resource>) {
    super("sprite");
    this.content = new PSprite(texture);
  }
}
