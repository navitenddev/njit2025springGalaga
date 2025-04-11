import Phaser from 'phaser';
import { sizes } from '../config';

class Enemy extends Phaser.Physics.Arcade.Sprite {
    
    constructor(scene, x, y, texture, movePattern, yLevel, index, enemyGroup) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.5);
        this.setOrigin(0.5);
        this.body.moves = false;
        this.isDiving = false;  // ADDED: isDiving to avoid calling startDiving on an already diving enemy

        this.movePattern = movePattern;
        this.yLevel = yLevel;
        this.index = index;
        this.enemyGroup = enemyGroup;
    }

    shoot(bullets) {
        if (this.active) {
            bullets.fireBullet(this.x, this.y + 30); // Shoot from slightly below enemy
        }
    }

    hits() {
        this.destroy();
    }

    // ADDED: startDive defines the diving path and function
    startDive() {
        this.isDiving = true;
        const divePath = new Phaser.Curves.Path(this.x, this.y);
        divePath.splineTo([100, 550, 230, 450, 250, 400]);
        divePath.circleTo(50, true, 0);
        divePath.ellipseTo(90, 300, 300, 60, false);

        createTween(this.scene, this, divePath, 0, 5000, () => {
            if (this.y > sizes.height) this.y = -50
            this.enemyGroup.moveToFinalGridPosition(this);
            this.isDiving = false;
        });
    }
}

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.groupCenter = { x: 550 / 2, y: 200 };  // Fixed center point of the group
        this.enemyGap = 37;
        this.timeElapsed = 0;
        this.isbreathing = false;   // CHANGED: Disabled breathing for testing

        this.createEnemyGrid(); // Initialize enemy grid
        
        /* CHANGED: Disabled group movement for testing
        this.scene.time.addEvent({
            delay: 300,
            callback: this.updateGroupMovement,
            callbackScope: this,
            loop: true,
        });*/
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
            const levelY = this.groupCenter.y - levelData.y * this.enemyGap;
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
                    i,
                    this
                );

                this.add(enemy);
            }
        });

        this.initiatePathMovement();
        this.scene.time.delayedCall(5500, () => {
            this.getChildren()[0].startDive();
        });
    }

    initiatePathMovement() {
        /* first entries
        const leftEntry = new Phaser.Curves.Path(550 / 3, -50);
        leftEntry.splineTo([50, 350]);
        leftEntry.ellipseTo(100, 140, 200, 0, true);

        const rightEntry = new Phaser.Curves.Path(2 * 550 / 3, -50);
        rightEntry.splineTo([500, 350]);
        rightEntry.ellipseTo(100, 140, 160, 0, false, 180);*/

        const leftEntry = new Phaser.Curves.Path(-50, 600);
        leftEntry.splineTo([100, 550, 230, 450, 250, 400]);
        leftEntry.circleTo(50, true, 0);

        const rightEntry = new Phaser.Curves.Path(600, 600);
        rightEntry.splineTo([450, 550, 320, 450, 300, 400]);
        rightEntry.circleTo(50, false, 180);

        const tweens = [];
        const allEnemies = this.getChildren();
 
        const leftGroup = [allEnemies[31], allEnemies[23], allEnemies[14], allEnemies[4]];
        const rightGroup = [allEnemies[32], allEnemies[24], allEnemies[15], allEnemies[5]];

        // Left side entry
        leftGroup.forEach((enemy, index) => {
            tweens.push(createTween(this.scene, enemy, leftEntry, index, 3000, () => {
                this.moveToFinalGridPosition(enemy);
            }));
        });

        // Right side entry
        rightGroup.forEach((enemy, index) => {
            tweens.push(createTween(this.scene, enemy, rightEntry, index, 3000, () => {
                this.moveToFinalGridPosition(enemy);
            }));
        });

        // Start both left & right tweens at the same time
        this.scene.tweens.add({
            targets: tweens,
            delay: 0
        });
    }

    moveToFinalGridPosition(enemy) {
        const offset = 50 * Math.sin(this.timeElapsed);
        const levelData = this.enemiesData[enemy.yLevel];
        const totalWidth = (levelData.count - 1) * this.enemyGap;
        const startX = this.groupCenter.x - totalWidth / 2;
        let targetX = offset + startX + enemy.index * this.enemyGap;
        if (this.isbreathing) targetX = enemy.x + ((targetX - 275) * (offset / 3000));
        const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;
    
        // CHANGED: Adjusted spline creation to fit with createTween
        // NOTE: Needs to be cleaned up, and can probably use createTween for all
        if (enemy.isDiving) {
            const path = new Phaser.Curves.Path(enemy.x, enemy.y);
            path.splineTo([targetX, targetY]);
            createTween(this.scene, enemy, path, enemy.index, 1000, () => {enemy.setRotation(0)});
        } else {
            this.scene.tweens.add({
                targets: enemy,
                x: targetX,
                y: targetY,
                ease: 'linear',
                duration: 1000
            });
        }
    }
    

    updateGroupMovement() {
        const offset = 50 * Math.sin(this.timeElapsed);
        this.timeElapsed += 0.1;
        this.getChildren().forEach((enemy) => {

            const levelData = this.enemiesData[enemy.yLevel];
            const totalWidth = (levelData.count - 1) * this.enemyGap;
            const startX = this.groupCenter.x - totalWidth / 2;
            const targetX = startX + enemy.index * this.enemyGap;
            const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

            if (this.isbreathing) enemy.x = enemy.x + ((targetX - 275) * (offset / 3000));
            else enemy.x = targetX + offset;
            // console.log("start: ", targetX, "x: ", enemy.x);
        });
    }
}

// CHANGED: extracted createTween to be used by both Enemy and EnemyGroup
export function createTween(scene, enemy, path, index = 0, duration, onComplete = () => {}) {
    return scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: duration,
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
        onComplete: onComplete
    });
}