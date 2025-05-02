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
        this.load.spritesheet('player', './assets/spritesheet.png',  { frameWidth: 23, frameHeight: 28 });
        this.load.image('bullet', './assets/bullet.png');
        this.load.image("enemy1", "./assets/enemy1.png");
        this.load.image("enemy2", "./assets/enemy2.png");
        this.load.image("boss", "./assets/bossshermie.png");
        this.load.image("clone", "./assets/clone.png");
        this.load.image("enemyBullet", "./assets/enemyBullet.png");
    }

    create() {
        this.health = 0;
        this.bullets = new Bullets(this);
        this.enemyBullets = new enemyBullets(this);
        this.enemies = new Enemies(this);
        this.player = this.physics.add.sprite(sizes.width / 2, sizes.height - 50, 'player', 0);
        this.player.setScale(1.5);
        this.difficulty = 1;
        this.score = 0;
        this.scoretext = "score: " + this.score;
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.scoreboard = this.add.text(50, 680, this.scoretext, {
            fontSize: "16px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);

        //let powerUp = new PowerUp(this, sizes.width / 2 + 100, sizes.height - 50);

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
            this.scene.launch('PauseScene');
            this.scene.pause();
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHit, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHit, null, this);
        //this.physics.add.overlap(this.player, powerUp, () => {
        //    powerUp.collect(this.player, this.bullets);  
        //});
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
        if (Phaser.Math.Between(1, Phaser.Math.MinSub(150, this.difficulty * 15, 20)) === 1) {
        //if (Phaser.Math.Between(1, 20) === 1) {
            const activeEnemies = this.enemies.getChildren().filter(e => e.active);
            if (activeEnemies.length > 0) {
                const shooter = Phaser.Utils.Array.GetRandom(activeEnemies);
                if(shooter.y < 300 && shooter.y > 10){
                    shooter.shoot(this.enemyBullets);
                }
                
            }
        }
    }
    bulletHit(bullet, enemy) {
        if(enemy.y < 2){
            return;
        }
        enemy.hits();
        bullet.hits();
        this.score += 1;
        this.scoretext = "score: " + this.score;
        this.scoreboard.setText(this.scoretext);
        if(this.enemies.getChildren().filter(e => e.active).length == 0){
            console.log("restart");
            this.enemies.reset();
            this.difficulty += 1;

            //this.scene.restart();
        }
    }
    playerHit(player, enemy) {
        enemy.destroy();
        //player.setVisible(false);
        this.health++;
        if(this.health == 3){
            //this.scene.sleep();
            this.scene.pause();
            this.scene.start('GameOver');
        }
        player.setFrame(this.health);
        if(this.enemies.getChildren().filter(e => e.active).length == 0){
            console.log("restart");
            this.scene.restart();
        }
        
        }
}