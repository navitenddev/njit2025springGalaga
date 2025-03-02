import './style.css'
import Phaser from 'phaser'

const sizes = {
  width: 500,
  height: 500
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.expansionFactor = 0;
    this.timeElapsed = 0;
    this.enemyGap = 28;
    this.levelWidths = [];
    this.enemySprites = [];
  }

  preload() {
    this.load.image("enemy1", "/assets/enemy1.png");
    this.load.image("enemy2", "/assets/enemy2.png");
    this.load.image("enemy3", "/assets/enemy3.png");
  }

  create() {
    this.groupCenter = { x: 250, y: 150 }; // Fixed center point of the group

    this.enemies = [
      { y: 0, enemiesAtLevel: [
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }
      ] },
      { y: 1, enemiesAtLevel: [
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }, 
        { movePattern: "a", type: "enemy1" }
      ] },
      { y: 2, enemiesAtLevel: [
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }
      ] },
      { y: 3, enemiesAtLevel: [
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }, 
        { movePattern: "b", type: "enemy2" }
      ] },
      { y: 4, enemiesAtLevel: [
        { movePattern: "c", type: "enemy3" }, 
        { movePattern: "c", type: "enemy3" }, 
        { movePattern: "c", type: "enemy3" }, 
        { movePattern: "c", type: "enemy3" }
      ] }
    ];

    // Create the enemy sprites
    this.enemySprites = [];
    this.enemies.forEach((levelData) => {
      const { y, enemiesAtLevel } = levelData;
      const levelY = this.groupCenter.y - y * this.enemyGap; // Vertical position for this level
      const totalWidth = (enemiesAtLevel.length - 1) * this.enemyGap;
      const startX = this.groupCenter.x - totalWidth / 2;

      enemiesAtLevel.forEach((data, index) => {
        let enemy = this.physics.add.sprite(
          startX + index * this.enemyGap,
          levelY,
          data.type
        ).setScale(0.5);

        enemy.movePattern = data.movePattern;
        enemy.followingGroup = true;
        enemy.yLevel = y;
        this.enemySprites.push(enemy);
      });
    });

    // Move the group dynamically
    this.time.addEvent({
      delay: 500,
      callback: this.updateGroupMovement,
      callbackScope: this,
      loop: true
    });
  }

  updateGroupMovement() {
    this.timeElapsed += 0.05;
    let horizontalMovement = 50 * Math.sin(this.timeElapsed);

    this.enemies.forEach((levelData) => {
      const { enemiesAtLevel } = levelData;
      const totalWidth = (enemiesAtLevel.length - 1) * this.enemyGap;
      const startX = this.groupCenter.x - totalWidth / 2;

      enemiesAtLevel.forEach((_, index) => {
        const enemy = this.enemySprites.shift();
        enemy.x = startX + index * this.enemyGap + horizontalMovement;
        this.enemySprites.push(enemy);
      });
    });
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      debug: true
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
