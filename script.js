/* ============================================================
   SPARK INDUSTRIES — script.js
   Vanilla JS: Flame particles, scroll reveal, nav, transitions
   ============================================================ */

'use strict';

/* ── Page Transition ── */
(function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on load
  window.addEventListener('load', () => {
    overlay.classList.remove('active');
  });

  // Fade out on nav link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        href.startsWith('https://api.whatsapp')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });
})();

/* ── Navigation ── */
(function initNav() {
  const nav  = document.querySelector('.nav');
  const ham  = document.querySelector('.nav-hamburger');
  const mob  = document.querySelector('.nav-mobile');
  if (!nav) return;

  // Scroll effect
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    // Close on link click
    mob.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        mob.classList.remove('open');
      });
    });
  }

  // Active page highlight
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll Reveal ── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* ── Flame Particle Canvas ── */
(function initFlameCanvas() {
  const canvas = document.getElementById('flame-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = canvas.height + 10;
      this.size = Math.random() * 3 + 1;
      this.speedY = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.life   = 0;
      this.maxLife = Math.random() * 120 + 80;
      this.hue  = Math.random() * 40 + 10;   // 10-50: red to orange-yellow
    }
    update() {
      this.x += this.speedX;
      this.y -= this.speedY;
      this.life++;
      if (this.life > this.maxLife) this.reset();
    }
    draw() {
      const t = this.life / this.maxLife;
      const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      const r = Math.max(0, this.size * (1 - t * 0.5));
      // gradient flame colour
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4);
      grad.addColorStop(0,   `hsla(${this.hue + 20}, 100%, 70%, ${alpha * 0.85})`);
      grad.addColorStop(0.5, `hsla(${this.hue},     100%, 50%, ${alpha * 0.4})`);
      grad.addColorStop(1,   `hsla(${this.hue - 10}, 100%, 30%, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  const COUNT = window.innerWidth < 768 ? 60 : 120;
  for (let i = 0; i < COUNT; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger start
    particles.push(p);
  }

  let lastTime = 0;
  const animate = (ts) => {
    if (ts - lastTime < 16) { animId = requestAnimationFrame(animate); return; }
    lastTime = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  };
  animId = requestAnimationFrame(animate);

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animId = requestAnimationFrame(animate);
  });
})();

/* ── Counter Animation (Trust Bar) ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dec  = (end % 1 !== 0) ? 1 : 0;
      const dur  = 1600;
      const step = 16;
      const steps = dur / step;
      let cur = 0;
      const timer = setInterval(() => {
        cur++;
        const val = (end * cur / steps);
        el.textContent = (dec ? val.toFixed(1) : Math.ceil(val)) + suffix;
        if (cur >= steps) {
          el.textContent = end + suffix;
          clearInterval(timer);
        }
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── Contact Form (FormSubmit) ── */
(function initContactForm() {
  const form = document.getElementById('distributor-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const data = new FormData(form);
      await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      // Show success
      form.style.display = 'none';
      const success = document.getElementById('form-success');
      if (success) { success.classList.add('show'); }
    } catch {
      btn.disabled = false;
      btn.textContent = origText;
      alert('Something went wrong. Please try WhatsApp or email instead.');
    }
  });
})();

/* ── Smooth Anchor Scrolling ── */
(function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── Lazy Images ── */
(function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  imgs.forEach(img => observer.observe(img));
})();
