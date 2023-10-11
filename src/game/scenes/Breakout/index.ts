import { prefab } from "core/systems/GameObject";
import { defineScene } from "core/systems/Scene";

export const Breakout = defineScene(
  prefab(
    [
      // GameObject.regist(Background),
      // GameObject.regist(FlyingRects, {
      //   update({ self }) {
      //     self.each((child) => {
      //       const { content } = child.getDisplay();
      //       content.x += -0.1 + Math.random() * 0.2;
      //       content.y += -0.1 + Math.random() * 0.2;
      //     });
      //   },
      // }),
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
