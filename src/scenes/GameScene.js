
import Phaser from 'phaser';
import Bullets from '../objects/Bullets';
import Enemies from '../objects/Enemies';
import PauseScene from './PauseScene';
import Clone from '../objects/Clone';
import enemyBullets from '../objects/enemyBullet';
import PowerUp from '../objects/PowerUp';
import { sizes } from '../config';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.clone = null;
  }

  preload() {
    this.load.spritesheet('player', './assets/spritesheet.png', {
      frameWidth: 23,
      frameHeight: 28,
    });
    this.load.image('bullet', './assets/bullet.png');
    this.load.image('enemy1', './assets/enemy1.png');
    this.load.image('enemy2', './assets/enemy2.png');
    this.load.image('boss',   './assets/bossshermie.png');
    this.load.image('clone',  './assets/clone.png');
    this.load.image('enemyBullet','./assets/enemyBullet.png');
    this.load.image('powerup', './assets/powerup.png');
  }

  create() {
    this.health     = 0;
    this.score      = 0;
    this.difficulty = 1;

    this.bullets      = new Bullets(this);
    this.clonebullets = new Bullets(this);
    this.enemyBullets = new enemyBullets(this);

    this.enemies = new Enemies(this);
    const _origMove = Enemies.prototype.updateGroupMovement;
    Enemies.prototype.updateGroupMovement = function(...args) {
      
      if (this.countActive(true) === 0) {
        const scene = this.scene;
        scene.difficulty += 1;
        const w = scene.scale.width, h = scene.scale.height;
        const txt = scene.add.text(
          w/2, h/2,
          `Level ${scene.difficulty}`,
          { fontSize: '40px', fill: '#fff', fontFamily: 'Andale Mono' }
        ).setOrigin(0.5);
        scene.time.delayedCall(3000, () => {
          txt.destroy();
          this.reset();  
        });
        return;
      }
      
      return _origMove.apply(this, args);
    };

    
    this.player = this.physics.add.sprite(
      sizes.width/2, sizes.height - 50, 'player', 0
    ).setScale(1.5).setCollideWorldBounds(true);

    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys    = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D
    });
    ['SPACE','W','UP'].forEach(k =>
      this.input.keyboard.on(`keydown-${k}`, () => {
        this.bullets.fireBullet(this.player.x, this.player.y - 20);
        if (this.clone) this.clone.shoot(this.clonebullets);
      })
    );
    this.input.keyboard.on('keydown-P', () =>
      this.scene.switch('PauseScene')
    );

    
    this.scoreboard = this.add.text(
      50, 680, `score: ${this.score}`,
      { fontSize: '16px', fill: '#fff', fontFamily: 'Andale Mono' }
    ).setOrigin(0.5, 0.5);

    
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHit, null, this);
    this.physics.add.overlap(this.player,  this.enemies, this.playerHit,  null, this);
    this.physics.add.overlap(this.player,  this.enemyBullets, this.playerHit, null, this);
  }

  update() {
    
    this.player.setVelocity(0);
    if      (this.cursors.left.isDown  || this.keys.left.isDown)  this.player.setVelocityX(-300);
    else if (this.cursors.right.isDown || this.keys.right.isDown) this.player.setVelocityX( 300);
    if (this.clone) this.clone.followPlayer(this.player);


    const fireInterval = Phaser.Math.Clamp(150 - this.difficulty * 15, 20, 150);
    if (Phaser.Math.Between(1, fireInterval) === 1) {
      const active = this.enemies.getChildren().filter(e => e.active);
      if (active.length) {
        const shooter = Phaser.Utils.Array.GetRandom(active);
        if (shooter.y > 10 && shooter.y < 300) {
          shooter.shoot(this.enemyBullets);
        }
      }
    }

    
    this.enemies.updateGroupMovement();
  }

  bulletHit(bullet, enemy) {
    if (enemy.y < 2) return;

    const aliveBefore = this.enemies.countActive(true);
    enemy.hits();
    bullet.hits();

    this.score++;
    this.scoreboard.setText(`score: ${this.score}`);
    const aliveAfter = this.enemies.countActive(true);
    if (aliveAfter < aliveBefore) {
      if (Phaser.Math.Between(1, 100) <= 10) {
        const pu = new PowerUp(this, enemy.x, enemy.y);
        this.add.existing(pu);
        this.physics.add.existing(pu);
        pu.body.setVelocityY(100);
        this.physics.add.overlap(
          this.player, pu,
          (player, powerUpSprite) => powerUpSprite.collect(player, this.bullets),
          null, this
        );
      }
    }
  }

  playerHit(player, enemy) {
    enemy.destroy();
    this.health++;
    player.setFrame(this.health);
    if (this.health === 3) {
      this.scene.pause();
      this.scene.start('GameOver');
    }
  }
}