import Phaser from 'phaser';

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
        this.destroy();
    }
}

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;

        
        this.groupCenter = { x: 550 / 2, y: 200 };
        this.enemyGap = 36;
        this.timeElapsed = 0;
        this.currentStage = 1;

        
        this.formationColumns = [
            [0,1,2,3,4,5,6,7,8,9],   
            [0,1,2,3,4,5,6,7,8,9],   
            [1,2,3,4,5,6,7,8],       
            [1,2,3,4,5,6,7,8],       
            [3,4,5,6],               
        ];

        
        this.enemiesData = [
            { y: 0, type: "enemy1", count: 10, movePattern: "a" },
            { y: 1, type: "enemy1", count: 10, movePattern: "a" },
            { y: 2, type: "enemy2", count: 8,  movePattern: "b" },
            { y: 3, type: "enemy2", count: 8,  movePattern: "b" },
            { y: 4, type: "enemy3", count: 4,  movePattern: "c" }
        ];

        
        this.createEnemyGrid();

        this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateGroupMovement,
            callbackScope: this,
            loop: true,
        });

        this.scene.time.addEvent({
            delay: 5000,
            callback: () => {
                this.currentStage = (this.currentStage % 3) + 1;
                this.setupStageOrders();
            },
            loop: true,
        });
    }

    createEnemyGrid() {
    
        this.enemiesData.forEach((levelData) => {
            const rowIndex = levelData.y;
            const rowCols = this.formationColumns[rowIndex];

            const startY = (rowIndex === 0) ? -50 : this.groupCenter.y - rowIndex * this.enemyGap;
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
            }
        });

        this.initiatePathMovement();
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
            duration: 3000,
            delay: 120 * index,
            onUpdate: (tween) => {
                const t = tween.getValue();
                const position = path.getPoint(t);
                const tangent = path.getTangent(t);

                if (position) {
                    enemy.setPosition(position.x, position.y);
                }
                if (tangent) {
                    const angle = Math.atan2(tangent.y, tangent.x) + Math.PI / 2;
                    enemy.setRotation(angle);
                }
            },
            onComplete: () => {
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

        
        this.scene.tweens.add({
            targets: enemy,
            x: targetX,
            y: targetY,
            ease: 'linear',
            duration: 500,
            onComplete: () => {
                
                const maxCols = 9;
                const rowWidth = maxCols * this.enemyGap;
                const finalStartX = (550 / 2) - (rowWidth / 2);

                const finalX = finalStartX + enemy.col * this.enemyGap;
                const finalY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

                this.scene.tweens.add({
                    targets: enemy,
                    x: finalX,
                    y: finalY,
                    ease: 'linear',
                    duration: 500,
                    onComplete: () => {
                        this.ensureEnemySpacing();
                    }
                });
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

    updateGroupCenter() {
        let sumX = 0, sumY = 0, count = 0;
        this.getChildren().forEach(enemy => {
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
        this.getChildren().forEach(enemy => {
            if (this.currentStage === 1) {
                enemy.movePattern = 'a';
            } else if (this.currentStage === 2) {
                enemy.movePattern = 'b';
            } else if (this.currentStage === 3) {
                enemy.movePattern = 'c';
            }
        });
    }

    getGridCoordinates(row, col) {
        const cellWidth = 36;
        const cellHeight = 36;
        const marginX = 50;
        const marginY = 50;
        return {
            x: marginX + col * cellWidth + cellWidth / 2,
            y: marginY + row * cellHeight + cellHeight / 2,
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
                    enemies[j].x += (this.enemyGap * 0.6 - dist);
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
}
