import Phaser from 'phaser';
import Clone from './Clone';

class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'clone');
        this.setScale(0.3);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.duration = 7000;
        this.timerEvent = null;
        this.progressGraphics = scene.add.graphics();
    }

    collect(player, bullets) {
        this.destroy();
        const clone = new Clone(player.scene, player.x - 100, player.y);
        player.scene.add.existing(clone);
        player.scene.physics.add.existing(clone);
        player.scene.clone = clone;

        this.timerEvent = player.scene.time.addEvent({
            delay: this.duration,
            callback: () => this.removeClone(player),
            callbackScope: this
        });
        this.updateProgressBar(player.scene);
    }
    updateProgressBar(scene) {
        if (!this.timerEvent) return;
        const progress = this.timerEvent.getProgress();
        this.progressGraphics.fillStyle(0xff0000, 1);
        this.progressGraphics.fillRect(25, 680, 500 * progress, 8);
        scene.time.delayedCall(100, () => this.updateProgressBar(scene));
    }

    removeClone(player) {
        if (player.scene.clone) {
            player.scene.clone.destroy();
            player.scene.clone = null;
        }
        if (this.progressGraphics) {
            this.progressGraphics.clear();
            this.progressGraphics.destroy();
            this.progressGraphics = null;
        }
        this.timerEvent = null;
    }
}
export default PowerUp;