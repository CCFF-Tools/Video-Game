import { config } from './config.js';

class TestScene extends Phaser.Scene {
  constructor() {
    super('test');
  }

  preload() {
    this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
  }

  create() {
    this.logo = this.add.sprite(400, 300, 'logo');
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 2;

    if (this.cursors.left.isDown) {
      this.logo.x -= speed;
    } else if (this.cursors.right.isDown) {
      this.logo.x += speed;
    }

    if (this.cursors.up.isDown) {
      this.logo.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.logo.y += speed;
    }
  }
}

config.scene = TestScene;

new Phaser.Game(config);
