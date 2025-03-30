import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import PauseScene from './scenes/PauseScene';
import TitleScene from './scenes/TitleScene';
import { sizes } from './config';
import './style.css';

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [TitleScene, GameScene, PauseScene]
};

const game = new Phaser.Game(config);