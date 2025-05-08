import PowerUp from './PowerUp';

export default class ShieldPowerUp extends PowerUp {
  constructor(scene, x, y) {
    super(scene, x, y, 'shieldPowerUp', 5000);
    this.setScale(0.5);
    this.setCollideWorldBounds(true);
  }

  collect(player) {
    super.collect(player);
    player.isShield = true;
    player.setTint(0x87cefa);
    player.scene.activeShield = this;

    this.timerEvent = this.scene.time.addEvent({
      delay: this.duration,
      callback: () => this.deactivateShield(player),
      callbackScope: this
    });

    this.progressUpdateEvent = this.scene.time.addEvent({
      delay: 50,
      callback: () => this.updateProgressBar(),
      callbackScope: this,
      loop: true
    });
  }

  deactivateShield(player) {
    player.isShield = false;
    player.clearTint();

    this.removeEffect();
    this.scene.activeShield = null;
    this.destroy();
  }

  removeEffect() {
    if (this.progressGraphics) {
      this.progressGraphics.clear();
      this.progressGraphics.destroy();
      this.progressGraphics = null;
    }

    if (this.progressUpdateEvent) {
      this.progressUpdateEvent.remove(false);
      this.progressUpdateEvent = null;
    }
    if (this.timerEvent) {
      this.timerEvent.remove(false);
      this.timerEvent = null;
    }
  }

  updateProgressBar() {
    if (!this.timerEvent || !this.progressGraphics) return;
    const progress = this.timerEvent.getProgress();

    this.progressGraphics.clear();
    this.progressGraphics.fillStyle(0xff0000, 1);
    this.progressGraphics.fillRect(25, 645, 500 * progress, 8);

    if (progress >= 1) {
      this.deactivateShield(this.scene.player);
    }
  }
}
