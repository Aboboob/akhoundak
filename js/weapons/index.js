import whip from './whip.js';
import colt from './colt.js';
import smg from './smg.js';
import ak from './ak.js';
import slipper from './slipper.js';
import poop from './poop.js';
import spear from './spear.js';
import hammer from './hammer.js';
import banana from './banana.js';
import rock from './rock.js';
import tomato from './tomato.js';
import egg from './egg.js';
import dildo from './dildo.js';

export const WEAPONS = [
  whip, colt, smg, ak, slipper, poop,
  spear, hammer, banana, rock, tomato, egg, dildo
];

export const WEAPON_MAP = Object.fromEntries(
  WEAPONS.map(w => [w.id, w])
);

export function getWeapon(id) {
  return WEAPON_MAP[id] || whip;
}

export function createProjectileMesh(type) {
  const weapon = WEAPON_MAP[type];
  if (weapon && weapon.createMesh) {
    const mesh = weapon.createMesh();
    if (mesh) mesh.castShadow = true;
    return mesh;
  }
  // fallback bullet
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffee44 })
  );
}
