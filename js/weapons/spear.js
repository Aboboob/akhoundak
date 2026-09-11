import * as THREE from 'three';

export default {
  id: 'spear',
  name: 'نیزه',
  emoji: '🗡️',
  isMelee: false,
  damage: 15,
  fireRate: 0.2,
  speed: 13,
  count: 1,
  spread: 0,
  stunTime: 0.4,
  messages: ['نیزه؟!', 'سوراخ شدم!'],
  particleColor: 0xff6644,
  projectileType: 'spear',

  createMesh() {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    return mesh;
  }
};
