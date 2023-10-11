import { Container } from "PIXI";
import { ComponentBase } from "./ComponentBase";

export class DisplayBase extends ComponentBase {
  content: Container;
  constructor(name: string) {
    super(name);
    this.content = new Container();
  }
}
