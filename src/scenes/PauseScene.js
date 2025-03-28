import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: "PauseScene" });
    }

    preload() {
        this.load.image('background', './assets/spaceTestImage.jpg');
    }

    create() {
        //background = this.add.image(this.scale.width / 2, this.scale.height / 2, "background").setDisplaySize(this.scale.width, this.scale.height);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "Press Space To Resume", {
            fontSize: "38px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.resume("GameScene");
            this.scene.stop();
        });
    }
}