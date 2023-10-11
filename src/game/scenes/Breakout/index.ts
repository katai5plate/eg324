import { ColliderBox } from "core/components/colliders";
import { Sprite } from "core/displays/Sprite";
import { prefab, define, regist } from "core/systems/GameObject";
import { defineScene } from "core/systems/Scene";
import { useState } from "core/utils/game";
import { sketchTexture } from "core/utils/graphics";
import { xy } from "core/utils/math";

const state = {
  paddle: useState({ speed: 3 }),
  ball: useState({ speed: 3, delta: xy(1, 1) }),
};

const Paddle = define({
  display: () =>
    new Sprite(
      sketchTexture(xy(48, 8), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 48, 8);
      })
    ),
  components: () => [new ColliderBox(xy(48, 8))],
  on: {
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
          content.x -= state.paddle.get("speed");
        } else {
          content.x = game.rect.left;
        }
      }
      if (axis.x > 0) {
        if (collider.rect.right < game.rect.right) {
          content.x += state.paddle.get("speed");
        } else {
          content.x = game.rect.right - collider.rect.width;
        }
      }
    },
  },
});

const Ball = define({
  display: () =>
    new Sprite(
      sketchTexture(xy(8, 8), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 8, 8);
      })
    ),
  components: () => [new ColliderBox(xy(8, 8))],
  on: {
    update({ game, self }) {
      const { content } = self.getDisplay();
      const collider = self.getComponent(ColliderBox);
      const paddle = game.findGameObject(Paddle).getComponent(ColliderBox);
      collider.setPosition(content);

      if (
        collider.rect.left < game.rect.left ||
        collider.rect.right > game.rect.right
      )
        state.ball.set(({ delta }) => ({
          delta: xy.flipX(delta),
        }));
      if (
        collider.rect.top < game.rect.top ||
        collider.rect.bottom > game.rect.bottom
      )
        state.ball.set(({ delta }) => ({
          delta: xy.flipY(delta),
        }));

      if (collider.hitTest(paddle)?.overlapV.y)
        state.ball.set(({ delta }) => ({
          delta: xy.flipY(delta),
        }));

      content.x += state.ball.get("delta").x * state.ball.get("speed");
      content.y += state.ball.get("delta").y * state.ball.get("speed");
    },
  },
});

const Brick = define({
  display: () =>
    new Sprite(
      sketchTexture(xy(48, 16), (ctx) => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 48, 16);
      })
    ),
  components: () => [new ColliderBox(xy(48, 16))],
  on: {
    update({ game, self }) {
      const { content } = self.getDisplay();
      const collider = self.getComponent(ColliderBox);
      const ball = game.findGameObject(Ball).getComponent(ColliderBox);
      collider.setPosition(content);
      content.angle = Math.random();
      if (collider.hitTest(ball)) {
        self.destroy();
        state.ball.set(({ delta }) => ({ delta: xy.flipY(delta) }));
      }
    },
  },
});

export const Breakout = defineScene(
  prefab(
    () => [
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
