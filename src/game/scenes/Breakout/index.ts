import { Sprite } from "core/displays/Sprite";
import { prefab, define, regist } from "core/systems/GameObject";
import { defineScene } from "core/systems/Scene";
import { sketchTexture } from "core/utils/graphics";
import { xy } from "core/utils/math";

const Paddle = define(
  () =>
    new Sprite(
      sketchTexture(xy(48, 8), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 48, 8);
      })
    ),
  [],
  [],
  () => {
    const speed = 2;
    return {
      setup({ self }) {
        const { content } = self.getDisplay();
        content.x = 136;
        content.y = 224;
      },
      update({ game, self }) {
        const { content } = self.getDisplay();
        const axis = xy.add(
          game.input.getAxis("ARROW"),
          game.input.getAxis("WASD")
        );
        if (axis.x < 0) content.x -= speed;
        if (axis.x > 0) content.x += speed;
        if (axis.y < 0) content.y -= speed;
        if (axis.y > 0) content.y += speed;
      },
    };
  }
);

export const Breakout = defineScene(
  prefab(
    [
      //
      regist(Paddle),
    ],
    {
      update({ game }) {
        if (game.input.isKeyTriggered("r")) {
          game.changeScene("Roleplay");
        }
      },
    }
  )
);
