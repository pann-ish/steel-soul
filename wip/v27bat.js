/* v2.7 battle: Gundam-Versus style lock-on camera, homing dash basics, visible strike lines, unique basic flourishes, brighter skill hits */
let __lastDrag=-9;
renderer.domElement.addEventListener('pointermove',()=>{ if(dragging) __lastDrag=performance.now()*.001; });
const GV={th:null,d:12,ph:1.2,look:new THREE.Vector3()};
function gvLock(){ let e=LV.target; if(!e||e.dead){ let bd=1e9; e=null; LV.enemies.forEach(x=>{ if(x.dead) return; const d=Math.hypot(x.x-rig.position.x,x.z-rig.position.z); if(d<bd){ bd=d; e=x; } }); if(bd>48) e=null; } return e; }
function gvCam(dt){
  const now=performance.now()*.001, manual=dragging||now-__lastDrag<1.4, e=PL.dead?null:gvLock();
  const P=rig.position;
  if(e&&!manual){
    const dx=P.x-e.x, dz=P.z-e.z, sep=Math.hypot(dx,dz)||1;
    let want=Math.atan2(dx,dz)+.2; let dth=want-theta; dth=Math.atan2(Math.sin(dth),Math.cos(dth)); theta+=dth*Math.min(1,dt*3.2);
    const k=Math.min(.42,6/sep*.0+.32); const lx=lerp(P.x,e.x,k), lz=lerp(P.z,e.z,k);
    const ly=3.1+P.y*.55+Math.min(2,(e.hitY||2)*.2);
    target.lerp(new THREE.Vector3(lx,ly,lz),Math.min(1,dt*6));
    const dWant=(camera.aspect<1?12.5:10.5)+Math.min(9,sep*.32);
    GV.d=lerp(GV.d,dWant,Math.min(1,dt*2.5)); phi=lerp(phi,1.2,Math.min(1,dt*2));
    const dSave=dist; dist=GV.d+camExtra-camKick; updateCam(); dist=dSave;
  } else {
    const want=new THREE.Vector3(P.x,3.4+P.y*.5,P.z); target.lerp(want,Math.min(1,dt*6));
    GV.d=dist; const dSave=dist; dist+=camExtra-camKick; updateCam(); dist=dSave;
  }
}
/* strike line: bright streak from the attacker's hand to the enemy so the hit visibly comes from the robot */
function strikeLine(a,b,col,w=.12,life=.16){ col=tc(col); const d=b.clone().sub(a), L=d.length(); if(L<.3) return;
  const m=new THREE.Mesh(new THREE.CylinderGeometry(w,w*.35,L,8,1,true),addm(col,{opacity:.95})); m.position.copy(a).addScaledVector(d,.5); m.quaternion.setFromUnitVectors(Yv,d.normalize());
  const core=new THREE.Mesh(new THREE.CylinderGeometry(w*.4,w*.15,L,6,1,true),addm(0xffffff,{opacity:1})); m.add(core); fxFade(m,life,.0); }
/* projectile that visibly travels from a to b */
function travel(mesh,a,b,dur,spin=0,trail=0){ scene.add(mesh); mesh.position.copy(a); const col=trail;
  PFX.push({t:0,tick(dt){ this.t+=dt; const k=Math.min(1,this.t/dur); mesh.position.lerpVectors(a,b,k); if(spin) mesh.rotation.z+=spin*dt; if(col&&Math.random()<.8) emit(mesh.position.clone(),Yv,1,.05,col);
    if(k>=1){ scene.remove(mesh); if(mesh.geometry) mesh.geometry.dispose(); return false; } return true; }}); }
