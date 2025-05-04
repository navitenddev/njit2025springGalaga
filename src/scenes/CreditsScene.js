import Phaser from 'phaser';

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  preload() {
    if (!this.sound.get('menuMusic')) {
      this.load.audio('menuMusic', 'assets/menuMusic.wav');
    }
  }
  

  create() {

    const gameMusic = this.sound.get('gameMusic');
    if (gameMusic && gameMusic.isPlaying) {
        gameMusic.stop();              
        this.registry.set('isGameMusicPlaying', false);
    }
    
    let menuMusic = this.sound.get('menuMusic');
    if (!menuMusic) {
        menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
        menuMusic.play();
        this.registry.set('isMenuMusicPlaying', true);
    } else if (!menuMusic.isPlaying) {
        menuMusic.play();
        this.registry.set('isMenuMusicPlaying', true);
    }

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