import Phaser from 'phaser';
import Bullets from '../objects/Bullets';
import Enemies from '../objects/Enemies';
import PauseScene from './PauseScene';
import Clone from '../objects/Clone';
import enemyBullets from "../objects/enemyBullet" // Import the enemyBullet class
import PowerUp from '../objects/PowerUp'; // Assuming PowerUp is needed
import { sizes } from '../config'; // Assuming sizes config is needed
 // Import PowerUp classes after spawnPowerup is defined if they use it
 import ClonePowerUp from '../objects/ClonePowerUp';
 import ShieldPowerUp from '../objects/ShieldPowerUp';


// Import the actual enemyBullet class for instanceof check
import { default as enemyBulletClass } from "../objects/enemyBullet";


export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.clone = null;
        this.health = 0; // Initialize health here
    }

    preload() {
        this.load.spritesheet('player', './assets/spritesheet.png', { frameWidth: 23, frameHeight: 28 });
        this.load.image('bullet', './assets/bullet.png');
        this.load.image("enemy1", "./assets/enemy1.png");
        this.load.image("enemy2", "./assets/enemy2.png");
        this.load.image("boss", "./assets/bossshermie.png");
        this.load.image("clone", "./assets/clone.png");
        this.load.image("enemyBullet", "./assets/enemyBullet.png");
        // Make sure to load other assets used by powerups if necessary
        this.load.image('clonePowerUp', './assets/clonePowerUp.png'); // Example powerup asset
        this.load.image('box', './assets/box.png'); // Example powerup asset for ShieldPowerUp
    }

    create() {
        this.bullets = new Bullets(this);
        // Use the imported enemyBullets class to create the group
        this.enemyBullets = new enemyBullets(this);
        // Pass the enemyBullets group and the player to the Enemies constructor
        this.enemies = new Enemies(this, this.enemyBullets, this.player);


        this.player = this.physics.add.sprite(sizes.width / 2, sizes.height - 50, 'player', 0);
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Add powerup creation here if needed for testing or initial placement
        // For example:
        // let powerUp = new PowerUp(this, sizes.width / 2 + 100, sizes.height - 150);
        // let shieldPowerUp = new ShieldPowerUp(this, sizes.width / 2 - 100, sizes.height - 150);


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

        // Set up collisions and overlaps
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
        // Use the modified playerHit function for enemy bullet collision
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHit, null, this);

        // Add overlap for player and powerups if necessary
        // if (powerUp) {
        //     this.physics.add.overlap(this.player, powerUp, () => {
        //         powerUp.collect(this.player, this.bullets);
        //     });
        // }
        // if (shieldPowerUp) {
        //      this.physics.add.overlap(this.player, shieldPowerUp, () => {
        //         shieldPowerUp.collect(this.player);
        //      });
        // }

        // Powerup spawn function (can be called by enemies)
        this.spawnPowerup = (x, y) => {
            const powerUpTypes = [ClonePowerUp, ShieldPowerUp]; // Make sure these classes are imported
            const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpTypes);
            const powerUp = new randomPowerUp(this, x, y);

            this.physics.add.overlap(this.player, powerUp, () => {
                 // Check the type of powerup to call the correct collect method
                if (powerUp instanceof ClonePowerUp) {
                     powerUp.collect(this.player, this.bullets);
                 } else if (powerUp instanceof ShieldPowerUp) {
                     powerUp.collect(this.player);
                 }
             });
        };

        
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

        // Enemy firing logic - This is in GameScene update, but could potentially be handled within EnemyGroup
        if (Phaser.Math.Between(1, 100) === 1) {
            const activeEnemies = this.enemies.getChildren().filter(e => e.active);
            if (activeEnemies.length > 0) {
                const shooter = Phaser.Utils.Array.GetRandom(activeEnemies);
                 // Ensure shooter has a shoot method and is in a position to shoot
                if(shooter.y > 50 && typeof shooter.shoot === 'function'){
                    shooter.shoot(); // The shoot method in Enemy class already uses this.enemyGroup.bullets
                }
            }
        }
    }

    // This function handles player bullets hitting enemies
    bulletHitEnemy(bullet, enemy) {
        bullet.hits(); // This should disable the player's bullet
        enemy.hits();  // This should handle enemy health/death and potentially spawn powerups
    }

    // This function handles the player being hit by either an enemy body or an enemy bullet
    playerHit(player, object) {
        // Check if the object that hit the player is an enemy bullet
        if (object instanceof enemyBulletClass) {
            object.disableBody(true, true); // Disable the enemy bullet
        } else {
            // If it's not an enemy bullet, assume it's an enemy body and destroy it
            object.destroy();
        }

        // Decrease player health and update frame
        this.health++;
        if (this.health >= 3) { // Use >= in case health goes above 3
            this.scene.sleep();
            this.scene.switch('GameOver');
        } else {
             player.setFrame(this.health); // Update player sprite frame based on health
        }
    }
}