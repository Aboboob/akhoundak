import * as THREE from 'three';

export default {
  id: 'smg',
  name: 'رگبار',
  emoji: '💥',
  isMelee: false,
  damage: 26,
  fireRate: 0.07,
  speed: 26,
  count: 3,
  spread: 0.1,
  stunTime: 0.65,
  messages: ['رگباررر!', 'وای خدا!'],
  particleColor: 0xff6644,
  projectileType: 'bullet',

  createMesh() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffee44 })
    );
  }
};
