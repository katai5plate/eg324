import { numsToPoints } from "core/utils/math";
import { ToReadonlyMap } from "core/utils/type";

interface Stick {
  dx: number;
  dy: number;
  angle: number;
  velocity: number;
}

enum Buttons {
  A = 0,
  B,
  X,
  Y,
  L1,
  R1,
  L2,
  R2,
  SELECT,
  START,
  L3,
  R3,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  CENTER,
}

export type PadButtonNames = keyof typeof Buttons;

export const getVelocityWithinRange = (
  stick: Stick,
  angle: number,
  range: number
) => {
  const [lowerBound, upperBound] = [
    (angle - range + 360) % 360,
    (angle + range) % 360,
  ];
  if (
    (lowerBound > upperBound &&
      (stick.angle >= lowerBound || stick.angle <= upperBound)) ||
    (stick.angle >= lowerBound && stick.angle <= upperBound)
  )
    return stick.velocity;
  return 0;
};

export class GamepadDevice {
  protected _buttonDict: Map<number, Map<string, number>>;
  protected _stickDict: Map<number, Stick[]>;

  constructor() {
    this._buttonDict = new Map();
    this._stickDict = new Map();
    window.addEventListener("gamepadconnected", () => {});
  }
  get buttonDict(): ToReadonlyMap<typeof this._buttonDict> {
    return this._buttonDict;
  }
  get stickDict(): ToReadonlyMap<typeof this._stickDict> {
    return this._stickDict;
  }
  update() {
    navigator.getGamepads().forEach((gamepad, player) => {
      if (!gamepad) return;
      if (!this._buttonDict.has(player))
        this._buttonDict.set(player, new Map());
      gamepad.buttons.forEach((button, index) => {
        const playerButtons = this._buttonDict.get(player);
        if (!playerButtons) return;
        const buttonName = Buttons[index];
        const hasButtonName = playerButtons.has(buttonName);
        if (button.pressed && !hasButtonName) {
          playerButtons.set(buttonName, 1);
        } else if (!button.pressed && hasButtonName) {
          playerButtons.delete(buttonName);
        } else if (button.pressed && hasButtonName) {
          const prev = playerButtons.get(buttonName);
          if (!prev) return;
          playerButtons.set(buttonName, prev + 1);
        }
      });
      this._stickDict.set(
        player,
        numsToPoints(gamepad.axes as number[]).map(({ x, y }) => {
          return {
            dx: Math.min(Math.max(x, -1), 1),
            dy: Math.min(Math.max(y, -1), 1),
            angle: (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360,
            velocity: Math.min(Math.max(Math.sqrt(x * x + y * y), 0), 1),
          };
        })
      );
    });
  }
}
