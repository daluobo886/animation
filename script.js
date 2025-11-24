const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle');
const resetBtn = document.getElementById('reset');
const speedInput = document.getElementById('speed');

let width = 0;
let height = 0;
let dpr = window.devicePixelRatio || 1;
let lastTime = 0;
let playing = true;
let progress = 0;

const palette = {
  bg: '#f5eddc',
  stroke: '#d6413a',
  fill: 'rgba(214, 65, 58, 0.12)',
  accent: '#c4312e',
  text: '#3a2f2a',
  muted: '#6f5c4f'
};

const curvePoints = [
  { x: 0.08, y: 0.12 },
  { x: 0.2, y: 0.18 },
  { x: 0.32, y: 0.32 },
  { x: 0.44, y: 0.28 },
  { x: 0.58, y: 0.42 },
  { x: 0.7, y: 0.35 },
  { x: 0.82, y: 0.58 },
  { x: 0.92, y: 0.72 }
];

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);
resize();

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawBackground() {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(106, 91, 77, 0.14)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const y = (height * 0.18) + i * (height * 0.14);
    ctx.moveTo(width * 0.05, y);
    ctx.lineTo(width * 0.95, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHouse() {
  const baseX = width * 0.73;
  const baseY = height * 0.55;
  const w = width * 0.16;
  const h = height * 0.22;

  ctx.fillStyle = '#d9d0c1';
  ctx.strokeStyle = '#6a5b4d';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(baseX + w * 0.1, baseY + h);
  ctx.lineTo(baseX + w * 0.1, baseY + h * 0.35);
  ctx.lineTo(baseX + w * 0.5, baseY);
  ctx.lineTo(baseX + w * 0.9, baseY + h * 0.35);
  ctx.lineTo(baseX + w * 0.9, baseY + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#b7a48c';
  ctx.beginPath();
  ctx.moveTo(baseX + w * 0.08, baseY + h * 0.35);
  ctx.lineTo(baseX + w * 0.5, baseY - h * 0.2);
  ctx.lineTo(baseX + w * 0.92, baseY + h * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ede7db';
  ctx.fillRect(baseX + w * 0.2, baseY + h * 0.45, w * 0.2, h * 0.28);
  ctx.strokeRect(baseX + w * 0.2, baseY + h * 0.45, w * 0.2, h * 0.28);

  ctx.fillRect(baseX + w * 0.52, baseY + h * 0.55, w * 0.2, h * 0.38);
  ctx.strokeRect(baseX + w * 0.52, baseY + h * 0.55, w * 0.2, h * 0.38);
}

function drawTickets() {
  const ticket = (text, x, y, tilt = 0.06) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.fillStyle = '#ffffffcc';
    ctx.strokeStyle = '#6a5b4d';
    ctx.lineWidth = 2;
    const w = width * 0.14;
    const h = height * 0.1;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.text;
    ctx.font = `${Math.max(14, width * 0.028)}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 2);
    ctx.restore();
  };

  ticket('股票', width * 0.75, height * 0.3, -0.08);
  ticket('信贷', width * 0.83, height * 0.38, 0.05);
}

function drawCurve() {
  const points = [];
  for (let i = 0; i < curvePoints.length; i++) {
    const p = curvePoints[i];
    points.push({ x: p.x * width, y: p.y * height });
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = palette.stroke;
  ctx.fillStyle = palette.fill;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const totalSegments = points.length - 1;
  const total = totalSegments;
  const scaled = progress * total;
  const currentSegment = Math.floor(scaled);
  const segmentT = scaled - currentSegment;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < currentSegment; i++) {
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
  }

  if (currentSegment < totalSegments) {
    const start = points[currentSegment];
    const end = points[currentSegment + 1];
    const ix = lerp(start.x, end.x, segmentT);
    const iy = lerp(start.y, end.y, segmentT);
    ctx.lineTo(ix, iy);
  }

  ctx.stroke();

  // fill under curve
  ctx.lineTo(points[Math.min(currentSegment + 1, totalSegments)].x, height * 0.9);
  ctx.lineTo(points[0].x, height * 0.9);
  ctx.closePath();
  ctx.fill();

  const tip =
    currentSegment < totalSegments
      ? {
          x: lerp(points[currentSegment].x, points[currentSegment + 1].x, segmentT),
          y: lerp(points[currentSegment].y, points[currentSegment + 1].y, segmentT)
        }
      : points[points.length - 1];

  ctx.fillStyle = palette.stroke;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 7, 0, Math.PI * 2);
  ctx.fill();

  drawMagnet(tip);
}

function drawMagnet(tip) {
  const magX = tip.x + width * 0.05;
  const magY = tip.y - height * 0.05;
  ctx.save();
  ctx.translate(magX, magY);
  ctx.rotate(-0.12);

  // hand sleeve
  ctx.fillStyle = '#b3a090';
  ctx.strokeStyle = '#6a5b4d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-width * 0.03, -height * 0.015, width * 0.06, height * 0.04, 8);
  ctx.fill();
  ctx.stroke();

  // magnet body
  ctx.fillStyle = '#c4312e';
  ctx.beginPath();
  ctx.moveTo(-width * 0.028, height * 0.008);
  ctx.lineTo(width * 0.028, height * 0.008);
  ctx.lineTo(width * 0.028, height * 0.05);
  ctx.lineTo(width * 0.018, height * 0.05);
  ctx.lineTo(width * 0.018, height * 0.02);
  ctx.lineTo(-width * 0.018, height * 0.02);
  ctx.lineTo(-width * 0.018, height * 0.05);
  ctx.lineTo(-width * 0.028, height * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // glow lines
  ctx.strokeStyle = 'rgba(196, 49, 46, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const offset = i * 8;
    ctx.beginPath();
    ctx.moveTo(width * 0.032 + offset, height * 0.01);
    ctx.lineTo(width * 0.032 + offset, -height * 0.01);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLabels() {
  ctx.fillStyle = palette.text;
  ctx.font = `${Math.max(18, width * 0.032)}px "Noto Sans SC", sans-serif`;
  ctx.fillText('资产缩水', width * 0.06, height * 0.16);
  ctx.fillStyle = palette.muted;
  ctx.font = `${Math.max(12, width * 0.022)}px "Noto Sans SC", sans-serif`;
  ctx.fillText('债务重组让债务消失，但资产价值以更快速度消失', width * 0.06, height * 0.2);
}

function update(now) {
  if (!lastTime) lastTime = now;
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  const speed = parseFloat(speedInput.value);
  progress += delta * 0.18 * speed;
  progress = Math.min(progress, 1);

  drawBackground();
  drawCurve();
  drawHouse();
  drawTickets();
  drawLabels();

  if (playing && progress < 1) {
    requestAnimationFrame(update);
  } else if (playing && progress >= 1) {
    // gentle idle pulse at end
    requestAnimationFrame(update);
  }
}

function start() {
  lastTime = 0;
  playing = true;
  requestAnimationFrame(update);
}

function reset() {
  progress = 0;
  lastTime = 0;
  drawBackground();
  drawCurve();
  drawHouse();
  drawTickets();
  drawLabels();
}

reset();
requestAnimationFrame(update);

toggleBtn.addEventListener('click', () => {
  playing = !playing;
  toggleBtn.textContent = playing ? '暂停' : '播放';
  if (playing) {
    lastTime = 0;
    requestAnimationFrame(update);
  }
});

resetBtn.addEventListener('click', () => {
  reset();
  if (!playing) {
    toggleBtn.textContent = '暂停';
    playing = true;
  }
  start();
});
