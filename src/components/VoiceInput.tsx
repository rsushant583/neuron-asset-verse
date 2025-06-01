/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const VoiceInput = ({ value, onChange, placeholder = "Start speaking or type your story...", label = "Your Story" }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognitionClass();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onChange(value + ' ' + finalTranscript);
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "Could not record audio. Please check your microphone.",
          variant: "destructive",
        });
      };

      speechRecognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(speechRecognition);
    }
  }, [value, onChange, toast]);

  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: "Voice Recording Not Supported",
        description: "Your browser doesn't support voice recording.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Your voice input has been added to the text.",
      });
    } else {
      recognition.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak clearly and I'll add your words to the text.",
      });
    }
  };

  const playbackText = () => {
    if (!value) {
      toast({
        title: "No Text to Read",
        description: "Please add some text first.",
        variant: "destructive",
      });
      return;
    }

    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(value);
        utterance.rate = 0.8; // Slower for older users
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white text-heading flex items-center justify-between">
          {label}
          <div className="flex space-x-2">
            <Button
              onClick={playbackText}
              className={`btn-accessible ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              aria-label={isPlaying ? "Stop playback" : "Play text aloud"}
            >
              {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
            </Button>
            <Button
              onClick={toggleRecording}
              className={`btn-accessible ${isRecording ? 'bg-red-500 hover:bg-red-600 voice-active' : 'bg-blue-600 hover:bg-blue-700'}`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 text-body">Recording in progress... Speak clearly!</span>
              </div>
            </div>
          )}
          
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-accessible min-h-[300px] text-body resize-none"
            placeholder={placeholder}
            aria-label={label}
          />
          
          <div className="text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-700 mb-2">Voice Tips for Better Results:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Pause between sentences</li>
              <li>• Use the play button to hear your text read aloud</li>
              <li>• You can edit the text manually anytime</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceInput;
