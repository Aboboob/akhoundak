import * as THREE from 'three';

export default {
  id: 'rock',
  name: 'سنگ',
  emoji: '🪨',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['سنگ!', 'سرم شکست!'],
  particleColor: 0xff6644,
  projectileType: 'rock',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.26, 0),
      new THREE.MeshStandardMaterial({ color: 0x6a6a6a, flatShading: true })
    );
    mesh.castShadow = true;
    return mesh;
  }
};
