import * as THREE from 'three';

export default {
  id: 'whip',
  name: 'شلاق',
  emoji: '🪢',
  isMelee: true,
  damage: 9,
  fireRate: 0,
  speed: 0,
  count: 1,
  stunTime: 0.4,
  messages: ['آخ!', 'وای پشتم!', 'شلاق نخور!'],
  particleColor: 0xff6644,

  createMesh() {
    // Whip is handled specially with chain of spheres
    return null;
  }
};
