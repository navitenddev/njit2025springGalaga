import Phaser from 'phaser';

class enemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemyBullet');
    }
    fire(x, y) {
        this.enableBody(true, x, y, true, true);
        this.setVelocityY(300);
    }

    hits() {
        //this.disableBody();
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y >= 732) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export default class BulletContainer extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 10,
            key: 'enemyBullet',
            active: false,
            visible: false,
            classType: enemyBullet
        });
    }

    fireBullet(x, y) {
        this.scene.sound.play('attack');
        let bullet = this.getFirstDead();
        if (bullet) {

            bullet.fire(x, y);
        }
    }
}