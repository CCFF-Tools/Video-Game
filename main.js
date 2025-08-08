import { config } from './config.js';
import { PopsicleEnemy } from './popsicle.js';
import { CodecItem, CODEC_FUSIONS } from './codec.js';

function percentToTimecode(percent) {
  const totalFrames = Math.floor((percent / 100) * 60 * 24);
  const seconds = Math.floor(totalFrames / 24);
  const frames = totalFrames % 24;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(secs).padStart(2, '0') +
    ':' +
    String(frames).padStart(2, '0')
  );
}

const FORMAT_MODES = {
  Betamax: {
    filter: 'contrast(0.7) sepia(0.9)',
    tint: 0x8b6d56,
    speed: 0.7,
    jump: 0.8,
    gravity: 900
  },
  '8mm': {
    filter: 'grayscale(1) blur(1px)',
    tint: 0xe0d0b0,
    speed: 0.8,
    jump: 0.9,
    gravity: 850
  },
  MPEG2: {
    filter: 'saturate(1.4) contrast(1.1)',
    tint: 0xaaddff,
    speed: 1,
    jump: 1,
    gravity: 800
  },
  MiniDV: {
    filter: 'brightness(1.2) contrast(1.2)',
    tint: 0xfff0ff,
    speed: 1.2,
    jump: 1.1,
    gravity: 750
  }
};

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
    g.clear();
    g.fillRect(0, 0, 16, 16);
    g.generateTexture('codec', 16, 16);
    g.clear();
    g.fillStyle(0x444444, 1);
    g.fillRect(0, 0, 40, 80);
    g.generateTexture('door', 40, 80);
    g.destroy();
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

    this.modeKeys = this.input.keyboard.addKeys({
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR
    });

    const worldWidth = Math.max(1600, x + 200);
    this.cameras.main.setBounds(0, 0, worldWidth, 600);
    this.physics.world.setBounds(0, 0, worldWidth, 600);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.playbackIntegrity = 100;
    this.energy = 100;
    this.integrityText = this.add
      .text(16, 16, '', { fontSize: '16px', color: '#0f0' })
      .setScrollFactor(0);
    this.energyText = this.add
      .text(16, 36, '', { fontSize: '16px', color: '#0ff' })
      .setScrollFactor(0);

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
    this.physics.add.collider(
      this.player,
      this.popsicles,
      () => this.takeDamage(10)
    );
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
        this.takeDamage(5);
        this.time.addEvent({
          delay: 500,
          callback: () => player.clearTint()
        });
      }
    );

    this.inventory = [];
    this.codecs = this.physics.add.group({ classType: CodecItem });
    this.codecs.add(new CodecItem(this, 300, 520, 'H264'));
    this.codecs.add(new CodecItem(this, 500, 520, 'AAC'));
    this.codecs.add(new CodecItem(this, 700, 520, 'VP9'));
    this.codecs.add(new CodecItem(this, 900, 520, 'OGG'));
    this.physics.add.overlap(
      this.player,
      this.codecs,
      (player, codec) => {
        this.inventory.push(codec.name);
        codec.destroy();
      }
    );
    this.door = this.physics.add
      .staticImage(1100, 488, 'door')
      .setOrigin(0.5, 1);
    this.physics.add.collider(this.player, this.door);
    this.fuseKey = this.input.keyboard.addKey('F');

    this.setMode('Betamax');
    this.updateHud();
  }

  setMode(name) {
    const mode = FORMAT_MODES[name];
    if (!mode) return;
    this.currentMode = name;
    this.game.canvas.style.filter = mode.filter;
    this.physics.world.gravity.y = mode.gravity;
    this.moveAccel = 600 * mode.speed;
    this.jumpVelocity = -400 * mode.jump;
    this.player.setMaxVelocity(
      300 * mode.speed,
      500 * mode.jump
    );
    this.player.setTint(mode.tint);
    this.bgFar.setTint(mode.tint);
    this.bgMid.setTint(mode.tint);
    this.ground.children.iterate(child => child.setTint(mode.tint));
  }

  updateHud() {
    this.integrityText.setText(
      `INT ${percentToTimecode(this.playbackIntegrity)}`
    );
    this.energyText.setText(`NRG ${percentToTimecode(this.energy)}`);
  }

  takeDamage(amount) {
    this.playbackIntegrity = Math.max(
      0,
      this.playbackIntegrity - amount
    );
  }

  useEnergy(amount) {
    if (this.energy < amount) return false;
    this.energy -= amount;
    return true;
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.modeKeys.one)) {
      this.setMode('Betamax');
    } else if (Phaser.Input.Keyboard.JustDown(this.modeKeys.two)) {
      this.setMode('8mm');
    } else if (Phaser.Input.Keyboard.JustDown(this.modeKeys.three)) {
      this.setMode('MPEG2');
    } else if (Phaser.Input.Keyboard.JustDown(this.modeKeys.four)) {
      this.setMode('MiniDV');
    }

    const onGround = this.player.body.blocked.down;
    this.player.setDragX(onGround ? 1000 : 50);

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-this.moveAccel);
      this.player.anims.play('left', true);
      this.player.lastDir = -1;
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(this.moveAccel);
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
    if (Phaser.Input.Keyboard.JustDown(this.fuseKey)) {
      this.fuseCodecs();
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(this.jumpVelocity);
    }

    this.energy = Math.min(100, this.energy + 0.05);
    this.updateHud();
  }

  fireBullet(flavor) {
    if (!this.useEnergy(5)) return;
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

  fuseCodecs() {
    if (this.inventory.length < 2) return;
    const a = this.inventory.shift();
    const b = this.inventory.shift();
    const key = `${a}+${b}`;
    const key2 = `${b}+${a}`;
    const result = CODEC_FUSIONS[key] || CODEC_FUSIONS[key2];
    if (result === 'unlock') {
      if (this.door) this.door.destroy();
    } else if (result === 'hallucination') {
      this.game.canvas.style.filter = 'hue-rotate(180deg)';
      this.time.addEvent({
        delay: 1000,
        callback: () => this.setMode(this.currentMode)
      });
    } else {
      this.cameras.main.shake(500, 0.01);
      this.player.setTint(0xff0000);
      this.time.addEvent({
        delay: 500,
        callback: () => this.player.clearTint()
      });
      this.takeDamage(10);
    }
  }
}

config.scene = TestScene;

new Phaser.Game(config);

