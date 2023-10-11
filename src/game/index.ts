import { GameManager } from "core/managers/GameManager";
import { Roleplay } from "./scenes/Roleplay";
import { Breakout } from "./scenes/Breakout";

const game = new GameManager();
game.setupScene({ Roleplay, Breakout }, "Roleplay");
