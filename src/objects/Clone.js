import Phaser from 'phaser';

class Clone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'box');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);
        this.setCollideWorldBounds(true);
    }

    followPlayer(player){
        this.x = player.x - 100;
        this.y = player.y;
    }

    shoot(bullets) {
        bullets.fireBullet(this.x, this.y - 50);
    }
}
export default Clone;