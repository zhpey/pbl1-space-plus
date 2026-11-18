// Original, locally synthesised ambient sound. No audio is started before a click.
let context, master, timer, enabled = false, pending = false;
const cinematicVoices=new Set();
let movieState=null,movieShot=-1,movieBeat=-1;
const notes = [174.61, 196, 261.63, 293.66, 349.23, 392];

function buildSoundscape() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) throw new Error('unsupported');
  context = new Audio();
  master = context.createGain();
  master.gain.value = 0.16;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 1800;
  const delay = context.createDelay(2);
  delay.delayTime.value = 0.72;
  const feedback = context.createGain(); feedback.gain.value = 0.31;
  filter.connect(master); filter.connect(delay); delay.connect(feedback);
  feedback.connect(delay); delay.connect(master); master.connect(context.destination);
  [65.406, 97.999, 130.813].forEach((frequency, i) => {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    oscillator.detune.value = i * 3 - 3; gain.gain.value = 0.075;
    oscillator.connect(gain); gain.connect(filter); oscillator.start();
    const lfo = context.createOscillator(), depth = context.createGain();
    lfo.frequency.value = 0.07 + i * 0.019; depth.gain.value = 0.025;
    lfo.connect(depth); depth.connect(gain.gain); lfo.start();
  });
  let step = 0;
  function chime() {
    if (!enabled || document.hidden || context.state !== 'running'||movieState?.active) return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'sine'; oscillator.frequency.value = notes[[0, 2, 4, 1, 3, 5, 2, 4][step++ % 8]];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 7);
    oscillator.connect(gain); gain.connect(filter); oscillator.start(now); oscillator.stop(now + 7.1);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  timer = setInterval(chime, 4400);
}

export function isSpaceAudioEnabled() { return enabled; }

export async function setSpaceAudioEnabled(value){
 try{if(!context)buildSoundscape();enabled=!!value;if(enabled&&!document.hidden)await context.resume();else{stopSpaceCues();await context.suspend();}document.dispatchEvent(new CustomEvent('space-audio-reflect'));return enabled;}
 catch{enabled=false;document.dispatchEvent(new CustomEvent('space-audio-reflect'));return false;}
}

function filmTone(frequency,duration,level,type='sine',pan=0){
 const at=context.currentTime,envelope=context.createGain(),voice=context.createOscillator(),panner=context.createStereoPanner();voice.type=type;voice.frequency.value=frequency;panner.pan.value=pan;
 envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(level,at+Math.min(.9,duration*.2));envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
 voice.connect(envelope);envelope.connect(panner);panner.connect(master);voice.start(at);voice.stop(at+duration+.04);
 const cue={envelope,voices:[voice]};cinematicVoices.add(cue);voice.onended=()=>{voice.disconnect();envelope.disconnect();panner.disconnect();cinematicVoices.delete(cue);};
}

function movieScore(event){
 const d=event.detail||{};movieState=d;
 if(context&&master)master.gain.setTargetAtTime(d.active&&(d.paused||d.ended)?0:.16,context.currentTime,.12);
 if(!enabled||!context||context.state!=='running'||!d.active||d.paused||d.ended||document.hidden){if(movieShot!==-1)stopSpaceCues();movieShot=-1;movieBeat=-1;return;}
 if(movieShot!==d.shotIndex){stopSpaceCues();movieShot=d.shotIndex;movieBeat=-1;
  const chords=[[130.81,155.56,196],[130.81,174.61,207.65],[130.81,164.81,196],[98,146.83,196]];
  const chord=chords[d.shotIndex===11?2:d.shotIndex===9?3:d.shotIndex%2];
  chord.forEach((hz,i)=>{filmTone(hz,8,.13/(1+i*.3),'sine',(i-1)*.5);filmTone(hz*1.002,7,.055,'triangle',(1-i)*.5);});
  if(d.shotIndex>0)filmTone(d.shotIndex===9?32.7:49,3.5,.18,'sine');
 }
 const beat=Math.floor(d.time/1.35);
 if(beat!==movieBeat){movieBeat=beat;const pattern=[261.63,392,311.13,523.25,392,349.23,311.13,196];const note=d.shotIndex===11?[261.63,329.63,392,523.25][beat%4]:pattern[beat%8];if(d.shotIndex!==0)filmTone(note,d.shotIndex===9?3:4.1,d.shotIndex===9?.035:.07,'sine',Math.sin(beat*1.6)*.65);}
}

