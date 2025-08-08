export const CODEC_FUSIONS = {
  'H264+AAC': 'unlock',
  'VP9+OGG': 'hallucination',
  'H264+VP9': 'switch',
  'AAC+OGG': 'elevator',
  'H264+OGG': 'hazard'
};

export class CodecItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, 'codec');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.name = name;
    this.body.setAllowGravity(false);
    this.setTint(CodecItem.COLORS[name] || 0xffffff);
  }
}

CodecItem.COLORS = {
  H264: 0xffaa00,
  AAC: 0x00aaff,
  VP9: 0x33dd33,
  OGG: 0xaa33aa
};
