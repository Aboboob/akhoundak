import * as THREE from 'three';

// ۱۰ رنگ مصنوعی + رنگین‌کمانی
const DILDO_COLORS = [
  0xff69b4, // صورتی داغ
  0xff1493, // صورتی تند
  0x9b59b6, // بنفش
  0x3498db, // آبی
  0x1abc9c, // فیروزه‌ای
  0x2ecc71, // سبز
  0xf1c40f, // زرد
  0xe67e22, // نارنجی
  0xe74c3c, // قرمز
  0xecf0f1, // سفید مات
];

const RAINBOW_ID = 'rainbow';

function createRainbowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 64, 0);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(0.17, '#ff7f00');
  gradient.addColorStop(0.33, '#ffff00');
  gradient.addColorStop(0.5, '#00ff00');
  gradient.addColorStop(0.67, '#0000ff');
  gradient.addColorStop(0.83, '#4b0082');
  gradient.addColorStop(1, '#9400d3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 8);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  return tex;
}

let rainbowTexture = null;

export default {
  id: 'dildo',
  name: 'دیلدو',
  emoji: '🍆',
  isMelee: false,
  damage: 18,
  fireRate: 0.28,
  speed: 14,
  count: 1,
  spread: 0.04,
  stunTime: 0.55,
  messages: [
    'دیلدو؟؟ 😂',
    'این دیگه چیه؟!',
    'وای خدااا!',
    'رنگین‌کمان اومد!',
    'تپل و رنگی!'
  ],
  particleColor: 0xff69b4,
  projectileType: 'dildo',

  createMesh() {
    // ۳۰٪ شانس رنگین‌کمانی، بقیه رنگ‌های جامد
    const isRainbow = Math.random() < 0.30;

    const group = new THREE.Group();

    // بدنه اصلی (استوانه کمی خمیده)
    const bodyGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.95, 12);
    let bodyMat;

    if (isRainbow) {
      if (!rainbowTexture) rainbowTexture = createRainbowTexture();
      bodyMat = new THREE.MeshStandardMaterial({
        map: rainbowTexture,
        roughness: 0.35,
        metalness: 0.15
      });
    } else {
      const color = DILDO_COLORS[Math.floor(Math.random() * DILDO_COLORS.length)];
      bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.1
      });
    }

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.1;
    body.castShadow = true;
    group.add(body);

    // نوک گرد
    const tipGeo = new THREE.SphereGeometry(0.155, 12, 10);
    const tip = new THREE.Mesh(tipGeo, bodyMat);
    tip.position.y = 0.62;
    tip.scale.set(1, 0.85, 1);
    tip.castShadow = true;
    group.add(tip);

    // پایه کمی پهن‌تر
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.18, 12);
    const base = new THREE.Mesh(baseGeo, bodyMat);
    base.position.y = -0.42;
    base.castShadow = true;
    group.add(base);

    // کمی چرخش تصادفی برای طبیعی‌تر شدن
    group.rotation.z = (Math.random() - 0.5) * 0.4;
    group.rotation.x = (Math.random() - 0.5) * 0.3;

    return group;
  }
};
