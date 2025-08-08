export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.rooms = {};
    this.roomKeys = [];
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
  }

  start(startKey, player) {
    this.player = player;
    this.scene.physics.add.collider(player, this.platforms);
    this.scene.physics.add.collider(player, this.doors);
    this.scene.physics.add.overlap(
      player,
      this.doors,
      (pl, door) => {
        this.enterRoom(door.target, { x: door.startX, y: door.startY });
      }
    );
    this.enterRoom(startKey, { x: player.x, y: player.y });
  }

  enterRoom(key, start) {
    const room = this.rooms[key];
    if (!room) return;
    this.platforms.clear(true, true);
    this.doors.clear(true, true);

    room.platforms.forEach(p => {
      const platform = this.scene.add
        .rectangle(p.x, p.y, p.width, p.height, 0x888888)
        .setOrigin(0.5, 0.5);
      this.scene.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });

    room.doors.forEach(d => {
      const door = this.scene.add.image(d.x, d.y, 'door').setOrigin(0.5, 1);
      if (d.hidden) door.setAlpha(0);
      this.scene.physics.add.existing(door, true);
      door.target = d.target;
      door.startX = d.startX;
      door.startY = d.startY;
      this.doors.add(door);
    });

    const width = room.width || 800;
    const height = room.height || 600;
    this.scene.cameras.main.setBounds(0, 0, width, height);
    this.scene.physics.world.setBounds(0, 0, width, height);

    if (start) {
      this.player.setPosition(start.x, start.y);
    }
  }
}
