import Phaser from 'phaser';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: "CreditsScene" });
    }

    preload() {
        this.load.image('background', './assets/spaceTestImage.jpg');
        this.load.image('play', './assets/blue.png');
        this.load.font('mago', './assets/fonts/mago1.ttf', 'truetype');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, "background").setDisplaySize(this.scale.width, this.scale.height);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 150, "Credits", {
            fontSize: "75px",
            fill: "#ffffff",
            fontFamily: "mago"
        }).setOrigin(0.5, 0.5);
    }
}