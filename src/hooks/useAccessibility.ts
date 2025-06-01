
import { useState, useEffect } from 'react';

interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceNavigation: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    voiceNavigation: false,
  });

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        applyAccessibilitySettings(parsed);
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    if (prefersReducedMotion || prefersHighContrast) {
      const systemPrefs = {
        ...preferences,
        reduceMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      };
      setPreferences(systemPrefs);
      applyAccessibilitySettings(systemPrefs);
    }
  }, []);

  const applyAccessibilitySettings = (prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (prefs.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Large text
    if (prefs.largeText) {
      root.style.fontSize = '24px';
    } else {
      root.style.fontSize = '20px';
    }

    // Reduced motion
    if (prefs.reduceMotion) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  };

  const updatePreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    applyAccessibilitySettings(newPrefs);
    
    // Save to localStorage
    localStorage.setItem('accessibility-preferences', JSON.stringify(newPrefs));
  };

  const resetToDefaults = () => {
    const defaults: AccessibilityPreferences = {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      voiceNavigation: false,
    };
    
    setPreferences(defaults);
    applyAccessibilitySettings(defaults);
    localStorage.removeItem('accessibility-preferences');
  };

  return {
    preferences,
    updatePreference,
    resetToDefaults,
  };
};

export default useAccessibility;
