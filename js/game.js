import * as THREE from 'three';
import { WEAPONS, getWeapon, createProjectileMesh } from './weapons/index.js';

const hitCountEl = document.getElementById('hitCount');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const msgEl = document.getElementById('msg');
const comboEl = document.getElementById('combo');
const comboNumEl = document.getElementById('comboNum');
const titleBadge = document.getElementById('titleBadge');
const weaponsEl = document.getElementById('weapons');
const container = document.getElementById('game');
const crosshairEl = document.getElementById('crosshair');
const modeBtn = document.getElementById('modeBtn');
const joystickEl = document.getElementById('joystick');
const joyKnob = document.getElementById('joyKnob');
const hintEl = document.getElementById('hint');

let hits=0, score=0, level=1, combo=0, comboTimer=0, lastHit=0;
let currentWeapon='whip', shooting=false, shootTimer=0;
let mouse={x:0,y:0}, freeMode=false;
let joy={active:false, dx:0, dy:0}; // -1..1

// برای شلیک و فرار از نقطه کلیک
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const lastClickPos = new THREE.Vector3(0, 1, 0);

WEAPONS.forEach(w=>{
  const b=document.createElement('button');
  b.className='wpn'+(w.id==='whip'?' active':'');
  b.innerHTML=w.emoji+' '+w.name;
  b.onclick=e=>{e.stopPropagation();currentWeapon=w.id;document.querySelectorAll('.wpn').forEach(x=>x.classList.remove('active'));b.classList.add('active');};
  weaponsEl.appendChild(b);
});

const TITLES=[{min:0,t:'تازه‌کار'},{min:6,t:'شلاق‌زن'},{min:15,t:'شکارچی'},{min:28,t:'استاد تعقیب'},{min:45,t:'کابوس عمامه'},{min:65,t:'افسانه فرار'},{min:90,t:'خدای دمپایی'},{min:120,t:'امپراتور آخوندک'}];
function updateTitle(){let t=TITLES[0].t;for(const i of TITLES)if(hits>=i.min)t=i.t;titleBadge.textContent='🏅 '+t;titleBadge.style.opacity=1;}

modeBtn.onclick=()=>{
  freeMode=!freeMode;
  if(freeMode){
    modeBtn.textContent='🎯 حالت تعقیب';
    modeBtn.style.background='rgba(180,60,0,.8)';
    joystickEl.style.display='block';
    crosshairEl.classList.add('hidden');
    hintEl.textContent='جوی‌استیک = حرکت • کلیک = شلیک';
    char.vel.x=0;char.vel.z=0;
  }else{
    modeBtn.textContent='🎮 کنترل آخوند';
    modeBtn.style.background='rgba(0,80,180,.75)';
    joystickEl.style.display='none';
    crosshairEl.classList.remove('hidden');
    hintEl.textContent='کلیک = شلیک • دکمه بالا = تعویض حالت';
    joy.dx=0;joy.dy=0;joy.active=false;
    joyKnob.style.margin='-23px 0 0 -23px';
  }
};

// Circular joystick
function setJoyFromEvent(clientX, clientY){
  const rect=joystickEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  let dx=clientX-cx, dy=clientY-cy;
  const maxR=rect.width*0.38;
  const len=Math.hypot(dx,dy)||0.0001;
  if(len>maxR){dx=dx/len*maxR;dy=dy/len*maxR;}
  joy.dx=dx/maxR;
  joy.dy=dy/maxR; // screen Y down = forward preference fix later
  joyKnob.style.marginLeft=(dx-23)+'px';
  joyKnob.style.marginTop=(dy-23)+'px';
}
function resetJoy(){
  joy.active=false;joy.dx=0;joy.dy=0;
  joyKnob.style.margin='-23px 0 0 -23px';
}
joystickEl.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();joy.active=true;setJoyFromEvent(e.clientX,e.clientY);});
window.addEventListener('mousemove',e=>{if(joy.active)setJoyFromEvent(e.clientX,e.clientY);});
window.addEventListener('mouseup',()=>{if(joy.active)resetJoy();});
joystickEl.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();joy.active=true;const t=e.touches[0];setJoyFromEvent(t.clientX,t.clientY);},{passive:false});
window.addEventListener('touchmove',e=>{
  if(!joy.active)return;
  e.preventDefault();
  const t=e.touches[0];
  setJoyFromEvent(t.clientX,t.clientY);
},{passive:false});
window.addEventListener('touchend',e=>{if(joy.active)resetJoy();});

