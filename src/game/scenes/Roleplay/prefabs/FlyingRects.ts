import { prefab, regist } from "core/systems/GameObject";
import { WhiteRect } from "../objects/WhiteRect";

export const FlyingRects = prefab(() => [
  regist(WhiteRect),
  regist(WhiteRect, {
    update({ self }) {
      const { content } = self.getDisplay();
      content.x += 0.1;
    },
  }),
  regist(WhiteRect, {
    update({ self }) {
      const { content } = self.getDisplay();
      content.y += 0.1;
    },
  }),
  regist(WhiteRect, {
    update({ self }) {
      const { content } = self.getDisplay();
      content.x += 0.1;
      content.y += 0.1;
    },
  }),
]);
