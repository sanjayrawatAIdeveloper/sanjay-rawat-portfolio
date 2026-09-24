(() => {
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const control=document.getElementById('motion-toggle');
  let paused=false;
  try { paused=localStorage.getItem('sr-motion')==='paused'; } catch {}
  const animations=new Set();
  const enabled=()=>!paused&&!preference.matches;
  function applyPreference(){
    const stopped=!enabled();
    document.body.classList.toggle('motion-paused',stopped);
    control.setAttribute('aria-checked',String(!stopped));
    control.querySelector('.motion-state').textContent=stopped?'Off':'On';
    control.title=preference.matches?'Animations are off to match your device’s reduced motion setting.':'';
    control.disabled=preference.matches;
    if(stopped){animations.forEach(a=>a.cancel());animations.clear();}
  }
  control.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('sr-motion',paused?'paused':'enabled')}catch{}applyPreference()});
  preference.addEventListener('change',applyPreference);applyPreference();
  // Animate on entry without ever hiding content behind an observer or JS failure.
  if('IntersectionObserver' in window){
    const reveals=new IntersectionObserver(entries=>{
      entries.forEach(({isIntersecting,target})=>{
        if(!isIntersecting)return;
        reveals.unobserve(target);
        if(!enabled()||!target.animate)return;
        const animation=target.animate([{opacity:.15,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.2,.7,.25,1)',fill:'none'});
        animations.add(animation);animation.onfinish=()=>animations.delete(animation);
      });
    },{threshold:.08});
    document.querySelectorAll('.section-heading,.featured-project,.about-grid,.timeline article,.skill-card,.ai-section,.education,.contact-grid').forEach(el=>reveals.observe(el));
  }
  let scrollFrame=0;
  function progress(){scrollFrame=0;const available=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--read-progress',available>0?String(Math.min(1,Math.max(0,scrollY/available))):'0')}
  function queueProgress(){if(!scrollFrame)scrollFrame=requestAnimationFrame(progress)}
  addEventListener('scroll',queueProgress,{passive:true});addEventListener('resize',queueProgress);progress();
  const portrait=document.querySelector('.hero-portrait');
  let pointerFrame=0,lastEvent;
  document.addEventListener('pointermove',event=>{
    if(!enabled()||!finePointer.matches)return;
    lastEvent=event;
    if(pointerFrame)return;
    pointerFrame=requestAnimationFrame(()=>{
      pointerFrame=0;const e=lastEvent;
      const card=e.target.closest('.project,.skill-card');if(!card)return;
      const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      card.style.setProperty('--pointer-x',`${x}px`);card.style.setProperty('--pointer-y',`${y}px`);

    });
  },{passive:true});
  portrait.addEventListener('pointerleave',()=>{portrait.style.setProperty('--tilt-x','0deg');portrait.style.setProperty('--tilt-y','0deg')});
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-backgrounded',document.hidden));
})();
