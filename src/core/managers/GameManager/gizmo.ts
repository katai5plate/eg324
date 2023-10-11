import { Rectangle } from "PIXI";
import { PointLike } from "core/utils/math";

const DEBUG_FINENESS = 2;

export class Gizmo {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  gizmoRect: Set<[color: string, rect: Rectangle]>;
  gizmoCircle: Set<[color: string, rect: Rectangle]>;
  gizmoLine: Set<[color: string, lines: PointLike[]]>;
  constructor(size: Rectangle) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = size.width * DEBUG_FINENESS;
    this.canvas.height = size.height * DEBUG_FINENESS;
    this.context = this.canvas.getContext("2d")!;
    document.body.appendChild(this.canvas);

    this.gizmoRect = new Set();
    this.gizmoCircle = new Set();
    this.gizmoLine = new Set();
  }
  update() {
    this.context.save();
    this.context.scale(DEBUG_FINENESS, DEBUG_FINENESS);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gizmoRect.forEach(([color, rect]) => {
      this.context.strokeStyle = color;
      this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
    this.gizmoCircle.forEach(([color, rect]) => {
      this.context.strokeStyle = color;
      this.context.beginPath();
      this.context.ellipse(
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        2 * Math.PI
      );
      this.context.stroke();
    });
    this.gizmoLine.forEach(([color, [begin, ...lines]]) => {
      this.context.strokeStyle = color;
      this.context.beginPath();
      this.context.moveTo(begin.x, begin.y);
      lines.forEach((line) => {
        this.context.lineTo(line.x, line.y);
      });
      this.context.stroke();
    });

    this.context.restore();
  }
}
