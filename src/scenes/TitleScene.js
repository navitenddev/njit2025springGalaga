import Phaser from 'phaser';
import GameScene from './GameScene';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: "TitleScene" });
    }

    preload() {
        this.load.image('background', './assets/spaceTestImage.jpg');
        // this.load.audio('backgroundmusic', 'assets/audio/sampleMusic.mp3');
    }

    create() {
        // let music = this.sound.add('backgroundmusic', { loop: true });
        // music.play();
        this.add.image(this.scale.width / 2, this.scale.height / 2, "background").setDisplaySize(this.scale.width, this.scale.height);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "Shermie Galaga", {
            fontSize: "38px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 140, "Press Enter To Start", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Andale Mono",
        }).setOrigin(0.5, 0.5);
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start("GameScene");
           // music.destroy();
        });
    }
}