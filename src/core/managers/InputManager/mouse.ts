import { Container, Point, Sprite, Texture } from "pixi.js";
import { xy } from "core/utils/math";
import { ToReadonlyMap } from "core/utils/type";

enum Buttons {
  LEFT = 0,
  CENTER,
  RIGHT,
  WHEEL_UP = 100,
  WHEEL_DOWN,
  WHEEL_LEFT,
  WHEEL_RIGHT,
}

export type MouseButtonNames = keyof typeof Buttons;

export class MouseDevice {
  protected screenSize: Point;
  protected wheelDelta: Point;
  protected prevPosition: Point;

  protected _buttonDict: Map<MouseButtonNames, number>;
  protected _position: Point;
  protected _deltaPosition: Point;

  constructor(screenSize: Point, stage: Container) {
    this.screenSize = screenSize;
    this._buttonDict = new Map();
    this.wheelDelta = xy(0, 0);
    this._position = xy(0, 0);
    this.prevPosition = xy(0, 0);
    this._deltaPosition = xy(0, 0);
    document.addEventListener("mousedown", (e) => {
      const buttonName = Buttons[e.button] as MouseButtonNames;
      if (e.button < 3 && !this._buttonDict.has(buttonName)) {
        this._buttonDict.set(buttonName, 0);
      }
    });
    document.addEventListener("mouseup", (e) => {
      const buttonName = Buttons[e.button] as MouseButtonNames;
      this._buttonDict.delete(buttonName);
    });
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("wheel", ({ deltaX, deltaY }) => {
      this.wheelDelta.x = deltaX;
      this.wheelDelta.y = deltaY;
      if (deltaY < 0 && !this._buttonDict.has("WHEEL_UP"))
        this._buttonDict.set("WHEEL_UP", 0);
      if (deltaY > 0 && !this._buttonDict.has("WHEEL_DOWN"))
        this._buttonDict.set("WHEEL_DOWN", 0);
      if (deltaX < 0 && !this._buttonDict.has("WHEEL_LEFT"))
        this._buttonDict.set("WHEEL_LEFT", 0);
      if (deltaX > 0 && !this._buttonDict.has("WHEEL_RIGHT"))
        this._buttonDict.set("WHEEL_RIGHT", 0);
    });
    const touchScreen = new Sprite(Texture.WHITE);
    touchScreen.name = "MouseManager: touchScreen";
    touchScreen.width = this.screenSize.x;
    touchScreen.height = this.screenSize.y;
    touchScreen.alpha = 0;
    touchScreen.eventMode = "static";
    touchScreen.on("pointermove", (e) => {
      this.prevPosition.set(this._position.x, this._position.y);
      this._position.set(e.global.x, e.global.y);
      this._deltaPosition.set(
        this._position.x - this.prevPosition.x,
        this._position.y - this.prevPosition.y
      );
    });
    stage.addChild(touchScreen);
  }
  get buttonDict(): ToReadonlyMap<typeof this._buttonDict> {
    return this._buttonDict;
  }
  get deltaPosition(): Readonly<typeof this._deltaPosition> {
    return this._deltaPosition;
  }
  get position(): Readonly<typeof this._position> {
    return this._position;
  }
  update() {
    this._buttonDict.forEach((v, k) => {
      if (this._buttonDict.has(k)) this._buttonDict.set(k, v + 1);
      const KEEP_WHEEL_FRAMES = 5;
      if (
        (this._buttonDict.get("WHEEL_UP") ?? 0) >= KEEP_WHEEL_FRAMES ||
        (this._buttonDict.get("WHEEL_DOWN") ?? 0) >= KEEP_WHEEL_FRAMES ||
        (this._buttonDict.get("WHEEL_LEFT") ?? 0) >= KEEP_WHEEL_FRAMES ||
        (this._buttonDict.get("WHEEL_RIGHT") ?? 0) >= KEEP_WHEEL_FRAMES
      ) {
        this._buttonDict.delete("WHEEL_UP");
        this._buttonDict.delete("WHEEL_DOWN");
        this._buttonDict.delete("WHEEL_LEFT");
        this._buttonDict.delete("WHEEL_RIGHT");
        this.wheelDelta.set(0, 0);
      }
      this._deltaPosition.set(
        this._position.x - this.prevPosition.x,
        this._position.y - this.prevPosition.y
      );
    });
  }
}
