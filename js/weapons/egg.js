import * as THREE from 'three';

export default {
  id: 'egg',
  name: 'تخم‌مرغ',
  emoji: '🥚',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['تخم‌مرغ?!', 'زرده پاشید!'],
  particleColor: 0xf5f0d8,
  projectileType: 'egg',

  createMesh() {
    const geo = new THREE.SphereGeometry(0.2, 10, 8);
    geo.scale(1, 1.3, 1);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0xf5f0d8 })
    );
    mesh.castShadow = true;
    return mesh;
  }
};
