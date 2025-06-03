/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognitionClass();
      
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-IN';
      speechRecognition.maxAlternatives = 3;

      speechRecognition.onstart = () => {
        setIsConnected(true);
        setRetryCount(0);
      };

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        if (event.results[last].isFinal && command) {
          setLastCommand(command);
          handleVoiceCommand(command);
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
        if (retryCount < 3 && isConnected) {
          setTimeout(() => {
            if (isListening) {
              speechRecognition.start();
              setRetryCount(prev => prev + 1);
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

  const handleVoiceCommand = useCallback(async (command: string) => {
    console.log('Processing voice command:', command);
    
    // Remove optional prefix
    const cleanCommand = command.replace(/^(hey metamind|metamind)\s*/i, '').trim();
    
    try {
      // Authentication commands
      if (cleanCommand.includes('sign in') || cleanCommand.includes('log in')) {
        if (cleanCommand.includes('with email')) {
          speak('Redirecting to sign in page');
          navigate('/auth');
        } else {
          speak('Please specify sign in method. Try saying "sign in with email"');
        }
        return;
      }

      if (cleanCommand.includes('log out') || cleanCommand.includes('sign out')) {
        try {
          await supabase.auth.signOut();
          speak('Successfully logged out');
          navigate('/');
        } catch (error) {
          speak('Error logging out. Please try again.');
          toast({
            title: "Logout Error",
            description: "Failed to log out. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Navigation commands
      if (cleanCommand.includes('go to dashboard') || cleanCommand.includes('open dashboard')) {
        speak('Navigating to dashboard');
        navigate('/dashboard');
        return;
      }

      if (cleanCommand.includes('go to marketplace') || cleanCommand.includes('open marketplace')) {
        speak('Opening marketplace');
        navigate('/market');
        return;
      }

      if (cleanCommand.includes('start ebook creation') || cleanCommand.includes('open ebook creation') || cleanCommand.includes('create ebook')) {
        speak('Starting eBook creation wizard');
        navigate('/create');
        return;
      }

      // Specific creation commands
      if (cleanCommand.includes('create medical ebook')) {
        speak('Creating medical eBook with category pre-selected');
        navigate('/create?category=medical');
        onCommand?.('set_category_medical');
        return;
      }

      if (cleanCommand.includes('create business ebook')) {
        speak('Creating business eBook with category pre-selected');
        navigate('/create?category=business');
        onCommand?.('set_category_business');
        return;
      }

      // Title and content commands
      if (cleanCommand.includes('set title to')) {
        const titleMatch = cleanCommand.match(/set title to (.+)/);
        if (titleMatch) {
          const title = titleMatch[1];
          speak(`Setting title to ${title}`);
          onCommand?.(`set_title_${title}`);
          
          // Check title uniqueness
          try {
            const response = await fetch('/api/check-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title })
            });
            const data = await response.json();
            
            if (!data.isUnique) {
              speak(`Title already exists. Suggesting: ${data.suggested}`);
              onCommand?.(`set_title_${data.suggested}`);
            }
          } catch (error) {
            console.warn('Title check failed, proceeding with original title');
          }
        }
        return;
      }

      if (cleanCommand.includes('set category to') || cleanCommand.includes('select category')) {
        const categoryMatch = cleanCommand.match(/(?:set category to|select category)\s+(\w+)/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          speak(`Setting category to ${category}`);
          onCommand?.(`set_category_${category}`);
        }
        return;
      }

      // Title suggestion commands
      if (cleanCommand.includes('give me a unique title') || cleanCommand.includes('suggest title')) {
        const themeMatch = cleanCommand.match(/about (.+?)(?:\s|$)/);
        const theme = themeMatch ? themeMatch[1] : 'general';
        
        try {
          speak('Generating unique title suggestions');
          const response = await fetch('/api/suggest-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
          });
          const data = await response.json();
          
          if (data.title) {
            speak(`I suggest the title: ${data.title}`);
            onCommand?.(`set_title_${data.title}`);
          }
        } catch (error) {
          speak('Sorry, I could not generate a title suggestion right now');
          toast({
            title: "Title Suggestion Failed",
            description: "Unable to generate title. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Draft management commands
      if (cleanCommand.includes('save draft')) {
        speak('Saving current draft');
        onCommand?.('save_draft');
        return;
      }

      if (cleanCommand.includes('show drafts') || cleanCommand.includes('show draft versions')) {
        speak('Displaying your draft versions');
        onCommand?.('show_drafts');
        return;
      }

      if (cleanCommand.includes('open draft') && cleanCommand.includes('version')) {
        const versionMatch = cleanCommand.match(/version (\d+)/);
        if (versionMatch) {
          const version = versionMatch[1];
          speak(`Opening draft version ${version}`);
          onCommand?.(`open_draft_${version}`);
        }
        return;
      }

      // Wizard control commands
      if (cleanCommand.includes('next step')) {
        speak('Moving to next step');
        onCommand?.('next_step');
        return;
      }

      if (cleanCommand.includes('previous step') || cleanCommand.includes('go back')) {
        speak('Moving to previous step');
        onCommand?.('previous_step');
        return;
      }

      if (cleanCommand.includes('submit ebook') || cleanCommand.includes('publish now')) {
        speak('Proceeding to publish your eBook');
        onCommand?.('publish_now');
        return;
      }

      // Action commands
      if (cleanCommand.includes('start recording') || cleanCommand.includes('record story')) {
        speak('Starting voice recording for your story');
        onCommand?.('start_recording');
        return;
      }

      if (cleanCommand.includes('stop recording')) {
        speak('Stopping voice recording');
        onCommand?.('stop_recording');
        return;
      }

      if (cleanCommand.includes('edit draft')) {
        speak('Opening draft editor');
        onCommand?.('edit_draft');
        return;
      }

      // Help commands
      if (cleanCommand.includes('help') || cleanCommand.includes('what can i say') || cleanCommand.includes('commands')) {
        const helpText = 'You can say: create medical eBook, set title to your title, save draft, show drafts, next step, submit eBook, or ask for help anytime';
        speak(helpText);
        toast({
          title: "Voice Commands Help",
          description: helpText,
        });
        return;
      }

      // Unrecognized command
      speak('Command not recognized. Try saying help to see available commands, or say create medical eBook, go to dashboard, or save draft');
      toast({
        title: "Command Not Recognized",
        description: `"${cleanCommand}" is not a recognized command. Say "help" for available commands.`,
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error processing voice command:', error);
      speak('Sorry, there was an error processing your command. Please try again.');
      toast({
        title: "Command Processing Error",
        description: "Failed to process voice command. Please try again.",
        variant: "destructive",
      });
    }
  }, [onCommand, navigate, toast]);

  const speak = useCallback((text: string) => {
    if (synthesis) {
      // Cancel any ongoing speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-IN';
      
      // Add error handling for speech synthesis
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

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
        `}
        aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
      >
        {isListening ? (
          <MicOff size={28} className="text-white" />
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
      </Button>
      
      {/* Hover tooltip and status */}
      {(isHovered || isListening) && (
        <div className="absolute bottom-24 right-0 bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs transition-all duration-200">
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
              Try: "Create medical eBook", "Save draft", "Go to dashboard"
            </div>
          )}
          
          {lastCommand && (
            <div className="mt-2 text-xs text-green-600">
              Last: "{lastCommand}"
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
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
