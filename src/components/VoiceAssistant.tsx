
/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VoiceCommandProcessor from './VoiceCommandProcessor';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  isEnabled?: boolean;
}

const VoiceAssistant = ({ onCommand, isEnabled = true }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [processingCommand, setProcessingCommand] = useState<string>('');
  const [confidence, setConfidence] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognitionClass();
      
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';
      speechRecognition.maxAlternatives = 3;

      speechRecognition.onstart = () => {
        setIsConnected(true);
        setRetryCount(0);
        console.log('Voice recognition started');
      };

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const command = result[0].transcript.toLowerCase().trim();
        const commandConfidence = result[0].confidence || 0;
        
        setConfidence(commandConfidence);
        
        if (result.isFinal && command && commandConfidence > 0.6) {
          setLastCommand(command);
          setProcessingCommand(command);
          console.log('Voice command received:', command, 'Confidence:', commandConfidence);
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsConnected(false);
        setIsListening(false);
        handleSpeechError(event.error);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
        
        // Auto-restart if still supposed to be listening
        if (retryCount < 3 && isConnected) {
          setTimeout(() => {
            if (isListening) {
              try {
                speechRecognition.start();
                setRetryCount(prev => prev + 1);
              } catch (error) {
                console.error('Error restarting recognition:', error);
              }
            }
          }, 1000);
        }
      };

      setRecognition(speechRecognition);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleSpeechError = (error: string) => {
    const errorMessages = {
      'network': 'Network connection lost. Please check your internet.',
      'not-allowed': 'Microphone access denied. Please enable microphone permissions.',
      'no-speech': 'No speech detected. Please speak clearly.',
      'audio-capture': 'Microphone not found. Please check your audio device.',
      'service-not-allowed': 'Speech service unavailable. Please try again later.',
      'aborted': 'Speech recognition was interrupted.',
      'language-not-supported': 'Language not supported. Switching to English.',
    };

    const message = errorMessages[error as keyof typeof errorMessages] || 'Speech recognition error. Please try again.';
    
    toast({
      title: "Voice Assistant Error",
      description: message,
      variant: "destructive",
    });

    speak(`Error: ${message}`);
  };

  const speak = useCallback((text: string) => {
    if (synthesis) {
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
      };
      
      synthesis.speak(utterance);
    }
  }, [synthesis]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      speak('Voice assistant stopped');
    } else {
      try {
        recognition.start();
        setIsListening(true);
        speak('MetaMind voice assistant is listening');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast({
          title: "Cannot Start Voice Recognition",
          description: "Please ensure you have microphone permissions and try again.",
          variant: "destructive",
        });
      }
    }
  }, [recognition, isListening, speak, toast]);

  const retryConnection = useCallback(() => {
    if (recognition && !isListening) {
      setRetryCount(0);
      toggleListening();
    }
  }, [recognition, isListening, toggleListening]);

  const handleCommandResult = (result: any) => {
    setProcessingCommand('');
    
    // Forward the result to the parent component
    if (result.action && onCommand) {
      switch (result.action) {
        case 'set_title':
          onCommand(`set_title_${result.title}`);
          break;
        case 'set_category':
          onCommand(`set_category_${result.category}`);
          break;
        case 'save_draft':
          onCommand('save_draft');
          break;
        case 'show_drafts':
          onCommand('show_drafts');
          break;
        case 'open_draft':
          onCommand(`open_draft_${result.version}`);
          break;
        case 'next_step':
          onCommand('next_step');
          break;
        case 'previous_step':
          onCommand('previous_step');
          break;
        case 'publish_now':
          onCommand('publish_now');
          break;
        default:
          onCommand(result.action);
      }
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Command processor */}
      {processingCommand && (
        <VoiceCommandProcessor
          command={processingCommand}
          context={{ currentPage: window.location.pathname }}
          onResult={handleCommandResult}
        />
      )}

      {/* Voice assistant UI */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={toggleListening}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              btn-accessible rounded-full w-20 h-20 shadow-lg transition-all duration-300
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 voice-active animate-pulse' 
                : isConnected 
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-500 hover:bg-gray-600'
              }
              ${isHovered ? 'scale-110' : ''}
            `}
            aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff size={28} className="text-white" />
              </motion.div>
            ) : (
              <Mic size={28} className="text-white" />
            )}
            
            {/* Connection indicator */}
            <div className="absolute -top-1 -right-1">
              {isConnected ? (
                <Wifi size={12} className="text-green-400" />
              ) : (
                <WifiOff size={12} className="text-red-400" />
              )}
            </div>

            {/* Confidence indicator */}
            {isListening && confidence > 0 && (
              <div className="absolute -bottom-1 -left-1 bg-white rounded-full px-1 text-xs font-bold text-black">
                {Math.round(confidence * 100)}%
              </div>
            )}
          </Button>
        </motion.div>
        
        {/* Status tooltip */}
        <AnimatePresence>
          {(isHovered || isListening) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-24 right-0 bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <Volume2 size={14} className="text-blue-600" />
                <span className="text-gray-700 text-sm font-medium">
                  {isListening 
                    ? 'Listening for commands...' 
                    : isConnected 
                      ? 'Click to speak or say "Hey MetaMind"' 
                      : 'Connection lost - Click to retry'
                  }
                </span>
              </div>
              
              {isListening && (
                <div className="mt-2 text-xs text-gray-500">
                  Try: "Create medical eBook", "Save draft", "Go to dashboard", "Help"
                </div>
              )}
              
              {lastCommand && (
                <div className="mt-2 text-xs text-green-600">
                  Last: "{lastCommand}"
                </div>
              )}

              {processingCommand && (
                <div className="mt-2 text-xs text-blue-600 animate-pulse">
                  Processing: "{processingCommand}"
                </div>
              )}
              
              {!isConnected && (
                <Button
                  onClick={retryConnection}
                  className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1"
                >
                  Retry Connection
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VoiceAssistant;
