import Phaser from 'phaser';

class Clone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.5);
        this.setCollideWorldBounds(true);
    }

    followPlayer(player){
        this.x = player.x - 50;
        this.y = player.y;
    }

    shoot(bullets) {
        bullets.fireBullet(this.x, this.y - 20);
    }
}
export default Clone;