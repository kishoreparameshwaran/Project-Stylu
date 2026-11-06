/**
 * Safely speaks dramatic judge catchphrases using the Web Speech API if audio is enabled.
 */
export const speakJudgeCatchphrase = (text: string, enabled: boolean): void => {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Pick an expressive English voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback if speech synthesis is disabled or blocked
  }
};
