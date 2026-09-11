import * as THREE from 'three';

export default {
  id: 'poop',
  name: 'پیپی',
  emoji: '💩',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['ییییاک!', 'گوه؟؟؟'],
  particleColor: 0x5d4037,
  projectileType: 'poop',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    mesh.castShadow = true;
    return mesh;
  }
};
