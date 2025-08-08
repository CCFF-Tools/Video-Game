export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  hit(flavor, mode) {
    if (this.weaknessFlavor && flavor === this.weaknessFlavor) {
      this.destroy();
    } else if (this.weaknessMode && mode === this.weaknessMode) {
      this.destroy();
    }
  }
}
