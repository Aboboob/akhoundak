import * as THREE from 'three';

export default {
  id: 'colt',
  name: 'کلت',
  emoji: '🔫',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 20,
  count: 1,
  spread: 0.035,
  stunTime: 0.4,
  messages: ['تیر خوردم!', 'اسلحه؟!'],
  particleColor: 0xff6644,
  projectileType: 'bullet',

  createMesh() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffee44 })
    );
  }
};
