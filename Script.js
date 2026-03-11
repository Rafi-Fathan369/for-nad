// ══════════════════════════════════════
//  Rafi × Nada — Romantic Website
//  script.js
// ══════════════════════════════════════

'use strict';

// ── CURSOR ──────────────────────────────
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower) {
  let fx = 0, fy = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.18;
    fy += (my - fy) * 0.18;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('button, a, .memory-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      cursor.style.background = 'rgba(244,63,94,0.5)';
      follower.style.transform = 'translate(-50%,-50%) scale(0.6)';
      follower.style.borderColor = 'var(--rose)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = 'var(--rose)';
      follower.style.transform = 'translate(-50%,-50%) scale(1)';
      follower.style.borderColor = 'var(--blush)';
    });
  });
}

// ── PAGE SYSTEM ──────────────────────────
const pages = document.querySelectorAll('.page');
const dots = document.querySelectorAll('.dot');
let currentPage = 0;

function goToPage(index) {
  if (index === currentPage && index !== 0) return;

  const prev = document.querySelector('.page.active');
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('exit');
    setTimeout(() => prev.classList.remove('exit'), 900);
  }

  const next = pages[index];
  if (next) {
    next.classList.add('active');
    currentPage = index;

    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    // Trigger page-specific init
    switch (index) {
      case 0: initOpening(); break;
      case 1: initStory(); break;
      case 2: initMemory(); break;
      case 3: initConfession(); break;
      case 4: initAccepted(); break;
    }
  }
}

// ── AUDIO ────────────────────────────────
let audioCtx = null;
let musicPlaying = false;
let oscillators = [];

const audioBtn = document.querySelector('.audio-btn');

function createAmbientMusic() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  oscillators.forEach(o => { try { o.stop(); } catch(e) {} });
  oscillators = [];

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3);
  masterGain.connect(audioCtx.destination);

  const reverb = audioCtx.createConvolver();
  const revLen = audioCtx.sampleRate * 3;
  const revBuffer = audioCtx.createBuffer(2, revLen, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = revBuffer.getChannelData(ch);
    for (let i = 0; i < revLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / revLen, 2);
  }
  reverb.buffer = revBuffer;
  reverb.connect(masterGain);

  // Gentle chord tones: Am — a romantic, wistful progression
  const baseFreqs = [220, 261.63, 329.63, 392, 440, 523.25];
  
  baseFreqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Gentle vibrato
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    vibrato.frequency.value = 4.5 + i * 0.3;
    vibratoGain.gain.value = freq * 0.002;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start();
    oscillators.push(vibrato);

    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    const baseVol = 0.03 / (i + 1);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(baseVol, audioCtx.currentTime + 2 + i * 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(reverb);

    // Gentle swell animation
    const swellPeriod = 8 + i * 2.5;
    function swell(t) {
      if (!musicPlaying) return;
      const vol = baseVol * (0.6 + 0.4 * Math.sin(Math.PI * 2 * t / swellPeriod));
      gain.gain.setTargetAtTime(vol, audioCtx.currentTime, 1.5);
      setTimeout(() => swell(t + 0.5), 500);
    }
    setTimeout(() => swell(0), 3000);

    osc.start();
    oscillators.push(osc);
  });

  musicPlaying = true;
  if (audioBtn) audioBtn.textContent = '🔊';
}

function stopMusic() {
  if (audioCtx) {
    oscillators.forEach(o => { try { o.stop(); } catch(e) {} });
    oscillators = [];
    musicPlaying = false;
    if (audioBtn) audioBtn.textContent = '🔇';
  }
}

if (audioBtn) {
  audioBtn.addEventListener('click', () => {
    if (musicPlaying) stopMusic();
    else createAmbientMusic();
  });
}

// ── PARTICLES (stars) ────────────────────
function initParticles(canvasEl) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvasEl.width = canvasEl.offsetWidth;
    H = canvasEl.height = canvasEl.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const count = Math.min(80, Math.floor(W * H / 12000));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.twinkle += 0.03;
      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── FLOATING HEARTS ──────────────────────
function spawnFloatingHearts(container, interval = 1200) {
  if (!container) return;
  const hearts = ['🌸', '💕', '✨', '🌷', '💗', '🩷', '💖', '🌺'];

  return setInterval(() => {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
    el.style.animationDuration = (Math.random() * 8 + 7) + 's';
    el.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), 18000);
  }, interval);
}

// ── TYPING EFFECT ────────────────────────
function typeText(el, text, speed = 60, cb) {
  if (!el) return;
  el.textContent = '';
  el.classList.add('typing-cursor');
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed + Math.random() * 30);
    } else {
      el.classList.remove('typing-cursor');
      if (cb) cb();
    }
  }
  type();
}

