import { Empty } from "core/displays/Empty";
import { ComponentBase } from "./ComponentBase";
import { DisplayBase } from "./DisplayBase";
import { Scene } from "./Scene";
import { GameManager } from "core/managers/GameManager";

type OnFunction = (props: { game: GameManager; self: GameObject }) => void;
type OnFunctions = { setup?: OnFunction; update?: OnFunction };

export const define = <D extends DisplayBase>({
  display,
  components,
  children,
  on,
}: {
  display?: () => D;
  components?: () => ComponentBase[];
  children?: () => GameObject[];
  on?: OnFunctions;
}) => {
  return class extends GameObject {
    constructor() {
      super(display?.() ?? null, components?.() ?? [], children?.() ?? []);
    }
    _setup() {
      super._setup();
      on?.setup?.({ game: GameManager.game, self: this });
    }
    _update() {
      super._update();
      if (this._destroyed) return;
      on?.update?.({ game: GameManager.game, self: this });
    }
  };
};
export const regist = <S extends GameObject>(
  gameObjectClass: { new (): S } | null,
  on?: OnFunctions
) => {
  const gameObject = (
    gameObjectClass ? new gameObjectClass() : new GameObject(null, [], [])
  ) as S;
  on?.setup && gameObject.setInstantSetup(on.setup);
  on?.update && gameObject.setInstantUpdate(on.update);
  return gameObject;
};
export const prefab = (children: () => GameObject[], on?: OnFunctions) =>
  define({ children, on });

export class GameObject {
  _display: DisplayBase;
  _components: Set<ComponentBase>;
  _children: Set<GameObject>;
  protected onInstantSetup?: OnFunction;
  protected onInstantUpdate?: OnFunction;
  _scene?: Scene;
  _destroyed?: true;
  constructor(
    display: DisplayBase | null,
    components: ComponentBase[],
    children: GameObject[]
  ) {
    this._components = new Set(components);
    this._display = display ?? new Empty();
    this._children = new Set(children ?? []);
  }
  each(fn: (self: GameObject) => void) {
    for (const child of this._children) {
      fn(child);
    }
  }
  _pixiSetup(scene: Scene) {
    this._scene = scene;
    if (this._display.content) {
      scene.pixiStage.addChild(this._display.content);
    }
    for (const child of this._children) {
      child._pixiSetup(scene);
    }
  }
  setInstantSetup(fn: OnFunction) {
    this.onInstantSetup = fn;
  }
  _setup() {
    this.onInstantSetup?.({ game: GameManager.game, self: this });

    for (const child of this._children) {
      child._setup();
    }
  }
  setInstantUpdate(fn: OnFunction) {
    this.onInstantUpdate = fn;
  }
  _update() {
    if (this._destroyed) return;
    this.onInstantUpdate?.({ game: GameManager.game, self: this });
    for (const child of this._children) {
      child._update();
    }
  }
  getDisplay(): DisplayBase;
  getDisplay<C extends DisplayBase>(target: { new (...args: any): C }): C;
  getDisplay<C extends DisplayBase>(target?: {
    new (...args: unknown[]): C;
  }): C | DisplayBase {
    if (target) {
      if (this._display instanceof target) {
        return this._display;
      }
      throw new Error(
        `ディスプレイコンポーネントの型が合いません: ${this._display.name}, ${target?.name}`
      );
    }
    return this._display;
  }
  getComponent<C extends ComponentBase>(target: { new (...args: any): C }) {
    for (const component of this._components) {
      if (component instanceof target) return component;
    }
    throw new Error("コンポーネントが見つかりません: " + target?.name);
  }
  _findGameObject<T extends GameObject>(target: {
    new (...args: any[]): T;
  }): T | null {
    if (this instanceof target) {
      return this as T;
    }
    for (const child of this._children) {
      const found = child._findGameObject(target);
      if (found) return found;
    }
    return null;
  }
  destroy() {
    this._destroyed = true;

    this._children.clear();
    this._components.clear();
    this.onInstantSetup = undefined;
    this.onInstantUpdate = undefined;

    this._display.content.destroy();
    this.each((child) => child.destroy());
  }
}
