import PowerUp from './PowerUp';
import Clone from './Clone';

class ClonePowerUp extends PowerUp {
    constructor(scene, x, y) {
        super(scene, x, y, 'clonePowerUp', 7000);
        this.progressGraphics = scene.add.graphics();
    }

    collect(player, bullets) {
        if (player.scene.clone) {
            this.destroy();
            return;
          }
        super.collect(player);
        this.updateProgressBar(player.scene);
        const clone = new Clone(player.scene, player.x - 100, player.y);
        player.scene.add.existing(clone);
        player.scene.physics.add.existing(clone);
        player.scene.clone = clone;

        player.scene.physics.add.overlap(clone, player.scene.enemies, () => this.removeClone(player), null, this);
        player.scene.physics.add.overlap(clone, player.scene.enemyBullets, () => this.removeClone(player), null, this);

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
            this.progressUpdateEvent.remove(false);
            this.progressUpdateEvent = null;
        }
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }   

        if (this.progressGraphics) {
            this.progressGraphics.clear();
            this.progressGraphics.destroy();
            this.progressGraphics = null;
        }   
    }

    updateProgressBar(scene) {
        if (!this.timerEvent || !this.progressGraphics) return;
        const progress = this.timerEvent.getProgress();
        this.progressGraphics.clear().fillStyle(0xff0000, 1).fillRect(25, 645, 500 * progress, 8);
        if (progress >= 0.99) {
            this.removeClone(scene.player);
        }
    }

}
export default ClonePowerUp;