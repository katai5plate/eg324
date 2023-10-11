import { ColliderBox } from "core/components/colliders";
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
  () => [new ColliderBox(xy(48, 8))],
  [],
  () => {
    const speed = 3;
    return {
      setup({ self }) {
        const { content } = self.getDisplay();
        const collider = self.getComponent(ColliderBox);
        content.x = 136;
        content.y = 224;
        collider.setPosition(content);
      },
      update({ game, self }) {
        const { content } = self.getDisplay();
        const collider = self.getComponent(ColliderBox);
        collider.setPosition(content);

        const axis = xy.add(
          game.input.getAxis("ARROW"),
          game.input.getAxis("WASD")
        );
        if (axis.x < 0) {
          if (collider.rect.left > game.rect.left) {
            content.x -= speed;
          } else {
            content.x = game.rect.left;
          }
        }
        if (axis.x > 0) {
          if (collider.rect.right < game.rect.right) {
            content.x += speed;
          } else {
            content.x = game.rect.right - collider.rect.width;
          }
        }
      },
    };
  }
);

const delta = xy(1, 1);

const Ball = define(
  () =>
    new Sprite(
      sketchTexture(xy(8, 8), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 8, 8);
      })
    ),
  () => [new ColliderBox(xy(8, 8))],
  [],
  () => {
    const speed = 2;
    return {
      update({ game, self }) {
        const { content } = self.getDisplay();
        const collider = self.getComponent(ColliderBox);
        const paddle = game.findGameObject(Paddle).getComponent(ColliderBox);
        collider.setPosition(content);

        if (collider.rect.left < game.rect.left) delta.x *= -1;
        if (collider.rect.right > game.rect.right) delta.x *= -1;
        if (collider.rect.top < game.rect.top) delta.y *= -1;
        if (collider.rect.bottom > game.rect.bottom) delta.y *= -1;

        if (collider.hitTest(paddle)?.overlapV.y) delta.y *= -1;

        content.x += delta.x * speed;
        content.y += delta.y * speed;
      },
    };
  }
);

const Brick = define(
  () =>
    new Sprite(
      sketchTexture(xy(48, 16), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 48, 16);
      })
    ),
  () => [new ColliderBox(xy(48, 16))],
  [],
  {
    update({ game, self }) {
      const { content } = self.getDisplay();
      const collider = self.getComponent(ColliderBox);
      const ball = game.findGameObject(Ball).getComponent(ColliderBox);
      collider.setPosition(content);
      content.angle = Math.random();
      const hit = collider.hitTest(ball);
      if (hit) {
        self.destroy();
        delta.y *= -1;
      }
    },
  }
);

export const Breakout = defineScene(
  prefab(
    [
      regist(Paddle),
      regist(Ball, {
        setup({ self }) {
          const { content } = self.getDisplay();
          content.position.set(80, 144);
        },
      }),
      ...[
        xy(16, 48),
        xy(72, 16),
        xy(136, 16),
        xy(200, 16),
        xy(72, 80),
        xy(136, 80),
        xy(200, 80),
        xy(256, 48),
      ].map(({ x, y }) =>
        regist(Brick, {
          setup({ self }) {
            const { content } = self.getDisplay();
            content.position.set(x, y);
          },
        })
      ),
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
