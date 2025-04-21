import Phaser from 'phaser';
import { sizes } from '../config';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, movePattern, yLevel, index, col) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.5);
    this.setOrigin(0.5);
    this.body.moves = false;

    this.movePattern = movePattern;
    this.yLevel = yLevel;
    this.index = index;
    this.col = col;
  }

  hits() {
    if (Math.random() < 0.3) {
      if (!this.scene.powerUpsGroup) {
        this.scene.powerUpsGroup = this.scene.physics.add.group();
      }
      const p = new PowerUp(this.scene, this.x, this.y);
      this.scene.powerUpsGroup.add(p);
      p.setVelocityY(100);
    }
    this.destroy();
    if (this.scene.enemyGroupRef && this.scene.enemyGroupRef.checkWaveClear) {
      this.scene.enemyGroupRef.checkWaveClear();
    }
  }
}

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;

    if (this.scene.player) {
      if (!this.scene.enemyBulletsGroup) {
        this.scene.enemyBulletsGroup = this.scene.physics.add.group();
        this.scene.physics.add.overlap(
          this.scene.player,
          this.scene.enemyBulletsGroup,
          (player, bullet) => {
            console.log('[BULLET COLLISION]');
            bullet.resetBullet();
            if (player.takeDamage) {
              player.takeDamage();
            }
          }
        );
      }
      if (!this.scene.enemyBeamsGroup) {
        this.scene.enemyBeamsGroup = this.scene.physics.add.group();
        this.scene.physics.add.overlap(
          this.scene.player,
          this.scene.enemyBeamsGroup,
          (player, beam) => {
            console.log('[BEAM COLLISION]');
            beam.destroy();
            if (player.takeDamage) {
              player.takeDamage();
            }
          }
        );
      }
    }

    this.groupCenter = { x: 550 / 2, y: 200 };
    this.enemyGap = 36;
    this.timeElapsed = 0;
    this.currentStage = 1;
    this.speedMultiplier = 1;
    this.firingInterval = 3000;
    this.enemyFireEvents = [];

    this.formationColumns = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [3, 4, 5, 6]
    ];

    this.enemiesData = [
      { y: 0, type: "enemy1", count: 10, movePattern: "dive" },    
      { y: 1, type: "enemy1", count: 10, movePattern: "loop" },
      { y: 2, type: "enemy2", count: 8,  movePattern: "swoop" },
      { y: 3, type: "enemy2", count: 8,  movePattern: "beam" },    
      { y: 4, type: "enemy3", count: 4,  movePattern: "bullet" }   
    ];

    this.scene.enemyGroupRef = this;

    this.createEnemyGrid();

    this.scene.time.addEvent({
      delay: 5000,
      callback: () => {
        this.currentStage = (this.currentStage % 3) + 1;
        this.setupStageOrders();
      },
      loop: true
    });
  }

  createEnemyGrid() {
    this.enemiesData.forEach((levelData) => {
      const rowIndex = levelData.y;
      const rowCols = this.formationColumns[rowIndex];
      const startY = (rowIndex === 0)
        ? -50
        : this.groupCenter.y - rowIndex * this.enemyGap;
      const maxCols = 9;
      const rowWidth = maxCols * this.enemyGap;
      const rowStartX = (550 / 2) - (rowWidth / 2);

      for (let i = 0; i < levelData.count; i++) {
        const col = rowCols[i];
        const startX = rowStartX + col * this.enemyGap;
        const enemy = new Enemy(
          this.scene,
          startX,
          startY,
          levelData.type,
          levelData.movePattern,
          rowIndex,
          i,
          col
        );
        this.add(enemy);
        this.scheduleEnemyFire(enemy);
      }
    });

    this.initiatePathMovement();
    this.applyExtraSplineMovements();
  }

  scheduleEnemyFire(enemy) {
    const evt = this.scene.time.addEvent({
      delay: this.firingInterval,
      loop: true,
      callback: () => {
        if (enemy.active) {
          this.regularBulletAttack(enemy);
        }
      }
    });
    this.enemyFireEvents.push(evt);
  }

  resetFireTimers() {
    this.enemyFireEvents.forEach(e => e.remove(false));
    this.enemyFireEvents = [];
    this.getChildren().forEach(e => this.scheduleEnemyFire(e));
  }

  initiatePathMovement() {
    const allEnemies = this.getChildren();
    const row0 = allEnemies.slice(0, 10);
    const row1 = allEnemies.slice(10, 20);
    const row2 = allEnemies.slice(20, 28);
    const row3 = allEnemies.slice(28, 36);
    const row4 = allEnemies.slice(36, 40);

    const splitRow = (rowArr) => {
      const mid = Math.floor(rowArr.length / 2);
      return [rowArr.slice(0, mid), rowArr.slice(mid)];
    };

    const [left0, right0] = splitRow(row0);
    const [left1, right1] = splitRow(row1);
    const [left2, right2] = splitRow(row2);
    const [left3, right3] = splitRow(row3);
    const [left4, right4] = splitRow(row4);

    const leftEntry = new Phaser.Curves.Path(550 / 3, -50);
    leftEntry.splineTo([50, 700 / 2]);
    leftEntry.ellipseTo(100, 140, 200, 0, true);

    const rightEntry = new Phaser.Curves.Path((2 * 550) / 3, -50);
    rightEntry.splineTo([550 - 50, 700 / 2]);
    rightEntry.ellipseTo(100, 140, 160, 0, false, 180);

    const applyPath = (group, path) => {
      group.forEach((enemy, index) => {
        this.createTween(enemy, path, index);
      });
    };

    applyPath(left0, leftEntry);
    applyPath(right0, rightEntry);
    applyPath(left1, leftEntry);
    applyPath(right1, rightEntry);
    applyPath(left2, leftEntry);
    applyPath(right2, rightEntry);
    applyPath(left3, leftEntry);
    applyPath(right3, rightEntry);
    applyPath(left4, leftEntry);
    applyPath(right4, rightEntry);
  }

  createTween(enemy, path, index = 1) {
    return this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 4000,
      duration: 4000 / this.speedMultiplier,
      delay: 5 * index,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const smoothT = Phaser.Math.Easing.Quintic.InOut(t);
        const position = path.getPoint(smoothT);
        const tangent = path.getTangent(smoothT);
        if (position) {
          enemy.setPosition(position.x, position.y);
        }
        if (tangent) {
          enemy.setRotation(Math.atan2(tangent.y, tangent.x) + Math.PI / 2);
        }
      },
      onComplete: () => {
        console.log('[SWIRL COMPLETE] Enemy index:', enemy.index);
        this.moveToFinalGridPosition(enemy);
      }
    });
  }

  moveToFinalGridPosition(enemy) {
    const levelData = this.enemiesData[enemy.yLevel];
    const totalWidth = (levelData.count - 1) * this.enemyGap;
    const rowStartX = this.groupCenter.x - totalWidth / 2;
    const targetX = rowStartX + enemy.index * this.enemyGap;
    const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

    const maxCols = 9;
    const rowWidth = maxCols * this.enemyGap;
    const finalStartX = (550 / 2) - (rowWidth / 2);
    const finalX = finalStartX + enemy.col * this.enemyGap;
    const finalY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

    console.log('[MOVE TO FORMATION START] Enemy index:', enemy.index);
    this.scene.tweens.add({
      targets: enemy,
      x: finalX,
      y: finalY,
      rotation: 0,
      ease: 'Sine.easeInOut',
      duration: 1000,
      onStart: () => {
        console.log('[FINAL TWEEN START] Enemy index:', enemy.index);
      },
      onComplete: () => {
        console.log('[MOVE TO FORMATION COMPLETE] Enemy index:', enemy.index);
        this.ensureEnemySpacing();
      }
    });
  }

  updateGroupCenter() {
    let sumX = 0,
      sumY = 0,
      count = 0;
    this.getChildren().forEach((enemy) => {
      sumX += enemy.x;
      sumY += enemy.y;
      count++;
    });
    if (count > 0) {
      this.groupCenter.x = sumX / count;
      this.groupCenter.y = sumY / count;
    }
  }

  setupStageOrders() {
    this.getChildren().forEach((enemy) => {
      if (this.currentStage === 1) {
        enemy.movePattern = 'a';
      } else if (this.currentStage === 2) {
        enemy.movePattern = 'b';
      } else if (this.currentStage === 3) {
        enemy.movePattern = 'c';
      }
    });
    if (this.currentStage === 1) {
      this.speedMultiplier = 1;
      this.firingInterval = 3000;
    } else if (this.currentStage === 2) {
      this.speedMultiplier = 1.5;
      this.firingInterval = 2000;
    } else if (this.currentStage === 3) {
      this.speedMultiplier = 2;
      this.firingInterval = 1200;
    }
    this.resetFireTimers();
  }

  getGridCoordinates(row, col) {
    const cellWidth = 36,
      cellHeight = 36,
      marginX = 50,
      marginY = 50;
    return {
      x: marginX + col * cellWidth + cellWidth / 2,
      y: marginY + row * cellHeight + cellHeight / 2
    };
  }

  ensureEnemySpacing() {
    const enemies = this.getChildren();
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        const dx = enemies[i].x - enemies[j].x;
        const dy = enemies[i].y - enemies[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.enemyGap * 0.6) {
          enemies[j].x += this.enemyGap * 0.6 - dist;
        }
      }
    }
  }

  followExitCurve(enemy) {
    const exitPath = new Phaser.Curves.Path(enemy.x, enemy.y);
    exitPath.splineTo([
      { x: enemy.x - 50, y: 650 },
      { x: enemy.x + 50, y: 750 }
    ]);
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const pos = exitPath.getPoint(t);
        if (pos) {
          enemy.setPosition(pos.x, pos.y);
        }
      },
      onComplete: () => {
        enemy.destroy();
      }
    });
  }

  figure8Path(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    path.ellipseTo(40, 20, 180, 0, false, 0);
    path.ellipseTo(40, 20, 180, 0, false, 180);
    return path;
  }

  loopPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    path.ellipseTo(50, 50, 360, 0, false);
    return path;
  }

  swoopPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    path.splineTo([
      { x: x + 30, y: y + 50 },
      { x: x - 30, y: y + 100 },
      { x: x, y: y + 150 }
    ]);
    return path;
  }

  zigzagPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    path.splineTo([
      { x: x + 50, y: y - 50 },
      { x: x + 100, y: y + 50 },
      { x: x + 150, y: y - 50 },
      { x: x + 200, y: y + 50 }
    ]);
    return path;
  }

  spiralPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    let points = [];
    const a = 5,
      b = 5;
    for (let theta = 0; theta <= Math.PI * 4; theta += Math.PI / 8) {
      const r = a + b * theta;
      points.push({ x: x + r * Math.cos(theta), y: y + r * Math.sin(theta) });
    }
    path.splineTo(points);
    return path;
  }

  sineWavePath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    let points = [];
    const amplitude = 30,
      length = 200;
    for (let i = 1; i <= 10; i++) {
      const newX = x + (length / 10) * i;
      const newY = y + amplitude * Math.sin((i / 10) * Math.PI * 2);
      points.push({ x: newX, y: newY });
    }
    path.splineTo(points);
    return path;
  }

  arcPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    let points = [];
    const radiusX = 100,
      radiusY = 50;
    for (let theta = 0; theta <= Math.PI; theta += Math.PI / 16) {
      points.push({ x: x + radiusX * Math.cos(theta), y: y + radiusY * Math.sin(theta) });
    }
    path.splineTo(points);
    return path;
  }

  parabolicPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    let points = [];
    const width = 200,
      height = 100;
    for (let t = 0; t <= 1; t += 0.1) {
      const newX = x + width * t;
      const newY = y + height * Math.pow(t - 0.5, 2);
      points.push({ x: newX, y: newY });
    }
    path.splineTo(points);
    return path;
  }

  lissajousPath(x, y) {
    const path = new Phaser.Curves.Path(x, y);
    let points = [];
    const amplitudeX = 50,
      amplitudeY = 30,
      frequencyX = 3,
      frequencyY = 2;
    for (let theta = 0; theta <= Math.PI * 2; theta += Math.PI / 16) {
      points.push({ x: x + amplitudeX * Math.sin(frequencyX * theta), y: y + amplitudeY * Math.sin(frequencyY * theta) });
    }
    path.splineTo(points);
    return path;
  }

  diveAttackMovement(enemy, index) {
    console.log('[DIVE ATTACK START] Enemy index:', enemy.index);
    const targetX = this.scene.player ? this.scene.player.x : enemy.x;
    const targetY = this.scene.player ? this.scene.player.y : enemy.y + 150;
    this.scene.tweens.add({
      targets: enemy,
      x: targetX,
      y: targetY,
      duration: 800,
      duration: 800 / this.speedMultiplier,
      ease: 'Quad.easeIn',
      yoyo: true,
      onComplete: () => {
        console.log('[DIVE ATTACK COMPLETE] Enemy index:', enemy.index);
        this.moveToFinalGridPosition(enemy);
      }
    });
  }

  bossBeamAttack(enemy, index) {
    console.log('[BOSS BEAM ATTACK START] Enemy index:', enemy.index);
    const beam = this.scene.add.sprite(enemy.x, enemy.y, 'beam');
    if (this.scene.player) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.scene.player.x, this.scene.player.y);
      beam.rotation = angle;
    }
    beam.setOrigin(0.5, 0);
    this.scene.physics.add.existing(beam);
    if (this.scene.enemyBeamsGroup) {
      this.scene.enemyBeamsGroup.add(beam);
    }
    this.scene.tweens.add({
      targets: beam,
      scaleY: 2,
      duration: 500,
      duration: 500 / this.speedMultiplier,
      onComplete: () => {
        console.log('[BOSS BEAM ATTACK COMPLETE] Enemy index:', enemy.index);
        beam.destroy();
        this.moveToFinalGridPosition(enemy);
      }
    });
  }

  regularBulletAttack(enemy) {
    console.log('[REGULAR BULLET ATTACK] Enemy index:', enemy.index);
    if (!this.scene.player) return;
    const bullet = new Bullet(this.scene, enemy.x, enemy.y);
    if (this.scene.enemyBulletsGroup) {
      this.scene.enemyBulletsGroup.add(bullet);
    }
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.scene.player.x, this.scene.player.y);
    const speed = 300;
    const speedAdjusted = speed * this.speedMultiplier;
    bullet.setVelocityX(speedAdjusted * Math.cos(angle));
    bullet.setVelocityY(speedAdjusted * Math.sin(angle));
    console.log('[BULLET FIRED] Enemy index:', enemy.index);
  }

  applyExtraSplineMovements() {
    this.getChildren().forEach((enemy, index) => {
      if (enemy.movePattern === 'figure8') {
        this.applyExtraSplineMovement(enemy, this.figure8Path(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'loop') {
        this.applyExtraSplineMovement(enemy, this.loopPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'swoop') {
        this.applyExtraSplineMovement(enemy, this.swoopPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'zigzag') {
        this.applyExtraSplineMovement(enemy, this.zigzagPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'spiral') {
        this.applyExtraSplineMovement(enemy, this.spiralPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'sine') {
        this.applyExtraSplineMovement(enemy, this.sineWavePath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'arc') {
        this.applyExtraSplineMovement(enemy, this.arcPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'parabola') {
        this.applyExtraSplineMovement(enemy, this.parabolicPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'lissajous') {
        this.applyExtraSplineMovement(enemy, this.lissajousPath(enemy.x, enemy.y), index);
      } else if (enemy.movePattern === 'dive') {
        this.diveAttackMovement(enemy, index);
      } else if (enemy.movePattern === 'beam') {
        this.bossBeamAttack(enemy, index);
      } else if (enemy.movePattern === 'bullet') {
        this.regularBulletAttack(enemy);
      }
    });
  }

  applyExtraSplineMovement(enemy, path, index = 0) {
    console.log('[EXTRA SPLINE START] Enemy index:', enemy.index, 'movePattern:', enemy.movePattern);
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 4000,
      duration: 4000 / this.speedMultiplier,
      delay: 50 * index,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const smoothT = Phaser.Math.Easing.Quintic.InOut(t);
        const position = path.getPoint(smoothT);
        const tangent = path.getTangent(smoothT);
        if (position) {
          enemy.setPosition(position.x, position.y);
        }
        if (tangent) {
          enemy.setRotation(Math.atan2(tangent.y, tangent.x) + Math.PI / 2);
        }
      },
      onComplete: () => {
        console.log('[EXTRA SPLINE COMPLETE] Enemy index:', enemy.index);
        this.moveToFinalGridPosition(enemy);
      }
    });
  }

  checkWaveClear() {
    if (this.countActive(true) === 0) {
      this.currentStage = (this.currentStage % 3) + 1;
      this.setupStageOrders();
      this.clear(true, true);
      this.createEnemyGrid();
    }
  }
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
  }

  fire(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(-300);
  }

  update() {
    if (this.y < 0) {
      this.resetBullet();
    }
  }

  resetBullet() {
    this.setActive(false);
    this.setVisible(false);
    this.setPosition(this.scene.cameras.main.centerX, -20);
  }
}

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'powerup');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.setVelocityY(100);
  }
}
