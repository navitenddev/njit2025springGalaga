import PowerUp from './PowerUp';

class ShieldPowerUp extends PowerUp {
    constructor(scene, x, y) {
        super(scene, x, y, 'box', 5000);
        this.setScale(0.3);
        this.setCollideWorldBounds(true);
    }

    collect(player) {
        super.collect(player);
        this.activeShield(player);
        this.updateProgressBar(player.scene);
        this.destroy();
    }

    activeShield(player){
        player.isShield = true;
        player.setTint(0x00ff00);

        this.timerEvent = player.scene.time.addEvent({
            delay: this.duration,
            callback: () => this.deactivateShield(player),
            callbackScope: this
        });

        this.progressUpdateEvent = player.scene.time.addEvent({
            delay: 50,
            callback: () => this.updateProgressBar(player.scene),
            callbackScope: this,
            loop: true
        });
    }

    deactiveShield(player){
        player.isShield = false;
        player.clearTint();

        if (this.progressUpdateEvent) {
            this.progressUpdateEvent.remove();
        }

        if (this.timerEvent) {
            this.timerEvent.remove();
        }
    }

    updateProgressBar(scene) {
        if (!this.timerEvent) return;
        const progress = this.timerEvent.getProgress();
        this.progressGraphics.clear();
        this.progressGraphics.fillStyle(0xff0000, 1);
        this.progressGraphics.fillRect(25, 645, 500 * progress, 8);
        if (progress >= 0.99) {
            this.deactiveShield(scene.player);
        }
    }
}

export default ShieldPowerUp;