// Keyboard fallback (WASD) when freeMode
const keys={w:false,s:false,a:false,d:false};
window.addEventListener('keydown',e=>{
  if(e.repeat)return;
  if(e.code==='KeyW'||e.code==='ArrowUp')keys.w=true;
  if(e.code==='KeyS'||e.code==='ArrowDown')keys.s=true;
  if(e.code==='KeyA'||e.code==='ArrowLeft')keys.a=true;
  if(e.code==='KeyD'||e.code==='ArrowRight')keys.d=true;
});
window.addEventListener('keyup',e=>{
  if(e.code==='KeyW'||e.code==='ArrowUp')keys.w=false;
  if(e.code==='KeyS'||e.code==='ArrowDown')keys.s=false;
  if(e.code==='KeyA'||e.code==='ArrowLeft')keys.a=false;
  if(e.code==='KeyD'||e.code==='ArrowRight')keys.d=false;
});

// Three.js
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0a1020);
scene.fog=new THREE.FogExp2(0x0a1020,0.009);

const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,250);
camera.position.set(0,8,16);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x4060a0,0.48));
const sun=new THREE.DirectionalLight(0xfff0dd,1.3);
sun.position.set(30,50,25);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.near=2;sun.shadow.camera.far=140;
sun.shadow.camera.left=-50;sun.shadow.camera.right=50;
sun.shadow.camera.top=50;sun.shadow.camera.bottom=-50;
sun.shadow.bias=-0.0004;
scene.add(sun);
scene.add(new THREE.DirectionalLight(0x6080ff,0.28).translateX(-20).translateY(15));

// Bigger urban ground
const ground=new THREE.Mesh(
  new THREE.PlaneGeometry(160,160),
  new THREE.MeshStandardMaterial({color:0x1c2436,roughness:0.95})
);
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

// Road strips
function road(x,z,w,d,rot=0){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color:0x2a2e38,roughness:0.9}));
  m.rotation.x=-Math.PI/2;m.rotation.z=rot;m.position.set(x,0.03,z);scene.add(m);
}
road(0,0,14,160);road(0,0,160,14);
road(-40,20,10,80);road(40,-15,10,90);

const grid=new THREE.GridHelper(160,40,0x2a3a55,0x1a2538);
grid.position.y=0.02;scene.add(grid);

function makeBuilding(x,z,w,h,d,c){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:0.85}));
  m.position.set(x,h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
  // simple windows
  
}
const bcols=[0x2a3548,0x243040,0x2c3a50,0x263248,0x1e2a3a,0x324050];
const placements=[
  [-28,-22,10,14,8], [22,-30,12,18,9], [-20,28,9,12,10], [30,20,11,16,8],
  [0,-40,14,10,7], [-45,5,8,11,8], [48,-8,9,13,7], [-15,-45,7,9,9],
  [18,40,10,12,8], [-50,-35,11,15,9], [40,38,8,10,7], [-35,45,9,14,8]
];
placements.forEach((p,i)=>makeBuilding(p[0],p[1],p[2],p[3],p[4],bcols[i%bcols.length]));

// Street lamps
function lamp(x,z){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,4.5,6),new THREE.MeshStandardMaterial({color:0x333333}));
  pole.position.set(x,2.25,z);pole.castShadow=true;scene.add(pole);
  const light=new THREE.PointLight(0xffaa66,0.6,18);
  light.position.set(x,4.6,z);scene.add(light);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,6),new THREE.MeshBasicMaterial({color:0xffcc88}));
  bulb.position.set(x,4.55,z);scene.add(bulb);
}
[[-12,-12],[12,12],[-12,12],[12,-12],[-35,0],[35,0],[0,35],[0,-35]].forEach(([x,z])=>lamp(x,z));

// Stars
const starPos=[];
for(let i=0;i<350;i++)starPos.push((Math.random()-0.5)*220,Math.random()*80+20,(Math.random()-0.5)*220);
scene.add(new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(starPos,3)),
  new THREE.PointsMaterial({color:0xaaccff,size:0.32,sizeAttenuation:true})
));

