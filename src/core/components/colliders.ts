import S from "sat";
import { ComponentBase } from "core/systems/ComponentBase";
import { Rectangle } from "pixi.js";
import { PointLike, xy, xywh } from "core/utils/math";

class ColliderBase extends ComponentBase {
  body?: S.Vector | S.Box | S.Circle;
  constructor(name: string) {
    super(name);
  }
  get position() {
    if (this.body instanceof S.Vector) {
      return xy(this.body.x, this.body.y);
    } else if (this.body) {
      return xy.from(this.body.pos);
    }
    return xy(NaN, NaN);
  }
  get rect() {
    if (this.body instanceof S.Vector)
      return xywh(this.body.x, this.body.y, 1, 1);
    if (this.body instanceof S.Box)
      return xywh(this.body.pos.x, this.body.pos.y, this.body.w, this.body.h);
    if (this.body instanceof S.Circle)
      return xywh(this.body.pos.x, this.body.pos.y, this.body.r, this.body.r);
    return xywh(NaN, NaN, NaN, NaN);
  }
  setPosition(pos: PointLike) {
    if (!this.body) return;
    if (this.body instanceof S.Vector) {
      this.body.x = pos.x;
      this.body.y = pos.y;
    } else {
      this.body.pos.x = pos.x;
      this.body.pos.y = pos.y;
    }
  }
}

const boolToRes = (a: unknown, b: unknown, result: boolean) => {
  if (!result) return null;
  const res = new S.Response();
  res.a = a;
  res.b = b;
  res.aInB = result;
  res.bInA = result;
  return res;
};

export class ColliderPoint extends ColliderBase {
  body: S.Vector;
  constructor(point?: PointLike) {
    super("collider-box");
    this.body = new S.Vector(point?.x ?? NaN, point?.y ?? NaN);
  }
  hitTest(col: ColliderBase) {
    const target = col.body;
    let result = false;
    if (target instanceof S.Vector)
      result = this.body.x === target.x && this.body.y === target.y;
    if (target instanceof S.Box)
      result = S.pointInPolygon(this.body, target.toPolygon());
    if (target instanceof S.Circle) result = S.pointInCircle(this.body, target);
    return boolToRes(this.body, target, result);
  }
}

export class ColliderBox extends ColliderBase {
  body: S.Box;
  constructor(size: PointLike | Rectangle) {
    super("collider-box");
    if (size instanceof Rectangle) {
      this.body = new S.Box(
        new S.Vector(size.x, size.y),
        size.width,
        size.height
      );
    } else {
      this.body = new S.Box(new S.Vector(NaN, NaN), size.x, size.y);
    }
  }
  hitTest(col: ColliderBase) {
    const target = col.body;
    const res = new S.Response();
    const body = this.body.toPolygon();
    if (target instanceof S.Vector)
      return boolToRes(this.body, target, S.pointInPolygon(target, body));
    if (target instanceof S.Box)
      return S.testPolygonPolygon(body, target.toPolygon(), res) ? res : null;
    if (target instanceof S.Circle)
      return S.testPolygonCircle(body, target, res) ? res : null;
    return null;
  }
}

export class ColliderCircle extends ColliderBase {
  body: S.Circle;
  constructor(point: PointLike | null, r: number) {
    super("collider-box");
    if (point) {
      this.body = new S.Circle(new S.Vector(point.x, point.y), r);
    } else {
      this.body = new S.Circle(new S.Vector(NaN, NaN), r);
    }
  }
  hitTest(col: ColliderBase) {
    const target = col.body;
    const res = new S.Response();
    if (target instanceof S.Vector)
      return boolToRes(this.body, target, S.pointInCircle(target, this.body));
    if (target instanceof S.Box)
      return S.testCirclePolygon(this.body, target.toPolygon(), res)
        ? res
        : null;
    if (target instanceof S.Circle)
      return S.testCircleCircle(this.body, target, res) ? res : null;
    return null;
  }
}
