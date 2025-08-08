import { Enemy } from './base.js';

export class DroneEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'drone');
    this.body.allowGravity = false;
    this.speed = 100;
    this.direction = 1;
    this.weaknessFlavor = 'fire';
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.setVelocityX(this.speed * this.direction);
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
    }
  }
}