// === Character factory ===
function createClericGroup(scale=1){
  const g=new THREE.Group();
  const robeMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:0.75});
  const robe=new THREE.Mesh(new THREE.CylinderGeometry(0.85*scale,1.25*scale,2.3*scale,10),robeMat);
  robe.position.y=1.25*scale;robe.castShadow=true;g.add(robe);

  const skin=new THREE.MeshStandardMaterial({color:0xd4a574,roughness:0.7});
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.52*scale,12,10),skin);
  head.position.y=2.75*scale;head.castShadow=true;g.add(head);

  const turbanMat=new THREE.MeshStandardMaterial({color:0xf0f0f0,roughness:0.55});
  [[0.58,3.12,0.5],[0.46,3.4,0.45],[0.34,3.62,0.4]].forEach(([r,y,s])=>{
    const t=new THREE.Mesh(new THREE.SphereGeometry(r*scale,10,8),turbanMat);
    t.scale.set(1,s,1);t.position.y=y*scale;g.add(t);
  });

  const beard=new THREE.Mesh(new THREE.ConeGeometry(0.45*scale,0.85*scale,8),new THREE.MeshStandardMaterial({color:0x1a1a1a}));
  beard.position.set(0,2.28*scale,0.22*scale);beard.rotation.x=0.32;g.add(beard);

  const eyeMat=new THREE.MeshStandardMaterial({color:0x111111});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.08*scale,6,6),eyeMat);
  eyeL.position.set(-0.17*scale,2.8*scale,0.45*scale);g.add(eyeL);
  const eyeR=eyeL.clone();eyeR.position.x=0.17*scale;g.add(eyeR);

  const armMat=new THREE.MeshStandardMaterial({color:0x1a1a1a});
  const armL=new THREE.Mesh(new THREE.CylinderGeometry(0.11*scale,0.11*scale,1.05*scale,6),armMat);
  armL.position.set(-1.0*scale,1.65*scale,0);armL.rotation.z=0.35;armL.castShadow=true;g.add(armL);
  const armR=armL.clone();armR.position.x=1.0*scale;armR.rotation.z=-0.35;g.add(armR);

  const handL=new THREE.Mesh(new THREE.SphereGeometry(0.15*scale,6,6),skin);
  handL.position.set(-1.28*scale,1.12*scale,0.08*scale);g.add(handL);
  const handR=handL.clone();handR.position.x=1.28*scale;g.add(handR);

  const legL=new THREE.Mesh(new THREE.CylinderGeometry(0.16*scale,0.14*scale,0.95*scale,6),armMat);
  legL.position.set(-0.32*scale,0.48*scale,0);legL.castShadow=true;g.add(legL);
  const legR=legL.clone();legR.position.x=0.32*scale;g.add(legR);

  g.userData={robe,armL,armR,legL,legR,robeMat};
  return g;
}

const charGroup=createClericGroup(1);
scene.add(charGroup);

const char={
  pos:new THREE.Vector3(0,0,0),
  vel:new THREE.Vector3(0,0,0),
  facing:0,
  runCycle:0,
  hitFlash:0,
  stunTimer:0,
  radius:1.35
};
charGroup.position.copy(char.pos);

// === NPC Akhounds ===
const npcs=[];
function spawnNpc(x,z){
  const g=createClericGroup(0.92+Math.random()*0.12);
  scene.add(g);
  const n={
    group:g,
    pos:new THREE.Vector3(x,0,z),
    vel:new THREE.Vector3(0,0,0),
    facing:Math.random()*Math.PI*2,
    runCycle:Math.random()*10,
    timer:2+Math.random()*4,
    targetDir:Math.random()*Math.PI*2,
    radius:1.2
  };
  g.position.copy(n.pos);
  g.rotation.y=n.facing;
  npcs.push(n);
}
spawnNpc(-18,12);spawnNpc(15,-10);spawnNpc(-8,-20);
spawnNpc(25,8);spawnNpc(-22,-5);spawnNpc(10,22);

