/* Lightweight canvas snowfall. Decorative only; disabled for reduced-motion users. */
(()=>{
  'use strict';
  if(document.querySelector('.neo-snow-canvas'))return;
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)');
  const cv=document.createElement('canvas');cv.className='neo-snow-canvas';cv.setAttribute('aria-hidden','true');
  document.body.appendChild(cv);
  const ctx=cv.getContext('2d',{alpha:true});if(!ctx)return;
  const btn=document.createElement('button');btn.type='button';btn.className='neo-snow-switch';btn.title='Bật hoặc tắt tuyết rơi';btn.setAttribute('aria-label','Bật hoặc tắt hiệu ứng tuyết rơi');btn.innerHTML='❄';document.body.appendChild(btn);
  let allow=true;try{allow=localStorage.getItem('nghialq_snow_enabled')!=='false'}catch(_){}
  let enabled=allow&&!reduced?.matches,shown=allow,raf=0,last=0,W=0,H=0,flakes=[],dpr=1;
  const random=(a,b)=>Math.random()*(b-a)+a;
  function count(){return Math.max(22,Math.min(75,Math.round(W/13)))}
  function resize(){
    W=window.innerWidth;H=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=count();flakes=Array.from({length:n},()=>({x:random(0,W),y:random(0,H),r:random(.8,2.6),vy:random(.25,.95),vx:random(-.22,.22),alpha:random(.25,.83),phase:random(0,6.28)}));
  }
  function paint(time){
    if(!enabled||document.hidden){raf=0;return}
    const dt=last?Math.min((time-last)/16.67,2):1;last=time;
    ctx.clearRect(0,0,W,H);
    for(const f of flakes){
      f.y+=f.vy*dt;f.x+=(f.vx+Math.sin(f.phase+time/1800)*.17)*dt;
      if(f.y>H+8){f.y=-8;f.x=random(0,W)}
      if(f.x< -8)f.x=W+3;if(f.x>W+8)f.x=-3;
      ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fillStyle=`rgba(220,238,255,${f.alpha})`;ctx.fill();
    }
    raf=requestAnimationFrame(paint);
  }
  function update(){
    enabled=shown&&!(reduced?.matches);
    btn.setAttribute('aria-pressed',String(shown));btn.title=shown?'Tắt hiệu ứng tuyết rơi':'Bật hiệu ứng tuyết rơi';
    cv.style.display=enabled?'block':'none';
    if(!enabled){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,W,H);return}
    if(!document.hidden&&!raf){last=0;raf=requestAnimationFrame(paint)}
  }
  resize();btn.addEventListener('click',()=>{shown=!shown;try{localStorage.setItem('nghialq_snow_enabled',String(shown))}catch(_){}update()});
  window.addEventListener('resize',()=>{resize();update()},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else update()});
  if(reduced?.addEventListener)reduced.addEventListener('change',update);
  update();
})();
