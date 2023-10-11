import { Empty } from "core/displays/Empty";
import { ComponentBase } from "./ComponentBase";
import { DisplayBase } from "./DisplayBase";
import { Scene } from "./Scene";
import { GameManager } from "core/managers/GameManager";

type OnFunction = (props: { game: GameManager; self: GameObject }) => void;
type OnFunctions = { setup?: OnFunction; update?: OnFunction };
type OnFunctionsSelector = OnFunctions | (() => OnFunctions);

export const define = <D extends DisplayBase>(
  displayComponent: (() => D | null) | null,
  children?: GameObject[],
  on?: OnFunctionsSelector
) => {
  const callback = typeof on === "function" ? on() : on;
  return class extends GameObject {
    constructor() {
      super(displayComponent?.() ?? null, children);
    }
    _setup() {
      super._setup();
      callback?.setup?.({ game: GameManager.game, self: this });
    }
    _update() {
      super._update();
      callback?.update?.({ game: GameManager.game, self: this });
    }
  };
};
export const regist = <S extends GameObject>(
  gameObjectClass: { new (): S } | null,
  on?: OnFunctionsSelector
) => {
  const callback = typeof on === "function" ? on() : on;
  const gameObject = (
    gameObjectClass ? new gameObjectClass() : new GameObject(null)
  ) as S;
  callback?.setup && gameObject.setInstantSetup(callback.setup);
  callback?.update && gameObject.setInstantUpdate(callback.update);
  return gameObject;
};
export const prefab = (
  children: GameObject[],
  on?: { setup?: OnFunction; update?: OnFunction }
) => define(null, children, on);

export class GameObject {
  _displayComponent: DisplayBase;
  _components: Set<ComponentBase>;
  protected children: Set<GameObject>;
  protected onInstantSetup?: OnFunction;
  protected onInstantUpdate?: OnFunction;
  constructor(displayComponent: DisplayBase | null, children?: GameObject[]) {
    this._components = new Set();
    this._displayComponent = displayComponent ?? new Empty();
    this.children = new Set(children ?? []);
  }
  each(fn: (self: GameObject) => void) {
    for (const child of this.children) {
      fn(child);
    }
  }
  _pixiReset(scene: Scene) {
    scene.pixiStage.removeChildren();
  }
  _pixiSetup(scene: Scene) {
    if (this._displayComponent.content) {
      scene.pixiStage.addChild(this._displayComponent.content);
    }
    for (const child of this.children) {
      child._pixiSetup(scene);
    }
  }
  setInstantSetup(fn: OnFunction) {
    this.onInstantSetup = fn;
  }
  _setup() {
    this.onInstantSetup?.({ game: GameManager.game, self: this });

    for (const child of this.children) {
      child._setup();
    }
  }
  setInstantUpdate(fn: OnFunction) {
    this.onInstantUpdate = fn;
  }
  _update() {
    this.onInstantUpdate?.({ game: GameManager.game, self: this });
    for (const child of this.children) {
      child._update();
    }
  }
  getDisplay(): DisplayBase;
  getDisplay<C extends DisplayBase>(target: { new (...args: any): C }): C;
  getDisplay<C extends DisplayBase>(target?: {
    new (...args: unknown[]): C;
  }): C | DisplayBase {
    if (target) {
      if (this._displayComponent instanceof target) {
        return this._displayComponent;
      }
      throw new Error(
        `ディスプレイコンポーネントの型が合いません: ${this._displayComponent.name}, ${target?.name}`
      );
    }
    return this._displayComponent;
  }
  getComponent<C extends ComponentBase>(target: { new (...args: any): C }) {
    for (const component of this._components) {
      if (component instanceof target) return component;
    }
    throw new Error("コンポーネントが見つかりません: " + target?.name);
  }
}