function updateNpcs(dt){
  npcs.forEach(n=>{
    n.timer-=dt;
    if(n.timer<=0){
      n.timer=2.5+Math.random()*5;
      n.targetDir=Math.random()*Math.PI*2;
      if(Math.random()<0.3)n.targetDir=Math.atan2(char.pos.x-n.pos.x,char.pos.z-n.pos.z)+Math.PI; // flee player sometimes
    }
    // smooth turn
    let diff=n.targetDir-n.facing;
    while(diff>Math.PI)diff-=Math.PI*2;
    while(diff<-Math.PI)diff+=Math.PI*2;
    n.facing+=diff*Math.min(1,dt*3);

    const spd=2.8+Math.random()*0.8;
    n.vel.x=Math.sin(n.facing)*spd;
    n.vel.z=Math.cos(n.facing)*spd;
    n.pos.x+=n.vel.x*dt;
    n.pos.z+=n.vel.z*dt;

    const B=55;
    if(n.pos.x<-B||n.pos.x>B){n.pos.x=THREE.MathUtils.clamp(n.pos.x,-B,B);n.targetDir+=Math.PI;}
    if(n.pos.z<-B||n.pos.z>B){n.pos.z=THREE.MathUtils.clamp(n.pos.z,-B,B);n.targetDir+=Math.PI;}

    n.group.position.copy(n.pos);
    n.group.rotation.y=n.facing;
    n.runCycle+=spd*dt*3.5;
    const swing=Math.sin(n.runCycle)*0.45;
    const {armL,armR,legL,legR}=n.group.userData;
    armL.rotation.x=swing;armR.rotation.x=-swing;
    legL.rotation.x=-swing*0.8;legR.rotation.x=swing*0.8;
  });
}

// === Pedestrians flipping off ===
const peds=[];
function createPed(x,z){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.35,1.1,8),new THREE.MeshStandardMaterial({color:0x3a5a8a+Math.floor(Math.random()*0x202020)}));
  body.position.y=0.9;body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,8),new THREE.MeshStandardMaterial({color:0xd4a574}));
  head.position.y=1.7;g.add(head);
  // raised arm (middle finger gesture)
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.7,5),new THREE.MeshStandardMaterial({color:0xd4a574}));
  arm.position.set(0.35,1.5,0);arm.rotation.z=-1.1;g.add(arm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(0.1,5,5),new THREE.MeshStandardMaterial({color:0xd4a574}));
  hand.position.set(0.55,1.95,0);g.add(hand);
  // finger
  const finger=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.03,0.28,4),new THREE.MeshStandardMaterial({color:0xd4a574}));
  finger.position.set(0.55,2.2,0);g.add(finger);

  scene.add(g);
  const p={group:g,pos:new THREE.Vector3(x,0,z),facing:0,bob:Math.random()*5};
  g.position.copy(p.pos);
  peds.push(p);
}
[[-10,8],[8,-14],[-25,18],[20,5],[-5,30],[32,-20],[-30,-12],[15,28],[-18,-28],[5,12]].forEach(([x,z])=>createPed(x,z));

function updatePeds(dt){
  peds.forEach(p=>{
    // look at nearest akhound (player or npc)
    let nearest=char.pos;
    let best=p.pos.distanceTo(char.pos);
    npcs.forEach(n=>{
      const d=p.pos.distanceTo(n.pos);
      if(d<best){best=d;nearest=n.pos;}
    });
    const dx=nearest.x-p.pos.x, dz=nearest.z-p.pos.z;
    p.facing=Math.atan2(dx,dz);
    p.group.rotation.y=p.facing;
    p.bob+=dt*2;
    p.group.position.y=Math.sin(p.bob)*0.04;
  });
}

// Projectiles & whip
const projectiles=[], particlePool=[];
const whipPoints=[],whipMeshes=[];
for(let i=0;i<12;i++){
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.07-i*0.003,6,6),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.08,0.5,0.32-i*0.015)}));
  m.visible=false;scene.add(m);whipMeshes.push(m);whipPoints.push(new THREE.Vector3());
}
function spawnParticles(pos,color,count=12){
  for(let i=0;i<count;i++){
    const p=new THREE.Mesh(new THREE.SphereGeometry(0.05+Math.random()*0.07,4,4),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));
    p.position.copy(pos);
    p.userData={vel:new THREE.Vector3((Math.random()-0.5)*5.5,Math.random()*4.5+1.5,(Math.random()-0.5)*5.5),life:0.7+Math.random()*0.45};
    scene.add(p);particlePool.push(p);
  }
}

