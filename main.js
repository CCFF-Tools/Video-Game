import { config } from './config.js';

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
    this.add
      .image(0, 0, 'bg-far')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDisplaySize(1600, 600);
    this.add
      .image(0, 0, 'bg-mid')
      .setOrigin(0)
      .setScrollFactor(0.3)
      .setDisplaySize(1600, 600);

    const platforms = this.physics.add.staticGroup();
    platforms
      .create(400, 568, 'ground')
      .setScale(2)
      .refreshBody();
    platforms
      .create(1200, 568, 'ground')
      .setScale(2)
      .refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(800);
    this.player.setMaxVelocity(200, 500);

    this.physics.add.collider(this.player, platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.shiftKey = this.input.keyboard.addKey('T');

    this.timeObjects = this.physics.add.group();
    const block = this.physics.add.image(400, 300, 'ground');
    block.setData('states', {
      past: {
        x: 400,
        y: 300,
        tint: 0x00ffff,
        immovable: true,
        gravity: false
      },
      future: {
        tint: 0xff0000,
        immovable: false,
        gravity: true
      }
    });
    this.applyState(block, 'past');
    this.timeObjects.add(block);
    this.physics.add.collider(this.player, block);

    this.cameras.main.setBounds(0, 0, 1600, 600);
    this.physics.world.setBounds(0, 0, 1600, 600);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
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
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
  }

  applyState(obj, state) {
    const data = obj.getData('states')[state];
    obj.setTint(data.tint);
    obj.setImmovable(data.immovable);
    obj.body.setAllowGravity(data.gravity);
    if (state === 'past') {
      obj.setPosition(data.x, data.y);
      obj.body.setVelocity(0, 0);
    }
    obj.setData('activeState', state);
  }

  update() {
    const onGround = this.player.body.blocked.down;
    this.player.setDragX(onGround ? 800 : 50);

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-600);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(600);
      this.player.anims.play('right', true);
    } else {
      this.player.setAccelerationX(0);
      this.player.anims.play('turn', true);
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-400);
    }

    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
      this.timeObjects.children.iterate(obj => {
        const current = obj.getData('activeState');
        const next = current === 'past' ? 'future' : 'past';
        this.applyState(obj, next);
      });
    }
  }
}

config.scene = TestScene;

new Phaser.Game(config);
