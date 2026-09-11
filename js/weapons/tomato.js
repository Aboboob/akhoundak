import * as THREE from 'three';

export default {
  id: 'tomato',
  name: 'گوجه',
  emoji: '🍅',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['گوجه؟ 🍅'],
  particleColor: 0xe53935,
  projectileType: 'tomato',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xe53935 })
    );
    mesh.castShadow = true;
    return mesh;
  }
};