function updateChar(dt){
  char.hitFlash=Math.max(0,char.hitFlash-dt*2.5);

  if(char.stunTimer>0){
    char.stunTimer-=dt;
    char.vel.x*=0.84;char.vel.z*=0.84;
  }else if(freeMode){
    // حالت کنترل مستقیم (بازیکن کنترل می‌کند)
    let jx=joy.dx, jy=-joy.dy; // بالا = جلو
    if(keys.w)jy+=1;if(keys.s)jy-=1;if(keys.a)jx-=1;if(keys.d)jx+=1;
    const jlen=Math.hypot(jx,jy);
    if(jlen>1){jx/=jlen;jy/=jlen;}

    if(jlen>0.08){
      const look=new THREE.Vector3();
      camera.getWorldDirection(look);
      look.y=0;look.normalize();
      const right=new THREE.Vector3().crossVectors(look,new THREE.Vector3(0,1,0)).normalize();

      const move=new THREE.Vector3();
      move.addScaledVector(look,jy);
      move.addScaledVector(right,jx);
      if(move.lengthSq()>0.001){
        move.normalize();
        const speed=8.5;
        char.vel.x=move.x*speed;
        char.vel.z=move.z*speed;
        const targetFacing=Math.atan2(move.x,move.z);
        let diff=targetFacing-char.facing;
        while(diff>Math.PI)diff-=Math.PI*2;
        while(diff<-Math.PI)diff+=Math.PI*2;
        char.facing+=diff*Math.min(1,dt*10);
      }
    }else{
      // توقف سریع‌تر (کمتر سر می‌خورد)
      char.vel.x*=0.76;
      char.vel.z*=0.76;
    }
  }else{
    // ========== حالت فرار: از آخرین نقطه کلیک فرار می‌کند ==========
    const threat = lastClickPos.clone();
    threat.y = 0;
    const toChar = char.pos.clone().sub(threat);
    toChar.y = 0;
    const dist = Math.max(toChar.length(), 1.2);
    toChar.normalize();

    // نیروی فرار (قوی‌تر وقتی نزدیک‌تر باشد)
    const force = (12 / dist + 1.3 + level * 0.15) * 5.5;
    char.vel.x += toChar.x * force * dt;
    char.vel.z += toChar.z * force * dt;

    // کمی تصادفی برای حس طبیعی
    char.vel.x += (Math.random() - 0.5) * 1.8 * dt * (1 + level * 0.1);
    char.vel.z += (Math.random() - 0.5) * 1.8 * dt * (1 + level * 0.1);

    // گاهی تغییر جهت ناگهانی
    if (Math.random() < 0.004 + level * 0.0006) {
      char.vel.x *= -1.1;
      char.vel.z *= -1.1;
    }
    // گاهی پرش
    if (Math.random() < 0.0035) {
      char.vel.y = 5 + Math.random() * 2.8;
    }

    // محدود کردن حداکثر سرعت
    const maxSpd = 5.5 + level * 0.38;
    const hSpd = Math.hypot(char.vel.x, char.vel.z);
    if (hSpd > maxSpd) {
      char.vel.x = (char.vel.x / hSpd) * maxSpd;
      char.vel.z = (char.vel.z / hSpd) * maxSpd;
    }

    // چرخش صورت به سمت حرکت
    if (hSpd > 0.3) {
      const tf = Math.atan2(char.vel.x, char.vel.z);
      let d = tf - char.facing;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      char.facing += d * Math.min(1, dt * 7);
    }
  }

  char.vel.y-=16*dt;
  char.pos.x+=char.vel.x*dt;
  char.pos.y+=char.vel.y*dt;
  char.pos.z+=char.vel.z*dt;
  if(char.pos.y<0){char.pos.y=0;char.vel.y=0;}

  const B=58;
  if(char.pos.x<-B){char.pos.x=-B;char.vel.x=Math.abs(char.vel.x)*0.35;}
  if(char.pos.x>B){char.pos.x=B;char.vel.x=-Math.abs(char.vel.x)*0.35;}
  if(char.pos.z<-B){char.pos.z=-B;char.vel.z=Math.abs(char.vel.z)*0.35;}
  if(char.pos.z>B){char.pos.z=B;char.vel.z=-Math.abs(char.vel.z)*0.35;}

  charGroup.position.copy(char.pos);
  charGroup.rotation.y=char.facing;

  const spd=Math.hypot(char.vel.x,char.vel.z);
  char.runCycle+=spd*dt*3.8;
  const {armL,armR,legL,legR,robe}=charGroup.userData;
  const swing=Math.sin(char.runCycle)*0.55*Math.min(1,spd/4);
  armL.rotation.x=swing;armR.rotation.x=-swing;
  legL.rotation.x=-swing*0.85;legR.rotation.x=swing*0.85;
  if(char.hitFlash>0)robe.material.color.setHex(0x6b1a1a);
  else robe.material.color.setHex(0x111111);
}

