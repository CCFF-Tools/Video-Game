import { config } from './config.js';
import { PopsicleEnemy } from './popsicle.js';

class TestScene extends Phaser.Scene {
  constructor() {
    super('test');
  }

  preload() {
    this.load.text('script', 'script.txt');
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

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 32, 4, 8);
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 20, 32);
    g.generateTexture('popsicle', 20, 40);
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('bullet', 8, 8);
    g.clear();
    g.fillCircle(2, 2, 2);
    g.generateTexture('drip', 4, 4);
    g.destroy();
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

    this.ground = this.physics.add.staticGroup();
    this.ground
      .create(400, 568, 'ground')
      .setScale(2)
      .refreshBody();
    this.ground
      .create(1200, 568, 'ground')
      .setScale(2)
      .refreshBody();

    const script = this.cache.text.get('script');
    const lines = script
      ? script.trim().split('\n')
      : [
          'Default platform 1',
          'Default platform 2',
          'Default platform 3'
        ];

    const textPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    let x = 200;
    lines.forEach((line, i) => {
      const y = 400 - i * 80;
      const text = this.add
        .text(x, y, line, {
          fontSize: '20px',
          color: '#fff',
          backgroundColor: '#000'
        })
        .setPadding(4);
      this.physics.add.existing(text);
      text.body.setAllowGravity(false);
      text.body.setImmovable(true);
      textPlatforms.add(text);
      x += text.width + 50;
    });

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1000);
    this.player.setMaxVelocity(300, 500);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, textPlatforms);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey('Z');
    this.iceKey = this.input.keyboard.addKey('X');

    const worldWidth = Math.max(1600, x + 200);
    this.cameras.main.setBounds(0, 0, worldWidth, 600);
    this.physics.world.setBounds(0, 0, worldWidth, 600);
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

    this.bullets = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.popsicles = this.physics.add.group({
      classType: PopsicleEnemy,
      runChildUpdate: true
    });
    this.popsicles.add(new PopsicleEnemy(this, 600, 450, 'cherry'));
    this.popsicles.add(new PopsicleEnemy(this, 800, 450, 'lime'));
    this.physics.add.collider(this.popsicles, this.ground);
    this.physics.add.collider(this.drops, this.ground, drop => drop.destroy());
    this.physics.add.overlap(
      this.bullets,
      this.popsicles,
      (popsicle, bullet) => {
        popsicle.hit(bullet.flavor);
        bullet.destroy();
      }
    );
    this.physics.add.overlap(
      this.player,
      this.drops,
      (player, drop) => {
        drop.destroy();
        player.setTint(0x9999ff);
        this.time.addEvent({
          delay: 500,
          callback: () => player.clearTint()
        });
      }
    );
  }

  update() {
    const onGround = this.player.body.blocked.down;
    this.player.setDragX(onGround ? 1000 : 50);

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-600);
      this.player.anims.play('left', true);
      this.player.lastDir = -1;
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(600);
      this.player.anims.play('right', true);
      this.player.lastDir = 1;
    } else {
      this.player.setAccelerationX(0);
      this.player.anims.play('turn', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      this.fireBullet('fire');
    }
    if (Phaser.Input.Keyboard.JustDown(this.iceKey)) {
      this.fireBullet('ice');
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-400);
    }
  }

  fireBullet(flavor) {
    const bullet = this.physics.add.image(
      this.player.x,
      this.player.y,
      'bullet'
    );
    bullet.setTint(flavor === 'fire' ? 0xffa500 : 0x00ffff);
    bullet.flavor = flavor;
    const dir = this.player.lastDir || 1;
    bullet.setVelocityX(400 * dir);
    bullet.setGravityY(-this.physics.world.gravity.y);
    this.time.addEvent({
      delay: 2000,
      callback: () => bullet.destroy()
    });
    this.bullets.add(bullet);
  }
}

config.scene = TestScene;

new Phaser.Game(config);

