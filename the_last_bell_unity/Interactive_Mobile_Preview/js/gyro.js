/**
 * The Last Bell — Gyroscope & Touch Parallax Controller
 * Tilting phone on mobile (or mouse movement on desktop) creates depth.
 */
class GyroParallax {
  constructor(bgElementId) {
    this.bgEl = document.getElementById(bgElementId);
    this.enabled = true;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.maxOffset = 18; // px

    this.init();
  }

  init() {
    // Desktop mouse fallback
    window.addEventListener('pointermove', (e) => {
      if (!this.enabled) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      this.targetX = normX * this.maxOffset;
      this.targetY = normY * (this.maxOffset * 0.65);
    });

    // Mobile Device Orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (!this.enabled) return;
        // In landscape, beta is pitch and gamma is roll
        const gamma = e.gamma || 0; // -90 to 90
        const beta = e.beta || 0;   // -180 to 180

        this.targetX = Math.max(-1, Math.min(1, gamma / 30)) * this.maxOffset;
        this.targetY = Math.max(-1, Math.min(1, (beta - 45) / 30)) * (this.maxOffset * 0.65);
      });
    }

    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  render() {
    if (this.bgEl && this.enabled) {
      // Smooth lerp
      this.currentX += (this.targetX - this.currentX) * 0.08;
      this.currentY += (this.targetY - this.currentY) * 0.08;

      this.bgEl.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;
    }

    requestAnimationFrame(this.render);
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val && this.bgEl) {
      this.bgEl.style.transform = 'translate3d(0, 0, 0)';
    }
  }
}

window.GyroSystem = GyroParallax;