// ── CONFETTI ─────────────────────────────
function launchConfetti() {
  const colors = ['#f43f5e', '#fda4af', '#fb7185', '#fecdd3', '#ff80b0', '#fff0f5', '#ff4d8e'];
  const shapes = ['circle', 'square', 'heart'];

  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      piece.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${color};
        width: ${Math.random() * 10 + 6}px;
        height: ${Math.random() * 10 + 6}px;
        border-radius: ${shape === 'circle' ? '50%' : shape === 'heart' ? '50% 0' : '2px'};
        animation-duration: ${Math.random() * 2 + 2.5}s;
        animation-delay: ${Math.random() * 2}s;
        transform-origin: center;
      `;

      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }, i * 20);
  }
}

// ── PAGE INITS ───────────────────────────

// Opening
function initOpening() {
  const canvas = document.querySelector('#opening canvas.particles');
  initParticles(canvas);

  const nameEl = document.querySelector('#opening .name-type');
  const taglineEl = document.querySelector('#opening .tagline-type');

  setTimeout(() => {
    typeText(nameEl, 'Hi Nada 🌸', 80, () => {
      setTimeout(() => {
        typeText(taglineEl, 'I made this little website for you.', 55);
      }, 500);
    });
  }, 800);

  // Petals
  const petalContainer = document.querySelector('#opening .bg-canvas');
  if (petalContainer) {
    const petalEmojis = ['🌸', '🌺', '🌷', '🍃'];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'petal-float';
      p.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = Math.random() * 30 + '%';
      p.style.animationDuration = (Math.random() * 12 + 10) + 's';
      p.style.animationDelay = Math.random() * 6 + 's';
      p.style.fontSize = (Math.random() * 1.2 + 0.8) + 'rem';
      p.style.opacity = '0';
      petalContainer.appendChild(p);
    }
  }
}

// Story
function initStory() {
  const container = document.querySelector('#story .floating-hearts');
  spawnFloatingHearts(container, 1400);

  const paras = document.querySelectorAll('#story .story-para');
  paras.forEach((p, i) => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(20px)';
    p.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      p.style.opacity = '1';
      p.style.transform = 'translateY(0)';
    }, 400 + i * 600);
  });
}

// Memory
function initMemory() {
  const container = document.querySelector('#memory .floating-hearts');
  spawnFloatingHearts(container, 2000);

  const cards = document.querySelectorAll('.memory-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    card.style.transition = 'opacity 0.7s ease, transform 0.7s ease, box-shadow 0.4s ease, border-color 0.4s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    }, 200 + i * 150);
  });
}

// Confession
function initConfession() {
  const container = document.querySelector('#confession .floating-hearts');
  spawnFloatingHearts(container, 1800);

  const mainText = document.querySelector('.confession-main');
  const question = document.querySelector('.confession-question');
  const btnGroup = document.querySelector('.btn-group');
  const noBtn = document.querySelector('.btn-no');

  setTimeout(() => {
    if (mainText) mainText.classList.add('revealed');
  }, 2000);

  setTimeout(() => {
    if (question) question.classList.add('revealed');
  }, 4000);

  setTimeout(() => {
    if (btnGroup) btnGroup.classList.add('revealed');
  }, 5200);

  // Runaway NO button
  if (noBtn) {
    noBtn.addEventListener('mousemove', function(e) {
      const rect = noBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 160;

      if (dist < maxDist) {
        const flee = (maxDist - dist) / maxDist;
        const nx = -dx / dist * flee * 180;
        const ny = -dy / dist * flee * 180;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const newX = Math.max(rect.width / 2, Math.min(vw - rect.width / 2, cx + nx));
        const newY = Math.max(rect.height / 2, Math.min(vh - rect.height / 2, cy + ny));

        noBtn.style.position = 'fixed';
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
        noBtn.style.transform = 'translate(-50%, -50%)';
        noBtn.style.zIndex = '500';
      }
    });

    // Mobile tap for NO
    noBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      noBtn.style.position = 'fixed';
      noBtn.style.left = Math.random() * (vw - 160) + 80 + 'px';
      noBtn.style.top = Math.random() * (vh - 100) + 50 + 'px';
      noBtn.style.transform = 'translate(-50%, -50%)';
      noBtn.style.zIndex = '500';
    });
  }
}

// Accepted
function initAccepted() {
  launchConfetti();
  setInterval(launchConfetti, 5000);

  const container = document.querySelector('#accepted .floating-hearts');
  spawnFloatingHearts(container, 600);

  const el = document.querySelector('.accepted-content');
  if (el) {
    const children = el.querySelectorAll('[data-anim]');
    children.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(24px)';
      c.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      setTimeout(() => {
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, 300 + i * 400);
    });
  }
}

// ── LOADING ──────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const cover = document.querySelector('.page-cover');
  setTimeout(() => {
    if (cover) cover.classList.add('hidden');
    goToPage(0);
  }, 1200);
});

// Expose globally for inline onclick
window.goToPage = goToPage;
window.createAmbientMusic = createAmbientMusic;