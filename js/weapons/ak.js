import * as THREE from 'three';

export default {
  id: 'ak',
  name: 'کلاش',
  emoji: '🔫',
  isMelee: false,
  damage: 26,
  fireRate: 0.11,
  speed: 30,
  count: 2,
  spread: 0.035,
  stunTime: 0.65,
  messages: ['کلاش؟؟', 'این دیگه زیادیه!'],
  particleColor: 0xff6644,
  projectileType: 'bullet',

  createMesh() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffee44 })
    );
  }
};
