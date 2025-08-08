export class UpgradeItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'upgrade');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = type;
    this.body.setAllowGravity(false);
  }
}
