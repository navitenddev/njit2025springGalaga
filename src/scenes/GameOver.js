import Phaser from 'phaser';
import GameScene from './GameScene';

export default class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: "GameOver" });
    }

    preload() {
        this.load.image('background', './assets/spaceTestImage.jpg');
        // this.load.audio('backgroundmusic', 'assets/audio/sampleMusic.mp3');
    }

    create() {
        // let music = this.sound.add('backgroundmusic', { loop: true });
        // music.play();
        this.load.font('mago', 'assets/fonts/mago1.ttf', 'truetype');
        this.add.image(this.scale.width / 2, this.scale.height / 2, "background").setDisplaySize(this.scale.width, this.scale.height);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "Game Over", {
            fontSize: "50px",
            fill: "#ffffff",
            fontFamily: "mago",
        }).setOrigin(0.5, 0.5);
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 140, "Press Enter To Restart", {
            fontSize: "30px",
            fill: "#ffffff",
            fontFamily: "mago",
        }).setOrigin(0.5, 0.5);
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.pause();
            this.scene.start('GameScene');
            //this.scene.restart("GameScene");
           // music.destroy();
        });
    }
}