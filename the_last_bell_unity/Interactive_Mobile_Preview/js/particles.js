/**
 * The Last Bell — Volumetric Dust Motes Particle Engine
 * Simulates micro-dust drifting through the abandoned classroom sunlight.
 */
class DustParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 95;
    this.enabled = true;
    this.touchPoint = null;

    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize());
    
    // Touch / Pointer disturbance
    window.addEventListener('pointermove', (e) => {
      this.touchPoint = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerleave', () => {
      this.touchPoint = null;
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    // Bias particles toward the right half where the window sunbeams shine
    const x = Math.random() > 0.35 
      ? this.width * 0.45 + Math.random() * (this.width * 0.55)
      : Math.random() * this.width;

    return {
      x: x,
      y: Math.random() * this.height,
      radius: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.45) * 0.25,
      vy: -(Math.random() * 0.35 + 0.1), // Gentle slow upward drift
      baseAlpha: Math.random() * 0.45 + 0.15,
      alpha: 0.2,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.02 + 0.01
    };
  }

  animate() {
    if (!this.enabled) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      requestAnimationFrame(this.animate);
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Oscillating twinkle
      p.phase += p.phaseSpeed;
      
      // Calculate sunbeam brightness zone (brighter on right window beam)
      const sunFactor = Math.max(0, (p.x - this.width * 0.35) / (this.width * 0.65));
      p.alpha = p.baseAlpha * (0.4 + Math.sin(p.phase) * 0.3) * (0.6 + sunFactor * 0.9);

      // Touch disturbance
      if (this.touchPoint) {
        const dx = p.x - this.touchPoint.x;
        const dy = p.y - this.touchPoint.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 120;
        if (distSq < maxDist * maxDist && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (maxDist - dist) / maxDist;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.y < -10) p.y = this.height + 10;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      // Render dust particle with soft glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      
      // Sunlight warm tint
      this.ctx.fillStyle = `rgba(255, 238, 205, ${Math.min(p.alpha, 0.85)})`;
      this.ctx.shadowColor = 'rgba(255, 220, 150, 0.4)';
      this.ctx.shadowBlur = 4;
      this.ctx.fill();
    }

    this.ctx.shadowBlur = 0;
    requestAnimationFrame(this.animate);
  }

  setEnabled(val) {
    this.enabled = val;
  }
}

window.DustSystem = DustParticleSystem;
