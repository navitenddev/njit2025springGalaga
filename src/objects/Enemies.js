import Phaser from 'phaser';
import { sizes } from '../config';

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, yLevel, index, enemyGroup) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5);
        this.setScale(1.2)
        this.setSize(25, 25);
        this.body.moves = false;
        this.isDiving = false;  // ADDED: isDiving to avoid calling startDiving on an already diving enemy
        this.prevX = x;
        this.prevY = y;
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
            if (this.y > sizes.height) this.y = -50;
            this.enemyGroup.moveToFinalGridPosition(this);
            this.isDiving = false;
        });
    }
}

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.groupCenter = { x: 550 / 2, y: 160 };  // Fixed center point of the group
        this.horizontalGap = 40;
        this.verticalGap = 30;
        this.timeElapsed = 0;
        this.isbreathing = false;   // CHANGED: Disabled breathing for testing

        this.createEnemyGrid(); // Initialize enemy grid


        this.scene.time.addEvent({
            delay: 300,
            callback: this.updateGroupMovement,
            callbackScope: this,
            loop: true,
        });
    }

    createEnemyGrid() {
        this.enemiesData = [
            { y: 0, type: "enemy1", count: 10 },
            { y: 1, type: "enemy1", count: 10 },
            { y: 2, type: "enemy2", count: 8 },
            { y: 3, type: "enemy2", count: 8 },
            { y: 4, type: "boss", count: 4 }
        ];

        this.enemiesData.forEach((levelData) => {
            const levelY = -50;
            const totalWidth = (levelData.count - 1) * this.horizontalGap;
            const startX = this.groupCenter.x - totalWidth / 2;

            for (let i = 0; i < levelData.count; i++) {
                const enemy = new Enemy(
                    this.scene,
                    startX + i * this.horizontalGap,
                    levelY,
                    levelData.type,
                    levelData.y,
                    i,
                    this
                );

                this.add(enemy);
            }
        });

        this.initiatePathMovement();
        /*
        this.scene.time.delayedCall(5500, () => {
            this.getChildren()[0].startDive();
        });*/
    }

    initiatePathMovement() {
        // ADDED: Graphics for visualizing paths
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1);

        const groupAleftEntry = new Phaser.Curves.Path(550 / 3, -50);
        groupAleftEntry.splineTo([50, 350]);
        groupAleftEntry.ellipseTo(100, 140, 200, 0, true, 0);
        // groupAleftEntry.draw(graphics);

        const groupArightEntry = new Phaser.Curves.Path(2 * 550 / 3, -50);
        groupArightEntry.splineTo([500, 350]);
        groupArightEntry.ellipseTo(100, 140, 160, 0, false, 180);
        // groupArightEntry.draw(graphics);

        const groupBEntry = new Phaser.Curves.Path(-50, 600);
        groupBEntry.splineTo([100, 550, 230, 450, 250, 400]);
        groupBEntry.ellipseTo(80, 80, 0, 360, true, 0);
        groupBEntry.splineTo([[260, 300, 270, 250]]);
        // groupBEntry.draw(graphics);

        const groupCEntry = new Phaser.Curves.Path(600, 600);
        groupCEntry.splineTo([450, 550, 320, 450, 300, 400]);
        groupCEntry.ellipseTo(80, 80, 0, 360, false, 180);
        groupCEntry.splineTo([[290, 300, 260, 250]]);
        // groupCEntry.draw(graphics);

        const groupDEntry = new Phaser.Curves.Path(450, -50);
        groupDEntry.splineTo([70, 100, 80, 200, 400, 300]);
        groupDEntry.ellipseTo(100, 80, 20, 260, false, 260);
        //groupDEntry.draw(graphics);

        const groupEEntry = new Phaser.Curves.Path(100, -50);
        groupEEntry.splineTo([480, 100, 470, 200, 150, 300]);
        groupEEntry.ellipseTo(100, 80, 340, 100, true, 280);
        //groupEEntry.draw(graphics);

        const allEnemies = this.getChildren();

        const groupA = [
            [allEnemies[31], allEnemies[32], allEnemies[23], allEnemies[24]],
            [allEnemies[14], allEnemies[15], allEnemies[4], allEnemies[5]]
        ];
        const groupB = [
            allEnemies[36], allEnemies[30], allEnemies[39], allEnemies[33],
            allEnemies[37], allEnemies[25], allEnemies[38], allEnemies[22]
        ];
        const groupC = [
            allEnemies[29], allEnemies[34], allEnemies[21], allEnemies[26],
            allEnemies[28], allEnemies[35], allEnemies[20], allEnemies[27]
        ];
        const groupD = [
            allEnemies[16], allEnemies[13], allEnemies[6], allEnemies[3],
            allEnemies[17], allEnemies[2], allEnemies[7], allEnemies[12]
        ];
        const groupE = [
            allEnemies[10], allEnemies[11], allEnemies[18], allEnemies[19],
            allEnemies[0], allEnemies[1], allEnemies[8], allEnemies[9]
        ];

        const entryDuration = 2000;
        const groupEntryDelay = 3000;

        // Group A left side entry
        groupA[0].forEach((enemy, index) => {
            createTween(this.scene, enemy, groupAleftEntry, index, entryDuration, () => {
                this.moveToFinalGridPosition(enemy);
            });
        });

        // Group A right side entry
        groupA[1].forEach((enemy, index) => {
            createTween(this.scene, enemy, groupArightEntry, index, entryDuration, () => {
                this.moveToFinalGridPosition(enemy);
            });
        });

        this.scene.time.delayedCall(groupEntryDelay * 1, () => {
            // Group B entry
            groupB.forEach((enemy, index) => {
                createTween(this.scene, enemy, groupBEntry, index, entryDuration, () => {
                    this.moveToFinalGridPosition(enemy);
                });
            });
        });

        this.scene.time.delayedCall(groupEntryDelay * 2, () => {
            // Group C entry
            groupC.forEach((enemy, index) => {
                createTween(this.scene, enemy, groupCEntry, index, entryDuration, () => {
                    this.moveToFinalGridPosition(enemy);
                });
            });
        });

        this.scene.time.delayedCall(groupEntryDelay * 3, () => {
            // Group D entry
            groupD.forEach((enemy, index) => {
                createTween(this.scene, enemy, groupDEntry, index, entryDuration * 1.4, () => {
                    this.moveToFinalGridPosition(enemy);
                });
            });
        });

        this.scene.time.delayedCall(groupEntryDelay * 4.3, () => {
            // Group E entry
            groupE.forEach((enemy, index) => {
                createTween(this.scene, enemy, groupEEntry, index, entryDuration * 1.4, () => {
                    this.moveToFinalGridPosition(enemy);
                });
            });
        });
    }


    moveToFinalGridPosition(enemy) {
        const targetY = this.groupCenter.y - enemy.yLevel * this.verticalGap;
        const levelData = this.enemiesData[enemy.yLevel];
        const totalWidth = (levelData.count - 1) * this.horizontalGap;
        const startX = this.groupCenter.x - totalWidth / 2;
        const offset = 50 * Math.sin(this.timeElapsed);

        let targetX = offset + startX + enemy.index * this.horizontalGap;
        if (this.isbreathing) {
            targetX = enemy.x + ((targetX - 275) * (offset / 3000));
        }

        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);
        const speed = 400; // CHANGED: using constant speed 
        const duration = (distance / speed) * 1000;

        this.scene.tweens.add({
            targets: enemy,
            x: targetX,
            y: targetY,
            ease: 'linear',
            duration,
            onUpdate: () => {
                const angle = Phaser.Math.Angle.Between(enemy.prevX, enemy.prevY, enemy.x, enemy.y);
                const spriteFacingOffset = Phaser.Math.DegToRad(90);
                enemy.rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, angle + spriteFacingOffset, 0.1);

                enemy.prevX = enemy.x;
                enemy.prevY = enemy.y;
            },
            onComplete: () => {
                this.scene.tweens.add({
                    targets: enemy,
                    rotation: 0,
                    duration: 100,
                    ease: 'Sine.easeOut'
                });
            }
        });
    }


    updateGroupMovement() {
        const offset = 50 * Math.sin(this.timeElapsed);
        this.timeElapsed += 0.1;
        this.getChildren().forEach((enemy) => {

            const levelData = this.enemiesData[enemy.yLevel];
            const totalWidth = (levelData.count - 1) * this.horizontalGap;
            const startX = this.groupCenter.x - totalWidth / 2;
            const targetX = startX + enemy.index * this.horizontalGap;

            if (this.isbreathing) enemy.x = enemy.x + ((targetX - 275) * (offset / 3000));
            else enemy.x = targetX + offset;
            // console.log("start: ", targetX, "x: ", enemy.x);
        });
    }
}

// CHANGED: extracted createTween to be used by both Enemy and EnemyGroup
export function createTween(scene, enemy, path, index = 0, duration, onComplete = () => { }) {
    return scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: duration,
        delay: 80 * index,
        onUpdate: (tween) => {
            const t = tween.getValue();
            const position = path.getPoint(t);
            const tangent = path.getTangent(t);

            if (position) {
                enemy.prevX = enemy.x;
                enemy.prevY = enemy.y;
                enemy.setPosition(position.x, position.y);
            }

            // Rotate enemy throughout the path
            if (tangent) {
                const angle = Math.atan2(tangent.y, tangent.x) + Math.PI / 2;
                enemy.setRotation(angle);
            }
        },
        onComplete: onComplete
    });
}