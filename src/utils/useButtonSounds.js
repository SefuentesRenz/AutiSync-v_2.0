import { useRef, useCallback } from 'react';

export const useButtonSounds = () => {
  const hoverSoundRef = useRef(null);
  const clickSoundRef = useRef(null);

  // Initialize audio objects
  if (!hoverSoundRef.current) {
    hoverSoundRef.current = new Audio('/src/assets/sounds/button_hover.mp3');
  hoverSoundRef.current.volume = 0.5; // Adjust volume as needed
    hoverSoundRef.current.preload = 'auto';
  }

  if (!clickSoundRef.current) {
    clickSoundRef.current = new Audio('/src/assets/sounds/button-click.mp3');
  clickSoundRef.current.volume = 0.6; // Adjust volume as needed
    clickSoundRef.current.preload = 'auto';
  }

  const playHoverSound = useCallback(() => {
    try {
      if (hoverSoundRef.current) {
        hoverSoundRef.current.currentTime = 0;
        hoverSoundRef.current.play().catch(e => console.log('Hover sound play failed:', e));
      }
    } catch (error) {
      console.log('Error playing hover sound:', error);
    }
  }, []);

  const playClickSound = useCallback(() => {
    try {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(e => console.log('Click sound play failed:', e));
      }
    } catch (error) {
      console.log('Error playing click sound:', error);
    }
  }, []);

  const getButtonSoundHandlers = useCallback((originalOnClick) => ({
    onMouseEnter: playHoverSound,
    onClick: (e) => {
      playClickSound();
      if (originalOnClick) {
        originalOnClick(e);
      }
    }
  }), [playHoverSound, playClickSound]);

  return {
    playHoverSound,
    playClickSound,
    getButtonSoundHandlers
  };
};