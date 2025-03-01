import './style.css'
import Phaser from 'phaser'

const sizes = {
  width: 500,
  height: 500
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.expansionFactor = 0; // Controls expansion & contraction of enemy group
    this.timeElapsed = 0; // Tracks time for smooth movement
  }

  preload() {
    this.load.image("enemy", "/assets/enemy.png");
  }

  create() {
    this.groupCenter = { x: 250, y: 200 }; // Fixed center point of the group

    /* TO-DO:
     * Allow for enemies on multiple y-levels
     */
    this.enemies = [
      { y: 0, movePattern: "a" },
      { y: 0, movePattern: "b" },
      { y: 0, movePattern: "c" },
      { y: 0, movePattern: "d" },
      { y: 0, movePattern: "e" },
    ];

    this.enemySprites = [];

    this.enemies.forEach((data) => {
      let enemy = this.physics.add.sprite(
        this.groupCenter.x,
        this.groupCenter.y + data.y,
        "enemy"
      );
      
      enemy.movePattern = data.movePattern;
      enemy.followingGroup = true; // Initially part of the group
      this.enemySprites.push(enemy);
    });

    // Move group dynamically
    this.time.addEvent({
      delay: 50,
      callback: this.updateGroupMovement,
      callbackScope: this,
      loop: true
    });
  }

  updateGroupMovement() {
    /* TO-DO:
     * Define baseSpacing using enemy width
     */
    this.timeElapsed += 0.05;
    let baseSpacing = 55; // Minimum gap between enemies
    let expansionAmount = 10 * Math.sin(this.timeElapsed * 2);

    const numEnemies = this.enemySprites.length;
    const totalWidth = (numEnemies - 1) * baseSpacing + expansionAmount; // Total spread of enemies, including expansion
    const startX = this.groupCenter.x - totalWidth / 2; // Ensure the group is centered

    this.enemySprites.forEach((enemy, index) => {
      if (enemy.followingGroup) {
        enemy.x = startX + index * baseSpacing + expansionAmount * (index / (numEnemies - 1)); // Evenly distribute expansion
      }
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
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
