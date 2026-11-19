(() => {
  const view = document.querySelector('.view');
  const canvas = document.querySelector('#orbital-view');
  const slider = document.querySelector('#phase');
  const phaseName = document.querySelector('#phase-name');
  const note = document.querySelector('#scene-note');
  const presets = [...document.querySelectorAll('[data-phase]')];
  const playButton = document.querySelector('#replay');
  const playLabel = document.querySelector('#play-label');
  const playIcon = document.querySelector('#play-icon');
  const sceneSpace = document.querySelector('.scene-space');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 700px)');
  const context = canvas.getContext('2d', { alpha: false });
  const earth = document.createElement('canvas');
  const surface = earth.getContext('2d');
  const start = Number(slider.value);
  const sunX = 0.85;
  const sunY = Math.sqrt(1 - sunX * sunX);
  const radians = Math.PI / 180;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const smooth = (from, to, value) => {
    const t = clamp((value - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  };
  let textures, pixels, geometry;
  let width, height, centerX, centerY, radius;
  let phase = start;
  let statusIndex = -1;
  let sliderPosition;
  let playback = 0;
  let redraw = 0;
  let resume = false;

  const stages = [
    [26, '深夜', '先找仍在黑暗中的陆地。灯光沿城市和海岸聚集。'],
    [42, '日出前', '寻找暗面边上的蓝色薄弧，那是被阳光照亮的大气。'],
    [61, '黎明', '高处的云可以先见到阳光，下面的地面仍在阴影中。'],
    [82, '日出', '晨昏线分开白昼和黑夜。比较它两侧的云层和地表。'],
    [101, '进入昼侧', '阳光照亮地表后，城市灯光变得难以看见。'],
  ];

  function readTexture(path, width, height) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const texture = document.createElement('canvas');
          texture.width = width;
          texture.height = height;
          const drawing = texture.getContext('2d', { willReadFrequently: true });
          drawing.drawImage(image, 0, 0, width, height);
          resolve(drawing.getImageData(0, 0, width, height).data);
        } catch (error) { reject(error); }
      };
      image.onerror = reject;
      image.src = path;
    });
  }

  // Cache geography and surface normals. Moving the light only changes shading.
  function mapEarth(size) {
    earth.width = earth.height = size;
    pixels = surface.createImageData(size, size);
    const data = new Float32Array(size * size * 3);
    const colors = new Uint8Array(size * size * 7);
    const lat = 24 * radians;
    const lon = 18 * radians;
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);
    const { day, night, clouds } = textures;
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const x = (column + 0.5) * 2 / size - 1;
        const y = 1 - (row + 0.5) * 2 / size;
        const depth = 1 - x * x - y * y;
        if (depth <= 0) continue;
        const z = Math.sqrt(depth);
        const v = 0.5 - Math.asin(y * cosLat + z * sinLat) / Math.PI;
        const u = (1.5 + (Math.atan2(x, z * cosLat - y * sinLat) + lon) / (2 * Math.PI)) % 1;
        const texel = (clamp(Math.floor(v * 512), 0, 511) * 1024 + Math.floor(u * 1024)) * 4;
        const position = row * size + column;
        const value = position * 3;
        const color = position * 7;
        data[value] = x * sunX + y * sunY;
        data[value + 1] = z;
        data[value + 2] = Math.pow(1 - z, 3.3);
        colors.set(day.subarray(texel, texel + 3), color);
        colors.set(night.subarray(texel, texel + 3), color + 3);
        colors[color + 6] = clouds[texel];
        pixels.data[position * 4 + 3] = Math.min(255, Math.round(depth * size * 95));
      }
    }
    return { data, colors };
  }

  const cloudOpacity = Float32Array.from({ length: 256 }, (_, value) =>
    Math.pow(Math.max(0, value / 255 - 0.06), 1.24));

  function shadeEarth(angle) {
    const { data, colors } = geometry;
    const output = pixels.data;
    const side = Math.sin(angle);
    const front = Math.cos(angle);
    for (let pixel = 0, normal = 0, color = 0; pixel < output.length; pixel += 4, normal += 3, color += 7) {
      if (!output[pixel + 3]) continue;
      const illumination = data[normal] * side + data[normal + 1] * front;
      const daylight = Math.max(0, illumination);
      const ground = 0.024 + 0.94 * Math.sqrt(daylight);
      const city = 1 - smooth(-0.18, 0.13, illumination);
      const cloud = cloudOpacity[colors[color + 6]];
      const cloudLight = cloud * (7 + 171 * Math.sqrt(Math.max(illumination + 0.055, 0)));
      const heat = Math.max(0, 1 - Math.abs(illumination + 0.025) * 7) * 0.75;
      const rim = data[normal + 2] * (0.19 + 0.87 * smooth(-0.46, 0.44, illumination));
      const amber = Math.max(colors[color + 3] - 7, 0) * city * 1.43;
      const pale = Math.max(colors[color + 4] - 9, 0) * city;
      output[pixel] = 2 + colors[color] * ground + amber + cloudLight + 25 * heat + 38 * rim;
      output[pixel + 1] = 6 + colors[color + 1] * ground + pale * 1.12 + cloudLight + 9 * heat + 112 * rim;
      output[pixel + 2] = 15 + colors[color + 2] * ground + pale * 0.69 + cloudLight * 1.04 + 213 * rim;
    }
    surface.putImageData(pixels, 0, 0);
  }

  // A seeded sky avoids flicker while the light moves.
  let seed = 5047;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const stars = Array.from({ length: 550 }, () => [random(), random(), random() ** 3, random()]);

  function glow(x, y, size, stops) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, size);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    context.fillStyle = gradient;
    context.fillRect(x - size, y - size, size * 2, size * 2);
  }

  function draw() {
    context.fillStyle = '#030711';
    context.fillRect(0, 0, width, height);
    glow(centerX, centerY, radius * 2.45, [[0, '#152643'], [0.38, '#0a1729'], [1, '#03071100']]);
    for (const [x, y, brightness, tint] of stars) {
      const size = 0.45 + brightness * 1.23;
      context.fillStyle = tint > 0.86 ? `rgba(255,220,176,${0.12 + brightness * 0.64})` : `rgba(174,210,246,${0.13 + brightness * 0.71})`;
      context.fillRect(x * width, y * height, size, size);
    }

    const angle = (163 - 1.36 * phase) * radians;
    const horizonX = centerX + radius * sunX;
    const horizonY = centerY - radius * sunY;
    const limb = context.createRadialGradient(centerX, centerY, radius * 0.997, centerX, centerY, radius * 1.066);
    limb.addColorStop(0, '#6daafd85');
    limb.addColorStop(0.23, '#2668c44a');
    limb.addColorStop(1, '#1c55a200');
    context.fillStyle = limb;
    context.beginPath();
    context.arc(centerX, centerY, radius * 1.066, 0, Math.PI * 2);
    context.fill();
    glow(horizonX, horizonY, radius * 0.51, [[0, '#65b6ff67'], [0.48, '#2f7bc22e'], [1, '#2463bd00']]);

    shadeEarth(angle);
    context.drawImage(earth, centerX - radius, centerY - radius, radius * 2, radius * 2);

    const sunrise = smooth(36, 53, phase);
    if (sunrise > 0) {
      const distance = radius * (0.991 + 0.19 * smooth(37, 84, phase));
      const x = centerX + sunX * distance;
      const y = centerY - sunY * distance;
      context.save();
      context.globalCompositeOperation = 'screen';
      context.globalAlpha = sunrise;
      glow(x, y, radius * 0.9, [[0, '#ffd48bba'], [0.12, '#f9a34462'], [0.42, '#ce572c25'], [1, '#b65d1e00']]);
      glow(x, y, radius * 0.22, [[0, '#fff9e7'], [0.08, '#fff8d7'], [0.24, '#ffe4a689'], [0.55, '#ff9c363c'], [1, '#ff9c3600']]);
      const streak = context.createLinearGradient(x - radius * 0.62, y, x + radius * 0.62, y);
      streak.addColorStop(0, '#ffb36500');
      streak.addColorStop(0.49, '#ffe1a99e');
      streak.addColorStop(0.51, '#fff1ceaa');
      streak.addColorStop(1, '#ffb36500');
      context.fillStyle = streak;
      context.fillRect(x - radius * 0.62, y - 0.45, radius * 1.24, 0.9);
      context.restore();
    }
  }

  function resize() {
    const bounds = view.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (compact.matches) {
      const slot = sceneSpace.getBoundingClientRect();
      radius = Math.min(width * 0.405, 214, slot.height * 0.50);
      centerX = width * 0.51;
      centerY = slot.top - bounds.top + slot.height * 0.48;
    } else {
      radius = Math.min(width * 0.276, height * 0.43, 451);
      centerX = width * 0.694;
      centerY = height * 0.51;
    }
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const size = Math.max(256, Math.min(820, Math.ceil(radius * 2 * ratio / 40) * 40));
    if (earth.width !== size || !geometry) geometry = mapEarth(size);
    draw();
  }

  function queueDraw() {
    if (redraw) return;
    redraw = requestAnimationFrame(() => { redraw = 0; draw(); });
  }

  function setPhase(value) {
    phase = value;
    const position = Math.round(value);
    const index = stages.findIndex(([limit]) => value < limit);
    if (index !== statusIndex) {
      statusIndex = index;
      const [, name, explanation] = stages[index];
      phaseName.value = name;
      note.textContent = explanation;
    }
    if (position !== sliderPosition) {
      sliderPosition = position;
      slider.value = position;
      slider.style.setProperty('--position', `${position}%`);
      slider.setAttribute('aria-valuetext', `${stages[index][1]}，${position}%`);
      for (const button of presets) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.phase) === position));
      }
    }
    queueDraw();
  }

  function updateButton(playing) {
    if (reducedMotion.matches) playLabel.textContent = phase >= 75 ? '回到日出前' : '查看昼侧';
    else if (playing) playLabel.textContent = '暂停';
    else if (resume) playLabel.textContent = '继续播放';
    else if (phase >= 100) playLabel.textContent = '重播日出';
    else playLabel.textContent = '播放日出';
    playIcon.textContent = playing ? 'Ⅱ' : '▶';
  }

  function pause() {
    if (!playback) return;
    cancelAnimationFrame(playback);
    playback = 0;
    resume = true;
    updateButton(false);
  }

  function scrub(value) {
    pause();
    resume = false;
    setPhase(value);
    updateButton(false);
  }

  function play() {
    if (playback) { pause(); return; }
    if (reducedMotion.matches) {
      setPhase(phase >= 75 ? start : 89);
      updateButton(false);
      return;
    }
    const from = resume ? phase : phase >= 100 ? start : phase;
    const duration = Math.max(1, (100 - from) * 130);
    const startedAt = performance.now();
    updateButton(true);
    function advance(now) {
      const fraction = clamp((now - startedAt) / duration, 0, 1);
      setPhase(from + (100 - from) * fraction);
      if (fraction < 1) {
        playback = requestAnimationFrame(advance);
      } else {
        playback = 0;
        resume = false;
        updateButton(false);
      }
    }
    playback = requestAnimationFrame(advance);
  }

  async function initialize() {
    try {
      if (!context || !surface) throw new Error('Canvas unavailable');
      const [day, night, clouds] = await Promise.all([
        readTexture('assets/textures/earth_daymap.jpg', 1024, 512),
        readTexture('assets/odyssey/earth-night.jpg', 1024, 512),
        readTexture('assets/textures/earth_cloudalpha.jpg', 1024, 512),
      ]);
      textures = { day, night, clouds };
      resize();
      view.classList.add('is-ready');
      slider.disabled = playButton.disabled = false;
      setPhase(start);
      updateButton(false);
      slider.addEventListener('input', () => scrub(Number(slider.value)));
      for (const button of presets) {
        button.disabled = false;
        button.addEventListener('click', () => scrub(Number(button.dataset.phase)));
      }
      playButton.addEventListener('click', play);
      reducedMotion.addEventListener('change', () => { pause(); updateButton(false); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
      addEventListener('pagehide', pause);
      new ResizeObserver(resize).observe(view);
    } catch {
      note.textContent = '互动场景暂不可用，当前显示静态地球。';
    }
  }

  initialize();
})();
