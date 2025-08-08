import { config } from './config.js';

const MODES = {
  betamax: {
    filter: 'grayscale(1)',
    playerTint: 0x999999,
    bgTint: 0x666666,
    move: 400,
    jump: -300,
    gravity: 800,
    maxX: 180,
    maxY: 500
  },
  eightmm: {
    filter: 'sepia(0.8)',
    playerTint: 0xffcc99,
    bgTint: 0xffddaa,
    move: 350,
    jump: -260,
    gravity: 600,
    maxX: 160,
    maxY: 450
  },
  mpeg2: {
    filter: 'saturate(2) contrast(1.2)',
    playerTint: 0x99ff99,
    bgTint: 0xbbffbb,
    move: 500,
    jump: -340,
    gravity: 900,
    maxX: 220,
    maxY: 520
  },
  minidv: {
    filter: 'brightness(1.2) saturate(1.2)',
    playerTint: 0x99ccff,
    bgTint: 0xbbddff,
    move: 450,
    jump: -320,
    gravity: 700,
    maxX: 200,
    maxY: 480
  }
};

class TestScene extends Phaser.Scene {
  constructor() {
    super('test');
  }

  preload() {
    this.load.image(
      'bg-far',
      'https://labs.phaser.io/assets/skies/space3.png'
    );
    this.load.image(
      'bg-mid',
      'https://labs.phaser.io/assets/skies/sky4.png'
    );
    this.load.image(
      'ground',
      'https://labs.phaser.io/assets/sprites/platform.png'
    );
    this.load.spritesheet(
      'dude',
      'https://labs.phaser.io/assets/sprites/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    this.bgFar = this.add
      .image(0, 0, 'bg-far')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDisplaySize(1600, 600);
    this.bgMid = this.add
      .image(0, 0, 'bg-mid')
      .setOrigin(0)
      .setScrollFactor(0.3)
      .setDisplaySize(1600, 600);

    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(400, 568, 'ground')
      .setScale(2)
      .refreshBody();
    this.platforms
      .create(1200, 568, 'ground')
      .setScale(2)
      .refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1000);
    this.player.setMaxVelocity(300, 500);

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.modeKeys = this.input.keyboard.addKeys({
      betamax: Phaser.Input.Keyboard.KeyCodes.ONE,
      eightmm: Phaser.Input.Keyboard.KeyCodes.TWO,
      mpeg2: Phaser.Input.Keyboard.KeyCodes.THREE,
      minidv: Phaser.Input.Keyboard.KeyCodes.FOUR
    });

    this.cameras.main.setBounds(0, 0, 1600, 600);
    this.physics.world.setBounds(0, 0, 1600, 600);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 0,
        end: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 5,
        end: 8
      }),
      frameRate: 10,
      repeat: -1
    });

    this.applyMode('betamax');
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.modeKeys.betamax)) {
      this.applyMode('betamax');
    }
    if (Phaser.Input.Keyboard.JustDown(this.modeKeys.eightmm)) {
      this.applyMode('eightmm');
    }
    if (Phaser.Input.Keyboard.JustDown(this.modeKeys.mpeg2)) {
      this.applyMode('mpeg2');
    }
    if (Phaser.Input.Keyboard.JustDown(this.modeKeys.minidv)) {
      this.applyMode('minidv');
    }

    const onGround = this.player.body.blocked.down;
    this.player.setDragX(onGround ? 1000 : 50);

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-this.moveAccel);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(this.moveAccel);
      this.player.anims.play('right', true);
    } else {
      this.player.setAccelerationX(0);
      this.player.anims.play('turn', true);
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(this.jumpVel);
    }
  }

  applyMode(name) {
    const mode = MODES[name];
    if (!mode) return;
    this.game.canvas.style.filter = mode.filter;
    this.bgFar.setTint(mode.bgTint);
    this.bgMid.setTint(mode.bgTint);
    this.platforms.children.iterate(child => {
      child.setTint(mode.bgTint);
    });
    this.player.setTint(mode.playerTint);
    this.physics.world.gravity.y = mode.gravity;
    this.player.setMaxVelocity(mode.maxX, mode.maxY);
    this.moveAccel = mode.move;
    this.jumpVel = mode.jump;
  }
}

config.scene = TestScene;

new Phaser.Game(config);

