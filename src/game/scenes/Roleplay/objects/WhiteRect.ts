import { Sprite } from "core/displays/Sprite";
import { define } from "core/systems/GameObject";
import { sketchTexture } from "core/utils/graphics";
import { xy } from "core/utils/math";

export const WhiteRect = define(
  () =>
    new Sprite(
      sketchTexture(xy(10, 10), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 10, 10);
      })
    ),
  null,
  [],
  {
    setup({ self }) {
      const { content } = self.getDisplay();
      content.x = 0;
      content.y = 0;
    },
  }
);