// ========== منطق شلیک و شلاق (نسخه پایدار) ==========

function getClickWorldPosition(clientX, clientY) {
  const mouseNDC = new THREE.Vector2(
    (clientX / innerWidth) * 2 - 1,
    -(clientY / innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouseNDC, camera);
  const target = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(groundPlane, target)) {
    return target;
  }
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  return camera.position.clone().add(dir.multiplyScalar(12)).setY(0);
}

function shoot(clientX, clientY) {
  try {
    const weapon = getWeapon(currentWeapon);
    if (!weapon || weapon.isMelee) return;

    if (clientX !== undefined && clientY !== undefined) {
      lastClickPos.copy(getClickWorldPosition(clientX, clientY));
    }

    // هدف: بدن آخوند
    const targetPos = new THREE.Vector3(char.pos.x, char.pos.y + 1.4, char.pos.z);

    // مبدأ: از کمی جلو دوربین (پایدار در ۳ بعدی)
    // جهت: به سمت نقطه کلیک روی زمین، و اگر کلیک نزدیک آخوند بود مستقیم به آخوند
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const origin = camera.position.clone().addScaledVector(camDir, 2.0);
    origin.y = Math.max(origin.y, 1.0);

    // نقطه هدف نهایی برای جهت پرتابه
    let aimPoint = lastClickPos.clone();
    aimPoint.y = 1.2;

    // اگر نقطه کلیک خیلی دور از آخوند است، باز هم به سمت آخوند متمایل شو (حس نسخه ۲ بعدی)
    const toChar = targetPos.clone().sub(aimPoint);
    if (toChar.length() < 8) {
      // کلیک نزدیک آخوند → مستقیم به آخوند
      aimPoint.copy(targetPos);
    } else {
      // کلیک دور → پرتابه به سمت نقطه کلیک برود، ولی کمی به آخوند هم متمایل
      aimPoint.lerp(targetPos, 0.35);
    }

    let dir = aimPoint.clone().sub(origin);
    if (dir.lengthSq() < 0.01) {
      dir.copy(camDir);
    }
    dir.normalize();

    const speed = weapon.speed || 16;
    const count = weapon.count || 1;
    const isBullet = weapon.projectileType === 'bullet';

    for (let i = 0; i < count; i++) {
      const spreadAmount = weapon.spread || (isBullet ? 0.04 : 0.03);
      const d = dir.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * spreadAmount,
        (Math.random() - 0.5) * spreadAmount * 0.5,
        (Math.random() - 0.5) * spreadAmount
      ));
      if (d.lengthSq() < 0.0001) d.copy(dir);
      d.normalize();

      if (!isBullet) {
        d.y += 0.12;
        d.normalize();
      }

      let mesh;
      try {
        mesh = createProjectileMesh(isBullet ? 'bullet' : currentWeapon);
      } catch (err) {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffee44 })
        );
      }
      if (!mesh) continue;

      mesh.position.copy(origin);
      scene.add(mesh);

      const vel = d.multiplyScalar(isBullet ? speed : speed * 0.8);

      projectiles.push({
        type: currentWeapon,
        mesh,
        vel,
        life: isBullet ? 1.6 : 2.5,
        rotSpeed: isBullet ? 0 : (Math.random() - 0.5) * 8,
        isBullet
      });
    }
  } catch (e) {
    console.warn('shoot error', e);
  }
}

