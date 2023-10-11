import { Container, Point } from "pixi.js";
import { xy } from "core/utils/math";
import { KeyboardDevice, KeyCodeNames } from "./keyboard";
import {
  GamepadDevice,
  PadButtonNames,
  getVelocityWithinRange,
} from "./gamepad";
import { MouseButtonNames, MouseDevice } from "./mouse";

export class InputManager {
  protected keyboardDevice: KeyboardDevice;
  protected gamepadDevice: GamepadDevice;
  protected mouseDevice: MouseDevice;

  constructor(screenSize: Point, stage: Container) {
    this.keyboardDevice = new KeyboardDevice();
    this.gamepadDevice = new GamepadDevice();
    this.mouseDevice = new MouseDevice(screenSize, stage);
  }
  _update() {
    this.keyboardDevice.update();
    this.gamepadDevice.update();
    this.mouseDevice.update();
  }
  isKeyTriggered(key: KeyCodeNames) {
    return (this.keyboardDevice.buttonDict.get(key) ?? NaN) === 1;
  }
  isKeyPressed(key: KeyCodeNames, frames = 1) {
    return (this.keyboardDevice.buttonDict.get(key) ?? NaN) > frames;
  }
  isKeyReleased(key: KeyCodeNames) {
    return !this.keyboardDevice.buttonDict.has(key);
  }
  isPadTriggered(player: number, button: PadButtonNames) {
    const pad = this.gamepadDevice.buttonDict.get(player);
    return (pad?.get(button) ?? NaN) === 1;
  }
  isPadPressed(player: number, button: PadButtonNames, frames = 1) {
    const pad = this.gamepadDevice.buttonDict.get(player);
    return (pad?.get(button) ?? NaN) > frames;
  }
  isPadReleased(player: number, button: PadButtonNames) {
    const pad = this.gamepadDevice.buttonDict.get(player);
    return !pad?.has(button);
  }
  isMouseTriggered(button: MouseButtonNames) {
    return (this.mouseDevice.buttonDict.get(button) ?? NaN) === 1;
  }
  isMousePressed(button: MouseButtonNames, frames = 1) {
    return (this.mouseDevice.buttonDict.get(button) ?? NaN) > frames;
  }
  isMouseReleased(button: MouseButtonNames) {
    return !this.mouseDevice.buttonDict.has(button);
  }
  getPadStick(player: number, stick: number, threshold = 0.2) {
    const polar = this.gamepadDevice.stickDict.get(player)?.[stick];
    if (!polar) return xy(0, 0);
    const { dx, dy } = polar;
    return xy(
      dx >= threshold || dx <= threshold ? dx : 0,
      dy >= threshold || dy <= threshold ? dy : 0
    );
  }
  getPadStickAngle(
    player: number,
    stick: number,
    angle: number,
    range = 45,
    threshold = 0.2
  ) {
    const polar = this.gamepadDevice.stickDict.get(player)?.[stick];
    if (!polar) return 0;
    const velocity = getVelocityWithinRange(polar, angle, range);
    return velocity >= threshold ? velocity : 0;
  }
  getPadStickRight(player: number, stick: number, range = 45, threshold = 0.2) {
    return this.getPadStickAngle(player, stick, 45 * 0, range, threshold);
  }
  getPadStickDown(player: number, stick: number, range = 45, threshold = 0.2) {
    return this.getPadStickAngle(player, stick, 45 * 2, range, threshold);
  }
  getPadStickLeft(player: number, stick: number, range = 45, threshold = 0.2) {
    return this.getPadStickAngle(player, stick, 45 * 4, range, threshold);
  }
  getPadStickUp(player: number, stick: number, range = 45, threshold = 0.2) {
    return this.getPadStickAngle(player, stick, 45 * 6, range, threshold);
  }
  getMousePosition() {
    return this.mouseDevice.position;
  }
  getMouseMoveDelta(threshold = 0.2, limit = Infinity) {
    const { x, y } = this.mouseDevice.deltaPosition;
    return xy(
      x >= threshold
        ? Math.min(limit, x)
        : x <= -threshold
        ? Math.max(-limit, x)
        : 0,
      y >= threshold
        ? Math.min(limit, y)
        : y <= -threshold
        ? Math.max(-limit, y)
        : 0
    );
  }
  getAxis(
    mode:
      | "WASD"
      | "ARROW"
      | "NUM"
      | "HJKL"
      | "IJKL"
      | "4PAD"
      | "4STICK"
      | "STICK"
      | "WHEEL",
    {
      padPlayer = 0,
      padStick = 0,
      padRange = 45,
      threshold = 0.2,
    }: {
      padPlayer?: number;
      padStick?: number;
      padRange?: number;
      threshold?: number;
    } = {}
  ) {
    const p = xy(0, 0);
    switch (mode) {
      case "WASD": {
        if (this.isKeyPressed("w")) p.y = -1;
        if (this.isKeyPressed("a")) p.x = -1;
        if (this.isKeyPressed("s")) p.y = 1;
        if (this.isKeyPressed("d")) p.x = 1;
        break;
      }
      case "ARROW": {
        if (this.isKeyPressed("ArrowLeft")) p.x = -1;
        if (this.isKeyPressed("ArrowRight")) p.x = 1;
        if (this.isKeyPressed("ArrowUp")) p.y = -1;
        if (this.isKeyPressed("ArrowDown")) p.y = 1;
        break;
      }
      case "NUM": {
        if (this.isKeyPressed("2")) p.y = 1;
        if (this.isKeyPressed("4")) p.x = -1;
        if (this.isKeyPressed("6")) p.x = 1;
        if (this.isKeyPressed("8")) p.y = -1;
        break;
      }
      case "HJKL": {
        if (this.isKeyPressed("h")) p.x = -1;
        if (this.isKeyPressed("j")) p.y = 1;
        if (this.isKeyPressed("k")) p.y = -1;
        if (this.isKeyPressed("l")) p.x = 1;
        break;
      }
      case "IJKL": {
        if (this.isKeyPressed("i")) p.y = -1;
        if (this.isKeyPressed("j")) p.x = -1;
        if (this.isKeyPressed("k")) p.y = 1;
        if (this.isKeyPressed("l")) p.x = 1;
        break;
      }
      case "4PAD": {
        if (this.isPadPressed(padPlayer, "LEFT")) p.x = -1;
        if (this.isPadPressed(padPlayer, "RIGHT")) p.x = 1;
        if (this.isPadPressed(padPlayer, "UP")) p.y = -1;
        if (this.isPadPressed(padPlayer, "DOWN")) p.y = 1;
        break;
      }
      case "4STICK": {
        const [left, right, up, down] = [
          this.getPadStickRight(padPlayer, padStick, padRange, threshold),
          this.getPadStickLeft(padPlayer, padStick, padRange, threshold),
          this.getPadStickUp(padPlayer, padStick, padRange, threshold),
          this.getPadStickDown(padPlayer, padStick, padRange, threshold),
        ];
        if (right) p.x = -right;
        if (left) p.x = left;
        if (up) p.y = -up;
        if (down) p.y = down;
        break;
      }
      case "STICK": {
        const pad = this.getPadStick(padPlayer, padStick, threshold);
        p.x = pad.x;
        p.y = pad.y;
        break;
      }
      case "WHEEL": {
        if (this.isMousePressed("WHEEL_LEFT")) p.x = -1;
        if (this.isMousePressed("WHEEL_RIGHT")) p.x = 1;
        if (this.isMousePressed("WHEEL_UP")) p.y = -1;
        if (this.isMousePressed("WHEEL_DOWN")) p.y = 1;
        break;
      }
    }
    return p;
  }
}
