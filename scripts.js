/* ═══════════════════════════════════════════════════════════════
   CLEO AI — scripts.js
   ═══════════════════════════════════════════════════════════════ */

/* ── LOADER ──────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 700);
});

/* ── PARTICLES CANVAS ────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    const hero = document.getElementById('hero');
    W = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }
  requestAnimationFrame(resize);
  window.addEventListener('resize', resize);

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 2 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.alpha = Math.random() * 0.5 + 0.1;
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 80) {
      this.x += dx / dist * 1.5;
      this.y += dy / dist * 1.5;
    }
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  const hero = document.getElementById('hero');
  hero && hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(96,165,250,${p.alpha})`;
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(96,165,250,${0.12 * (1 - d/120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── NAVBAR SCROLL ───────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(15,23,42,0.97)'
      : 'rgba(15,23,42,0.85)';
  }, { passive: true });
})();

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.style.animationDelay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 1000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
})();

/* ── COUNTERS ────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

/* ── DEMO CHAT ───────────────────────────────────────────────── */
(function initDemoChat() {
  const body = document.getElementById('chatDemo');
  if (!body) return;

  const messages = body.querySelectorAll('.msg');
  messages.forEach(m => {
    m.style.opacity = '0';
  });

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    let delay = 600;
    messages.forEach(msg => {
      setTimeout(() => {
        msg.style.opacity = '1';
        msg.style.animation = 'none';
        msg.offsetHeight; // reflow
        msg.style.animation = `msgAppear 0.4s ease forwards`;
        // Hide typing dots after they appear
        if (msg.classList.contains('typing-dots')) {
          setTimeout(() => {
            msg.style.display = 'none';
          }, 800);
        }
      }, delay);
      if (msg.classList.contains('typing-dots')) {
        delay += 900;
      } else {
        delay += 800;
      }
    });
  }, { threshold: 0.3 });
  observer.observe(body);
})();

/* ── SECOND PHONE CHAT ───────────────────────────────────────── */
(function initExpChat() {
  const bodies = document.querySelectorAll('.chat-body');
  bodies.forEach(body => {
    if (body === document.getElementById('chatDemo')) return;
    const msgs = body.querySelectorAll('.anim-in');
    msgs.forEach(m => m.style.opacity = '0');

    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      let delay = 400;
      msgs.forEach(msg => {
        setTimeout(() => {
          msg.style.opacity = '1';
          msg.style.animation = 'none';
          msg.offsetHeight;
          msg.style.animation = `msgAppear 0.4s ease forwards`;
          if (msg.classList.contains('typing-dots')) {
            setTimeout(() => { msg.style.display = 'none'; }, 700);
          }
        }, delay);
        delay += msg.classList.contains('typing-dots') ? 800 : 700;
      });
    }, { threshold: 0.3 });
    obs.observe(body);
  });
})();

/* ── FLOW ARROW DOTS ─────────────────────────────────────────── */
(function initFlowDots() {
  document.querySelectorAll('.flow-dot').forEach((dot, i) => {
    dot.style.animationDelay = (i * 0.5) + 's';
  });
})();

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── CARD TILT (sutil) ───────────────────────────────────────── */
document.querySelectorAll('.cap-card, .why-card, .stat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
