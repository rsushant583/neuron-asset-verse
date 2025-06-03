
/// <reference path="../types/speech.d.ts" />
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Wifi, WifiOff, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdvancedVoiceCommands } from '@/hooks/useAdvancedVoiceCommands';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedVoiceAssistantProps {
  onCommand?: (command: string, context: any) => void;
  isEnabled?: boolean;
}

const AdvancedVoiceAssistant = ({ onCommand, isEnabled = true }: AdvancedVoiceAssistantProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  
  const {
    isListening,
    isSupported,
    isConnected,
    context,
    confidence,
    startListening,
    stopListening,
    speak
  } = useAdvancedVoiceCommands(onCommand, {
    continuous: true,
    interimResults: true,
    language: 'en-US',
    confidenceThreshold: 0.6,
    contextMemory: true
  });

  // Smart command suggestions based on current page
  const getContextualSuggestions = () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/create')) {
      return [
        "Set title to My Medical Journey",
        "Choose medical category",
        "Save draft",
        "Next step",
        "Suggest a unique title"
      ];
    } else if (currentPath.includes('/dashboard')) {
      return [
        "Create medical eBook",
        "Show my drafts",
        "Go to marketplace",
        "Open eBook creation",
        "Create business eBook"
      ];
    } else if (currentPath.includes('/auth')) {
      return [
        "Sign in with email",
        "Create new account",
        "Go to dashboard"
      ];
    } else {
      return [
        "Go to dashboard",
        "Create medical eBook",
        "Sign in with email",
        "Go to marketplace",
        "Help me get started"
      ];
    }
  };

  const suggestions = getContextualSuggestions();

  // Cycle through suggestions
  useEffect(() => {
    if (showCommandSuggestions) {
      const interval = setInterval(() => {
        setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showCommandSuggestions, suggestions.length]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      speak('Voice assistant stopped');
    } else {
      startListening();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    speak(`Executing: ${suggestion}`);
    // Process the suggestion as if it was a voice command
    onCommand?.(suggestion.toLowerCase(), context);
    setShowCommandSuggestions(false);
  };

  if (!isEnabled || !isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main voice button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        <Button
          onClick={toggleListening}
          onMouseEnter={() => {
            setIsHovered(true);
            setShowCommandSuggestions(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setTimeout(() => setShowCommandSuggestions(false), 2000);
          }}
          className={`
            rounded-full w-20 h-20 shadow-2xl transition-all duration-300 transform
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
              : isConnected 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-500 hover:bg-gray-600'
            }
            ${isHovered ? 'scale-110' : ''}
          `}
          aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
        >
          <div className="relative">
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff size={32} className="text-white" />
              </motion.div>
            ) : (
              <Mic size={32} className="text-white" />
            )}
            
            {/* AI Brain indicator */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <Brain size={16} className="text-yellow-400" />
            </motion.div>
          </div>
        </Button>

        {/* Connection indicator */}
        <div className="absolute -top-2 -left-2">
          {isConnected ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Wifi size={16} className="text-green-400" />
            </motion.div>
          ) : (
            <WifiOff size={16} className="text-red-400" />
          )}
        </div>

        {/* Confidence indicator */}
        {isListening && confidence > 0 && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-full px-2 py-1 text-xs font-bold text-black">
              {Math.round(confidence * 100)}%
            </div>
          </div>
        )}
      </motion.div>

      {/* Status and suggestions panel */}
      <AnimatePresence>
        {(isHovered || isListening || showCommandSuggestions) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl max-w-xs border border-blue-200"
          >
            {/* Status */}
            <div className="flex items-center space-x-2 mb-3">
              <Zap size={16} className="text-blue-600" />
              <span className="text-gray-800 text-sm font-semibold">
                {isListening 
                  ? 'Listening actively...' 
                  : isConnected 
                    ? 'Ready to assist' 
                    : 'Connection lost'
                }
              </span>
            </div>

            {/* Context info */}
            {context.lastCommand && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">Last command:</div>
                <div className="text-xs text-gray-700">"{context.lastCommand}"</div>
              </div>
            )}

            {/* Suggestions */}
            {showCommandSuggestions && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-600 flex items-center">
                  <Volume2 size={12} className="mr-1" />
                  Try saying:
                </div>
                <motion.div
                  key={currentSuggestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="cursor-pointer p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all"
                  onClick={() => handleSuggestionClick(suggestions[currentSuggestion])}
                >
                  <div className="text-sm text-gray-800 font-medium">
                    "{suggestions[currentSuggestion]}"
                  </div>
                </motion.div>
                
                {/* All suggestions */}
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs text-left p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      • {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
              <Button
                size="sm"
                variant="outline"
                onClick={() => speak("What can I help you with today?")}
                className="text-xs"
              >
                Help
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCommand?.('show_drafts', context)}
                className="text-xs"
              >
                Drafts
              </Button>
            </div>

            {/* Connection retry */}
            {!isConnected && (
              <Button
                onClick={startListening}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Retry Connection
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedVoiceAssistant;
