import Phaser from 'phaser';

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

    hits() {
        this.destroy();
    }
}

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.groupCenter = { x: 550 / 2, y: 200 };  // Fixed center point of the group
        this.enemyGap = 36;
        this.timeElapsed = 0;

        this.createEnemyGrid(); // Initialize enemy grid

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
                    i
                );

                this.add(enemy);
            }
        });

        this.initiatePathMovement();
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
            tweens.push(this.createTween(enemy, leftEntry, index));
        });

        // Right side entry
        rightGroup.forEach((enemy, index) => {
            tweens.push(this.createTween(enemy, rightEntry, index));
        });

        // Start both left & right tweens at the same time
        this.scene.tweens.add({
            targets: tweens,
            delay: 0
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
            }
        });
    }

    moveToFinalGridPosition(enemy) {
        const levelData = this.enemiesData[enemy.yLevel];
        const totalWidth = (levelData.count - 1) * this.enemyGap;
        const startX = this.groupCenter.x - totalWidth / 2;
        const targetX = startX + enemy.index * this.enemyGap;
        const targetY = this.groupCenter.y - enemy.yLevel * this.enemyGap;

        this.scene.tweens.add({
            targets: enemy,
            x: targetX,
            y: targetY,
            ease: 'linear',
            duration: 1000
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