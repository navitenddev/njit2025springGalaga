import PowerUp from './PowerUp';

export default class healthPowerUp extends PowerUp {
  constructor(scene, x, y) {
    super(scene, x, y, 'healthPowerup', 5000);
    this.setScale(0.5);
    this.setCollideWorldBounds(true);
  }

  collect(player) {
    const scene = player.scene;
    scene.health = 0;
    scene.player.setFrame(0);
    this.destroy();
  }

}