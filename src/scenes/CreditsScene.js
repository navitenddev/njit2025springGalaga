import Phaser from 'phaser';

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {

    const creditsText = [
      'Created by',
      'Jacqueline (Kie) Li',
      'Ryan Kulfan',
      'Alex Ack',
      'Anthony Armijos',
      'Aniket Raj',
      '',
      'Sponsored by',
      'navitend',
      '',
      'Press SPACE or ENTER to return'
    ];

    this.add.text(this.scale.width / 2, this.scale.height / 2 - 150, creditsText.join('\n'), {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'mago',
    align: 'center'
  })
  .setOrigin(0.5);

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('TitleScene');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('TitleScene');
    });
  }
}

export default CreditsScene;