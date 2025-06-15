import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkTitle, suggestTitles, saveDraft } from '@/lib/api';

interface VoiceCommandProcessorProps {
  command: string;
  context: any;
  onResult?: (result: any) => void;
}

const VoiceCommandProcessor = ({ command, context, onResult }: VoiceCommandProcessorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (command) {
      processCommand(command, context);
    }
  }, [command, context]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = async (cmd: string, ctx: any) => {
    const command = cmd.toLowerCase().trim();
    
    try {
      // Authentication commands
      if (command.includes('sign in') || command.includes('login')) {
        if (command.includes('email')) {
          speak('Redirecting to email sign in');
          navigate('/auth');
          onResult?.({ action: 'navigate', path: '/auth' });
        } else {
          speak('Please specify how you want to sign in. Try saying "sign in with email"');
        }
        return;
      }

      if (command.includes('sign out') || command.includes('logout')) {
        try {
          await supabase.auth.signOut();
          speak('Successfully signed out');
          navigate('/');
          toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
          });
          onResult?.({ action: 'signout', success: true });
        } catch (error) {
          speak('Error signing out. Please try again.');
          toast({
            title: "Sign Out Error",
            description: "Failed to sign out. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Navigation commands
      if (command.includes('dashboard')) {
        speak('Opening dashboard');
        navigate('/dashboard');
        onResult?.({ action: 'navigate', path: '/dashboard' });
        return;
      }

      if (command.includes('marketplace') || command.includes('market')) {
        speak('Opening marketplace');
        navigate('/market');
        onResult?.({ action: 'navigate', path: '/market' });
        return;
      }

      if (command.includes('create') && (command.includes('ebook') || command.includes('book'))) {
        let category = '';
        if (command.includes('medical')) category = 'medical';
        else if (command.includes('business')) category = 'business';
        else if (command.includes('fiction')) category = 'fiction';
        
        speak(`Starting ${category || 'eBook'} creation`);
        navigate(category ? `/create?category=${category}` : '/create');
        onResult?.({ action: 'create', category });
        return;
      }

      // Title setting commands
      if (command.includes('set title to') || command.includes('title')) {
        const titleMatch = command.match(/(?:set title to|title)\s+(.+)/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          try {
            const titleCheck = await checkTitle(title);
            if (titleCheck.isUnique) {
              speak(`Title set to: ${title}`);
              onResult?.({ action: 'set_title', title });
            } else {
              speak(`Title already exists. Suggesting: ${titleCheck.suggested}`);
              onResult?.({ action: 'set_title', title: titleCheck.suggested });
            }
          } catch (error) {
            speak(`Title set to: ${title}`);
            onResult?.({ action: 'set_title', title });
          }
        }
        return;
      }

      // Category setting commands
      if (command.includes('set category') || command.includes('choose category')) {
        const categoryMatch = command.match(/(?:set category|choose category)\s+(\w+)/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          speak(`Category set to ${category}`);
          onResult?.({ action: 'set_category', category });
        }
        return;
      }

      // AI suggestion commands
      if (command.includes('suggest title') || command.includes('give me a title')) {
        const topicMatch = command.match(/about\s+(.+?)(?:\s|$)/);
        const topic = topicMatch ? topicMatch[1] : 'general';
        
        try {
          speak('Generating unique title suggestion');
          const suggestions = await suggestTitles(topic);
          if (suggestions && suggestions.length > 0) {
            speak(`I suggest: ${suggestions[0]}`);
            onResult?.({ action: 'suggest_title', title: suggestions[0] });
          } else {
            speak('Unable to generate title suggestion at the moment');
          }
        } catch (error) {
          speak('Sorry, I could not generate a title suggestion right now');
        }
        return;
      }

      // Draft management commands
      if (command.includes('save draft')) {
        speak('Saving current draft');
        onResult?.({ action: 'save_draft' });
        return;
      }

      if (command.includes('show drafts') || command.includes('my drafts')) {
        speak('Displaying your saved drafts');
        onResult?.({ action: 'show_drafts' });
        return;
      }

      if (command.includes('open draft')) {
        const versionMatch = command.match(/version\s+(\d+)/);
        if (versionMatch) {
          const version = parseInt(versionMatch[1]);
          speak(`Opening draft version ${version}`);
          onResult?.({ action: 'open_draft', version });
        } else {
          speak('Please specify which draft version to open, like "open draft version 2"');
        }
        return;
      }

      // Wizard control commands
      if (command.includes('next step') || command === 'next') {
        speak('Moving to next step');
        onResult?.({ action: 'next_step' });
        return;
      }

      if (command.includes('previous step') || command.includes('go back')) {
        speak('Going back to previous step');
        onResult?.({ action: 'previous_step' });
        return;
      }

      if (command.includes('submit') || command.includes('publish')) {
        speak('Submitting your eBook for publishing');
        onResult?.({ action: 'publish_now' });
        return;
      }

      // Help commands
      if (command.includes('help') || command.includes('what can you do')) {
        const helpText = `I'm your MetaMind assistant. I can help you:
        - Sign in or out: "Sign in with email", "Log out"
        - Navigate: "Go to dashboard", "Open marketplace", "Create eBook"
        - Create content: "Create medical eBook", "Set title to My Medical Journey"
        - Get suggestions: "Suggest a title about medical experience"
        - Manage drafts: "Save draft", "Show drafts", "Open draft version 2"
        - Control creation: "Next step", "Previous step", "Submit eBook"
        What would you like to do?`;
        
        speak(helpText);
        toast({
          title: "Voice Assistant Help",
          description: "I can help with sign in, navigation, content creation, drafts, and more!",
        });
        return;
      }

      // Unrecognized command
      speak(`I didn't understand "${command}". Try saying "help" to see what I can do, or say something like "go to dashboard", "create medical eBook", or "save draft"`);
      toast({
        title: "Command Not Recognized",
        description: `"${command}" is not recognized. Say "help" for available commands.`,
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error processing command:', error);
      speak('Sorry, there was an error processing your command. Please try again.');
      toast({
        title: "Command Processing Error",
        description: "Failed to process voice command. Please try again.",
        variant: "destructive",
      });
    }
  };

  return null; // This is a logic-only component
};

export default VoiceCommandProcessor;