const handOf=(i=1)=>CUR==='blaze'?rigW(.9*(i?1:-1),3.4,1.6):handW(HEROES[CUR].h,i);
const UNIQ={
  blaze:(st,p)=>{ // drill thrust: a spinning drill cone erupts from the fist
    const a=handOf(st%2?0:1); const g=new THREE.ConeGeometry(.5,2.6,14,1,true); g.rotateX(Math.PI/2); g.translate(0,0,1.3);
    const m=new THREE.Mesh(g,addm(0xff8a2a,{opacity:.9,side:THREE.DoubleSide})); m.position.copy(a); m.lookAt(p); scene.add(m);
    PFX.push({t:0,tick(dt){ this.t+=dt; m.rotateZ(dt*40); m.material.opacity=Math.max(0,.9-this.t*4); m.scale.setScalar(1+this.t*1.5); if(this.t>.25){ scene.remove(m); g.dispose(); return false; } return true; }});
    for(let i=0;i<10;i++) emit(p,new THREE.Vector3(Math.random()-.5,Math.random(),Math.random()-.5),1,.3,0xffd070); },
  saber:(st,p)=>{ if(st>=1){ const fw=p.clone().sub(rigW(0,p.y,0)).setY(0).normalize(); const m=new THREE.Mesh(new THREE.RingGeometry(1.2,1.55,40,1,0,Math.PI),addm(0xe8fbff,{opacity:.95,side:THREE.DoubleSide}));
      m.quaternion.copy(rig.quaternion); m.rotateZ(st===1?-.4:Math.PI/2); travel(m,rigW(0,p.y,1.5),p.clone().addScaledVector(fw,4),.16,0,0x9ff4ff); } },
  goliath:(st,p)=>{ // rocket punch: armored fist flies to the target
    const a=handOf(st%2?1:0); const m=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,1.1),new THREE.MeshStandardMaterial({color:0xffb060,metalness:.8,roughness:.3,emissive:0x552200}));
    m.lookAt(p); travel(m,a,p,.1,0,0xff8a2a); },
  shade:(st,p)=>{ const a=handOf(1); [0,1,2].slice(0,st>=1?3:1).forEach(i=>{ const s=new THREE.Mesh(shurikenGeo,new THREE.MeshBasicMaterial({color:0xdde4ff,side:THREE.DoubleSide})); s.rotation.x=Math.PI/2;
      setTimeout(()=>travel(s,a.clone(),p.clone().add(new THREE.Vector3((i-1)*.5,(i-1)*.3,0)),.12,40,0xff3a4a),i*40); }); },
  volt:(st,p)=>{ bolt(handOf(st%2?0:1),p,.14,0xe8fbff,.2,2); bolt(handOf(st%2?0:1),p,.06,0x9ff4ff,.2,3); },
  lemonwolf:(st,p)=>{ const a=handOf(st%2?0:1); for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.ConeGeometry(.16,1.1,5),new THREE.MeshBasicMaterial({color:0xcff2ff,transparent:true,opacity:.9}));
      m.rotation.x=Math.PI/2; setTimeout(()=>travel(m,a.clone(),p.clone().add(new THREE.Vector3((Math.random()-.5),(Math.random()-.5),0)),.12,0,0xe8fbff),i*35); } },
  junxiang:(st,p)=>{ const a=handOf(1); for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.TorusGeometry(.5+i*.2,.06,6,32),addm(i%2?0xffd23a:0xff4fd8,{opacity:.95}));
      m.lookAt(p.clone().sub(a).add(m.position)); setTimeout(()=>{ m.lookAt(p); travel(m,a.clone(),p.clone(),.16,0,0); },i*45); } },
  yunhong:(st,p)=>{ const a=handOf(1); const m=new THREE.Mesh(new THREE.RingGeometry(.3,.75,36),addm(0x4fe0c0,{opacity:.85,side:THREE.DoubleSide})); m.lookAt(p.clone().sub(a).add(m.position));
      travel(m,a,p,.12,0,0x4fe0c0); setTimeout(()=>{ if(APP.state==='game') ringFX(p,0xffffff,.8,p.y,.25,.05); },120); },
};
Object.keys(BASIC_SET).forEach(k=>BASIC_SET[k].forEach((S,i)=>{ const f=S.fx; S.fx=function(p,c){ f.call(this,p,c);
  try{ if(BASIC.reach<14&&S.area!=='ring'){ strikeLine(handOf(i%2?0:1),p,BASIC_COL[k]||0xffffff,.1+(i>=2?.06:0),.14); } UNIQ[k]&&UNIQ[k](i,p); impact3D(p,i>=2,BASIC_COL[k]); }catch(e){} }; }));
/* homing dash: close the gap to the locked enemy (Gundam boost-step), with afterimage streaks */
const _tryBasic=tryBasic; tryBasic=function(){ const t0=BASIC.t; _tryBasic(); if(BASIC.t===0&&BASIC.S&&MODE==='level'&&LV.target){
  const S=BASIC.S; BASIC.lunge=Math.max(0,Math.min(8.5,TGT-2.2))*Math.max(S.lg,S.area==='ring'?0:.6);
  if(BASIC.lunge>2.5){ const col=BASIC_COL[CUR]||0xffffff; for(let i=0;i<8;i++) setTimeout(()=>{ if(APP.state==='game') emitGas(rigW((Math.random()-.5)*.8,2+Math.random()*1.5,-.5),rigDir(0,.1,-1),i%2?col:0xffffff); },i*18); if(AC) SFX.whoosh(.3,true,1); } } };
/* basic hit reach: the dash now covers up to ~11m */
/* brighter, clearer skill hits */
const _v27HitFX=hitFX; hitFX=function(e,big,dmg){ _v27HitFX(e,big,dmg); try{ if(HM.on||ULT.on){ const p=new THREE.Vector3(e.x,e.hitY||2.2,e.z); const col=parseInt((HEROES[CUR].col||'#ffa030').slice(1),16);
  if(HFX.n<=4){ impact3D(p,true,col); ringFX(p,col,big?1.6:1,p.y,.3,.1); strikeLine(curChestW(new THREE.Vector3()),p,col,.08,.12); } } }catch(err){} };
