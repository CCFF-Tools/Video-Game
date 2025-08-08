export class PopsicleEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, flavor) {
    super(scene, x, y, 'popsicle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.flavor = flavor;
    this.state = 'solid';
    this.setTint(PopsicleEnemy.FLAVOR_TINTS[flavor] || 0xffffff);
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    this.dripEvent = scene.time.addEvent({
      delay: 2000,
      callback: this.drip,
      callbackScope: this,
      loop: true
    });
  }

  static FLAVOR_TINTS = {
    cherry: 0xff0000,
    lime: 0x00ff00,
    blueberry: 0x0000ff
  };

  static FLAVOR_WEAKNESS = {
    cherry: 'fire',
    lime: 'ice',
    blueberry: 'fire'
  };

  drip() {
    if (this.state !== 'solid') return;
    const drop = this.scene.physics.add.image(
      this.x,
      this.y + 20,
      'drip'
    );
    drop.setTint(this.tintTopLeft);
    drop.setVelocityY(200);
    drop.setGravityY(0);
    this.scene.time.addEvent({
      delay: 4000,
      callback: () => drop.destroy()
    });
    this.scene.drops.add(drop);
  }

  hit(flavor) {
    if (this.state !== 'solid') return;
    if (PopsicleEnemy.FLAVOR_WEAKNESS[this.flavor] === flavor) {
      this.melt();
    } else {
      this.freeze();
    }
  }

  melt() {
    this.state = 'collection';
    this.disableBody(true, false);
    const particles = this.scene.add.particles('drip');
    particles.setTint(this.tintTopLeft);
    particles.createEmitter({
      x: this.x,
      y: this.y,
      speed: { min: -50, max: 50 },
      lifespan: 800,
      quantity: 20
    });
    this.scene.time.addEvent({
      delay: 600,
      callback: this.crystallize,
      callbackScope: this
    });
  }

  crystallize() {
    this.state = 'crystallizing';
    this.scene.time.addEvent({
      delay: 600,
      callback: this.scaffold,
      callbackScope: this
    });
  }

  scaffold() {
    this.state = 'scaffold';
    this.scene.time.addEvent({
      delay: 600,
      callback: this.reassemble,
      callbackScope: this
    });
  }

  reassemble() {
    this.state = 'reassembly';
    this.scene.time.addEvent({
      delay: 600,
      callback: this.calibrate,
      callbackScope: this
    });
  }

  calibrate() {
    this.state = 'calibration';
    this.scene.time.addEvent({
      delay: 600,
      callback: this.release,
      callbackScope: this
    });
  }

  release() {
    if (Math.random() < 0.2) {
      this.recycle();
      return;
    }
    this.enableBody(true, this.x, this.y, true, true);
    this.state = 'solid';
    this.setScale(0);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 800
    });
  }

  recycle() {
    this.state = 'recycled';
    this.dripEvent.remove(false);
    this.destroy();
  }

  freeze() {
    this.state = 'frozen';
    this.setTint(0x99ccff);
    this.setVelocity(0, 0);
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.state = 'solid';
        this.setTint(
          PopsicleEnemy.FLAVOR_TINTS[this.flavor] || 0xffffff
        );
      }
    });
  }
}
