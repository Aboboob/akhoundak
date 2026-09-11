import * as THREE from 'three';

export default {
  id: 'banana',
  name: 'موز',
  emoji: '🍌',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['موز؟ 🍌', 'سُر خوردم!'],
  particleColor: 0xff6644,
  projectileType: 'banana',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.08, 6, 10, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf5d76e })
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    return mesh;
  }
};
