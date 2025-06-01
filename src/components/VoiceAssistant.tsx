
/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  isEnabled?: boolean;
}

const VoiceAssistant = ({ onCommand, isEnabled = true }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognitionClass();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        if (event.results[last].isFinal && command) {
          handleVoiceCommand(command);
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check your microphone.",
          variant: "destructive",
        });
      };

      setRecognition(speechRecognition);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    
    // Navigation commands
    if (command.includes('go to dashboard') || command.includes('open dashboard')) {
      speak('Navigating to dashboard');
      navigate('/dashboard');
    } else if (command.includes('go to marketplace') || command.includes('open marketplace')) {
      speak('Opening marketplace');
      navigate('/market');
    } else if (command.includes('start ebook creation') || command.includes('create ebook')) {
      speak('Starting eBook creation wizard');
      navigate('/create');
    } else if (command.includes('create medical ebook')) {
      speak('Creating medical eBook with pre-filled category');
      navigate('/create?category=medical');
      onCommand?.('set_category_medical');
    } 
    
    // Action commands
    else if (command.includes('start recording') || command.includes('record story')) {
      speak('Starting voice recording');
      onCommand?.('start_recording');
    } else if (command.includes('stop recording')) {
      speak('Stopping voice recording');
      onCommand?.('stop_recording');
    } else if (command.includes('edit draft')) {
      speak('Opening draft editor');
      onCommand?.('edit_draft');
    } else if (command.includes('save draft')) {
      speak('Saving current draft');
      onCommand?.('save_draft');
    } else if (command.includes('next step')) {
      speak('Moving to next step');
      onCommand?.('next_step');
    } else if (command.includes('previous step')) {
      speak('Moving to previous step');
      onCommand?.('previous_step');
    } else if (command.includes('publish now')) {
      speak('Proceeding to publish your product');
      onCommand?.('publish_now');
    }
    
    // Version control commands
    else if (command.includes('show drafts') || command.includes('show draft versions')) {
      speak('Displaying your draft versions');
      onCommand?.('show_drafts');
    } else if (command.includes('open draft') && command.includes('version')) {
      const versionMatch = command.match(/version (\d+)/);
      if (versionMatch) {
        const version = versionMatch[1];
        speak(`Opening draft version ${version}`);
        onCommand?.(`open_draft_${version}`);
      }
    }
    
    // Title and content commands
    else if (command.includes('set title to')) {
      const titleMatch = command.match(/set title to (.+)/);
      if (titleMatch) {
        const title = titleMatch[1];
        speak(`Setting title to ${title}`);
        onCommand?.(`set_title_${title}`);
      }
    } else if (command.includes('set category to')) {
      const categoryMatch = command.match(/set category to (\w+)/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        speak(`Setting category to ${category}`);
        onCommand?.(`set_category_${category}`);
      }
    } else if (command.includes('suggest title')) {
      speak('Generating unique title suggestions for your eBook');
      onCommand?.('suggest_title');
    }
    
    // Help commands
    else if (command.includes('help') || command.includes('what can i say')) {
      speak('You can say commands like: go to dashboard, create medical eBook, start recording, edit draft, save draft, show drafts, set title to, or publish now');
    } else {
      speak('Command not recognized. Try saying help to see available commands, or say go to dashboard, create eBook, or start recording');
    }
  };

  const speak = (text: string) => {
    if (synthesis) {
      // Cancel any ongoing speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slower for older users
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
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
      recognition.start();
      setIsListening(true);
      speak('Voice assistant listening');
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleListening}
        className={`
          btn-accessible rounded-full w-20 h-20 shadow-lg transition-all duration-300
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 voice-active animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
      >
        {isListening ? (
          <MicOff size={32} className="text-white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </Button>
      
      <div className="absolute bottom-24 right-0 bg-white p-4 rounded-lg shadow-lg text-sm max-w-xs">
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-blue-600" />
          <span className="text-gray-700 text-body">
            {isListening ? 'Listening for commands...' : 'Click to speak'}
          </span>
        </div>
        {isListening && (
          <div className="mt-2 text-xs text-gray-500">
            Try: "Go to dashboard", "Create medical eBook", "Show drafts"
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
