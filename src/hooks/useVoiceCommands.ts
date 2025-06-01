
/// <reference path="../types/speech.d.ts" />
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandsHook {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

export const useVoiceCommands = (onCommand?: (command: string) => void): VoiceCommandsHook => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          console.log('Voice command received:', command);
          onCommand?.(command);
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error !== 'no-speech') {
            toast({
              title: "Voice Recognition Error",
              description: "Please check your microphone and try again.",
              variant: "destructive",
            });
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
      }
    }
  }, [onCommand, toast]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Cannot Start Voice Recognition",
          description: "Please ensure you have microphone permissions.",
          variant: "destructive",
        });
      }
    }
  }, [recognition, isListening, toast]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    speak
  };
};

export default useVoiceCommands;
