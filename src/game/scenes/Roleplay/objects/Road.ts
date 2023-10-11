import { Tilemap } from "core/displays/Tilemap";
import { define } from "core/systems/GameObject";
import { DEG2RAD } from "core/utils/math";
import simpleTileset from "game/assets/tilesets/simple.ts";

export const Road = define(
  () =>
    new Tilemap(simpleTileset, [
      [..."🟦🟦🟦🟩🟫🟩🟩🟩🟩🟩🟩🟩🟩🟩🌱🟩🟦🟦🟦🟦"],
      [..."🟦🟦🟦🟩🟫🟤🟤🟤🟩🟩🟩🟩🟩🧱🟩🟩🟩🟦🌊🟦"],
      [..."🧱📉🧱🟫🟫🟤🧱🟤🟩🟩🟩🪨🧱📉🧱🟩🟩🟩🟩🟦"],
      [..."🧱📉🧱🟫🪨🟤🟤🟤🟩🟩🟩🟩🟦🌀🟦🌱🟩🪨🟩🟩"],
      [..."🟦🌀🌊🟫🟩🌱🟩🟩🟩🟩🟩🟦🔵🟦🟦🟩🟩🟩🟩🟩"],
      [..."🟦🟦🟦🟫🟩🟩🪨🌱🟩🟩🌱🟦🟦🟦🟦🟩🟩🟩🟩🟩"],
      [..."🌊🟦🔵🟫🟫🟩🟩🟩🟩🟩🟩🟩🟦🌊🟩🟩🟩🟩🪨🟩"],
      [..."🟦🟦🟦🟩🟫🟫🟫🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"],
      [..."🟦🟦🟦🟩🟩🟫🟫🟫🟤🟤🟩🌱🟩🟩🟩🟩🟫🟫🟫🟩"],
      [..."🟦🌊🟦🟩🟩🟩🟩🟩🟤🟤🟫🟩🟩🟤🟤🟤🟫🪨🟫🟩"],
      [..."🟦🟦🟦🟦🟩🟩🟩🟩🟩🟩🟫🟫🟫🟤🌱🟤🟫🟫🟫🟫"],
      [..."🟦🟦🟦🟦🌱🟩🟩🟩🟩🟩🟩🟩🟩🟤🟤🟤🟩🟩🟩🟫"],
      [..."🔵🟦🟦🟦🟦🟩🟩🟩🟩🟩🟩🧱🟩🟩🟩🟩🟩🟩🟩🟫"],
      [..."🟦🟦🟦🌊🟦🟦🔵🟦🟦🟩🧱📉🧱🟩🟩🟩🟩🟩🟩🟫"],
      [..."🌊🟦🟦🟦🟦🟦🟦🟦🌊🟦🟦🌀🔵🟦🟩🟩🟩🟩🟩🌱"],
    ]),
  null,
  [],
  () => {
    let time = 0;

    return {
      setup() {
        time = 0;
      },
      update({ game, self }) {
        const { content } = self.getDisplay(Tilemap);
        content.scale.set(1 + Math.abs(Math.sin((time / 5) * DEG2RAD)) * 2);
        content.pivot.set(
          content.width / (2 * content.scale.x),
          content.height / (2 * content.scale.y)
        );

        time += game.delta;

        (time | 0) % 10 === 0 && content.updateAnimation();
        content.x = 160 + Math.sin(-(time / 5) * DEG2RAD) * 160;
        content.y = 120 + Math.cos((time / 2) * DEG2RAD) * 120;
      },
    };
  }
);
