export class PuzzleSwitch extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, target) {
    super(scene, x, y, 20, 20, 0x999999);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 0.5);
    this.target = target;
    this.activated = false;
  }

  activate() {
    if (this.activated) return;
    this.activated = true;
    this.setFillStyle(0x00ff00);
    if (this.target && this.target.unlock) {
      this.target.unlock();
    }
  }
}
