import { InputManager } from "core/managers/InputManager";
import { xy, xywh } from "core/utils/math";
import { PixiApp } from "./pixi";
import { Scene } from "core/systems/Scene";
import { Gizmo } from "./gizmo";
import { GameObject } from "core/systems/GameObject";

export class GameManager {
  static game: GameManager;

  protected pixiApp: PixiApp;
  protected gizmo?: Gizmo;

  protected frameCount: number = 0;
  protected deltaTime: number = 0;

  protected currentScene: Scene | null;
  protected sceneDict: Map<string, { new (): Scene }>;

  protected _input: InputManager;
  protected _debugMode: boolean;

  constructor({
    debugMode = import.meta.env.DEV,
  }: Partial<{ debugMode: boolean }> = {}) {
    if (GameManager.game) throw new Error("ゲームは開始されています。");
    GameManager.game = this;

    this.pixiApp = new PixiApp();

    this._input = new InputManager(
      xy(this.width, this.height),
      this.pixiApp.stage
    );

    this.sceneDict = new Map();
    this.currentScene = null;

    this.pixiApp.ticker.add((delta) => this.update(delta));

    this._debugMode = debugMode;
    if (this._debugMode) {
      (globalThis as any).__DEBUG__ = this;
      console.log("__DEBUG__ = game");

      this.gizmo = new Gizmo(this.pixiApp.screen);

      const memoryState = {
        prevHeap: 0,
        currentHeap: 0,
      };
      setInterval(() => {
        this.gizmo?.update();
        memoryState.prevHeap = memoryState.currentHeap;
        memoryState.currentHeap =
          ((globalThis as any).performance.memory.totalJSHeapSize /
            (1024 * 2)) |
          0;
        const diff = memoryState.prevHeap - memoryState.currentHeap;
        Math.abs(diff) > 500 &&
          console.log(
            `RAM: ${memoryState.currentHeap} MB (${
              diff > 0 ? "+" : "-"
            }${Math.abs(diff)})`
          );
      }, 1000);
    }
  }
  update(delta: number) {
    this.deltaTime = delta;
    this.frameCount++;
    this._input._update();
    this.currentScene?.update();
  }
  setupScene(
    sceneClasses: Record<string, { new (): Scene }>,
    startFirstScene: string
  ) {
    if (this.sceneDict.size) throw new Error("シーンはセットアップ済です");
    Object.entries<{ new (): Scene }>(sceneClasses).forEach(
      ([alias, sceneClass]) => {
        this.sceneDict.set(alias, sceneClass);
      }
    );
    this.changeScene(startFirstScene);
  }
  changeScene(name: string) {
    const scene = this.sceneDict.get(name);
    if (!scene) throw new Error("無効なシーン名です: " + name);
    this.clearScene();
    this.currentScene = new scene();
    this.connectScene();
    if (this._debugMode) console.log(this.currentScene);
  }
  private clearScene() {
    this.currentScene?.pixiStage.removeChildren();
    this.pixiApp.stage.removeChildren();
  }
  private connectScene() {
    if (!this.currentScene) return;
    this.currentScene.setup();
    this.pixiApp.stage.addChild(this.currentScene.pixiStage);
  }
  get input(): Readonly<typeof this._input> {
    return this._input;
  }
  get width() {
    return this.pixiApp.screen.width;
  }
  get height() {
    return this.pixiApp.screen.height;
  }
  get now() {
    return this.frameCount;
  }
  get delta() {
    return this.deltaTime;
  }
  get fps() {
    return this.pixiApp.ticker.FPS;
  }
  get rect() {
    return xywh(0, 0, this.width, this.height);
  }
  findGameObject<T extends GameObject>(target: { new (...args: any[]): T }): T {
    for (const child of this.currentScene?.gameObject._children ?? []) {
      const found = child._findGameObject(target);
      if (found) return found as T;
    }
    throw new Error("ゲームオブジェクトが見つかりません: " + target.name);
  }
}
