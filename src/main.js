import './style.css'
import Phaser from 'phaser'
   
const sizes = {
  width: 500,
  height: 500
};

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
    this.groupCenter = { x: 250, y: 150 }; // Fixed center point of the group

    // Create enemies in the group
    this.createEnemies(0, "a", "enemy1", 10);
    this.createEnemies(1, "a", "enemy1", 10);
    this.createEnemies(2, "b", "enemy2", 8);
    this.createEnemies(3, "b", "enemy2", 8);
    this.createEnemies(4, "c", "enemy3", 4);

    // console.log("Total enemies in enemySprites:", this.enemySprites.length);
    // this.enemySprites.forEach((e, i) => console.log(`Enemy ${i} - followingGroup: ${e.followingGroup}`));

    this.enemySprites = [];
    this.enemies.forEach((levelData) => {
      const { y, enemiesAtLevel } = levelData;
      const levelY = (y == 0) ? -50 : this.groupCenter.y - y * this.enemyGap;
      const totalWidth = (enemiesAtLevel.length - 1) * this.enemyGap;
      const startX = this.groupCenter.x - totalWidth / 2;

      enemiesAtLevel.forEach((data, index) => {
        let enemy = this.physics.add.sprite(
          startX + index * this.enemyGap,
          levelY,
          data.type
        ).setScale(0.5);

        enemy.setOrigin(0.5);
        enemy.body.setAllowGravity(false);
        enemy.body.moves = false;

        enemy.movePattern = data.movePattern;
        enemy.followingGroup = true;
        enemy.yLevel = y;
        enemy.index = index;
        enemy.targetX = startX + index * this.enemyGap;
        enemy.targetY = levelY;

        this.enemySprites.push(enemy);
      });
    });

    // Initial enemy path movement
    const path = new Phaser.Curves.Path(75, -50);
    path.splineTo([100, 50, 50, 100, 100, 150, 50, 200, 100, 250, 50, 300, 100, 350]);
    path.splineTo([200, 300, 250, 250, 200, 200]);

    this.enemySprites.splice(0, 10).forEach((enemy, index) => {
      enemy.followingGroup = false;
      this.tweens.addCounter({
        from: 0,
        to: 1,
        ease: 'linear',
        duration: 5000,
        delay: 400 * index,
        repeat: 0,
        onUpdate: tween => {
          const t = tween.getValue();
          const position = path.getPoint(t);
          const tangent = path.getTangent(t);

          if (position) {
            enemy.setPosition(position.x, position.y);
          }

          if (tangent) {
            const angle = Math.atan2(tangent.y, tangent.x);
            enemy.setRotation(angle);
          }
        },
        onComplete: () => {
          this.moveToFinalGridPosition(enemy);
        },
      });
    });

    // Group movement using update loop
    this.time.addEvent({
      delay: 400,
      callback: this.updateGroupMovement,
      callbackScope: this,
      loop: true,
    });
  }

  updateGroupMovement() {
    this.timeElapsed += 0.05;
    const offset = 50 * Math.sin(this.timeElapsed);

    this.enemySprites.forEach((enemy) => {
      if (!enemy.followingGroup) return;

      enemy.targetX = enemy.targetX || enemy.x;
      enemy.x = enemy.targetX + offset;
    });

    // console.log(`Group moving: Offset ${offset}`);
  }

  // Split off at the end of the path to grid location
  moveToFinalGridPosition(enemy) {
    const levelData = this.enemies[enemy.yLevel];

    const totalWidth = (levelData.enemiesAtLevel.length - 1) * this.enemyGap;
    const startX = this.groupCenter.x - totalWidth / 2;
    const targetX = startX + enemy.index * this.enemyGap;
    const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

    this.tweens.add({
      targets: enemy,
      x: targetX,
      y: targetY,
      ease: 'linear',
      duration: 500,
      onComplete: () => {
        enemy.reachedFinalPosition = true;
        enemy.followingGroup = true;
        enemy.targetX = targetX;
        if (!this.enemySprites.includes(enemy)) {
          this.enemySprites.push(enemy);
        }
      }
    });
  }

  createEnemies(y, movePattern, type, count) {
    let existingLevel = this.enemies.find(level => level.y === y);

    if (existingLevel) {  // Enemies already on that level
      existingLevel.enemiesAtLevel.push(
        ...Array.from({ length: count }, () => ({ movePattern, type }))
      );
    } else {  // Enemies on a new level
      this.enemies.push({
        y: y,
        enemiesAtLevel: Array.from({ length: count }, () => ({ movePattern, type }))
      });
    }
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