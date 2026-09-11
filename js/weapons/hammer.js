import * as THREE from 'three';

export default {
  id: 'hammer',
  name: 'چکش',
  emoji: '🔨',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['چکش روی سرم!', 'مغزم ترکید!'],
  particleColor: 0xff6644,
  projectileType: 'hammer',

  createMesh() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
    ));
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.25, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    head.position.y = 0.42;
    g.add(head);
    g.castShadow = true;
    return g;
  }
};
