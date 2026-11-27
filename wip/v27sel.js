/* v2.7: full-screen entrance on hero select */
(function(){
  const st=document.createElement('style'); st.textContent=`
#heroSel>*{transition:opacity .3s}
#heroSel.entPlay{background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 12%,rgba(0,0,0,0) 88%,rgba(0,0,0,.35))!important}
#heroSel.entPlay>*:not(#entSkip){opacity:0!important;pointer-events:none!important}
#entSkip{position:absolute;right:14px;top:max(14px,env(safe-area-inset-top));z-index:9;display:none;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.5);background:rgba(0,0,0,.45);color:#fff;font-weight:900;font-size:14px;letter-spacing:1px}
#heroSel.entPlay #entSkip{display:block}`; document.head.appendChild(st);
  const hs=document.getElementById('heroSel'); const b=document.createElement('button'); b.id='entSkip'; b.textContent='跳过 ▶▶'; hs.appendChild(b);
  const stop=()=>{ hs.classList.remove('entPlay'); };
  b.onclick=(e)=>{ e.stopPropagation(); if(ENT.on){ const E=ENTRANCES[ENT.k]; ENT.T=Math.max(ENT.T,E.dur-.05); } stop(); };
  const _se=startEntrance; startEntrance=function(k,mode){ _se(k,mode); if(mode==='select'&&APP.state==='select') hs.classList.add('entPlay'); };
  let hold=0;
  const _tick=entTick; entTick=function(dt){ const was=ENT.on; _tick(dt); if(hs.classList.contains('entPlay')){ if(!ENT.on||APP.state!=='select'){ hold+=dt; if(hold>.6||APP.state!=='select'){ stop(); hold=0; } } else hold=0; } };
})();
/* keep the whole robot in frame during entrance close-ups (portrait phones crop it otherwise) */
(function(){
  const _sc=selCam; const tmp=new THREE.Vector3();
  selCam=function(dt){ const r=_sc(dt); if(!r) return r;
    const R=entRoot(SEL&&SEL.key||CUR); if(!R) return r; const base=R.getWorldPosition(tmp.set(0,0,0)).clone();
    const t=Math.tan(camera.fov*Math.PI/360), visH=Math.max(9.5,6.4/Math.max(.3,camera.aspect)), DF=visH/(2*t);
    const dir=camera.position.clone().sub(target); const d=dir.length(); if(d>=DF) return r;
    const k=Math.min(1,(DF-d)/DF*2.2); const look=target.clone(); look.y=lerp(look.y,base.y+3.3,k); look.x=lerp(look.x,base.x,k*.6); look.z=lerp(look.z,base.z,k*.6);
    dir.normalize(); dir.y=Math.max(dir.y,-.05); dir.normalize(); target.copy(look); camera.position.copy(look).addScaledVector(dir,DF); camera.lookAt(look); return r; };
  const st=document.createElement('style'); st.textContent='#animeFx .imp{animation-duration:.2s!important;opacity:.75}'; document.head.appendChild(st);
})();