// Short original camera cues follow the same explicit audio switch as the score.
export function playSpaceCue(kind='reveal') {
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  const at=context.currentTime,span=kind==='travel'?2.5:3.2;
  const envelope=context.createGain();envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(kind==='travel'?.11:.075,at+.45);envelope.gain.exponentialRampToValueAtTime(.0001,at+span);envelope.connect(master);
  const frequencies=kind==='opening'?[49,73.416,146.832]:kind==='travel'?[65.406,97.999]:[97.999,146.832,195.998];
  const voices=frequencies.map((hz,i)=>{const voice=context.createOscillator(),gain=context.createGain();voice.type='sine';voice.frequency.setValueAtTime(hz*(kind==='travel'?.7:1),at);voice.frequency.exponentialRampToValueAtTime(hz,at+span*.8);gain.gain.value=.5/(i+1);voice.connect(gain);gain.connect(envelope);voice.start(at);voice.stop(at+span+.1);voice.onended=()=>{voice.disconnect();gain.disconnect();};return voice;});
  const cue={envelope,voices};cinematicVoices.add(cue);
  voices.at(-1).addEventListener('ended',()=>{envelope.disconnect();cinematicVoices.delete(cue);},{once:true});
}

// Local mechanical foley, gated by the same user-controlled sound switch.
// A stylised bridge monitor sound, rather than sound propagating through vacuum.
export function playShipCue(system,opening=true){
 if(!enabled||!context||context.state!=='running'||document.hidden)return;
 const direction=opening?1:.76;
 if(system==='radar'){filmTone(720*direction,.19,.12,'sine',-.25);filmTone(1040*direction,.32,.045,'sine',.25);return;}
 if(system==='power'){filmTone(88*direction,.85,.15,'triangle',-.35);filmTone(176*direction,1.2,.055,'sine',.35);}
 else if(system==='engine'){filmTone(36*direction,1.8,.27,'sine');filmTone(72*direction,1.4,.08,'triangle');}
 else{filmTone((system==='bay'?96:142)*direction,.64,.075,'triangle');filmTone(58,.2,.08,'sine');}
 const duration=system==='engine'?1.3:system==='bay'?.8:.4,at=context.currentTime,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
 let seed=7361;for(let i=0;i<data.length;i++){seed=seed*16807%2147483647;data[i]=((seed-1)/2147483646*2-1);}
 const source=context.createBufferSource(),filter=context.createBiquadFilter(),envelope=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=system==='engine'?220:system==='bay'?420:680;filter.Q.value=.8;
 envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(system==='engine'?.22:.09,at+.08);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(filter);filter.connect(envelope);envelope.connect(master);source.start(at);
 const cue={envelope,voices:[source]};cinematicVoices.add(cue);source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();cinematicVoices.delete(cue);};
}
export function stopSpaceCues(){
  if(!context)return;
  for(const cue of cinematicVoices){cue.envelope.gain.cancelScheduledValues(context.currentTime);cue.envelope.gain.setTargetAtTime(.0001,context.currentTime,.04);for(const voice of cue.voices){try{voice.stop(context.currentTime+.2);}catch{}}}
}

export function setupSpaceAudio() {
  document.addEventListener('space-film-update',movieScore);
  document.addEventListener('space-film-command',e=>{if(e.detail?.action==='seek'){stopSpaceCues();movieShot=-1;movieBeat=-1;}});
  function reflect(message = '') {
    document.body.dataset.spaceAudio = String(enabled);
    for (const button of document.querySelectorAll('button[data-space-audio]')) {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? '关闭星际氛围音乐' : '开启星际氛围音乐');
      button.title = message || (enabled ? '关闭星际氛围音乐' : '开启星际氛围音乐');
      const label = button.querySelector('span'); if (label) label.textContent = message || (enabled ? '声音已开启' : '开启声音');
    }
  }
  document.addEventListener('space-audio-reflect',()=>reflect());
  document.addEventListener('click', async event => {
    if (!event.target.closest('button[data-space-audio]') || pending) return;
    pending = true;
    try {
      if (!context) buildSoundscape();
      enabled = !enabled;
      if(!enabled)stopSpaceCues();
      if (enabled && !document.hidden) await context.resume();
      else await context.suspend();
      reflect();
    } catch { enabled = false; reflect('声音暂不可用'); }
    finally { pending = false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) context.suspend().catch(() => {});
    else if (enabled) context.resume().catch(() => {});
  });
  addEventListener('pagehide', () => { clearInterval(timer); context?.close().catch(() => {}); });
  reflect();
}
