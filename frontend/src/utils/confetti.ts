import confetti from 'canvas-confetti';

export const triggerGuiltyConfetti = () => {
  // Dramatic courtroom red siren burst
  const count = 120;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#DC2626', '#991B1B', '#0B3A66', '#F87171', '#450A0A'],
    });
  }

  fire(0.3, {
    spread: 60,
    startVelocity: 45,
    scalar: 1.1,
  });
  fire(0.25, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
  });
  fire(0.35, {
    spread: 120,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 140,
    startVelocity: 25,
    decay: 0.92,
  });
};

export const triggerNotGuiltyConfetti = () => {
  // Celebratory emerald, lime & golden triumph burst
  const end = Date.now() + 1000;
  const colors = ['#10B981', '#059669', '#34D399', '#F59E0B', '#FBBF24', '#FFFFFF'];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};
