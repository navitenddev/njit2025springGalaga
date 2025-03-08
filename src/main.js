import './style.css'
import Phaser from 'phaser'

const sizes = {
  width: 500,
  height: 500
};

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, movePattern, yLevel, index) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.5);
    this.setOrigin(0.5);
    this.body.setAllowGravity(false);
    this.body.moves = false;

    this.movePattern = movePattern;
    this.followingGroup = true;
    this.yLevel = yLevel;
    this.index = index;
    this.targetX = x;
    this.targetY = y;
    this.reachedFinalPosition = false;
  }

  moveTo(x, y) {
    this.scene.tweens.add({
      targets: this,
      x: x,
      y: y,
      ease: 'linear',
      duration: 500,
      onComplete: () => {
        this.reachedFinalPosition = true;
        this.followingGroup = true;
        this.targetX = x;
      }
    });
  }
}

// Enemies class represents a group of enemy objects
class Enemies extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;
    this.groupCenter = { x: 250, y: 150 }; // Fixed center point of the group
    this.enemyGap = 28;
    this.timeElapsed = 0;

    this.createEnemyGrid();  // Initialize enemy grid

    this.scene.time.addEvent({
      delay: 400,
      callback: this.updateGroupMovement,
      callbackScope: this,
      loop: true,
    });
  }

  createEnemyGrid() {
    this.enemiesData = [
      { y: 0, type: "enemy1", count: 10, movePattern: "a" },
      { y: 1, type: "enemy1", count: 10, movePattern: "a" },
      { y: 2, type: "enemy2", count: 8, movePattern: "b" },
      { y: 3, type: "enemy2", count: 8, movePattern: "b" },
      { y: 4, type: "enemy3", count: 4, movePattern: "c" }
    ];

    this.enemiesData.forEach((levelData) => {
      const levelY = levelData.y === 0 ? -50 : this.groupCenter.y - levelData.y * this.enemyGap;
      const totalWidth = (levelData.count - 1) * this.enemyGap;
      const startX = this.groupCenter.x - totalWidth / 2;

      for (let i = 0; i < levelData.count; i++) {
        const enemy = new Enemy(
          this.scene,
          startX + i * this.enemyGap,
          levelY,
          levelData.type,
          levelData.movePattern,
          levelData.y,
          i
        );

        this.add(enemy);
      }
    });

    this.initiatePathMovement();
  }

  initiatePathMovement() {
    const path = new Phaser.Curves.Path(75, -50);
    path.splineTo([
      100, 50, 50, 100, 100, 150, 50, 200,
      100, 250, 50, 300, 100, 350, 200, 300,
      250, 250, 200, 200
    ]);

    this.getChildren().splice(0, 10).forEach((enemy, index) => {
      enemy.followingGroup = false;
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        ease: 'linear',
        duration: 5000,
        delay: 400 * index,
        repeat: 0,
        onUpdate: (tween) => {
          const t = tween.getValue();
          const position = path.getPoint(t);
          const tangent = path.getTangent(t);

          if (position) {
            enemy.setPosition(position.x, position.y);
          }
          // Turn throughout the path
          if (tangent) {
            const angle = Math.atan2(tangent.y, tangent.x) + Math.PI / 2;
            enemy.setRotation(angle);
          } 
        },
        onComplete: () => {
          this.moveToFinalGridPosition(enemy);
          enemy.followingGroup = true;
        }
      });
    });
  }

  moveToFinalGridPosition(enemy) {
    const levelData = this.enemiesData[enemy.yLevel];

    const totalWidth = (levelData.count - 1) * this.enemyGap;
    const startX = this.groupCenter.x - totalWidth / 2;
    const targetX = startX + enemy.index * this.enemyGap;
    const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

    // Move enemy to final grid position
    this.scene.tweens.add({
      targets: enemy,
      x: targetX,
      y: targetY,
      ease: 'linear',
      duration: 500,
      onComplete: () => {
        enemy.reachedFinalPosition = true;
        enemy.followingGroup = true; // Re-enable formation movement
        enemy.targetX = targetX;

        // Ensure the enemy is part of the oscillating movement
        if (!this.getChildren().includes(enemy)) {
          this.add(enemy);
        }
        enemy.setRotation(0);
      }
    });
  }

  updateGroupMovement() {
    this.timeElapsed += 0.05;
    const offset = 50 * Math.sin(this.timeElapsed);

    this.getChildren().forEach((enemy) => {
      if (!enemy.followingGroup) return;

      enemy.targetX = enemy.targetX || enemy.x;
      enemy.x = enemy.targetX + offset;
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.enemies = [];
    this.enemyGap = 28;
    this.enemySprites = [];
    this.timeElapsed = 0;
  }

  preload() {
    this.load.image("enemy1", "/assets/bossgalaga.png");
    this.load.image("enemy2", "/assets/bossgalaga.png");
    this.load.image("enemy3", "/assets/bossgalaga.png");
  }

  create() {
    this.enemies = new Enemies(this);
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