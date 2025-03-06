class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
    }

    fire (x, y)
    {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-300);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 5,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet (x, y)
    {
        let bullet = this.getFirstDead();
        if (bullet)
        {
            bullet.fire(x, y);
        }
    }
}

class Example extends Phaser.Scene
{
    preload ()
    {
        this.load.image('sky', './assets/sky.png');
        this.load.image('box', './assets/box.png');
        this.load.image('bullet', './assets/bullet.png');
    }

    create ()
    {
        this.add.image(400, 300, 'sky');
        this.bullets = new Bullets(this);
        
        this.player = this.physics.add.image( 100, 500, 'box');
        this.player.setCollideWorldBounds(true);
        

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ 
            'left': Phaser.Input.Keyboard.KeyCodes.A, 
            'right': Phaser.Input.Keyboard.KeyCodes.D, 
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.bullets.fireBullet(this.player.x,450);
        });
        this.input.keyboard.on('keydown-W', () => {
            console.log(this.player.x, this.player.y);
            this.bullets.fireBullet(this.player.x, 450);
        });
        this.input.keyboard.on('keydown-UP', () => {
            this.bullets.fireBullet(this.player.x, 450);
        });

    }
    update ()
    {
    this.player.setVelocity(0);
    if (this.cursors.left.isDown || this.keys.left.isDown)
    {
        this.player.setVelocityX(-500);
    }
    else if (this.cursors.right.isDown || this.keys.right.isDown)
    {
        this.player.setVelocityX(500);
    }

    
}
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);
