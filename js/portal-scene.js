import * as THREE from "three";
import { worlds } from "./worlds.js";
import { planets } from "./data.js";
import { createCinemaDirector } from './cinema-scene.js';

// The entrance shares the renderer and the real planet materials with the
// learning scenes. DOM labels follow projected 3D coordinates, not a CSS grid.
export function createPortalScene({
  scene,
  camera,
  makePlanet,
  invalidate,
  onWorld,
}) {
  const group = new THREE.Group();
  group.name = "portal-destinations";
  group.visible = false;
  scene.add(group);
  // The sky belongs to the entire site. Destination meshes can disappear on
  // navigation without taking the nebula and its three-dimensional stars away.
  const backdrop = new THREE.Group();
  backdrop.name = "persistent-starfield";
  scene.add(backdrop);
  document.body.dataset.spaceBackdrop = "persistent";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = () => innerWidth < 760;
  const ids = ["earth", "mars", "venus", "neptune", "saturn"];
  const bodies = worlds.map((world, i) => {
    const source =
      planets.find((p) => p.texture === world.texture) ||
      planets.find((p) => p.id === ids[i]);
    const model = makePlanet({
      ...source,
      texture: world.texture,
      color: world.color,
    });
    model.userData.world = world;
    group.add(model);
    return model;
  });
  const foreground = makePlanet({...planets.find((p) => p.id === "mercury"), texture:"moon"});
  foreground.rotation.z = -0.32;
  group.add(foreground);
  const foregroundMoon = makePlanet(planets.find((p) => p.id === "mercury"));
  group.add(foregroundMoon);

  // A luminous, soft atmosphere and sparse orbit arcs give the landing scene
  // depth without obscuring the real surface imagery.
  bodies[0].userData.surface.rotation.y = 2.8;
  const orbitPaths=[];
  for(let i=0;i<2;i++){
    const points=[];
    for(let j=0;j<=150;j++){
      const a=(j/150)*Math.PI*1.72;
      points.push(new THREE.Vector3(Math.cos(a)*(2.2+i*.8),Math.sin(a)*(.82+i*.37),0));
    }
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:i?0x7778bd:0x8bb7ed,transparent:true,opacity:i?.11:.18,depthWrite:false}));
    line.rotation.z=.36;line.position.z=-2.5-i;orbitPaths.push(line);group.add(line);
  }

  // A continuous field of turbulent dust and gas, computed locally in a shader.
  const nebulaMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    uniforms: { uTime: { value: 0 }, uTravel: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
   varying vec2 vUv;uniform float uTime;uniform float uTravel;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
   float fbm(vec2 p){float v=0.,a=.52;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.03+3.1;a*=.49;}return v;}
   void main(){
    vec2 p=(vUv-.5)*vec2(3.4,2.1);p.x+=.10;
    float t=uTime*.0015;
    vec2 warp=vec2(fbm(p*3.+t),fbm(p*3.+vec2(8.3,-t)));
    float cloud=fbm(p*5.2+warp*2.9);
    float diagonal=p.y-p.x*.50+.05*sin(p.x*3.)+.02;
    float band=exp(-pow(diagonal*2.7,2.));
    float billow=pow(max(0.,cloud-.16),1.6)*band;
    float filament=fbm(p*18.+warp*4.);
    float dust=smoothstep(.35,.68,filament)*exp(-pow((diagonal+.035)*7.5,2.));
    float core=exp(-length((p-vec2(.15,.10))*vec2(1.4,3.8))*3.6);
    vec3 teal=vec3(.025,.16,.28),violet=vec3(.24,.10,.43),blue=vec3(.20,.32,.58);
    vec3 gas=mix(teal,violet,smoothstep(-.5,.9,p.x));
    gas=mix(gas,blue,core*.70);
    vec3 color=vec3(.002,.004,.013)+gas*billow*2.4;
    color+=vec3(.11,.17,.30)*core*.33;
    color*=1.-dust*.80;
    color+=vec3(.08,.035,.19)*exp(-length(p-vec2(.8,-.25))*2.5)*.44;
    gl_FragColor=vec4(color*(1.+uTravel*.25),1.);
   }`,
  });
  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(210, 130),
    nebulaMaterial,
  );
  nebula.position.set(0, 0, -70);
  nebula.renderOrder = -20;
  backdrop.add(nebula);

  // Star sizes are in screen pixels. A soft core and faint diffraction spikes
  // preserve detail without requiring a full-screen bloom pass on phones.
  const starPositions = [],
    starColors = [],
    starSizes = [],
    starSeeds = [];
  const starCount = mobile() ? 5500 : 15000;
  let seed = 19371;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < starCount; i++) {
    const along = (random() - 0.5) * 100;
    const lane = i < starCount * 0.66;
    const x = lane ? along : (random() - 0.5) * 120;
    const y = lane
      ? along * 0.31 + (random() + random() + random() - 1.5) * 9
      : (random() - 0.5) * 75;
    const z = -8 - random() * 65;
    starPositions.push(x, y, z);
    const c = new THREE.Color().setHSL(
      0.53 + random() * 0.16,
      0.08 + random() * 0.3,
      0.53 + random() * 0.38,
    );
    if (i % 11 === 0) c.set("#ecc89e");
    starColors.push(c.r, c.g, c.b);
    starSizes.push(
      random() > 0.987 ? 4 + random() * 3 : 0.5 + Math.pow(random(), 3) * 2.4,
    );
    starSeeds.push(random() * 20);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  starsGeometry.setAttribute(
    "aColor",
    new THREE.Float32BufferAttribute(starColors, 3),
  );
  starsGeometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(starSizes, 1),
  );
  starsGeometry.setAttribute(
    "aSeed",
    new THREE.Float32BufferAttribute(starSeeds, 1),
  );
  const starsMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio, 1.7) },
      uTravel: { value: 0 },
    },
    vertexShader: `attribute vec3 aColor;attribute float aSize;attribute float aSeed;varying vec3 vColor;varying float vSeed;uniform float uPixelRatio;uniform float uTravel;void main(){vColor=aColor;vSeed=aSeed;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=min(18.,aSize*uPixelRatio*(1.+uTravel*1.7));gl_Position=projectionMatrix*p;}`,
    fragmentShader: `varying vec3 vColor;varying float vSeed;uniform float uTime;void main(){vec2 p=gl_PointCoord-.5;float r=length(p);float core=exp(-r*r*95.);float glow=exp(-r*r*16.)*.17;float spike=exp(-abs(p.x)*110.)*exp(-abs(p.y)*9.)+exp(-abs(p.y)*110.)*exp(-abs(p.x)*9.);float a=(core+glow+spike*.12)*(.78+.22*sin(uTime*.65+vSeed));gl_FragColor=vec4(vColor,a);}`,
  });
  const deepStars = new THREE.Points(starsGeometry, starsMaterial);
  deepStars.frustumCulled = false;
  backdrop.add(deepStars);

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 256;
  const ctx = glowCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,246,222,1)");
  gradient.addColorStop(0.025, "rgba(255,225,179,.95)");
  gradient.addColorStop(0.075, "rgba(255,190,125,.38)");
  gradient.addColorStop(0.25, "rgba(165,133,179,.09)");
  gradient.addColorStop(1, "rgba(90,120,160,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const beacon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  beacon.position.set(-1.25, 0.45, -9);
  beacon.material.color.set('#b7c5ff');
  beacon.scale.set(4.5, 4.5, 1);
  backdrop.add(beacon);
  const streakMaterial = new THREE.LineBasicMaterial({
    color: 0xb6d5ec,
    transparent: true,
    opacity: 0,
  });
  const streakPositions = new Float32Array(90 * 6);
  for (let i = 0; i < 90; i++) {
    const a = random() * Math.PI * 2,
      r = 3 + random() * 13;
    streakPositions.set(
      [
        Math.cos(a) * r,
        Math.sin(a) * r,
        -8 - random() * 16,
        Math.cos(a) * r * 1.3,
        Math.sin(a) * r * 1.3,
        -4 - random() * 14,
      ],
      i * 6,
    );
  }
  const streakGeometry = new THREE.BufferGeometry();
  streakGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(streakPositions, 3),
  );
  group.add(new THREE.LineSegments(streakGeometry, streakMaterial));
  const dustPositions=[];
  for(let i=0;i<(mobile()?42:100);i++)dustPositions.push((random()-.5)*24,(random()-.5)*14,-2+random()*6);
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({size:.013,color:'#b6c9df',transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
  group.add(dust);
  const flare=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:'#b1c9ff',transparent:true,opacity:.10,depthWrite:false,blending:THREE.AdditiveBlending}));
  flare.position.copy(beacon.position);flare.scale.set(18,.13,1);backdrop.add(flare);

  const flightLayer = document.createElement("div");
  flightLayer.className = "portal-flight";
  flightLayer.hidden = true;
  flightLayer.innerHTML =
    '<div class="flight-curtain"></div><div class="flight-copy" role="status" aria-live="polite"><span>APPROACHING DESTINATION</span><strong></strong><p></p><div class="flight-progress"><i></i></div><small>ESC 取消航行</small></div>';
  document.body.append(flightLayer);
  let active = false,
    state = {},
    flight = null,
    arrivalAnimation = null,
    entrance = 1;
  let backdropTime = 0;
  let foregroundVisible = true;
  let voyageState = {intensity:0,progress:0};
  let pointer = new THREE.Vector2(),
    pan = new THREE.Vector2(),
    hovered = null;
  let labelNodes = [],
    lastContainer = null;
  const baseCamera = new THREE.Vector3(0, 0, 10),
    look = new THREE.Vector3();
  const cinema=createCinemaDirector({camera,bodies,invalidate});
  const screenLayouts = {
    desktop: [
      [0.66, 0.435, 1.24, 0],
      [0.46, 0.755, 0.30, -2],
      [0.88, 0.30, 0.30, -3],
      [0.875, 0.66, 0.43, -1],
      [0.68, 0.752, 0.27, 0.25],
    ],
    mobile: [
      [0.40, 0.44, 0.69, 0],
      [0.23, 0.70, 0.29, -2],
      [0.83, 0.35, 0.25, -3],
      [0.80, 0.59, 0.33, -1],
      [0.63, 0.795, 0.25, 0],
    ],
  };
  function layout() {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(40 / 2)) * 10,
      w = (h * innerWidth) / innerHeight;
    const positions = mobile() ? screenLayouts.mobile : screenLayouts.desktop;
    for (let i = 0; i < bodies.length; i++) {
      const [nx, ny, r, z] = positions[i],
        depth = (10 - z) / 10;
      const screenY =
        mobile() && innerHeight < 760 && i === 0 ? ny + 0.035 : ny;
      bodies[i].position.set(
        (nx - 0.5) * w * depth,
        (0.5 - screenY) * h * depth,
        z,
      );
      const size = mobile()
        ? r * Math.min(1, innerWidth / 430)
        : r * (innerWidth < 1100 ? 0.7 : 1);
      bodies[i].scale.setScalar(size);
    }
    foreground.position.set(-w * 0.48, -h * (mobile() ? 0.81 : 0.78), -0.3);
    foreground.scale.setScalar(mobile() ? 1.55 : 3.05);
    foregroundMoon.position.set(-w * 0.2, -h * 0.24, -3);
    foregroundMoon.scale.setScalar(mobile() ? 0.08 : 0.14);
    beacon.position.x = -w * 0.13;
    beacon.position.y = h * 0.13;
    flare.position.copy(beacon.position);
    orbitPaths.forEach((line,i)=>{line.position.x=bodies[0].position.x;line.position.y=bodies[0].position.y;line.scale.setScalar(mobile()?.6:1.05);});
  }
  function refreshLabels() {
    const container = document.querySelector(".world-map");
    if (container !== lastContainer) {
      lastContainer = container;
      labelNodes = worlds.map((w) =>
        document.querySelector(`.world-planet[data-value="${w.id}"]`),
      );
    }
  }
  function projectLabels() {
    refreshLabels();
    camera.updateMatrixWorld();
    group.updateMatrixWorld(true);
    const bounds = lastContainer?.getBoundingClientRect();
    if (!bounds) return;
    const pixels =
      innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    for (let i = 0; i < bodies.length; i++) {
      const node = labelNodes[i];
      if (!node) continue;
      const worldPosition = bodies[i].getWorldPosition(new THREE.Vector3());
      const p = worldPosition.clone().project(camera);
      const distance = worldPosition.distanceTo(camera.position);
      const size = Math.max(44, (bodies[i].scale.x / distance) * pixels * 2);
      node.style.left = `${(p.x * 0.5 + 0.5) * innerWidth - bounds.left}px`;
      node.style.top = `${(-p.y * 0.5 + 0.5) * innerHeight - bounds.top}px`;
      node.style.setProperty("--hit-size", `${size + 12}px`);
    }
  }
  function cancelFlight() {
    if (!flight) return;
    flight = null;
    delete document.body.dataset.portalFlight;
    flightLayer.hidden = true;
    streakMaterial.opacity = 0;
    starsMaterial.uniforms.uTravel.value = 0;
    nebulaMaterial.uniforms.uTravel.value = 0;
    invalidate();
  }
  function enterWorld(id) {
    if (!active || flight || state.dialog) return;
    cinema.cancel('navigation');
    const index = worlds.findIndex((w) => w.id === id);
    if (index < 0) return;
    if (scrollY) {
      window.scrollTo({top:0,behavior:'instant'});
      group.position.y = 0;
      foregroundVisible = true;
      group.visible = true;
      group.updateMatrixWorld(true);
    }
    if (reduced.matches) {
      onWorld?.(worlds[index].route);
      return;
    }
    arrivalAnimation?.cancel();
    flight = {
      index,
      time: 0,
      start: camera.position.clone(),
      fromLook: look.clone(),
    };
    flightLayer.hidden = false;
    flightLayer.style.opacity = "1";
    flightLayer.querySelector(".flight-copy").style.opacity = "";
    flightLayer.querySelector("strong").textContent = worlds[index].name;
    flightLayer.querySelector("p").textContent = worlds[index].theme;
    flightLayer.querySelector(".flight-curtain").style.opacity = "0";
    document.body.dataset.portalFlight = "true";
    invalidate();
  }
  function finishFlight() {
    const destination = worlds[flight.index].route;
    flight = null;
    delete document.body.dataset.portalFlight;
    flightLayer.querySelector(".flight-copy").style.opacity = "0";
    onWorld?.(destination);
    arrivalAnimation = flightLayer.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 650,
      easing: "ease-out",
      fill: "forwards",
    });
    arrivalAnimation.onfinish = () => {
      flightLayer.hidden = true;
      flightLayer.querySelector(".flight-copy").style.opacity = "";
    };
  }
  function setActive(value, s) {
    state = { ...s };
    if(state.paused||state.dialog)cinema.cancel(state.dialog?'dialog':'paused');
    if (value !== active) {
      cinema.cancel('navigation');
      active = value;
      group.visible = value && foregroundVisible;
      cancelFlight();
      starsMaterial.uniforms.uTravel.value = 0;
      nebulaMaterial.uniforms.uTravel.value = 0;
      streakMaterial.opacity = 0;
      if (active) {
        entrance = reduced.matches ? 1 : 0;
        starsMaterial.uniforms.uTravel.value = 0;
        nebulaMaterial.uniforms.uTravel.value = 0;
        if (!reduced.matches) camera.position.set(0, 0, 13.5);
        layout();
      } else {
        camera.position.set(0, 0, 10);
        camera.fov = 40;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        document.querySelector("#universe").style.cursor = "";
        lastContainer = null;
        labelNodes = [];
      }
    }
  }
  function update(delta, elapsed, dragX, dragY, zoomValue, showForeground = true, scrollPixels = 0) {
    const autonomous = !state.paused && !state.dialog && !reduced.matches;
    if (autonomous) backdropTime += delta;
    nebulaMaterial.uniforms.uTime.value = backdropTime;
    starsMaterial.uniforms.uTime.value = backdropTime;
    backdrop.rotation.set(
      Math.sin(backdropTime * 0.013) * 0.002,
      Math.sin(backdropTime * 0.009) * 0.003,
      reduced.matches ? 0 : -Math.sin(voyageState.progress*.7)*voyageState.intensity*.012,
    );
    backdrop.position.set(
      reduced.matches ? 0 : -Math.sin(voyageState.progress*.65)*voyageState.intensity*.65,
      reduced.matches ? 0 : Math.sin(voyageState.progress*.8)*voyageState.intensity*.20,
      reduced.matches ? 0 : voyageState.intensity*.8,
    );
    if (!active) return false;
    foregroundVisible = showForeground;
    group.visible = foregroundVisible;
    const pixelsPerUnit = innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z);
    group.position.y = scrollPixels / pixelsPerUnit;
    entrance = Math.min(1, entrance + delta * 0.6);
    const smooth = 1 - Math.exp(-delta * 3);
    const desired = autonomous ? pointer : new THREE.Vector2();
    pan.lerp(desired, smooth);
    const cinemaPlaying=cinema.active;
    if (cinemaPlaying) {
      cinema.update(delta,{paused:state.paused,dialog:state.dialog});
    } else if (!flight) {
      const intro = 1 - Math.pow(1 - entrance, 3);
      const orbitX = THREE.MathUtils.clamp(dragX, -1.5, 1.5);
      baseCamera.set(
        pan.x * 0.09 + orbitX * 0.3,
        pan.y * 0.06 - dragY * 0.3,
        10 / zoomValue + (1 - intro) * 3.5,
      );
      camera.position.lerp(baseCamera, 1 - Math.exp(-delta * 6));
      look.set(pan.x * 0.04 + orbitX * 0.9, pan.y * 0.025 - dragY * 0.9, 0);
      camera.lookAt(look);
      camera.fov = 40;
      camera.updateProjectionMatrix();
    } else {
      flight.time += delta;
      const t = Math.min(1, flight.time / 2.5),
        ease = t * t * t * (t * (t * 6 - 15) + 10);
      const target = bodies[flight.index],
        radius = target.scale.x;
      const targetPosition = target.getWorldPosition(new THREE.Vector3());
      const destination = targetPosition
        .clone()
        .add(new THREE.Vector3(radius * 0.18, radius * 0.1, radius * 2.4));
      const takeoff=Math.sin(Math.min(1,t/.42)*Math.PI)*.24;
      const curve=new THREE.Vector3((flight.index%2?-.32:.38)*Math.sin(t*Math.PI),takeoff+Math.sin(t*Math.PI)*.14,Math.sin(t*Math.PI)*.5);
      camera.position.lerpVectors(flight.start, destination, ease).add(curve);
      look.lerpVectors(flight.fromLook, targetPosition, ease);
      camera.lookAt(look);
      camera.fov = 40 + Math.sin(t * Math.PI) * 5.5;
      camera.updateProjectionMatrix();
      starsMaterial.uniforms.uTravel.value = Math.sin(t * Math.PI);
      nebulaMaterial.uniforms.uTravel.value = t;
      streakMaterial.opacity = Math.sin(t * Math.PI) * 0.18;
      flightLayer.querySelector(".flight-progress i").style.transform =
        `scaleX(${t})`;
      flightLayer.querySelector(".flight-curtain").style.opacity = String(
        THREE.MathUtils.smoothstep(t, 0.73, 1),
      );
      if (t >= 1) {
        finishFlight();
        return false;
      }
    }
    if (autonomous) {
      for (const [i, body] of bodies.entries()) {
        body.userData.surface.rotation.y += delta * (0.025 + i * 0.006);
        if (body.userData.clouds)
          body.userData.clouds.rotation.y += delta * 0.035;
      }
      foreground.userData.surface.rotation.y += delta * 0.012;
      dust.rotation.y+=delta*.003;
    }
    projectLabels();
    document.body.dataset.portalReady = "true";
    if(cinema.active)return !state.paused&&!state.dialog;
    return (
      !!flight ||
      (cinema.active && !state.paused) ||
      entrance < 1 ||
      camera.position.distanceTo(baseCamera) > 0.001 ||
      pan.distanceTo(desired) > 0.001
    );
  }
  function pick(event, activate = false) {
    if (!active || !foregroundVisible || flight || state.dialog) return;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(
      new THREE.Vector2(
        (event.clientX / innerWidth) * 2 - 1,
        1 - (event.clientY / innerHeight) * 2,
      ),
      camera,
    );
    const hits = ray.intersectObjects(bodies, true);
    let model = hits[0]?.object;
    while (model && !model.userData.world) model = model.parent;
    hovered = model?.userData.world?.id || null;
    document.querySelector("#universe").style.cursor = hovered
      ? "pointer"
      : "grab";
    if (activate && hovered) enterWorld(hovered);
  }
  function pointerMove(event) {
    if (!active) return;
    pointer.set(
      (event.clientX / innerWidth - 0.5) * 2,
      (0.5 - event.clientY / innerHeight) * 2,
    );
    if (event.target === document.querySelector("#universe")) pick(event);
    if (!state.paused && !reduced.matches) invalidate();
  }
  function key(event) {
    if(event.key==='Escape'&&cinema.active){event.preventDefault();cinema.cancel('escape');}
    if (event.key === "Escape" && flight) {
      event.preventDefault();
      cancelFlight();
    }
  }
  function resize() {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(40 / 2)) * 10;
    beacon.position.x = -h * innerWidth / innerHeight * 0.13;
    beacon.position.y = h * 0.13;
    if (active) {
      layout();
      invalidate();
    }
  }
  addEventListener("pointermove", pointerMove, { passive: true });
  addEventListener("keydown", key);
  addEventListener("resize", resize);
  layout();
  return {
    playCinematic(){
      if(!active||flight||state.dialog)return false;
      if(scrollY)window.scrollTo({top:0,behavior:'instant'});
      group.position.y=0;group.visible=true;group.updateMatrixWorld(true);
      return cinema.play();
    },
    cancelCinematic:cinema.cancel,
    get cinematicActive(){return cinema.active;},
    setVoyage(value) { voyageState = value; },
    setActive,
    update,
    pick,
    enterWorld,
    dispose() {
      cinema.cancel('disposed');
      cancelFlight();
      arrivalAnimation?.cancel();
      flightLayer.remove();
      glowTexture.dispose();
      removeEventListener("pointermove", pointerMove);
      removeEventListener("keydown", key);
      removeEventListener("resize", resize);
      delete document.body.dataset.portalReady;
      delete document.body.dataset.portalRenderer;
      delete document.body.dataset.spaceBackdrop;
    },
  };
}
