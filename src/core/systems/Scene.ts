import { Container } from "PIXI";
import { GameObject, prefab } from "./GameObject";

export const defineScene = (
  gameObject: { new (): GameObject } | GameObject[]
) =>
  class extends Scene {
    constructor() {
      super(Array.isArray(gameObject) ? prefab(gameObject) : gameObject);
    }
  };

export class Scene {
  gameObject: GameObject;
  pixiStage: Container;
  constructor(prefab: { new (): GameObject }) {
    this.gameObject = new prefab();
    this.pixiStage = new Container();
    this.pixiStage.sortableChildren = true;
  }
  setup() {
    this.gameObject._pixiReset(this);
    this.gameObject._pixiSetup(this);
    this.gameObject._setup();
  }
  update() {
    this.gameObject._update();
  }
}
