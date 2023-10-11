import { Point, Rectangle } from "pixi.js";
import { ExtractKeysOfType } from "core/utils/type";

export const calc = <T>(target: T, fn: (prev: T) => T) => fn(target);

/** `Point` と互換性のある座標指定 */
export interface PointLike {
  x: number;
  y: number;
}
/** `Point` を作成 */
export const xy = (x: number, y: number) => new Point(x, y);
/** `{x, y}` から `Point` に変換、または複製する */
xy.from = (p: PointLike) => xy(p.x, p.y);
/** 加算 */
xy.add = (from: PointLike, to: PointLike) =>
  xy.from(calc(from, (prev) => xy(prev.x + to.x, prev.y + to.y)));
/** 減算 */
xy.sub = (from: PointLike, to: PointLike) =>
  xy.from(calc(from, (prev) => xy(prev.x - to.x, prev.y - to.y)));
/** 乗算 */
xy.mul = (from: PointLike, to: PointLike) =>
  xy.from(calc(from, (prev) => xy(prev.x * to.x, prev.y * to.y)));
/** 除算 */
xy.div = (from: PointLike, to: PointLike) =>
  xy.from(calc(from, (prev) => xy(prev.x / to.x, prev.y / to.y)));
/** 剰余 */
xy.mod = (from: PointLike, to: PointLike) =>
  xy.from(calc(from, (prev) => xy(prev.x % to.x, prev.y % to.y)));
/** オブジェクトから座標を抽出 */
xy.pick = <T extends object>(
  obj: T,
  keyX?: ExtractKeysOfType<T, number>,
  keyY?: ExtractKeysOfType<T, number>
): Point =>
  xy(keyX ? (obj[keyX] as number) : 0, keyY ? (obj[keyY] as number) : 0);
/** 反転 */
xy.flip = (from: PointLike) => xy.mul(from, xy(-1, -1));
/** 横方向に反転 */
xy.flipX = (from: PointLike) => xy.mul(from, xy(-1, 1));
/** 縦方向に反転 */
xy.flipY = (from: PointLike) => xy.mul(from, xy(1, -1));

/** `Rectangle` を作成 */
export const xywh = (x: number, y: number, w: number, h: number) =>
  new Rectangle(x, y, w, h);
/** 座標を抽出 */
xywh.xy = (rect: Rectangle) => xy(rect.x, rect.y);
/** 幅高を抽出 */
xywh.wh = (rect: Rectangle) => xy(rect.width, rect.height);
/** オブジェクトから Rectangle を抽出 */
xywh.pick = <T extends object>(
  obj: T,
  keyX?: ExtractKeysOfType<T, number>,
  keyY?: ExtractKeysOfType<T, number>,
  keyW?: ExtractKeysOfType<T, number>,
  keyH?: ExtractKeysOfType<T, number>
) =>
  xywh(
    keyX ? (obj[keyX] as number) : 0,
    keyY ? (obj[keyY] as number) : 0,
    keyW ? (obj[keyW] as number) : 0,
    keyH ? (obj[keyH] as number) : 0
  );

/** `[x, y, x, y, ...]` を `[{x, y}, {x, y}, ...]` に変換 */
export const numsToPoints = (nums: number[]) =>
  nums.filter((_, i) => i % 2 === 0).map((val, i) => xy(val, nums[i * 2 + 1]));

export const testPointInRect = (point: Point, rect: Rectangle) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

/**
 * 基準となる矩形の中心に置く場合の左上座標を計算
 * @param selfSize 計算する矩形
 * @param target 基準にする矩形 (Point なら幅高のみ)
 */
export const calcCenterPosition = (
  selfSize: Point,
  target: Point | Rectangle
) => {
  if (target instanceof Point) {
    return xy((target.x - selfSize.x) / 2, (target.y - selfSize.y) / 2);
  }
  return xy(
    target.x + (target.width - selfSize.x) / 2,
    target.y + (target.height - selfSize.y) / 2
  );
};

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