function updateProjectiles(dt) {
  const hitPos = new THREE.Vector3(char.pos.x, char.pos.y + 1.4, char.pos.z);
  const hitRadius = char.radius + 0.75;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (!p || !p.mesh) {
      projectiles.splice(i, 1);
      continue;
    }

    if (!p.isBullet) {
      p.vel.y -= 12 * dt;
    }

    p.mesh.position.x += p.vel.x * dt;
    p.mesh.position.y += p.vel.y * dt;
    p.mesh.position.z += p.vel.z * dt;

    if (p.rotSpeed) {
      p.mesh.rotation.x += p.rotSpeed * dt;
      p.mesh.rotation.z += p.rotSpeed * 0.45 * dt;
    }

    p.life -= dt;

    const dx = p.mesh.position.x - hitPos.x;
    const dy = p.mesh.position.y - hitPos.y;
    const dz = p.mesh.position.z - hitPos.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < hitRadius * hitRadius) {
      hitChar(p.type);
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
      continue;
    }

    if (p.life <= 0 || p.mesh.position.y < -3) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateWhip(dt) {
  const active = currentWeapon === 'whip' && !freeMode;
  const hitPos = new THREE.Vector3(char.pos.x, char.pos.y + 1.4, char.pos.z);

  // نوک شلاق را مستقیم به سمت آخوند بکش (قابل اطمینان)
  let tipTarget;
  if (active) {
    // از دوربین به سمت آخوند، با طول مناسب
    const toChar = hitPos.clone().sub(camera.position);
    const dist = toChar.length();
    const reach = Math.min(Math.max(dist * 0.92, 4), 11);
    tipTarget = camera.position.clone().add(toChar.normalize().multiplyScalar(reach));
    tipTarget.y = Math.max(0.4, Math.min(tipTarget.y, hitPos.y + 0.8));
  } else {
    tipTarget = camera.position.clone();
    tipTarget.y = 0.4;
  }

  // نوک سریع‌تر دنبال هدف برود
  whipPoints[0].lerp(tipTarget, active ? 0.65 : 0.25);

  // زنجیره شلاق
  for (let i = 1; i < 12; i++) {
    const prev = whipPoints[i - 1];
    const curr = whipPoints[i];
    const diff = curr.clone().sub(prev);
    const len = diff.length() || 0.001;
    const segLen = 0.48;
    diff.multiplyScalar(segLen / len);
    curr.copy(prev).add(diff);
    curr.y -= 0.9 * dt;
    if (curr.y < 0.1) curr.y = 0.1;
  }

  for (let i = 0; i < 12; i++) {
    whipMeshes[i].position.copy(whipPoints[i]);
    whipMeshes[i].visible = active;
  }

  // برخورد شلاق — شعاع بزرگ‌تر تا راحت‌تر بخورد
  if (active) {
    const tip = whipPoints[0];
    const dx = tip.x - hitPos.x;
    const dy = tip.y - hitPos.y;
    const dz = tip.z - hitPos.z;
    if (dx * dx + dy * dy + dz * dz < (char.radius + 1.1) * (char.radius + 1.1)) {
      hitChar('whip');
    }
  }
}

function updateParticles(dt){
  for(let i=particlePool.length-1;i>=0;i--){
    const p=particlePool[i];
    p.userData.vel.y-=13*dt;p.position.addScaledVector(p.userData.vel,dt);
    p.userData.life-=dt;p.material.opacity=Math.max(0,p.userData.life*1.2);
    if(p.userData.life<=0){scene.remove(p);particlePool.splice(i,1);}
  }
}

function hitChar(type){
  const now = performance.now();
  if (now - lastHit < 190) return;
  lastHit = now;

  const weapon = getWeapon(type);

  hits++;
  hitCountEl.textContent = hits;
  combo++;
  comboTimer = 1.55;
  comboNumEl.textContent = combo;
  comboEl.style.opacity = 1;

  const base = weapon.damage || 15;
  score += Math.floor(base * Math.min(combo, 8));
  scoreEl.textContent = score;

  const nl = Math.floor(hits / 11) + 1;
  if (nl > level) {
    level = nl;
    levelEl.textContent = level;
    showMsg('سطح ' + level + '! 🔥');
  }
  updateTitle();

  char.hitFlash = 1;
  char.stunTimer = weapon.stunTime || 0.4;
  char.vel.x += (Math.random() - 0.5) * 9;
  char.vel.z += (Math.random() - 0.5) * 9;
  char.vel.y = 4.5 + Math.random() * 2.5;

  const list = weapon.messages || ['آخ!'];
  showMsg(list[Math.floor(Math.random() * list.length)]);

  const col = weapon.particleColor || 0xff6644;
  spawnParticles(char.pos.clone().add(new THREE.Vector3(0, 1.7, 0)), col, 12 + Math.min(combo, 7));
}

