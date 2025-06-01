
/// <reference path="../types/speech.d.ts" />
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandsConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface VoiceCommandsHook {
  isListening: boolean;
  isSupported: boolean;
  isConnected: boolean;
  lastCommand: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: SpeechSynthesisUtteranceOptions) => void;
  retryConnection: () => void;
}

interface SpeechSynthesisUtteranceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export const useVoiceCommands = (
  onCommand?: (command: string, confidence: number) => void,
  config: VoiceCommandsConfig = {}
): VoiceCommandsHook => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const {
    continuous = true,
    interimResults = true,
    language = 'en-IN',
    maxAlternatives = 3,
    retryAttempts = 3,
    retryDelay = 1000
  } = config;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = continuous;
        recognitionInstance.interimResults = interimResults;
        recognitionInstance.lang = language;
        recognitionInstance.maxAlternatives = maxAlternatives;

        recognitionInstance.onstart = () => {
          setIsConnected(true);
          setRetryCount(0);
          console.log('Voice recognition started');
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          const command = result[0].transcript.toLowerCase().trim();
          const commandConfidence = result[0].confidence || 0;
          
          setLastCommand(command);
          setConfidence(commandConfidence);
          
          if (result.isFinal && command) {
            console.log('Voice command received:', command, 'Confidence:', commandConfidence);
            onCommand?.(command, commandConfidence);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsConnected(false);
          setIsListening(false);
          handleError(event.error);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          console.log('Voice recognition ended');
          
          // Auto-retry on unexpected end
          if (isConnected && retryCount < retryAttempts) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              startListeningInternal();
            }, retryDelay);
          }
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }, [onCommand, continuous, interimResults, language, maxAlternatives, retryAttempts, retryDelay]);

  const handleError = useCallback((error: string) => {
    const errorMessages = {
      'network': 'Network connection lost. Please check your internet.',
      'not-allowed': 'Microphone access denied. Please enable microphone permissions.',
      'no-speech': 'No speech detected. Please speak clearly.',
      'audio-capture': 'Microphone not found. Please check your audio device.',
      'service-not-allowed': 'Speech service unavailable. Please try again later.',
      'aborted': 'Speech recognition was interrupted.',
      'language-not-supported': 'Language not supported. Switching to English.',
      'bad-grammar': 'Speech recognition grammar error.',
    };

    const message = errorMessages[error as keyof typeof errorMessages] || 
                   `Speech recognition error: ${error}. Please try again.`;
    
    toast({
      title: "Voice Recognition Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const startListeningInternal = useCallback(() => {
    if (recognition && !isListening && isSupported) {
      try {
        recognition.start();
        setIsListening(true);
        setIsConnected(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsConnected(false);
        toast({
          title: "Cannot Start Voice Recognition",
          description: "Please ensure you have microphone permissions and try again.",
          variant: "destructive",
        });
      }
    }
  }, [recognition, isListening, isSupported, toast]);

  const startListening = useCallback(() => {
    setRetryCount(0);
    startListeningInternal();
  }, [startListeningInternal]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      setRetryCount(0);
    }
  }, [recognition, isListening]);

  const speak = useCallback((
    text: string, 
    options: SpeechSynthesisUtteranceOptions = {}
  ) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.8; // Slower for better comprehension
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 0.8;
      utterance.lang = options.lang || language;
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        toast({
          title: "Speech Synthesis Error",
          description: "Unable to speak text. Please check your audio settings.",
          variant: "destructive",
        });
      };

      utterance.onend = () => {
        console.log('Speech synthesis completed');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
      toast({
        title: "Speech Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  }, [language, toast]);

  const retryConnection = useCallback(() => {
    if (!isListening && isSupported) {
      setRetryCount(0);
      setIsConnected(true);
      startListeningInternal();
    }
  }, [isListening, isSupported, startListeningInternal]);

  return {
    isListening,
    isSupported,
    isConnected,
    lastCommand,
    confidence,
    startListening,
    stopListening,
    speak,
    retryConnection
  };
};

export default useVoiceCommands;
