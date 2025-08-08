import { Enemy } from './base.js';

export class TurretEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'turret');
    this.weaknessMode = '8mm';
    this.fireEvent = scene.time.addEvent({
      delay: 1500,
      callback: this.fire,
      callbackScope: this,
      loop: true
    });
  }

  fire() {
    const bullet = this.scene.physics.add.image(this.x, this.y, 'bullet');
    bullet.setTint(0xff0000);
    bullet.setGravityY(-this.scene.physics.world.gravity.y);
    this.scene.physics.moveToObject(bullet, this.scene.player, 200);
    this.scene.hazards.add(bullet);
    this.scene.time.addEvent({
      delay: 3000,
      callback: () => bullet.destroy()
    });
  }

  destroy(fromScene) {
    if (this.fireEvent) {
      this.fireEvent.remove(false);
    }
    super.destroy(fromScene);
  }
}
