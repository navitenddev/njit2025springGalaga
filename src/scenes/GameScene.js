import Phaser from 'phaser';
import Bullets from '../objects/Bullets';
import Enemies from '../objects/Enemies';
import PauseScene from './PauseScene';
import Clone from '../objects/Clone';
import enemyBullets from "../objects/enemyBullet"
import PowerUp from '../objects/PowerUp';
import { sizes } from '../config';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.clone = null;
    }

    preload() {
        this.load.image('player', './assets/player.png');
        this.load.image('bullet', './assets/bullet.png');
        this.load.image("enemy1", "./assets/enemy1.png");
        this.load.image("enemy2", "./assets/enemy2.png");
        this.load.image("boss", "./assets/bossshermie.png");
        this.load.image("clone", "./assets/clone.png");
    }

    create() {
        this.bullets = new Bullets(this);
        this.enemyBullets = new enemyBullets(this);
        this.enemies = new Enemies(this);
        this.player = this.physics.add.image(sizes.width / 2, sizes.height - 50, 'player');
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        let powerUp = new PowerUp(this, sizes.width / 2 + 100, sizes.height - 50);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.bullets.fireBullet(this.player.x, this.player.y - 20);
            if (this.clone) {
                this.clone.shoot(this.bullets);
            }
        });
        this.input.keyboard.on('keydown-W', () => {
            console.log(this.player.x, this.player.y);
            this.bullets.fireBullet(this.player.x, this.player.y - 20);
            if (this.clone) {
                this.clone.shoot(this.bullets);
            }
        });
        this.input.keyboard.on('keydown-UP', () => {
            this.bullets.fireBullet(this.player.x, this.player.y - 20);
            if (this.clone) {
                this.clone.shoot(this.bullets);
            }
        });
        this.input.keyboard.on('keydown-P', () => {
            this.scene.switch('PauseScene');
            //this.scene.pause('GameScene');
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHit, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHit, null, this);
        this.physics.add.overlap(this.player, powerUp, () => {
            powerUp.collect(this.player, this.bullets);
            
        });
    }
    update() {
        this.player.setVelocity(0);
        if (this.cursors.left.isDown || this.keys.left.isDown) {
            this.player.setVelocityX(-300);
        }
        else if (this.cursors.right.isDown || this.keys.right.isDown) {
            this.player.setVelocityX(300);
        }
        if (this.clone) {
            this.clone.followPlayer(this.player);
        }
        if (Phaser.Math.Between(1, 100) === 1) {
            const activeEnemies = this.enemies.getChildren().filter(e => e.active);
            if (activeEnemies.length > 0) {
                const shooter = Phaser.Utils.Array.GetRandom(activeEnemies);
                shooter.shoot(this.enemyBullets);
            }
        }
    }
    bulletHit(bullet, enemy) {
        bullet.hits();
        enemy.hits();
    }
    playerHit(player, enemy) {
        enemy.destroy();
        player.setVisible(false);
        
    }
}