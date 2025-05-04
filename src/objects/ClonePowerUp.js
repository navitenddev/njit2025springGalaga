import PowerUp from './PowerUp';
import Clone from './Clone';

class ClonePowerUp extends PowerUp {
    constructor(scene, x, y) {
        super(scene, x, y, 'clonePowerUp', 7000);
        this.progressGraphics = scene.add.graphics();
    }

    collect(player, bullets) {
        super.collect(player);
        this.updateProgressBar(player.scene);
        const clone = new Clone(player.scene, player.x - 100, player.y);
        player.scene.add.existing(clone);
        player.scene.physics.add.existing(clone);
        player.scene.clone = clone;

        this.timerEvent = player.scene.time.addEvent({
            delay: this.duration,
           callback: () => {
                this.removeClone(player);
            },
            callbackScope: this
        });

        this.progressUpdateEvent = player.scene.time.addEvent({
            delay: 50,
            callback: () => this.updateProgressBar(player.scene),
            callbackScope: this,
            loop: true
        });
        this.destroy();
    }

    removeClone(player) {
        if (player.scene.clone) {
            player.scene.clone.destroy();
            player.scene.clone = null;
        }

        if (this.progressUpdateEvent) {
            this.progressUpdateEvent.remove();
        }
        this.progressGraphics.clear();
    }

    updateProgressBar(scene) {
        if (!this.timerEvent) return;
        const progress = this.timerEvent.getProgress();
        this.progressGraphics.clear();
        this.progressGraphics.fillStyle(0xff0000, 1);
        this.progressGraphics.fillRect(25, 645, 500 * progress, 8);
        if (progress >= 0.99) {
            this.removeClone(scene.player);
        }
    }

}
export default ClonePowerUp;