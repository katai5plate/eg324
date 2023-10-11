type KeyType<T> = T extends Map<infer K, any> ? K : never;
type ValueType<T> = T extends Map<any, infer V> ? V : never;
export type ToReadonlyMap<M> = ReadonlyMap<KeyType<M>, ValueType<M>>;

export type ImageFormat = "bmp" | "png";
export type ImagesJSON<I> = {
  [N in keyof I]: {
    format: ImageFormat;
    data: string;
  };
};
export interface DecompressedBitmap {
  palette: string;
  pixels: string;
}

export type ExtractKeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
