import './style.css';
import Phaser from 'phaser';

const sizes = {
  width: 550,
  height: 700
};

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, movePattern, yLevel, index) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.5);
    this.setOrigin(0.5);
    this.body.moves = false;

    this.movePattern = movePattern;
    this.yLevel = yLevel;
    this.index = index;
  }
}

class Enemies extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;
    this.groupCenter = { x: sizes.width / 2, y: 200 }; // Center point of the group
    this.enemyGap = 36;
    this.timeElapsed = 0;

    this.createEnemyGrid();  // Initialize enemy grid

    this.scene.time.addEvent({
      delay: 1000,
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
    const leftEntry = new Phaser.Curves.Path(sizes.width / 3, -50);
    leftEntry.splineTo([50, sizes.height / 2]);
    leftEntry.ellipseTo(100, 140, 200, 0, true);

    const rightEntry = new Phaser.Curves.Path(2 * sizes.width / 3, -50);
    rightEntry.splineTo([sizes.width - 50, sizes.height / 2]);
    rightEntry.ellipseTo(100, 140, 160, 0, false, 180);

    const tweens = [];

    const allEnemies = this.getChildren()

    const leftGroup = allEnemies.slice(0, 5);
    const rightGroup = allEnemies.slice(5, 10);

    // Left side entry
    leftGroup.forEach((enemy, index) => {
      tweens.push(this.createTween(enemy, leftEntry, index));
    });

    // Right side entry
    rightGroup.forEach((enemy, index) => {
      tweens.push(this.createTween(enemy, rightEntry, index));
    });

    // Start both left & right tweens at the same time
    this.scene.tweens.add({
      targets: tweens,
      delay: 0,
    });
  }

  createTween(enemy, path, index = 1) {
    return this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 3000,
      delay: 120 * index,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const position = path.getPoint(t);
        const tangent = path.getTangent(t);

        if (position) enemy.setPosition(position.x, position.y);
        if (tangent) {
          const angle = Math.atan2(tangent.y, tangent.x) + Math.PI / 2;
          enemy.setRotation(angle);
        }
      },
      onComplete: () => {
        this.moveToFinalGridPosition(enemy)
      }
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
        // enemy.followingGroup = true;
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
