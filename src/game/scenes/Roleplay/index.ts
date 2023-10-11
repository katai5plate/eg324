import { prefab, regist } from "core/systems/GameObject";
import { defineScene } from "core/systems/Scene";
import { Road } from "./objects/Road";
import { FlyingRects } from "./prefabs/FlyingRects";

export const Roleplay = defineScene(
  prefab(
    [
      regist(Road),
      regist(FlyingRects, {
        update({ self }) {
          self.each((child) => {
            const { content } = child.getDisplay();
            content.x += -0.1 + Math.random() * 0.2;
            content.y += -0.1 + Math.random() * 0.2;
          });
        },
      }),
    ],
    {
      update({ game }) {
        if (game.input.isKeyTriggered("b")) {
          game.changeScene("Breakout");
        }
      },
    }
  )
);
