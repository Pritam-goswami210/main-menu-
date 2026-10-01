/**
 * The Last Bell — Application Controller (Matching Image 3)
 * Manages UI interactions, button snapping, horror modals, and audio triggers.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Systems
  const dust = new window.DustSystem('dust-canvas');
  const gyro = new window.GyroSystem('bg-layer');
  const audio = window.HorrorAudio;

  // DOM Elements
  const menuButtons = document.querySelectorAll('.menu-btn');
  const brushHighlight = document.getElementById('brush-highlight');
  const audioToggleBtn = document.getElementById('btn-audio-toggle');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const screenFader = document.getElementById('screen-fader');
  const filmGrain = document.getElementById('film-grain');

  // Modals
  const modalDifficulty = document.getElementById('modal-difficulty');
  const modalContinue = document.getElementById('modal-continue');
  const modalSettings = document.getElementById('modal-settings');
  const modalQuit = document.getElementById('modal-quit');
  const modalStory = document.getElementById('modal-story');

  // Settings Elements
  const sliderMaster = document.getElementById('slider-master');
  const sliderAmbience = document.getElementById('slider-ambience');
  const sliderSfx = document.getElementById('slider-sfx');
  const valMaster = document.getElementById('val-master');
  const valAmbience = document.getElementById('val-ambience');
  const valSfx = document.getElementById('val-sfx');

  const toggleGrain = document.getElementById('toggle-grain');
  const toggleDust = document.getElementById('toggle-dust');
  const toggleHaptics = document.getElementById('toggle-haptics');
  const toggleGyro = document.getElementById('toggle-gyro');

  // State
  let hapticsEnabled = true;
  let activeBtn = document.getElementById('btn-new-game');

  // 1. Position the Red Brush Stroke behind the Active Button
  function updateBrushPosition(targetBtn) {
    if (!targetBtn || !brushHighlight) return;
    const previousBtn = activeBtn;
    activeBtn = targetBtn;

    menuButtons.forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');

    // Snap directly onto the hovered button (no sliding/jumping from the previous one)
    const btnOffset = targetBtn.offsetTop;
    brushHighlight.style.transform = `translateY(${btnOffset}px)`;

    // On a new button: the blood spot repaints itself in from left to right + drip SFX
    if (previousBtn && previousBtn !== targetBtn) {
      if (typeof brushHighlight.animate === 'function') {
        brushHighlight.animate(
          [
            { clipPath: 'inset(0 100% 0 0)', opacity: 0.35 },
            { clipPath: 'inset(0 35% 0 0)', opacity: 0.7, offset: 0.45 },
            { clipPath: 'inset(0 0 0 0)', opacity: 1 }
          ],
          { duration: 1800, easing: 'cubic-bezier(0.25, 0.6, 0.25, 1)' }
        );
      }
      audio.playDrip();

      // Restart the CSS blood-drip animation on the brush's bottom edge
      brushHighlight.classList.remove('dripping');
      void brushHighlight.offsetWidth; // force reflow so the animation replays
      brushHighlight.classList.add('dripping');
    }
  }

  // Initial brush position (on NEW GAME)
  setTimeout(() => updateBrushPosition(activeBtn), 50);

  // 2. Button Hover & Click Listeners
  menuButtons.forEach(btn => {
    btn.addEventListener('pointerenter', () => {
      updateBrushPosition(btn);
      audio.playHover();
    });

    btn.addEventListener('click', () => {
      audio.playClick();
      triggerHaptic();
      const action = btn.dataset.action;
      handleMenuAction(action);
    });
  });

  function handleMenuAction(action) {
    switch (action) {
      case 'new-game':
        openModal(modalDifficulty);
        break;
      case 'continue':
        openModal(modalContinue);
        break;
      case 'settings':
        openModal(modalSettings);
        break;
      case 'story':
        openModal(modalStory);
        break;
      case 'quit':
        openModal(modalQuit);
        break;
    }
  }

  // 3. Modal Manager
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    audio.playHover();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    audio.playClick();
  }

  // Generic close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(modalId);
      closeModal(targetModal);
    });
  });

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Android / Desktop Back button (Escape key)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
      if (openModals.length > 0) {
        openModals.forEach(m => closeModal(m));
      } else {
        openModal(modalQuit);
      }
    }
  });

  // 4. Audio Control & Autoplay Unlock on First Touch
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isUnmuted = audio.toggleSound();
      updateAudioUI(isUnmuted);
      triggerHaptic();
    });
  }

  function updateAudioUI(isUnmuted) {
    if (isUnmuted) {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
      if (audioToggleBtn) audioToggleBtn.title = 'Sound On';
    } else {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
      if (audioToggleBtn) audioToggleBtn.title = 'Sound Muted / Tap to Enable';
    }
  }

  // Auto-init audio on first interaction anywhere
  const firstTouchUnlock = () => {
    if (audio.isMuted) {
      // Audio is initialized on demand
    }
    window.removeEventListener('pointerdown', firstTouchUnlock);
  };
  window.addEventListener('pointerdown', firstTouchUnlock, { once: true });

  // 5. Fullscreen Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      triggerHaptic();
    });
  }

  // 6. Difficulty Selection & Start Game Flow
  const diffCards = document.querySelectorAll('.diff-card');
  diffCards.forEach(card => {
    card.addEventListener('click', () => {
      diffCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      audio.playHover();
      triggerHaptic();
    });
  });

  const btnStartGame = document.getElementById('btn-start-game');
  if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
      closeModal(modalDifficulty);
      audio.playLastBellChime();
      triggerHaptic(50);

      // Fade to black sequence
      screenFader.classList.add('fade-out');

      setTimeout(() => {
        alert("Part I \u2014 The Last Bell begins: 'The School That Should Have Been Empty' is loading... (Unity Scene transition)");
        screenFader.classList.remove('fade-out');
      }, 1500);
    });
  }

  // 7. Save Slot Resume
  document.querySelectorAll('.slot-load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modalContinue);
      audio.playLastBellChime();
      screenFader.classList.add('fade-out');
      setTimeout(() => {
        alert("Resuming checkpoint: The Hidden Passage (Beneath the Blackboard, 11:59 PM)");
        screenFader.classList.remove('fade-out');
      }, 1500);
    });
  });

  // 8. Quit Game confirmation
  const btnConfirmQuit = document.getElementById('btn-confirm-quit');
  if (btnConfirmQuit) {
    btnConfirmQuit.addEventListener('click', () => {
      closeModal(modalQuit);
      audio.playClick();
      screenFader.classList.add('fade-out');
      setTimeout(() => {
        alert("Application Quit. Returning to mobile home screen.");
        screenFader.classList.remove('fade-out');
      }, 800);
    });
  }

  // 9. Story Chapters (Part I / Part II)
  const storyChapters = document.querySelectorAll('.story-chapter');
  storyChapters.forEach(chapter => {
    chapter.addEventListener('click', () => {
      triggerHaptic();
      if (chapter.classList.contains('story-locked')) {
        audio.playClick();
        const part = chapter.dataset.chapter === 'part2' ? 'Part II \u2014 The Names Beneath' : 'This part';
        alert(part + ' is coming soon. The bell has not rung for it yet.');
        return;
      }
      audio.playLastBellChime();
      closeModal(modalStory);
      screenFader.classList.add('fade-out');
      setTimeout(() => {
        alert("Part I \u2014 The Last Bell is loading... (Unity Scene transition)");
        screenFader.classList.remove('fade-out');
      }, 1500);
    });
  });

  // 10. Settings Tabs & Controls
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      audio.playHover();
    });
  });

  // Volume Sliders
  if (sliderMaster) {
    sliderMaster.addEventListener('input', (e) => {
      const val = e.target.value;
      if (valMaster) valMaster.textContent = `${val}%`;
      audio.setMasterVolume(val / 100);
    });
  }

  if (sliderAmbience) {
    sliderAmbience.addEventListener('input', (e) => {
      const val = e.target.value;
      if (valAmbience) valAmbience.textContent = `${val}%`;
      audio.setAmbienceVolume(val / 100);
    });
  }

  if (sliderSfx) {
    sliderSfx.addEventListener('input', (e) => {
      const val = e.target.value;
      if (valSfx) valSfx.textContent = `${val}%`;
      audio.setSfxVolume(val / 100);
    });
  }

  // Graphics Toggles
  if (toggleGrain) {
    toggleGrain.addEventListener('change', (e) => {
      filmGrain.classList.toggle('disabled', !e.target.checked);
    });
  }

  if (toggleDust) {
    toggleDust.addEventListener('change', (e) => {
      dust.setEnabled(e.target.checked);
    });
  }

  if (toggleHaptics) {
    toggleHaptics.addEventListener('change', (e) => {
      hapticsEnabled = e.target.checked;
    });
  }

  if (toggleGyro) {
    toggleGyro.addEventListener('change', (e) => {
      gyro.setEnabled(e.target.checked);
    });
  }

  // Quality Segmented Control
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('seg-locked')) {
        audio.playClick();
        triggerHaptic();
        const note = document.getElementById('story-part-note');
        if (note) {
          note.textContent = 'Part II \u2014 The Names Beneath: coming soon.';
          note.classList.add('visible');
          setTimeout(() => note.classList.remove('visible'), 2400);
        }
        return;
      }
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playClick();
      triggerHaptic();
    });
  });

  // Reset Defaults
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (sliderMaster) { sliderMaster.value = 85; valMaster.textContent = '85%'; audio.setMasterVolume(0.85); }
      if (sliderAmbience) { sliderAmbience.value = 80; valAmbience.textContent = '80%'; audio.setAmbienceVolume(0.80); }
      if (sliderSfx) { sliderSfx.value = 90; valSfx.textContent = '90%'; audio.setSfxVolume(0.90); }
      if (toggleGrain) { toggleGrain.checked = true; filmGrain.classList.remove('disabled'); }
      if (toggleDust) { toggleDust.checked = true; dust.setEnabled(true); }
      if (toggleHaptics) { toggleHaptics.checked = true; hapticsEnabled = true; }
      if (toggleGyro) { toggleGyro.checked = true; gyro.setEnabled(true); }
      audio.playClick();
    });
  }

  // 11. Mobile Haptics Helper
  function triggerHaptic(duration = 20) {
    if (hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }
});
