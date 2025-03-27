import Phaser from 'phaser';
import Bullets from '../objects/Bullets';
import Enemies from '../objects/Enemies';
import { sizes } from '../config';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image('box', './assets/box.png');
        this.load.image('bullet', './assets/bullet.png');
        this.load.image("enemy1", "./assets/bossgalaga.png");
        this.load.image("enemy2", "./assets/bossgalaga.png");
        this.load.image("enemy3", "./assets/bossgalaga.png");
    }

    create() {
        this.bullets = new Bullets(this);
        this.enemies = new Enemies(this);
        this.player = this.physics.add.image(sizes.width / 2, sizes.height - 50, 'box');
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.bullets.fireBullet(this.player.x, this.player.y - 50);
        });
        this.input.keyboard.on('keydown-W', () => {
            console.log(this.player.x, this.player.y);
            this.bullets.fireBullet(this.player.x, this.player.y - 50);
        });
        this.input.keyboard.on('keydown-UP', () => {
            this.bullets.fireBullet(this.player.x, this.player.y - 50);
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.bullethit, null, this);
    }
    update() {
        this.player.setVelocity(0);
        if (this.cursors.left.isDown || this.keys.left.isDown) {
            this.player.setVelocityX(-300);
        }
        else if (this.cursors.right.isDown || this.keys.right.isDown) {
            this.player.setVelocityX(300);
        }
    }
    bullethit(bullet, enemy) {
        bullet.hits();
        enemy.hits();
    }
}