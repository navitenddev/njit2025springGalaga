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
    this.load.image("enemy", "/assets/enemy.png");
  }

  create() {
    this.groupCenter = { x: 250, y: 100 }; // Fixed center point of the group

    this.enemies = [
      { y: 0, enemiesAtLevel: [{ movePattern: "a" }, { movePattern: "b" }, { movePattern: "c" }] },
      { y: 1, enemiesAtLevel: [{ movePattern: "d" }, { movePattern: "e" }] },
      { y: 2, enemiesAtLevel: [{ movePattern: "f" }, { movePattern: "g" }, { movePattern: "h" }] }
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
          "enemy"
        ).setScale(0.5);

        enemy.movePattern = data.movePattern;
        enemy.followingGroup = true;
        enemy.yLevel = y;
        this.enemySprites.push(enemy);
      });
    });

    // Move the group dynamically
    this.time.addEvent({
      delay: 50,
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
