import Phaser from 'phaser';
export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, duration = 5000) {
      super(scene, x, y, texture);
      //this.duration = duration;
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.body.setSize(this.width * 0.6, this.height * 0.6);
      this.body.setOffset((this.width - this.width * 0.6) / 2, (this.height - this.height * 0.6) / 2);
      this.setScale(1);
      this.setVelocityY(150);
      this.setCollideWorldBounds(true);
  
      this.progressGraphics = scene.add.graphics();
      this.timerEvent = null;
      this.progressUpdateEvent = null;
    }
  
    collect(player) {
      this.scene.sound.play('powerUpCollect');
      const sc = player.scene;

      this.timerEvent = sc.time.addEvent({
        delay: this.duration,
        callback: () => this.removeEffect(),
        callbackScope: this
      });
  
      this.progressUpdateEvent = sc.time.addEvent({
        delay: 50,
        callback: () => this.updateProgressBar(),
        callbackScope: this,
        loop: true
      });
  
      this.disableBody(true, true);
    }
  
    updateProgressBar() {
      if (!this.timerEvent) return;
  
      const progress = this.timerEvent.getProgress();
      this.progressGraphics
        .clear()
        .fillStyle(0xff0000, 1)
        .fillRect(25, 680, 500 * progress, 8);
  
      if (progress >= 1) {
        this.removeEffect();
      }
    }
  
    removeEffect() {
      this.progressGraphics.clear();
      this.progressGraphics.destroy();
      this.progressGraphics = null;

      if (this.progressUpdateEvent) {
        this.progressUpdateEvent.remove(false);
        this.progressUpdateEvent = null;
      }
  
      if (this.timerEvent) {
        this.timerEvent.remove(false);
        this.timerEvent = null;
      }
    }
  }
  