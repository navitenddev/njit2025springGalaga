import PowerUp from './PowerUp';

export default class TripleShotPowerUp extends PowerUp {
  constructor(scene, x, y) {
    super(scene, x, y, 'tripleshotPowerUp', 5000);
    this.setScale(0.5);
    this.setCollideWorldBounds(true);
  }

  collect(player) {
    super.collect(player);

    player.tripleShot = true;
    player.setTint(0xffff00);
    player.scene.activeTriple = this;
    player.scene.bullets.setPoolSize(3);

    if (player.scene.bullets && typeof player.scene.bullets.setPoolSize === 'function') {
      player.scene.bullets.setPoolSize(3);
    }

    this.timerEvent = this.scene.time.delayedCall(
      this.duration,
      () => this.deactivate(player),
      [],
      this
    );

    this.progressUpdateEvent = this.scene.time.addEvent({
      delay: 50,
      callback: () => this.updateProgressBar(),
      callbackScope: this,
      loop: true,
    });
  }

  deactivate(player) {
    player.tripleShot = false;
    player.clearTint();
    player.scene.bullets.setPoolSize(2);

    super.removeEffect(); 
    this.destroy();
    player.scene.activeTriple = null;
  }

  updateProgressBar() {
    if (!this.timerEvent || !this.progressGraphics) return;
    const progress = this.timerEvent.getProgress();

    this.progressGraphics.clear();
    this.progressGraphics.fillStyle(0xff0000, 1);
    this.progressGraphics.fillRect(25, 645, 500 * progress, 8);

    if (progress >= 0.99) {
      this.deactivate(this.scene.player);
    }
  }
}