function showMsg(txt){
  msgEl.textContent=txt;msgEl.style.opacity=1;msgEl.style.transform='translate(-50%,-50%) scale(1.12)';
  clearTimeout(showMsg._t);showMsg._t=setTimeout(()=>{msgEl.style.opacity=0;msgEl.style.transform='translate(-50%,-50%) scale(0.9)';},820);
}

function updateCamera(dt){
  const target=char.pos.clone().add(new THREE.Vector3(0,2.2,0));
  let ideal;
  if(freeMode){
    const back=new THREE.Vector3(Math.sin(char.facing),0,Math.cos(char.facing));
    ideal=target.clone().add(back.multiplyScalar(10)).add(new THREE.Vector3(0,5.2,0));
    ideal.x+=mouse.x*2;ideal.y+=mouse.y*1.2;
  }else{
    ideal=target.clone().add(new THREE.Vector3(0,6.5,13));
    ideal.x+=mouse.x*3.5;ideal.y+=mouse.y*1.8;
  }
  camera.position.lerp(ideal,1-Math.pow(0.0007,dt));
  camera.lookAt(target);
}

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  if (shooting) lastClickPos.copy(getClickWorldPosition(e.clientX, e.clientY));
});
window.addEventListener('mousedown', e => {
  if (e.target.closest('.wpn') || e.target.closest('#modeBtn') || e.target.closest('#joystick')) return;
  shooting = true;
  // همیشه نقطه کلیک را برای فرار/شلاق آپدیت کن
  lastClickPos.copy(getClickWorldPosition(e.clientX, e.clientY));
  const weapon = getWeapon(currentWeapon);
  if (weapon && !weapon.isMelee) {
    shoot(e.clientX, e.clientY);
    shootTimer = weapon.fireRate || 0.2;
  }
});
window.addEventListener('mouseup', () => { shooting = false; });
window.addEventListener('touchstart', e => {
  if (e.target.closest('.wpn') || e.target.closest('#modeBtn') || e.target.closest('#joystick')) return;
  e.preventDefault();
  shooting = true;
  const t = e.touches[0];
  mouse.x = (t.clientX / innerWidth) * 2 - 1;
  mouse.y = -(t.clientY / innerHeight) * 2 + 1;
  lastClickPos.copy(getClickWorldPosition(t.clientX, t.clientY));
  const weapon = getWeapon(currentWeapon);
  if (weapon && !weapon.isMelee) {
    shoot(t.clientX, t.clientY);
    shootTimer = weapon.fireRate || 0.2;
  }
}, { passive: false });
window.addEventListener('touchmove', e => {
  if (e.target.closest('#joystick')) return;
  e.preventDefault();
  const t = e.touches[0];
  mouse.x = (t.clientX / innerWidth) * 2 - 1;
  mouse.y = -(t.clientY / innerHeight) * 2 + 1;
  if (shooting) lastClickPos.copy(getClickWorldPosition(t.clientX, t.clientY));
}, { passive: false });
window.addEventListener('touchend', () => { shooting = false; });
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.05);
  if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0){combo=0;comboEl.style.opacity=0;}}
  updateChar(dt);updateNpcs(dt);updatePeds(dt);
  updateProjectiles(dt);updateWhip(dt);updateParticles(dt);updateCamera(dt);
  if (shooting) {
    const w = getWeapon(currentWeapon);
    if (w && !w.isMelee) {
      shootTimer -= dt;
      if (shootTimer <= 0) {
        shoot();
        shootTimer = w.fireRate || 0.2;
      }
    }
  }
  renderer.render(scene,camera);
}
updateTitle();animate();
