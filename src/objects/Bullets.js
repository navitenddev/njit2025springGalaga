import Phaser from 'phaser';

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.setScale(3)
    }

    fire(x, y) {
        this.enableBody(true, x, y, true, true);
        this.setVelocityY(-650);
    }

    hits() {
        this.disableBody(true, true);
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= -15) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
    
}

export default class BulletContainer extends Phaser.Physics.Arcade.Group {
    constructor(scene, initialSize = 2) {
        super(scene.physics.world, scene);
        this.setPoolSize(initialSize);   
    }

    setPoolSize(size) {
        this.clear(true, true);
        this.createMultiple({
          frameQuantity: size,
          key: 'bullet',
          active: false,
          visible: false,
          classType: Bullet
        });
      }

    fireBullet(x, y) {
        let bullet = this.getFirstDead();
        if (bullet) {
            bullet.fire(x, y);
        }
    }

}