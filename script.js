const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle');
const resetBtn = document.getElementById('reset');
const speedInput = document.getElementById('speed');
const themeSelect = document.getElementById('theme');

const themes = {
  aurora: { baseHue: 180, spread: 60, saturation: 75, lightness: 62, glow: 0.4 },
  sunset: { baseHue: 25, spread: 70, saturation: 82, lightness: 60, glow: 0.5 },
  electric: { baseHue: 260, spread: 75, saturation: 80, lightness: 65, glow: 0.55 },
  mono: { baseHue: 210, spread: 10, saturation: 12, lightness: 88, glow: 0.28 }
};

const config = {
  particleCount: 140,
  minRadius: 30,
  maxRadius: 260,
  pulseStrength: 18
};

let particles = [];
let playing = true;
let lastTime = 0;
let hueOffset = 0;
let dpr = window.devicePixelRatio || 1;
let width = 0;
let height = 0;
let cx = 0;
let cy = 0;
let theme = themes[themeSelect.value];

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = width / 2;
  cy = height / 2;
}

window.addEventListener('resize', resize);
resize();

function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
  return {
    angle,
    radius,
    speed: 0.15 + Math.random() * 0.55,
    wobble: 0.4 + Math.random() * 1.2,
    offset: Math.random() * Math.PI * 2
  };
}

function reset() {
  particles = Array.from({ length: config.particleCount }, createParticle);
  hueOffset = Math.random() * 360;
}

reset();

function drawCore(time) {
  const pulse = Math.sin(time * 0.003) * 0.5 + 0.5;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, config.minRadius * 1.15);
  gradient.addColorStop(0, `hsla(${theme.baseHue + hueOffset}, 80%, 65%, 0.25)`);
  gradient.addColorStop(0.8, 'rgba(5, 9, 18, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, config.minRadius * (1.05 + pulse * 0.08), 0, Math.PI * 2);
  ctx.fill();
}

function animate(now) {
  if (!lastTime) lastTime = now;
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  const speedScale = parseFloat(speedInput.value);
  ctx.fillStyle = 'rgba(5, 9, 18, 0.2)';
  ctx.fillRect(0, 0, width, height);

  drawCore(now);
  ctx.globalCompositeOperation = 'lighter';

  particles.forEach((p, idx) => {
    const hue = theme.baseHue + hueOffset + (idx / config.particleCount) * theme.spread;
    const pulse = Math.sin(now * 0.002 + p.offset) * config.pulseStrength;
    const orbitRadius = p.radius + pulse * p.wobble;
    p.angle += p.speed * speedScale * delta;

    const x = cx + Math.cos(p.angle) * orbitRadius;
    const y = cy + Math.sin(p.angle) * orbitRadius * 0.7; // squash to mimic lens depth
    const size = 3 + Math.sin(now * 0.005 + p.offset) * 1.8;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(size * 12, 30));
    const alpha = 0.35 + Math.sin(now * 0.002 + idx) * 0.1;
    gradient.addColorStop(0, `hsla(${hue}, ${theme.saturation}%, ${theme.lightness}%, ${0.8 * alpha})`);
    gradient.addColorStop(0.5, `hsla(${hue + 12}, ${theme.saturation + 5}%, ${theme.lightness + 10}%, ${0.6 * alpha})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  hueOffset = (hueOffset + delta * 12 * speedScale * theme.glow) % 360;

  if (playing) requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

toggleBtn.addEventListener('click', () => {
  playing = !playing;
  toggleBtn.textContent = playing ? '暂停' : '播放';
  if (playing) {
    lastTime = 0;
    requestAnimationFrame(animate);
  }
});

resetBtn.addEventListener('click', () => {
  reset();
});

themeSelect.addEventListener('change', (e) => {
  theme = themes[e.target.value];
});
