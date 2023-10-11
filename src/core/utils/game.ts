export const useState = <S extends object>(
  initState: S,
  onChange?: (props: { prev: S; next: S }) => void
) => {
  for (const key in initState) {
    if (initState.hasOwnProperty(key)) {
      const value = initState[key];
      if (typeof value === "object" && value !== null) {
        if (value.constructor === Object) {
          throw new TypeError("ステートはネストできません: " + key);
        }
      }
    }
  }
  let state = { ...initState };
  const get = <N extends keyof S>(name: N) => state[name];
  const all = () => ({ ...state });
  const set = (fn: (prev: S) => Partial<S>) => {
    const prev = { ...state };
    state = { ...state, ...fn(state) };
    onChange?.({ prev, next: { ...state } });
  };
  return { get, all, set };
};

const getDiff = <S extends object>(a: S, b: S): Partial<S> => {
  const result: Partial<S> = {};
  for (const key in a) {
    if (a[key] !== b[key]) {
      result[key] = b[key];
    }
  }
  return result;
};

const stringify = <O extends object>(obj: O, indent = ""): string => {
  if (typeof obj !== "object" || obj === null) return `${obj}`;
  const entries = Object.entries(obj);
  const result: string[] = [];
  for (const [key, value] of entries) {
    try {
      if (typeof value === "object" && value !== null) {
        result.push(`${indent}${key}:\n${stringify(value, indent + "  ")}`);
      } else {
        result.push(`${indent}${key}: ${value}`);
      }
    } catch (error) {
      result.push(`${indent}${key}: ???`);
    }
  }
  return result.join("\n");
};

export const createStateLog =
  <S extends object>(title: string) =>
  ({ prev, next }: { prev: S; next: S }) => {
    const diff = getDiff(prev, next);

    console.group(title);
    console.log(stringify(diff));
    console.groupEnd();
  };
