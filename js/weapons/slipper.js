import * as THREE from 'three';

export default {
  id: 'slipper',
  name: 'دمپایی',
  emoji: '🩴',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['دمپایی؟ 😂', 'دمپایی مادر!'],
  particleColor: 0xff6644,
  projectileType: 'slipper',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xe8a060 })
    );
    mesh.castShadow = true;
    return mesh;
  }
};
