import { PuzzleSwitch } from '../puzzles/switch.js';
import { LockDoor } from '../puzzles/lockDoor.js';
import { UpgradeItem } from '../items/upgrade.js';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.rooms = {};
    this.roomKeys = [];
    this.unlockedGates = new Set();
  }

  preload(keys) {
    this.roomKeys = keys;
    keys.forEach(key => {
      this.scene.load.json(key, `src/level/rooms/${key}.json`);
    });
  }

  create() {
    this.roomKeys.forEach(key => {
      this.rooms[key] = this.scene.cache.json.get(key);
    });
    this.platforms = this.scene.physics.add.staticGroup();
    this.doors = this.scene.physics.add.staticGroup();
    this.lockDoors = this.scene.physics.add.staticGroup();
    this.switches = this.scene.physics.add.staticGroup();
    this.hazards = this.scene.physics.add.staticGroup();
    this.elevators = this.scene.physics.add.group();
    this.upgrades = this.scene.physics.add.staticGroup();
    this.gates = this.scene.physics.add.staticGroup();
  }

  start(startKey, player) {
    this.player = player;
    this.scene.physics.add.collider(player, this.platforms);
    this.scene.physics.add.collider(player, this.doors);
    this.scene.physics.add.collider(player, this.lockDoors);
    this.scene.physics.add.collider(player, this.elevators);
    this.scene.physics.add.collider(player, this.gates);
    this.scene.physics.add.overlap(player, this.doors, (pl, door) => {
      this.enterRoom(door.target, { x: door.startX, y: door.startY });
    });
    this.scene.physics.add.overlap(player, this.lockDoors, (pl, door) => {
      if (!door.locked) {
        this.enterRoom(door.target, { x: door.startX, y: door.startY });
      }
    });
    this.scene.physics.add.overlap(
      player,
      this.hazards,
      () => this.scene.takeDamage(10)
    );
    this.scene.physics.add.overlap(
      player,
      this.upgrades,
      (pl, up) => {
        up.destroy();
        player.upgrades[up.type] = true;
        this.updateGates();
        this.scene.updateHud();
      }
    );
    this.enterRoom(startKey, { x: player.x, y: player.y });
  }

  enterRoom(key, start) {
    const room = this.rooms[key];
    if (!room) return;
    this.platforms.clear(true, true);
    this.doors.clear(true, true);
    this.lockDoors.clear(true, true);
    this.switches.clear(true, true);
    this.hazards.clear(true, true);
    this.elevators.clear(true, true);
    this.upgrades.clear(true, true);
    this.gates.clear(true, true);

    room.platforms.forEach(p => {
      const platform = this.scene.add
        .rectangle(p.x, p.y, p.width, p.height, 0x888888)
        .setOrigin(0.5, 0.5);
      this.scene.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });

    room.doors.forEach(d => {
      const door = this.scene.add
        .image(d.x, d.y, 'door')
        .setOrigin(0.5, 1);
      if (d.hidden) door.setAlpha(0);
      this.scene.physics.add.existing(door, true);
      door.target = d.target;
      door.startX = d.startX;
      door.startY = d.startY;
      this.doors.add(door);
    });

    (room.upgrades || []).forEach(u => {
      const up = new UpgradeItem(this.scene, u.x, u.y, u.type);
      this.upgrades.add(up);
    });

    (room.gates || []).forEach(g => {
      const gate = this.scene.add
        .image(g.x, g.y, 'door')
        .setOrigin(0.5, 1)
        .setTint(g.codec ? 0x0000ff : 0xffff00);
      this.scene.physics.add.existing(gate, true);
      gate.requiredUpgrade = g.upgrade;
      gate.requiredGate = g.codec;
      this.gates.add(gate);
    });

    const locks = [];
    (room.locks || []).forEach(d => {
      const door = new LockDoor(
        this.scene,
        d.x,
        d.y,
        d.target,
        d.startX,
        d.startY,
        d.hidden
      );
      this.lockDoors.add(door);
      locks.push(door);
    });

    (room.switches || []).forEach(s => {
      const target = locks[s.targetLock];
      const sw = new PuzzleSwitch(this.scene, s.x, s.y, target);
      this.switches.add(sw);
    });

    (room.hazards || []).forEach(h => {
      const hz = this.scene.add
        .rectangle(h.x, h.y, h.width, h.height, 0xff0000)
        .setOrigin(0.5, 0.5);
      this.scene.physics.add.existing(hz, true);
      this.hazards.add(hz);
    });

    (room.elevators || []).forEach(e => {
      const el = this.scene.add
        .rectangle(e.x, e.y, e.width, e.height, 0xaaaaaa)
        .setOrigin(0.5, 0.5);
      this.scene.physics.add.existing(el);
      el.body.setAllowGravity(false);
      el.body.setImmovable(true);
      el.startY = e.y;
      el.distance = e.distance || 100;
      el.speed = e.speed || 50;
      this.elevators.add(el);
    });

    this.updateGates();

    const width = room.width || 800;
    const height = room.height || 600;
    this.scene.cameras.main.setBounds(0, 0, width, height);
    this.scene.physics.world.setBounds(0, 0, width, height);

    if (start) {
      this.player.setPosition(start.x, start.y);
    }
  }

  activateSwitch(player) {
    this.scene.physics.overlap(
      player,
      this.switches,
      (pl, sw) => sw.activate()
    );
  }

  powerElevators() {
    this.elevators.children.iterate(el => {
      if (el.powered) return;
      el.powered = true;
      this.scene.tweens.add({
        targets: el,
        y: el.startY - el.distance,
        duration: (el.distance / el.speed) * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear'
      });
    });
  }

  disableHazards() {
    this.hazards.clear(true, true);
  }

  unlockGate(key) {
    this.unlockedGates.add(key);
    if (key === 'unlock') {
      this.doors.clear(true, true);
    }
    this.updateGates();
    this.scene.updateHud();
  }

  updateGates() {
    this.gates.children.iterate(gate => {
      if (
        (gate.requiredUpgrade && this.player.upgrades[gate.requiredUpgrade]) ||
        (gate.requiredGate && this.unlockedGates.has(gate.requiredGate))
      ) {
        gate.destroy();
      }
    });
  }
}
