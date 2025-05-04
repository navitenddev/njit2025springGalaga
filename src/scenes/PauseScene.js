import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: "PauseScene" });
        this.menuItems = [];
        this.selectedIndex = 0;
    }

    preload() {
        this.load.image('background', './assets/spaceTestImage.jpg');
    }

    create() {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, "background")
            .setDisplaySize(this.scale.width, this.scale.height);

        const menuOptions = ["Resume", "Restart", "Quit to Title"];
        const startY = this.scale.height / 2 - 40;

        this.menuItems = menuOptions.map((text, index) => {
            return this.add.text(this.scale.width / 2, startY + index * 50, text, {
                fontSize: "32px",
                fill: index === 0 ? "#ffff00" : "#ffffff", // highlight first item
                fontFamily: "Andale Mono",
            }).setOrigin(0.5);
        });

        this.input.keyboard.on("keydown-UP", () => {
            this.updateSelection(-1);
        });

        this.input.keyboard.on("keydown-DOWN", () => {
            this.updateSelection(1);
        });

        this.input.keyboard.on("keydown-ENTER", () => {
            const selected = this.menuItems[this.selectedIndex].text;
            if (selected === "Resume") {
                this.background.destroy();
                this.scene.stop('PauseScene');
                this.scene.resume('GameScene');
            } else if (selected === "Restart") {
                this.scene.stop('GameScene');
                this.scene.stop('PauseScene');
                this.scene.start('GameScene');
            } else if (selected === "Quit to Title") {
                this.scene.stop('GameScene');
                this.scene.stop('PauseScene');
                this.scene.start('TitleScene');
            }
        });
    }

    updateSelection(change) {
        this.menuItems[this.selectedIndex].setColor("#ffffff");
        this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + change, 0, this.menuItems.length);
        this.menuItems[this.selectedIndex].setColor("#ffff00");
    }
}