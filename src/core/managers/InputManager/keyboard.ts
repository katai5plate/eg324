import keycode from "keycode";
import { Key } from "ts-key-enum";
import { ToReadonlyMap } from "core/utils/type";

export type KeyCodeNames = keyof (typeof keycode)["codes"] | keyof typeof Key;

export class KeyboardDevice {
  protected _buttonDict: Map<KeyCodeNames, number>;

  constructor() {
    this._buttonDict = new Map();
    document.addEventListener("keydown", (e) => {
      const keyName = e.key as KeyCodeNames;
      if (!this._buttonDict.has(keyName)) {
        this._buttonDict.set(keyName, 0);
      }
    });
    document.addEventListener("keyup", (e) => {
      const keyName = e.key as KeyCodeNames;
      this._buttonDict.delete(keyName);
    });
  }
  get buttonDict(): ToReadonlyMap<typeof this._buttonDict> {
    return this._buttonDict;
  }
  update() {
    this._buttonDict.forEach((v, k) => {
      if (this._buttonDict.has(k)) this._buttonDict.set(k, v + 1);
    });
  }
}
