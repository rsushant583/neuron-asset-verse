
/// <reference path="../types/speech.d.ts" />
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedVoiceConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  confidenceThreshold?: number;
  contextMemory?: boolean;
}

interface VoiceContext {
  lastCommand: string;
  currentPage: string;
  userIntent: string;
  conversationHistory: string[];
}

export const useAdvancedVoiceCommands = (
  onCommand?: (command: string, context: VoiceContext) => void,
  config: AdvancedVoiceConfig = {}
) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [context, setContext] = useState<VoiceContext>({
    lastCommand: '',
    currentPage: '/',
    userIntent: '',
    conversationHistory: []
  });
  const [confidence, setConfidence] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    confidenceThreshold = 0.7,
    contextMemory = true
  } = config;

  // Advanced command patterns for intelligent processing
  const commandPatterns = {
    // Authentication patterns
    auth: {
      signIn: /(?:sign|log)\s*in|login|authenticate/i,
      signOut: /(?:sign|log)\s*out|logout|exit/i,
      register: /register|sign\s*up|create\s*account/i
    },
    
    // Navigation patterns
    navigation: {
      dashboard: /(?:go\s*to|open|show|navigate\s*to)?\s*(?:dashboard|home|main)/i,
      marketplace: /(?:go\s*to|open|show|navigate\s*to)?\s*(?:marketplace|market|store|shop)/i,
      create: /(?:create|start|begin|open)\s*(?:ebook|book|story|content|creation|wizard)/i,
      profile: /(?:go\s*to|open|show)\s*(?:profile|account|settings)/i
    },
    
    // Content creation patterns
    creation: {
      category: /(?:set|choose|select)\s*(?:category|type)\s*(?:to|as)?\s*(\w+)/i,
      title: /(?:set|change|name)\s*(?:title|name)\s*(?:to|as)?\s*(.+)/i,
      medical: /(?:create|make|start)\s*(?:medical|health|doctor|medicine)\s*(?:ebook|book|story)/i,
      business: /(?:create|make|start)\s*(?:business|corporate|professional)\s*(?:ebook|book|story)/i,
      fiction: /(?:create|make|start)\s*(?:fiction|novel|story|creative)\s*(?:ebook|book)/i
    },
    
    // AI assistance patterns
    ai: {
      suggest: /(?:suggest|recommend|give\s*me)\s*(?:a|an)?\s*(?:title|name|idea)\s*(?:about|for)?\s*(.+)?/i,
      improve: /(?:improve|enhance|better|fix)\s*(?:this|my)?\s*(.+)?/i,
      help: /help|assist|guide|what\s*can\s*you\s*do/i
    },
    
    // Draft management patterns
    drafts: {
      save: /save\s*(?:draft|this|current)/i,
      show: /(?:show|display|list)\s*(?:drafts|versions|saved)/i,
      open: /(?:open|load)\s*(?:draft|version)\s*(\d+)/i,
      delete: /(?:delete|remove)\s*(?:draft|version)\s*(\d+)/i
    },
    
    // Wizard control patterns
    wizard: {
      next: /(?:next|continue|proceed|forward)/i,
      previous: /(?:previous|back|return|go\s*back)/i,
      submit: /(?:submit|publish|complete|finish|done)/i,
      cancel: /(?:cancel|stop|exit|quit)/i
    },
    
    // Voice control patterns
    voice: {
      stop: /(?:stop|pause)\s*(?:listening|recording)/i,
      start: /(?:start|begin)\s*(?:listening|recording)/i,
      repeat: /repeat|say\s*again|what\s*did\s*you\s*say/i
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = continuous;
        recognitionInstance.interimResults = interimResults;
        recognitionInstance.lang = language;
        recognitionInstance.maxAlternatives = 5; // Get multiple alternatives for better accuracy

        recognitionInstance.onstart = () => {
          setIsConnected(true);
          console.log('Advanced voice recognition started');
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          
          // Try multiple alternatives if confidence is low
          let bestCommand = '';
          let bestConfidence = 0;
          
          for (let i = 0; i < result.length; i++) {
            const alternative = result[i];
            if (alternative.confidence > bestConfidence) {
              bestCommand = alternative.transcript;
              bestConfidence = alternative.confidence;
            }
          }
          
          const command = bestCommand.toLowerCase().trim();
          setConfidence(bestConfidence);
          
          if (result.isFinal && command && bestConfidence >= confidenceThreshold) {
            processAdvancedCommand(command);
          } else if (result.isFinal && bestConfidence < confidenceThreshold) {
            speak("I'm not sure what you said. Could you please repeat that?");
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsConnected(false);
          setIsListening(false);
          handleAdvancedError(event.error);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          console.log('Voice recognition ended');
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
        console.warn('Speech recognition not supported');
      }
    }
  }, []);

  // Advanced command processing with context understanding
  const processAdvancedCommand = useCallback((command: string) => {
    console.log('Processing advanced command:', command);
    
    // Update context
    const newContext: VoiceContext = {
      ...context,
      lastCommand: command,
      currentPage: window.location.pathname,
      conversationHistory: contextMemory 
        ? [...context.conversationHistory.slice(-4), command] 
        : [command]
    };
    
    // Remove common prefixes
    const cleanCommand = command
      .replace(/^(?:hey\s+)?(?:metamind|assistant|ai)\s*[,.]?\s*/i, '')
      .replace(/^(?:please\s+|could\s+you\s+|can\s+you\s+)/i, '')
      .trim();

    try {
      // Authentication commands
      if (commandPatterns.auth.signIn.test(cleanCommand)) {
        handleAuthentication('signin');
        newContext.userIntent = 'authentication';
      }
      else if (commandPatterns.auth.signOut.test(cleanCommand)) {
        handleAuthentication('signout');
        newContext.userIntent = 'authentication';
      }
      else if (commandPatterns.auth.register.test(cleanCommand)) {
        handleAuthentication('register');
        newContext.userIntent = 'authentication';
      }
      
      // Navigation commands
      else if (commandPatterns.navigation.dashboard.test(cleanCommand)) {
        handleNavigation('/dashboard');
        newContext.userIntent = 'navigation';
      }
      else if (commandPatterns.navigation.marketplace.test(cleanCommand)) {
        handleNavigation('/market');
        newContext.userIntent = 'navigation';
      }
      else if (commandPatterns.navigation.create.test(cleanCommand)) {
        handleNavigation('/create');
        newContext.userIntent = 'creation';
      }
      else if (commandPatterns.navigation.profile.test(cleanCommand)) {
        handleNavigation('/profile');
        newContext.userIntent = 'navigation';
      }
      
      // Content creation commands
      else if (commandPatterns.creation.medical.test(cleanCommand)) {
        handleContentCreation('medical');
        newContext.userIntent = 'creation';
      }
      else if (commandPatterns.creation.business.test(cleanCommand)) {
        handleContentCreation('business');
        newContext.userIntent = 'creation';
      }
      else if (commandPatterns.creation.fiction.test(cleanCommand)) {
        handleContentCreation('fiction');
        newContext.userIntent = 'creation';
      }
      
      // Title and category setting
      else if (commandPatterns.creation.title.test(cleanCommand)) {
        const match = cleanCommand.match(commandPatterns.creation.title);
        if (match && match[1]) {
          handleTitleSetting(match[1].trim());
          newContext.userIntent = 'content_editing';
        }
      }
      else if (commandPatterns.creation.category.test(cleanCommand)) {
        const match = cleanCommand.match(commandPatterns.creation.category);
        if (match && match[1]) {
          handleCategorySetting(match[1].trim());
          newContext.userIntent = 'content_editing';
        }
      }
      
      // AI assistance commands
      else if (commandPatterns.ai.suggest.test(cleanCommand)) {
        const match = cleanCommand.match(commandPatterns.ai.suggest);
        const topic = match && match[1] ? match[1].trim() : 'general';
        handleAISuggestion(topic);
        newContext.userIntent = 'ai_assistance';
      }
      else if (commandPatterns.ai.help.test(cleanCommand)) {
        handleHelp();
        newContext.userIntent = 'help';
      }
      
      // Draft management commands
      else if (commandPatterns.drafts.save.test(cleanCommand)) {
        handleDraftAction('save');
        newContext.userIntent = 'draft_management';
      }
      else if (commandPatterns.drafts.show.test(cleanCommand)) {
        handleDraftAction('show');
        newContext.userIntent = 'draft_management';
      }
      else if (commandPatterns.drafts.open.test(cleanCommand)) {
        const match = cleanCommand.match(commandPatterns.drafts.open);
        const version = match && match[1] ? parseInt(match[1]) : 1;
        handleDraftAction('open', version);
        newContext.userIntent = 'draft_management';
      }
      
      // Wizard control commands
      else if (commandPatterns.wizard.next.test(cleanCommand)) {
        handleWizardControl('next');
        newContext.userIntent = 'wizard_control';
      }
      else if (commandPatterns.wizard.previous.test(cleanCommand)) {
        handleWizardControl('previous');
        newContext.userIntent = 'wizard_control';
      }
      else if (commandPatterns.wizard.submit.test(cleanCommand)) {
        handleWizardControl('submit');
        newContext.userIntent = 'wizard_control';
      }
      
      // Voice control commands
      else if (commandPatterns.voice.stop.test(cleanCommand)) {
        stopListening();
        speak("Voice assistant stopped");
        newContext.userIntent = 'voice_control';
      }
      else if (commandPatterns.voice.repeat.test(cleanCommand)) {
        if (context.lastCommand) {
          speak(`I heard: ${context.lastCommand}`);
        } else {
          speak("I haven't heard any commands yet");
        }
        newContext.userIntent = 'voice_control';
      }
      
      // Unrecognized command with intelligent suggestions
      else {
        handleUnrecognizedCommand(cleanCommand, newContext);
      }
      
      setContext(newContext);
      onCommand?.(cleanCommand, newContext);
      
    } catch (error) {
      console.error('Error processing command:', error);
      speak('Sorry, I encountered an error processing that command. Please try again.');
      toast({
        title: "Command Processing Error",
        description: "There was an error processing your voice command.",
        variant: "destructive",
      });
    }
  }, [context, onCommand]);

  // Authentication handler
  const handleAuthentication = async (action: string) => {
    try {
      if (action === 'signin') {
        speak('Redirecting to sign in page');
        navigate('/auth');
      } else if (action === 'signout') {
        await supabase.auth.signOut();
        speak('Successfully signed out');
        navigate('/');
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      } else if (action === 'register') {
        speak('Redirecting to registration page');
        navigate('/auth?mode=signup');
      }
    } catch (error) {
      speak('Authentication error. Please try again.');
      toast({
        title: "Authentication Error",
        description: "Failed to complete authentication action.",
        variant: "destructive",
      });
    }
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    const pageNames: { [key: string]: string } = {
      '/dashboard': 'dashboard',
      '/market': 'marketplace',
      '/create': 'creation wizard',
      '/profile': 'profile'
    };
    
    speak(`Navigating to ${pageNames[path] || 'requested page'}`);
    navigate(path);
    toast({
      title: "Navigation",
      description: `Opened ${pageNames[path] || 'page'}`,
    });
  };

  // Content creation handler
  const handleContentCreation = (category: string) => {
    speak(`Starting ${category} eBook creation`);
    navigate(`/create?category=${category}`);
    toast({
      title: "eBook Creation",
      description: `Starting ${category} eBook creation wizard`,
    });
  };

  // Title setting handler
  const handleTitleSetting = async (title: string) => {
    try {
      speak(`Setting title to: ${title}`);
      // This would integrate with the creation wizard
      onCommand?.(`set_title_${title}`, context);
      toast({
        title: "Title Set",
        description: `Title changed to: ${title}`,
      });
    } catch (error) {
      speak('Error setting title. Please try again.');
    }
  };

  // Category setting handler
  const handleCategorySetting = (category: string) => {
    speak(`Setting category to ${category}`);
    onCommand?.(`set_category_${category}`, context);
    toast({
      title: "Category Set",
      description: `Category changed to: ${category}`,
    });
  };

  // AI suggestion handler
  const handleAISuggestion = async (topic: string) => {
    try {
      speak(`Generating suggestions for ${topic}. Please wait.`);
      // This would call your AI service
      onCommand?.(`suggest_${topic}`, context);
      toast({
        title: "AI Suggestion",
        description: `Generating suggestions for: ${topic}`,
      });
    } catch (error) {
      speak('Error generating suggestions. Please try again.');
    }
  };

  // Draft action handler
  const handleDraftAction = (action: string, version?: number) => {
    switch (action) {
      case 'save':
        speak('Saving current draft');
        onCommand?.('save_draft', context);
        break;
      case 'show':
        speak('Displaying your drafts');
        onCommand?.('show_drafts', context);
        break;
      case 'open':
        speak(`Opening draft version ${version}`);
        onCommand?.(`open_draft_${version}`, context);
        break;
    }
  };

  // Wizard control handler
  const handleWizardControl = (action: string) => {
    switch (action) {
      case 'next':
        speak('Moving to next step');
        onCommand?.('next_step', context);
        break;
      case 'previous':
        speak('Going back to previous step');
        onCommand?.('previous_step', context);
        break;
      case 'submit':
        speak('Submitting your eBook for publishing');
        onCommand?.('publish_now', context);
        break;
    }
  };

  // Help handler
  const handleHelp = () => {
    const helpMessage = `I'm your personal MetaMind assistant. I can help you:
    - Sign in or out: "Sign in with email" or "Log out"
    - Navigate: "Go to dashboard", "Open marketplace", "Start eBook creation"
    - Create content: "Create medical eBook", "Set title to My Story"
    - Get AI suggestions: "Suggest a title about my medical experience"
    - Manage drafts: "Save draft", "Show drafts", "Open draft 2"
    - Control wizard: "Next step", "Previous step", "Submit eBook"
    What would you like to do?`;
    
    speak(helpMessage);
    toast({
      title: "Voice Assistant Help",
      description: "I can help with authentication, navigation, content creation, AI suggestions, and more!",
    });
  };

  // Unrecognized command handler with intelligent suggestions
  const handleUnrecognizedCommand = (command: string, currentContext: VoiceContext) => {
    // Try to provide intelligent suggestions based on context
    let suggestion = '';
    
    if (currentContext.currentPage.includes('/create')) {
      suggestion = 'Try saying "Next step", "Save draft", or "Set title to your title"';
    } else if (currentContext.currentPage.includes('/dashboard')) {
      suggestion = 'Try saying "Create medical eBook", "Show drafts", or "Go to marketplace"';
    } else {
      suggestion = 'Try saying "Go to dashboard", "Create eBook", or "Sign in"';
    }
    
    speak(`I didn't understand "${command}". ${suggestion}`);
    toast({
      title: "Command Not Recognized",
      description: `"${command}" is not recognized. ${suggestion}`,
      variant: "destructive",
    });
  };

  // Advanced error handling
  const handleAdvancedError = (error: string) => {
    const errorMessages: { [key: string]: string } = {
      'network': 'Network connection lost. Checking connectivity...',
      'not-allowed': 'Microphone access denied. Please enable microphone permissions in your browser settings.',
      'no-speech': 'No speech detected. Please speak clearly and try again.',
      'audio-capture': 'Microphone not found. Please check your audio device.',
      'service-not-allowed': 'Speech service unavailable. Please try again later.',
      'aborted': 'Speech recognition was interrupted.',
      'language-not-supported': 'Language not supported. Switching to English.',
    };

    const message = errorMessages[error] || `Speech recognition error: ${error}. Please try again.`;
    
    speak(message);
    toast({
      title: "Voice Recognition Error",
      description: message,
      variant: "destructive",
    });
  };

  // Text-to-speech with enhanced options
  const speak = useCallback((text: string, options: any = {}) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 0.8;
      utterance.lang = options.lang || language;
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition && !isListening && isSupported) {
      try {
        recognition.start();
        setIsListening(true);
        setIsConnected(true);
        speak('MetaMind voice assistant is now listening');
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsConnected(false);
        toast({
          title: "Cannot Start Voice Recognition",
          description: "Please ensure you have microphone permissions.",
          variant: "destructive",
        });
      }
    }
  }, [recognition, isListening, isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    isSupported,
    isConnected,
    context,
    confidence,
    startListening,
    stopListening,
    speak,
    processAdvancedCommand
  };
};
