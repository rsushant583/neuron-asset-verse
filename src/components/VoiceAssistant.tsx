
/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  isEnabled?: boolean;
}

const VoiceAssistant = ({ onCommand, isEnabled = true }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const speechRecognition = new SpeechRecognitionClass();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        if (event.results[last].isFinal && command) {
          handleVoiceCommand(command);
        }
      };

      speechRecognition.onerror = (event: any) => {
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
    
    // Basic navigation commands
    if (command.includes('go to dashboard')) {
      speak('Navigating to dashboard');
      window.location.href = '/dashboard';
    } else if (command.includes('start recording')) {
      speak('Starting voice recording');
      onCommand?.('start_recording');
    } else if (command.includes('stop recording')) {
      speak('Stopping voice recording');
      onCommand?.('stop_recording');
    } else if (command.includes('edit draft')) {
      speak('Opening draft editor');
      onCommand?.('edit_draft');
    } else if (command.includes('save draft')) {
      speak('Saving draft');
      onCommand?.('save_draft');
    } else if (command.includes('next step')) {
      speak('Moving to next step');
      onCommand?.('next_step');
    } else if (command.includes('previous step')) {
      speak('Moving to previous step');
      onCommand?.('previous_step');
    } else {
      speak('Command not recognized. Try saying "go to dashboard" or "start recording"');
    }
  };

  const speak = (text: string) => {
    if (synthesis) {
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
          btn-accessible rounded-full w-16 h-16 shadow-lg
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 voice-active' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
      >
        {isListening ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </Button>
      
      <div className="absolute bottom-20 right-0 bg-white p-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-blue-600" />
          <span className="text-gray-700">
            {isListening ? 'Listening...' : 'Click to speak'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
