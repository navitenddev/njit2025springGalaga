import Phaser from 'phaser';
import Bullets from '../objects/Bullets';
import Enemies from '../objects/Enemies';
import PauseScene from './PauseScene';
import Clone from '../objects/Clone';
import ClonePowerUp from '../objects/ClonePowerUp';
import ShieldPowerUp from '../objects/ShieldPowerUp';
import enemyBullets from "../objects/enemyBullet";
import TripleShotPowerUp from '../objects/TripleShotPowerUp';
import PowerUp from '../objects/PowerUp';
import BulletContainer from '../objects/Bullets';
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
        this.load.audio("shootsound", "./assets/shoot.mp3");
        this.load.image('clonePowerUp', './assets/player.png');
        this.load.image('shieldPowerUp', './assets/player.png');
        this.load.image('box', './assets/box.png');
    }

    create() {
        this.health = 0;
        this.bullets = new Bullets(this);
        this.clonebullets = new Bullets(this);
        this.enemyBullets = new enemyBullets(this);
        this.enemies = new Enemies(this);
        this.player = this.physics.add.sprite(sizes.width / 2, sizes.height - 50, 'player', 0);
        this.player.setScale(1.5);
        this.difficulty = 1;
        this.score = 0;
        this.scoretext = "score: " + this.score;
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.bullets = new BulletContainer(this, 2);
        this.keys = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.scoreboard = this.add.text(50, 680, this.scoretext, {
            fontSize: "16px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);
        
        this.cloneGroup = this.physics.add.group({
            classType: ClonePowerUp,
            runChildUpdate: true,
            maxSize: 10,
          });
        this.shieldGroup = this.physics.add.group({
            classType: ShieldPowerUp,
            runChildUpdate: true,
            maxSize: 10,
          });
        this.tripleGroup = this.physics.add.group({
            classType: TripleShotPowerUp,
            runChildUpdate: true,
            maxSize: 10,
          });
        this.activePowerUps = this.physics.add.group();
        this.physics.add.overlap(this.player, this.cloneGroup, (player, pu) => pu.collect(player), null, this);
        this.physics.add.overlap(this.player, this.shieldGroup, (player, pu) => pu.collect(player), null, this);
        this.physics.add.overlap(this.player, this.tripleGroup, (player, pu) => pu.collect(player), null, this);
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.player.tripleShot) {
                this.bullets.fireBullet(this.player.x - 20, this.player.y - 20);
                this.bullets.fireBullet(this.player.x, this.player.y - 20);
                this.bullets.fireBullet(this.player.x + 20, this.player.y - 20);
            }
            else {  
                this.bullets.fireBullet(this.player.x, this.player.y - 20);
            }
            this.sound.play('shootsound');
            if (this.clone) {
                this.clone.shoot(this.clonebullets);
            }
        });
        this.input.keyboard.on('keydown-W', () => {
            console.log(this.player.x, this.player.y);
            this.sound.play('shootsound');
            this.bullets.fireBullet(this.player.x, this.player.y - 20);
            if (this.clone) {
                this.clone.shoot(this.clonebullets);
            }
        });
        this.input.keyboard.on('keydown-UP', () => {
            this.sound.play('shootsound');
            this.bullets.fireBullet(this.player.x, this.player.y - 20);
            if (this.clone) {
                this.clone.shoot(this.clonebullets);
            }
        });
        this.input.keyboard.on('keydown-P', () => {
            this.scene.switch('PauseScene');
            //this.scene.pause('GameScene');
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHit, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.activePowerUps, (player, pu) => pu.collect(player), null, this);
        this.physics.add.overlap(this.clonebullets, this.enemies, this.bulletHit, null, this);
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
        if (Phaser.Math.Between(1, 100) <= 5) {
            const randomPU = Math.random();
            if (randomPU < 0.33) {
                //Clone
                const pu = this.cloneGroup.create(enemy.x, enemy.y, 'clonePowerUp');
                pu.setVelocityY(150).setScale(1);
            }
            else if (randomPU < 0.66) {
                //Triple Shot
                const pu = this.tripleGroup.create(enemy.x, enemy.y, 'box');
                pu.setVelocityY(150).setScale(0.5);
            }
            else {
                //Shield
                const pu = this.shieldGroup.create(enemy.x, enemy.y, 'box2');
                pu.setVelocityY(150).setScale(0.3);
            }
        }
            const alive = this.enemies.getChildren().some(e => e.active);
            if (!alive) {
                this.nextLevel();
            }
    }
    
    nextLevel() {
        console.log("restart");
        this.difficulty += 1;
        this.leveltext = "level " + this.difficulty;
        this.level = this.add.text(275, 350, this.leveltext, {
            fontSize: "40px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);
        this.time.delayedCall(3000, () => {     
            this.level.destroy();
            this.enemies.reset();
        });
        //this.scene.restart();}
    }
    playerHit(player, enemy) {
        enemy.destroy();
        if (player.isShield) {
            if (this.activeShield)
                this.activeShield.deactivateShield(player);
            else {
                player.clearTint();
                player.isShield = false;
            }
            return;
        }
        this.health++;
        player.setFrame(this.health);
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