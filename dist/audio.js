'use strict';
// Short local synthesizer: no downloads, microphone access, or autoplay needed.
window.gameAudio=(()=>{
  let context=null,enabled=true;
  function unlock(){
    if(!enabled)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context??=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});}catch{context=null;}
  }
  function collect(){
    if(!enabled||!context||context.state!=='running')return;
    const now=context.currentTime;
    [1046.5,1568,2093].forEach((frequency,i)=>{
      const at=now+i*.045,osc=context.createOscillator(),gain=context.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(frequency,at);
      gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.055,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.19);
      osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.2);
    });
  }
  function toggle(){enabled=!enabled;if(enabled)unlock();const button=document.querySelector('#sound');button.textContent=enabled?'♪ 소리 켜짐':'♪ 소리 꺼짐';button.setAttribute('aria-pressed',String(enabled));}
  document.querySelector('#sound').onclick=toggle;
  return {unlock,collect,get enabled(){return enabled;}};
})();
