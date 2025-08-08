export class LockDoor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, target, startX, startY, hidden) {
    super(scene, x, y, 'door');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    this.target = target;
    this.startX = startX;
    this.startY = startY;
    this.locked = true;
    if (hidden) this.setAlpha(0);
    this.setTint(0xff0000);
  }

  unlock() {
    this.locked = false;
    this.clearTint();
    this.setAlpha(1);
  }
}
