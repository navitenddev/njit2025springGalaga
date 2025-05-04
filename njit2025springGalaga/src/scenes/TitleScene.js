import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    this.load.image('background', 'assets/spaceTestImage.jpg');
    this.load.font('mago', 'assets/fonts/mago1.ttf', 'truetype');
    this.load.audio("select", "./assets/select.mp3");
  }

  create() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'background')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 150, 'Shermie Galaga', {
        fontSize: '75px',
        fill: '#ffffff',
        fontFamily: 'mago',
      })
      .setOrigin(0.5);

    this.buttons = [
      this.createButton(this.scale.width / 2, this.scale.height / 2 - 20, 'Start'),
      this.createButton(this.scale.width / 2, this.scale.height / 2 + 60, 'Settings'),
      this.createButton(this.scale.width / 2, this.scale.height / 2 + 140, 'Credits')
    ];

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 240, 'Use arrow keys and SPACE to select', { fontSize: '24px',fill: '#ffffff', fontFamily: 'mago', } ).setOrigin(0.5);
    this.selectedButtonIndex = 0;
    this.selectButton(this.selectedButtonIndex);

    this.input.keyboard.on('keydown-UP', () => {
      this.sound.play('select');
      this.selectedButtonIndex =
        (this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length;
      this.selectButton(this.selectedButtonIndex);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.sound.play('select');
      this.selectedButtonIndex =
        (this.selectedButtonIndex + 1) % this.buttons.length;
      this.selectButton(this.selectedButtonIndex);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.buttons[this.selectedButtonIndex].emit('pointerdown');
    });
  }

  createButton(x, y, label) {
    const button = this.add
      .text(x, y, label, {
        fontSize: '50px',
        fill: '#ffffff',
        fontFamily: 'mago',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      button.on('pointerdown', () => {
      if (label === 'Start' || label === 'Settings') {
        this.scene.start('GameScene');
      } else if (label === 'Credits') {
        this.scene.start('CreditsScene');
      }
    });

    return button;
  }

  selectButton(index) {
    this.buttons.forEach((button) => button.clearTint());
    this.buttons[index].setTint(0x66ff7f);
  }
}
